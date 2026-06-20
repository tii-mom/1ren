import { HealthResponse, SessionResponse, UserResponse, AssetsResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

class ApiClient {
  private sessionToken: string | null = null;

  constructor() {
    this.sessionToken = localStorage.getItem("r1_session_token");
  }

  setSessionToken(token: string) {
    this.sessionToken = token;
    localStorage.setItem("r1_session_token", token);
  }

  clearSession() {
    this.sessionToken = null;
    localStorage.removeItem("r1_session_token");
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (this.sessionToken) {
      headers["Authorization"] = `Bearer ${this.sessionToken}`;
    }
    return headers;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP error ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  // GET /api/health
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/api/health");
  }

  // POST /api/session/create
  async createSession(referrerCode?: string, tgInitData?: string): Promise<SessionResponse> {
    const res = await this.request<SessionResponse>("/api/session/create", {
      method: "POST",
      body: JSON.stringify({ referrerCode, tgInitData }),
    });
    this.setSessionToken(res.sessionToken);
    return res;
  }

  // GET /api/me
  async getMe(): Promise<UserResponse> {
    return this.request<UserResponse>("/api/me");
  }

  // GET /api/assets
  async getAssets(): Promise<AssetsResponse> {
    return this.request<AssetsResponse>("/api/assets");
  }
}

export const apiClient = new ApiClient();
