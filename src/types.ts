export enum UserLevel {
  ZERO = "个体算力贡献者",
  S1 = "算力工作室创始人",
  S2 = "算力部门经理",
  S3 = "算力分公司总监",
  S4 = "区域算力总裁",
  S5 = "算力集团副总裁",
  S6 = "算力集团董事",
  S7 = "算力集团合伙人",
  S8 = "算力集团首席增长官",
  S9 = "算力集团联席CEO"
}

export interface TaskState {
  watchAd: boolean;         // 观看广告
  likeContent: boolean;     // 点赞内容
  shareMoments: boolean;    // 分享朋友圈
  lastCompletedDate: string; // YYYY-MM-DD for daily reset checking
}

export interface ActiveMiner {
  id: string;
  name: string;
  cost: number;
  dailyYield: number; // e.g. 0.01 for 1.0%
  contractDays: number;
  purchasedAt: string; // ISO String
  expiresAt: string; // ISO String
  status: "running" | "decayed" | "stopped"; // decayed means efficiency dropped, need coolant
  accumulatedRewards: number;
  efficiency: number; // 1.0 down to 0.5 when decayed
  isDemo?: boolean; // 7-day demo
  hasWarnedDemo?: boolean;
}

export interface MiningRecord {
  id: string;
  timestamp: string;
  amount: number;
  type: "mining" | "resonance" | "synthesize" | "coolant" | "exchange" | "buff";
  description: string;
}

export interface Referral {
  id: string;
  name: string;
  level: UserLevel;
  totalHashpower: number;
  joinedAt: string;
  depth: number; // level 1-9 in team referral network
}

export interface UserStats {
  hashFragments: number; // 算力碎片 quantity
  hashCrystals: number;  // 算力晶体 quantity
  level: UserLevel;
  baseHashpower: number; // 个人基础算力 (T)
  teamHashpower: number; // 团队加成算力 (T)
  totalSynthesized: number; // 累计晶体合成数
  accumulatedFragments: number; // 累计产出碎片数
  inviteCode: string;
  referrerName: string; // 上级推荐人 name
  coolantCount: number; // 冷却液 quantity
  buffActiveUntil: string | null; // ISO String for 1hr 2x buff
  hasClaimedDemo: boolean; // Has claimed the 7-day free demo miner
}

export interface MinerTemplate {
  id: string;
  name: string;
  cost: number; // in U
  contractDays: number; // Contract period in days (e.g. 30, 60, 90, 9999 for permanent)
  baseYieldRange: [number, number]; // [min, max] e.g. [0.008, 0.012]
  benefits: string[];
  stockToday: number;
}

export interface StoreItem {
  id: string;
  name: string;
  costFragments: number;
  category: "physical" | "hosting";
  image: string;
  description: string;
  stock: number;
}
