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
    let catalog = await getDeviceCatalog(c.env.DB);
    if (catalog.length === 0) {
      await seedDeviceCatalog(c.env.DB);
      catalog = await getDeviceCatalog(c.env.DB);
    }
    return jsonResponse({
      devices: catalog.map(d => ({
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
      })),
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

export default app;
