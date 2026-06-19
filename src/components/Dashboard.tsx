import React, { useState, useEffect, useMemo } from "react";
import { UserStats, TaskState, ActiveMiner } from "../types";
import { 
  Zap, Cpu, Award, Activity, Gauge, 
  Smartphone, KeyRound, AlertTriangle, Coins, Users, ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";
import { DashboardChart } from "./DashboardChart";
import { LoginStreak } from "./LoginStreak";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  stats: UserStats;
  tasks: TaskState;
  activeMiners: ActiveMiner[];
  onCompleteTask: (taskKey: "watchAd" | "likeContent" | "shareMoments") => void;
  onTriggerBuff: () => void;
  onSynthesize: () => void;
  onCheckInCompleted: (rewardShards: number, addCoolant: boolean, description: string) => void;
  r1Price: number;
  r1PriceDir: "up" | "down" | "flat";
  r1PriceChange: number;
  aiTokenBuybackPrice: number; // Simulated AI Token buyback price (NEW!)
  handleExchangeTrade: (type: "buy" | "sell", amount: number, price: number, assetType?: "r1" | "ai") => boolean;
  setCurrentTab: (tab: string) => void;
}

// Simulated real-time transaction ticker list phrases
const MOCK_FOMO_TRADES = [
  { time: "刚刚", user: "User ***352", type: "buy", desc: "买入 850.00 R1 @ {price} USDT" },
  { time: "1分钟前", user: "User ***889", type: "sell", desc: "卖出 1,200.00 R1 @ {price} USDT" },
  { time: "2分钟前", user: "User ***704", type: "deploy", desc: "成功并网 1 台 [进阶训练引擎]" },
  { time: "3分钟前", user: "User ***415", type: "buy", desc: "买入 420.00 R1 @ {price} USDT" },
  { time: "5分钟前", user: "User ***190", type: "launch_stat", desc: "R1模拟发行 Token [魔方算力] 募集达 92%" },
  { time: "7分钟前", user: "User ***888", type: "buy", desc: "买入 3,000.00 R1 @ {price} USDT" },
  { time: "10分钟前", user: "User ***260", type: "sell", desc: "卖出 650.00 R1 @ {price} USDT" },
];

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  tasks,
  activeMiners,
  onCompleteTask,
  onTriggerBuff,
  onSynthesize,
  onCheckInCompleted,
  r1Price,
  r1PriceDir,
  r1PriceChange,
  aiTokenBuybackPrice,
  handleExchangeTrade,
  setCurrentTab
}) => {
  // AI Token display micro-increment ticking
  const [displayAiToken, setDisplayAiToken] = useState<number>(stats.hashFragments);

  // Recovery Pool remaining USDT limit (FOMO)
  const [recoveryPool, setRecoveryPool] = useState<number>(854291.50);

  // One-click sell Bottom Sheet states
  const [isSellSheetOpen, setIsSellSheetOpen] = useState(false);
  const [sellPct, setSellPct] = useState<25 | 50 | 75 | 100>(25);
  const [showDoubleConfirm, setShowDoubleConfirm] = useState(false);

  // Local state for scrolling FOMO trades feed
  const [fomoTrades, setFomoTrades] = useState(MOCK_FOMO_TRADES);

  // Sync displayAiToken value with stats.hashFragments
  useEffect(() => {
    setDisplayAiToken(stats.hashFragments);
  }, [stats.hashFragments]);

  // displayAiToken 100ms micro-increment loop (does NOT modify stats.hashFragments directly)
  useEffect(() => {
    const ratePerSecond = (stats.baseHashpower * 0.00015 + stats.teamHashpower * 0.00005) * 
      (stats.buffActiveUntil ? 2.0 : 1.0);
    
    if (ratePerSecond <= 0) return;

    const interval = setInterval(() => {
      setDisplayAiToken((prev) => {
        const next = prev + ratePerSecond * 0.1;
        // Anti-drift check: if local display is too far from true stats, sync it back
        if (Math.abs(next - stats.hashFragments) > 2.0) {
          return stats.hashFragments;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stats.baseHashpower, stats.teamHashpower, stats.buffActiveUntil, stats.hashFragments]);

  // Recovery pool slowly ticking down (USDT allocation FOMO)
  useEffect(() => {
    const interval = setInterval(() => {
      setRecoveryPool((prev) => {
        const delta = Math.random() * 25.0 + 5.0;
        const next = prev - delta;
        return next < 100000 ? 985200.00 : next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simulating random live trades in the scrolling list
  useEffect(() => {
    const interval = setInterval(() => {
      const users = ["***990", "***112", "***474", "***092", "***601", "***258"];
      const randUser = users[Math.floor(Math.random() * users.length)];
      const isBuy = Math.random() > 0.4;
      const amount = Math.floor(Math.random() * 2500 + 100);
      
      const newTrade = {
        time: "刚刚",
        user: `User ${randUser}`,
        type: isBuy ? "buy" : "sell",
        desc: isBuy 
          ? `买入 ${amount.toFixed(2)} R1 @ {price} USDT` 
          : `卖出 ${amount.toFixed(2)} R1 @ {price} USDT`
      };

      setFomoTrades((prev) => {
        const next = [newTrade, ...prev.slice(0, 5)];
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Calculations
  const sellableValuation = useMemo(() => {
    return displayAiToken * aiTokenBuybackPrice;
  }, [displayAiToken, aiTokenBuybackPrice]);

  const todayOutputEstimate = useMemo(() => {
    return (stats.baseHashpower * 12.96 + stats.teamHashpower * 4.32) * (stats.buffActiveUntil ? 2.0 : 1.0);
  }, [stats.baseHashpower, stats.teamHashpower, stats.buffActiveUntil]);

  // Conditions count for issuing user token (PR-3 integration)
  const issuedConditions = useMemo(() => {
    const condLevel = stats.level !== "S0 自有设备节点";
    const condOutput = stats.accumulatedFragments >= 500.0;
    const condDevices = activeMiners.filter(m => m.status !== "stopped").length >= 1;
    const condStake = (stats.r1Balance || 0) >= 100.0;
    
    let metCount = 0;
    if (condLevel) metCount++;
    if (condOutput) metCount++;
    if (condDevices) metCount++;
    if (condStake) metCount++;

    return {
      condLevel,
      condOutput,
      condDevices,
      condStake,
      metCount,
      percent: Math.round((metCount / 4) * 100)
    };
  }, [stats.level, stats.accumulatedFragments, activeMiners, stats.r1Balance]);

  // Quick sell execution
  const handleQuickSellSubmit = () => {
    const sellAmount = stats.hashFragments * sellPct / 100;
    if (sellAmount <= 0) return;

    if (sellPct === 100) {
      setShowDoubleConfirm(true);
    } else {
      const success = handleExchangeTrade("sell", sellAmount, aiTokenBuybackPrice, "ai");
      if (success) {
        setIsSellSheetOpen(false);
      }
    }
  };

  const executeAllSell = () => {
    const success = handleExchangeTrade("sell", stats.hashFragments, aiTokenBuybackPrice, "ai");
    if (success) {
      setShowDoubleConfirm(false);
      setIsSellSheetOpen(false);
    }
  };

  return (
    <div className="space-y-6 font-sans select-none pb-4 relative overflow-hidden">
      
      {/* 🚀 Wealth Growth Panel - First Fold */}
      <div className="bg-gradient-to-br from-[#0c0f24] to-[#04060f] border border-cyan-500/25 rounded-3xl p-6 relative overflow-hidden shadow-[0_4px_30px_rgba(6,182,212,0.15)]">
        {/* Decorative Grid lines to mimic advanced trading terminals */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />
        
        {/* Brand/Status row */}
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest uppercase">1人算力公司 / V1 GROWTH PANEL</span>
          </div>
          {stats.buffActiveUntil && (
            <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-md animate-pulse flex items-center gap-1">
              <Zap className="size-3 fill-amber-400 text-amber-400" />
              算力双倍加速中
            </span>
          )}
        </div>

        {/* Big numbers row */}
        <div className="mt-6 space-y-1 relative z-10">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">我的 AI Token 余额</span>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tight select-all">
              {displayAiToken.toFixed(5)}
            </span>
            <span className="text-yellow-400 font-black text-xs uppercase tracking-widest text-glow-gold">AI</span>
          </div>
        </div>

        {/* Current price, valuation, output grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/5 relative z-10 font-mono">
          
          {/* R1/USDT Price */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">R1/USDT 现价</span>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className={`text-base font-bold transition-all duration-300 ${
                r1PriceDir === "up" ? "text-green-400 text-glow-green" : r1PriceDir === "down" ? "text-red-400" : "text-white"
              }`}>
                {r1Price.toFixed(5)}
              </span>
              <span className={`text-[9px] font-extrabold flex items-center ${
                r1PriceDir === "up" ? "text-green-400" : "text-red-400"
              }`}>
                {r1PriceDir === "up" ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {r1PriceChange.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Sellable Valuation */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">AI Token 回收估值 (USDT)</span>
            <span className="text-base font-bold text-white block mt-2 text-glow-cyan">
              {sellableValuation.toFixed(4)} <span className="text-[9px] font-normal text-slate-500">U</span>
            </span>
          </div>

          {/* Today's yield Forecast */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">今日预计净产出</span>
            <span className="text-base font-bold text-cyan-400 block mt-2">
              +{todayOutputEstimate.toFixed(2)} <span className="text-[9px] font-normal text-slate-500">AI</span>
            </span>
          </div>

        </div>

        {/* Action Button: One-click Sell */}
        <div className="mt-6 relative z-10">
          <button
            onClick={() => setIsSellSheetOpen(true)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(6,182,212,0.4)] active:scale-98 transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <Coins className="size-4.5 animate-pulse" />
            一键出售 AI Token 变现 (Instant Sell)
          </button>
        </div>

      </div>

      {/* 🚀 三资产说明卡片 */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden">
        <h3 className="text-xs font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-widest mb-3.5">
          <Activity className="text-cyan-400 size-4" />
          R1 增长终端资产模型指南
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Card 1: AI Token */}
          <div className="bg-black/35 border border-white/5 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="font-extrabold text-white">AI Token / 算力 Token</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              由您的算力并网设备运行及平台任务产生。它代表大模型的 API 可用额度，不是加密货币。可直接出售给平台换取 USDT，或自用/抵扣运营开销。
            </p>
          </div>
          
          {/* Card 2: R1 */}
          <div className="bg-black/35 border border-white/5 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-extrabold text-white">R1 (平台权益 Token)</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              平台的专属权益 Token。当前作为内部账本资产，未来可以 Jetton 形式部署到 TON 链。不由设备直接产生，用于发行锁仓、提高回收额度及手续费折扣。
            </p>
          </div>

          {/* Card 3: 公司 Token */}
          <div className="bg-black/35 border border-white/5 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="font-extrabold text-white">用户公司 Token</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
              用户自己的“1人算力公司”发行的影子项目资产。需通过平台对设备并网记录、AI Token 历史产出及 R1 锁定押金进行严格审核方可挂牌。
            </p>
          </div>
        </div>
      </div>

      {/* 📊 FOMO Grid and Launch Qualification Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Eligibility Checker Card */}
        <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xs font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-widest">
                <Gauge className="text-emerald-400 size-4" />
                公司 Token 发行资格检测
              </h2>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                进度 {issuedConditions.percent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              发行自主企业 Token 需满足以下四项条件，以启用项目募集池并开放交易：
            </p>

            {/* Checklist */}
            <div className="mt-4 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/[0.03]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${issuedConditions.condLevel ? "bg-emerald-400" : "bg-red-400"}`} />
                  1. 节点等级达 S1 共建合伙人
                </span>
                <span className={`font-bold ${issuedConditions.condLevel ? "text-emerald-400" : "text-slate-500"}`}>
                  {issuedConditions.condLevel ? "已达成" : "未满足"}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/[0.03]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${issuedConditions.condOutput ? "bg-emerald-400" : "bg-red-400"}`} />
                  2. 累计 AI Token 产出 &gt;= 500 AI Token
                </span>
                <span className={`font-bold ${issuedConditions.condOutput ? "text-emerald-400" : "text-slate-500"}`}>
                  {stats.accumulatedFragments.toFixed(1)} / 500
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/[0.03]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${issuedConditions.condDevices ? "bg-emerald-400" : "bg-red-400"}`} />
                  3. 当前至少有 1 台设备运行中
                </span>
                <span className={`font-bold ${issuedConditions.condDevices ? "text-emerald-400" : "text-slate-500"}`}>
                  {activeMiners.filter(m => m.status !== "stopped").length} / 1
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/[0.03]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${issuedConditions.condStake ? "bg-emerald-400" : "bg-red-400"}`} />
                  4. 可锁定押金 R1 余额 &gt;= 100 R1
                </span>
                <span className={`font-bold ${issuedConditions.condStake ? "text-emerald-400" : "text-slate-500"}`}>
                  {(stats.r1Balance || 0).toFixed(1)} / 100
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/5 flex gap-3">
            <button
              onClick={() => setCurrentTab("launch")}
              className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-2xl min-h-[44px] transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              前往发行中心
              <ArrowUpRight className="size-4" />
            </button>
            {issuedConditions.percent < 100 && (
              <button
                onClick={() => setCurrentTab("store")}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black rounded-2xl min-h-[44px] shadow-[0_0_15px_rgba(16,185,129,0.25)] active:scale-98 transition-all flex items-center justify-center cursor-pointer"
              >
                去并网部署设备
              </button>
            )}
          </div>
        </div>

        {/* ☄️ FOMO Box - Quota, Openings, and scrolling trades */}
        <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between gap-5">
          {/* Recovery Pool & Opening list */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 border border-white/5 p-3 rounded-2xl font-mono text-center">
                <span className="text-[8px] text-slate-500 block font-bold uppercase tracking-wider">今日官方回收池剩余额度</span>
                <span className="text-base font-bold text-amber-400 block mt-1.5 text-glow-gold animate-pulse">
                  {recoveryPool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-slate-400">U</span>
                </span>
                <span className="text-[8.5px] text-slate-500 block mt-1">模拟回收池额度递减中</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-3 rounded-2xl text-center">
                <span className="text-[8px] text-slate-500 block font-mono font-bold uppercase tracking-wider">即将发行公司 Token 榜</span>
                <div className="mt-2 text-[10px] font-mono text-slate-300 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>魔方算力 (CUBE)</span>
                    <span className="text-cyan-400 flex items-center gap-0.5"><Clock className="size-3 text-cyan-400" /> 02:15</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>矩阵AI (AI-NEO)</span>
                    <span className="text-cyan-400 flex items-center gap-0.5"><Clock className="size-3 text-cyan-400" /> 06:40</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrolling recent trades FOMO flow */}
            <div className="bg-black/45 border border-white/5 rounded-2xl p-4">
              <span className="text-[9px] text-[#22d3ee] font-mono font-bold uppercase tracking-widest block mb-2.5">
                ● 交易市场报告 (SPOT EXECUTIONS)
              </span>
              <div className="h-[96px] overflow-hidden relative">
                {/* Overlay masks for gradient scroll */}
                <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-[#0b0c15] to-transparent pointer-events-none z-10" />
                <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-[#0b0c15] to-transparent pointer-events-none z-10" />
                
                <div className="space-y-2 select-none">
                  {fomoTrades.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10.5px] font-mono leading-none">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-slate-500 shrink-0">{t.time}</span>
                        <span className="text-slate-300 font-semibold truncate shrink-0">{t.user}</span>
                        <span className="text-slate-400 truncate">{t.desc.replace("{price}", r1Price.toFixed(5))}</span>
                      </div>
                      <span className={`shrink-0 font-bold text-[10px] uppercase px-1 py-0.2 rounded border ${
                        t.type === "buy" 
                          ? "bg-green-950/40 border-green-500/20 text-green-400" 
                          : t.type === "sell"
                            ? "bg-red-950/40 border-red-500/20 text-red-400"
                            : "bg-blue-950/40 border-blue-500/20 text-cyan-400"
                      }`}>
                        {t.type === "buy" ? "买入" : t.type === "sell" ? "卖出" : "发行"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 🚀 Daily Tasks Checklist & Online Checkin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Online Checkin */}
        <div className="lg:col-span-5">
          <LoginStreak 
            stats={stats} 
            activeMiners={activeMiners} 
            onCheckInCompleted={onCheckInCompleted} 
          />
        </div>

        {/* Daily Core Tasks */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-4">
            <h2 className="text-xs font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-widest">
              <Activity className="text-cyan-400 size-4" />
              每日在线 AI 算力贡献任务
            </h2>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">分发 AI Token</span>
          </div>

          <div className="space-y-3.5">
            {/* Task 1 */}
            <div className="flex items-center justify-between gap-4 p-3 bg-black/30 border border-white/5 rounded-2xl">
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="size-4 text-cyan-400" />
                  设备物理并网在线检测
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  验证本地手机 CPU / 浏览器共享核心可用性，分发 AI Token。
                </p>
              </div>
              <button
                disabled={tasks.watchAd}
                onClick={() => onCompleteTask("watchAd")}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold shrink-0 min-h-[44px] transition-all cursor-pointer flex items-center justify-center ${
                  tasks.watchAd
                    ? "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
                    : "bg-cyan-500 hover:brightness-110 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.25)] active:scale-95"
                }`}
              >
                {tasks.watchAd ? "已完成在线" : "+2.0 AI"}
              </button>
            </div>

            {/* Task 2 */}
            <div className="flex items-center justify-between gap-4 p-3 bg-black/30 border border-white/5 rounded-2xl">
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Cpu className="size-4 text-[#fbbf24]" />
                  微调数据计算代工测试
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  进行 1 组人工智能模型推理权重计算验证。
                </p>
              </div>
              <button
                disabled={tasks.likeContent}
                onClick={() => onCompleteTask("likeContent")}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold shrink-0 min-h-[44px] transition-all cursor-pointer flex items-center justify-center ${
                  tasks.likeContent
                    ? "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
                    : "bg-cyan-500 hover:brightness-110 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.25)] active:scale-95"
                }`}
              >
                {tasks.likeContent ? "已跑完微调" : "+1.0 AI"}
              </button>
            </div>

            {/* Task 3 */}
            <div className="flex items-center justify-between gap-4 p-3 bg-black/30 border border-white/5 rounded-2xl">
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Users className="size-4 text-[#c084fc]" />
                  共鸣推广邀请链接共享
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  复制分享您的共建节点连接，招揽更多物理算力节点。
                </p>
              </div>
              <button
                disabled={tasks.shareMoments}
                onClick={() => onCompleteTask("shareMoments")}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold shrink-0 min-h-[44px] transition-all cursor-pointer flex items-center justify-center ${
                  tasks.shareMoments
                    ? "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
                    : "bg-cyan-500 hover:brightness-110 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.25)] active:scale-95"
                }`}
              >
                {tasks.shareMoments ? "链接已送达" : "+3.0 AI"}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 📈 7 Day Hashpower Growth Chart */}
      <div className="p-0">
        <DashboardChart totalHashpower={stats.baseHashpower + stats.teamHashpower} />
      </div>

      {/* Quick Sell Bottom Sheet Confirmation Drawer */}
      <AnimatePresence>
        {isSellSheetOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end justify-center pointer-events-auto">
            {/* Tap outside to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsSellSheetOpen(false)} />
            
            {/* Sheet Content container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-[#0b0d19] border-t border-white/10 rounded-t-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-5 relative shadow-[0_-8px_32px_rgba(0,0,0,0.8)] z-10"
            >
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
              
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Coins className="text-amber-400 size-4.5" />
                  一键出售 AI Token 变现
                </h3>
                <button
                  onClick={() => setIsSellSheetOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 font-bold px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg min-h-[30px] cursor-pointer"
                >
                  取消
                </button>
              </div>

              {/* Assets details */}
              <div className="bg-black/35 border border-white/5 rounded-2xl p-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>AI Token 可用余额:</span>
                  <span className="text-white font-bold">{stats.hashFragments.toFixed(4)} AI</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>当前 AI Token 回收折算价:</span>
                  <span className="text-cyan-400 font-bold">{aiTokenBuybackPrice.toFixed(6)} USDT</span>
                </div>

                <div className="flex justify-between items-center text-slate-400 pt-1">
                  <span>选择卖出比例:</span>
                  <span className="text-amber-400 font-bold text-sm">{sellPct}%</span>
                </div>

                {/* Quick Select Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {([25, 50, 75, 100] as const).map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setSellPct(pct)}
                      className="py-2 text-[10px] font-mono font-bold rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 active:scale-95 transition-all min-h-[44px] cursor-pointer"
                    >
                      {pct === 100 ? "全部" : `${pct}%`}
                    </button>
                  ))}
                </div>

                <div className="h-px bg-white/5" />
                
                <div className="flex justify-between text-slate-400 pt-1">
                  <span>出售 AI Token 数量:</span>
                  <span className="text-white font-mono font-bold">{(stats.hashFragments * sellPct / 100).toFixed(4)} AI</span>
                </div>
              </div>

              {/* Settlement estimates */}
              <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>交易手续费 (0.3%):</span>
                  <span className="text-slate-500 font-mono">{(stats.hashFragments * sellPct / 100 * aiTokenBuybackPrice * 0.003).toFixed(5)} USDT</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-300 border-t border-white/5 pt-2">
                  <span>预计收到 USDT:</span>
                  <span className="text-emerald-400 font-mono text-sm text-glow-green">
                    {((stats.hashFragments * sellPct / 100 * aiTokenBuybackPrice) * 0.997).toFixed(4)} U
                  </span>
                </div>
              </div>

              {/* Tip info warning */}
              <p className="text-[10px] text-slate-500 font-medium font-sans leading-normal pl-1">
                提示：按平台当前 AI Token 模拟回收价计算，不等同于 R1/USDT 现价。
              </p>

              {/* Execution button */}
              <button
                onClick={handleQuickSellSubmit}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center min-h-[44px] cursor-pointer"
              >
                确认极速卖出
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Double Confirmation modal for selling ALL R1 */}
      <AnimatePresence>
        {showDoubleConfirm && (
          <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0f111e] border border-red-500/30 rounded-2xl max-w-sm w-full p-6 text-center shadow-[0_0_30px_rgba(239,68,68,0.2)] space-y-4"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="size-6 text-red-500 icon-glow-red animate-pulse" />
              </div>
              
              <div>
                <h3 className="text-sm font-extrabold text-red-400 uppercase tracking-wider">确认清仓全部 AI Token？</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
                  此操作将全额扣除您的 {stats.hashFragments.toFixed(4)} AI Token 并变现为模拟金。请确认这是您的意向操作。
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDoubleConfirm(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs active:scale-95 transition-all min-h-[44px] cursor-pointer border border-white/5"
                >
                  放弃
                </button>
                <button
                  onClick={executeAllSell}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-650 text-white font-black rounded-xl text-xs shadow-[0_0_15px_rgba(239,68,68,0.25)] active:scale-95 transition-all min-h-[44px] cursor-pointer"
                >
                  确认清仓
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
