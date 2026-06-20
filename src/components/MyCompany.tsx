import React, { useState, useMemo } from "react";
import { UserStats, ActiveMiner, MiningRecord, UserLevel } from "../types";
import { MOCK_REFERRALS } from "../utils/storage";
import { loadIssuedTokens } from "../utils/issuedTokens";
import { 
  Award, Key, Copy, Check, Users, History, Cpu, Droplet, Sparkles, Plus, Layers, Lock, Settings, BatteryCharging, TrendingUp, Zap, Download, BarChart3,
  Coins, RefreshCw, AlertTriangle, ShieldCheck, X, Building, Briefcase, Calculator, LineChart, Network, Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResonanceTower } from "./ResonanceTower";
import { ItemStore } from "./ItemStore";
import { UserResponse, AssetsResponse, DeviceOrder } from "../api/types";
import { AdminPanel } from "./AdminPanel";

interface MyCompanyProps {
  stats: UserStats;
  activeMiners: ActiveMiner[];
  records: MiningRecord[];
  usdtBalance: number;
  onSynthesize: () => void;
  onBuyCoolant: (costInFragments: number) => void;
  onApplyCoolant: (minerId: string) => void;
  onClaimDemoMiner: () => void;
  onUpdateSimulatedStats?: (updater: (prev: UserStats) => UserStats) => void;
  onForceAgeMiner?: () => void;
  onRedeemItem?: (item: any) => void;
  onResetDemoData: () => void;

  // Backend connection props
  backendConnected: boolean;
  backendUser: UserResponse | null;
  backendAssets: AssetsResponse | null;
  backendDevices: DeviceOrder[];
  backendError: string | null;
  backendLoading: boolean;
  onConnectBackend: (referrerCode?: string) => Promise<void>;
  onRefreshBackend: () => Promise<void>;
  onDisconnectBackend: () => void;
  onClearBackendError: () => void;
}

