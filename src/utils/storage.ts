import { UserLevel, UserStats, ActiveMiner, TaskState, MiningRecord, Referral, StoreItem } from "../types";

export const MOCK_REFERRALS: Referral[] = [
  { id: "ref-1", name: "算力节点-张强", level: UserLevel.S3, totalHashpower: 320, joinedAt: "2026-05-18", depth: 1 },
  { id: "ref-2", name: "GPU节点-老陈", level: UserLevel.S5, totalHashpower: 2450, joinedAt: "2026-05-19", depth: 1 },
  { id: "ref-3", name: "研发节点-小王", level: UserLevel.S1, totalHashpower: 120, joinedAt: "2026-05-20", depth: 2 },
  { id: "ref-4", name: "基础节点-大空", level: UserLevel.ZERO, totalHashpower: 15, joinedAt: "2026-05-25", depth: 2 },
  { id: "ref-5", name: "骨干节点-阿飞", level: UserLevel.S3, totalHashpower: 600, joinedAt: "2026-06-01", depth: 3 },
  { id: "ref-6", name: "中继节点-李娜", level: UserLevel.S1, totalHashpower: 140, joinedAt: "2026-06-02", depth: 3 },
  { id: "ref-7", name: "基础节点-小金", level: UserLevel.ZERO, totalHashpower: 8, joinedAt: "2026-06-03", depth: 4 },
  { id: "ref-8", name: "基础节点-小砖", level: UserLevel.ZERO, totalHashpower: 45, joinedAt: "2026-06-04", depth: 4 },
  { id: "ref-9", name: "高级节点-赵静", level: UserLevel.S4, totalHashpower: 580, joinedAt: "2026-06-05", depth: 5 },
  { id: "ref-10", name: "中继节点-大刘", level: UserLevel.S2, totalHashpower: 130, joinedAt: "2026-06-06", depth: 5 },
  { id: "ref-11", name: "普通节点-孙博", level: UserLevel.ZERO, totalHashpower: 0, joinedAt: "2026-06-08", depth: 5 },
  { id: "ref-12", name: "普通节点-陈凯", level: UserLevel.ZERO, totalHashpower: 80, joinedAt: "2026-06-10", depth: 5 },
  { id: "ref-13", name: "资深节点-欧阳", level: UserLevel.S4, totalHashpower: 710, joinedAt: "2026-06-11", depth: 5 },
  { id: "ref-14", name: "骨干中继-周梅", level: UserLevel.S2, totalHashpower: 150, joinedAt: "2026-06-12", depth: 5 },
  { id: "ref-15", name: "骨干节点-刘炜", level: UserLevel.S5, totalHashpower: 3800, joinedAt: "2026-06-15", depth: 5 }
];

export const MOCK_STORE_ITEMS: StoreItem[] = [
  {
    id: "item-1",
    name: "API/URL 服务凭证包",
    costFragments: 50000,
    category: "physical",
    image: "api",
    description: "消耗 Token 生成可交付的 API Key 和访问 URL，可自用或出售给客户。",
    stock: 5
  },
  {
    id: "item-2",
    name: "平台回收加急券",
    costFragments: 95000,
    category: "physical",
    image: "buyback",
    description: "提交 Token 回收报价时优先处理，适合需要快速变现的用户。",
    stock: 8
  },
  {
    id: "item-3",
    name: "企业客户交付报告",
    costFragments: 150000,
    category: "physical",
    image: "report",
    description: "生成客户可读的算力调用记录和 Token 消耗报表。",
    stock: 12
  },
  {
    id: "item-4",
    name: "GPU 集群温控维护液",
    costFragments: 12000,
    category: "hosting",
    image: "maintenance",
    description: "用于冷却过热降频的 GPU 算力集群，解除限频并提供额外的超频产出。",
    stock: 25
  },
  {
    id: "item-5",
    name: "手机节点扩展名额",
    costFragments: 3000,
    category: "hosting",
    image: "mobile",
    description: "为更多自有设备开通接入名额，适合用多台手机或电脑共享算力。",
    stock: 100
  }
];

export const INITIAL_STATS: UserStats = {
  hashFragments: 32.54,
  hashCrystals: 0,
  r1Balance: 150.0, // Initial R1 Token balance
  level: UserLevel.ZERO,
  baseHashpower: 50.0, // Initial 50P for free users
  teamHashpower: 0.0,  // Start with 0 team hashpower
  totalSynthesized: 0,
  accumulatedFragments: 32.54,
  inviteCode: "CUBE888",
  referrerName: "初始推荐节点",
  coolantCount: 1, // Start with 1 free coolant
  buffActiveUntil: null,
  hasClaimedDemo: false,
  directReferrals: 0,
  totalReferrals: 0
};

export const INITIAL_TASKS: TaskState = {
  watchAd: false,
  likeContent: false,
  shareMoments: false,
  lastCompletedDate: ""
};

export const INITIAL_RECORDS: MiningRecord[] = [
  { id: "rec-1", timestamp: "2026-06-15T18:30:00Z", amount: 10.0, type: "buff", description: "开启一小时算力加速" },
  { id: "rec-2", timestamp: "2026-06-15T12:00:00Z", amount: 5.4, type: "resonance", description: "团队节点贡献加权结算" },
  { id: "rec-3", timestamp: "2026-06-15T08:00:00Z", amount: 15.0, type: "mining", description: "基础设备日结算完成" }
];

