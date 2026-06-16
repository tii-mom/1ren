import { UserLevel, UserStats, ActiveMiner, TaskState, MiningRecord, Referral, StoreItem } from "../types";

// Dynamic names generator for 9 levels of MLM referrals
const CONTRIB_NAMES = [
  "算力极客-张强", "星际拓荒者-老陈", "量子韭菜王", "币圈大空头", "共鸣带头人-阿飞",
  "未来矿主-李娜", "金色财富风暴", "分布式算力搬砖者", "元宇宙领主-赵静", "信仰接力第一人",
  "屯币狂人-孙博", "零撸天王-陈凯", "链上节点-欧阳", "神话搬砖-周梅", "超级大使-刘炜"
];

export const MOCK_REFERRALS: Referral[] = [
  { id: "ref-1", name: "算力雇员-张强", level: UserLevel.S3, totalHashpower: 320, joinedAt: "2026-05-18", depth: 1 },
  { id: "ref-2", name: "星际雇员-老陈", level: UserLevel.S5, totalHashpower: 2450, joinedAt: "2026-05-19", depth: 1 },
  { id: "ref-3", name: "研发雇员-小王", level: UserLevel.S1, totalHashpower: 120, joinedAt: "2026-05-20", depth: 2 },
  { id: "ref-4", name: "基础雇员-大空", level: UserLevel.ZERO, totalHashpower: 15, joinedAt: "2026-05-25", depth: 2 },
  { id: "ref-5", name: "骨干雇员-阿飞", level: UserLevel.S3, totalHashpower: 600, joinedAt: "2026-06-01", depth: 3 },
  { id: "ref-6", name: "中继雇员-李娜", level: UserLevel.S1, totalHashpower: 140, joinedAt: "2026-06-02", depth: 3 },
  { id: "ref-7", name: "基础雇员-小金", level: UserLevel.ZERO, totalHashpower: 8, joinedAt: "2026-06-03", depth: 4 },
  { id: "ref-8", name: "基础雇员-小砖", level: UserLevel.ZERO, totalHashpower: 45, joinedAt: "2026-06-04", depth: 4 },
  { id: "ref-9", name: "高级雇员-赵静", level: UserLevel.S4, totalHashpower: 580, joinedAt: "2026-06-05", depth: 5 },
  { id: "ref-10", name: "中继雇员-大刘", level: UserLevel.S2, totalHashpower: 130, joinedAt: "2026-06-06", depth: 6 },
  { id: "ref-11", name: "普通雇员-孙博", level: UserLevel.ZERO, totalHashpower: 0, joinedAt: "2026-06-08", depth: 7 },
  { id: "ref-12", name: "普通雇员-陈凯", level: UserLevel.ZERO, totalHashpower: 80, joinedAt: "2026-06-10", depth: 7 },
  { id: "ref-13", name: "资深联席-欧阳", level: UserLevel.S6, totalHashpower: 710, joinedAt: "2026-06-11", depth: 8 },
  { id: "ref-14", name: "骨干中继-周梅", level: UserLevel.S2, totalHashpower: 150, joinedAt: "2026-06-12", depth: 8 },
  { id: "ref-15", name: "联席代工-刘炜", level: UserLevel.S7, totalHashpower: 3800, joinedAt: "2026-06-15", depth: 9 }
];

