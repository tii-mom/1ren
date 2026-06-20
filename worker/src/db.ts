export interface UserRow {
  id: string;
  tg_id: string | null;
  invite_code: string;
  referrer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
  revoked_at: string | null;
}

export interface AssetAccountRow {
  id: string;
  user_id: string;
  asset_type: string;
  balance: number;
  locked_balance: number;
  updated_at: string;
}

export function generateId(prefix: string): string {
  // Using crypto.randomUUID()
  const uuid = crypto.randomUUID().replace(/-/g, "");
  return `${prefix}_${uuid.substring(0, 16)}`;
}

export function generateSessionToken(): string {
  // session token format s_tok_xxx using crypto.randomUUID
  const uuid = crypto.randomUUID().replace(/-/g, "");
  return `s_tok_${uuid}`;
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "R1";
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  for (let i = 0; i < 6; i++) {
    code += chars[array[i] % chars.length];
  }
  return code;
}

export function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export function errorResponse(code: string, message: string, status: number = 400): Response {
  return jsonResponse({ error: code, message }, status);
}

export function getBearerToken(headers: Headers): string | null {
  const auth = headers.get("Authorization");
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1].trim();
  }
  return null;
}

export async function getSessionUser(
  db: D1Database,
  token: string
): Promise<{ user: UserRow; session: SessionRow } | null> {
  // Query session by token
  const session = await db
    .prepare("SELECT * FROM sessions WHERE session_token = ? LIMIT 1")
    .bind(token)
    .first<SessionRow>();

  if (!session) {
    return null;
  }

  // Check if session is revoked
  if (session.revoked_at !== null) {
    return null;
  }

  // Check if session is expired
  const now = new Date().toISOString();
  if (session.expires_at < now) {
    return null;
  }

  // Check if user exists
  const user = await db
    .prepare("SELECT * FROM users WHERE id = ? LIMIT 1")
    .bind(session.user_id)
    .first<UserRow>();

  if (!user) {
    return null;
  }

  return { user, session };
}

export async function createDefaultAssetAccounts(
  db: D1Database,
  userId: string,
  now: string
): Promise<void> {
  const defaults = [
    { type: "USDT", balance: 500 },
    { type: "R1", balance: 0 },
    { type: "AI_TOKEN", balance: 32.54 },
    { type: "SHARDS", balance: 0 },
    { type: "COOLANT", balance: 1 },
    { type: "HASH_CRYSTAL", balance: 0 },
  ];

  const statements = defaults.map((item) => {
    const id = generateId("ast");
    return db
      .prepare(
        "INSERT INTO asset_accounts (id, user_id, asset_type, balance, locked_balance, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .bind(id, userId, item.type, item.balance, 0, now);
  });

  await db.batch(statements);
}

export function mapAssetAccounts(rows: AssetAccountRow[]) {
  const result = {
    usdt: 0,
    r1: 0,
    aiToken: 0,
    shards: 0,
    coolantCount: 0,
    hashCrystals: 0,
  };

  for (const row of rows) {
    switch (row.asset_type) {
      case "USDT":
        result.usdt = row.balance;
        break;
      case "R1":
        result.r1 = row.balance;
        break;
      case "AI_TOKEN":
        result.aiToken = row.balance;
        break;
      case "SHARDS":
        result.shards = row.balance;
        break;
      case "COOLANT":
        result.coolantCount = row.balance;
        break;
      case "HASH_CRYSTAL":
        result.hashCrystals = row.balance;
        break;
    }
  }

  return result;
}
