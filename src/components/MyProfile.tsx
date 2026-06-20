import React, { useState, useMemo } from "react";
import { UserStats, ActiveMiner, MiningRecord, UserLevel } from "../types";
import { MOCK_REFERRALS } from "../utils/storage";
import { loadIssuedTokens } from "../utils/issuedTokens";
import { 
  Award, Key, Copy, Check, Users, History, Cpu, Droplet, Sparkles, Plus, Layers, Lock, Settings, BatteryCharging, TrendingUp, Zap, Download, BarChart3,
  Coins, RefreshCw, AlertTriangle, ShieldCheck, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResonanceTower } from "./ResonanceTower";
import { ItemStore } from "./ItemStore";
import { UserResponse, AssetsResponse, DeviceOrder } from "../api/types";

export const renderBadgeIcon = (badgeId: string, className = "size-8", isActive = true) => {
  const stroke = isActive ? (
    badgeId === "active_miner" || badgeId === "crystal_master" 
      ? "url(#gradient-amber-orange)" 
      : badgeId === "veteran_node" 
        ? "url(#gradient-cyan-blue)" 
        : "url(#gradient-purple-pink)"
  ) : "currentColor";

  const glowClass = isActive ? (
    badgeId === "active_miner" || badgeId === "crystal_master" 
      ? "icon-glow-amber" 
      : badgeId === "veteran_node" 
        ? "icon-glow-cyan" 
        : "icon-glow-purple"
  ) : "";

  const finalClass = `${className} ${glowClass}`;

  switch (badgeId) {
    case "active_miner":
      return <Zap stroke={stroke} className={finalClass} />;
    case "crystal_master":
      return <Sparkles stroke={stroke} className={finalClass} />;
    case "veteran_node":
      return <Cpu stroke={stroke} className={finalClass} />;
    case "global_ambassador":
      return <Layers stroke={stroke} className={finalClass} />;
    default:
      return <Award stroke={stroke} className={finalClass} />;
  }
};

interface MyProfileProps {
  stats: UserStats;
  activeMiners: ActiveMiner[];
  records: MiningRecord[];
  usdtBalance: number; // Simulated USDT balance (NEW!)
  onSynthesize: () => void;
  onBuyCoolant: (costInFragments: number) => void;
  onApplyCoolant: (minerId: string) => void;
  onClaimDemoMiner: () => void;
  onUpdateSimulatedStats?: (updater: (prev: UserStats) => UserStats) => void;
  onForceAgeMiner?: () => void;
  onRedeemItem?: (item: any) => void;
  onResetDemoData: () => void;

