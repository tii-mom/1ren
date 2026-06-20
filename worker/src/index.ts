import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

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
    service: "1ren-backend-skeleton"
  });
});

// POST /api/session/create
app.post("/api/session/create", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const referrerCode = body.referrerCode || null;
    const tgInitData = body.tgInitData || null;

    // Mock session and user database creation
    const mockUserId = "usr-1002";
    const mockSessionToken = "s_tok_mock_" + Math.random().toString(36).substring(2);

    return c.json({
      sessionToken: mockSessionToken,
      user: {
        id: mockUserId,
        tgId: tgInitData ? 89234123 : null,
        inviteCode: "CUBE654",
        referrerId: referrerCode ? "usr-1001" : null,
        createdAt: new Date().toISOString()
      }
    });
  } catch (e) {
    return c.json({ error: "Invalid request payload" }, 400);
  }
});

// Mock Auth Helper
const getMockUser = (authHeader: string | undefined) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return {
    id: "usr-1002",
    tgId: null,
    inviteCode: "CUBE654",
    referrerName: "初始推荐节点",
    createdAt: "2026-06-20T12:00:00Z"
  };
};

// GET /api/me
app.get("/api/me", (c) => {
  const auth = c.req.header("Authorization");
  const user = getMockUser(auth);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return c.json(user);
});

// GET /api/assets
app.get("/api/assets", (c) => {
  const auth = c.req.header("Authorization");
  const user = getMockUser(auth);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Returns mock user assets for MVP frontend testing
  return c.json({
    usdt: 500.00,
    r1: 150.00,
    aiToken: 32.54,
    shards: 0.00,
    coolantCount: 1,
    hashCrystals: 0,
    baseHashpower: 50.00,
    teamHashpower: 0.00,
    level: "S0 自有设备节点"
  });
});

export default app;
