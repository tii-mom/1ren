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
