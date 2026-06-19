import React, { useState, useEffect, useMemo, useRef } from "react";
import { UserStats, MiningRecord } from "../../types";
import { 
  TrendingUp, Coins, ArrowUpRight, ArrowDownRight, Clock, Cpu, 
  AlertTriangle, Play, Sparkles, User, HelpCircle, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface R1ExchangeProps {
  stats: UserStats;
  usdtBalance: number;
  r1Price: number;
  r1PriceDir: "up" | "down" | "flat";
  r1PriceChange: number;
  handleExchangeTrade: (type: "buy" | "sell", amount: number, price: number) => boolean;
}

export const R1Exchange: React.FC<R1ExchangeProps> = ({
  stats,
  usdtBalance,
  r1Price,
  r1PriceDir,
  r1PriceChange,
  handleExchangeTrade
}) => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  
  // Trade form inputs
  const [usdtInput, setUsdtInput] = useState<string>("");
  const [r1Input, setR1Input] = useState<string>("");
  
  // Interactive ticking chart history (capped at 40 points)
  const [chartData, setChartData] = useState<number[]>([]);
  
  // Simulated Order Book bids & asks
  const [orderBook, setOrderBook] = useState<{
    asks: { price: number; qty: number; total: number }[];
    bids: { price: number; qty: number; total: number }[];
  }>({ asks: [], bids: [] });

  // Simulated recent executions ticker
  const [recentTrades, setRecentTrades] = useState<{
    id: number;
    time: string;
    side: "buy" | "sell";
    price: number;
    qty: number;
  }[]>([]);

  // Initialize chart history and mock data
  useEffect(() => {
    // Generate 30 points of random-walk history leading to current price
    const initialPoints: number[] = [];
    let startVal = r1Price * 0.95;
    for (let i = 0; i < 30; i++) {
      const isUp = Math.random() > 0.48;
      const step = (Math.random() * 0.0006) * (isUp ? 1 : -1);
      startVal = Math.max(0.0400, Math.min(0.0800, startVal + step));
      initialPoints.push(startVal);
    }
    initialPoints.push(r1Price);
    setChartData(initialPoints);

    // Initial recent trades
    const trades = Array.from({ length: 6 }).map((_, idx) => {
      const side = Math.random() > 0.45 ? ("buy" as const) : ("sell" as const);
      const qty = Math.floor(Math.random() * 1800 + 100);
      const priceOffset = (Math.random() - 0.5) * 0.001;
      return {
        id: idx,
        time: new Date(Date.now() - (idx + 1) * 35 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        side,
        price: parseFloat((r1Price + priceOffset).toFixed(6)),
        qty
      };
    });
    setRecentTrades(trades);
  }, []);

  // Update chart data and simulate new recent trade when r1Price ticks
  useEffect(() => {
    if (chartData.length > 0) {
      setChartData((prev) => {
        const next = [...prev];
        if (next.length >= 35) {
          next.shift();
        }
        next.push(r1Price);
        return next;
      });
      
      // Spawn new recent trade
      const isBuy = Math.random() > 0.4;
      const qty = Math.floor(Math.random() * 800 + 50);
      const tradeTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      
      setRecentTrades((prev) => [
        { id: Date.now(), time: tradeTime, side: isBuy ? "buy" : "sell", price: r1Price, qty },
        ...prev.slice(0, 5)
      ]);
    }
  }, [r1Price]);

  // Dynamically calculate order book rows centered around current r1Price
  useEffect(() => {
    // Generates 5 asks (above price) and 5 bids (below price)
    const asks = Array.from({ length: 5 }).map((_, idx) => {
      // higher prices first
      const level = 5 - idx; // 5, 4, 3, 2, 1
      const price = r1Price + level * 0.00015;
      const qty = Math.floor(Math.sin(level + r1Price * 1000) * 8000 + 10000);
      return { price: parseFloat(price.toFixed(6)), qty, total: qty * price };
    });

    const bids = Array.from({ length: 5 }).map((_, idx) => {
      const level = idx + 1; // 1, 2, 3, 4, 5
      const price = r1Price - level * 0.00015;
      const qty = Math.floor(Math.cos(level + r1Price * 1000) * 8000 + 10000);
      return { price: parseFloat(price.toFixed(6)), qty, total: qty * price };
    });

    setOrderBook({ asks, bids });
  }, [r1Price]);

  // Click on orderbook price row to autofill
  const handlePriceClick = (price: number) => {
    if (activeTab === "buy") {
      // autofill buy using 50% of USDT
      const mockCost = usdtBalance * 0.5;
      setUsdtInput(mockCost.toFixed(2));
    } else {
      // autofill sell using 50% of R1
      const mockR1 = stats.hashFragments * 0.5;
      setR1Input(mockR1.toFixed(4));
    }
  };

  // Quick allocation percentage handler
  const handlePercentSelect = (pct: number) => {
    if (activeTab === "buy") {
      const targetUsdt = usdtBalance * pct / 100;
      setUsdtInput(targetUsdt > 0.01 ? targetUsdt.toFixed(2) : "0");
    } else {
      const targetR1 = stats.hashFragments * pct / 100;
      setR1Input(targetR1 > 0.0001 ? targetR1.toFixed(4) : "0");
    }
  };

  // Transaction trigger
  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderType === "limit") return; // limit disabled

    if (activeTab === "buy") {
      const cost = parseFloat(usdtInput);
      if (isNaN(cost) || cost <= 0) return;
      const success = handleExchangeTrade("buy", cost, r1Price);
      if (success) {
        setUsdtInput("");
      }
    } else {
      const sellQty = parseFloat(r1Input);
      if (isNaN(sellQty) || sellQty <= 0) return;
      const success = handleExchangeTrade("sell", sellQty, r1Price);
      if (success) {
        setR1Input("");
      }
    }
  };

  // Estimates calculations
  const estimatedR1Received = useMemo(() => {
    const cost = parseFloat(usdtInput);
    if (isNaN(cost) || cost <= 0) return 0;
    return (cost / r1Price) * 0.997; // 0.3% fee deducted
  }, [usdtInput, r1Price]);

  const estimatedUsdtReceived = useMemo(() => {
    const qty = parseFloat(r1Input);
    if (isNaN(qty) || qty <= 0) return 0;
    return (qty * r1Price) * 0.997; // 0.3% fee deducted
  }, [r1Input, r1Price]);

  // SVG Chart path calculation
  const svgW = 600;
  const svgH = 180;
  const chartPoints = useMemo(() => {
    if (chartData.length === 0) return "";
    const min = Math.min(...chartData) * 0.998;
    const max = Math.max(...chartData) * 1.002;
    const range = max - min;
    
    return chartData.map((val, idx) => {
      const x = (idx / (chartData.length - 1)) * svgW;
      const y = svgH - ((val - min) / (range || 1)) * svgH;
      return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }, [chartData]);

  const chartAreaPath = useMemo(() => {
    if (chartData.length === 0) return "";
    const points = chartPoints;
    const lastX = svgW;
    return `${points} L${lastX.toFixed(1)},${svgH} L0,${svgH} Z`;
  }, [chartPoints, chartData]);

  // Order Book max quantity for depth calculation
  const maxQty = useMemo(() => {
    const all = [...orderBook.asks, ...orderBook.bids];
    if (all.length === 0) return 1;
    return Math.max(...all.map(item => item.qty));
  }, [orderBook]);

  return (
    <div className="space-y-5 font-sans select-none">
      
      {/* 1. Header Ticker Banner */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.02] rounded-full blur-xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-glow-cyan text-cyan-400 text-sm font-black tracking-widest uppercase">R1 / USDT</span>
            <span className="text-[8px] font-mono text-cyan-500 bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.2 rounded font-bold">SPOT极速</span>
          </div>
          
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-mono font-black tracking-tight transition-all duration-300 ${
              r1PriceDir === "up" ? "text-green-400 text-glow-green" : r1PriceDir === "down" ? "text-red-400" : "text-white"
            }`}>
              {r1Price.toFixed(5)}
            </span>
            <span className={`text-xs font-mono font-extrabold flex items-center ${
              r1PriceDir === "up" ? "text-green-400" : "text-red-400"
            }`}>
              {r1PriceDir === "up" ? "▲" : "▼"} {r1PriceChange.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto font-mono text-[10px] text-slate-500 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
          <div>
            <span>24H 最高价</span>
            <span className="text-slate-200 block font-bold mt-0.5">0.06200</span>
          </div>
          <div>
            <span>24H 最低价</span>
            <span className="text-slate-200 block font-bold mt-0.5">0.04100</span>
          </div>
          <div>
            <span>24H 成交额(USDT)</span>
            <span className="text-slate-200 block font-bold mt-0.5">1,289,321</span>
          </div>
          <div>
            <span>交易手续费</span>
            <span className="text-cyan-400 block font-bold mt-0.5">0.3%</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Price Chart */}
      <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-5 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-2 left-4 text-[9px] font-mono text-slate-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
          <span>R1/USDT 实时波动折线 (Ticking Line Chart)</span>
        </div>
        <div className="absolute top-2 right-4 text-[8px] font-mono text-slate-500">
          FEED: SIMULATED ORACLE
        </div>

        {/* SVG Drawing */}
        <div className="h-[180px] w-full mt-5 relative">
          {chartData.length > 1 ? (
            <svg className="w-full h-full" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Horizontal Grid lines */}
              <line x1="0" y1={svgH * 0.25} x2={svgW} y2={svgH * 0.25} stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="0" y1={svgH * 0.5} x2={svgW} y2={svgH * 0.5} stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="0" y1={svgH * 0.75} x2={svgW} y2={svgH * 0.75} stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" strokeDasharray="3 3" />

              {/* Area path */}
              <path d={chartAreaPath} fill="url(#chartGradient)" />
              {/* Stroke path */}
              <path d={chartPoints} fill="none" stroke="#06b6d4" strokeWidth="1.8" filter="url(#glowFilter)" />
              
              {/* Ticking latest value point indicator */}
              {(() => {
                const min = Math.min(...chartData) * 0.998;
                const max = Math.max(...chartData) * 1.002;
                const range = max - min;
                const lastVal = chartData[chartData.length - 1];
                const x = svgW;
                const y = svgH - ((lastVal - min) / (range || 1)) * svgH;
                return (
                  <g>
                    <circle cx={x} cy={y} r="3" fill="#22d3ee" className="animate-ping" />
                    <circle cx={x} cy={y} r="1.5" fill="#ffffff" />
                  </g>
                );
              })()}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-500 font-mono">
              图表数据加载中...
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Grid layout: Orderbook & Trade form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        
        {/* Left Side: Order Book (委托账本) */}
        <div className="md:col-span-5 bg-slate-950/60 border border-white/10 rounded-3xl p-5 relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Cpu className="size-3 text-cyan-400" />
              深度委托委托账本
            </span>
            <span className="text-[8px] text-slate-500 font-mono">Spread: 0.00015 U</span>
          </div>

          {/* Book table columns */}
          <div className="grid grid-cols-3 text-[9px] font-mono text-slate-500 border-b border-white/5 pb-1 mb-1">
            <span>价格(USDT)</span>
            <span className="text-right">数量(R1)</span>
            <span className="text-right">累计(USDT)</span>
          </div>

          <div className="space-y-0.5">
            {/* Asks (Sell Orders) - Red */}
            {orderBook.asks.map((ask, idx) => (
              <div 
                key={`ask-${idx}`} 
                onClick={() => handlePriceClick(ask.price)}
                className="grid grid-cols-3 text-[10.5px] font-mono py-1 rounded cursor-pointer hover:bg-red-500/10 transition-colors relative"
              >
                {/* Visual depth bar */}
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-red-500/5 transition-all duration-300 pointer-events-none"
                  style={{ width: `${(ask.qty / maxQty) * 100}%` }}
                />
                <span className="text-red-400 font-semibold relative z-10">{ask.price.toFixed(5)}</span>
                <span className="text-right text-slate-300 relative z-10">{ask.qty.toLocaleString()}</span>
                <span className="text-right text-slate-500 relative z-10">{ask.total.toFixed(1)}</span>
              </div>
            ))}

            {/* Mid Price Separator */}
            <div className="border-y border-white/5 py-1.5 my-1.5 flex justify-between items-center font-mono">
              <span className={`text-sm font-black ${
                r1PriceDir === "up" ? "text-green-400" : r1PriceDir === "down" ? "text-red-400" : "text-white"
              }`}>
                {r1Price.toFixed(5)}
              </span>
              <span className="text-[8px] text-slate-500 uppercase">盘口成交价</span>
            </div>

            {/* Bids (Buy Orders) - Green */}
            {orderBook.bids.map((bid, idx) => (
              <div 
                key={`bid-${idx}`} 
                onClick={() => handlePriceClick(bid.price)}
                className="grid grid-cols-3 text-[10.5px] font-mono py-1 rounded cursor-pointer hover:bg-green-500/10 transition-colors relative"
              >
                {/* Visual depth bar */}
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-green-500/5 transition-all duration-300 pointer-events-none"
                  style={{ width: `${(bid.qty / maxQty) * 100}%` }}
                />
                <span className="text-green-400 font-semibold relative z-10">{bid.price.toFixed(5)}</span>
                <span className="text-right text-slate-300 relative z-10">{bid.qty.toLocaleString()}</span>
                <span className="text-right text-slate-500 relative z-10">{bid.total.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Trade Form (交易表单) */}
        <div className="md:col-span-7 bg-slate-950/60 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-5">
          
          {/* BUY/SELL Tabs */}
          <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/5 rounded-2xl">
            <button
              onClick={() => {
                setActiveTab("buy");
                setUsdtInput("");
                setR1Input("");
              }}
              className={`py-2 text-xs font-black rounded-xl uppercase transition-all cursor-pointer min-h-[44px] ${
                activeTab === "buy"
                  ? "bg-green-500 text-slate-950 font-black shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              买入 (BUY)
            </button>
            <button
              onClick={() => {
                setActiveTab("sell");
                setUsdtInput("");
                setR1Input("");
              }}
              className={`py-2 text-xs font-black rounded-xl uppercase transition-all cursor-pointer min-h-[44px] ${
                activeTab === "sell"
                  ? "bg-red-500 text-slate-950 font-black shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              卖出 (SELL)
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleExecuteTrade} className="space-y-4">
            {/* Order type selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOrderType("market")}
                className={`flex-1 py-2 text-[10px] font-mono font-bold tracking-wider rounded-lg border min-h-[44px] ${
                  orderType === "market"
                    ? "bg-cyan-500/10 border-cyan-400/40 text-cyan-400"
                    : "bg-white/5 border-white/5 text-slate-500"
                }`}
              >
                市价委托 (Market)
              </button>
              <button
                type="button"
                disabled
                className="flex-1 py-2 text-[10px] font-mono font-bold tracking-wider rounded-lg border bg-white/5 border-white/5 text-slate-650 cursor-not-allowed opacity-50 relative group min-h-[44px]"
              >
                限价委托 (即将开放)
              </button>
            </div>

            {/* Balances bar */}
            <div className="flex justify-between items-center text-[10.5px] font-mono text-slate-500">
              {activeTab === "buy" ? (
                <>
                  <span>USDT 模拟余额:</span>
                  <span className="text-white font-bold">{usdtBalance.toFixed(2)} USDT</span>
                </>
              ) : (
                <>
                  <span>R1 Token 余额:</span>
                  <span className="text-white font-bold">{stats.hashFragments.toFixed(4)} R1</span>
                </>
              )}
            </div>

            {/* Price Row */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-mono block uppercase">委托单价</label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value="市价委托最速撮合 (Best Market Price)"
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-cyan-400 font-bold font-mono opacity-80"
                />
              </div>
            </div>

            {/* Amount Row */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-500 font-mono block uppercase">
                  {activeTab === "buy" ? "支付金额 (USDT)" : "卖出数量 (R1)"}
                </label>
                <span className="text-[9px] text-slate-600 font-mono">手续费 0.3%</span>
              </div>
              <div className="relative">
                {activeTab === "buy" ? (
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    placeholder="输入要支付的 USDT 金额"
                    value={usdtInput}
                    onChange={(e) => setUsdtInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/40 outline-none rounded-xl px-4 py-3 text-sm text-white font-bold font-mono min-h-[44px]"
                  />
                ) : (
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.0001"
                    placeholder="输入要卖出的 R1 数量"
                    value={r1Input}
                    onChange={(e) => setR1Input(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/40 outline-none rounded-xl px-4 py-3 text-sm text-white font-bold font-mono min-h-[44px]"
                  />
                )}
                <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-mono font-bold uppercase">
                  {activeTab === "buy" ? "USDT" : "R1"}
                </span>
              </div>
            </div>

            {/* Quick Percentages Grid */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {([25, 50, 75, 100] as const).map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentSelect(pct)}
                  className="py-2 text-[10px] font-mono font-bold rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 active:scale-95 transition-all min-h-[44px] cursor-pointer"
                >
                  {pct === 100 ? "全部" : `${pct}%`}
                </button>
              ))}
            </div>

            {/* Estimates bar */}
            {activeTab === "buy" ? (
              estimatedR1Received > 0 && (
                <div className="bg-green-500/[0.03] border border-green-500/10 rounded-2xl p-3.5 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>估算到账 (扣手续费):</span>
                    <span className="text-green-400 font-bold">{estimatedR1Received.toFixed(4)} R1</span>
                  </div>
                </div>
              )
            ) : (
              estimatedUsdtReceived > 0 && (
                <div className="bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-3.5 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>估算收到模拟金:</span>
                    <span className="text-emerald-400 font-bold">{estimatedUsdtReceived.toFixed(4)} USDT</span>
                  </div>
                </div>
              )
            )}

            {/* Action submit button */}
            <button
              type="submit"
              className={`w-full py-4 rounded-2xl text-slate-950 font-black text-xs uppercase tracking-widest transition-all min-h-[44px] cursor-pointer ${
                activeTab === "buy"
                  ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-98 hover:brightness-110"
                  : "bg-gradient-to-r from-red-400 to-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-98 hover:brightness-110"
              }`}
            >
              {activeTab === "buy" ? "极速买入 R1 (BUY)" : "极速卖出 R1 (SELL)"}
            </button>
          </form>
        </div>
      </div>

      {/* 4. Recent Execution flow */}
      <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-5 relative overflow-hidden backdrop-blur-md">
        <h3 className="text-xs font-black text-slate-300 mb-3 uppercase tracking-wider">
          全网撮合交易历史 (Recent Trades)
        </h3>
        
        <div className="grid grid-cols-4 text-[9.5px] font-mono text-slate-500 border-b border-white/5 pb-1.5 mb-2">
          <span>成交时间</span>
          <span>方向</span>
          <span className="text-right">成交价(USDT)</span>
          <span className="text-right">成交量(R1)</span>
        </div>

        <div className="space-y-2">
          {recentTrades.map((t) => (
            <div key={t.id} className="grid grid-cols-4 text-xs font-mono leading-none py-0.5">
              <span className="text-slate-500">{t.time}</span>
              <span className={t.side === "buy" ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                {t.side === "buy" ? "买入" : "卖出"}
              </span>
              <span className="text-right text-slate-300 font-bold">{t.price.toFixed(5)}</span>
              <span className="text-right text-slate-400">{t.qty.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
