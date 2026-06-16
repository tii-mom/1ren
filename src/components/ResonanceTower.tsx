import React, { useState, useEffect } from "react";
import { UserStats, UserLevel } from "../types";
import { MOCK_REFERRALS } from "../utils/storage";
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  AlertTriangle, 
  Star, 
  Trophy, 
  Sparkles, 
  TrendingUp, 
  Flame, 
  Activity, 
  Zap,
  Building,
  Crown,
  Coins,
  ChevronRight,
  FileText,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Sparkle
} from "lucide-react";

interface ResonanceTowerProps {
  stats: UserStats;
}

interface TowerLayer {
  level: number;
  name: string;
  englishCode: string;
  generations: string;
  multiplier: string;
  teamRequirement: string;
  privilege: string;
  kpiDesc: string;
}

const TOWER_LAYERS: TowerLayer[] = [
  { 
    level: 1, 
    name: "算力工作室创始人", 
    englishCode: "S1 Studio Founder", 
    generations: "第1代直聘雇员", 
    multiplier: "20% 直推管理津贴", 
    teamRequirement: "公司正式成立 (独立推理引擎就绪)", 
    privilege: "开通直属雇员业绩看板与一键薪奖分发系统",
    kpiDesc: "成功搭建首个物理推理节点，算能信道处于并网筹备状态"
  },
  { 
    level: 2, 
    name: "算力部门经理", 
    englishCode: "S2 Space Manager", 
    generations: "第1-2代雇员", 
    multiplier: "20% 直推, 15% 间推级", 
    teamRequirement: "直聘 3 名活跃工作室雇员", 
    privilege: "解锁二级雇员算能波频抽点与信噪数据审计看板",
    kpiDesc: "直辖工作室月哈希流通能效处于额定负荷，无延迟积压"
  },
  { 
    level: 3, 
    name: "算力分公司总监", 
    englishCode: "S3 Region Director", 
    generations: "第1-3代雇员", 
    multiplier: "20% 直推, 15% 间推, 10% 联推级", 
    teamRequirement: "直聘 5 名活跃工作室雇员", 
    privilege: "分配高优先级量子算标分配权，防对冲阻尼免税",
    kpiDesc: "直辖分部核心汇聚信道带宽升级，抗电磁衰减率提高20%"
  },
  { 
    level: 4, 
    name: "区域算力总裁", 
    englishCode: "S4 Region President", 
    generations: "第1-4代雇员", 
    multiplier: "20%, 15%, 10%, 8% 管理分红递推", 
    teamRequirement: "主网裂变雇员累计满 15 人", 
    privilege: "获取区域结算手续费折让、设立区域对冲调节专箱",
    kpiDesc: "所辖大区算能总流动率稳固爬升，形成闭环局域自耦合"
  },
  { 
    level: 5, 
    name: "算力集团副总裁", 
    englishCode: "S5 Group Vice President", 
    generations: "第1-5代雇员", 
    multiplier: "20%, 15%, 10%, 8%, 5% 级差大盘提成", 
    teamRequirement: "主网裂变雇员累计满 50 人", 
    privilege: "参与分布式物理槽位重组决策，集团年终特别津贴派送",
    kpiDesc: "受邀列席董事局战备扩大会议，拥有平台特权表决权"
  },
  { 
    level: 6, 
    name: "算力集团董事", 
    englishCode: "S6 Board of Director", 
    generations: "第1-7代雇员", 
    multiplier: "前5代同上，第6-7代各2%收益提成", 
    teamRequirement: "主网裂变雇员累计满 200 人", 
    privilege: "获邀参与年度海岛算力主权峰会，享受集团底池流动性空投",
    kpiDesc: "大宗算能代工信道实现全网自愈，节点年总损耗降至1%以下"
  },
  { 
    level: 7, 
    name: "算力集团合伙人", 
    englishCode: "S7 Senior Partner", 
    generations: "第1-7代雇员", 
    multiplier: "前7代同上，第7代仍为2%收益率", 
    teamRequirement: "主网裂变雇员累计满 1,000 人", 
    privilege: "享有底层治理算法定制修改权、优先选配最新高压物理晶能舱",
    kpiDesc: "直属组织深度达到7级稳定裂变，大宗算币流转无回滚延迟"
  },
  { 
    level: 8, 
    name: "算力集团首席增长官", 
    englishCode: "S8 Chief Growth Officer", 
    generations: "第1-8代雇员", 
    multiplier: "前7代同上，第8代1%无限级绩效", 
    teamRequirement: "主网裂变雇员累计满 5,000 人", 
    privilege: "自动锁定平台每日全球新增算币交易津贴的1.5%首席专项提成点",
    kpiDesc: "直属及三级子网在多国区域实现全域落地，抗单点监管风险极强"
  },
  { 
    level: 9, 
    name: "算力集团联席CEO", 
    englishCode: "S9 Joint CEO", 
    generations: "第1-9代雇员", 
    multiplier: "前8代同上，第9代1%永续代金流", 
    teamRequirement: "主网裂变雇员累计满 20,000 人", 
    privilege: "终极主理席位：按日等比瓜分全球总结算池5%高热哈希金流分红",
    kpiDesc: "站在全网算能链的神龛顶峰，执掌全网哈希波动率定价权"
  }
];

