import { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { UserResponse, AssetsResponse } from "../api/types";

export function useBackendConnection() {
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [backendUser, setBackendUser] = useState<UserResponse | null>(null);
  const [backendAssets, setBackendAssets] = useState<AssetsResponse | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [backendLoading, setBackendLoading] = useState<boolean>(false);

  const clearBackendError = () => setBackendError(null);

  const disconnectBackend = () => {
    apiClient.clearSession();
    setBackendUser(null);
    setBackendAssets(null);
    setBackendConnected(false);
    setBackendError(null);
  };

  const connectBackend = async (referrerCode?: string) => {
    setBackendLoading(true);
    setBackendError(null);
    try {
      // 1. Create Session
      await apiClient.createSession(referrerCode);
      // 2. Get Profile
      const user = await apiClient.getMe();
      // 3. Get Assets
      const assets = await apiClient.getAssets();

      setBackendUser(user);
      setBackendAssets(assets);
      setBackendConnected(true);
    } catch (err: any) {
      console.error("Failed to connect backend:", err);
      const errMsg = err.message || "";
      const is401 = errMsg === "UNAUTHORIZED" || errMsg.includes("401") || errMsg.toLowerCase().includes("unauthorized");
      if (is401) {
        disconnectBackend();
        setBackendError("会话授权失效，请重新连接。");
      } else {
        const isNetwork = errMsg.includes("Failed to fetch") || errMsg.includes("fetch failed") || err instanceof TypeError;
        if (isNetwork) {
          setBackendError("后端未连接，请先运行 npm run worker:dev");
        } else {
          setBackendError(errMsg || "连接后端失败");
        }
      }
    } finally {
      setBackendLoading(false);
    }
  };

  const refreshBackend = async () => {
    const token = localStorage.getItem("r1_session_token");
    if (!token) return;

    setBackendLoading(true);
    setBackendError(null);
    try {
      const user = await apiClient.getMe();
      const assets = await apiClient.getAssets();

      setBackendUser(user);
      setBackendAssets(assets);
      setBackendConnected(true);
    } catch (err: any) {
      console.error("Failed to refresh backend:", err);
      const errMsg = err.message || "";
      const is401 = errMsg === "UNAUTHORIZED" || errMsg.includes("401") || errMsg.toLowerCase().includes("unauthorized");
      if (is401) {
        disconnectBackend();
        setBackendError("会话已过期，已自动断开连接。");
      } else {
        const isNetwork = errMsg.includes("Failed to fetch") || errMsg.includes("fetch failed") || err instanceof TypeError;
        if (isNetwork) {
          setBackendError("后端未连接，请先运行 npm run worker:dev");
        } else {
          setBackendError(errMsg || "更新后端数据失败");
        }
      }
    } finally {
      setBackendLoading(false);
    }
  };

  // Auto connect/refresh on mount if session token exists
  useEffect(() => {
    const token = localStorage.getItem("r1_session_token");
    if (token) {
      refreshBackend();
    }
  }, []);

  return {
    backendConnected,
    backendUser,
    backendAssets,
    backendError,
    backendLoading,
    connectBackend,
    refreshBackend,
    disconnectBackend,
    clearBackendError,
  };
}
export type UseBackendConnectionReturn = ReturnType<typeof useBackendConnection>;
