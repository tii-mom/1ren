import React, { useState, useEffect, useMemo, useRef } from "react";
import { UserStats, MiningRecord } from "../../types";
import { 
  TrendingUp, Coins, ArrowUpRight, ArrowDownRight, Clock, Cpu, 
  AlertTriangle, Play, Sparkles, User, HelpCircle, ChevronRight, Info, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { loadIssuedTokens, updateIssuedToken } from "../../utils/issuedTokens";

interface R1ExchangeProps {
  stats: UserStats;
  usdtBalance: number;
  r1Price: number;
  r1PriceDir: "up" | "down" | "flat";
  r1PriceChange: number;
  handleExchangeTrade: (type: "buy" | "sell", amount: number, price: number) => boolean;
  onSupportCompanyToken: (tokenId: string, amount: number) => boolean;
  onUpdateCompanyTokenStatus: (tokenId: string, newStatus: "launching" | "listed" | "closed") => boolean;
  setCurrentTab: (tab: string) => void;
}

export const R1Exchange: React.FC<R1ExchangeProps> = ({
  stats,
  usdtBalance,
  r1Price,
  r1PriceDir,
  r1PriceChange,
  handleExchangeTrade,
  onSupportCompanyToken,
  onUpdateCompanyTokenStatus,
  setCurrentTab
}) => {
  const [marketTab, setMarketTab] = useState<"r1" | "company">("r1");
  const [issuedTokens, setIssuedTokens] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);
  const [supportAmount, setSupportAmount] = useState<string>("100");
  const [supportingTokenId, setSupportingTokenId] = useState<string | null>(null);

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

  const refreshTokens = () => {
    setIssuedTokens(loadIssuedTokens());
  };

  useEffect(() => {
    refreshTokens();
  }, [marketTab, stats]);

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
      const mockR1 = (stats.r1Balance || 0) * 0.5;
      setR1Input(mockR1.toFixed(4));
    }
  };

  // Quick allocation percentage handler
  const handlePercentSelect = (pct: number) => {
    if (activeTab === "buy") {
      const targetUsdt = usdtBalance * pct / 100;
      setUsdtInput(targetUsdt > 0.01 ? targetUsdt.toFixed(2) : "0");
    } else {
      const targetR1 = (stats.r1Balance || 0) * pct / 100;
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
      
      {/* Top 二级 Tab 切换 */}
      <div className="flex border border-white/10 rounded-2xl p-1 bg-black/40 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setMarketTab("r1")}
          className={`flex-1 py-3 text-center text-xs font-black rounded-xl tracking-wider transition-all duration-300 min-h-[44px] flex items-center justify-center cursor-pointer ${
            marketTab === "r1"
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          R1 交易市场
        </button>
        <button
          type="button"
          onClick={() => setMarketTab("company")}
          className={`flex-1 py-3 text-center text-xs font-black rounded-xl tracking-wider transition-all duration-300 min-h-[44px] flex items-center justify-center cursor-pointer ${
            marketTab === "company"
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          公司 Token 市场
        </button>
      </div>

      {marketTab === "r1" ? (
        <>
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
                  </defs>
                  
                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75].map((ratio) => (
                    <line
                      key={ratio}
                      x1="0"
                      y1={svgH * ratio}
                      x2={svgW}
                      y2={svgH * ratio}
                      stroke="rgba(255, 255, 255, 0.03)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Area fill */}
                  <path d={chartAreaPath} fill="url(#chartGradient)" />
                  
                  {/* Stroke path */}
                  <path
                    d={chartPoints}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_2px_8px_rgba(6,182,212,0.5)]"
                  />
                  
                  {/* Ticking dot */}
                  <circle
                    cx={svgW}
                    cy={svgH - ((chartData[chartData.length - 1] - Math.min(...chartData) * 0.998) / ((Math.max(...chartData) * 1.002 - Math.min(...chartData) * 0.998) || 1)) * svgH}
                    r="4.5"
                    fill="#22d3ee"
                    className="animate-pulse shadow-[0_0_8px_#22d3ee]"
                  />
                </svg>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                  载入模拟实时 K 线图...
                </div>
              )}
            </div>
          </div>

          {/* 3. Transaction Panels */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Col: Order Book (bids/asks) */}
            <div className="md:col-span-4 bg-slate-950/60 border border-white/10 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-300 mb-3.5 uppercase tracking-wider">
                  模拟深度盘口 (Order Book)
                </h3>
                
                <div className="grid grid-cols-3 text-[9px] font-mono text-slate-500 border-b border-white/5 pb-1 mb-1">
                  <span>买卖价(USDT)</span>
                  <span className="text-right">数量(R1)</span>
                  <span className="text-right">累计总计</span>
                </div>

                {/* Asks (Sell Orders) - higher prices first */}
                <div className="space-y-1">
                  {orderBook.asks.map((ask, idx) => {
                    const depthPercent = Math.min(100, (ask.qty / maxQty) * 100);
                    return (
                      <div
                        key={idx}
                        onClick={() => handlePriceClick(ask.price)}
                        className="grid grid-cols-3 text-[11px] font-mono py-0.5 relative cursor-pointer hover:bg-white/[0.02]"
                      >
                        <div 
                          className="absolute right-0 top-0 bottom-0 bg-red-500/10 pointer-events-none rounded-sm transition-all" 
                          style={{ width: `${depthPercent}%` }}
                        />
                        <span className="text-red-400 font-semibold z-10">{ask.price.toFixed(5)}</span>
                        <span className="text-right text-slate-300 z-10">{ask.qty.toLocaleString()}</span>
                        <span className="text-right text-slate-400 z-10">{Math.round(ask.total).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Spread section */}
                <div className="border-t border-b border-white/5 py-2 my-2 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">当前价</span>
                  <span className={`font-black ${r1PriceDir === "up" ? "text-green-400" : "text-red-400"}`}>
                    {r1Price.toFixed(5)} U
                  </span>
                </div>

                {/* Bids (Buy Orders) */}
                <div className="space-y-1">
                  {orderBook.bids.map((bid, idx) => {
                    const depthPercent = Math.min(100, (bid.qty / maxQty) * 100);
                    return (
                      <div
                        key={idx}
                        onClick={() => handlePriceClick(bid.price)}
                        className="grid grid-cols-3 text-[11px] font-mono py-0.5 relative cursor-pointer hover:bg-white/[0.02]"
                      >
                        <div 
                          className="absolute right-0 top-0 bottom-0 bg-green-500/10 pointer-events-none rounded-sm transition-all" 
                          style={{ width: `${depthPercent}%` }}
                        />
                        <span className="text-green-400 font-semibold z-10">{bid.price.toFixed(5)}</span>
                        <span className="text-right text-slate-300 z-10">{bid.qty.toLocaleString()}</span>
                        <span className="text-right text-slate-400 z-10">{Math.round(bid.total).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-white/5 text-[10px] text-slate-500 leading-normal font-sans">
                💡 点击买卖单价格可快捷输入交易表单。
              </div>
            </div>

            {/* Right Col: Spot Order Form */}
            <div className="md:col-span-8 bg-slate-950/60 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
              {/* Tab Switch BUY / SELL */}
              <div className="flex border border-white/5 rounded-2xl p-1 bg-black/45 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("buy");
                    setUsdtInput("");
                    setR1Input("");
                  }}
                  className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl tracking-wider transition-all min-h-[44px] flex items-center justify-center cursor-pointer ${
                    activeTab === "buy"
                      ? "bg-green-500/20 border border-green-500/30 text-green-400 font-extrabold shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  模拟买入 R1 (BUY)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("sell");
                    setUsdtInput("");
                    setR1Input("");
                  }}
                  className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl tracking-wider transition-all min-h-[44px] flex items-center justify-center cursor-pointer ${
                    activeTab === "sell"
                      ? "bg-red-500/20 border border-red-500/30 text-red-400 font-extrabold shadow-sm"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  模拟卖出 R1 (SELL)
                </button>
              </div>

              {/* Order form */}
              <form onSubmit={handleExecuteTrade} className="space-y-4">
                {/* Mode Selector */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">交易模式</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType("market")}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all min-h-[44px] flex items-center justify-center cursor-pointer ${
                        orderType === "market" ? "bg-cyan-500/10 border border-cyan-500/25 text-cyan-400" : "bg-transparent text-slate-500"
                      }`}
                    >
                      市价模拟
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType("limit")}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all min-h-[44px] flex items-center justify-center cursor-pointer ${
                        orderType === "limit" ? "bg-cyan-500/10 border border-cyan-500/25 text-cyan-400" : "bg-transparent text-slate-500"
                      }`}
                    >
                      限价(固定{r1Price.toFixed(5)})
                    </button>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="flex justify-between items-center bg-black/30 border border-white/5 rounded-2xl p-3 text-xs font-mono">
                  <span className="text-slate-500">可用余额</span>
                  <span className="text-slate-200 font-bold">
                    {activeTab === "buy" 
                      ? `${usdtBalance.toFixed(2)} USDT` 
                      : `${(stats.r1Balance || 0).toFixed(4)} R1`}
                  </span>
                </div>

                {/* Input fields */}
                {activeTab === "buy" ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">买入预算 (USDT)</label>
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          value={usdtInput}
                          onChange={(e) => setUsdtInput(e.target.value)}
                          placeholder="输入模拟 USDT 数量"
                          className="w-full bg-black/45 border border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono min-h-[44px] focus:outline-none focus:border-cyan-500"
                        />
                        <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-mono">USDT</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">预计获得权益额 (R1)</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={estimatedR1Received > 0 ? estimatedR1Received.toFixed(4) : ""}
                          placeholder="根据单价自动折算"
                          className="w-full bg-slate-900/60 border border-white/5 text-slate-500 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none cursor-not-allowed"
                        />
                        <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-mono">R1</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">卖出数量 (R1)</label>
                      <div className="relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          value={r1Input}
                          onChange={(e) => setR1Input(e.target.value)}
                          placeholder="输入需要卖出的 R1 权益"
                          className="w-full bg-black/45 border border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono min-h-[44px] focus:outline-none focus:border-cyan-500"
                        />
                        <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-mono">R1</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">预计收回模拟金 (USDT)</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={estimatedUsdtReceived > 0 ? estimatedUsdtReceived.toFixed(4) : ""}
                          placeholder="扣除费率后预计收到"
                          className="w-full bg-slate-900/60 border border-white/5 text-slate-505 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none cursor-not-allowed"
                        />
                        <span className="absolute right-4 top-3.5 text-xs text-slate-505 font-mono">USDT</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Percentage selection shortcut bar */}
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePercentSelect(pct)}
                      className="flex-1 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-[10px] font-mono text-slate-300 rounded-xl min-h-[44px] flex items-center justify-center cursor-pointer transition-all"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Estimation Fees box */}
                {activeTab === "buy" ? (
                  estimatedR1Received > 0 && (
                    <div className="bg-green-500/[0.03] border border-green-500/10 rounded-2xl p-3.5 space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-slate-500">
                        <span>折算单价:</span>
                        <span className="text-slate-300 font-bold">{r1Price.toFixed(5)} USDT</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>估算扣除 0.3% 手续费:</span>
                        <span className="text-slate-300">{(parseFloat(usdtInput) * 0.003 / r1Price).toFixed(4)} R1</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>预计净获得:</span>
                        <span className="text-green-400 font-extrabold">{estimatedR1Received.toFixed(4)} R1</span>
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
        </>
      ) : (
        <div className="space-y-5">
          {/* Warn notice card */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3 text-xs text-slate-400">
            <Info className="size-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-sans">
              <strong>提示：</strong>当前为 V1 本地模拟环境。每个公司影子 Token 发行均需经过并网设备记录、AI Token 历史产出记录及锁定 100 R1 押金校验。支持池资金满额后可申请挂牌影子交易区。
            </p>
          </div>

          {issuedTokens.length === 0 ? (
            <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-12 backdrop-blur-md text-center space-y-4">
              <Coins className="size-12 text-slate-600 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-300">暂无公司 Token</h4>
                <p className="text-xs text-slate-505 font-sans max-w-sm mx-auto leading-normal">
                  完成发行中心流程后，您的 1人算力公司 Token 会出现在这里。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentTab("launch")}
                className="mx-auto py-2.5 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-black rounded-xl active:scale-95 shadow-lg min-h-[44px] flex items-center justify-center cursor-pointer"
              >
                去发行中心
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {issuedTokens.map((token) => {
                const remaining = token.targetPool - token.raisedUsdt;
                const isFinished = token.progress >= 100;
                return (
                  <div key={token.id} className="bg-slate-950/60 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.01] rounded-full blur-xl pointer-events-none" />
                    
                    {/* Top Row: Name and Status */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-extrabold text-white">{token.name}</h4>
                        <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block mt-0.5">{token.symbol} / USDT</span>
                      </div>
                      <div>
                        {token.status === "listed" ? (
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            已挂牌
                          </span>
                        ) : token.status === "closed" ? (
                          <span className="bg-slate-800/60 border border-white/5 text-slate-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            已关闭
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                            模拟支持中
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Grid details */}
                    <div className="grid grid-cols-2 gap-4 my-5 font-mono text-[11px] text-slate-400 border-t border-b border-white/5 py-4">
                      <div>
                        <span className="text-[9px] text-slate-505 block">初始发行价</span>
                        <span className="text-slate-200 font-bold text-xs mt-0.5 block">{token.initialPrice.toFixed(4)} U</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-505 block">目标支持池</span>
                        <span className="text-slate-200 font-bold text-xs mt-0.5 block">{token.targetPool.toLocaleString()} U</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-505 block">已支持金额</span>
                        <span className="text-cyan-400 font-extrabold text-xs mt-0.5 block">{token.raisedUsdt.toFixed(2)} U</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-505 block">锁仓 R1 押金</span>
                        <span className="text-slate-200 font-bold text-xs mt-0.5 block">{token.lockedR1} R1</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-505">支持募集进度</span>
                        <span className="text-cyan-400 font-bold">{token.progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${token.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="grid grid-cols-3 gap-2.5 mt-6 border-t border-white/5 pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedToken(token)}
                        className="py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-xl min-h-[44px] flex items-center justify-center transition-all cursor-pointer"
                      >
                        查看详情
                      </button>
                      
                      <button
                        type="button"
                        disabled={token.status !== "launching"}
                        onClick={() => setSupportingTokenId(token.id)}
                        className={`py-2.5 text-xs font-black rounded-xl min-h-[44px] flex items-center justify-center transition-all cursor-pointer ${
                          token.status === "launching"
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.15)] active:scale-95 hover:brightness-110"
                            : "bg-slate-900 border border-white/5 text-slate-550 cursor-not-allowed"
                        }`}
                      >
                        模拟支持
                      </button>

                      {token.status === "listed" ? (
                        <button
                          type="button"
                          disabled
                          className="py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl min-h-[44px] flex items-center justify-center cursor-not-allowed"
                        >
                          已挂牌
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!isFinished || token.status !== "launching"}
                          onClick={() => onUpdateCompanyTokenStatus(token.id, "listed")}
                          className={`py-2.5 text-xs font-black rounded-xl min-h-[44px] flex items-center justify-center transition-all cursor-pointer ${
                            isFinished && token.status === "launching"
                              ? "bg-gradient-to-r from-green-400 to-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(34,197,94,0.2)] active:scale-95 hover:brightness-110"
                              : "bg-slate-900 border border-white/5 text-slate-500 cursor-not-allowed text-[8px] px-0.5 font-medium leading-tight"
                          }`}
                        >
                          {isFinished ? "申请挂牌" : "支持满额后挂牌"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Support Input Dialog Box Modal */}
      {supportingTokenId && (() => {
        const token = issuedTokens.find(t => t.id === supportingTokenId);
        if (!token) return null;
        const remaining = token.targetPool - token.raisedUsdt;
        
        const handleSupportAction = (amt: number) => {
          const ok = onSupportCompanyToken(token.id, amt);
          if (ok) {
            setSupportingTokenId(null);
            refreshTokens();
          }
        };

        const handlePresetSupport = (val: string) => {
          let amt = 0;
          if (val === "max") {
            amt = Math.min(usdtBalance, remaining);
          } else {
            amt = parseFloat(val);
          }
          if (isNaN(amt) || amt <= 0) return;
          handleSupportAction(amt);
        };

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b0c15] border border-white/10 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl">
              <button 
                type="button"
                onClick={() => setSupportingTokenId(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <ChevronRight className="rotate-90 size-5" />
              </button>

              <h3 className="text-base font-extrabold text-white mb-2 flex items-center gap-2">
                <Coins className="text-cyan-400 size-5 animate-pulse" />
                模拟支持 [{token.symbol}]
              </h3>
              <p className="text-xs text-slate-400 leading-normal font-sans mb-4">
                使用您账户持有的模拟 USDT 对该公司影子 Token 提供支持筹备资金。
              </p>

              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 mb-4 font-mono text-xs text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>我的 USDT 余额:</span>
                  <span className="text-white font-bold">{usdtBalance.toFixed(2)} U</span>
                </div>
                <div className="flex justify-between">
                  <span>剩余募集额度:</span>
                  <span className="text-cyan-400 font-bold">{remaining.toFixed(2)} U</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {["10", "50", "100", "max"].map((preset) => {
                    const numVal = preset === "max" ? Math.min(usdtBalance, remaining) : parseFloat(preset);
                    const disabled = numVal <= 0 || numVal > remaining || (preset !== "max" && numVal > usdtBalance);
                    return (
                      <button
                        key={preset}
                        type="button"
                        disabled={disabled}
                        onClick={() => handlePresetSupport(preset)}
                        className={`py-2 text-xs font-bold rounded-xl transition-all border min-h-[44px] flex items-center justify-center cursor-pointer ${
                          disabled 
                            ? "bg-slate-950 border-white/5 text-slate-550 cursor-not-allowed"
                            : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 active:scale-95"
                        }`}
                      >
                        {preset === "max" ? "最大" : `${preset}U`}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    inputMode="decimal"
                    placeholder="自定义金额"
                    value={supportAmount}
                    onChange={(e) => setSupportAmount(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono min-h-[44px] focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const amt = parseFloat(supportAmount);
                      if (isNaN(amt) || amt <= 0) {
                        alert("请输入合法的金额");
                        return;
                      }
                      handleSupportAction(amt);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-black rounded-xl active:scale-95 min-h-[44px] flex items-center justify-center cursor-pointer"
                  >
                    支持
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* View Details Modal */}
      {selectedToken && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0c15] border border-white/10 rounded-3xl p-6 w-full max-w-md relative shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <button 
              type="button"
              onClick={() => setSelectedToken(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <ChevronRight className="rotate-90 size-5" />
            </button>

            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Cpu className="text-cyan-400 size-5 animate-pulse" />
                {selectedToken.name} 详情
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono tracking-wider">{selectedToken.symbol} 影子合约部署通道已建立</span>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-400 bg-black/30 border border-white/5 p-4 rounded-2xl">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>总供应量:</span>
                <span className="text-white font-bold">{selectedToken.totalSupply.toLocaleString()} {selectedToken.symbol}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>初始发行价:</span>
                <span className="text-white font-bold">{selectedToken.initialPrice.toFixed(4)} USDT</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>目标支持池:</span>
                <span className="text-white font-bold">{selectedToken.targetPool.toLocaleString()} USDT</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>已筹集资金:</span>
                <span className="text-cyan-400 font-bold">{selectedToken.raisedUsdt.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>锁仓押金:</span>
                <span className="text-slate-300 font-bold">{selectedToken.lockedR1} R1</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>发行人等级:</span>
                <span className="text-slate-300 font-bold">{selectedToken.ownerLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>创建时间:</span>
                <span className="text-slate-300">{new Date(selectedToken.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-550 font-bold block mb-1">影子项目简介</span>
              <p className="text-xs text-slate-400 font-sans leading-relaxed bg-black/20 border border-white/[0.02] p-3 rounded-xl">
                {selectedToken.description || "暂无项目简介说明。"}
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl flex gap-2.5">
              <AlertTriangle className="size-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] text-red-400 font-extrabold block">模拟风险披露声明</span>
                <p className="text-[10px] text-slate-400 leading-normal font-sans">
                  当前为 V1 本地模拟支持池，不代表真实股权、债权或证券。
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedToken(null)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold rounded-2xl min-h-[44px] flex items-center justify-center cursor-pointer transition-all"
            >
              关闭详情
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
