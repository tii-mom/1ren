import React, { useState } from "react";
import { UserStats, ActiveMiner, MiningRecord, UserLevel } from "../types";
import { MOCK_REFERRALS } from "../utils/storage";
import { 
  Award, Key, Copy, Check, Users, History, Cpu, Droplet, Sparkles, Plus, Layers, Lock, Settings, BatteryCharging, TrendingUp, Zap, Download, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const renderBadgeIcon = (badgeId: string, className = "size-8 text-cyan-400") => {
  switch (badgeId) {
    case "active_miner":
      return <Zap className={className} />;
    case "crystal_master":
      return <Sparkles className={className} />;
    case "veteran_node":
      return <Cpu className={className} />;
    case "global_ambassador":
      return <Layers className={className} />;
    default:
      return <Award className={className} />;
  }
};

interface MyProfileProps {
  stats: UserStats;
  activeMiners: ActiveMiner[];
  records: MiningRecord[];
  onSynthesize: () => void;
  onBuyCoolant: (costInFragments: number) => void;
  onApplyCoolant: (minerId: string) => void;
  onClaimDemoMiner: () => void;
}

export const MyProfile: React.FC<MyProfileProps> = ({
  stats,
  activeMiners,
  records,
  onBuyCoolant,
  onApplyCoolant,
  onClaimDemoMiner
}) => {
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedRLink, setCopiedRLink] = useState(false);

  // Custom states for achievements and simulated historical exporting
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPhase, setExportPhase] = useState<"idle" | "pairing" | "checking" | "broadcasting" | "solidifying" | "ready">("ready");
  const [copiedExport, setCopiedExport] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);

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
    let text = "日期,事件类型,产出数值(HASH),代工负载机器,账簿保全签名\n";
    const nowTime = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(nowTime.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().substring(0, 10);
      const baseVal = (stats.baseHashpower * 12.96 + stats.teamHashpower * 4.32);
      const dayVal = parseFloat((baseVal * (1 + (Math.sin(i) * 0.15))).toFixed(4));
      const sigHash = Math.abs(Math.sin(i)).toString(16).substring(2, 10).toUpperCase();
      text += `${dateStr},物理并网日结,${dayVal > 0 ? dayVal : 13.5},HASH-${1000 + i},SIG-0X${sigHash}\n`;
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
      title: "活跃分布式雇员 (Active AI Employee)",
      desc: "交付并网，已获得首批核算碎片并开启了分布式计算代工征途。",
      requirement: "系统检测到累计产出碎片数 > 0",
      isUnlocked: stats.accumulatedFragments > 0,
      icon: "⚡",
      color: "from-amber-400 to-orange-500 text-amber-400",
      rarity: "B级微质徽章",
      buffDescription: "极速提升每日公链自检签到基础收益加成权重 +5%。"
    },
    {
      id: "crystal_master",
      title: "晶体大师 (Crystal Master)",
      desc: "成功将质能碎片高纯聚核，固化成功至少 1 块算力能量晶体。",
      requirement: "系统检测到累计晶体固化总数 >= 1",
      isUnlocked: stats.totalSynthesized >= 1 || stats.hashCrystals >= 1,
      icon: "💎",
      color: "from-cyan-400 to-blue-500 text-cyan-400",
      rarity: "A级重力徽章",
      buffDescription: "固化重置晶体碎片熔融体时，自动返还免除 1.5% 能量尾尘损耗。"
    },
    {
      id: "veteran_node",
      title: "资深节点 (Veteran Node)",
      desc: "深度连接主权节点，承载物理机房负载。已成功租用并托管至少 1 台专属微堆物理机组外包芯片契约限制。",
      requirement: "系统正绑定并托管运行 ≥ 1 台矿机",
      isUnlocked: activeMiners.length > 0,
      icon: "⚙️",
      color: "from-purple-400 to-indigo-500 text-purple-400",
      rarity: "S级奇点徽章",
      buffDescription: "快速冷修复半衰期爆温硬件时，过冷对冲周期自动加赠延长 10%。"
    },
    {
      id: "global_ambassador",
      title: "星网引力师 (Gravity Hub)",
      desc: "成功组建下属共鸣公司，推广星网成员绑定，算力职级突破普通宿主个体限制。",
      requirement: "系统职级达到 [S1 算力工作室创始人] 或以上",
      isUnlocked: stats.level !== UserLevel.ZERO,
      icon: "🌌",
      color: "from-pink-400 to-rose-500 text-pink-400",
      rarity: "EX超阶黑洞勋章",
      buffDescription: "捕获直属信道团队溢价能量中转对冲时，收益系数加权提升 2.5%。"
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

  // Type-wise color mapping for transaction records
  const getRecordTagStyle = (type: MiningRecord["type"]) => {
    switch (type) {
      case "mining": return "bg-green-950/80 text-green-400 border-green-500/20";
      case "resonance": return "bg-blue-950/80 text-cyan-400 border-cyan-500/20";
      case "synthesize": return "bg-yellow-950/80 text-yellow-400 border-yellow-500/20";
      case "coolant": return "bg-cyan-950/80 text-cyan-400 border-cyan-500/20";
      case "exchange": return "bg-red-950/80 text-red-400 border-red-500/20";
      case "buff": return "bg-pink-950/80 text-pink-400 border-pink-500/20";
      default: return "bg-white/5 text-slate-400 border-white/10";
    }
  };

  const getRecordTagName = (type: MiningRecord["type"]) => {
    switch(type) {
      case "mining": return "物理日结";
      case "resonance": return "塔网共振";
      case "synthesize": return "晶体合成";
      case "coolant": return "注入液氮";
      case "exchange": return "商场兑换";
      case "buff": return "能效跃迁";
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
      case "running": return "正常代工中";
      case "decayed": return "高热半衰竭";
      case "stopped": return "契约满断电";
    }
  };

  const getAvatarLetter = (name: string) => {
    return name ? name.substring(0, 1) : "U";
  };

  // Load math calculations for slots circular visualization
  const maxSlots = Math.max(8, activeMiners.filter(m => m.status !== "stopped").length);
  const occupiedSlots = activeMiners.filter(m => m.status !== "stopped").length;
  const idleSlots = Math.max(0, maxSlots - occupiedSlots);
  const loadPercentage = maxSlots > 0 ? Math.round((occupiedSlots / maxSlots) * 100) : 0;
  
  // Custom Company Profit Ledger math
  const totalCapex = activeMiners.reduce((s, m) => s + m.cost, 0); // cost sum
  const companyGrossProfit = stats.accumulatedFragments * 0.05; // 0.05U per fragment
  const crystalValuation = stats.hashCrystals * 10.0; // 10U per crystal valuation
  const companyNetWorth = totalCapex + companyGrossProfit + crystalValuation;
  const dailyNetProfit = stats.baseHashpower * 0.18 + stats.teamHashpower * 0.06; // Estimated dynamic profit flow in USDT/day

  // Get professional corporate badge metadata for S1-S9 hierarchy
  const getCorporateBadgeMeta = (level: string) => {
    switch (level) {
      case "算力工作室创始人":
        return { lvl: "S1", title: "工作室创始人", desc: "主脑代工主理人", color: "from-teal-400 to-cyan-500", glow: "shadow-[0_0_15px_rgba(20,184,166,0.4)]" };
      case "算力部门经理":
        return { lvl: "S2", title: "算力部门经理", desc: "信道代工主管", color: "from-blue-400 to-indigo-500", glow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]" };
      case "算力分公司总监":
        return { lvl: "S3", title: "分公司总监", desc: "星网中轨主管", color: "from-indigo-400 to-violet-500", glow: "shadow-[0_0_15px_rgba(99,102,241,0.3)]" };
      case "区域算力总裁":
        return { lvl: "S4", title: "区域算力总裁", desc: "大中华区总调度", color: "from-pink-400 to-purple-500", glow: "shadow-[0_0_15px_rgba(236,72,153,0.3)]" };
      case "算力集团副总裁":
        return { lvl: "S5", title: "集团副总裁", desc: "技术对冲主理人", color: "from-purple-500 to-fuchsia-600", glow: "shadow-[0_0_15px_rgba(168,85,247,0.4)]" };
      case "算力集团董事":
        return { lvl: "S6", title: "集团董事会成员", desc: "大宗物理机群决策人", color: "from-rose-500 to-red-600", glow: "shadow-[0_0_15px_rgba(244,63,94,0.4)]" };
      case "算力集团合伙人":
        return { lvl: "S7", title: "集团高级合伙人", desc: "全球超算核电共营契约人", color: "from-red-500 via-amber-500 to-yellow-500", glow: "shadow-[0_0_20px_rgba(239,68,68,0.5)]" };
      case "算力集团首席增长官":
        return { lvl: "S8", title: "首席增长官 (CGO)", desc: "网络裂变增长引擎总帅", color: "from-yellow-400 via-emerald-400 to-cyan-400", glow: "shadow-[0_0_20px_rgba(234,179,8,0.5)]" };
      case "算力集团联席CEO":
        return { lvl: "S9", title: "联席首席执行官 (CEO)", desc: "星网上乘总司理/公司终极主理人", color: "from-amber-400 via-pink-500 via-purple-600 to-cyan-400", glow: "shadow-[0_0_25px_rgba(217,119,6,0.6)] animate-pulse" };
      default:
        return { lvl: "S0", title: "个体贡献者", desc: "基础测试员", color: "from-slate-400 to-slate-600", glow: "shadow-none" };
    }
  };

  const badgeMeta = getCorporateBadgeMeta(stats.level);
  
  // SVG Ring geometry
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
            <Award className="size-6 text-[#22d3ee] animate-pulse" />
            【创始人后台】 (Founder Backstage Suite)
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            管理您专属算力有限公司的核心账目资产、高纯固质成长勋章，以及导出星链对账凭证。
          </p>
        </div>
      </div>

      {/* 📊 公司利润总表 (Company Financial Statement Summary Card) */}
      <div className="bg-gradient-to-r from-[#0d1024] to-[#080916] border border-cyan-500/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.04] rounded-full blur-2xl flex pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center border-b border-white/5 pb-5">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-cyan-400 size-4.5 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-widest text-[#22d3ee]">
                公司账面财务与经营利润总表 (Founder Capital Ledger)
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              本账表严格统计物理发运资本支出（CAPEX）、爆块积分总兑及晶化硬通资产。精确核算创始人名下公司的核心资产价值。
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

        {/* Detailed Breakout Rows (4 Grid Cells) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          
          <div className="bg-black/30 border border-white/5 rounded-xl p-4.5 space-y-1 relative group hover:border-cyan-500/10 transition-all">
            <span className="text-[9.5px] uppercase text-slate-500 font-bold block">硬件基础投资 (CAPEX)</span>
            <div className="text-cyan-300 font-mono font-black text-lg">${totalCapex.toFixed(2)}</div>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
              指在【AI引擎机房】所租借/签约部署的物理发运硬件折算金额。
            </p>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-xl p-4.5 space-y-1 relative group hover:border-emerald-500/10 transition-all">
            <span className="text-[9.5px] uppercase text-slate-500 font-bold block">累计爆块毛收益</span>
            <div className="text-emerald-400 font-mono font-black text-lg">{stats.accumulatedFragments.toFixed(1)} 碎片</div>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
              本账户自公网自检至今日所产生的总代工报酬，无缺扣核销。
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
            <span className="text-[9.5px] uppercase text-slate-500 font-bold block">固化晶体资产评估</span>
            <div className="text-purple-400 font-mono font-black text-lg">${crystalValuation.toFixed(2)} USDT</div>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
              持装 {stats.hashCrystals} 颗高级算能固态晶体。晶体支持极速二级回放。
            </p>
          </div>

        </div>

      </div>

      {/* 🖥️ 矿池资产负载及空闲插槽概览 (Mining Pool Slot Occupancy & Load Overview Card) */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-violet-500/[0.02] opacity-50 pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
          
          {/* Circle progress ring section */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Progress circle */}
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
                矿池资产负荷概览 ── 物理插槽负载栏
              </h4>
              <p className="text-xs text-slate-400 max-w-xl">
                中枢量子对冲机房独设了固定 <b>{maxSlots}</b> 个专用托管代工物理插槽。未装载槽随时待命，追加更多货机或高阶设备可直接释放网络算力能级的带宽。
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
      
      {/* Upper Area: User Profile Card & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* User Card */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
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
                <h3 className="text-sm font-extrabold text-white tracking-wide">
                  yudeyou0118@gmail.com
                </h3>
                
                {/* 🎖️ Custom animated enterprise badge system S1-S9 */}
                <div className="mt-1.5 flex flex-col gap-1">
                  <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${badgeMeta.color} ${badgeMeta.glow} text-slate-950 font-black text-[10px] px-3.5 py-1 rounded-xl transition-all border border-white/10 uppercase`}>
                    <Award className="size-3.5" />
                    <span>{badgeMeta.lvl}级徽章 · {badgeMeta.title}</span>
                  </div>
                  <span className="text-[9px] text-[#22d3ee] font-mono pl-1">{badgeMeta.desc}</span>
                </div>
              </div>
            </div>

            {/* Upper Referral chain info */}
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
              <span className="text-slate-400 font-medium">主频物理代工算力</span>
              <span className="font-mono font-extrabold text-white">{stats.baseHashpower.toFixed(1)} T/s</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">声网拓扑共振算力</span>
              <span className="font-mono font-extrabold text-cyan-400 text-glow-cyan">{stats.teamHashpower.toFixed(1)} T/s</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">累记固化能量晶体</span>
              <span className="font-mono font-extrabold text-yellow-400 text-glow-gold flex items-center gap-1">
                <Sparkles className="size-3.5 text-yellow-400 animate-pulse" />
                {stats.hashCrystals} 块
              </span>
            </div>
          </div>

        </div>

        {/* Invite Generator Panel */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="size-4 text-cyan-400" />
              双向绑定 ── 联邦管道密钥
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
              交付您的引力坐标。好友装配新节点时绑定该序列，直接激发下属双向谐振引擎，各享20%的基础算能定向中继投递。
            </p>
          </div>

          <div className="space-y-3 mt-4">
            {/* Invite Code display */}
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

            {/* Invite URL display */}
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
        <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.02] rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Droplet className="size-4 text-cyan-400 animate-bounce" />
              液冷抗暴缓冲站
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
              长期全天候爆算矿圈芯片极易进入物理高热。请储备足额液氮快速冷却排铅。
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
              50碎片/罐
            </button>
          </div>

          <p className="text-[10px] text-zinc-500 leading-normal mt-3 font-medium font-sans">
            提示：维护重构半衰退硬件能效。可在下方运转列表中调配执行。
          </p>
        </div>

      </div>

      {/* Trial Claim Box */}
      {!stats.hasClaimedDemo && (
        <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/5 to-transparent border border-cyan-500/30 rounded-3xl p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1">
            <span className="inline-block bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-1.5">
              新手空投契约 // FREE DEPLOYMENT
            </span>
            <h3 className="text-sm font-bold text-white">首发免费领取 7天物理体验云端设备</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium font-sans max-w-2xl leading-relaxed">
              系统特派发一台自检专用的“初学者云代工微堆”芯片。无任何抵押阻碍，即刻上线即可触发10.0 T/s的基础爆裂代工哈希流能。
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

      {/* 🏆 Achievements System panel (成就系统) */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
          <div className="space-y-1">
            <span className="text-[9px] text-violet-400 font-mono font-extrabold tracking-widest block uppercase">ACHIEVEMENT & LEVEL SEQUENCE MEDALS</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="text-yellow-400 size-4.5" />
              节点成长成就徽章系统 (Node Milestones & Badges)
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              根据您的公能历史作业打卡、固体晶体高纯固化数、以及分布式机房专属托管天数深度熔铸。点击点亮徽标可开启或查看特权增益详情。
            </p>
          </div>
        </div>

        {/* Badges interactive row */}
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

                <div className={`my-2.5 transition-transform duration-300 group-hover/badge:scale-115 ${badge.isUnlocked ? "drop-shadow-[0_2px_12px_rgba(34,211,238,0.4)]" : "opacity-35"}`}>
                  {renderBadgeIcon(badge.id, badge.isUnlocked ? "size-10 text-cyan-400" : "size-10 text-slate-500")}
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

      {/* Middle Grid: Owned Equipment List (Left), Mining Logs Display (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Owned Miners hardware details */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Cpu className="text-cyan-400 size-4" />
              已托管租赁运转设备 ({(activeMiners.length)})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">
              REAL-TIME MONITORING
            </span>
          </div>

          {activeMiners.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-black/40 border border-white/5 space-y-3 font-sans">
              <Cpu className="size-10 text-slate-600 mx-auto animate-pulse" />
              <p className="text-xs font-bold text-slate-400">目前暂未绑定云端实地机组节点</p>
              <p className="text-[10px] text-slate-500 font-medium">请于“设备租赁 / 资产”大厅租置物理算效引擎，或激活上方特批新手云代工起步。</p>
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
                            <span>托管规格：<b className="text-white">{miner.cost} USDT</b></span>
                            <span>代工能效：<b className="text-cyan-400 font-bold">{(miner.efficiency * 100).toFixed(0)}%</b></span>
                            {isDemo ? (
                              <span className="text-indigo-400 font-bold">效期：首礼7日免契</span>
                            ) : (
                              <span>熔断交割：<b className="text-slate-300">{formatDate(miner.expiresAt)}</b></span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Status progress bar & coolant repair action */}
                    <div className="bg-black/40 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 border border-white/5">
                      <div className="w-full text-xs">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-sans">
                          <span className="text-slate-400 font-medium">芯片微孔高热衰减度（低于50%触发安全熔降）</span>
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

                      {/* Coolant usage */}
                      {miner.status === "decayed" && (
                        <button
                          id={`btn-apply-coolant-${miner.id}`}
                          onClick={() => onApplyCoolant(miner.id)}
                          className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-cyan-400 to-indigo-600 hover:brightness-115 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-[11px] flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all shadow-[0_2px_10px_rgba(6,182,212,0.3)] font-sans"
                        >
                          <Droplet className="size-3.5 fill-slate-950" />
                          加注液氮
                        </button>
                      )}
                    </div>

                    {/* Tiny tip */}
                    {miner.status === "decayed" && (
                      <p className="text-[10px] font-sans text-amber-400 bg-amber-505/5 border border-amber-500/15 p-2.5 rounded-xl font-medium leading-relaxed">
                        ⚠️ 芯片局部结温过高导致算力触发50%安全熔降！立即加注液氮可完璧提速，并在契约期内享加赠 <b>+10% 算力爆发能效</b> 作为安全补偿！
                      </p>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* Slogans on the safety rules */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1 font-sans">
            <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wide">智能液冷自检协定</span>
            <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
              算力魔方分布式云代工机床支持24小时自动化故障巡航。热流过高时物理系统自动降低半衰运行效率。使用“冷却液”极速减温，能立刻还原满血状态并重置高热芯片寿命。
            </p>
          </div>

        </div>

        {/* Mining logs display */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest flex items-center gap-2">
              <History className="text-cyan-400 size-4" />
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
              <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase hidden sm:inline">
                REAL-TIME LOG
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {records.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500 font-sans font-medium">
                暂无算力生成流水明细
              </div>
            ) : (
              records.slice(0, 10).map((rec) => {
                const amountSign = rec.type === "exchange" || rec.type === "synthesize" ? "-" : "+";
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

      </div>

      {/* Direct Referrals Team List Tree Node - displaying bottom relationships */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
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
          <span>* 以上直属节点所产哈希速率按20%双向溢价权重，直接累加至您的声网共振塔结算网络内，绝不缺扣。</span>
          <span className="font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            公理共识网受控
          </span>
        </div>
      </div>

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
              className="bg-[#0b0c16] border border-white/10 rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-4 relative shadow-[0_10px_50px_rgba(34,211,238,0.15)] max-h-[85vh] overflow-y-auto flex flex-col font-sans"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3 pr-8">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-cyan-400 size-5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      算力魔方智能账本 ── 30日历史明细导出
                    </h3>
                    <span className="text-[9px] text-cyan-400 font-mono tracking-widest block font-bold">BLOCKCHAIN HISTORICAL REPORT EXPORT</span>
                  </div>
                </div>
              </div>
              {/* High-fidelity close button: touch friendly minimum hit size 44x44px */}
              <button 
                onClick={() => setShowExportModal(false)}
                className="absolute top-2 right-2 p-3 text-slate-400 hover:text-white rounded-full hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px] touch-manipulation z-10"
              >
                ✕
              </button>

              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed font-sans font-medium">
                系统从您绑定的分布式代工集群商册中，分析并抓取了截止至今日的<b>最近30天AI智能引擎分配及团队裂变日结哈希碎片产出</b>。符合星网公理对冲链下历史保全协议。
              </p>

              {exportPhase !== "ready" ? (
                <div className="bg-black/45 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 h-80 animate-fade-in select-none">
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
                      {exportPhase === "checking" && "遍历代工明细数据项..."}
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
              className="bg-[#0b0c16] border border-white/10 rounded-3xl max-w-sm sm:max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-5 relative shadow-[0_15px_60px_rgba(139,92,246,0.15)] flex flex-col font-sans"
            >
              <button 
                onClick={() => setSelectedBadge(null)}
                className="absolute top-2 right-2 p-3 text-slate-400 hover:text-white rounded-full hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px] touch-manipulation z-10"
              >
                ✕
              </button>

              <div className="text-center pt-3">
                <div className="inline-flex mb-4 bg-white/[0.03] border border-white/10 p-5 rounded-3xl shadow-inner select-none animate-bounce justify-center items-center">
                  {renderBadgeIcon(selectedBadge.id, "size-12 text-cyan-400")}
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
