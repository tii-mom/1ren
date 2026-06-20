import React from "react";
import { UserStats, UserLevel } from "../types";
import { Cpu, PlusCircle, LayoutDashboard, Coins, PackageOpen, User, TrendingUp } from "lucide-react";

interface HeaderProps {
  stats: UserStats;
  usdtBalance: number;
  onAddTestUsdt: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  r1Price?: number;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  usdtBalance,
  onAddTestUsdt,
  currentTab,
  setCurrentTab,
  r1Price = 0.05
}) => {
  const getBadgeColor = (level: UserLevel) => {
    switch (level) {
      case UserLevel.ZERO: return "border-cyan-500/30 text-cyan-400 bg-cyan-950/20 text-glow-cyan";
      case UserLevel.S1: return "border-cyan-500/55 text-cyan-400 bg-cyan-950/40 text-glow-cyan";
      case UserLevel.S2: return "border-cyan-400 text-cyan-300 bg-cyan-900/30 text-glow-cyan";
      case UserLevel.S3: return "border-cyan-400 text-cyan-300 bg-cyan-900/50 text-glow-cyan";
      case UserLevel.S4: return "border-amber-500/60 text-amber-400 bg-amber-950/30 text-glow-gold";
      case UserLevel.S5: return "border-amber-500 text-amber-300 bg-amber-900/40 text-glow-gold";
      default: return "border-cyan-500/30 text-cyan-400 bg-cyan-950/20 text-glow-cyan";
    }
  };

  const getShortLevelName = (level: UserLevel) => {
    switch (level) {
      case UserLevel.ZERO: return "S0";
      case UserLevel.S1: return "S1";
      case UserLevel.S2: return "S2";
      case UserLevel.S3: return "S3";
      case UserLevel.S4: return "S4";
      case UserLevel.S5: return "S5";
      default: return "S0";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#07090e]/90 border-b border-white/10 backdrop-blur-md">
      
      {/* Upper row: Brand Logo & User Wallets */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 pt-[calc(12px+env(safe-area-inset-top))] pb-3 sm:py-4 flex justify-between items-center gap-1 sm:gap-1.5">
        
        {/* Brand visual logo */}
        <div className="flex items-center gap-1 sm:gap-3 group cursor-pointer" onClick={() => setCurrentTab("home")}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.25)] group-hover:scale-105 transition-transform duration-300">
            <Cpu stroke="url(#gradient-cyan-blue)" className="size-4 sm:size-6 icon-glow-cyan" />
          </div>
          <div className="leading-none">
            <h1 className="text-xs sm:text-xl font-bold tracking-tighter text-white uppercase flex items-center gap-0.5">
              1人算力有限公司 <span className="text-[7.5px] sm:text-[10px] text-cyan-400 font-mono tracking-widest hidden xs:inline sm:inline">R1 TOKEN</span>
            </h1>
            <span className="text-[7.5px] sm:text-[10px] text-cyan-400 tracking-widest font-mono uppercase mt-0.5 block hidden sm:block">GROWTH POWER TERMINAL</span>
          </div>
        </div>

        {/* Status widgets */}
        <div className="flex items-center gap-1 sm:gap-3">
          
          {/* R1/USDT Price */}
          <div className="bg-white/5 border border-white/10 rounded-full px-1.5 sm:px-4 py-0.5 sm:py-1 hidden sm:flex items-center gap-1 shadow-sm shrink-0">
            <div>
              <span className="text-[8px] sm:text-[8.5px] text-slate-400 hidden md:block font-mono uppercase tracking-wider">R1/USDT 估价</span>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-cyan-400 flex items-baseline gap-0.5">
                {r1Price.toFixed(4)} <span className="text-[8px] font-normal text-slate-500">U</span>
              </span>
            </div>
          </div>

          {/* R1 Token Balance */}
          <div className="bg-white/5 border border-white/10 rounded-full px-1.5 sm:px-4 py-0.5 sm:py-1 flex items-center gap-1 shadow-sm shrink-0">
            <div>
              <span className="text-[8px] sm:text-[8.5px] text-slate-400 hidden md:block font-mono uppercase tracking-wider">AI Token</span>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-yellow-400 text-glow-gold flex items-baseline gap-0.5">
                {stats.hashFragments.toFixed(2)} <span className="text-[8px] font-normal text-slate-500">AI</span>
              </span>
            </div>
          </div>

          {/* USDT Test Wallet */}
          <div className="bg-white/5 border border-white/10 rounded-full px-1.5 sm:px-4 py-0.5 sm:py-1 flex items-center gap-1 shadow-sm shrink-0">
            <div>
              <span className="text-[8px] sm:text-[8.5px] text-slate-400 hidden md:block font-mono uppercase tracking-wider">USDT 模拟金</span>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 flex items-baseline gap-0.5">
                {usdtBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} <span className="text-[8px] font-normal text-slate-500">U</span>
              </span>
            </div>
            
            <button
              id="btn-mint-usdt"
              onClick={onAddTestUsdt}
              className="p-0.5 rounded-full bg-white/10 text-slate-300 hover:text-emerald-400 hover:bg-white/20 transition-all cursor-pointer touch-manipulation min-w-[20px] min-h-[20px] flex items-center justify-center"
              title="获取 1,000 USDT 测试体验金"
            >
              <PlusCircle stroke="url(#gradient-emerald-teal)" className="size-3 icon-glow-emerald" />
            </button>
          </div>

          {/* Miner Level badge */}
          <div className={`flex items-center gap-0.5 bg-white/5 border px-1.5 sm:px-4 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold leading-none capitalize shrink-0 ${getBadgeColor(stats.level)}`}>
            <span className="sm:hidden">{getShortLevelName(stats.level)}</span>
            <span className="hidden sm:inline">{stats.level}</span>
          </div>

        </div>

      </div>

      {/* Lower row: Nav Menu */}
      <div className="border-t border-white/10 bg-black/20 md:block hidden">
        <nav className="max-w-7xl mx-auto px-6 flex overflow-x-auto no-scrollbar gap-2 pt-2 pb-2">
          {/* 1. 首页 */}
          <button
            onClick={() => setCurrentTab("home")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer border ${
              currentTab === "home"
                ? "text-cyan-400 bg-white/10 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                : "text-slate-400 bg-white/5 border-white/5 hover:bg-white/10 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            <LayoutDashboard stroke={currentTab === "home" ? "url(#gradient-cyan-blue)" : "currentColor"} className={`size-4 ${currentTab === "home" ? "icon-glow-cyan" : ""}`} />
            首页
          </button>

          {/* 2. 交易 */}
          <button
            onClick={() => setCurrentTab("exchange")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer border ${
              currentTab === "exchange"
                ? "text-cyan-400 bg-white/10 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                : "text-slate-400 bg-white/5 border-white/5 hover:bg-white/10 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            <TrendingUp stroke={currentTab === "exchange" ? "url(#gradient-cyan-blue)" : "currentColor"} className={`size-4 ${currentTab === "exchange" ? "icon-glow-cyan" : ""}`} />
            交易
          </button>

          {/* 3. 设备机房 */}
          <button
            onClick={() => setCurrentTab("store")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer border ${
              currentTab === "store"
                ? "text-cyan-400 bg-white/10 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                : "text-slate-400 bg-white/5 border-white/5 hover:bg-white/10 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            <Cpu stroke={currentTab === "store" ? "url(#gradient-cyan-blue)" : "currentColor"} className={`size-4 ${currentTab === "store" ? "icon-glow-cyan" : ""}`} />
            设备机房
          </button>

          {/* 4. 发行中心 */}
          <button
            onClick={() => setCurrentTab("launch")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer border ${
              currentTab === "launch"
                ? "text-cyan-400 bg-white/10 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                : "text-slate-400 bg-white/5 border-white/5 hover:bg-white/10 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            <Coins stroke={currentTab === "launch" ? "url(#gradient-cyan-blue)" : "currentColor"} className={`size-4 ${currentTab === "launch" ? "icon-glow-cyan" : ""}`} />
            发行中心
          </button>

          {/* 5. 我的 */}
          <button
            onClick={() => setCurrentTab("my")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer border ${
              currentTab === "my"
                ? "text-cyan-400 bg-white/10 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                : "text-slate-400 bg-white/5 border-white/5 hover:bg-white/10 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            <User stroke={currentTab === "my" ? "url(#gradient-cyan-blue)" : "currentColor"} className={`size-4 ${currentTab === "my" ? "icon-glow-cyan" : ""}`} />
            我的后台
          </button>
        </nav>
      </div>

    </header>
  );
};
