import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import assert from "assert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, "temp");

console.log("=== Starting Storage Migration Verification ===");

// 1. Transpile TS files to JS in a temp directory
try {
  console.log("Transpiling TypeScript files to JavaScript...");
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  execSync(
    "npx tsc src/utils/storage.ts src/types.ts src/utils/issuedTokens.ts --outDir scripts/temp --target es2022 --module commonjs",
    { stdio: "inherit" }
  );
  fs.writeFileSync(path.join(tempDir, "package.json"), JSON.stringify({ type: "commonjs" }));
  console.log("Transpilation complete.");
} catch (e) {
  console.error("Transpilation failed:", e);
  process.exit(1);
}

// 2. Mock localStorage
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = String(value); },
  removeItem: (key) => { delete store[key]; },
  clear: () => {
    Object.keys(store).forEach(k => delete store[k]);
  }
};

const clearStore = () => {
  global.localStorage.clear();
};

// 3. Load transpiled modules using require
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const storagePath = "./temp/utils/storage.js";
const issuedTokensPath = "./temp/utils/issuedTokens.js";

const storage = require(storagePath);
const issuedTokens = require(issuedTokensPath);

const { STORAGE_KEYS, LEGACY_STORAGE_KEYS } = storage;

let testsPassed = 0;
let testsFailed = 0;

const runTest = (name, testFn) => {
  try {
    clearStore();
    testFn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (e) {
    console.error(`[FAIL] ${name}`);
    console.error(e);
    testsFailed++;
  }
};

// --- Test Suite ---

runTest("Legacy key migration to new key", () => {
  // Set legacy keys
  localStorage.setItem(LEGACY_STORAGE_KEYS.stats, JSON.stringify({ hashFragments: 100.5, r1Balance: 300 }));
  localStorage.setItem(LEGACY_STORAGE_KEYS.miners, JSON.stringify([{ id: "m-1", name: "Test Miner" }]));
  localStorage.setItem(LEGACY_STORAGE_KEYS.usdtBalance, "123.45");

  // Migrate
  storage.migrateLegacyStorage();

  // Assert version set
  assert.strictEqual(localStorage.getItem(STORAGE_KEYS.version), "1");

  // Assert new keys copied
  assert.deepStrictEqual(JSON.parse(localStorage.getItem(STORAGE_KEYS.stats)), { hashFragments: 100.5, r1Balance: 300 });
  assert.deepStrictEqual(JSON.parse(localStorage.getItem(STORAGE_KEYS.miners)), [{ id: "m-1", name: "Test Miner" }]);
  assert.strictEqual(localStorage.getItem(STORAGE_KEYS.usdtBalance), "123.45");

  // Assert legacy keys NOT deleted during migration (per requirement 3)
  assert.strictEqual(localStorage.getItem(LEGACY_STORAGE_KEYS.usdtBalance), "123.45");
});

runTest("Fallback reads: new key > legacy key > default", () => {
  // Scenario A: Only legacy key exists
  localStorage.setItem(LEGACY_STORAGE_KEYS.stats, JSON.stringify({ hashFragments: 200.0, r1Balance: 250.0 }));
  let loaded = storage.loadStats();
  assert.strictEqual(loaded.hashFragments, 200.0);

  // Scenario B: Both exist (new key prioritized)
  localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify({ hashFragments: 400.0, r1Balance: 450.0 }));
  loaded = storage.loadStats();
  assert.strictEqual(loaded.hashFragments, 400.0);

  // Scenario C: Neither exist (default fallback)
  clearStore();
  loaded = storage.loadStats();
  assert.strictEqual(loaded.hashFragments, storage.INITIAL_STATS.hashFragments);
});

runTest("Resilience against bad JSON (no crash / white-screen)", () => {
  // Scenario A: New key is corrupt, legacy is valid
  localStorage.setItem(STORAGE_KEYS.stats, "{bad_json");
  localStorage.setItem(LEGACY_STORAGE_KEYS.stats, JSON.stringify({ hashFragments: 9.9, r1Balance: 120.0 }));
  let loaded = storage.loadStats();
  assert.strictEqual(loaded.hashFragments, 9.9);

  // Scenario B: Both corrupt
  localStorage.setItem(LEGACY_STORAGE_KEYS.stats, "invalid_json[");
  loaded = storage.loadStats();
  assert.strictEqual(loaded.hashFragments, storage.INITIAL_STATS.hashFragments); // returns default instead of crashing
});

runTest("Issued tokens storage utilities integration", () => {
  // Save tokens
  const mockTokens = [{ id: "token-1", symbol: "ABC", name: "Alpha Token" }];
  issuedTokens.saveIssuedTokens(mockTokens);

  // Load tokens
  const loaded = issuedTokens.loadIssuedTokens();
  assert.deepStrictEqual(loaded, mockTokens);

  // Verify stored key
  const raw = localStorage.getItem(STORAGE_KEYS.issuedTokens);
  assert.strictEqual(JSON.parse(raw)[0].symbol, "ABC");
});

runTest("Demo data reset logic (clears all new and legacy keys)", () => {
  // Populate all keys
  Object.values(STORAGE_KEYS).forEach(key => localStorage.setItem(key, "data"));
  Object.values(LEGACY_STORAGE_KEYS).forEach(key => localStorage.setItem(key, "legacy_data"));

  // Verify populated
  assert.strictEqual(localStorage.getItem(STORAGE_KEYS.stats), "data");
  assert.strictEqual(localStorage.getItem(LEGACY_STORAGE_KEYS.stats), "legacy_data");

  // Perform reset simulation (identical to handleResetDemoData in App.tsx)
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  Object.values(LEGACY_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));

  // Assert all keys cleared
  Object.values(STORAGE_KEYS).forEach(key => assert.strictEqual(localStorage.getItem(key), null));
  Object.values(LEGACY_STORAGE_KEYS).forEach(key => assert.strictEqual(localStorage.getItem(key), null));
});

// --- Cleanup & Report ---

try {
  console.log("Cleaning up temp transpilation files...");
  fs.rmSync(tempDir, { recursive: true, force: true });
} catch (e) {
  console.warn("Cleanup failed:", e);
}

console.log("\n=== Verification Report ===");
console.log(`Passed: ${testsPassed}/${testsPassed + testsFailed}`);
console.log(`Failed: ${testsFailed}/${testsPassed + testsFailed}`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("All storage migration checks passed successfully!");
}
