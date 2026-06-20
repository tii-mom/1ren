import { generateId } from "./db";

export interface DeviceRow {
  id: string;
  code: string;
  name: string;
  device_type: string;
  base_hashpower: number;
  rent_usdt: number;
  rent_r1: number;
  duration_seconds: number | null;
  duration_days: number | null;
  is_demo: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DeviceOrderRow {
  id: string;
  user_id: string;
  device_id: string;
  order_type: string;
  status: string;
  paid_asset: string | null;
  paid_amount: number;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export async function seedDeviceCatalog(db: D1Database): Promise<void> {
  const now = new Date().toISOString();
  const devices = [
    {
      id: "dev_demo",
      code: "DEMO",
      name: "3分钟体验节点",
      device_type: "demo",
      base_hashpower: 5.0,
      rent_usdt: 0,
      rent_r1: 0,
      duration_seconds: 180,
      duration_days: 0,
      is_demo: 1,
    },
    {
      id: "dev_bronze",
      code: "BRONZE",
      name: "基础推理引擎 (S1资格)",
      device_type: "infer",
      base_hashpower: 50.0,
      rent_usdt: 100,
      rent_r1: 0,
      duration_seconds: null,
      duration_days: 30,
      is_demo: 0,
    },
    {
      id: "dev_silver",
      code: "SILVER",
      name: "进阶训练引擎 (订单分配)",
      device_type: "train",
      base_hashpower: 250.0,
      rent_usdt: 500,
      rent_r1: 0,
      duration_seconds: null,
      duration_days: 60,
      is_demo: 0,
    },
    {
      id: "dev_gold",
      code: "GOLD",
      name: "旗舰集群引擎 (弹性调度)",
      device_type: "cluster",
      base_hashpower: 1000.0,
      rent_usdt: 2000,
      rent_r1: 0,
      duration_seconds: null,
      duration_days: 90,
      is_demo: 0,
    },
    {
      id: "dev_genesis",
      code: "GENESIS",
      name: "创世算力主节点 (上市铭牌)",
      device_type: "genesis",
      base_hashpower: 5000.0,
      rent_usdt: 10000,
      rent_r1: 0,
      duration_seconds: null,
      duration_days: 9999,
      is_demo: 0,
    },
  ];

  const statements = devices.map((d) => {
    return db
      .prepare(
        `INSERT OR IGNORE INTO devices (
          id, code, name, device_type, base_hashpower, rent_usdt, rent_r1, 
          duration_seconds, duration_days, is_demo, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        d.id,
        d.code,
        d.name,
        d.device_type,
        d.base_hashpower,
        d.rent_usdt,
        d.rent_r1,
        d.duration_seconds,
        d.duration_days,
        d.is_demo,
        1, // is_active
        now,
        now
      );
  });

  await db.batch(statements);
}

export async function getDeviceCatalog(db: D1Database): Promise<DeviceRow[]> {
  const { results } = await db
    .prepare("SELECT * FROM devices WHERE is_active = 1")
    .all<DeviceRow>();
  return results || [];
}

export async function getActiveDeviceOrders(
  db: D1Database,
  userId: string
): Promise<DeviceOrderRow[]> {
  const now = new Date().toISOString();
  const { results } = await db
    .prepare(
      "SELECT * FROM device_orders WHERE user_id = ? AND status = 'ACTIVE' AND expires_at > ?"
    )
    .bind(userId, now)
    .all<DeviceOrderRow>();
  return results || [];
}

export async function createDemoDeviceOrder(
  db: D1Database,
  userId: string,
  now: string
): Promise<DeviceOrderRow> {
  // Check if there is an active demo order
  const existing = await db
    .prepare(
      "SELECT * FROM device_orders WHERE user_id = ? AND order_type = 'DEMO' AND status = 'ACTIVE' AND expires_at > ? LIMIT 1"
    )
    .bind(userId, now)
    .first<DeviceOrderRow>();

  if (existing) {
    return existing;
  }

  // Create new demo order
  const orderId = generateId("ord");
  const startsAt = now;
  // Expires in 180 seconds (3 minutes)
  const expiresAt = new Date(new Date(now).getTime() + 180 * 1000).toISOString();

  const newOrder: DeviceOrderRow = {
    id: orderId,
    user_id: userId,
    device_id: "dev_demo",
    order_type: "DEMO",
    status: "ACTIVE",
    paid_asset: "FREE",
    paid_amount: 0,
    starts_at: startsAt,
    expires_at: expiresAt,
    created_at: now,
  };

  await db
    .prepare(
      "INSERT INTO device_orders (id, user_id, device_id, order_type, status, paid_asset, paid_amount, starts_at, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      newOrder.id,
      newOrder.user_id,
      newOrder.device_id,
      newOrder.order_type,
      newOrder.status,
      newOrder.paid_asset,
      newOrder.paid_amount,
      newOrder.starts_at,
      newOrder.expires_at,
      newOrder.created_at
    )
    .run();

  return newOrder;
}

export async function createDeviceRentOrder(
  db: D1Database,
  userId: string,
  deviceId: string,
  now: string
): Promise<DeviceOrderRow | null> {
  const device = await db
    .prepare("SELECT * FROM devices WHERE id = ? LIMIT 1")
    .bind(deviceId)
    .first<DeviceRow>();

  if (!device) {
    return null;
  }

  const orderId = generateId("ord");
  const startsAt = now;
  
  // Calculate expiration
  let expiresAt: string;
  if (device.duration_days) {
    expiresAt = new Date(
      new Date(now).getTime() + device.duration_days * 24 * 60 * 60 * 1000
    ).toISOString();
  } else if (device.duration_seconds) {
    expiresAt = new Date(
      new Date(now).getTime() + device.duration_seconds * 1000
    ).toISOString();
  } else {
    expiresAt = new Date(new Date(now).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  const newOrder: DeviceOrderRow = {
    id: orderId,
    user_id: userId,
    device_id: deviceId,
    order_type: "RENT",
    status: "ACTIVE",
    paid_asset: "USDT",
    paid_amount: device.rent_usdt,
    starts_at: startsAt,
    expires_at: expiresAt,
    created_at: now,
  };

  await db
    .prepare(
      "INSERT INTO device_orders (id, user_id, device_id, order_type, status, paid_asset, paid_amount, starts_at, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      newOrder.id,
      newOrder.user_id,
      newOrder.device_id,
      newOrder.order_type,
      newOrder.status,
      newOrder.paid_asset,
      newOrder.paid_amount,
      newOrder.starts_at,
      newOrder.expires_at,
      newOrder.created_at
    )
    .run();

  return newOrder;
}

export function mapDeviceOrder(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    deviceId: row.device_id,
    orderType: row.order_type,
    status: row.status,
    paidAsset: row.paid_asset,
    paidAmount: row.paid_amount,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}