export const STORAGE_KEYS = {
  version: "r1_storage_version",
  stats: "r1_user_stats",
  miners: "r1_active_miners",
  tasks: "r1_daily_tasks",
  records: "r1_mining_records",
  usdtBalance: "r1_usdt_balance",
  streakCount: "r1_streak_count",
  lastCheckInDate: "r1_last_check_in_date",
  issuedTokens: "r1_user_issued_tokens"
} as const;

export const LEGACY_STORAGE_KEYS = {
  stats: "hashcube_user_stats",
  miners: "hashcube_active_miners",
  tasks: "hashcube_daily_tasks",
  records: "hashcube_mining_records",
  usdtBalance: "hashcube_usdt_balance",
  streakCount: "hashcube_streak_count",
  lastCheckInDate: "hashcube_last_check_in_date"
} as const;

export const migrateLegacyStorage = (): void => {
  try {
    const newVersion = localStorage.getItem(STORAGE_KEYS.version);
    if (newVersion) return; // already migrated

    // Check if any legacy key exists, then copy
    Object.keys(LEGACY_STORAGE_KEYS).forEach((k) => {
      const key = k as keyof typeof LEGACY_STORAGE_KEYS;
      const legacyKey = LEGACY_STORAGE_KEYS[key];
      const newKey = STORAGE_KEYS[key];
      const legacyValue = localStorage.getItem(legacyKey);
      if (legacyValue !== null) {
        localStorage.setItem(newKey, legacyValue);
      }
    });

    // Write version
    localStorage.setItem(STORAGE_KEYS.version, "1");
  } catch (e) {
    console.warn("Storage migration failed:", e);
  }
};

export const loadStats = (): UserStats => {
  let data = localStorage.getItem(STORAGE_KEYS.stats);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object") {
        if (parsed.r1Balance === undefined) {
          parsed.r1Balance = 150.0;
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Error parsing new stats, trying legacy stats:", e);
    }
  }

  // Fallback to legacy
  data = localStorage.getItem(LEGACY_STORAGE_KEYS.stats);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object") {
        if (parsed.r1Balance === undefined) {
          parsed.r1Balance = 150.0;
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Error parsing legacy stats:", e);
    }
  }

  return INITIAL_STATS;
};

export const saveStats = (stats: UserStats) => {
  try {
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
  } catch (e) {
    console.warn("Error saving stats:", e);
  }
};

export const loadMiners = (): ActiveMiner[] => {
  let data = localStorage.getItem(STORAGE_KEYS.miners);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn("Error parsing new miners, trying legacy miners:", e);
    }
  }

  data = localStorage.getItem(LEGACY_STORAGE_KEYS.miners);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn("Error parsing legacy miners:", e);
    }
  }

  return [];
};

export const saveMiners = (miners: ActiveMiner[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.miners, JSON.stringify(miners));
  } catch (e) {
    console.warn("Error saving miners:", e);
  }
};

export const loadTasks = (): TaskState => {
  let data = localStorage.getItem(STORAGE_KEYS.tasks);
  if (data) {
    try {
      const parsed = JSON.parse(data) as TaskState;
      if (parsed && typeof parsed === "object") {
        const todayStr = new Date().toISOString().substring(0, 10);
        if (parsed.lastCompletedDate !== todayStr) {
          return {
            watchAd: false,
            likeContent: false,
            shareMoments: false,
            lastCompletedDate: todayStr
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Error parsing new tasks, trying legacy tasks:", e);
    }
  }

  data = localStorage.getItem(LEGACY_STORAGE_KEYS.tasks);
  if (data) {
    try {
      const parsed = JSON.parse(data) as TaskState;
      if (parsed && typeof parsed === "object") {
        const todayStr = new Date().toISOString().substring(0, 10);
        if (parsed.lastCompletedDate !== todayStr) {
          return {
            watchAd: false,
            likeContent: false,
            shareMoments: false,
            lastCompletedDate: todayStr
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Error parsing legacy tasks:", e);
    }
  }

  return INITIAL_TASKS;
};

export const saveTasks = (tasks: TaskState) => {
  try {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  } catch (e) {
    console.warn("Error saving tasks:", e);
  }
};

export const loadRecords = (): MiningRecord[] => {
  let data = localStorage.getItem(STORAGE_KEYS.records);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn("Error parsing new records, trying legacy records:", e);
    }
  }

  data = localStorage.getItem(LEGACY_STORAGE_KEYS.records);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn("Error parsing legacy records:", e);
    }
  }

  return INITIAL_RECORDS;
};

export const saveRecords = (records: MiningRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
  } catch (e) {
    console.warn("Error saving records:", e);
  }
};

export const loadUsdtBalance = (): number => {
  let data = localStorage.getItem(STORAGE_KEYS.usdtBalance);
  if (!data) {
    data = localStorage.getItem(LEGACY_STORAGE_KEYS.usdtBalance);
  }
  if (!data) return 500.0;
  const parsed = parseFloat(data);
  return isNaN(parsed) ? 500.0 : parsed;
};

export const saveUsdtBalance = (balance: number) => {
  try {
    localStorage.setItem(STORAGE_KEYS.usdtBalance, balance.toString());
  } catch (e) {
    console.warn("Error saving USDT balance:", e);
  }
};

export const addRecord = (records: MiningRecord[], type: MiningRecord["type"], amount: number, description: string): MiningRecord[] => {
  const newRecord: MiningRecord = {
    id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    amount,
    type,
    description
  };
  const updated = [newRecord, ...records].slice(0, 100); // Keep last 100 logs
  saveRecords(updated);
  return updated;
};
