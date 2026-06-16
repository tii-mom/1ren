import React from "react";
import { UserStats, UserLevel } from "../types";
import { Cpu, Award, Orbit, PlusCircle, LayoutDashboard, ShoppingCart, Landmark, Gem, HelpCircle, User } from "lucide-react";

interface HeaderProps {
  stats: UserStats;
  usdtBalance: number;
  onAddTestUsdt: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  usdtBalance,
  onAddTestUsdt,
  currentTab,
  setCurrentTab
}) => {
  const getBadgeColor = (level: UserLevel) => {
    switch (level) {
      case UserLevel.ZERO: return "border-cyan-500 text-cyan-400 bg-cyan-950/40 text-glow-cyan";
      case UserLevel.S1:
      case UserLevel.S2:
      case UserLevel.S3: return "border-blue-500 text-blue-400 bg-blue-950/40";
      case UserLevel.S4:
      case UserLevel.S5:
      case UserLevel.S6: return "border-violet-500 text-violet-400 bg-violet-950/40 text-glow-purple";
      case UserLevel.S7:
      case UserLevel.S8:
      case UserLevel.S9: return "border-amber-500 text-yellow-400 bg-amber-950/40 text-glow-gold";
      default: return "border-cyan-500 text-cyan-400 bg-cyan-950/40 text-glow-cyan";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black/40 border-b border-white/10 backdrop-blur-md">
      
      {/* Upper row: Brand Logo & User Wallets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap justify-between items-center gap-2.5">
        
        {/* Brand visual logo */}
        <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={() => setCurrentTab("home")}>
          <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.4)] group-hover:scale-105 transition-transform duration-300">
            <Orbit className="size-5 sm:size-6 text-white animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div className="leading-none">
            <h1 className="text-sm sm:text-xl font-bold tracking-tighter text-white uppercase flex items-center gap-1">
              算力有限公司 <span className="text-[8px] sm:text-[10px] text-cyan-400 font-mono tracking-widest">CUBE</span>
            </h1>
            <span className="text-[8px] sm:text-[10px] text-cyan-400 tracking-widest font-mono uppercase mt-0.5 block">HASH POWER CO., LTD</span>
          </div>
        </div>

        {/* Status widgets */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* USDT Test Wallet */}
          <div className="bg-white/5 border border-white/10 rounded-full px-2.5 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-sm shrink-0">
            <div>
              <span className="text-[8px] sm:text-[8.5px] text-slate-400 hidden md:block font-mono uppercase tracking-wider">USDT 模拟金</span>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 flex items-center gap-0.5">
                <span className="md:hidden text-emerald-500 font-sans">U:</span>
                {usdtBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} <span className="text-[8px] font-normal text-slate-400 hidden sm:inline">U</span>
              </span>
            </div>
            
            <button
              id="btn-mint-usdt"
              onClick={onAddTestUsdt}
              className="p-1 rounded-full bg-white/10 text-slate-300 hover:text-emerald-400 hover:bg-white/20 transition-all cursor-pointer touch-manipulation min-w-[24px] min-h-[24px] flex items-center justify-center"
              title="获取 1,000 USDT $测试体验金"
            >
              <PlusCircle className="size-3.5" />
            </button>
          </div>

          {/* Crystals widget */}
          <div className="bg-white/5 border border-white/10 rounded-full px-2.5 sm:px-4 py-1 sm:py-1.5 flex items-center gap-1.5 shadow-sm shrink-0">
            <div>
              <span className="text-[8px] sm:text-[8.5px] text-slate-400 hidden md:block block font-mono uppercase tracking-wider">已固化晶体 (CRYSTAL)</span>
              <span className="text-[10px] sm:text-xs font-mono font-bold text-yellow-400 text-glow-gold flex items-center gap-1 leading-none">
                <Gem className="size-3 text-yellow-400" />
                {stats.hashCrystals || 0} <span className="text-[8px] font-normal text-slate-400 hidden sm:inline">颗</span>
              </span>
            </div>
          </div>

          {/* Miner Level badge */}
          <div className={`flex items-center gap-1 bg-white/5 border px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold leading-none capitalize shrink-0 ${getBadgeColor(stats.level)}`}>
            {stats.level}
          </div>

        </div>

      </div>

      {/* Lower row: Nav Menu */}
      <div className="border-t border-white/10 bg-black/20 md:block hidden">
        <nav className="max-w-7xl mx-auto px-6 flex overflow-x-auto no-scrollbar gap-2 pt-2 pb-2">
          {/* 1. 公司总览 */}
          <button
            onClick={() => setCurrentTab("home")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer border ${
              currentTab === "home"
                ? "text-cyan-400 bg-white/10 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                : "text-slate-400 bg-white/5 border-white/5 hover:bg-white/10 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            <LayoutDashboard className="size-4" />
            【公司总览】
          </button>

          {/* 2. 算力雇员系统 */}
          <button
            onClick={() => setCurrentTab("tower")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer border ${
              currentTab === "tower"
                ? "text-cyan-400 bg-white/10 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                : "text-slate-400 bg-white/5 border-white/5 hover:bg-white/10 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            <Orbit className="size-4 animate-spin" style={{ animationDuration: "12s" }} />
            【算力雇员系统】
          </button>

          {/* 3. AI引擎机房 */}
          <button
            onClick={() => setCurrentTab("store")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer border ${
              currentTab === "store"
                ? "text-cyan-400 bg-white/10 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                : "text-slate-400 bg-white/5 border-white/5 hover:bg-white/10 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            <Cpu className="size-4" />
            【AI引擎机房】
          </button>

          {/* 4. 经营物资库 */}
          <button
            onClick={() => setCurrentTab("items")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer border ${
              currentTab === "items"
                ? "text-cyan-400 bg-white/10 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                : "text-slate-400 bg-white/5 border-white/5 hover:bg-white/10 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            <Landmark className="size-4" />
            【经营物资库】
          </button>

          {/* 5. 创始人后台 */}
          <button
            onClick={() => setCurrentTab("my")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 cursor-pointer border ${
              currentTab === "my"
                ? "text-cyan-400 bg-white/10 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
                : "text-slate-400 bg-white/5 border-white/5 hover:bg-white/10 hover:text-slate-200 hover:border-white/10"
            }`}
          >
            <User className="size-4" />
            【创始人后台】
          </button>
        </nav>
      </div>

    </header>
  );
};