export const MOCK_STORE_ITEMS: StoreItem[] = [
  {
    id: "item-1",
    name: "iPhone 17 Pro Max 仿生钛金版",
    costFragments: 50000,
    category: "physical",
    image: "📱",
    description: "下一代量子芯片手机，支持离线AI卫星节点算力自测，2027年首发限量。",
    stock: 5
  },
  {
    id: "item-2",
    name: "999.9% 算力魔方定制物理黄金金条 (50g)",
    costFragments: 150000,
    category: "physical",
    image: "🪙",
    description: "铸造有算力网络独一无二散列值的实物纯黄金金条，保值抗通胀利器。",
    stock: 12
  },
  {
    id: "item-3",
    name: "特斯拉 Model S Plaid 联名版产权合约",
    costFragments: 4500000,
    category: "physical",
    image: "🚗",
    description: "赠送专属‘算力魔方’激光雕刻车标与终身全球超级充电及托管服务，豪车直接兑换过户。",
    stock: 2
  },
  {
    id: "item-4",
    name: "绿色特高压大凉山水电 50kW 算力中心专属服务器插线位 (1年)",
    costFragments: 12000,
    category: "hosting",
    image: "🏭",
    description: "绿色环保清洁能源算力托管。免去服务器管理维护费，直连便宜水电，额外提高设备35%深度计算输出效能。",
    stock: 25
  },
  {
    id: "item-5",
    name: "张家口风能超导冷风机房托管增效合约 (3个月)",
    costFragments: 4000,
    category: "hosting",
    image: "❄️",
    description: "具备极高环境散热优势的冷风常温超导冷却室托管。适合高强度不间断AI模型训练，完全免除设备的爆温折损率。",
    stock: 60
  }
];

export const INITIAL_STATS: UserStats = {
  hashFragments: 32.54,
  hashCrystals: 0,
  level: UserLevel.ZERO,
  baseHashpower: 10.0, // Initial 10 T/s for free users
  teamHashpower: 45.5,
  totalSynthesized: 0,
  accumulatedFragments: 32.54,
  inviteCode: "CUBE888",
  referrerName: "星际创世神-波卡老詹",
  coolantCount: 1, // Start with 1 free coolant
  buffActiveUntil: null,
  hasClaimedDemo: false
};

export const INITIAL_TASKS: TaskState = {
  watchAd: false,
  likeContent: false,
  shareMoments: false,
  lastCompletedDate: ""
};

export const INITIAL_RECORDS: MiningRecord[] = [
  { id: "rec-1", timestamp: "2026-06-15T18:30:00Z", amount: 10.0, type: "buff", description: "激活一小时突袭翻倍奖励" },
  { id: "rec-2", timestamp: "2026-06-15T12:00:00Z", amount: 5.4, type: "resonance", description: "一排下线‘星际拓荒者’共鸣收益分配" },
  { id: "rec-3", timestamp: "2026-06-15T08:00:00Z", amount: 15.0, type: "mining", description: "基础计算槽日结算完成" }
];

export const loadStats = (): UserStats => {
  const data = localStorage.getItem("hashcube_user_stats");
  if (!data) return INITIAL_STATS;
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_STATS;
  }
};

export const saveStats = (stats: UserStats) => {
  localStorage.setItem("hashcube_user_stats", JSON.stringify(stats));
};

export const loadMiners = (): ActiveMiner[] => {
  const data = localStorage.getItem("hashcube_active_miners");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const saveMiners = (miners: ActiveMiner[]) => {
  localStorage.setItem("hashcube_active_miners", JSON.stringify(miners));
};

export const loadTasks = (): TaskState => {
  const data = localStorage.getItem("hashcube_daily_tasks");
  if (!data) return INITIAL_TASKS;
  try {
    const parsed = JSON.parse(data) as TaskState;
    // Check daily reset
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
  } catch {
    return INITIAL_TASKS;
  }
};

export const saveTasks = (tasks: TaskState) => {
  localStorage.setItem("hashcube_daily_tasks", JSON.stringify(tasks));
};

export const loadRecords = (): MiningRecord[] => {
  const data = localStorage.getItem("hashcube_mining_records");
  if (!data) return INITIAL_RECORDS;
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_RECORDS;
  }
};

export const saveRecords = (records: MiningRecord[]) => {
  localStorage.setItem("hashcube_mining_records", JSON.stringify(records));
};

export const addRecord = (records: MiningRecord[], type: MiningRecord["type"], amount: number, description: string): MiningRecord[] => {
  const newRecord: MiningRecord = {
    id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    amount,
    type,
    description
  };
  const updated = [newRecord, ...records].slice(0, 50); // Keep last 50 logs
  saveRecords(updated);
  return updated;
};