  // Backend connection props (PR-3D)
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

export const MyProfile: React.FC<MyProfileProps> = ({
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

  // Backend connection props (PR-3D)
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

  // Custom states for achievements and simulated historical exporting
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPhase, setExportPhase] = useState<"idle" | "pairing" | "checking" | "broadcasting" | "solidifying" | "ready">("ready");
  const [copiedExport, setCopiedExport] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const userIssuedTokens = useMemo(() => {
    return loadIssuedTokens();
  }, [subTab]); // reload when subTab switches or renders

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

  // Simulating 30 days of daily log records details in CSV structure
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

  // Automated condition check achievements array
  const achievements = [
    {
      id: "active_miner",
      title: "活跃设备节点",
      desc: "已有设备在线并产出首批 AI Token。",
      requirement: "系统检测到累计产出 AI Token 利润数 > 0",
      isUnlocked: stats.accumulatedFragments > 0,
      icon: "⚡",
      color: "from-amber-400 to-orange-500 text-amber-400",
      rarity: "B级微质徽章",
      buffDescription: "极速提升每日公链自检签到基础收益加成权重 +5%。"
    },
    {
      id: "crystal_master",
      title: "API 凭证生成者",
      desc: "已将 AI Token 转换成至少 1 组 API/URL 服务凭证。 ",
      requirement: "系统检测到累计服务凭证数 >= 1",
      isUnlocked: stats.totalSynthesized >= 1 || stats.hashCrystals >= 1,
      icon: "💎",
      color: "from-cyan-400 to-blue-500 text-cyan-400",
      rarity: "A级重力徽章",
      buffDescription: "生成 API/URL 时展示更完整的交付记录。"
    },
    {
      id: "veteran_node",
      title: "资深并网节点 (Veteran Node)",
      desc: "深度连接大模型算力骨干网，本地部署并网。已成功购入并部署并网至少 1 台专属大模型 GPU 算力集群。",
      requirement: "系统正运行 >= 1 台并网设备",
      isUnlocked: activeMiners.length > 0,
      icon: "⚙️",
      color: "from-purple-400 to-indigo-500 text-purple-400",
      rarity: "S级奇点徽章",
      buffDescription: "设备加注温控维护液时可恢复更高运行效率。"
    },
    {
      id: "global_ambassador",
      title: "团队节点合伙人",
      desc: "团队节点等级已突破 S0，自有设备之外开始获得团队算力加权。",
      requirement: "团队等级达到 S1 或以上",
      isUnlocked: stats.level !== UserLevel.ZERO,
      icon: "🌌",
      color: "from-cyan-400 to-blue-500 text-cyan-400",
      rarity: "S级奇点勋章",
      buffDescription: "团队节点加权会计入总算力。"
    }
  ];

  // Clipboard copies
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

  // Helper format ISO Date
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    } catch {
      return isoStr;
    }
  };

  // Filters to direct recommendees only (depth 1)
  const directDownlines = MOCK_REFERRALS.filter(ref => ref.depth === 1);

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
      default: return "未知日志";
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
      case "running": return "正常运行";
      case "decayed": return "降频待维护";
      case "stopped": return "契约满断电";
    }
  };

  const getAvatarLetter = (name: string) => {
    return name ? name.substring(0, 1) : "U";
  };

  const maxSlots = Math.max(8, activeMiners.filter(m => m.status !== "stopped").length);
  const occupiedSlots = activeMiners.filter(m => m.status !== "stopped").length;
  const idleSlots = Math.max(0, maxSlots - occupiedSlots);
  const loadPercentage = maxSlots > 0 ? Math.round((occupiedSlots / maxSlots) * 100) : 0;
  
  const totalCapex = activeMiners.reduce((s, m) => s + m.cost, 0);
  const companyGrossProfit = stats.accumulatedFragments * 0.05;
  const crystalValuation = stats.hashCrystals * 10.0;
  const companyNetWorth = totalCapex + companyGrossProfit + crystalValuation;
  const dailyNetProfit = stats.baseHashpower * 0.18 + stats.teamHashpower * 0.06;

  const getCorporateBadgeMeta = (level: string) => {
    if (level.includes("S1")) {
      return { lvl: "S1", title: "共建合伙节点", desc: "一级团队加权", color: "from-cyan-500 to-cyan-600", glow: "shadow-[0_0_15px_rgba(34,211,238,0.3)]" };
    }
    if (level.includes("S2")) {
      return { lvl: "S2", title: "团队合伙节点", desc: "二级团队加权", color: "from-cyan-400 to-cyan-500", glow: "shadow-[0_0_15px_rgba(34,211,238,0.4)]" };
    }
    if (level.includes("S3")) {
      return { lvl: "S3", title: "区域合伙节点", desc: "三级团队加权", color: "from-cyan-300 to-cyan-400", glow: "shadow-[0_0_15px_rgba(34,211,238,0.5)]" };
    }
    if (level.includes("S4")) {
      return { lvl: "S4", title: "城市合伙节点", desc: "区域服务分配权", color: "from-amber-500 to-amber-600", glow: "shadow-[0_0_15px_rgba(245,158,11,0.4)] text-glow-gold" };
    }
    if (level.includes("S5")) {
      return { lvl: "S5", title: "全球理事节点", desc: "服务费分配候选", color: "from-amber-400 via-amber-500 to-cyan-400", glow: "shadow-[0_0_20px_rgba(245,158,11,0.6)] text-glow-gold" };
    }
    return { lvl: "S0", title: "自有设备节点", desc: "手机或电脑共享算力", color: "from-slate-400 to-slate-600", glow: "shadow-none" };
  };

  const badgeMeta = getCorporateBadgeMeta(stats.level);
  
  const radius = 30;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, loadPercentage) / 100) * circumference;

  return (
    <div className="space-y-6">

      {/* 👑 Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span className="cyber-icon-wrapper p-1.5 text-cyan-400 mr-1"><Award stroke="url(#gradient-cyan-blue)" className="size-5 icon-glow-cyan animate-pulse" /></span>
            【我的后台】 (Account Console)
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            管理账户资产、设备状态、API/URL 凭证、团队节点和平台回收申请。
          </p>
        </div>
      </div>

      {/* Sub-tab navigation bar */}
      <div className="grid grid-cols-5 bg-slate-900/60 border border-white/10 rounded-2xl p-1 gap-1 mb-6">
        {[
          { id: "assets", label: "资产", icon: Coins, color: "text-cyan-400 hover:text-cyan-300" },
          { id: "logs", label: "日志", icon: History, color: "text-emerald-400 hover:text-emerald-300" },
          { id: "team", label: "团队", icon: Users, color: "text-blue-400 hover:text-blue-300" },
          { id: "services", label: "服务", icon: Key, color: "text-purple-400 hover:text-purple-300" },
          { id: "settings", label: "设置", icon: Settings, color: "text-slate-400 hover:text-slate-300" }
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
          {/* Split Balances Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: AI Token */}
            <div className="bg-gradient-to-br from-[#0c0f24] to-[#04060f] border border-cyan-500/20 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/[0.02] rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">AI Token 余额</span>
                <Cpu className="size-4 text-cyan-400" />
              </div>
              <div className="text-base sm:text-lg font-mono font-black text-cyan-400 text-glow-cyan flex items-baseline gap-1">
                {stats.hashFragments.toFixed(4)}
                <span className="text-[10px] font-normal text-slate-500">AI</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                模拟设备 + API 权益产出额度
              </p>
            </div>

            {/* Card 2: R1 Balance */}
            <div className="bg-gradient-to-br from-[#1a130c] to-[#0a0805] border border-amber-500/20 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/[0.02] rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">R1 权益余额</span>
                <Coins className="size-4 text-amber-400 icon-glow-amber" />
              </div>
              <div className="text-base sm:text-lg font-mono font-black text-amber-400 text-glow-gold flex items-baseline gap-1">
                {(stats.r1Balance || 0).toFixed(4)}
                <span className="text-[10px] font-normal text-slate-500">R1</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                平台权益、锁仓及影子发行凭证
              </p>
            </div>

            {/* Card 3: USDT Balance */}
            <div className="bg-gradient-to-br from-[#0c1c14] to-[#040906] border border-emerald-500/20 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/[0.02] rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">USDT 模拟金</span>
                <Coins className="size-4 text-emerald-400" />
              </div>
              <div className="text-base sm:text-lg font-mono font-black text-emerald-400 text-glow-emerald flex items-baseline gap-1">
                {usdtBalance.toFixed(2)}
                <span className="text-[10px] font-normal text-slate-500">USDT</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                平台充值、变现与交易模拟金
              </p>
            </div>

            {/* Card 4: Company Token */}
            <div className="bg-gradient-to-br from-[#130c24] to-[#08050f] border border-purple-500/20 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/[0.02] rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">已发行公司 Token</span>
                <Layers className="size-4 text-purple-400" />
              </div>
              <div className="text-base sm:text-lg font-mono font-black text-purple-400 text-glow-purple flex items-baseline gap-1">
                {userIssuedTokens.length}
                <span className="text-[10px] font-normal text-slate-500">个</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 leading-normal">
                您发行的 1人公司 影子资产
              </p>
            </div>
          </div>
          {/* Equipment slot overview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-305">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-violet-500/[0.02] opacity-50 pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
              
              {/* Circle progress ring section */}
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r={radius}
                      stroke="url(#slotGlow)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="slotGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-mono font-black text-white">{loadPercentage}%</span>
                    <span className="text-[7.5px] uppercase font-mono text-slate-500 tracking-wider">负载</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-cyan-400 font-mono font-extrabold tracking-widest block uppercase">MINING POOL ASSET LOAD & SLOT STATUS</span>
                  <h4 className="text-sm font-extrabold text-white">
                    设备资产负载概览
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xl">
                    当前账户最多显示 <b>{maxSlots}</b> 个本地部署并网槽位。添加更多设备会直接提升基础算力。
                  </p>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 py-2.5 px-4.5 bg-black/40 border border-white/5 rounded-2xl shrink-0 w-full sm:w-auto text-xs font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
                  <span className="text-slate-400">已用物理槽:</span>
                  <span className="font-mono font-extrabold text-white">{occupiedSlots} / {maxSlots} 槽</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-400">可用空闲槽:</span>
                  <span className="font-mono font-bold text-slate-400">{idleSlots} 槽</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-slate-400">常规运行机:</span>
                  <span className="font-mono font-bold text-green-400">{activeMiners.filter(m => m.status === "running").length} 台</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-400">高衰竭冷却:</span>
                  <span className="font-mono font-bold text-amber-400">{activeMiners.filter(m => m.status === "decayed").length} 台</span>
                </div>
              </div>

            </div>
          </div>

          {/* User Card, Invite Panel, Coolant Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* User Card */}
            <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-cyan-500/5 w-24 h-24 rounded-full blur-xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-[0_0_15px_rgba(62,182,212,0.3)]">
                    <div className="w-full h-full rounded-2xl bg-[#090a16] flex items-center justify-center font-extrabold text-xl text-white uppercase font-sans">
                      {getAvatarLetter(stats.referrerName)}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest block">FOUNDER MEDALLION REGISTRY</span>
                    <h3 className="text-sm font-extrabold text-white tracking-wide font-mono">
                      R1-FOUNDER-0001
                    </h3>
                    
                    <div className="mt-1.5 flex flex-col gap-1">
                      <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${badgeMeta.color} ${badgeMeta.glow} text-slate-950 font-black text-[10px] px-3.5 py-1 rounded-xl transition-all border border-white/10 uppercase`}>
                        <Award className="size-3.5" />
                        <span>{badgeMeta.lvl}级徽章 · {badgeMeta.title}</span>
                      </div>
                      <span className="text-[9px] text-[#22d3ee] font-mono pl-1">{badgeMeta.desc}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <Key className="size-3 text-cyan-400" />
                    领航宿主指引契约：
                  </span>
                  <span className="font-extrabold text-white">{stats.referrerName}</span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/5 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">自有/并网设备算力</span>
                  <span className="font-mono font-extrabold text-white">{stats.baseHashpower.toFixed(1)} T/s</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">团队节点加权算力</span>
                  <span className="font-mono font-extrabold text-cyan-400 text-glow-cyan">{stats.teamHashpower.toFixed(1)} T/s</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">API/URL 凭证</span>
                  <span className="font-mono font-extrabold text-yellow-400 text-glow-gold flex items-center gap-1">
                    <Sparkles className="size-3.5 text-yellow-400 animate-pulse" />
                    {stats.hashCrystals} 块
                  </span>
                </div>
              </div>
            </div>

            {/* Invite Generator Panel */}
            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Users className="size-4 text-cyan-400" />
                  邀请节点
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
                  分享邀请码或邀请链接。对方接入设备后，会计入您的直属节点和团队节点加权。
                </p>
              </div>

              <div className="space-y-3 mt-4">
                <div className="bg-black/40 border border-white/5 px-4.5 py-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 block font-mono uppercase tracking-widest font-bold">INVITATION KEY</span>
                    <span className="text-sm font-mono font-extrabold text-white tracking-wider select-all">{stats.inviteCode}</span>
                  </div>
                  <button
                    id="btn-copy-code"
                    onClick={handleCopyCode}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors cursor-pointer active:scale-95"
                    title="复制邀请码"
                  >
                    {copiedInvite ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
                  </button>
                </div>

                <div className="bg-black/40 border border-white/5 px-4.5 py-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 block font-mono uppercase tracking-widest font-bold">INVITATION SECURE LINK</span>
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[180px] sm:max-w-xs block mt-0.5 select-all">
                      https://hashcube.io/join?ref={stats.inviteCode}
                    </span>
                  </div>
                  <button
                    id="btn-copy-link"
                    onClick={handleCopyLink}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors cursor-pointer active:scale-95"
                    title="复制邀请链接"
                  >
                    {copiedRLink ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Fluid Alchemy Panel */}
            <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.02] rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Droplet className="size-4 text-cyan-400 animate-bounce" />
                  GPU 集群温控维护液
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
                  本地并网设备持续满载运行后容易因过热而发生保护性降频。使用温控维护液能有效冷却硬件并解除限频。
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between mt-4">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold tracking-wider">储备量</span>
                  <span className="text-lg font-mono font-extrabold text-cyan-400 text-glow-cyan">
                    {stats.coolantCount} <span className="text-xs font-normal text-slate-400">罐</span>
                  </span>
                </div>
                
                <button
                  id="btn-buy-coolant"
                  disabled={stats.hashFragments < 50}
                  onClick={() => onBuyCoolant(50)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    stats.hashFragments >= 50
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 active:scale-95"
                      : "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <Plus className="size-3.5" />
                  50 AI Token/罐
                </button>
              </div>

              <p className="text-[10px] text-zinc-500 leading-normal mt-3 font-medium font-sans">
                提示：当 GPU 设备过热进入保护性降频状态时，可在下方设备列表中使用维护液恢复。
              </p>
            </div>

          </div>

          {/* Trial Claim Box */}
          {!stats.hasClaimedDemo && (
            <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/5 to-transparent border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-1">
                <span className="inline-block bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-1.5">
                  自有设备体验 // FREE DEVICE NODE
                </span>
                <h3 className="text-sm font-bold text-white">免费激活 3 分钟手机共享算力体验</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium font-sans max-w-2xl leading-relaxed">
                  不购买设备也可以体验。系统会为您的自有设备创建体验节点，用于产出少量 AI Token。
                </p>
              </div>
              <button
                id="btn-claim-demo"
                onClick={onClaimDemoMiner}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-indigo-600 text-slate-950 hover:brightness-110 active:scale-95 shadow-[0_4px_15px_rgba(62,182,212,0.3)] cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <Cpu className="size-4 animate-spin text-slate-950" />
                快速申请空投
              </button>
            </div>
          )}

          {/* 🏆 Achievements System panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-violet-500/20 transition-all duration-305">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
              <div className="space-y-1">
                <span className="text-[9px] text-violet-400 font-mono font-extrabold tracking-widest block uppercase">ACHIEVEMENT & LEVEL SEQUENCE MEDALS</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="text-yellow-400 size-4" />
                  节点成长成就徽章系统 (Node Milestones & Badges)
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  根据设备在线、AI Token 产出、API/URL 凭证和团队等级解锁。点击徽章可查看说明。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
              {achievements.map((badge) => {
                return (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between group/badge transition-all duration-300 min-h-[148px] cursor-pointer ${
                      badge.isUnlocked
                        ? "bg-gradient-to-b from-white/[0.04] to-transparent border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] text-slate-100"
                        : "bg-black/35 border-white/5 text-slate-600 grayscale opacity-40 hover:grayscale-0 hover:opacity-75"
                    }`}
                  >
                    <div className="text-[9px] uppercase font-mono tracking-wider text-slate-500">
                      {badge.rarity}
                    </div>

                    <div className={`cyber-icon-wrapper p-3.5 my-2 transition-all duration-305 group-hover/badge:scale-105 ${
                      badge.isUnlocked ? "border-cyan-500/25 bg-[#090b14]/50 shadow-[0_0_15px_rgba(34,211,238,0.08)]" : "border-white/5 bg-transparent opacity-35"
                    }`}>
                      {renderBadgeIcon(badge.id, "size-8", badge.isUnlocked)}
                    </div>

                    <div className="space-y-1.5 w-full">
                      <span className={`text-[11px] font-extrabold block truncate ${badge.isUnlocked ? "text-slate-200 font-bold" : "text-slate-500"}`}>
                        {badge.title.split(" ")[0]}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-block ${
                        badge.isUnlocked 
                          ? "bg-green-500/10 border border-green-500/20 text-green-400 font-extrabold" 
                          : "bg-white/5 border border-white/5 text-slate-500"
                      }`}>
                        {badge.isUnlocked ? "✦ 已激活" : "未激活"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid: GPU list & Referrals table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* GPU miners list */}
            <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Cpu className="text-cyan-400 size-4" />
                  已本地部署并网设备 ({activeMiners.length})
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">
                  REAL-TIME MONITORING
                </span>
              </div>

              {activeMiners.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-black/40 border border-white/5 space-y-3 font-sans">
                  <Cpu className="size-10 text-slate-600 mx-auto animate-pulse" />
                  <p className="text-xs font-bold text-slate-400">目前暂未绑定本地部署并网节点</p>
                  <p className="text-[10px] text-slate-500 font-medium">可以先激活手机共享节点，也可以去并网中心购买部署并网设备。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeMiners.map((miner) => {
                    const isDemo = miner.isDemo;
                    
                    return (
                      <div
                        key={miner.id}
                        className="p-5 rounded-2xl bg-black/30 border border-white/5 flex flex-col justify-between gap-4 relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 h-10 w-10 rounded-xl bg-black/55 border border-white/5 flex items-center justify-center text-cyan-400">
                              {isDemo ? <BatteryCharging className="size-5" /> : <Settings className="size-5 text-cyan-400/85" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 font-sans">
                                <span className="text-xs font-bold text-white">
                                  {miner.name} {isDemo && <span className="text-[10px] font-normal text-cyan-400 uppercase tracking-widest">(体验型)</span>}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getMinerStatusStyle(miner.status)}`}>
                                  {getMinerStatusName(miner.status)}
                                </span>
                              </div>
                              
                              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-mono">
                                <span>部署并网规格：<b className="text-white">{miner.cost} USDT</b></span>
                                <span>运行效率：<b className="text-cyan-400 font-bold">{(miner.efficiency * 100).toFixed(0)}%</b></span>
                                {isDemo ? (
                                  <span className="text-indigo-400 font-bold">效期：3 分钟体验节点</span>
                                ) : (
                                  <span>并网截止时间：<b className="text-slate-300">{formatDate(miner.expiresAt)}</b></span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status progress bar & coolant repair action */}
                        <div className="bg-black/45 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 border border-white/5">
                          <div className="w-full text-xs">
                            <div className="flex items-center justify-between text-[11px] mb-1 font-sans">
                              <span className="text-slate-400 font-medium">GPU 核心核心温度与温控健康度（低于50%触发安全保护性降频）</span>
                              <span className="font-mono text-cyan-400 font-bold">{(miner.efficiency * 100).toFixed(0)}% / 100%</span>
                            </div>
                            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  miner.status === "decayed" 
                                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                                    : miner.status === "stopped" 
                                      ? "bg-red-500" 
                                      : "bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                                }`}
                                style={{ width: `${miner.efficiency * 100}%` }}
                              />
                            </div>
                          </div>

                          {miner.status === "decayed" && (
                            <button
                              id={`btn-apply-coolant-${miner.id}`}
                              onClick={() => onApplyCoolant(miner.id)}
                              className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-cyan-400 to-indigo-600 hover:brightness-115 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-[11px] flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all shadow-[0_2px_10px_rgba(6,182,212,0.3)] font-sans"
                            >
                              <Droplet className="size-3.5 fill-slate-950" />
                              加注温控维护液
                            </button>
                          )}
                        </div>

                        {miner.status === "decayed" && (
                          <p className="text-[10px] font-sans text-amber-400 bg-amber-505/5 border border-amber-500/15 p-2.5 rounded-xl font-medium leading-relaxed">
                            设备核心已过热降频至 50%。加注温控维护液可重置温度状态，并获得超频运行效率加成，提升至 <b>110%</b>。
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1 font-sans">
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wide">智能液冷与温控自检协定</span>
                <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                  所有并网运行 of GPU 设备均受到智能温控监测。若设备超频过载导致过热降频，请及时加注温控维护液进行冷却修复。
                </p>
              </div>
            </div>

            {/* Referrals table */}
            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Users className="text-cyan-400 size-4" />
                  直推共鸣团队分布 (L1层级 共 {directDownlines.length} 人)
                </h3>
                <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">
                  DIRECT REFERRALS
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-mono font-extrabold uppercase text-[9px] tracking-wider pb-2.5">
                      <th className="py-3">宿主信标 / ID</th>
                      <th className="py-3">激活契约时间</th>
                      <th className="py-3">运转物理总量</th>
                      <th className="py-3">安全权证</th>
                      <th className="py-3 text-right">中继上抛折算</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {directDownlines.map((user) => (
                      <tr key={user.id} className="text-slate-300 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 flex items-center gap-2 font-bold font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                          {user.name}
                        </td>
                        <td className="py-3 font-mono text-slate-500 font-medium">{user.joinedAt}</td>
                        <td className="py-3 font-mono text-white font-bold">{user.totalHashpower} T/s</td>
                        <td className="py-3 font-sans">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 uppercase tracking-wider">
                            {user.level}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-extrabold text-green-400 text-glow-green">
                          +{(user.totalHashpower * 0.2).toFixed(1)} H/s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-slate-500 font-sans font-medium">
                <span>* 以上直属节点按团队等级规则计入算力加权，实际比例以团队节点页为准。</span>
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
              最近 10 条哈希日志明细
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
                REAL-TIME LOG
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {records.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 font-sans font-medium">
                暂无算力生成流水明细
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
          <ResonanceTower stats={stats} />
        </div>
      )}

      {subTab === "services" && (
        <div className="border border-white/10 bg-slate-950/25 p-6 rounded-2xl animate-fade-in">
          <ItemStore stats={stats} onRedeemItem={onRedeemItem || (() => {})} onBuyCoolant={onBuyCoolant} />
        </div>
      )}

      {subTab === "settings" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* 后端测试账本连接 (Backend Connection Panel) */}
          <div className="bg-gradient-to-br from-[#0e0a1a] to-[#06040d] border border-violet-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/[0.03] rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-3">
              <span className="cyber-icon-wrapper p-1.5 text-violet-400 border-violet-500/20">
                <RefreshCw className="size-4 animate-spin icon-glow-purple" style={{ animationDuration: backendLoading ? "2s" : "0s" }} />
              </span>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#a78bfa]">
                后端测试账本连接 (Backend Connection)
              </h3>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
              连接本地 D1 Worker 后端测试账本，实现匿名会话与资产初始化落库的端到端联调测试。
            </p>

            {/* Status display */}
            <div className="space-y-3.5 mb-5">
              {!backendConnected ? (
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600 animate-pulse" />
                    未连接后端账本，本地 Sandbox 正常运行
                  </div>
                  <p className="text-[10px] text-slate-500">
                    前端数据（如挖矿效率、R1 交易、影子 Token）均来自本地隔离沙箱。
                  </p>
                </div>
              ) : (
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 space-y-3 font-mono">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      已连接后端测试账本
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
                      {backendUser.referrerId && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">REFERRER ID:</span>
                          <span className="text-slate-200">{backendUser.referrerId}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {backendAssets && (
                    <div className="border-t border-white/5 pt-2 space-y-1.5 font-mono">
                      <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">后端资产只读快照 (Read-Only Balance)</span>
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
                        <div className="bg-slate-900/40 p-2 rounded border border-white/5 flex justify-between">
                          <span className="text-slate-500 font-sans">Shards:</span>
                          <span className="text-white font-bold">{backendAssets.shards.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-white/5 flex justify-between">
                          <span className="text-slate-500 font-sans">Coolant:</span>
                          <span className="text-white font-bold">{backendAssets.coolantCount}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-white/5 flex justify-between col-span-2">
                          <span className="text-slate-500 font-sans">Crystals:</span>
                          <span className="text-white font-bold">{backendAssets.hashCrystals}</span>
                        </div>
                      </div>
                      <div className="bg-violet-950/20 border border-violet-500/20 text-violet-400 p-2 rounded-xl text-[10px] leading-relaxed font-sans mt-2">
                        ⚠️ 只读后端测试账本，不影响本地演示资产。
                      </div>
                    </div>
                  )}

                  {/* 后端活跃设备 & 体验节点状态 (PR-3E) */}
                  <div className="border-t border-white/5 pt-2 space-y-1.5 font-mono">
                    <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">后端活跃设备快照 (Active Devices)</span>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 space-y-2 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">活跃设备数量:</span>
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
                    <div className="bg-violet-950/20 border border-violet-500/20 text-violet-400 p-2 rounded-xl text-[10px] leading-relaxed font-sans">
                      ⚠️ 只读后端测试设备状态，不影响本地运行的矿机。
                    </div>
                  </div>
                </div>
              )}

              {/* Error display */}
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

            {/* Actions */}
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
                    <RefreshCw className="size-3.5 animate-spin" style={{ animationDuration: backendLoading ? "2s" : "0s" }} /> 刷新后端资产
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

          {/* Recovery and Dev consoles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Platform Recycling & Accounts settlement */}
            <div className="bg-gradient-to-br from-[#0a0c1a] to-[#05060f] border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.03] rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2.5 mb-3">
                <span className="cyber-icon-wrapper p-1.5 text-cyan-400 border-cyan-500/20">
                  <Coins stroke="url(#gradient-cyan-blue)" className="size-4 animate-pulse icon-glow-cyan" />
                </span>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#22d3ee]">
                  平台回收与账户结算
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
                AI Token 可用于生成 API/URL，也可以在满足基础条件后提交平台回收申请。
              </p>

              <div className="space-y-3.5 mb-5">
                <div className="bg-black/35 border border-white/5 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 block font-mono uppercase tracking-wider font-bold">条件 1：可用 AI Token</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-mono font-black text-white">{stats.hashFragments.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-500">/ 500.0 AI Token</span>
                    </div>
                  </div>
                  {stats.hashFragments >= 500 ? (
                    <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
                      <ShieldCheck className="size-3.5" /> 达标
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
                      <AlertTriangle className="size-3.5 animate-bounce" /> 未达标
                    </div>
                  )}
                </div>

                <div className="bg-black/35 border border-white/5 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 block font-mono uppercase tracking-wider font-bold">条件 2：直属活跃节点</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-mono font-black text-white">{stats.directReferrals}</span>
                      <span className="text-[10px] text-slate-500">/ 1 人</span>
                    </div>
                  </div>
                  {stats.directReferrals >= 1 ? (
                    <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
                      <ShieldCheck className="size-3.5" /> 达标
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
                      <AlertTriangle className="size-3.5 animate-bounce" /> 未招募
                    </div>
                  )}
                </div>
              </div>

              {stats.hashFragments >= 500 && stats.directReferrals >= 1 ? (
                <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-4 py-3 rounded-2xl flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping shrink-0" />
                  <span className="font-semibold">条件已满足，可以提交平台回收申请。模拟手续费为 1.5%。</span>
                </div>
              ) : (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-2xl flex items-center gap-2.5">
                  <Lock className="size-4 shrink-0 text-red-400 animate-pulse" />
                  <span className="font-medium">暂未满足回收条件。请继续产出 AI Token 或激活直属节点。</span>
                </div>
              )}

              <button
                onClick={() => {
                  if (stats.hashFragments >= 500 && stats.directReferrals >= 1) {
                    alert(`回收申请已提交。申请数量 ${(stats.hashFragments).toFixed(1)} AI Token，模拟手续费 1.5%。`);
                    if (onUpdateSimulatedStats) {
                      onUpdateSimulatedStats(prev => ({
                        ...prev,
                        hashFragments: 0
                      }));
                    }
                  }
                }}
                disabled={!(stats.hashFragments >= 500 && stats.directReferrals >= 1)}
                className={`w-full py-3.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                  stats.hashFragments >= 500 && stats.directReferrals >= 1
                    ? "bg-gradient-to-r from-emerald-400 to-cyan-500 hover:brightness-110 active:scale-95 text-slate-950 shadow-[0_4px_15px_rgba(52,211,153,0.3)] cursor-pointer"
                    : "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed"
                }`}
              >
                {stats.hashFragments >= 500 && stats.directReferrals >= 1 ? "提交平台回收申请" : "回收通道未满足条件"}
              </button>
            </div>

            {/* Developer Console */}
            <div className="bg-gradient-to-br from-[#07161b] to-[#030a0d] border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.02] rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2.5 mb-3">
                <span className="cyber-icon-wrapper p-1.5 text-cyan-400 border-cyan-500/20">
                  <Settings stroke="url(#gradient-cyan-blue)" className="size-4 icon-glow-cyan animate-spin" style={{ animationDuration: "8s" }} />
                </span>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#22d3ee]">
                  开发者模拟控制台 (Developer Sim Console)
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
                使用此控制台模拟 AI Token 增长、团队节点等级和设备降频，方便本地预览测试。
              </p>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (onUpdateSimulatedStats) {
                        onUpdateSimulatedStats(prev => ({
                          ...prev,
                          hashFragments: prev.hashFragments + 100,
                          accumulatedFragments: prev.accumulatedFragments + 100
                        }));
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[#22d3ee] hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <Plus className="size-3.5" /> 利润 +100 AI
                  </button>

                  <button
                    onClick={() => {
                      if (onUpdateSimulatedStats) {
                        onUpdateSimulatedStats(prev => ({
                          ...prev,
                          hashFragments: prev.hashFragments + 500,
                          accumulatedFragments: prev.accumulatedFragments + 500
                        }));
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[#22d3ee] hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <Plus className="size-3.5" /> 利润 +500 AI
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-500 font-mono block uppercase tracking-wider font-bold">模拟团队节点数量（测试 S1-S5）：</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { label: "0人 (S0节点)", direct: 0, total: 0 },
                      { label: "1人 (S1合伙)", direct: 1, total: 1 },
                      { label: "3人 (S2合伙)", direct: 3, total: 3 },
                      { label: "5人 (S3代理)", direct: 5, total: 5 },
                      { label: "15人 (S4合伙)", direct: 5, total: 15 },
                      { label: "50人 (S5理事)", direct: 5, total: 50 },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (onUpdateSimulatedStats) {
                            onUpdateSimulatedStats(prev => ({
                              ...prev,
                              directReferrals: item.direct,
                              totalReferrals: item.total
                            }));
                          }
                        }}
                        className={`px-2 py-1.5 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer text-center active:scale-95 truncate ${
                          stats.totalReferrals === item.total && stats.directReferrals === item.direct
                            ? "bg-cyan-500 border-cyan-400 text-slate-950 font-black shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                            : "bg-black/35 border-cyan-500/20 text-[#22d3ee]/80 hover:border-cyan-500/50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1 border-t border-cyan-500/10">
                  <button
                    disabled={!activeMiners.some(m => !m.isDemo && m.status === "running")}
                    onClick={() => {
                      if (onForceAgeMiner) {
                        onForceAgeMiner();
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      activeMiners.some(m => !m.isDemo && m.status === "running")
                        ? "bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-slate-950 cursor-pointer active:scale-95"
                        : "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed"
                    }`}
                    title={activeMiners.some(m => !m.isDemo && m.status === "running") ? "使首台运行中的付费设备降频到50%效率" : "没有运行中的付费设备"}
                  >
                    <AlertTriangle className="size-3.5 animate-pulse" /> 强制设备降频
                  </button>

                  <button
                    onClick={() => {
                      if (onUpdateSimulatedStats) {
                        onUpdateSimulatedStats(prev => ({
                          ...prev,
                          hashFragments: 0,
                          accumulatedFragments: 0,
                          directReferrals: 0,
                          totalReferrals: 0,
                          coolantCount: 3,
                          hashCrystals: 0,
                          totalSynthesized: 0
                        }));
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <RefreshCw className="size-3.5" /> 重置模拟状态
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Founder Capital Ledger */}
          <div className="bg-gradient-to-r from-[#0d1024] to-[#080916] border border-cyan-500/10 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.04] rounded-full blur-2xl flex pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center border-b border-white/5 pb-5">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-cyan-400 size-4 animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#22d3ee]">
                    公司账面财务与经营利润总表 (Founder Capital Ledger)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  统计设备购买成本、累计 AI Token 产出、平台回收估值和 API/URL 凭证数量。
                </p>
              </div>
              
              <div className="flex gap-4 p-3.5 bg-black/45 border border-white/5 rounded-2xl shrink-0">
                <div className="text-left font-mono">
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">公司核心估值折计 (USDT)</span>
                  <span className="text-base font-black text-cyan-400 text-glow-cyan">
                    ${companyNetWorth.toFixed(2)}
                  </span>
                </div>
                <div className="w-[1.5px] bg-white/10" />
                <div className="text-left font-mono">
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-bold">预估日流净结资金 (USDT/天)</span>
                  <span className="text-base font-black text-emerald-400">
                    +${dailyNetProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              <div className="bg-black/30 border border-white/5 rounded-xl p-4.5 space-y-1 relative group hover:border-cyan-500/10 transition-all">
                <span className="text-[9.5px] uppercase text-slate-500 font-bold block">硬件基础投资 (CAPEX)</span>
                <div className="text-cyan-300 font-mono font-black text-lg">${totalCapex.toFixed(2)}</div>
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  指在【算力设备】所购买部署并网的大模型高性能 GPU 硬件折算金额。
                </p>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-xl p-4.5 space-y-1 relative group hover:border-emerald-500/10 transition-all">
                <span className="text-[9.5px] uppercase text-slate-500 font-bold block">累计 AI Token 产出</span>
                <div className="text-emerald-400 font-mono font-black text-lg">{stats.accumulatedFragments.toFixed(1)} AI Token</div>
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  账户从自有设备、并网设备和团队节点累计获得的 AI Token。
                </p>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-xl p-4.5 space-y-1 relative group hover:border-yellow-500/10 transition-all">
                <span className="text-[9.5px] uppercase text-slate-500 font-bold block">账面已交割毛利润</span>
                <div className="text-yellow-500 font-mono font-black text-lg">${companyGrossProfit.toFixed(2)} USDT</div>
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  按全球均单交割对价对消折算的实得公司可用资金积余。
                </p>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-xl p-4.5 space-y-1 relative group hover:border-violet-500/10 transition-all">
                <span className="text-[9.5px] uppercase text-slate-500 font-bold block">API/URL 凭证估值</span>
                <div className="text-purple-400 font-mono font-black text-lg">${crystalValuation.toFixed(2)} USDT</div>
                <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  当前持有 {stats.hashCrystals} 组服务凭证，可用于自用、出售或回收流程。
                </p>
              </div>
            </div>

          </div>

          {/* 系统与数据管理 */}
          <div className="bg-gradient-to-br from-[#1a0f0f] to-[#0d0707] border border-red-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/[0.02] rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-3">
              <span className="cyber-icon-wrapper p-1.5 text-red-400 border-red-500/20">
                <AlertTriangle className="size-4 text-red-400 icon-glow-red animate-pulse" />
              </span>
              <h3 className="text-xs font-black uppercase tracking-widest text-red-400 font-sans">
                系统与数据管理 (System & Data Management)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
              重置所有本地缓存、设备并网数据、交易明细、USDT 余额和签到记录。此操作不可逆，请谨慎操作。
            </p>
            
            <div className="flex items-center gap-4">
              {!showConfirmReset ? (
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-2 font-sans"
                >
                  <RefreshCw className="size-3.5" /> 一键重置演示数据
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full animate-fade-in font-sans">
                  <span className="text-xs text-red-400 font-semibold">
                    ⚠️ 确认要重置所有演示数据吗？（所有的本地资产、设备及代币发行记录都将被永久清空）
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

      {/* 📂 Historical Data Export Simulation Modal */}
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
                      30 日 AI Token 产出明细导出
                    </h3>
                    <span className="text-[9px] text-cyan-400 font-mono tracking-widest block font-bold">BLOCKCHAIN HISTORICAL REPORT EXPORT</span>
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
                系统会导出最近 30 天的设备产出、团队节点加权、维护记录和 API/URL 凭证生成记录。
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

                  <div className="w-48 sm:w-64 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5 relative">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 rounded-full transition-all duration-305"
                      style={{
                        width: exportPhase === "pairing" ? "25%" : 
                                exportPhase === "checking" ? "50%" : 
                                exportPhase === "broadcasting" ? "75%" : "95%"
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-black/60 border border-white/5 p-2 sm:p-4 rounded-xl animate-fade-in font-mono">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono pb-2 border-b border-white/[0.04] mb-3">
                    <span>FORMAT: COMMA-SEPARATED VALUES (CSV)</span>
                    <span>SHA-256 REGISTERED</span>
                  </div>
                  <textarea
                    readOnly
                    className="w-full h-44 sm:h-60 bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] sm:text-[11px] font-mono text-slate-300 resize-none focus:outline-none focus:border-cyan-500/50"
                    value={getSimulated30DaysText()}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-sans text-center sm:text-left">
                  * 该导出的哈希日结账本可直接交付至个人冷钱包或外部资产对账表。
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-3.5 sm:py-2 border border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 w-full sm:w-auto touch-manipulation min-h-[44px] flex items-center justify-center"
                  >
                    关闭
                  </button>
                  
                  <button
                    disabled={exportPhase !== "ready"}
                    onClick={() => {
                      const csv = getSimulated30DaysText();
                      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", `hashcube_founder_ledger_${new Date().toISOString().substring(0,10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className={`px-4 py-3.5 sm:py-2.5 border border-[#22d3ee]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto font-sans touch-manipulation min-h-[44px] ${
                      exportPhase !== "ready"
                        ? "bg-slate-900 border-white/5 text-slate-600 cursor-not-allowed opacity-50"
                        : "bg-cyan-950/40 text-[#22d3ee] hover:bg-cyan-500 hover:text-slate-950 cursor-pointer active:scale-95"
                    }`}
                  >
                    <Download className="size-3.5" />
                    下载正式 CSV 账本
                  </button>

                  <button
                    disabled={exportPhase !== "ready"}
                    onClick={handleCopyExportText}
                    className={`px-5 py-3.5 sm:py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-[0_2px_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-1.5 w-full sm:w-auto font-sans text-glow-cyan touch-manipulation min-h-[44px] ${
                      exportPhase !== "ready"
                        ? "bg-slate-900 border-white/5 text-slate-600 cursor-not-allowed opacity-50"
                        : "bg-gradient-to-r from-cyan-400 to-indigo-600 hover:brightness-110 text-slate-950 cursor-pointer active:scale-[0.98]"
                    }`}
                  >
                    {copiedExport ? (
                      <>
                        <Check className="size-3.5 text-slate-950 font-black" />
                        数据已复制
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        复制纯文本CSV
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏆 Achievement Details Description Modal */}
      <AnimatePresence>
        {selectedBadge && (
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
              className="bg-[#0b0c16] border border-white/10 rounded-2xl max-w-sm sm:max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-5 relative shadow-[0_15px_60px_rgba(139,92,246,0.15)] flex flex-col font-sans"
            >
              <button 
                onClick={() => setSelectedBadge(null)}
                className="absolute top-2 right-2 p-3 text-slate-400 hover:text-white rounded-full hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px] touch-manipulation z-10"
              >
                ✕
              </button>

              <div className="text-center pt-3">
                <div className="cyber-icon-wrapper p-6 mb-4 bg-black/45 border-cyan-500/25 select-none animate-bounce justify-center items-center">
                  {renderBadgeIcon(selectedBadge.id, "size-12", selectedBadge.isUnlocked)}
                </div>
                <span className="text-[10px] text-violet-400 font-mono font-extrabold tracking-widest block uppercase">
                  {selectedBadge.rarity}
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedBadge.title}
                </h3>
              </div>

              <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-3 font-sans text-xs">
                <div className="space-y-1">
                  <span className="text-[9.5px] text-slate-500 font-extrabold block uppercase tracking-wider">勋章内涵 LORE</span>
                  <p className="text-slate-300 leading-relaxed font-semibold">
                    {selectedBadge.desc}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-2.5 flex items-center justify-between">
                  <span className="text-[9.5px] text-slate-500 font-extrabold block uppercase tracking-wider">判定条件</span>
                  <span className="text-cyan-400 font-mono font-bold">{selectedBadge.requirement}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] text-slate-500 font-extrabold block uppercase tracking-wider">解锁状态</span>
                  {selectedBadge.isUnlocked ? (
                    <span className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 font-mono font-bold rounded">
                      ✦ 已并网激活 (Unlocked)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-slate-500 font-mono font-medium rounded">
                      未达成条件 (Conditions Unmet)
                    </span>
                  )}
                </div>
              </div>

              {selectedBadge.isUnlocked && (
                <div className="bg-amber-500/10 border border-[#f59e0b]/20 rounded-2xl p-3.5 text-xs text-amber-400">
                  <span className="font-extrabold uppercase text-[10px] block mb-1 font-mono tracking-widest">★ 解锁被动光环特权奖励</span>
                  <p className="leading-relaxed font-medium font-sans">{selectedBadge.buffDescription}</p>
                </div>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer min-h-[44px] touch-manipulation flex items-center justify-center"
              >
                了解明细，返回节点面板
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
