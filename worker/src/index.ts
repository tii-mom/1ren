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
  AssetAccountRow
} from "./db";

type Bindings = {
  DB: D1Database;
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

export default app;
