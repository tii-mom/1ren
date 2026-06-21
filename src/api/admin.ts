import { DeviceCatalogItem } from "./types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export interface AdminDeviceItem {
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
  isActive: boolean;
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
  isFeatured?: boolean;
  disclaimerText?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminConfigResponse {
  globalYieldMultiplier: number;
}

export interface AdminEventItem {
  id: string;
  user_id: string | null;
  event_type: string;
  payload_json: string;
  created_at: string;
}

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || errBody.error || `HTTP error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// 1. GET /api/admin/devices
export async function getAdminDevices(token: string): Promise<{ devices: AdminDeviceItem[] }> {
  return request<{ devices: AdminDeviceItem[] }>("/api/admin/devices", token);
}

// 2. POST /api/admin/devices
export async function createAdminDevice(token: string, payload: Partial<AdminDeviceItem>): Promise<{ success: boolean; id: string }> {
  return request<{ success: boolean; id: string }>("/api/admin/devices", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 3. PUT /api/admin/devices/:id
export async function updateAdminDevice(token: string, id: string, payload: Partial<AdminDeviceItem>): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/admin/devices/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// 4. PATCH /api/admin/devices/:id/status
export async function updateAdminDeviceStatus(token: string, id: string, isActive: boolean): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/admin/devices/${id}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

// 5. GET /api/admin/config
export async function getAdminConfig(token: string): Promise<AdminConfigResponse> {
  return request<AdminConfigResponse>("/api/admin/config", token);
}

// 6. PUT /api/admin/config
export async function updateAdminConfig(token: string, payload: { globalYieldMultiplier: number }): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/admin/config", token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// 7. GET /api/admin/events
export async function getAdminEvents(token: string): Promise<{ events: AdminEventItem[] }> {
  return request<{ events: AdminEventItem[] }>("/api/admin/events", token);
}

// 8. Fetch public catalog for comparison preview
export async function getPublicDeviceCatalogForAdminPreview(): Promise<{ globalYieldMultiplier?: number; devices: DeviceCatalogItem[] }> {
  const url = `${API_BASE_URL}/api/devices/catalog`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}
