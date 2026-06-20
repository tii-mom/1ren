import { UserLevel } from "../types";

export interface SessionResponse {
  sessionToken: string;
  user: {
    id: string;
    tgId: number | null;
    inviteCode: string;
    referrerId: string | null;
    createdAt: string;
  };
}

export interface UserResponse {
  id: string;
  tgId: number | null;
  inviteCode: string;
  referrerId: string | null;
  referrerName?: string;
  createdAt: string;
}

export interface AssetsResponse {
  usdt: number;
  r1: number;
  aiToken: number;
  shards: number;
  coolantCount: number;
  hashCrystals: number;
  baseHashpower: number;
  teamHashpower: number;
  level: UserLevel;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

export interface DeviceCatalogItem {
  id: string;
  code: string;
  name: string;
  deviceType: string;
  baseHashpower: number;
  rentUsdt: number;
  rentR1: number;
  durationSeconds: number | null;
  durationDays: number | null;
  isDemo: boolean;
  displayTier?: string | null;
  displayOrder?: number;
  refHardwareName?: string | null;
  refSpecDescription?: string | null;
  marketPriceRange?: string | null;
  suitableScenarios?: string | null;
  apiScenarios?: string | null;
  dailyAiTokenYield?: number;
  yieldMultiplier?: number;
  purchaseLimit?: number;
  stockCount?: number;
  isFeatured?: number;
  disclaimerText?: string | null;
  effectiveDailyAiTokenYield?: number;
}

export interface DeviceOrder {
  id: string;
  userId: string;
  deviceId: string;
  orderType: string;
  status: string;
  paidAsset: string | null;
  paidAmount: number;
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface DeviceCatalogResponse {
  globalYieldMultiplier?: number;
  devices: DeviceCatalogItem[];
}

export interface ActiveDevicesResponse {
  orders: DeviceOrder[];
}

export interface MiningRecordsResponse {
  records: any[];
}