export const MyCompany: React.FC<MyCompanyProps> = ({
  stats,
  activeMiners,
  records,
  usdtBalance,
  onBuyCoolant,
  onApplyCoolant,
  onClaimDemoMiner,
  onUpdateSimulatedStats,
  onForceAgeMiner,
  onRedeemItem,
  onResetDemoData,

  // Backend connection props
  backendConnected,
  backendUser,
  backendAssets,
  backendDevices,
  backendError,
  backendLoading,
  onConnectBackend,
  onRefreshBackend,
  onDisconnectBackend,
  onClearBackendError
}) => {
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedRLink, setCopiedRLink] = useState(false);
  const [subTab, setSubTab] = useState<"assets" | "logs" | "team" | "services" | "settings">("assets");

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPhase, setExportPhase] = useState<"idle" | "pairing" | "checking" | "broadcasting" | "solidifying" | "ready">("ready");
  const [copiedExport, setCopiedExport] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [companyName, setCompanyName] = useState<string>("我的 1 人算力公司");
  const [isEditingName, setIsEditingName] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const userIssuedTokens = useMemo(() => {
    return loadIssuedTokens();
  }, [subTab]);

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(stats.inviteCode);
    } catch {}
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `https://hashcube.io/join?ref=${stats.inviteCode}`;
    try {
      navigator.clipboard.writeText(link);
    } catch {}
    setCopiedRLink(true);
    setTimeout(() => setCopiedRLink(false), 2000);
  };

  const handleOpenExport = () => {
    setShowExportModal(true);
    setExportPhase("pairing");
    
    setTimeout(() => {
      setExportPhase("checking");
    }, 600);
    setTimeout(() => {
      setExportPhase("broadcasting");
    }, 1200);
    setTimeout(() => {
      setExportPhase("solidifying");
    }, 1800);
    setTimeout(() => {
      setExportPhase("ready");
    }, 2400);
  };

  const getSimulated30DaysText = () => {
    let text = "日期,事件类型,AI Token产出,运行设备,记录签名\n";
    const nowTime = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(nowTime.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().substring(0, 10);
      const baseVal = (stats.baseHashpower * 12.96 + stats.teamHashpower * 4.32);
      const dayVal = parseFloat((baseVal * (1 + (Math.sin(i) * 0.15))).toFixed(4));
      const sigHash = Math.abs(Math.sin(i)).toString(16).substring(2, 10).toUpperCase();
      text += `${dateStr},设备在线日结,${dayVal > 0 ? dayVal : 13.5},DEVICE-${1000 + i},SIG-0X${sigHash}\n`;
    }
    return text;
  };

  const handleCopyExportText = () => {
    const csv = getSimulated30DaysText();
    try {
      navigator.clipboard.writeText(csv);
    } catch {}
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    } catch {
      return isoStr;
    }
  };

  const directDownlines = MOCK_REFERRALS.filter(ref => ref.depth === 1);

  // 1. 公司发展阶段划分 (根据总算力计算)
  const totalHashpower = stats.baseHashpower + stats.teamHashpower;
  const companyStage = useMemo(() => {
    if (totalHashpower < 100) return { title: "个体矿工阶段", icon: "⛏️", badge: "个体工商业户" };
    if (totalHashpower < 500) return { title: "1人公司阶段", icon: "🏢", badge: "初创AI微企" };
    if (totalHashpower < 2000) return { title: "小型 AI 工作室", icon: "💻", badge: "合伙人工作室" };
    if (totalHashpower < 10000) return { title: "AI 云算力服务商", icon: "🛰️", badge: "算力运营商" };
    return { title: "AI 算力集团", icon: "🌌", badge: "跨国科技巨头" };
  }, [totalHashpower]);

  // 2. 模拟公司估值折算公式 (纯系统模拟，非真实金融资产估值)
  const totalCapex = activeMiners.reduce((s, m) => s + m.cost, 0);
  const companyGrossProfit = stats.accumulatedFragments * 0.001 * 1.5; // AI Token 产出折算
  const crystalValuation = stats.hashCrystals * 10.0;
  const simulatedValuation = useMemo(() => {
    // 估值 = (算力投入资本 + 累计代币产出值 + 凭证估值 + USDT/R1折算) * 溢价倍率
    const baseAssets = totalCapex + companyGrossProfit + crystalValuation + usdtBalance + stats.r1Balance * 0.05;
    const premiumFactor = totalHashpower > 1000 ? 1.8 : totalHashpower > 200 ? 1.5 : 1.2;
    return baseAssets * premiumFactor;
  }, [totalCapex, companyGrossProfit, crystalValuation, usdtBalance, stats.r1Balance, totalHashpower]);

  // 3. 模拟日收入及产销预估
  const simulatedDailyIncome = totalHashpower * 0.0015 * 1.25; // 模拟日收入 USDT
  const simulatedDailyExpense = activeMiners.filter(m => m.status === "running").length * 0.5; // 模拟维护电费损耗折旧
  const simulatedNetProfit = Math.max(0, simulatedDailyIncome - simulatedDailyExpense);
  const simulatedProfitMargin = simulatedDailyIncome > 0 ? (simulatedNetProfit / simulatedDailyIncome) * 100 : 0;

  const maxSlots = 8;
  const occupiedSlots = activeMiners.filter(m => m.status !== "stopped").length;
  const idleSlots = Math.max(0, maxSlots - occupiedSlots);
  const onlineRate = occupiedSlots > 0 ? Math.round((activeMiners.filter(m => m.status === "running").length / occupiedSlots) * 100) : 0;

  const getRecordTagStyle = (type: MiningRecord["type"]) => {
    switch (type) {
      case "mining": return "bg-green-950/80 text-green-400 border-green-500/20";
      case "resonance": return "bg-blue-950/80 text-cyan-400 border-cyan-500/20";
      case "synthesize": return "bg-yellow-950/80 text-yellow-400 border-yellow-500/20";
      case "coolant": return "bg-cyan-950/80 text-cyan-400 border-cyan-500/20";
      case "exchange": return "bg-red-950/80 text-red-400 border-red-500/20";
      case "buff": return "bg-pink-950/80 text-pink-400 border-pink-500/20";
      case "trade": return "bg-purple-950/80 text-purple-400 border-purple-500/20";
      default: return "bg-white/5 text-slate-400 border-white/10";
    }
  };

  const getRecordTagName = (type: MiningRecord["type"]) => {
    switch(type) {
      case "mining": return "AI Token 产出";
      case "resonance": return "团队加权";
      case "synthesize": return "凭证生成";
      case "coolant": return "设备维护";
      case "exchange": return "商场兑换";
      case "buff": return "能效跃迁";
      case "trade": return "市场交易";
      default: return "账本日志";
    }
  };

  const getMinerStatusStyle = (status: ActiveMiner["status"]) => {
    switch(status) {
      case "running": return "bg-green-950/80 border-green-500/20 text-green-400";
      case "decayed": return "bg-amber-950/80 border-amber-500/30 text-amber-400 animate-pulse";
      case "stopped": return "bg-red-950 border-red-800 text-red-400";
    }
  };

  const getMinerStatusName = (status: ActiveMiner["status"]) => {
    switch(status) {
      case "running": return "正常运转";
      case "decayed": return "降频降温中";
      case "stopped": return "已到期断开";
    }
  };

  return (
    <div className="space-y-6">

      {/* 👑 公司抬头与阶段概览 (经营驾驶舱) */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0b0c16] to-slate-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <Building className="text-cyan-400 size-5 icon-glow-cyan" />
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                    className="bg-black/50 border border-cyan-500/30 rounded px-2 py-0.5 text-lg font-bold text-white focus:outline-none focus:border-cyan-400 font-sans"
                    autoFocus
                  />
                  <button onClick={() => setIsEditingName(false)} className="text-xs text-cyan-400 font-bold hover:underline cursor-pointer">保存</button>
                </div>
              ) : (
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-1.5 font-sans">
                  {companyName}
                  <span onClick={() => setIsEditingName(true)} className="text-[10px] text-slate-500 font-normal hover:text-cyan-400 cursor-pointer ml-2">✏️ 修改名称</span>
                </h2>
              )}
            </div>
            <p className="text-xs text-slate-400 font-sans">
              1人算力公司经营驾驶舱。管理您的云算力实例资产、调度模拟财务状态与 API 请求。
            </p>
            <div className="flex flex-wrap gap-2 pt-2.5">
              <span className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-[#22d3ee] font-black text-[10px] px-3.5 py-1 rounded-xl uppercase tracking-wider">
                阶段: {companyStage.icon} {companyStage.title}
              </span>
              <span className="inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 font-bold text-[10px] px-3.5 py-1 rounded-xl">
                评级: {stats.level}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-slate-400 text-[10px] px-3.5 py-1 rounded-xl">
                主权身份: R1-FOUNDER-0001
              </span>
            </div>
          </div>

          {/* 模拟估值 */}
          <div className="bg-black/45 border border-white/5 p-4.5 rounded-2xl shrink-0 flex items-center gap-4.5 justify-between md:justify-start min-w-[200px] font-mono">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 block uppercase tracking-widest font-black flex items-center gap-1">
                <Calculator className="size-3 text-slate-500" />
                模拟估算公司估值 (USDT)
              </span>
              <span className="text-xl font-black text-cyan-400 text-glow-cyan">
                ${simulatedValuation.toFixed(2)}
              </span>
              <span className="text-[8.5px] text-slate-500 block">注: 系统模拟折算，不代表实体资产价值</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab navigation bar */}
      <div className="grid grid-cols-5 bg-slate-900/60 border border-white/10 rounded-2xl p-1 gap-1 mb-6">
        {[
          { id: "assets", label: "经营舱", icon: Coins, color: "text-cyan-400 hover:text-cyan-300" },
          { id: "logs", label: "账本日志", icon: History, color: "text-emerald-400 hover:text-emerald-300" },
          { id: "team", label: "子公司/网络", icon: Users, color: "text-blue-400 hover:text-blue-300" },
          { id: "services", label: "公司服务", icon: Key, color: "text-purple-400 hover:text-purple-300" },
          { id: "settings", label: "系统设置", icon: Settings, color: "text-slate-400 hover:text-slate-300" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer min-h-[44px] ${
                isActive
                  ? "bg-white/5 border border-white/10 text-white shadow-inner font-extrabold"
                  : "text-slate-400 hover:bg-white/[0.02]"
              }`}
            >
              <Icon className={`size-4 ${isActive ? tab.color.split(" ")[0] : ""}`} />
              <span className="text-[10px] sm:text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {subTab === "assets" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Grid 1: 模拟经营损益表 (P&L Card) */}
          <div className="bg-gradient-to-br from-[#0c0f24] to-[#04060f] border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.02] rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center border-b border-white/5 pb-5">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                  <LineChart className="size-4 text-cyan-400" />
                  模拟经营损益分析 (Simulated Profit & Loss)
                </h3>
                <p className="text-[10px] text-slate-400 leading-normal">
                  根据全局产出系数和本地/后端并网设备计算的**公司模拟每日折算盈亏**（非真实投资理财承诺）。
                </p>
              </div>

              <div className="flex flex-wrap gap-4 p-3 bg-black/40 border border-white/5 rounded-2xl text-xs font-mono shrink-0">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-bold">模拟日净利润</span>
                  <span className="text-sm font-black text-emerald-400">
                    +${simulatedNetProfit.toFixed(2)} USDT/天
                  </span>
                </div>
                <div className="w-[1px] bg-white/10" />
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-bold">模拟利润率</span>
                  <span className="text-sm font-black text-cyan-400">
                    {simulatedProfitMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1 font-mono">
                <span className="text-[9px] uppercase text-slate-500 font-bold block">模拟日收入</span>
                <div className="text-green-400 font-black text-base">${simulatedDailyIncome.toFixed(2)} USDT</div>
                <p className="text-[8.5px] text-slate-500 leading-normal font-sans">
                  基于总算力产出 AI Token 额度之系统模拟结算对价。
                </p>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1 font-mono">
                <span className="text-[9px] uppercase text-slate-500 font-bold block">模拟日支出 (折旧)</span>
                <div className="text-red-400 font-black text-base">-${simulatedDailyExpense.toFixed(2)} USDT</div>
                <p className="text-[8.5px] text-slate-500 leading-normal font-sans">
                  设备模拟日常运转损耗与虚拟并网冷却液维护等分摊。
                </p>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1 font-mono">
                <span className="text-[9px] uppercase text-slate-500 font-bold block">模拟累计折旧</span>
                <div className="text-slate-300 font-black text-base">${(totalCapex * 0.15).toFixed(2)} USDT</div>
                <p className="text-[8.5px] text-slate-500 leading-normal font-sans">
                  所部署规格参考云实例折旧成本模拟计提。
                </p>
              </div>
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1 font-mono">
                <span className="text-[9px] uppercase text-slate-500 font-bold block">API 模拟消耗支出</span>
                <div className="text-amber-400 font-black text-base">${(stats.totalSynthesized * 1.2).toFixed(2)} USDT</div>
                <p className="text-[8.5px] text-slate-500 leading-normal font-sans">
                  用户生成 API 凭证折合的未来模型 API 调用成本估算。
                </p>
              </div>
            </div>
          </div>

          {/* Grid 2: 公司核心资产包与 Sandbox 资产 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* AI Token */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">AI Token 产能储备</span>
                <Cpu className="size-4 text-cyan-400" />
              </div>
              <div className="text-base sm:text-lg font-mono font-black text-cyan-400 text-glow-cyan flex items-baseline gap-1">
                {stats.hashFragments.toFixed(4)}
                <span className="text-[9px] font-normal text-slate-500">AI</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">云实例与API产出模拟额度</p>
            </div>

            {/* R1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">R1 影子代币权益</span>
                <Coins className="size-4 text-amber-400" />
              </div>
              <div className="text-base sm:text-lg font-mono font-black text-amber-400 text-glow-gold flex items-baseline gap-1">
                {(stats.r1Balance || 0).toFixed(2)}
                <span className="text-[9px] font-normal text-slate-500">R1</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">平台权益配额与锁仓凭证</p>
            </div>

            {/* USDT */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">模拟现金流 (USDT)</span>
                <Coins className="size-4 text-emerald-400" />
              </div>
              <div className="text-base sm:text-lg font-mono font-black text-emerald-400 text-glow-emerald flex items-baseline gap-1">
                {usdtBalance.toFixed(2)}
                <span className="text-[9px] font-normal text-slate-500">USDT</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">平台模拟充值与交易对价金</p>
            </div>

            {/* Company Issued Token */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">公司代币 (Issued)</span>
                <Layers className="size-4 text-purple-400" />
              </div>
              <div className="text-base sm:text-lg font-mono font-black text-purple-400 text-glow-purple flex items-baseline gap-1">
                {userIssuedTokens.length}
                <span className="text-[9px] font-normal text-slate-500">个</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1">自主发行且锁仓共建代币</p>
            </div>
          </div>

          {/* Grid 3: 运营监控看板 (Chassis Loads & Operational Telemetry) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Dashboard Capacity Loads */}
            <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0 border border-white/10 rounded-full bg-black/40">
                    <Cpu className="size-6 text-cyan-400" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      云实例插槽负载 (Chassis slots load)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      系统最多为您的 1 人公司分配 <b>{maxSlots}</b> 个本地 Sandbox 虚拟算力槽位。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-black/30 border border-white/5 p-2 rounded-xl text-[10px] font-mono">
                  <div>已用卡槽: <span className="text-white font-bold">{occupiedSlots}/{maxSlots}</span></div>
                  <div>空闲卡槽: <span className="text-slate-500 font-bold">{idleSlots}</span></div>
                  <div>设备在线率: <span className="text-green-400 font-bold">{onlineRate}%</span></div>
                  <div>运行中实例: <span className="text-green-400 font-bold">{activeMiners.filter(m => m.status === "running").length} 台</span></div>
                </div>
              </div>

              {/* Sandbox Miner list */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="size-4 text-cyan-400 animate-pulse" />
                  本地 Sandbox 模拟设备列表 ({activeMiners.length})
                </h4>

                {activeMiners.length === 0 ? (
                  <div className="text-center py-8 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                    <Cpu className="size-8 text-slate-600 mx-auto animate-pulse" />
                    <p className="text-xs font-bold text-slate-400">本地 Sandbox 尚无运行实例</p>
                    <p className="text-[9.5px] text-slate-500">请先前往“云算力实例市场”选择硬件参考规格进行租赁部署。</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {activeMiners.map((miner) => (
                      <div key={miner.id} className="p-4 rounded-xl bg-black/25 border border-white/5 flex flex-col justify-between gap-3 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-lg bg-black/40 border border-white/5 text-cyan-400"><Cpu className="size-3.5" /></span>
                            <span className="font-bold text-white text-[11px]">{miner.name}</span>
                            <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full border ${getMinerStatusStyle(miner.status)}`}>
                              {getMinerStatusName(miner.status)}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-500">截止效期: {formatDate(miner.expiresAt)}</span>
                        </div>

                        <div className="flex items-center justify-between bg-black/35 rounded-lg p-2 text-[10px] font-mono text-slate-400 border border-white/5">
                          <span>租赁成本: <b className="text-white">${miner.cost} U</b></span>
                          <span>核心温度状态: <b className="text-cyan-400">{(miner.efficiency * 100).toFixed(0)}%</b></span>
                          {miner.status === "decayed" ? (
                            <button
                              onClick={() => onApplyCoolant(miner.id)}
                              className="bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded text-[9px] hover:brightness-110 active:scale-95 cursor-pointer"
                            >
                              加注维护液
                            </button>
                          ) : (
                            <span className="text-slate-500">运行正常</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sub-tab 2: Operations Monitor */}
            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.02] rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Network className="size-4 text-cyan-400" />
                  公司日均运营指标
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  监控您的算力公司每日模拟吞吐明细及冷却储备。
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="bg-black/35 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">今日产出 AI Token</span>
                      <span className="text-sm font-extrabold text-cyan-400">{(totalHashpower * 12.96).toFixed(1)} AI</span>
                    </div>
                  </div>
                  <div className="bg-black/35 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">已生成 API 凭证</span>
                      <span className="text-sm font-extrabold text-yellow-400">{stats.hashCrystals} 组</span>
                    </div>
                  </div>
                  <div className="bg-black/35 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">温控维护液储备</span>
                      <span className="text-sm font-extrabold text-cyan-400">{stats.coolantCount} 罐</span>
                    </div>
                    <button
                      onClick={() => onBuyCoolant(50)}
                      disabled={stats.hashFragments < 50}
                      className="px-2.5 py-1 text-[10px] font-bold rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      购买 (+1)
                    </button>
                  </div>
                </div>
              </div>

              {/* Free Trial Claim Box inside cockpit */}
              {!stats.hasClaimedDemo && (
                <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-2">
                  <div className="text-[10px] text-cyan-300 font-bold">💡 发现可用空网节点</div>
                  <p className="text-[9.5px] text-slate-400 leading-normal">
                    激活 3 分钟免费手机共享算力模拟，测试 Token 产出记账。
                  </p>
                  <button
                    onClick={onClaimDemoMiner}
                    className="w-full py-1.5 bg-gradient-to-r from-cyan-400 to-indigo-600 text-slate-950 font-black text-[10px] rounded hover:brightness-110 active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    立刻空投体验
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Invitation code shared panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="size-4 text-cyan-400" />
              公司合伙人扩张信标 (生态网络邀请)
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-2xl leading-relaxed">
              招募新节点加入您的算力网络。直推合伙人接入设备后，系统将为您累加相应的<b>团队加权模拟算力</b>。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/40 border border-white/5 px-4 py-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase font-mono tracking-wider font-bold">公司邀请码 (INVITATION KEY)</span>
                  <span className="text-xs font-mono font-extrabold text-white select-all">{stats.inviteCode}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer active:scale-95"
                >
                  {copiedInvite ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
                </button>
              </div>
              <div className="bg-black/40 border border-white/5 px-4 py-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[8px] text-slate-500 block uppercase font-mono tracking-wider font-bold">共享链接 (SECURE LINK)</span>
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px] block select-all">
                    https://hashcube.io/join?ref={stats.inviteCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer active:scale-95"
                >
                  {copiedRLink ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {subTab === "logs" && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest flex items-center gap-2">
              <History className="text-[#10b981] size-4" />
              公司账本哈希日志流水 (Founder Capital Ledger)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenExport}
                className="px-2.5 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold rounded-lg cursor-pointer transition-all active:scale-95 whitespace-nowrap flex items-center gap-1"
              >
                <TrendingUp className="size-3 text-cyan-400" />
                <span>导出30天明细</span>
              </button>
              <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">
                SIMULATED LOG
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {records.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 font-sans font-medium">
                暂无模拟算力生成流水明细
              </div>
            ) : (
              records.slice(0, 10).map((rec) => {
                const amountSign = (rec.type === "exchange" || rec.type === "synthesize" || (rec.type === "trade" && rec.description.includes("卖出"))) ? "-" : "+";
                const amountColor = amountSign === "+" ? "text-green-400" : "text-amber-500";
                
                return (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-black/20 border border-white/[0.04] flex items-center justify-between text-xs transition-colors hover:bg-black/35"
                  >
                    <div className="space-y-1 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase ${getRecordTagStyle(rec.type)}`}>
                          {getRecordTagName(rec.type)}
                        </span>
                        <span className="text-slate-300 font-semibold leading-none block">{rec.description}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block font-mono font-medium">{formatDate(rec.timestamp)}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-extrabold ${amountColor}`}>
                        {amountSign}{rec.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {subTab === "team" && (
        <div className="border border-white/10 bg-slate-950/25 p-6 rounded-2xl animate-fade-in">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <Users className="size-4 text-cyan-400" />
              子公司与合伙网络 (Resonance network)
            </h3>
            <p className="text-xs text-slate-400">系统将合伙子公司成员的基础算力按照系数累计计入您的公司加权算力。</p>
          </div>
          <ResonanceTower stats={stats} />
        </div>
      )}

      {subTab === "services" && (
        <div className="border border-white/10 bg-slate-950/25 p-6 rounded-2xl animate-fade-in">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <Key className="size-4 text-purple-400" />
              公司增值资产服务 (Corporate store)
            </h3>
            <p className="text-xs text-slate-400">使用产出的虚拟 AI Token 兑换 API 包、冷却维护液或扩张卡槽名额。</p>
          </div>
          <ItemStore stats={stats} onRedeemItem={onRedeemItem || (() => {})} onBuyCoolant={onBuyCoolant} />
        </div>
      )}

      {subTab === "settings" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* 后端测试账本连接 */}
          <div className="bg-gradient-to-br from-[#0e0a1a] to-[#06040d] border border-violet-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/[0.03] rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-3">
              <span className="cyber-icon-wrapper p-1.5 text-violet-400 border-violet-500/20">
                <RefreshCw className="size-4 animate-spin icon-glow-purple" style={{ animationDuration: backendLoading ? "2s" : "0s" }} />
              </span>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#a78bfa]">
                后端测试账本同步连接 (Backend Connection)
              </h3>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
              连接本地 D1 Worker 后端测试账本，拉取实时的后端云实例状态以及扣款数据快照。
            </p>

            <div className="space-y-3.5 mb-5">
              {!backendConnected ? (
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600 animate-pulse" />
                    本地 Sandbox 环境运行正常，后端账本未连接
                  </div>
                  <p className="text-[10px] text-slate-500">
                    当前处于独立 Sandbox 演示模式。所购买实例及 Token 生成均在本地浏览器缓存保存。
                  </p>
                </div>
              ) : (
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      后端测试账本已连接
                    </div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded">
                      CONNECTED
                    </span>
                  </div>

                  {backendUser && (
                    <div className="space-y-1 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span className="text-slate-500">USER ID:</span>
                        <span className="text-slate-200 select-all">{backendUser.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">INVITE CODE:</span>
                        <span className="text-slate-200">{backendUser.inviteCode}</span>
                      </div>
                    </div>
                  )}

                  {backendAssets && (
                    <div className="border-t border-white/5 pt-2 space-y-1.5 font-mono">
                      <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">后端账本资产只读快照 (ReadOnly Snapshots)</span>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-slate-900/40 p-2 rounded border border-white/5 flex justify-between">
                          <span className="text-slate-500 font-sans">USDT:</span>
                          <span className="text-white font-bold">${backendAssets.usdt.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-white/5 flex justify-between">
                          <span className="text-slate-500 font-sans">R1:</span>
                          <span className="text-white font-bold">{backendAssets.r1.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-white/5 flex justify-between col-span-2">
                          <span className="text-slate-500 font-sans">AI Token:</span>
                          <span className="text-white font-bold">{backendAssets.aiToken.toFixed(4)} AI</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 后端活跃设备 (Active Devices) */}
                  <div className="border-t border-white/5 pt-2 space-y-1.5 font-mono">
                    <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">后端活跃云实例状态快照</span>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 space-y-2 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">后端租赁实例数量:</span>
                        <span className="text-white font-bold">{backendDevices.length} 台</span>
                      </div>

                      {/* Check if demo node is active */}
                      {(() => {
                        const demoOrder = backendDevices.find(d => d.orderType === "DEMO" && d.status === "ACTIVE");
                        if (demoOrder) {
                          const expiresAtMs = new Date(demoOrder.expiresAt).getTime();
                          const nowMs = Date.now();
                          const isExpired = expiresAtMs <= nowMs;
                          return (
                            <div className="border-t border-white/5 pt-2 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-sans">3分钟体验节点:</span>
                                <span className={isExpired ? "text-red-400 font-bold" : "text-green-400 font-bold animate-pulse"}>
                                  {isExpired ? "已过期满断电" : "已激活正常并网"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">到期时间:</span>
                                <span className="text-slate-300 text-[9px]">
                                  {new Date(demoOrder.expiresAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="border-t border-white/5 pt-2 flex justify-between">
                              <span className="text-slate-500 font-sans">3分钟体验节点:</span>
                              <span className="text-slate-500">未激活</span>
                            </div>
                          );
                        }
                      })()}
                    </div>
                    <div className="bg-violet-950/20 border border-violet-500/20 text-violet-400 p-2 rounded-xl text-[10px] leading-relaxed font-sans mt-2">
                      ⚠️ 只读后端测试设备状态，不影响本地 Sandbox 运行的矿机。
                    </div>
                  </div>
                </div>
              )}

              {backendError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-2xl flex flex-col gap-2 relative font-sans">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span className="font-semibold">{backendError}</span>
                  </div>
                  <button 
                    onClick={onClearBackendError}
                    className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {!backendConnected ? (
                <button
                  onClick={() => onConnectBackend(stats.inviteCode)}
                  disabled={backendLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:brightness-110 active:scale-95 text-white text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {backendLoading ? "正在连接测试账本..." : "连接后端测试账本"}
                </button>
              ) : (
                <>
                  <button
                    onClick={onRefreshBackend}
                    disabled={backendLoading}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="size-3.5 animate-spin" style={{ animationDuration: backendLoading ? "2s" : "0s" }} /> 刷新后端状态
                  </button>
                  <button
                    onClick={onDisconnectBackend}
                    disabled={backendLoading}
                    className="px-4 py-2.5 rounded-xl bg-red-950/30 border border-red-500/20 hover:bg-red-950/60 active:scale-95 text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    断开连接
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Developer / Admin Control entry */}
          <div className="bg-[#0b0e14]/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.01] rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-3">
              <span className="cyber-icon-wrapper p-1.5 text-slate-500 border-white/10 bg-white/5">
                <Sliders className="size-4 text-slate-400" />
              </span>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 font-sans">
                  开发 / 管理员入口
                </h3>
                <p className="text-[10px] text-slate-505 font-mono mt-0.5">
                  需要 Admin Token | 仅用于设备配置与测试环境管理
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAdminPanel(true)}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-2 font-sans"
            >
              <ShieldCheck className="size-3.5 text-cyan-400" /> 进入算力控制后台
            </button>
          </div>

          {/* System and recovery panel */}
          <div className="bg-gradient-to-br from-[#1a0f0f] to-[#0d0707] border border-red-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/[0.02] rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-3">
              <span className="cyber-icon-wrapper p-1.5 text-red-400 border-red-500/20">
                <AlertTriangle className="size-4 text-red-400 icon-glow-red" />
              </span>
              <h3 className="text-xs font-black uppercase tracking-widest text-red-400 font-sans">
                公司重组与演示数据清空 (System & Data Reset)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
              此操作将清空浏览器 Sandbox 缓存的所有设备合同、模拟利润、USDT金及影子发行代币等模拟数据。
            </p>
            
            <div className="flex items-center gap-4">
              {!showConfirmReset ? (
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-2 font-sans"
                >
                  <RefreshCw className="size-3.5" /> 一键解散并重置公司数据
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full animate-fade-in font-sans">
                  <span className="text-xs text-red-400 font-semibold">
                    ⚠️ 确认要清除所有的本地模拟经营数据吗？该操作不可撤销。
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onResetDemoData();
                        setShowConfirmReset(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
                    >
                      确定重置
                    </button>
                    <button
                      onClick={() => setShowConfirmReset(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-xs font-bold transition-all cursor-pointer active:scale-95"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 📂 CSV Exporter Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="bg-[#0b0c16] border border-white/10 rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 relative shadow-[0_10px_50px_rgba(34,211,238,0.15)] max-h-[85vh] overflow-y-auto flex flex-col font-sans"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3 pr-8">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-cyan-400 size-5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      30 日模拟经营算力账本日志导出
                    </h3>
                    <span className="text-[9px] text-cyan-400 font-mono tracking-widest block font-bold">SIMULATED HISTORICAL LOG EXPORT</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="absolute top-2 right-2 p-3 text-slate-400 hover:text-white rounded-full hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px] touch-manipulation z-10"
              >
                ✕
              </button>

              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-sans font-medium">
                导出的内容仅作为算力模拟自检流水的格式验证。
              </p>

              {exportPhase !== "ready" ? (
                <div className="bg-black/45 border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 h-80 animate-fade-in select-none">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 border-t-cyan-400 animate-spin" />
                    <Cpu className="size-8 text-cyan-400 animate-pulse animate-duration-1000" />
                  </div>
                  
                  <div className="space-y-2 max-w-md">
                    <span className="text-[9px] sm:text-[10px] text-cyan-400 font-mono font-black uppercase tracking-widest block">
                      {exportPhase === "pairing" ? "Phase 1 / 4: AUTHENTICATING SIGNATURES" : 
                       exportPhase === "checking" ? "Phase 2 / 4: AUDITING ASSETS & LOGS" : 
                       exportPhase === "broadcasting" ? "Phase 3 / 4: CONSENSUS BROADCASTING" : "Phase 4 / 4: RECONCILING SHA-256 CHECK"}
                    </span>
                    <h4 className="text-[11px] sm:text-xs font-bold text-white tracking-wide">
                      {exportPhase === "pairing" && "环境签名密钥拉取..."}
                      {exportPhase === "checking" && "遍历设备和团队明细..."}
                      {exportPhase === "broadcasting" && "中继基站广播备份..."}
                      {exportPhase === "solidifying" && "数字摘要计算对账..."}
                    </h4>
                  </div>
                </div>
              ) : (
                <div className="bg-black/60 border border-white/5 p-2 sm:p-4 rounded-xl animate-fade-in font-mono">
                  <textarea
                    readOnly
                    className="w-full h-44 sm:h-60 bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] sm:text-[11px] font-mono text-slate-300 resize-none focus:outline-none focus:border-cyan-500/50"
                    value={getSimulated30DaysText()}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-sans text-center sm:text-left">
                  * 账本模拟导出仅供演示校验。
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-3.5 sm:py-2 border border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 w-full sm:w-auto touch-manipulation min-h-[44px] flex items-center justify-center"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel Overlay */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

    </div>
  );
};
