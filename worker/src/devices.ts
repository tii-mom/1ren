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
  display_tier?: string | null;
  display_order?: number;
  ref_hardware_name?: string | null;
  ref_spec_description?: string | null;
  market_price_range?: string | null;
  suitable_scenarios?: string | null;
  api_scenarios?: string | null;
  daily_ai_token_yield?: number;
  yield_multiplier?: number;
  purchase_limit?: number;
  stock_count?: number;
  is_featured?: number;
  disclaimer_text?: string | null;
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
      display_tier: "L0",
      display_order: 0,
      ref_hardware_name: "手机共享算力",
      ref_spec_description: "体验云算力并网流程的免费体验节点",
      market_price_range: "免费",
      suitable_scenarios: "算力自检流程校验",
      api_scenarios: "基础文本对话",
      daily_ai_token_yield: 13.5,
      yield_multiplier: 1.0,
      purchase_limit: 1,
      stock_count: 9999,
      is_featured: 0,
      disclaimer_text: "免费体验，到期自动断电"
    },
    {
      id: "miner-l1",
      code: "MINER_L1",
      name: "L1 个人轻量云实例",
      device_type: "infer",
      base_hashpower: 50.0,
      rent_usdt: 20,
      rent_r1: 0,
      duration_seconds: null,
      duration_days: 30,
      is_demo: 0,
      display_tier: "L1",
      display_order: 1,
      ref_hardware_name: "Mac mini M4",
      ref_spec_description: "10核CPU/10核GPU, NPU 38 TOPS, 16GB 统一内存, 256GB SSD",
      market_price_range: "市场参考价 $599 起",
      suitable_scenarios: "新手入门调试",
      api_scenarios: "适合轻量对话 (GPT-4o-mini / Qwen-Plus 等)、网页总结、个人 AI 助理",
      daily_ai_token_yield: 25000,
      yield_multiplier: 1.0,
      purchase_limit: 5,
      stock_count: 500,
      is_featured: 1,
      disclaimer_text: "仅作为规格参考云实例，不交付实体物理硬件"
    },
    {
      id: "miner-l2",
      code: "MINER_L2",
      name: "L2 开发者增强云实例",
      device_type: "train",
      base_hashpower: 250.0,
      rent_usdt: 80,
      rent_r1: 0,
      duration_seconds: null,
      duration_days: 30,
      is_demo: 0,
      display_tier: "L2",
      display_order: 2,
      ref_hardware_name: "Mac mini M4 Pro",
      ref_spec_description: "14核CPU/20核GPU, NPU 38 TOPS, 24GB 统一内存, 512GB SSD",
      marketPriceRange: "市场参考价 $1,399 起",
      suitable_scenarios: "独立开发者 Agent 流程调度",
      api_scenarios: "适合复杂网页分析、多 Agent 自动化流程调度、进阶文本推理 (Claude 3.5 Sonnet)",
      daily_ai_token_yield: 100000,
      yield_multiplier: 1.0,
      purchase_limit: 3,
      stock_count: 200,
      is_featured: 0,
      disclaimer_text: "仅作为规格参考云实例，不交付实体物理硬件"
    },
    {
      id: "miner-l3",
      code: "MINER_L3",
      name: "L3 国产 GPU 加速云实例",
      device_type: "cluster",
      base_hashpower: 1000.0,
      rent_usdt: 300,
      rent_r1: 0,
      duration_seconds: null,
      duration_days: 60,
      is_demo: 0,
      display_tier: "L3",
      display_order: 3,
      ref_hardware_name: "摩尔线程 MTT S4000",
      ref_spec_description: "3rd Gen MUSA 架构, 48GB GDDR6, INT8 200 TOPS",
      market_price_range: "企业渠道询价 (公开售价不透明)",
      suitable_scenarios: "企业知识库建设",
      api_scenarios: "适合企业知识库建设、中型多模态推理、离线文档深度分析",
      daily_ai_token_yield: 450000,
      yield_multiplier: 1.0,
      purchase_limit: 3,
      stock_count: 100,
      is_featured: 0,
      disclaimer_text: "仅作为规格参考云实例，不交付实体物理硬件"
    },
    {
      id: "miner-l4",
      code: "MINER_L4",
      name: "L4 企业 AI 加速云实例",
      device_type: "cluster",
      base_hashpower: 3000.0,
      rent_usdt: 1000,
      rent_r1: 0,
      duration_seconds: null,
      duration_days: 90,
      is_demo: 0,
      display_tier: "L4",
      display_order: 4,
      ref_hardware_name: "寒武纪思元 MLU370-X8",
      ref_spec_description: "双芯片 Chiplet, 48GB LPDDR5, INT8 256 TOPS",
      market_price_range: "系统渠道询价 (规格参考价非平台成交价)",
      suitable_scenarios: "高并发 API 响应",
      api_scenarios: "适合高并发 API 响应、图像生成 (Flux / SDXL API)、小规模模型微调模拟",
      daily_ai_token_yield: 1600000,
      yield_multiplier: 1.0,
      purchase_limit: 2,
      stock_count: 50,
      is_featured: 0,
      disclaimer_text: "仅作为规格参考云实例，不交付实体物理硬件"
    },
    {
      id: "miner-l5",
      code: "MINER_L5",
      name: "L5 算力中心旗舰云实例",
      device_type: "genesis",
      base_hashpower: 10000.0,
      rent_usdt: 5000,
      rent_r1: 0,
      duration_seconds: null,
      duration_days: 180,
      is_demo: 0,
      display_tier: "L5",
      display_order: 5,
      ref_hardware_name: "华为昇腾 Atlas 800 (Ascend 910B)",
      ref_spec_description: "8卡高性能算力节点, FP16 2.5 PFLOPS, 512GB HBM2e",
      market_price_range: "渠道大客户询价 (后台动态参数配置)",
      suitable_scenarios: "大模型满载计算",
      api_scenarios: "适合超大规模并发调用、长文本大模型 (DeepSeek-R1 等) 满载使用",
      daily_ai_token_yield: 11000000,
      yield_multiplier: 1.0,
      purchase_limit: 1,
      stock_count: 10,
      is_featured: 1,
      disclaimer_text: "仅作为规格参考云实例，不交付实体物理硬件"
    }
  ];

  const statements = devices.map((d) => {
    return db
      .prepare(
        `INSERT OR REPLACE INTO devices (
          id, code, name, device_type, base_hashpower, rent_usdt, rent_r1, 
          duration_seconds, duration_days, is_demo, is_active,
          display_tier, display_order, ref_hardware_name, ref_spec_description,
          market_price_range, suitable_scenarios, api_scenarios, daily_ai_token_yield,
          yield_multiplier, purchase_limit, stock_count, is_featured, disclaimer_text,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
        d.display_tier,
        d.display_order,
        d.ref_hardware_name,
        d.ref_spec_description,
        (d as any).market_price_range || null,
        d.suitable_scenarios,
        d.api_scenarios,
        d.daily_ai_token_yield,
        d.yield_multiplier,
        d.purchase_limit,
        d.stock_count,
        d.is_featured,
        d.disclaimer_text,
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
