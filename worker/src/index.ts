import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  generateId,
  generateSessionToken,
  generateInviteCode,
  jsonResponse,
  errorResponse,
  getBearerToken,
  getSessionUser,
  createDefaultAssetAccounts,
  mapAssetAccounts,
  AssetAccountRow,
  getSystemConfig,
  setSystemConfig
} from "./db";
import {
  seedDeviceCatalog,
  getDeviceCatalog,
  getActiveDeviceOrders,
  createDemoDeviceOrder,
  createDeviceRentOrder,
  mapDeviceOrder
} from "./devices";

type Bindings = {
  DB: D1Database;
  ADMIN_TOKEN?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for local and production compatibility
app.use("/api/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// GET /api/health
app.get("/api/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "1ren-backend-d1"
  });
});

// POST /api/session/create
app.post("/api/session/create", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const referrerCode = body.referrerCode || null;
    const tgInitData = body.tgInitData || null;

    // TODO: Implement TG initData validation and signature checking (PR-3D)
    // For now, we bypass TG validation and always create a new anonymous user.
    // TG user deduplication and hash validation is deferred to PR-3D.

    const now = new Date().toISOString();
    let referrerId: string | null = null;

    if (referrerCode) {
      const referrer = await c.env.DB
        .prepare("SELECT id FROM users WHERE invite_code = ? LIMIT 1")
        .bind(referrerCode)
        .first<{ id: string }>();
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    const userId = generateId("usr");
    const inviteCode = generateInviteCode();

    // Create user in DB
    await c.env.DB
      .prepare(
        "INSERT INTO users (id, tg_id, invite_code, referrer_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .bind(userId, null, inviteCode, referrerId, now, now)
      .run();

    // Create session in DB
    const sessionId = generateId("ses");
    const sessionToken = generateSessionToken();
    // Expires in 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await c.env.DB
      .prepare(
        "INSERT INTO sessions (id, user_id, session_token, expires_at, created_at, revoked_at) VALUES (?, ?, ?, ?, ?, NULL)"
      )
      .bind(sessionId, userId, sessionToken, expiresAt, now)
      .run();

    // Create default asset accounts
    await createDefaultAssetAccounts(c.env.DB, userId, now);

    // Write system event
    const eventId = generateId("evt");
    const payload = JSON.stringify({ referrerCode, tgInitData });
    await c.env.DB
      .prepare(
        "INSERT INTO system_events (id, user_id, event_type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(eventId, userId, "session_create", payload, now)
      .run();

    return jsonResponse({
      sessionToken,
      user: {
        id: userId,
        tgId: null,
        inviteCode,
        referrerId,
        createdAt: now,
      },
    });
  } catch (e: any) {
    console.error("Session creation error:", e);
    return errorResponse("SERVER_ERROR", "Failed to create session: " + e.message, 500);
  }
});

// GET /api/me
app.get("/api/me", async (c) => {
  try {
    const token = getBearerToken(c.req.raw.headers);
    if (!token) {
      return errorResponse("UNAUTHORIZED", "Missing or invalid Authorization header", 401);
    }

    const sessionData = await getSessionUser(c.env.DB, token);
    if (!sessionData) {
      return errorResponse("UNAUTHORIZED", "Invalid, expired, or revoked session token", 401);
    }

    const { user } = sessionData;
    return jsonResponse({
      id: user.id,
      tgId: user.tg_id,
      inviteCode: user.invite_code,
      referrerId: user.referrer_id,
      createdAt: user.created_at,
    });
  } catch (e: any) {
    console.error("Fetch me error:", e);
    return errorResponse("SERVER_ERROR", "Failed to fetch user profile", 500);
  }
});

// GET /api/assets
app.get("/api/assets", async (c) => {
  try {
    const token = getBearerToken(c.req.raw.headers);
    if (!token) {
      return errorResponse("UNAUTHORIZED", "Missing or invalid Authorization header", 401);
    }

    const sessionData = await getSessionUser(c.env.DB, token);
    if (!sessionData) {
      return errorResponse("UNAUTHORIZED", "Invalid, expired, or revoked session token", 401);
    }

    const { user } = sessionData;

    const { results } = await c.env.DB
      .prepare("SELECT * FROM asset_accounts WHERE user_id = ?")
      .bind(user.id)
      .all<AssetAccountRow>();

    const mapped = mapAssetAccounts(results || []);

    return jsonResponse({
      ...mapped,
      baseHashpower: 50,
      teamHashpower: 0,
      level: "ZERO",
    });
  } catch (e: any) {
    console.error("Fetch assets error:", e);
    return errorResponse("SERVER_ERROR", "Failed to fetch user assets", 500);
  }
});

// GET /api/devices/catalog
app.get("/api/devices/catalog", async (c) => {
  try {
    await seedDeviceCatalog(c.env.DB);
    const catalog = await getDeviceCatalog(c.env.DB);
    const globalYieldMultiplierStr = await getSystemConfig(c.env.DB, "GLOBAL_YIELD_MULTIPLIER", "1.0");
    const globalYieldMultiplier = parseFloat(globalYieldMultiplierStr) || 1.0;

    return jsonResponse({
      globalYieldMultiplier,
      devices: catalog.map(d => {
        const dailyYield = d.daily_ai_token_yield ?? 0;
        const yieldMult = d.yield_multiplier ?? 1.0;
        const effectiveDailyAiTokenYield = dailyYield * yieldMult * globalYieldMultiplier;

        return {
          id: d.id,
          code: d.code,
          name: d.name,
          deviceType: d.device_type,
          baseHashpower: d.base_hashpower,
          rentUsdt: d.rent_usdt,
          rentR1: d.rent_r1,
          durationSeconds: d.duration_seconds,
          durationDays: d.duration_days,
          isDemo: d.is_demo === 1,
          displayTier: d.display_tier,
          displayOrder: d.display_order,
          refHardwareName: d.ref_hardware_name,
          refSpecDescription: d.ref_spec_description,
          marketPriceRange: d.market_price_range,
          suitableScenarios: d.suitable_scenarios,
          apiScenarios: d.api_scenarios,
          dailyAiTokenYield: dailyYield,
          yieldMultiplier: yieldMult,
          effectiveDailyAiTokenYield,
          purchaseLimit: d.purchase_limit,
          stockCount: d.stock_count,
          isFeatured: d.is_featured,
          disclaimerText: d.disclaimer_text,
        };
      }),
    });
  } catch (e: any) {
    console.error("Fetch catalog error:", e);
    return errorResponse("SERVER_ERROR", "Failed to fetch device catalog: " + e.message, 500);
  }
});

// POST /api/devices/demo-activate
app.post("/api/devices/demo-activate", async (c) => {
  try {
    const token = getBearerToken(c.req.raw.headers);
    if (!token) {
      return errorResponse("UNAUTHORIZED", "Missing or invalid Authorization header", 401);
    }

    const sessionData = await getSessionUser(c.env.DB, token);
    if (!sessionData) {
      return errorResponse("UNAUTHORIZED", "Invalid, expired, or revoked session token", 401);
    }

    const { user } = sessionData;
    const now = new Date().toISOString();

    const order = await createDemoDeviceOrder(c.env.DB, user.id, now);

    // Write system event
    const eventId = generateId("evt");
    const payload = JSON.stringify({ orderId: order.id });
    await c.env.DB
      .prepare(
        "INSERT INTO system_events (id, user_id, event_type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(eventId, user.id, "demo_device_activated", payload, now)
      .run();

    return jsonResponse({
      order: mapDeviceOrder(order),
    });
  } catch (e: any) {
    console.error("Demo activation error:", e);
    return errorResponse("SERVER_ERROR", "Failed to activate demo device: " + e.message, 500);
  }
});

// POST /api/devices/rent
app.post("/api/devices/rent", async (c) => {
  try {
    const token = getBearerToken(c.req.raw.headers);
    if (!token) {
      return errorResponse("UNAUTHORIZED", "Missing or invalid Authorization header", 401);
    }

    const sessionData = await getSessionUser(c.env.DB, token);
    if (!sessionData) {
      return errorResponse("UNAUTHORIZED", "Invalid, expired, or revoked session token", 401);
    }

    const { user } = sessionData;
    const body = await c.req.json().catch(() => ({}));
    const deviceId = body.deviceId;

    if (!deviceId) {
      return errorResponse("BAD_REQUEST", "Missing deviceId in request body", 400);
    }

    const now = new Date().toISOString();
    const order = await createDeviceRentOrder(c.env.DB, user.id, deviceId, now);

    if (!order) {
      return errorResponse("NOT_FOUND", "Device template not found", 404);
    }

    // Write system event
    const eventId = generateId("evt");
    const payload = JSON.stringify({ orderId: order.id, deviceId, simulated: true });
    await c.env.DB
      .prepare(
        "INSERT INTO system_events (id, user_id, event_type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(eventId, user.id, "device_rent_created", payload, now)
      .run();

    return jsonResponse({
      order: mapDeviceOrder(order),
    });
  } catch (e: any) {
    console.error("Device rent error:", e);
    return errorResponse("SERVER_ERROR", "Failed to rent device: " + e.message, 500);
  }
});

// GET /api/devices/active
app.get("/api/devices/active", async (c) => {
  try {
    const token = getBearerToken(c.req.raw.headers);
    if (!token) {
      return errorResponse("UNAUTHORIZED", "Missing or invalid Authorization header", 401);
    }

    const sessionData = await getSessionUser(c.env.DB, token);
    if (!sessionData) {
      return errorResponse("UNAUTHORIZED", "Invalid, expired, or revoked session token", 401);
    }

    const { user } = sessionData;
    const activeOrders = await getActiveDeviceOrders(c.env.DB, user.id);

    return jsonResponse({
      orders: activeOrders.map(mapDeviceOrder),
    });
  } catch (e: any) {
    console.error("Fetch active devices error:", e);
    return errorResponse("SERVER_ERROR", "Failed to fetch active devices: " + e.message, 500);
  }
});

// GET /api/mining/records
app.get("/api/mining/records", async (c) => {
  try {
    const token = getBearerToken(c.req.raw.headers);
    if (!token) {
      return errorResponse("UNAUTHORIZED", "Missing or invalid Authorization header", 401);
    }

    const sessionData = await getSessionUser(c.env.DB, token);
    if (!sessionData) {
      return errorResponse("UNAUTHORIZED", "Invalid, expired, or revoked session token", 401);
    }

    const { user } = sessionData;

    const { results } = await c.env.DB
      .prepare("SELECT * FROM mining_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 50")
      .bind(user.id)
      .all();

    return jsonResponse({
      records: results || [],
    });
  } catch (e: any) {
    console.error("Fetch mining records error:", e);
    return errorResponse("SERVER_ERROR", "Failed to fetch mining records: " + e.message, 500);
  }
});

// --- ADMIN API ENDPOINTS (PR-4D) ---

function verifyAdminAuth(c: any): Response | null {
  const adminToken = c.env.ADMIN_TOKEN;
  if (!adminToken) {
    return errorResponse("SERVER_ERROR", "Admin environment not configured (fail closed)", 500);
  }
  const token = getBearerToken(c.req.raw.headers);
  if (!token || token !== adminToken) {
    return errorResponse("UNAUTHORIZED", "Invalid or missing Admin Token", 401);
  }
  return null;
}

// Map database snake_case row to frontend camelCase object
function mapDbDeviceToAdminModel(d: any) {
  return {
    id: d.id,
    code: d.code,
    name: d.name,
    deviceType: d.device_type,
    baseHashpower: d.base_hashpower,
    rentUsdt: d.rent_usdt,
    rentR1: d.rent_r1,
    durationSeconds: d.duration_seconds,
    durationDays: d.duration_days,
    isDemo: d.is_demo === 1,
    isActive: d.is_active === 1,
    displayTier: d.display_tier,
    displayOrder: d.display_order,
    refHardwareName: d.ref_hardware_name,
    refSpecDescription: d.ref_spec_description,
    marketPriceRange: d.market_price_range,
    suitableScenarios: d.suitable_scenarios,
    apiScenarios: d.api_scenarios,
    dailyAiTokenYield: d.daily_ai_token_yield,
    yieldMultiplier: d.yield_multiplier,
    purchaseLimit: d.purchase_limit,
    stockCount: d.stock_count,
    isFeatured: d.is_featured === 1,
    disclaimerText: d.disclaimer_text,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  };
}

// GET /api/admin/devices
app.get("/api/admin/devices", async (c) => {
  const authErr = verifyAdminAuth(c);
  if (authErr) return authErr;

  try {
    const { results } = await c.env.DB
      .prepare("SELECT * FROM devices ORDER BY display_order ASC, created_at DESC")
      .all();

    return jsonResponse({
      devices: (results || []).map(mapDbDeviceToAdminModel)
    });
  } catch (e: any) {
    console.error("Admin fetch devices error:", e);
    return errorResponse("SERVER_ERROR", "Failed to fetch admin devices: " + e.message, 500);
  }
});

// POST /api/admin/devices
app.post("/api/admin/devices", async (c) => {
  const authErr = verifyAdminAuth(c);
  if (authErr) return authErr;

  try {
    const body = await c.req.json().catch(() => ({}));

    // Required fields check
    const required = ['id', 'code', 'name', 'rentUsdt', 'baseHashpower', 'durationDays', 'dailyAiTokenYield'];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return errorResponse("BAD_REQUEST", `Missing required field: ${field}`, 400);
      }
    }

    // Boundary check
    if (body.rentUsdt < 0) return errorResponse("BAD_REQUEST", "rentUsdt must be >= 0", 400);
    if (body.baseHashpower < 0) return errorResponse("BAD_REQUEST", "baseHashpower must be >= 0", 400);
    if (body.durationDays < 0) return errorResponse("BAD_REQUEST", "durationDays must be >= 0", 400);
    if (body.dailyAiTokenYield < 0) return errorResponse("BAD_REQUEST", "dailyAiTokenYield must be >= 0", 400);

    if (body.yieldMultiplier !== undefined && body.yieldMultiplier !== null) {
      if (body.yieldMultiplier < 0 || body.yieldMultiplier > 100) {
        return errorResponse("BAD_REQUEST", "yieldMultiplier must be between 0 and 100", 400);
      }
    }
    if (body.purchaseLimit !== undefined && body.purchaseLimit !== null && body.purchaseLimit < 0) {
      return errorResponse("BAD_REQUEST", "purchaseLimit must be >= 0", 400);
    }
    if (body.stockCount !== undefined && body.stockCount !== null && body.stockCount < 0) {
      return errorResponse("BAD_REQUEST", "stockCount must be >= 0", 400);
    }
    if (body.displayOrder !== undefined && body.displayOrder !== null && body.displayOrder < 0) {
      return errorResponse("BAD_REQUEST", "displayOrder must be >= 0", 400);
    }

    // Check conflict
    const existing = await c.env.DB
      .prepare("SELECT id FROM devices WHERE id = ? LIMIT 1")
      .bind(body.id)
      .first();
    if (existing) {
      return errorResponse("CONFLICT", "Device template with this ID already exists", 409);
    }

    const now = new Date().toISOString();
    const id = body.id;
    const code = body.code;
    const name = body.name;
    const device_type = body.deviceType || "infer";
    const base_hashpower = body.baseHashpower;
    const rent_usdt = body.rentUsdt;
    const rent_r1 = body.rentR1 || 0;
    const duration_seconds = body.durationSeconds || null;
    const duration_days = body.durationDays;
    const is_demo = body.isDemo ? 1 : 0;
    const is_active = body.isActive !== false ? 1 : 0;
    const display_tier = body.displayTier || null;
    const display_order = body.displayOrder || 0;
    const ref_hardware_name = body.refHardwareName || null;
    const ref_spec_description = body.refSpecDescription || null;
    const market_price_range = body.marketPriceRange || null;
    const suitable_scenarios = body.suitableScenarios || null;
    const api_scenarios = body.apiScenarios || null;
    const daily_ai_token_yield = body.dailyAiTokenYield;
    const yield_multiplier = body.yieldMultiplier !== undefined ? body.yieldMultiplier : 1.0;
    const purchase_limit = body.purchaseLimit !== undefined ? body.purchaseLimit : 5;
    const stock_count = body.stockCount !== undefined ? body.stockCount : 999;
    const is_featured = body.isFeatured ? 1 : 0;
    const disclaimer_text = body.disclaimerText || null;

    await c.env.DB
      .prepare(
        `INSERT INTO devices (
          id, code, name, device_type, base_hashpower, rent_usdt, rent_r1,
          duration_seconds, duration_days, is_demo, is_active,
          display_tier, display_order, ref_hardware_name, ref_spec_description,
          market_price_range, suitable_scenarios, api_scenarios, daily_ai_token_yield,
          yield_multiplier, purchase_limit, stock_count, is_featured, disclaimer_text,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id, code, name, device_type, base_hashpower, rent_usdt, rent_r1,
        duration_seconds, duration_days, is_demo, is_active,
        display_tier, display_order, ref_hardware_name, ref_spec_description,
        market_price_range, suitable_scenarios, api_scenarios, daily_ai_token_yield,
        yield_multiplier, purchase_limit, stock_count, is_featured, disclaimer_text,
        now, now
      )
      .run();

    // Log event
    const eventId = generateId("evt");
    const eventPayload = JSON.stringify({
      action: "create",
      target_type: "device",
      target_id: id,
      before_json: null,
      after_json: body
    });
    await c.env.DB
      .prepare("INSERT INTO system_events (id, user_id, event_type, payload_json, created_at) VALUES (?, NULL, 'admin_device_create', ?, ?)")
      .bind(eventId, eventPayload, now)
      .run();

    return jsonResponse({ success: true, id });
  } catch (e: any) {
    console.error("Admin create device error:", e);
    return errorResponse("SERVER_ERROR", "Failed to create device: " + e.message, 500);
  }
});

// PUT /api/admin/devices/:id
app.put("/api/admin/devices/:id", async (c) => {
  const authErr = verifyAdminAuth(c);
  if (authErr) return authErr;

  const id = c.req.param("id");

  try {
    const existing = await c.env.DB
      .prepare("SELECT * FROM devices WHERE id = ? LIMIT 1")
      .bind(id)
      .first();
    if (!existing) {
      return errorResponse("NOT_FOUND", "Device template not found", 404);
    }

    const body = await c.req.json().catch(() => ({}));

    // Numerical checks
    if (body.rentUsdt !== undefined && body.rentUsdt < 0) return errorResponse("BAD_REQUEST", "rentUsdt must be >= 0", 400);
    if (body.baseHashpower !== undefined && body.baseHashpower < 0) return errorResponse("BAD_REQUEST", "baseHashpower must be >= 0", 400);
    if (body.durationDays !== undefined && body.durationDays < 0) return errorResponse("BAD_REQUEST", "durationDays must be >= 0", 400);
    if (body.dailyAiTokenYield !== undefined && body.dailyAiTokenYield < 0) return errorResponse("BAD_REQUEST", "dailyAiTokenYield must be >= 0", 400);

    if (body.yieldMultiplier !== undefined && body.yieldMultiplier !== null) {
      if (body.yieldMultiplier < 0 || body.yieldMultiplier > 100) {
        return errorResponse("BAD_REQUEST", "yieldMultiplier must be between 0 and 100", 400);
      }
    }
    if (body.purchaseLimit !== undefined && body.purchaseLimit !== null && body.purchaseLimit < 0) {
      return errorResponse("BAD_REQUEST", "purchaseLimit must be >= 0", 400);
    }
    if (body.stockCount !== undefined && body.stockCount !== null && body.stockCount < 0) {
      return errorResponse("BAD_REQUEST", "stockCount must be >= 0", 400);
    }
    if (body.displayOrder !== undefined && body.displayOrder !== null && body.displayOrder < 0) {
      return errorResponse("BAD_REQUEST", "displayOrder must be >= 0", 400);
    }

    const now = new Date().toISOString();
    
    // Map whitelist updates, preserving old fields if omitted
    const code = body.code !== undefined ? body.code : existing.code;
    const name = body.name !== undefined ? body.name : existing.name;
    const device_type = body.deviceType !== undefined ? body.deviceType : existing.device_type;
    const base_hashpower = body.baseHashpower !== undefined ? body.baseHashpower : existing.base_hashpower;
    const rent_usdt = body.rentUsdt !== undefined ? body.rentUsdt : existing.rent_usdt;
    const rent_r1 = body.rentR1 !== undefined ? body.rentR1 : existing.rent_r1;
    const duration_seconds = body.durationSeconds !== undefined ? body.durationSeconds : existing.duration_seconds;
    const duration_days = body.durationDays !== undefined ? body.durationDays : existing.duration_days;
    const is_demo = body.isDemo !== undefined ? (body.isDemo ? 1 : 0) : existing.is_demo;
    const is_active = body.isActive !== undefined ? (body.isActive ? 1 : 0) : existing.is_active;
    const display_tier = body.displayTier !== undefined ? body.displayTier : existing.display_tier;
    const display_order = body.displayOrder !== undefined ? body.displayOrder : existing.display_order;
    const ref_hardware_name = body.refHardwareName !== undefined ? body.refHardwareName : existing.ref_hardware_name;
    const ref_spec_description = body.refSpecDescription !== undefined ? body.refSpecDescription : existing.ref_spec_description;
    const market_price_range = body.marketPriceRange !== undefined ? body.marketPriceRange : existing.market_price_range;
    const suitable_scenarios = body.suitableScenarios !== undefined ? body.suitableScenarios : existing.suitable_scenarios;
    const api_scenarios = body.apiScenarios !== undefined ? body.apiScenarios : existing.api_scenarios;
    const daily_ai_token_yield = body.dailyAiTokenYield !== undefined ? body.dailyAiTokenYield : existing.daily_ai_token_yield;
    const yield_multiplier = body.yieldMultiplier !== undefined ? body.yieldMultiplier : existing.yield_multiplier;
    const purchase_limit = body.purchaseLimit !== undefined ? body.purchaseLimit : existing.purchase_limit;
    const stock_count = body.stockCount !== undefined ? body.stockCount : existing.stock_count;
    const is_featured = body.isFeatured !== undefined ? (body.isFeatured ? 1 : 0) : existing.is_featured;
    const disclaimer_text = body.disclaimerText !== undefined ? body.disclaimerText : existing.disclaimer_text;

    await c.env.DB
      .prepare(
        `UPDATE devices SET
          code = ?, name = ?, device_type = ?, base_hashpower = ?, rent_usdt = ?, rent_r1 = ?,
          duration_seconds = ?, duration_days = ?, is_demo = ?, is_active = ?,
          display_tier = ?, display_order = ?, ref_hardware_name = ?, ref_spec_description = ?,
          market_price_range = ?, suitable_scenarios = ?, api_scenarios = ?, daily_ai_token_yield = ?,
          yield_multiplier = ?, purchase_limit = ?, stock_count = ?, is_featured = ?, disclaimer_text = ?,
          updated_at = ?
         WHERE id = ?`
      )
      .bind(
        code, name, device_type, base_hashpower, rent_usdt, rent_r1,
        duration_seconds, duration_days, is_demo, is_active,
        display_tier, display_order, ref_hardware_name, ref_spec_description,
        market_price_range, suitable_scenarios, api_scenarios, daily_ai_token_yield,
        yield_multiplier, purchase_limit, stock_count, is_featured, disclaimer_text,
        now, id
      )
      .run();

    // Log event
    const eventId = generateId("evt");
    const eventPayload = JSON.stringify({
      action: "update",
      target_type: "device",
      target_id: id,
      before_json: mapDbDeviceToAdminModel(existing),
      after_json: body
    });
    await c.env.DB
      .prepare("INSERT INTO system_events (id, user_id, event_type, payload_json, created_at) VALUES (?, NULL, 'admin_device_update', ?, ?)")
      .bind(eventId, eventPayload, now)
      .run();

    return jsonResponse({ success: true });
  } catch (e: any) {
    console.error("Admin update device error:", e);
    return errorResponse("SERVER_ERROR", "Failed to update device: " + e.message, 500);
  }
});

// PATCH /api/admin/devices/:id/status
app.patch("/api/admin/devices/:id/status", async (c) => {
  const authErr = verifyAdminAuth(c);
  if (authErr) return authErr;

  const id = c.req.param("id");

  try {
    const existing = await c.env.DB
      .prepare("SELECT * FROM devices WHERE id = ? LIMIT 1")
      .bind(id)
      .first();
    if (!existing) {
      return errorResponse("NOT_FOUND", "Device template not found", 404);
    }

    const body = await c.req.json().catch(() => ({}));
    if (body.isActive === undefined) {
      return errorResponse("BAD_REQUEST", "Missing isActive parameter in body", 400);
    }

    const now = new Date().toISOString();
    const isActive = body.isActive ? 1 : 0;

    await c.env.DB
      .prepare("UPDATE devices SET is_active = ?, updated_at = ? WHERE id = ?")
      .bind(isActive, now, id)
      .run();

    // Log event
    const eventId = generateId("evt");
    const eventPayload = JSON.stringify({
      action: "toggle_status",
      target_type: "device",
      target_id: id,
      before_json: { isActive: existing.is_active === 1 },
      after_json: { isActive: body.isActive }
    });
    await c.env.DB
      .prepare("INSERT INTO system_events (id, user_id, event_type, payload_json, created_at) VALUES (?, NULL, 'admin_device_status_change', ?, ?)")
      .bind(eventId, eventPayload, now)
      .run();

    return jsonResponse({ success: true });
  } catch (e: any) {
    console.error("Admin toggle device status error:", e);
    return errorResponse("SERVER_ERROR", "Failed to toggle status: " + e.message, 500);
  }
});

// GET /api/admin/config
app.get("/api/admin/config", async (c) => {
  const authErr = verifyAdminAuth(c);
  if (authErr) return authErr;

  try {
    const globalYieldMultiplierStr = await getSystemConfig(c.env.DB, "GLOBAL_YIELD_MULTIPLIER", "1.0");
    const globalYieldMultiplier = parseFloat(globalYieldMultiplierStr) || 1.0;

    return jsonResponse({ globalYieldMultiplier });
  } catch (e: any) {
    console.error("Admin fetch config error:", e);
    return errorResponse("SERVER_ERROR", "Failed to fetch config: " + e.message, 500);
  }
});

// PUT /api/admin/config
app.put("/api/admin/config", async (c) => {
  const authErr = verifyAdminAuth(c);
  if (authErr) return authErr;

  try {
    const body = await c.req.json().catch(() => ({}));
    if (body.globalYieldMultiplier === undefined) {
      return errorResponse("BAD_REQUEST", "Missing globalYieldMultiplier in body", 400);
    }

    const value = body.globalYieldMultiplier;
    if (value < 0 || value > 100) {
      return errorResponse("BAD_REQUEST", "globalYieldMultiplier must be between 0 and 100", 400);
    }

    const now = new Date().toISOString();
    const beforeVal = await getSystemConfig(c.env.DB, "GLOBAL_YIELD_MULTIPLIER", "1.0");

    await setSystemConfig(c.env.DB, "GLOBAL_YIELD_MULTIPLIER", String(value));

    // Log event
    const eventId = generateId("evt");
    const eventPayload = JSON.stringify({
      action: "update_config",
      target_type: "config",
      target_id: "GLOBAL_YIELD_MULTIPLIER",
      before_json: { globalYieldMultiplier: parseFloat(beforeVal) || 1.0 },
      after_json: { globalYieldMultiplier: value }
    });
    await c.env.DB
      .prepare("INSERT INTO system_events (id, user_id, event_type, payload_json, created_at) VALUES (?, NULL, 'admin_config_update', ?, ?)")
      .bind(eventId, eventPayload, now)
      .run();

    return jsonResponse({ success: true });
  } catch (e: any) {
    console.error("Admin set config error:", e);
    return errorResponse("SERVER_ERROR", "Failed to set config: " + e.message, 500);
  }
});

// GET /api/admin/events
app.get("/api/admin/events", async (c) => {
  const authErr = verifyAdminAuth(c);
  if (authErr) return authErr;

  try {
    const { results } = await c.env.DB
      .prepare("SELECT * FROM system_events WHERE event_type LIKE 'admin_%' ORDER BY created_at DESC LIMIT 100")
      .all();

    return jsonResponse({
      events: results || []
    });
  } catch (e: any) {
    console.error("Admin fetch events error:", e);
    return errorResponse("SERVER_ERROR", "Failed to fetch admin audit events: " + e.message, 500);
  }
});

export default app;

