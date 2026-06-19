import React, { useState, useEffect } from "react";
import { UserStats, TaskState, ActiveMiner } from "../types";
import { Zap, Play, Sparkles, Heart, Share2, Timer, ShieldAlert, Cpu, Award, TrendingUp, Info, Activity, Gauge, Workflow, Smartphone, KeyRound, RefreshCw, ShieldCheck, Server } from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend, 
  CartesianGrid 
} from "recharts";
import { DashboardChart } from "./DashboardChart";
import { LoginStreak } from "./LoginStreak";

// Slogans for the continuous ticker carousel
const SLOGANS = [
  "手机也能接入：系统会按 CPU 估算每日 Token 产出。",
  "购买并网设备：更高算力会带来更高 Token 产出。",
  "Token 可生成 API Key 和访问 URL，用于自用或出售。",
  "平台回收通道开放：可将闲置 Token 提交回收报价。",
  "团队节点等级保留，直属和级联节点会带来算力加权。"
];

interface DashboardProps {
  stats: UserStats;
  tasks: TaskState;
  activeMiners: ActiveMiner[];
  onCompleteTask: (taskKey: "watchAd" | "likeContent" | "shareMoments") => void;
  onTriggerBuff: () => void;
  onSynthesize: () => void;
  onCheckInCompleted: (rewardShards: number, addCoolant: boolean, description: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  tasks,
  activeMiners,
  onCompleteTask,
  onTriggerBuff,
  onSynthesize,
  onCheckInCompleted
}) => {
  const [sloganIdx, setSloganIdx] = useState(0);
  const [timeLeftStr, setTimeLeftStr] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthStageText, setSynthStageText] = useState("");
  const [tickerFragments, setTickerFragments] = useState(stats.hashFragments);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [telemetryWave, setTelemetryWave] = useState<{ time: string; "实时算力(T/s)": number; "在线率(%)": number }[]>([]);
  
  // Interactive Cube click enhancements
  const [cubeClicks, setCubeClicks] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [cubeStats, setCubeStats] = useState({ clicks: 0, efficiencyBoost: 100 });

  const triggerCubeChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      // Dual frequencies chime
      const baseFreq = 587.33; // D5 pitch is clean and technical
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.0, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (err) {
      // Audio block or lack of support: fallback silent
    }
  };

  const handleCubeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    triggerCubeChime();
    
    // Increment statistical interactions
    setCubeStats(prev => {
      const nextClicks = prev.clicks + 1;
      // Slight temporary fake dynamic boost
      const nextBoost = Math.min(150, 100 + Math.floor(nextClicks * 0.5));
      return { clicks: nextClicks, efficiencyBoost: nextBoost };
    });

    // Capture bounding rect to place click offset exactly
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Choose a technological line phrase
    const quotes = [
      "+0.021 T/s",
      "设备在线检测",
      "产出率 +0.1%",
      "服务响应 1ms",
      "Token 结算同步"
    ];
    const phrase = quotes[Math.floor(Math.random() * quotes.length)];
    const id = Date.now() + Math.random();

    setCubeClicks(prev => [...prev, { id, x, y, text: phrase }]);
    
    // Clean up floating tag
    setTimeout(() => {
      setCubeClicks(prev => prev.filter(c => c.id !== id));
    }, 1200);
  };

  useEffect(() => {
    const total = stats.baseHashpower + stats.teamHashpower;
    // Initialize with 8 historical points
    const now = new Date();
    const initialData = Array.from({ length: 8 }).map((_, i) => {
      const timeStr = new Date(now.getTime() - (8 - i) * 3000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const randomNoise = (Math.random() - 0.5) * (total * 0.05);
      return {
        time: timeStr,
        "实时算力(T/s)": parseFloat(Math.max(1, total + randomNoise).toFixed(3)),
        "在线率(%)": Math.floor(95 + Math.random() * 5),
      };
    });
    setTelemetryWave(initialData);

    const interval = setInterval(() => {
      const liveTotal = stats.baseHashpower + stats.teamHashpower;
      const noise = (Math.random() - 0.5) * (liveTotal * 0.05);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setTelemetryWave((prev) => {
        const next = prev.length >= 8 ? [...prev.slice(1)] : [...prev];
        next.push({
          time: timeStr,
          "实时算力(T/s)": parseFloat(Math.max(1, liveTotal + noise).toFixed(3)),
          "在线率(%)": Math.floor(96 + Math.random() * 4),
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [stats.baseHashpower, stats.teamHashpower]);

  const updateStreakCount = () => {
    const val = localStorage.getItem("hashcube_streak_count");
    setStreakCount(val ? parseInt(val, 10) : 0);
  };

  useEffect(() => {
    updateStreakCount();
  }, []);

  const handleStreakCheckIn = (rewardShards: number, addCoolant: boolean, description: string) => {
    onCheckInCompleted(rewardShards, addCoolant, description);
    setTimeout(updateStreakCount, 150);
  };

  // Slogan rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setSloganIdx((prev) => (prev + 1) % SLOGANS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Soft real-time micro-increments simulating active hashpower output
  useEffect(() => {
    setTickerFragments(stats.hashFragments);
  }, [stats.hashFragments]);

  useEffect(() => {
    const ratePerSecond = (stats.baseHashpower * 0.00015 + stats.teamHashpower * 0.00005) * 
      (stats.buffActiveUntil ? 2.0 : 1.0);
    
    // Smooth tick every 100ms
    const interval = setInterval(() => {
      setTickerFragments((prev) => {
        const next = prev + ratePerSecond * 0.1;
        // Periodic soft sync to prevent drifting too far from global state
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [stats.baseHashpower, stats.teamHashpower, stats.buffActiveUntil]);

  // Buff countdown timer
  useEffect(() => {
    if (!stats.buffActiveUntil) {
      setTimeLeftStr("");
      return;
    }
    const updateCountdown = () => {
      const end = new Date(stats.buffActiveUntil!).getTime();
      const now = new Date().getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeftStr("");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeftStr(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [stats.buffActiveUntil]);

  // Synthesis process simulation
  const handleSynthClick = () => {
    if (stats.hashFragments < 100) return;
    setIsSynthesizing(true);
    setSynthStageText("[1/3] 校验 Token 余额和服务额度...");

    setTimeout(() => {
      setSynthStageText("[2/3] 生成 API Key 和访问 URL...");
    }, 650);

    setTimeout(() => {
      setSynthStageText("[3/3] 写入服务凭证记录...");
    }, 1350);

    setTimeout(() => {
      onSynthesize();
      setIsSynthesizing(false);
      setSynthStageText("");
    }, 2000);
  };

  const hasBuff = !!stats.buffActiveUntil;
  const currentProgress = Math.min(100, Math.floor(tickerFragments % 100));

  // Tomorrow's Yield Forecast estimate calculations
  const tomorrowBaseEstimate = stats.baseHashpower * 12.96;
  const tomorrowTeamEstimate = stats.teamHashpower * 4.32;
  const tomorrowTotalEstimate = (tomorrowBaseEstimate + tomorrowTeamEstimate) * (hasBuff ? 1.5 : 1.0); // weighted multiplier for yield expectancy
  const progressTarget = 150;
  const progressPercent = Math.min(100, Math.round((tomorrowTotalEstimate / progressTarget) * 100));
  const phoneDailyEstimate = React.useMemo(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isApple = /iPhone|iPad|Macintosh/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const base = isApple ? 0.82 : isAndroid ? 0.58 : 0.36;
    const model = isApple ? "iPhone / Apple Silicon" : isAndroid ? "Android 手机" : "当前浏览器设备";
    return {
      model,
      daily: base,
      hourly: base / 24,
      score: isApple ? "A-" : isAndroid ? "B" : "C"
    };
  }, []);

  // Generate predictive trend data for the next 5 days
  const predictiveTrendData = React.useMemo(() => {
    const days = ["明日(D1)", "后天(D2)", "D3日预测", "D4日预测", "D5日预测"];
    
    return days.map((dayLabel, idx) => {
      const daySeq = idx + 1; // 1, 2, 3, 4, 5
      
      // OPTIMIZED TREND: assuming user applies coolant, keeping maximum efficiency (>1.0)
      const baseWithCoolant = activeMiners && activeMiners.length > 0 ? activeMiners.reduce((sum, m) => {
        if (m.status === "stopped") return sum;
        // maintained efficiency is fully kept at 1.1 or current efficiency if higher
        const maintainedEff = Math.max(1.1, m.efficiency);
        return sum + (m.cost * 0.15 * maintainedEff);
      }, 10.0) : stats.baseHashpower;

      // UNMAINTAINED TREND: assuming user lets efficiency decay by -0.15 per day down to 0.5 minimum
      const baseWithDecay = activeMiners && activeMiners.length > 0 ? activeMiners.reduce((sum, m) => {
        if (m.status === "stopped") return sum;
        const decayedEff = Math.max(0.5, m.efficiency - (0.15 * daySeq));
        return sum + (m.cost * 0.15 * decayedEff);
      }, 10.0) : stats.baseHashpower;

      const optBaseYield = baseWithCoolant * 12.96;
      const decBaseYield = baseWithDecay * 12.96;

      const teamYield = stats.teamHashpower * 4.32;

      // If they currently have a buff active, it increases Tomorrow's (Day 1) expectation slightly
      const isBuffActiveOnDay1 = daySeq === 1 && !!stats.buffActiveUntil;
      const buffMultiplier = isBuffActiveOnDay1 ? 1.5 : 1.0;

      const optTotal = parseFloat(((optBaseYield + teamYield) * buffMultiplier).toFixed(2));
      const decTotal = parseFloat(((decBaseYield + teamYield) * buffMultiplier).toFixed(2));

      return {
        name: dayLabel,
        "饱和维护预期(Peak)": optTotal,
        "未维护衰减预期(Decay)": decTotal,
      };
    });
  }, [activeMiners, stats.baseHashpower, stats.teamHashpower, stats.buffActiveUntil]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="cyber-icon-wrapper p-2 text-cyan-400">
              <Cpu stroke="url(#gradient-cyan-blue)" className="size-5 icon-glow-cyan" />
            </span>
            公司总览 <span className="text-xs text-slate-500 font-mono font-normal">/ Token Production</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            管理自有设备、并网设备、团队节点和 Token 使用路径。
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-black/45 border border-white/5 px-3 py-1.5 rounded-xl font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Token 结算服务 ONLINE
        </div>
      </div>

      {/* Warning Banner for un-upgraded users */}
      {!stats.hasClaimedDemo && (
        <div id="notice-banner" className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs md:text-sm text-yellow-400 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-yellow-500/10 w-full h-[1.5px]" />
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-yellow-400 size-5 shrink-0" />
            <span className="font-semibold">
              检测到您还没有激活自有设备。可以在后台领取手机共享算力体验节点，也可以直接去算力设备大厅购买部署并网设备。
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Smartphone className="size-6" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white">手机共享算力测算</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    系统按设备类型和 CPU 能力估算产出。手机产量较低，适合零成本体验。
                  </p>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-lg">
                  评分 {phoneDailyEstimate.score}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div className="bg-black/35 border border-white/5 rounded-xl p-4">
                  <span className="text-[10px] text-slate-500 font-mono block">检测设备</span>
                  <span className="text-sm font-bold text-white mt-1 block">{phoneDailyEstimate.model}</span>
                </div>
                <div className="bg-black/35 border border-white/5 rounded-xl p-4">
                  <span className="text-[10px] text-slate-500 font-mono block">预计日产出</span>
                  <span className="text-xl font-mono font-black text-cyan-400 mt-1 block">
                    {phoneDailyEstimate.daily.toFixed(2)} Token
                  </span>
                </div>
                <div className="bg-black/35 border border-white/5 rounded-xl p-4">
                  <span className="text-[10px] text-slate-500 font-mono block">在线小时产出</span>
                  <span className="text-xl font-mono font-black text-white mt-1 block">
                    {phoneDailyEstimate.hourly.toFixed(3)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-400">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">手机共享: 低产出</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">并网设备: 高产出</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">Token: 可生成 API/URL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound className="size-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Token 可以做什么</h2>
          </div>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-3 bg-black/30 border border-white/5 rounded-xl p-3">
              <span className="font-mono text-cyan-400 font-black">01</span>
              <span>生成 API Key 或访问 URL，给自己的应用调用算力服务。</span>
            </div>
            <div className="flex items-start gap-3 bg-black/30 border border-white/5 rounded-xl p-3">
              <span className="font-mono text-cyan-400 font-black">02</span>
              <span>把 API/URL 对外出售，按服务额度交付给客户。</span>
            </div>
            <div className="flex items-start gap-3 bg-black/30 border border-white/5 rounded-xl p-3">
              <span className="font-mono text-cyan-400 font-black">03</span>
              <span>提交平台回收报价，将闲置 Token 兑换成账户余额。</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento-style Announcement / Slogan Banner */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/20 rounded-2xl flex items-center px-6 py-3.5 justify-between gap-4 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.1)]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="px-2.5 py-1 bg-cyan-400 text-black font-extrabold text-xs rounded shadow-md tracking-wider uppercase shrink-0">公告</span>
          <p className="text-sm font-semibold italic text-slate-100 truncate">
            {SLOGANS[sloganIdx]}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-cyan-400 select-none shrink-0 border border-cyan-500/20 bg-cyan-950/40 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
          算力加速已就绪
        </div>
      </div>

      {/* 📊 公司运营动态仪表盘 (Company Operations Dynamic ERP Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 今日产出精密监控 */}
        <div className="bg-[#0b0c16]/80 border border-cyan-500/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md hover:border-cyan-400/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-[9px] text-[#06b6d4] font-mono tracking-widest uppercase">
            LIVE TELEMETRY
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3 font-sans">
            <span className="p-1 px-1.5 rounded bg-cyan-950/60 border border-cyan-500/20 text-[#06b6d4]">
              <Activity className="size-3.5 animate-pulse" />
            </span>
            实时 Token 产出
          </div>

          <div className="flex items-baseline gap-1 mr-2">
            <span className="text-2xl font-mono font-black text-white">
              {(stats.baseHashpower * 12.96 + stats.teamHashpower * 4.32).toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Token / H</span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">设备在线率: <span className="text-emerald-400 font-bold font-mono">99.85% ONLINE</span></p>

          {/* Real-time mini line graph */}
          <div className="h-[90px] w-full mt-4 bg-black/40 border border-white/5 rounded-xl p-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryWave} margin={{ top: 5, right: 5, left: -40, bottom: 0 }}>
                <YAxis domain={['auto', 'auto']} tick={false} axisLine={false} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-cyan-500/30 text-[10px] rounded p-1.5 shadow-md font-mono text-cyan-400 text-center">
                          {payload[0].value} T/s
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="实时算力(T/s)" 
                  stroke="#06b6d4" 
                  strokeWidth={1.5} 
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: 累计算力并网效能 */}
        <div className="bg-[#0b0c16]/80 border border-cyan-500/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md hover:border-cyan-400/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-[9px] text-cyan-500 font-mono tracking-widest uppercase font-bold">
            GRID CORE STATE
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3 font-sans">
            <span className="p-1 px-1.5 rounded bg-cyan-950/60 border border-cyan-500/20 text-[#06b6d4]">
              <Gauge className="size-3.5" />
            </span>
            算力来源占比
          </div>

          <div className="flex items-baseline gap-1 mr-2">
            <span className="text-2xl font-mono font-black text-cyan-400">
              {(stats.baseHashpower + stats.teamHashpower).toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">T/s</span>
          </div>
          
          {/* Progress split indicator */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>自有/并网设备: {stats.baseHashpower.toFixed(1)} T/s</span>
              <span>{Math.round(stats.baseHashpower / Math.max(1, stats.baseHashpower + stats.teamHashpower) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden flex">
              <div 
                className="bg-cyan-400 h-full animate-pulse" 
                style={{ width: `${(stats.baseHashpower / Math.max(1, stats.baseHashpower + stats.teamHashpower) * 100)}%` }} 
              />
              <div 
                className="bg-cyan-600 h-full" 
                style={{ width: `${(stats.teamHashpower / Math.max(1, stats.baseHashpower + stats.teamHashpower) * 100)}%` }} 
              />
            </div>
            <p className="text-[9px] text-slate-500 leading-normal font-sans mt-1">
              团队节点加权会叠加到总算力，设备越多、节点越活跃，Token 产出越高。
            </p>
          </div>
        </div>

        {/* Card 3: API/URL generation */}
        <div className="bg-[#0b0c16]/80 border border-cyan-500/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md hover:border-cyan-400/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-3 text-[9px] text-[#eab308] font-mono tracking-widest uppercase">
            REACTOR SYNTHESIS
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3 font-sans">
            <span className="p-1 px-1.5 rounded bg-yellow-950/60 border border-yellow-500/20 text-[#facc15]">
              <Workflow className="size-3.5" />
            </span>
            API/URL 生成进度
          </div>

          <div className="flex items-baseline gap-1 mr-2">
            <span className="text-2xl font-mono font-black text-yellow-400">
              {Math.floor(tickerFragments % 100)}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">生成进度</span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden p-[1px] relative">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-yellow-600 via-amber-400 to-white animate-pulse"
                style={{ width: `${currentProgress}%`, transition: "width 0.4s ease-out" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-slate-500 mt-1">
              <div>Token: <span className="text-slate-300">{(tickerFragments % 100).toFixed(1)} / 100</span></div>
              <div className="text-right">服务: <span className="text-emerald-400">可用</span></div>
            </div>
            <button
              id="dash-quick-synth"
              disabled={stats.hashFragments < 100 || isSynthesizing}
              onClick={handleSynthClick}
              className={`w-full py-1.5 px-3 rounded-lg border font-black text-[9px] uppercase tracking-wider transition-all duration-200 mt-2 ${
                stats.hashFragments >= 100
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500 border-yellow-400 text-black shadow-md cursor-pointer hover:scale-[1.02]"
                  : "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed"
              }`}
            >
              {isSynthesizing ? "正在生成..." : stats.hashFragments >= 100 ? "生成 1 组 API/URL" : "需达到 100 Token"}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Visual Block & Core Crystal Dashboard (Bento layout style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-0 rounded-2xl">
        
        {/* Left Side: 3D Hashcube Interactive Container (Bento style) */}
        <div 
          onClick={handleCubeClick}
          className={`lg:col-span-4 bg-white/5 border rounded-2xl p-6 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden backdrop-blur-md transition-all duration-300 cursor-pointer select-none group ${
            hasBuff 
              ? "border-amber-500/20 hover:border-amber-500/45 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]" 
              : "border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]"
          }`}
        >
          <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
            hasBuff
              ? "bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18)_0%,transparent_70%)]"
              : "bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)]"
          }`} />
          
          {/* Subtle click guide absolute indicator */}
          <div className="absolute top-3 left-4 text-[9px] font-mono text-slate-500 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full animate-ping inline-block ${hasBuff ? "bg-amber-400" : "bg-cyan-400"}`} />
            {hasBuff ? "算力加速运行中" : "点击检测结算核心"}
          </div>

          <div className={`absolute top-3 right-4 text-[9px] font-mono bg-white/5 border border-white/5 px-2 py-0.5 rounded-md ${
            hasBuff ? "text-amber-400 text-glow-gold font-bold" : "text-slate-400"
          }`}>
            振动谱: {hasBuff ? "200% OVERDRIVE" : `${cubeStats.efficiencyBoost}%`}
          </div>

          {/* Render click echos floating upward */}
          {cubeClicks.map(click => (
            <div
              key={click.id}
              className={`absolute text-[10px] font-mono font-black bg-slate-900/95 border px-2 py-0.5 rounded-md pointer-events-none animate-bounce z-50 animate-duration-1000 ${
                hasBuff 
                  ? "text-amber-400 text-glow-gold border-amber-400/30" 
                  : "text-cyan-400 text-glow-cyan border-cyan-400/30"
              }`}
              style={{
                left: click.x - 30,
                top: click.y - 12,
                transform: "translateY(-15px)",
                animation: "pulse-glow 0.8s ease-out forwards"
              }}
            >
              {click.text}
            </div>
          ))}
          
          <div className="cube-wrap scale-110 md:scale-125 mb-8 mt-5 pointer-events-none group-active:scale-95 transition-transform duration-100">
            <div className={`cube ${hasBuff ? "cube-glow-amber animate-pulse" : "cube-glow"}`}>
              <div className={`cube-face face-front flex items-center justify-center font-mono text-[10.5px] font-bold ${
                hasBuff 
                  ? "cube-face-amber" 
                  : "text-cyan-400/80 bg-black/60 border border-cyan-500/30"
              }`}>CUBE-α</div>
              <div className={`cube-face face-back flex items-center justify-center font-mono text-[10.5px] font-bold ${
                hasBuff 
                  ? "cube-face-amber" 
                  : "text-cyan-400/80 bg-black/60 border border-cyan-500/30"
              }`}>CUBE-β</div>
              <div className={`cube-face face-right flex items-center justify-center font-mono text-[10.5px] font-bold ${
                hasBuff 
                  ? "cube-face-amber" 
                  : "text-cyan-400/80 bg-black/60 border border-cyan-500/30"
              }`}>CUBE-γ</div>
              <div className={`cube-face face-left flex items-center justify-center font-mono text-[10.5px] font-bold ${
                hasBuff 
                  ? "cube-face-amber" 
                  : "text-cyan-400/80 bg-black/60 border border-cyan-500/30"
              }`}>CUBE-δ</div>
              <div className={`cube-face face-top flex items-center justify-center font-mono text-[10.5px] font-bold ${
                hasBuff 
                  ? "cube-face-amber" 
                  : "text-cyan-400/80 bg-black/60 border border-cyan-500/30"
              }`}>CUBE-ε</div>
              <div className={`cube-face face-bottom flex items-center justify-center font-mono text-[10.5px] font-bold ${
                hasBuff 
                  ? "cube-face-amber" 
                  : "text-cyan-400/80 bg-black/60 border border-cyan-500/30"
              }`}>CUBE-ζ</div>
              {/* Nested Core */}
              <div className={`absolute top-1/4 left-1/4 w-12 h-12 rounded-lg blur-md animate-ping ${
                hasBuff ? "bg-amber-500/40" : "bg-cyan-500/40"
              }`} />
            </div>
          </div>

          <div className="text-center z-10 pointer-events-none">
            <span className={`text-xs font-mono font-black tracking-widest uppercase animate-pulse ${
              hasBuff ? "text-amber-400 text-glow-gold" : "text-cyan-400 text-glow-cyan"
            }`}>
              {hasBuff ? "双倍算力已激活" : "点击检测产出"}
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold font-mono">
              激发次数: {cubeStats.clicks} 次 | 信流阻力: 0.12%
            </p>
          </div>
        </div>

        {/* Right Side: Key Numerical Indices (Bento style) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
          
          {/* Main big numbers with ticking shard value */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="text-xs text-slate-400 font-semibold tracking-widest uppercase">核心仪表盘 / CORE METRICS</span>
              <span className="text-xs bg-black/40 border border-white/10 px-3.5 py-1.5 rounded-full text-slate-300 font-mono flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee]" />
                智能哈希生成中...
              </span>
            </div>

            <div className="flex items-baseline justify-between flex-wrap gap-4 mt-4">
              <div className="flex items-baseline gap-2">
                <h1 className="text-4xl md:text-5xl font-mono font-extrabold text-white tracking-tight select-all">
                  {tickerFragments.toFixed(5)}
                </h1>
                <span className="text-cyan-400 text-xs font-black uppercase tracking-widest text-glow-cyan">Token 余额</span>
              </div>
              
              {streakCount > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-extrabold rounded-full font-mono shadow-[0_0_12px_rgba(234,179,8,0.15)] animate-bounce duration-1000">
                  <Award className="size-3.5 text-yellow-400" />
                  <span>已连续并网 {streakCount} 天</span>
                </div>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-white/10 pt-6">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">个人基础算力</span>
                <span className="text-xl md:text-2xl font-mono font-bold text-white block mt-1">
                  {stats.baseHashpower.toFixed(2)} <span className="text-xs font-medium text-slate-500">T/s</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">团队加成算力</span>
                <span className="text-xl md:text-2xl font-mono font-bold text-cyan-400 text-glow-cyan block mt-1">
                  +{stats.teamHashpower.toFixed(2)} <span className="text-xs font-medium text-cyan-600">T/s</span>
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">累计 Token 产出</span>
                <span className="text-xl md:text-2xl font-mono font-bold text-white block mt-1">
                  {stats.accumulatedFragments.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </span>
              </div>
            </div>
          </div>

          {/* Synth bar */}
          <div className="mt-8 border-t border-white/10 pt-6 space-y-4">
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-3 bg-cyan-400 rounded-sm inline-block animate-pulse"></span>
                API/URL 生成额度 ({Math.floor(tickerFragments % 100)}/100)
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                满 100 Token 即可生成 1 组服务凭证
              </span>
            </div>

            <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 p-[1.5px] relative">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-white shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                style={{ width: `${currentProgress}%`, transition: "width 0.4s ease-out" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse pointer-events-none" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-slate-400 pt-1">
              <span className="font-medium text-slate-400">
                {isSynthesizing ? (
                  <span className="text-cyan-400 font-mono font-bold animate-pulse">{synthStageText}</span>
                ) : (
                  "Token 可转换为 API Key 和访问 URL。"
                )}
               </span>
              
              <button
                id="btn-synth-crystal"
                disabled={stats.hashFragments < 100 || isSynthesizing}
                onClick={handleSynthClick}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg border font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                  stats.hashFragments >= 100
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 border-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] active:scale-95 cursor-pointer hover:brightness-110"
                    : "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed"
                }`}
              >
                <Sparkles className={`size-4 ${isSynthesizing ? "animate-spin text-black" : ""}`} />
                {isSynthesizing ? "正在生成凭证..." : stats.hashFragments >= 100 ? "立即生成 API/URL" : "Token 不足 100 个"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tomorrow's Estimated Yield trend card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
          <div className="space-y-1">
            <span className="text-[9px] text-cyan-400 font-mono font-extrabold tracking-widest block uppercase">PREDICTIVE ANALYTICS ENGINE</span>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="text-cyan-400 size-4.5 animate-pulse" />
              明日预计净增产出及 5 日收益预测
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              根据物理机组算力、级联并网倍率及冷却液状态算法推算。
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-cyan-950/20 border border-cyan-500/20 px-3.5 py-2 rounded-2xl shrink-0">
            <div className="text-right">
              <span className="text-[8px] text-slate-500 font-mono font-bold block uppercase">Predictive State</span>
              <span className="text-xs font-mono font-extrabold text-cyan-400 flex items-center gap-1 mt-1 leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block mr-1" />
                饱和趋势分析中
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic breakdown grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Main expectation column */}
          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between min-h-[90px]">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block">明日全速预估总利润(Peak)</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-mono font-extrabold text-cyan-400 text-glow-cyan">
                +{tomorrowTotalEstimate.toFixed(4)}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Token / 天</span>
            </div>
          </div>

          {/* Source breakdown column */}
          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2 flex flex-col justify-center">
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>物理机组基础期望产出:</span>
              <span className="font-mono font-bold text-white">+{tomorrowBaseEstimate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>团队节点加权产出:</span>
              <span className="font-mono font-bold text-cyan-400 ml-1">+{tomorrowTeamEstimate.toFixed(2)}</span>
            </div>
          </div>

          {/* Target milestone analysis */}
          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between min-h-[90px]">
            <div>
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block">可生成服务凭证 (100:1)</span>
              <span className="text-lg font-mono font-extrabold text-glow-gold block mt-2 text-yellow-400">
                约 {(tomorrowTotalEstimate / 100).toFixed(2)} 组 API/URL
              </span>
            </div>
          </div>
        </div>

        {/* Linear progress bar trend indicator */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>首日产能预计 (Target: 150 Token/日):</span>
            <span className="font-bold text-white">{progressPercent}% ({tomorrowTotalEstimate.toFixed(0)} / 150)</span>
          </div>
          <div className="h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 p-[1px] relative">
            <div 
              className={`h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 transition-all duration-1000 shadow-[0_0_10px_rgba(52,211,153,0.3)]`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 5-Day predictive trend chart of yield decay vs peak performance */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3.5">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-cyan-400 rounded-sm inline-block"></span>
              未来 5 日收益演变趋势预测
            </h4>
            <div className="flex gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full inline-block"></span>
                饱和维护 (Peak)
              </span>
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="w-2.5 h-0.5 bg-amber-500 rounded-full inline-block"></span>
                未维护降频 (Decay)
              </span>
            </div>
          </div>

          <div className="h-[185px] w-full font-mono bg-black/35 border border-white/5 rounded-2xl p-3" id="yield-predictive-forecast-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictiveTrendData} margin={{ top: 12, right: 12, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-5}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length >= 2) {
                      return (
                        <div className="bg-slate-900/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md">
                          <div className="font-sans font-bold text-[10px] text-cyan-400 tracking-wider mb-2 uppercase flex items-center gap-1">
                            <Cpu className="size-3" />
                            算力期望模拟
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans mb-2">{payload[0].payload.name}</p>
                          <div className="space-y-1 text-xs">
                            <p className="text-cyan-400 font-medium">
                              保持维护: <b className="font-mono font-bold text-white">+{payload[0].value}</b> Token
                            </p>
                            <p className="text-amber-500 font-medium">
                              未维护降频: <b className="font-mono font-bold text-white">+{payload[1].value}</b> Token
                            </p>
                            <p className="text-slate-500 font-sans text-[9px] border-t border-white/5 pt-1 mt-1">
                              差值节约: <span className="text-yellow-400 font-mono font-semibold">+{(Number(payload[0].value) - Number(payload[1].value)).toFixed(1)}</span> Token
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="饱和维护预期(Peak)"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: "#22d3ee", strokeWidth: 1, fill: "#030712" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="未维护衰减预期(Decay)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, stroke: "#f59e0b", strokeWidth: 1, fill: "#030712" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coolant maintenance status indicator block */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className={`cyber-icon-wrapper p-2 ${
              stats.coolantCount > 0 
                ? "text-cyan-400 border-cyan-500/25" 
                : "text-amber-500 border-amber-500/30 animate-pulse"
            }`}>
              <Info stroke={stats.coolantCount > 0 ? "url(#gradient-cyan-blue)" : "url(#gradient-amber-orange)"} className={`size-4 ${stats.coolantCount > 0 ? "icon-glow-cyan" : "icon-glow-amber"}`} />
            </div>
            <div>
              <span className="text-[11px] text-slate-300 font-semibold block">
                设备维护包库存: <b>{stats.coolantCount} 个</b>
              </span>
              <span className="text-[10px] text-slate-400 block">
                {stats.coolantCount > 0 
                  ? "维护包充足，降频设备可随时恢复效率。" 
                  : "当前维护包为 0。设备长时间运行后可能降频，建议前往物资页或后台购买。"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Login Streak tracker (Bento row) */}
      <LoginStreak onCheckInCompleted={handleStreakCheckIn} />

      {/* Recharts 7-Day Hashrate Growth Area Chart */}
      <DashboardChart totalHashpower={stats.baseHashpower + stats.teamHashpower} />

      {/* Grid containing Quick Task Panels and Blitz Double Trigger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Panel 1: daily production tasks */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div className="absolute top-0 right-6 bg-cyan-500/20 px-3 py-1 rounded-b-xl text-[10px] text-cyan-300 font-bold tracking-widest border-x border-b border-cyan-500/20 uppercase font-mono">
            Daily reset
          </div>
          
          <h2 className="text-sm font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-2">
            每日产出任务
          </h2>
          <p className="text-xs text-slate-400 mb-6">保持设备在线、完成测试任务和邀请节点，可获得少量 Token 奖励。</p>

          <div className="space-y-4">
            {/* Task 1 */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
              tasks.watchAd
                ? "bg-black/20 border-white/5 text-slate-500 opacity-50"
                : "bg-black/40 border-white/5 text-slate-200 hover:border-cyan-500/50 transition-colors"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`cyber-icon-wrapper p-2 ${tasks.watchAd ? "text-slate-600 border-white/5" : "text-cyan-400 border-cyan-500/25"}`}>
                  <Play stroke={tasks.watchAd ? "currentColor" : "url(#gradient-cyan-blue)"} className={`size-4 ${tasks.watchAd ? "" : "animate-pulse icon-glow-cyan"}`} />
                </div>
                <div>
                  <span className="text-sm font-bold block">保持设备在线 2 小时</span>
                  <span className="text-[10px] text-slate-400 font-mono">奖励: +2.0 Token</span>
                </div>
              </div>
              {tasks.watchAd ? (
                <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-white/5 rounded">已完成</span>
              ) : (
                <button
                  id="task-watch-ad"
                  onClick={() => onCompleteTask("watchAd")}
                  className="px-3 py-1.5 bg-cyan-500 text-black text-[10px] font-black rounded uppercase shadow-[0_2px_10px_rgba(6,182,212,0.4)] transition-all cursor-pointer hover:brightness-110 active:scale-95"
                >
                  执行
                </button>
              )}
            </div>

            {/* Task 2 */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
              tasks.likeContent
                ? "bg-black/20 border-white/5 text-slate-500 opacity-50"
                : "bg-black/40 border-white/5 text-slate-200 hover:border-cyan-500/50 transition-colors"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`cyber-icon-wrapper p-2 ${tasks.likeContent ? "text-slate-600 border-white/5" : "text-cyan-400 border-cyan-500/25"}`}>
                  <Cpu stroke={tasks.likeContent ? "currentColor" : "url(#gradient-cyan-blue)"} className={`size-4 ${tasks.likeContent ? "" : "animate-pulse icon-glow-cyan"}`} />
                </div>
                <div>
                  <span className="text-sm font-bold block">完成一次 AI 推理测试任务</span>
                  <span className="text-[10px] text-slate-400 font-mono">奖励: +1.0 Token</span>
                </div>
              </div>
              {tasks.likeContent ? (
                <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-white/5 rounded">已完成</span>
              ) : (
                <button
                  id="task-like-content"
                  onClick={() => onCompleteTask("likeContent")}
                  className="px-3 py-1.5 bg-cyan-500 text-black text-[10px] font-black rounded uppercase transition-all cursor-pointer hover:brightness-110 active:scale-95"
                >
                  执行
                </button>
              )}
            </div>

            {/* Task 3 */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
              tasks.shareMoments
                ? "bg-black/20 border-white/5 text-slate-500 opacity-50"
                : "bg-black/40 border-white/5 text-slate-200 hover:border-cyan-500/50 transition-colors"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`cyber-icon-wrapper p-2 ${tasks.shareMoments ? "text-slate-600 border-white/5" : "text-cyan-400 border-cyan-500/25"}`}>
                  <Share2 stroke={tasks.shareMoments ? "currentColor" : "url(#gradient-cyan-blue)"} className={`size-4 ${tasks.shareMoments ? "" : "icon-glow-cyan"}`} />
                </div>
                <div>
                  <span className="text-sm font-bold block">分享邀请链接并激活节点</span>
                  <span className="text-[10px] text-slate-400 font-mono">奖励: +3.0 Token</span>
                </div>
              </div>
              {tasks.shareMoments ? (
                <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-white/5 rounded">已完成</span>
              ) : (
                <button
                  id="task-share-moments"
                  onClick={() => onCompleteTask("shareMoments")}
                  className="px-3 py-1.5 bg-cyan-500 text-black text-[10px] font-black rounded uppercase transition-all cursor-pointer hover:brightness-110 active:scale-95"
                >
                  执行
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel 2: one-hour production boost */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]">
          {/* Subtle grid lines background to look very technological */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:16px_16px]" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Zap stroke="url(#gradient-amber-orange)" className="size-4 icon-glow-amber fill-amber-400/10" />
                60 分钟算力加速
              </h2>
              {hasBuff && (
                <span className="animate-pulse bg-red-950 border border-red-500/40 text-red-400 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 font-mono tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  ENERGY OVERDRIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              每 24 小时可开启一次加速时段。开启后，自有设备、并网设备和团队节点产出按 200% 结算，持续 1 小时。
            </p>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-xl flex items-center justify-center">
              <Timer className="size-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-450 block uppercase tracking-wider font-mono font-semibold">
                {hasBuff ? "加速剩余时间" : "加速功能可用"}
              </span>
              <span className="text-xl font-mono font-bold text-white block mt-1">
                {hasBuff ? timeLeftStr : "01:00:00 (可随时激活)"}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              id="btn-trigger-buff"
              disabled={hasBuff}
              onClick={onTriggerBuff}
              className={`w-full py-3.5 px-4 rounded-xl font-bold tracking-wider text-xs uppercase transition-all duration-300 ${
                hasBuff
                  ? "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-black shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-[0.98] cursor-pointer"
              }`}
            >
              {hasBuff ? "算力加速运行中" : "开启 200% 算力加速"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