export const ResonanceTower: React.FC<ResonanceTowerProps> = ({ stats }) => {
  // Setup selected state for interactive steps detail view
  const [selectedLayer, setSelectedLayer] = useState<TowerLayer>(TOWER_LAYERS[0]);
  
  // Statement reconciliation states (Interactive terminal simulation)
  const [reconciling, setReconciling] = useState(false);
  const [reconProgress, setReconProgress] = useState(0);
  const [reconLogs, setReconLogs] = useState<string[]>([
    "▶ 等待签署星链对账凭证...",
  ]);

  // Convert level name string back to level value
  const getLevelDepth = (lvl: string): number => {
    switch (lvl) {
      case UserLevel.ZERO: return 0;
      case UserLevel.S1: return 1;
      case UserLevel.S2: return 2;
      case UserLevel.S3: return 3;
      case UserLevel.S4: return 4;
      case UserLevel.S5: return 5;
      case UserLevel.S6: return 6;
      case UserLevel.S7: return 7;
      case UserLevel.S8: return 8;
      case UserLevel.S9: return 9;
      default: return 0;
    }
  };

  const userLevelIndex = getLevelDepth(stats.level);
  const progressPercent = Math.round((userLevelIndex / 9) * 100);

  // Set the default selection to current user level
  useEffect(() => {
    if (userLevelIndex > 0 && userLevelIndex <= 9) {
      setSelectedLayer(TOWER_LAYERS[userLevelIndex - 1]);
    } else {
      setSelectedLayer(TOWER_LAYERS[0]);
    }
  }, [stats.level]);

  // Triggering visual statement reconciliation
  const handleStartReconciliation = () => {
    if (reconciling) return;
    setReconciling(true);
    setReconProgress(5);
    setReconLogs([
      "🔋 [S-Link] 建立与分布式星链主账簿高加密加密端... 100% ONLINE",
      "🔑 [RSA-2048] 正在导入创始人 yudeyou0118@gmail.com 专属密钥对...",
    ]);

    // Fast simulation sequence
    setTimeout(() => {
      setReconProgress(30);
      setReconLogs(prev => [
        ...prev,
        "🔍 [Audit-Step] 精查今日直属、第二代间接等所辖算能结算量...",
        `📊 [LEDGER] 全网总算能 Peak: ${(stats.baseHashpower + stats.teamHashpower).toFixed(3)} T/s 并接入物理对冲安全区。`
      ]);
    }, 400);

    setTimeout(() => {
      setReconProgress(65);
      setReconLogs(prev => [
        ...prev,
        `💎 [Deduction] 实扣信道摩擦电损阻抗率后，对折算可提成比例: ${selectedLayer.multiplier}`,
        "🛡️ [Anti-Burn] 阻断一切断层流失，算量无限期保全机制已启动锁定中。"
      ]);
    }, 900);

    setTimeout(() => {
      setReconProgress(100);
      setReconLogs(prev => [
        ...prev,
        `📁 [EXPORTS] 成功生成《${selectedLayer.name}》专属算能资产收益电子账单及保税凭据！`,
        "🎉 [SUCCESS] 结算账簿审核一致。您的团队收益对账无误，本期金流运行安全。"
      ]);
      setReconciling(false);
    }, 1500);
  };

  const currentLevelInfo = TOWER_LAYERS[userLevelIndex - 1] || { name: "个体算力贡献者", multiplier: "0%" };

  // Mock global leaderboard stats
  const userHashpower = stats.baseHashpower + stats.teamHashpower;
  const rawLeaderboard = [
    { name: "星际拓局者-马斯克分克", level: "算力集团合伙人 S7", hashpower: 148520.0, crystals: 382, country: "SG", isUser: false },
    { name: "Solana一姐-Tiffany", level: "算力集团董事 S6", hashpower: 96420.5, crystals: 214, country: "HK", isUser: false },
    { name: "比特金牛-温州财团", level: "算力集团董事 S6", hashpower: 84200.0, crystals: 198, country: "CN", isUser: false },
    { name: "以太坊老猫-VitalikV", level: "算力分公司总监 S3", hashpower: 71500.2, crystals: 156, country: "RU", isUser: false },
    { name: "Pancake_Maker", level: "算力分公司总监 S3", hashpower: 58900.0, crystals: 112, country: "US", isUser: false },
    { name: "凉山水电机房客服", level: "算力部门经理 S2", hashpower: 49250.0, crystals: 98, country: "CN", isUser: false },
    { name: "星愿算能领港总代", level: "算力工作室创始人 S1", hashpower: 41800.0, crystals: 84, country: "SG", isUser: false },
    { name: "DeFi_Ninja_999", level: "个体算力贡献者", hashpower: 32500.5, crystals: 61, country: "JP", isUser: false },
    { name: "Crypto_Alchemist", level: "个体算力贡献者", hashpower: 24800.0, crystals: 45, country: "KR", isUser: false },
    { name: "yudeyou0118@gmail.com (您)", level: stats.level, hashpower: userHashpower, crystals: stats.hashCrystals, country: "CN", isUser: true }
  ];

  // Dynamic ranking based on total hashpower
  const leaderboardSorted = [...rawLeaderboard].sort((a, b) => b.hashpower - a.hashpower);

  return (
    <div className="space-y-6">
      
      {/* 👑 Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Building className="size-5" />
            </span>
            董事职级晋升路径大盘 <span className="text-xs text-slate-500 font-mono font-normal">/ Career Promotion Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            审核您旗下的并网团队裂变规模。满足阶梯晋升条件，即可自动重塑更高代工提成及合伙分红特权。
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-black/45 border border-white/5 px-3 py-1.5 rounded-xl font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          免税防烧伤机制保护中
        </div>
      </div>

      {/* 📊 Corporate Dividend Status Dashboard Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0c0d1b] border border-indigo-500/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-3 rounded-full bg-gradient-to-r from-teal-500 to-indigo-500 text-slate-900 font-mono text-[9px] font-extrabold uppercase tracking-widest">
              ROLE & PERKS LEDGER
            </span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">创始人团队管理总账</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
            本账柜核心监控并网工作室创始人在 <b>S1至S9阶梯路径</b> 中的进阶深度。晋升至高纯董事级，即可完全享有 9代 深层代工业绩收益及无限级差佣金抽点，永久规避算力外溢断层上抛（烧伤机制），保障核心资本对冲流转。
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <span className="text-xs text-slate-300 bg-black/40 px-3.5 py-1.5 rounded-2xl border border-white/5 flex items-center gap-1.5 font-medium">
              <Crown className="size-3.5 text-yellow-400 animate-bounce" />
              当前账户职阶：<b className="text-indigo-300 font-extrabold font-mono">{stats.level}</b>
            </span>
            <span className="text-xs text-slate-300 bg-black/40 px-3.5 py-1.5 rounded-2xl border border-white/5 flex items-center gap-1.5 font-medium font-sans">
              🌟 已通关层级: <b className="text-[#22d3ee] font-extrabold font-mono">{userLevelIndex} / 9 层网络</b>
            </span>
          </div>
        </div>

        {/* Global Dividends Pool status block */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-indigo-400 font-mono font-extrabold tracking-widest block uppercase">GLOBAL REDISTRIBUTION POOL</span>
              <Star className={`size-4 text-yellow-400 ${stats.level === UserLevel.S9 ? "animate-spin" : "animate-pulse"}`} />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">全网 5% 手续费总结转池</h3>
            <p className="mt-1.5 text-[10px] text-slate-400 font-medium leading-normal font-sans">
              最高阶“S9 联席CEO”角色每日自动参与瓜分，累计主网精锐超过 20,000 人。
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/5 flex justify-between items-baseline font-mono">
            <span className="text-[10px] text-slate-500">今日结算权益：</span>
            <span className="text-sm font-extrabold text-yellow-400">
              {stats.level === UserLevel.S9 ? "1,485.40 T/s" : "升级 S9 CEO 后自动返还"}
            </span>
          </div>
        </div>
      </div>

      {/* S1 to S9 Career Pathway Horizontal Stepper */}
      <div className="bg-[#0b0c16]/75 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="size-4 text-cyan-400" />
              S1至S9主板阶梯步骤条 <span className="text-xs text-slate-500 font-mono font-normal">/ Interactive Path Controller</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              点击下方任一节点，一键锁定调阀查阅下方核算指标、分配比例及专项特权
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-slate-500 text-[10px] block font-semibold uppercase">当前进阶总进度</span>
            <span className="text-[#22d3ee] font-black">{progressPercent}%</span>
          </div>
        </div>

        {/* The Stepper Engine components */}
        <div className="relative w-full py-4 overflow-x-auto scrollbar-none">
          {/* Stepper horizontal wire track background */}
          <div className="absolute top-1/2 left-3 right-3 h-[2px] bg-slate-800/80 -translate-y-1/2 z-0 min-w-[760px]" />
          
          {/* Glowing user-completed state fill */}
          <div 
            style={{ width: `${progressPercent}%` }}
            className="absolute top-1/2 left-3 h-[2px] bg-gradient-to-r from-teal-400 via-indigo-400 to-cyan-500 -translate-y-1/2 z-0 transition-all duration-1000 min-w-[760px]" 
          />

          <div className="flex justify-between items-center relative z-10 min-w-[780px] px-1">
            {TOWER_LAYERS.map((layer) => {
              const depth = layer.level;
              const isUnlocked = depth <= userLevelIndex;
              const isCurrent = depth === userLevelIndex;
              const isSelected = selectedLayer.level === depth;

              // Node button style logic
              let nodeBorderColor = "border-slate-800 bg-slate-900";
              let textStyle = "text-slate-500 font-bold";
              let glowStyle = "";
              
              if (isCurrent) {
                nodeBorderColor = "border-emerald-500 bg-emerald-950/80 ring-4 ring-emerald-500/20";
                textStyle = "text-emerald-400 font-black scale-110";
                glowStyle = "shadow-[0_0_15px_rgba(16,185,129,0.35)]";
              } else if (isSelected) {
                nodeBorderColor = "border-cyan-400 bg-cyan-950/95 ring-4 ring-cyan-400/20";
                textStyle = "text-cyan-300 font-black scale-110";
                glowStyle = "shadow-[0_0_15px_rgba(34,211,238,0.35)]";
              } else if (isUnlocked) {
                nodeBorderColor = "border-[#22d3ee]/50 bg-gradient-to-b from-[#0e2133] to-[#040913]";
                textStyle = "text-slate-200 font-semibold";
              }

              return (
                <button
                  key={depth}
                  onClick={() => setSelectedLayer(layer)}
                  className={`flex flex-col items-center gap-1.5 focus:outline-none transition-all duration-300 select-none group shrink-0 w-20 cursor-pointer ${textStyle}`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-mono transition-transform duration-300 relative ${nodeBorderColor} ${glowStyle} group-hover:scale-105`}>
                    {isCurrent ? "👑" : isUnlocked ? "✓" : depth}
                    {/* Anchor indicator for select status */}
                    {isSelected && (
                      <span className="absolute -bottom-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                    )}
                  </div>
                  <span className="text-[9.5px] font-mono tracking-wider font-extrabold uppercase">S{depth} 级</span>
                  <span className="text-[8.5px] font-sans font-medium text-slate-400 opacity-80 group-hover:opacity-100 truncate w-full text-center">
                    {layer.name.length > 5 ? layer.name.substring(0, 4) + "..." : layer.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Swipe hint on mobile browsers */}
        <div className="block md:hidden text-center text-slate-500 font-sans text-[9px] mt-2 tracking-wide font-medium flex items-center justify-center gap-1">
          <span>💡 左右滑动可完整查阅 S1 至 S9 各职阶阶梯晋升账柜</span>
        </div>
      </div>

      {/* Interactive Details Cabinets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand Details: Promotion Metrics Actuary Ledger */}
        <div className="lg:col-span-7 bg-[#0b0c16]/50 border border-white/5 rounded-3xl p-6 backdrop-blur-md space-y-5">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <span className="text-[9px] text-[#22d3ee] font-mono font-extrabold tracking-widest block uppercase">GRADE AUDIT SHEET</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mt-0.5">
                <Crown className="size-4 animate-pulse text-indigo-400" />
                S{selectedLayer.level} · {selectedLayer.name} 精算指标
              </h3>
            </div>
            {selectedLayer.level === userLevelIndex ? (
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-0.5 rounded-full text-[8.5px] font-bold font-mono tracking-wider animate-pulse flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                当前账户职级 (ACTIVE)
              </span>
            ) : selectedLayer.level < userLevelIndex ? (
              <span className="bg-slate-800 text-slate-300 px-3 py-0.5 rounded-full text-[8.5px] font-bold font-mono tracking-wider">
                已通关 (PASSED)
              </span>
            ) : (
              <span className="bg-slate-900 border border-white/5 text-slate-500 px-3 py-0.5 rounded-full text-[8.5px] font-bold font-mono tracking-wider flex items-center gap-1">
                <Lock className="size-2.5 text-slate-500" />
                锁定中 (LOCKED)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* KPI requirement */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-1 transition-all hover:border-cyan-500/15">
              <span className="text-slate-500 text-[9px] block uppercase font-bold tracking-wider flex items-center gap-1">
                <Trophy className="size-3 text-cyan-400" />
                晋升考核指标 (Targets)
              </span>
              <p className="text-xs font-black text-slate-200">{selectedLayer.teamRequirement}</p>
              <p className="text-[10px] text-slate-400 font-sans mt-1 leading-normal font-medium opacity-90">
                {selectedLayer.kpiDesc}
              </p>
            </div>

            {/* Dividend rates */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-1 transition-all hover:border-violet-500/15">
              <span className="text-slate-500 text-[9px] block uppercase font-bold tracking-wider flex items-center gap-1">
                <Coins className="size-3 text-violet-400" />
                代工分红提成比 (Dividend Scale)
              </span>
              <p className="text-xs font-black text-violet-300">{selectedLayer.multiplier}</p>
              <p className="text-[10px] text-slate-400 font-sans mt-1 leading-normal font-medium opacity-90">
                结算链路深度范围：直推即第1代享极限分成，间退裂变持续延伸至 <b className="text-violet-400">{selectedLayer.generations}</b>。
              </p>
            </div>
          </div>

          {/* Core privilege */}
          <div className="bg-gradient-to-r from-indigo-950/20 to-black/40 border border-indigo-500/15 p-4.5 rounded-2xl space-y-2">
            <span className="text-slate-500 text-[9px] block uppercase font-bold tracking-wider flex items-center gap-1 font-mono">
              <ShieldCheck className="size-3.5 text-indigo-400" />
              专属行政与金流管理特权 (Executive Privileges)
            </span>
            <div className="flex gap-2">
              <div className="p-1 px-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-black self-start">
                PRIVILEGE
              </div>
              <p className="text-xs font-bold text-slate-200 leading-relaxed font-sans mt-0.5">
                {selectedLayer.privilege}
              </p>
            </div>
          </div>

          {/* Dynamic Progress indicator of local team members to next rank */}
          <div className="p-4 bg-black/35 border border-white/5 rounded-2xl">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-2">
              <span>团队直属账房活性测算:</span>
              <span className="text-slate-200">5 / 100% online</span>
            </div>
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden p-[1px]">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full" 
                style={{ width: `${Math.min(100, Math.max(25, selectedLayer.level * 11.1))}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-500 leading-normal font-sans mt-1">
              ※ 当前创始人在“算力有限公司”内网架构内的层级摩擦系数维持在 <span className="text-emerald-400 font-bold">0.05%</span> 低功耗，整体结算通道极为高能健康。
            </p>
          </div>
        </div>

        {/* Right Hand: Online Statement Interactive Terminal */}
        <div className="lg:col-span-5 bg-[#0b0c16]/50 border border-white/5 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] text-[#22d3ee] font-mono font-extrabold tracking-widest block uppercase">VOUCHER CONSOLE</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                星链资产记账对账凭据
              </h3>
            </div>
            <span className="text-[8.5px] text-indigo-400 font-mono border border-indigo-500/20 bg-indigo-950/40 px-2 py-0.5 rounded uppercase">
              RECON INSTRUMENT
            </span>
          </div>

          {/* Simulated digital report */}
          <div className="bg-black/60 border border-white/5 p-4 rounded-2xl relative overflow-hidden space-y-3 p-4 select-none">
            <div className="absolute top-0 right-0 p-3 pr-4 text-glow-indigo text-[8px] font-mono text-indigo-500 uppercase tracking-widest">
              SECURE SEC
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <FileText className="size-5 text-indigo-400" />
              </div>
              <div className="font-mono">
                <p className="text-[10px] text-slate-400 leading-tight">公司职级金流凭证账单</p>
                <p className="text-xs font-black text-white mt-0.5">S-Link Ledger Certified</p>
              </div>
            </div>

            {/* Stepped progress ticker bar */}
            {reconciling && (
              <div className="space-y-1">
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 transition-all" style={{ width: `${reconProgress}%` }} />
                </div>
                <div className="flex justify-between font-mono text-[8px] text-slate-550">
                  <span>密钥匹配及多链验证中...</span>
                  <span>{reconProgress}%</span>
                </div>
              </div>
            )}

            {/* Terminal monitor screen */}
            <div className="bg-black/90 rounded-xl p-3.5 h-[102px] overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1.5 scrollbar-thin scrollbar-thumb-indigo-950/50">
              {reconLogs.map((log, idx) => (
                <div key={idx} className="flex gap-1 animate-fade-in font-semibold break-all">
                  <span className="text-indigo-400 select-none">❯</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <button
              id="recon-trigger-btn"
              disabled={reconciling}
              onClick={handleStartReconciliation}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
                reconciling
                  ? "bg-slate-800 border border-white/5 text-slate-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-indigo-700 hover:brightness-110 active:scale-98 text-white font-extrabold shadow-[0_2px_14px_rgba(99,102,241,0.25)]"
              }`}
            >
              <Zap className={`size-3.5 text-white ${reconciling ? "animate-spin" : "animate-pulse"}`} />
              {reconciling ? "账目资产高速核算对账中..." : "一键一键星链对账导出"}
            </button>
          </div>

          {/* Anti Burn-out guide */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs text-slate-400 space-y-2 relative overflow-hidden font-sans">
            <div className="flex items-center gap-1.5 text-amber-500 font-bold font-sans">
              <AlertTriangle className="size-4 shrink-0" />
              <span>阶层降载与业绩烧伤提醒</span>
            </div>
            <p className="text-[10px] leading-relaxed font-semibold opacity-90">
              个体算力贡献者（ZERO）不参与下级深度分红。任何直推团队若产生高层级大宗晶能舱划转时，由于无创始人职阶（S1以上）承接许可，结算分红将触发“断层过载上抛”，溢过无权节点直接结算分配给上一合规S1+合伙人舱房。请确保维持必要的物理引擎运行，规避算量被烧伤上抛。
            </p>
          </div>
        </div>
      </div>

      {/* Corporate Leaderboard Suite: Top 10 Elite Founders */}
      <div className="bg-[#0b0c16]/75 border border-white/5 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-indigo-500/15">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-505/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-5">
          <div className="space-y-1">
            <span className="text-[9px] text-[#22d3ee] font-mono font-extrabold tracking-widest block uppercase">GLOBAL HALL OF FAME</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="text-yellow-400 size-4 animate-pulse" />
              全网核能星盟创始人领航金榜 (TOP 10 VIP)
            </h3>
            <p className="text-xs text-slate-400 font-sans font-medium">全网算能量排名前10的最顶层物理机卡大亨。账户总算能增加时，您的坐标节点将顺次跨越攀爬。</p>
          </div>
          <div className="flex items-center gap-2 bg-black/45 border border-white/5 px-3.5 py-1.5 rounded-full text-[10px] text-slate-400 font-mono">
            <TrendingUp className="size-3.5 text-cyan-400" />
            <span>今日全网并网峰值：<b>2,492,841.9 T/s</b></span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/35">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 font-mono font-extrabold text-[9px] tracking-wider uppercase bg-white/[0.01]">
                <th className="py-3 px-4">全球星港索引 (Rank)</th>
                <th className="py-3 px-4">宿主信标身份 (Host Node)</th>
                <th className="py-3 px-4">联盟职阶权限 (Role Tiers)</th>
                <th className="py-3 px-4">累计铸造晶体 (Crystals)</th>
                <th className="py-3 px-4">并网物理总算力 (Total Power)</th>
                <th className="py-3 px-4 text-center">通信状态 (Channel)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {leaderboardSorted.map((item, idx) => {
                const rank = idx + 1;
                let rankBadge = `${rank}`;
                let rankStyle = "text-slate-400 font-mono font-bold";
                let rowHighlight = "hover:bg-white/[0.01]";

                if (rank === 1) {
                  rankBadge = "🥇";
                  rankStyle = "text-yellow-400 text-lg font-bold filter drop-shadow-[0_0_6px_rgba(234,179,8,0.5)]";
                } else if (rank === 2) {
                  rankBadge = "🥈";
                  rankStyle = "text-slate-300 text-lg font-bold";
                } else if (rank === 3) {
                  rankBadge = "🥉";
                  rankStyle = "text-amber-600 text-lg font-bold";
                }

                if (item.isUser) {
                  rowHighlight = "bg-gradient-to-r from-indigo-500/10 via-[#22d3ee]/5 to-transparent border-y border-indigo-500/30 animate-pulse";
                }

                return (
                  <tr key={idx} className={`transition-colors ${rowHighlight}`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 text-center block ${rankStyle}`}>{rankBadge}</span>
                        {item.isUser && (
                          <span className="text-[8px] font-extrabold tracking-widest bg-cyan-400 text-slate-950 px-1.5 py-0.5 rounded font-sans">
                            YOUR NODE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                        <span className={`font-bold ${item.isUser ? "text-[#22d3ee]" : "text-slate-200"}`}>
                          {item.name}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">[{item.country}]</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-sans font-bold">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] tracking-wide ${
                        item.level.includes("S9") || item.level.includes("S8") || item.level.includes("S7") || item.level.includes("S6")
                          ? "bg-pink-950/60 text-pink-400 border border-pink-500/20" 
                          : item.level.includes("S5") || item.level.includes("S4") || item.level.includes("S3") || item.level.includes("S2") || item.level.includes("S1")
                            ? "bg-amber-950/60 text-amber-400 border border-amber-500/20"
                            : "bg-white/5 text-slate-300 border border-white/10"
                      }`}>
                        {item.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-slate-300 font-bold text-xs">
                        <Sparkle className="size-3.5 text-yellow-500 shrink-0" />
                        {item.crystals} 块
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-extrabold text-white text-base">
                        {item.hashpower.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        <span className="text-[10px] text-slate-550 font-normal ml-1">T/s</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-green-950/60 border border-green-500/20 text-green-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                        <Flame className="size-2.5 text-green-400 animate-bounce" />
                        ONLINE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
