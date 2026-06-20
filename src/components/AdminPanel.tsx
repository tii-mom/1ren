import React, { useState, useEffect } from "react";
import { 
  X, ShieldCheck, CheckCircle2, AlertTriangle, Plus, Edit2, Save, 
  RefreshCw, Sliders, Database, Calendar, Eye, EyeOff, FileText, Check, AlertOctagon 
} from "lucide-react";
import { 
  getAdminDevices, createAdminDevice, updateAdminDevice, updateAdminDeviceStatus,
  getAdminConfig, updateAdminConfig, getAdminEvents, AdminDeviceItem, AdminEventItem 
} from "../api/admin";

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  // Authentication states
  const [token, setToken] = useState<string>(() => {
    return sessionStorage.getItem("r1_admin_token") || localStorage.getItem("r1_admin_token") || "";
  });
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return !!localStorage.getItem("r1_admin_token");
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(false);
  const [showToken, setShowToken] = useState<boolean>(false);

  // Configuration States
  const [globalYieldMultiplier, setGlobalYieldMultiplier] = useState<number>(1.0);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  // Device list states
  const [devices, setDevices] = useState<AdminDeviceItem[]>([]);
  const [loadingDevices, setLoadingDevices] = useState<boolean>(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  // Edit / Create Form states
  const [editingDevice, setEditingDevice] = useState<Partial<AdminDeviceItem> | null>(null);
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savingDevice, setSavingDevice] = useState<boolean>(false);

  // Log events states
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);

  // Notification states
  const [notification, setNotification] = useState<{ title: string; message: string; type: "success" | "error" | "info" } | null>(null);

  // Verify auth on mount if token exists
  useEffect(() => {
    if (token) {
      handleVerifyToken(token);
    }
  }, []);

  const triggerNotification = (title: string, message: string, type: "success" | "error" | "info") => {
    setNotification({ title, message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleVerifyToken = async (tokenToVerify: string) => {
    if (!tokenToVerify) return;
    setCheckingAuth(true);
    setAuthError(null);
    try {
      // Fetch devices as a verification call
      const res = await getAdminDevices(tokenToVerify);
      setDevices(res.devices);
      setIsAuthenticated(true);
      
      // Save token based on preference
      if (rememberMe) {
        localStorage.setItem("r1_admin_token", tokenToVerify);
        sessionStorage.removeItem("r1_admin_token");
      } else {
        sessionStorage.setItem("r1_admin_token", tokenToVerify);
        localStorage.removeItem("r1_admin_token");
      }

      // Load config & logs
      loadConfig(tokenToVerify);
      loadEvents(tokenToVerify);
      
      triggerNotification("认证成功", "已成功进入算力控制台管理员模式。", "success");
    } catch (e: any) {
      console.error(e);
      setAuthError(e.message || "身份验证失败，请检查 Admin Token 格式或确认后端已配置环境。");
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("r1_admin_token");
    localStorage.removeItem("r1_admin_token");
    setToken("");
    setIsAuthenticated(false);
    setDevices([]);
    triggerNotification("已退出", "已退出管理员配置模式。", "info");
  };

  const loadConfig = async (activeToken: string) => {
    try {
      const config = await getAdminConfig(activeToken);
      setGlobalYieldMultiplier(config.globalYieldMultiplier);
    } catch (e: any) {
      console.error("Failed to load global config:", e);
    }
  };

  const loadEvents = async (activeToken: string) => {
    setLoadingEvents(true);
    try {
      const res = await getAdminEvents(activeToken);
      setEvents(res.events);
    } catch (e: any) {
      console.error("Failed to load events:", e);
    } finally {
      setLoadingEvents(false);
    }
  };

  const refreshDevices = async () => {
    setLoadingDevices(true);
    setDeviceError(null);
    try {
      const res = await getAdminDevices(token);
      setDevices(res.devices);
    } catch (e: any) {
      setDeviceError(e.message || "加载设备列表失败");
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      await updateAdminDeviceStatus(token, id, !currentActive);
      triggerNotification("状态已更新", `成功${!currentActive ? "上架" : "下架"}了设备实例。`, "success");
      refreshDevices();
      loadEvents(token);
    } catch (e: any) {
      triggerNotification("更新失败", e.message || "无法更改设备实例状态", "error");
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await updateAdminConfig(token, { globalYieldMultiplier });
      triggerNotification("全局配置已保存", `全局 AI Token 产出系数已更新为 ${globalYieldMultiplier.toFixed(2)}x。`, "success");
      loadEvents(token);
    } catch (e: any) {
      triggerNotification("保存失败", e.message || "无法更新全局系数", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleOpenEdit = (device: AdminDeviceItem) => {
    setEditingDevice({ ...device });
    setIsCreateMode(false);
    setFormError(null);
  };

  const handleOpenCreate = () => {
    setEditingDevice({
      id: "",
      code: "",
      name: "",
      deviceType: "infer",
      baseHashpower: 100,
      rentUsdt: 50,
      rentR1: 0,
      durationSeconds: null,
      durationDays: 30,
      isDemo: false,
      isActive: true,
      displayTier: "L1",
      displayOrder: 1,
      refHardwareName: "",
      refSpecDescription: "",
      marketPriceRange: "",
      suitableScenarios: "",
      apiScenarios: "",
      dailyAiTokenYield: 50000,
      yieldMultiplier: 1.0,
      purchaseLimit: 5,
      stockCount: 999,
      isFeatured: false,
      disclaimerText: "仅作为规格参考云实例，不交付实体物理硬件"
    });
    setIsCreateMode(true);
    setFormError(null);
  };

  const handleFormChange = (field: keyof AdminDeviceItem, value: any) => {
    if (!editingDevice) return;
    setEditingDevice(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;

    // Boundary checks and validation
    const { 
      id, code, name, rentUsdt, baseHashpower, durationDays, dailyAiTokenYield, 
      yieldMultiplier, purchaseLimit, stockCount, displayOrder 
    } = editingDevice;

    if (!id || !code || !name || rentUsdt === undefined || baseHashpower === undefined || durationDays === undefined || dailyAiTokenYield === undefined) {
      setFormError("请填写所有必需字段（ID, Code, 名称, 租金, 算力, 期限, 日产出）。");
      return;
    }

    if (rentUsdt < 0) return setFormError("租金 (rentUsdt) 必须 >= 0");
    if (baseHashpower < 0) return setFormError("算力 (baseHashpower) 必须 >= 0");
    if (durationDays < 0) return setFormError("租期天数 (durationDays) 必须 >= 0");
    if (dailyAiTokenYield < 0) return setFormError("日产出 (dailyAiTokenYield) 必须 >= 0");
    
    if (yieldMultiplier !== undefined && (yieldMultiplier < 0 || yieldMultiplier > 100)) {
      return setFormError("产出倍率 (yieldMultiplier) 必须在 0 到 100 之间");
    }
    if (purchaseLimit !== undefined && purchaseLimit < 0) return setFormError("购买限制必须 >= 0");
    if (stockCount !== undefined && stockCount < 0) return setFormError("库存数量必须 >= 0");
    if (displayOrder !== undefined && displayOrder < 0) return setFormError("排列顺序必须 >= 0");

    setSavingDevice(true);
    setFormError(null);

    try {
      if (isCreateMode) {
        await createAdminDevice(token, editingDevice);
        triggerNotification("创建成功", `云实例模板 ${name} 已创建。`, "success");
      } else {
        await updateAdminDevice(token, id, editingDevice);
        triggerNotification("保存成功", `云实例模板 ${name} 修改已保存。`, "success");
      }
      setEditingDevice(null);
      refreshDevices();
      loadEvents(token);
    } catch (err: any) {
      setFormError(err.message || "操作失败，请重试");
    } finally {
      setSavingDevice(false);
    }
  };

  const handleTriggerPublicCatalogRefresh = async () => {
    try {
      const res = await fetch("http://localhost:8787/api/devices/catalog");
      if (res.ok) {
        triggerNotification("刷新完成", "已成功刷新前台公开设备目录 API，数据状态已同步。", "success");
        refreshDevices();
      } else {
        triggerNotification("刷新失败", "更新公开 API 出错。", "error");
      }
    } catch (e: any) {
      triggerNotification("刷新失败", "无法连接到 Worker 目录接口。", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06080c]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10 bg-[#0d121c]/95 shadow-[0_12px_40px_rgba(0,0,0,0.8)] animate-bounce">
          {notification.type === "success" && <CheckCircle2 className="size-5 text-emerald-400" />}
          {notification.type === "error" && <AlertTriangle className="size-5 text-rose-500" />}
          {notification.type === "info" && <Database className="size-5 text-cyan-400" />}
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">{notification.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Main Admin Console Container */}
      <div className="w-full max-w-6xl bg-[#0b0e14] border border-white/10 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0e121a]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-6 text-[#22d3ee] drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">算力云实例管理后台</h2>
              <p className="text-xs text-slate-400 font-mono">Platform Admin Panel (Fail Closed)</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Authentication Overlay if not logged in */}
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto my-12 bg-[#0e121a] border border-white/5 rounded-xl p-6 shadow-lg space-y-5">
              <div className="flex flex-col items-center text-center space-y-2">
                <AlertOctagon className="size-12 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.3)] animate-pulse" />
                <h3 className="text-md font-bold text-white">输入管理员鉴权口令</h3>
                <p className="text-xs text-slate-400 max-w-[280px]">该控制台直接操作 D1 数据层，必须提供有效的环境变量 ADMIN_TOKEN 口令才可以访问。</p>
              </div>

              {authError && (
                <div className="flex gap-2.5 items-start p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs leading-relaxed">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin Token</label>
                  <div className="relative">
                    <input 
                      type={showToken ? "text" : "password"}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="输入以 Bearer 开头的 ADMIN_TOKEN"
                      className="w-full bg-[#141822] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-600 font-mono pr-10"
                    />
                    <button 
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                    >
                      {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-cyan-400 size-3.5 rounded bg-zinc-800 border-zinc-700"
                  />
                  <span className="text-xs text-slate-400">在此电脑上记住该 Token (localStorage)</span>
                </label>

                <button 
                  onClick={() => handleVerifyToken(token)}
                  disabled={checkingAuth || !token}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm shadow-[0_4px_12px_rgba(34,211,238,0.2)] disabled:opacity-50 transition-all flex justify-center items-center gap-2 cursor-pointer"
                >
                  {checkingAuth ? <RefreshCw className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                  {checkingAuth ? "校验中..." : "进行安全认证"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Authenticated Controls Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Auth status block */}
                <div className="bg-[#0e121a] border border-white/5 rounded-xl p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">认证令牌状态</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-mono text-emerald-400 font-bold">MODE: ACTIVE</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 mt-2 truncate">Token: Bearer {token.substring(0, 15)}...</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-500/20 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    清除 Token 并退出
                  </button>
                </div>

                {/* Global configs multiplier */}
                <div className="bg-[#0e121a] border border-white/5 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">全局收益乘数</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-500">GLOBAL_YIELD_MULTIPLIER (0 到 100)</label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <input 
                          type="number"
                          step="0.01"
                          value={globalYieldMultiplier}
                          onChange={(e) => setGlobalYieldMultiplier(parseFloat(e.target.value) || 0)}
                          className="bg-[#141822] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white font-mono w-24 focus:outline-none focus:border-cyan-400"
                        />
                        <span className="text-xs text-slate-400">x 基础产出</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleSaveConfig}
                      disabled={savingConfig}
                      className="w-full bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/20 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {savingConfig ? <RefreshCw className="size-3 animate-spin" /> : <Save className="size-3.5" />}
                      {savingConfig ? "更新中..." : "保存全局参数"}
                    </button>
                  </div>
                </div>

                {/* API manual catalog trigger */}
                <div className="bg-[#0e121a] border border-white/5 rounded-xl p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">前台 API 验证</h3>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      对后台设备的编辑会在 D1 中瞬间保存。您可在此主动调用前台 API 拉取新设备目录，验证最终计算结果。
                    </p>
                  </div>
                  <button 
                    onClick={handleTriggerPublicCatalogRefresh}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="size-3.5" />
                    验证 /api/devices/catalog
                  </button>
                </div>

              </div>

              {/* Editing Form Modal (Overlay Form) */}
              {editingDevice && (
                <div className="bg-[#0e121a] border border-white/10 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Sliders className="size-4 text-cyan-400" />
                      {isCreateMode ? "新建算力云实例模板" : `编辑模板: ${editingDevice.id}`}
                    </h3>
                    <button 
                      onClick={() => setEditingDevice(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {formError && (
                    <div className="flex gap-2 items-start p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs leading-normal">
                      <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveDevice} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Basic specs */}
                    <div className="space-y-3.5 bg-black/20 p-3.5 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-cyan-400 border-b border-white/5 pb-1">基础配置 (Core Specs)</h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">唯一 ID (不可修改)</label>
                          <input 
                            type="text"
                            required
                            disabled={!isCreateMode}
                            value={editingDevice.id || ""}
                            onChange={(e) => handleFormChange("id", e.target.value)}
                            placeholder="如 miner-l6"
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white disabled:opacity-50 focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">标识 Code</label>
                          <input 
                            type="text"
                            required
                            value={editingDevice.code || ""}
                            onChange={(e) => handleFormChange("code", e.target.value)}
                            placeholder="如 MINER_L6"
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">实例名称 (Name)</label>
                        <input 
                          type="text"
                          required
                          value={editingDevice.name || ""}
                          onChange={(e) => handleFormChange("name", e.target.value)}
                          placeholder="如 L6 超级集群云实例"
                          className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">实例分类</label>
                          <select
                            value={editingDevice.deviceType || "infer"}
                            onChange={(e) => handleFormChange("deviceType", e.target.value)}
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                          >
                            <option value="demo">Demo 体验</option>
                            <option value="infer">推理云实例 (infer)</option>
                            <option value="train">训练云实例 (train)</option>
                            <option value="cluster">算力集群 (cluster)</option>
                            <option value="genesis">创世节点 (genesis)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">展示阶梯 (L0-L5)</label>
                          <input 
                            type="text"
                            value={editingDevice.displayTier || ""}
                            onChange={(e) => handleFormChange("displayTier", e.target.value)}
                            placeholder="如 L1"
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">基础算力 (H/s)</label>
                          <input 
                            type="number"
                            required
                            value={editingDevice.baseHashpower !== undefined ? editingDevice.baseHashpower : ""}
                            onChange={(e) => handleFormChange("baseHashpower", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">排列顺序 (display_order)</label>
                          <input 
                            type="number"
                            value={editingDevice.displayOrder !== undefined ? editingDevice.displayOrder : 0}
                            onChange={(e) => handleFormChange("displayOrder", parseInt(e.target.value) || 0)}
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financial variables */}
                    <div className="space-y-3.5 bg-black/20 p-3.5 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-[#38bdf8] border-b border-white/5 pb-1">经济参数 (Financials)</h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">月租金 (USDT)</label>
                          <input 
                            type="number"
                            required
                            value={editingDevice.rentUsdt !== undefined ? editingDevice.rentUsdt : ""}
                            onChange={(e) => handleFormChange("rentUsdt", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">R1 租金</label>
                          <input 
                            type="number"
                            value={editingDevice.rentR1 !== undefined ? editingDevice.rentR1 : 0}
                            onChange={(e) => handleFormChange("rentR1", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">日收益基数 (AI Token)</label>
                          <input 
                            type="number"
                            required
                            value={editingDevice.dailyAiTokenYield !== undefined ? editingDevice.dailyAiTokenYield : ""}
                            onChange={(e) => handleFormChange("dailyAiTokenYield", parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">单卡收益倍数</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={editingDevice.yieldMultiplier !== undefined ? editingDevice.yieldMultiplier : 1.0}
                            onChange={(e) => handleFormChange("yieldMultiplier", parseFloat(e.target.value) || 1.0)}
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">租期 (天数)</label>
                          <input 
                            type="number"
                            required
                            value={editingDevice.durationDays !== undefined ? editingDevice.durationDays : ""}
                            onChange={(e) => handleFormChange("durationDays", parseInt(e.target.value) || 0)}
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">租期 (秒，可为空)</label>
                          <input 
                            type="number"
                            value={editingDevice.durationSeconds || ""}
                            onChange={(e) => handleFormChange("durationSeconds", parseInt(e.target.value) || null)}
                            placeholder="留空"
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">限购限制</label>
                          <input 
                            type="number"
                            value={editingDevice.purchaseLimit !== undefined ? editingDevice.purchaseLimit : 5}
                            onChange={(e) => handleFormChange("purchaseLimit", parseInt(e.target.value) || 0)}
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">库存数量</label>
                          <input 
                            type="number"
                            value={editingDevice.stockCount !== undefined ? editingDevice.stockCount : 999}
                            onChange={(e) => handleFormChange("stockCount", parseInt(e.target.value) || 0)}
                            className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hardware specs & parameters */}
                    <div className="space-y-3.5 bg-black/20 p-3.5 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold text-[#c084fc] border-b border-white/5 pb-1">硬件规格与文案 (Display Meta)</h4>
                      
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">物理参考硬件名称</label>
                        <input 
                          type="text"
                          value={editingDevice.refHardwareName || ""}
                          onChange={(e) => handleFormChange("refHardwareName", e.target.value)}
                          placeholder="如 Moore Threads MTT S80"
                          className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">物理配置描述</label>
                        <input 
                          type="text"
                          value={editingDevice.refSpecDescription || ""}
                          onChange={(e) => handleFormChange("refSpecDescription", e.target.value)}
                          placeholder="显存/主频等物理指标细节"
                          className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">参考市场售价区间</label>
                        <input 
                          type="text"
                          value={editingDevice.marketPriceRange || ""}
                          onChange={(e) => handleFormChange("marketPriceRange", e.target.value)}
                          placeholder="如 渠道大客户询价"
                          className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer mt-2.5 select-none">
                          <input 
                            type="checkbox"
                            checked={!!editingDevice.isDemo}
                            onChange={(e) => handleFormChange("isDemo", e.target.checked)}
                            className="accent-cyan-400 size-3.5 bg-zinc-800"
                          />
                          <span className="text-xs text-slate-300">是体验机 (isDemo)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer mt-2.5 select-none">
                          <input 
                            type="checkbox"
                            checked={!!editingDevice.isFeatured}
                            onChange={(e) => handleFormChange("isFeatured", e.target.checked)}
                            className="accent-cyan-400 size-3.5 bg-zinc-800"
                          />
                          <span className="text-xs text-slate-300">推荐产品 (isFeatured)</span>
                        </label>
                      </div>

                      <label className="flex items-center gap-1.5 cursor-pointer mt-1 select-none">
                        <input 
                          type="checkbox"
                          checked={!!editingDevice.isActive}
                          onChange={(e) => handleFormChange("isActive", e.target.checked)}
                          className="accent-cyan-400 size-3.5 bg-zinc-800"
                        />
                        <span className="text-xs text-slate-300">上架状态 (isActive)</span>
                      </label>
                    </div>

                    {/* Textareas row */}
                    <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">适合场景 / 适用业务 (suitableScenarios)</label>
                        <textarea 
                          rows={2}
                          value={editingDevice.suitableScenarios || ""}
                          onChange={(e) => handleFormChange("suitableScenarios", e.target.value)}
                          placeholder="说明该规格在测试系统中的角色定位"
                          className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">API 支持模型场景 (apiScenarios)</label>
                        <textarea 
                          rows={2}
                          value={editingDevice.apiScenarios || ""}
                          onChange={(e) => handleFormChange("apiScenarios", e.target.value)}
                          placeholder="推荐对接使用的虚拟模型范围"
                          className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">底栏合规及免责说明 (disclaimerText)</label>
                      <input 
                        type="text"
                        value={editingDevice.disclaimerText || ""}
                        onChange={(e) => handleFormChange("disclaimerText", e.target.value)}
                        placeholder="如 仅作为规格参考云实例，不交付实体物理硬件"
                        className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 flex justify-end gap-3 pt-2.5 border-t border-white/5">
                      <button 
                        type="button"
                        onClick={() => setEditingDevice(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        取消
                      </button>
                      <button 
                        type="submit"
                        disabled={savingDevice}
                        className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {savingDevice ? <RefreshCw className="size-3 animate-spin" /> : <Check className="size-3.5" />}
                        {savingDevice ? "正在保存..." : "提交保存"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Devices templates table / catalog list */}
              <div className="bg-[#0e121a] border border-white/5 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/10">
                  <div className="flex items-center gap-2">
                    <Database className="size-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">平台可用设备列表 (D1 Table)</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={refreshDevices}
                      disabled={loadingDevices}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                      title="刷新设备列表"
                    >
                      <RefreshCw className={`size-3.5 ${loadingDevices ? "animate-spin" : ""}`} />
                    </button>
                    <button 
                      onClick={handleOpenCreate}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="size-3.5 stroke-[3px]" />
                      新建设备
                    </button>
                  </div>
                </div>

                {deviceError ? (
                  <div className="p-6 text-center text-xs text-rose-400 bg-rose-500/5">
                    {deviceError}
                  </div>
                ) : devices.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-500 font-mono">
                    {loadingDevices ? "读取 D1 数据层..." : "空设备表 (请执行 Catalog 请求来触发默认 Seed)"}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-black/20 text-slate-400 font-semibold">
                          <th className="px-4 py-3">ID / Code</th>
                          <th className="px-4 py-3">展示名称</th>
                          <th className="px-4 py-3">参考物理硬件 (参考价)</th>
                          <th className="px-4 py-3 text-right">算力</th>
                          <th className="px-4 py-3 text-right">月租金</th>
                          <th className="px-4 py-3 text-right">日收益 (AI Token)</th>
                          <th className="px-4 py-3 text-center">状态</th>
                          <th className="px-4 py-3 text-center">编辑操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {devices.map((device) => (
                          <tr key={device.id} className={`hover:bg-white/5 transition-colors ${!device.isActive ? "opacity-55" : ""}`}>
                            <td className="px-4 py-3 font-mono">
                              <div className="text-white font-bold">{device.id}</div>
                              <div className="text-[10px] text-slate-500">{device.code}</div>
                            </td>
                            <td className="px-4 py-3 font-bold">
                              <div>{device.name}</div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">{device.deviceType}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-slate-300 font-semibold">{device.refHardwareName || "-"}</div>
                              <div className="text-[10px] text-slate-500">{device.marketPriceRange || "无公开参考价"}</div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-cyan-400">{device.baseHashpower} H/s</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-white">{device.rentUsdt} U / {device.durationDays}天</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                              <div>{device.dailyAiTokenYield}</div>
                              {device.yieldMultiplier && device.yieldMultiplier !== 1 && (
                                <div className="text-[9px] text-slate-500">x{device.yieldMultiplier}</div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => handleToggleStatus(device.id, device.isActive)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                  device.isActive 
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                    : "bg-zinc-800 border-zinc-700 text-zinc-500"
                                }`}
                              >
                                {device.isActive ? "已上架" : "已下架"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button 
                                onClick={() => handleOpenEdit(device)}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors inline-flex cursor-pointer"
                              >
                                <Edit2 className="size-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Admin events logging */}
              <div className="bg-[#0e121a] border border-white/5 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/10">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">管理员操作审计日志 (D1 System Events)</h3>
                  </div>
                  <button 
                    onClick={() => loadEvents(token)}
                    disabled={loadingEvents}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`size-3.5 ${loadingEvents ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <div className="p-4 max-h-56 overflow-y-auto space-y-2">
                  {events.length === 0 ? (
                    <div className="text-center text-xs text-slate-500 font-mono py-8">
                      {loadingEvents ? "读取审计日志中..." : "暂无管理员操作日志"}
                    </div>
                  ) : (
                    events.map((evt) => {
                      let parsedPayload: any = {};
                      try {
                        parsedPayload = JSON.parse(evt.payload_json);
                      } catch(e) {}
                      
                      return (
                        <div key={evt.id} className="bg-black/25 p-3 rounded-lg border border-white/5 font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-slate-400 uppercase font-bold">{evt.event_type}</span>
                              <span className="text-slate-300 font-bold">Target ID: {parsedPayload.target_id || "-"}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Action: {parsedPayload.action} | Target Type: {parsedPayload.target_type}
                            </div>
                            {parsedPayload.after_json && (
                              <div className="text-[9px] text-slate-400 mt-1 bg-black/45 p-1 rounded max-w-full overflow-x-auto truncate">
                                Changes: {JSON.stringify(parsedPayload.after_json)}
                              </div>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 self-start md:self-auto shrink-0">
                            <Calendar className="size-3" />
                            {new Date(evt.created_at).toLocaleString()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </>
          )}

        </div>

      </div>
    </div>
  );
};
