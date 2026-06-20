import React, { useState, useEffect } from "react";
import { UserStats, MinerTemplate, ActiveMiner, UserLevel } from "../types";
import { Cpu, Calendar, TrendingUp, CheckCircle, Flame, ServerCrash, X, ShieldAlert, ShieldCheck, Zap, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Updated set of cloud instance templates referencing real hardware specifications
const MINER_TEMPLATES: MinerTemplate[] = [
  {
    id: "miner-l1",
    name: "L1 个人轻量云实例",
    cost: 20,
    contractDays: 30,
    baseYieldRange: [0.008, 0.012],
    refHardwareName: "Mac mini M4",
    refSpecDescription: "10核CPU/10核GPU, NPU 38 TOPS, 16GB 统一内存, 256GB SSD",
    marketPriceRange: "市场参考价 $599 起",
    apiScenarios: "适合轻量对话 (GPT-4o-mini / Qwen-Plus 等)、网页总结、个人 AI 助理",
    benefits: [
      "基于规格参考模型的虚拟算力核算",
      "适合新手入门，熟悉云公司资产运营",
      "AI Token 每日模拟产出率：参考 0.8% ~ 1.2%"
    ],
    stockToday: 5
  },
  {
    id: "miner-l2",
    name: "L2 开发者增强云实例",
    cost: 80,
    contractDays: 30,
    baseYieldRange: [0.009, 0.013],
    refHardwareName: "Mac mini M4 Pro",
    refSpecDescription: "14核CPU/20核GPU, NPU 38 TOPS, 24GB 统一内存, 512GB SSD",
    marketPriceRange: "市场参考价 $1,399 起",
    apiScenarios: "适合复杂网页分析、多 Agent 自动化流程调度、进阶文本推理 (Claude 3.5 Sonnet)",
    benefits: [
      "性能全面升级，每日产出容量扩大",
      "高能效计算比率，适合独立开发者运营",
      "AI Token 每日模拟产出率：参考 0.9% ~ 1.3%"
    ],
    stockToday: 3
  },
  {
    id: "miner-l3",
    name: "L3 国产 GPU 加速云实例",
    cost: 300,
    contractDays: 60,
    baseYieldRange: [0.010, 0.014],
    refHardwareName: "摩尔线程 MTT S4000",
    refSpecDescription: "3rd Gen MUSA 架构, 48GB GDDR6, INT8 200 TOPS, FP32 25 TFLOPS",
    marketPriceRange: "企业渠道询价 (公开售价不透明)",
    apiScenarios: "适合企业知识库建设、中型多模态推理、离线文档深度分析",
    benefits: [
      "国产高性能 GPU 算力指标规格锚定",
      "周期更长，大额资产折算效率更佳",
      "AI Token 每日模拟产出率：参考 1.0% ~ 1.4%"
    ],
    stockToday: 3
  },
  {
    id: "miner-l4",
    name: "L4 企业 AI 加速云实例",
    cost: 1000,
    contractDays: 90,
    baseYieldRange: [0.012, 0.016],
    refHardwareName: "寒武纪思元 MLU370-X8",
    refSpecDescription: "双芯片 Chiplet, 48GB LPDDR5, INT8 256 TOPS, 300 GB/s 带宽",
    marketPriceRange: "系统渠道询价 (规格参考价非平台成交价)",
    apiScenarios: "适合高并发 API 响应、图像生成 (Flux / SDXL API)、小规模模型微调模拟",
    benefits: [
      "企业级高并发算力规格锚定",
      "支持免除液冷折损波动，产出更平稳",
      "AI Token 每日模拟产出率：参考 1.2% ~ 1.6%"
    ],
    stockToday: 2
  },
  {
    id: "miner-l5",
    name: "L5 算力中心旗舰云实例",
    cost: 5000,
    contractDays: 180,
    baseYieldRange: [0.014, 0.018],
    refHardwareName: "华为昇腾 Atlas 800 (Ascend 910B)",
    refSpecDescription: "8卡高性能算力节点, FP16 2.5 PFLOPS, 512GB HBM2e 运行内存",
    marketPriceRange: "渠道大客户询价 (后台动态参数配置)",
    apiScenarios: "适合超大规模并发调用、长文本大模型 (DeepSeek-R1 等) 满载使用",
    benefits: [
      "旗舰算力中枢级配置指标规格锚定",
      "享有最高等级的故障转移与系统运行冗余",
      "AI Token 每日模拟产出率：参考 1.4% ~ 1.8%"
    ],
    stockToday: 1
  }
];

interface MinerStoreProps {
  stats: UserStats;
  onLeaseMiner: (template: MinerTemplate) => void;
  activeMiners: ActiveMiner[];
}

export const MinerStore: React.FC<MinerStoreProps> = ({
  stats,
  onLeaseMiner,
  activeMiners
}) => {
  const [stocks, setStocks] = useState<Record<string, number>>({
    "miner-l1": 4,
    "miner-l2": 2,
    "miner-l3": 2,
    "miner-l4": 1,
    "miner-l5": 1
  });

  const [yieldMultiplier, setYieldMultiplier] = useState(1.0);
  const [isComparing, setIsComparing] = useState(false);
  const [confirmTemplate, setConfirmTemplate] = useState<MinerTemplate | null>(null);
  const [agreeDisclaimer, setAgreeDisclaimer] = useState(false);

  // Simulate global yield fluctuation (heartbeat pattern)
  useEffect(() => {
    const interval = setInterval(() => {
      setYieldMultiplier(0.95 + Math.random() * 0.1);
      
      // Randomly decrease stock items occasionally to simulate real-time competition
      if (Math.random() > 0.7) {
        setStocks((prev) => {
          const keys = Object.keys(prev);
          const randKey = keys[Math.floor(Math.random() * keys.length)];
          const current = prev[randKey];
          if (current > 1) {
            return { ...prev, [randKey]: current - 1 };
          }
          return prev;
        });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getSubTitleColor = (index: number) => {
    switch(index) {
      case 0: return "from-cyan-400 to-blue-400";
      case 1: return "from-indigo-400 to-violet-400";
      case 2: return "from-purple-400 to-pink-400";
      case 3: return "from-yellow-400 to-orange-400 text-glow-gold";
      case 4: return "from-pink-500 via-red-500 to-yellow-500";
      default: return "from-cyan-400 to-blue-400";
    }
  };

  const maxSlots = 8;
  const occupiedSlots = activeMiners.filter(m => m.status !== "stopped").length;
  const loadPercentage = maxSlots > 0 ? Math.round((occupiedSlots / maxSlots) * 100) : 0;
  
  const hasDecayedMiner = activeMiners.some(m => m.status === "decayed");
  const hasSuperboostedMiner = activeMiners.some(m => m.efficiency > 1.10);
  
  let profitMargin = 0;
  let profitStatusLabel = "模拟空闲待装载";
  let profitStatusColor = "text-slate-400";
  
  if (occupiedSlots > 0) {
    if (hasDecayedMiner) {
      profitMargin = 64.20;
      profitStatusLabel = "模拟半衰期，在线维护";
      profitStatusColor = "text-amber-400";
    } else if (hasSuperboostedMiner) {
      profitMargin = 96.50;
      profitStatusLabel = "高能状态，模拟爆块中";
      profitStatusColor = "text-emerald-400 font-extrabold animate-pulse text-glow-green";
    } else {
      profitMargin = 89.40;
      profitStatusLabel = "云实例平稳调度中";
      profitStatusColor = "text-cyan-400 text-glow-cyan";
    }
  }

  const handleLeaseClick = (template: MinerTemplate) => {
    setConfirmTemplate(template);
    setAgreeDisclaimer(false);
  };

  const handleConfirmLease = () => {
    if (confirmTemplate && agreeDisclaimer) {
      onLeaseMiner(confirmTemplate);
      setConfirmTemplate(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* ⚠️ 合规风险披露首置 Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 flex items-start gap-4 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 bg-amber-500/30 w-full h-[1.5px]" />
        <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400 shrink-0">
          <AlertTriangle className="size-5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            虚拟云算力实例合规声明与免责披露
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            本平台展示的 Mac mini、摩尔线程、寒武纪、华为昇腾等硬件名称和规格，<b>仅作为虚拟云算力实例的规格参考模型</b>，不代表平台为用户实际交付、托管、租赁或分配任何实体物理硬件。用户支付的租赁费用为云端算力实例服务费，获得的是平台后端虚拟算力账本中的 <b>AI Token 产出额度</b>。AI Token 可用于接入真实的 AI 语言模型、图片生成、网页总结等大模型 API 消耗场景，不包含任何真实物理资产增值或理财投资保证收益。
          </p>
        </div>
      </div>

      {/* 🚀 AI Engine Room Realtime Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Telemetry 1: 全球节点模拟调度 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md hover:border-cyan-500/20 transition-all duration-300 col-span-1 lg:col-span-1 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl animate-pulse" />
          <div className="space-y-3">
            <h2 className="text-xs font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
              <TrendingUp className="text-cyan-400 size-4" />
              全球虚拟节点实例调度
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
              平台采用物理硬件规格锚定模型，提供虚拟云端算力调度服务。模拟产出效率受平台系统算法及配置系数调控。
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest">系统自检产出率</span>
              <span className="text-sm font-mono font-extrabold text-cyan-400 text-glow-cyan">
                {(yieldMultiplier * 100).toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest">全在线云实例</span>
              <span className="text-sm font-mono font-extrabold text-violet-400 text-glow-purple">1,482,593 个</span>
            </div>
          </div>
        </div>

        {/* Telemetry 2: 模拟利润率看板 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md hover:border-emerald-500/25 transition-all duration-300 col-span-1 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                <Flame className="text-emerald-400 size-4" />
                模拟经营利润率分析 (Operating margin)
              </h2>
              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">SIMULATION</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
              扣除虚拟折旧及维护保养系数后的<b>模拟 API 结算产出折算率</b>。实际数据随大模型 API 调用成本波动。
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono">日化模拟产出效益</span>
              <span className="text-xl font-mono font-black text-emerald-400 text-glow-green">
                {profitMargin.toFixed(2)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-500 block uppercase font-mono">云算力调度状态</span>
              <span className={`text-[10.5px] font-bold ${profitStatusColor}`}>
                {profitStatusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry 3: 算力实例插槽 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md hover:border-violet-500/25 transition-all duration-300 col-span-1 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                <Cpu className="text-violet-400 size-4" />
                虚拟云算力卡槽监控 (Chassis Slots)
              </h2>
              <span className="text-[8px] font-mono text-violet-400 bg-violet-950 px-2 py-0.5 rounded border border-violet-500/20 font-bold">VIRTUAL CHASSIS</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
              系统当前分配给您的虚拟主板插槽共 <b>{maxSlots}</b> 路。装载的规格参考实例越多，公司每日 AI Token 产出量越大。
            </p>
          </div>

          <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">实例插槽装填负载 ({occupiedSlots}/{maxSlots})</span>
              <span className="font-mono font-black text-violet-400">{loadPercentage}%</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 flex">
              <div 
                style={{ width: `${loadPercentage}%` }} 
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end">
        <button
          id="btn-open-compare"
          onClick={() => setIsComparing(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:text-slate-950 font-extrabold hover:bg-cyan-400 text-xs shadow-[0_2px_10px_rgba(6,182,212,0.15)] transition-all cursor-pointer hover:scale-105"
        >
          <Cpu className="size-4" />
          📦 对比 5 款规格参考实例技术参数 (ROI Spec Table)
        </button>
      </div>

      {/* Trial Reminder Alert */}
      {stats.hasClaimedDemo && activeMiners.some(m => m.isDemo && m.status === "stopped") && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 text-xs md:text-sm text-red-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-red-500/20 w-full h-[1.5px]" />
          <ServerCrash className="text-red-400 size-6 shrink-0" />
          <div>
            <h4 className="font-extrabold text-red-200 uppercase tracking-wide">⚠️ 免费模拟体验实例租期已结束</h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed font-medium">
              您的 3 分钟模拟体验实例已停机。如需恢复 AI Token 额度产出，请在下方订阅租赁适合您的规格参考实例，即可开始为您的算力公司积累产出。
            </p>
          </div>
        </div>
      )}

      {/* 5 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {MINER_TEMPLATES.map((template, idx) => {
          const currentStock = stocks[template.id] ?? template.stockToday;
          const cost = template.cost;
          const [minY, maxY] = template.baseYieldRange;
          
          const simulatedMin = minY * yieldMultiplier * 100;
          const simulatedMax = maxY * yieldMultiplier * 100;

          // Card visual systems
          let cardBg = "bg-white/5 border-white/10 hover:border-cyan-500/30";
          let hardwareHeader = "bg-gradient-to-br from-cyan-400/10 to-transparent border border-cyan-400/20";
          let rentButtonClass = "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white shadow-[0_4px_12px_rgba(6,182,212,0.3)]";
          
          if (template.id === "miner-l1") {
            cardBg = "bg-white/5 border border-white/10 hover:border-cyan-500/30";
            hardwareHeader = "bg-gradient-to-br from-cyan-400/10 to-transparent border border-cyan-400/20";
          } else if (template.id === "miner-l2") {
            cardBg = "bg-white/5 border border-white/10 hover:border-indigo-500/30";
            hardwareHeader = "bg-gradient-to-br from-indigo-400/15 to-transparent border border-indigo-400/25";
            rentButtonClass = "bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]";
          } else if (template.id === "miner-l3") {
            cardBg = "bg-white/5 border border-white/10 hover:border-purple-500/30";
            hardwareHeader = "bg-gradient-to-br from-purple-400/15 to-transparent border border-purple-400/25";
            rentButtonClass = "bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white shadow-[0_4px_12px_rgba(168,85,247,0.3)]";
          } else if (template.id === "miner-l4") {
            cardBg = "bg-gradient-to-br from-yellow-500/5 via-white/[0.02] to-transparent border border-yellow-500/20 hover:border-yellow-500/40";
            hardwareHeader = "bg-gradient-to-br from-yellow-400/15 to-transparent border border-yellow-400/30";
            rentButtonClass = "bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:brightness-110 text-black font-extrabold shadow-[0_0_15px_rgba(234,179,8,0.4)]";
          } else if (template.id === "miner-l5") {
            cardBg = "bg-gradient-to-br from-pink-500/10 via-purple-600/5 to-black/90 border border-pink-500/30 hover:border-pink-500/50 shadow-[inset_0_0_20px_rgba(236,72,153,0.05)]";
            hardwareHeader = "bg-gradient-to-br from-pink-500/20 via-purple-600/20 to-transparent border border-pink-500/30";
            rentButtonClass = "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:brightness-110 text-white font-extrabold shadow-[0_0_20px_rgba(236,72,153,0.5)]";
          }
          
          return (
            <div
              key={template.id}
              className={`${cardBg} rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                currentStock === 0 ? "opacity-60 grayscale" : "hover:-translate-y-1.5"
              }`}
            >
              {/* Card Title Header with custom serial code */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase">
                  VIRTUAL INSTANCE MODEL // L{idx + 1}
                </span>
                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                  currentStock > 1
                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-500/20"
                    : "bg-red-400/10 text-red-500 border border-red-500/20 animate-pulse"
                }`}>
                  {currentStock > 0 ? `配额剩余 ${currentStock} 个` : "配额售罄"}
                </span>
              </div>

              {/* Hardware visual simulator box */}
              <div className={`h-24 ${hardwareHeader} rounded-2xl mb-4 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm`}>
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <Cpu className={`size-8 mb-1.5 ${
                  template.id === 'miner-l5' ? 'text-pink-400 animate-pulse' : template.id === 'miner-l4' ? 'text-yellow-400' : 'text-slate-400'
                }`} />
                <span className="font-mono text-[9px] text-slate-400 tracking-wider font-semibold">
                  SPEC REFERENCE MODULE
                </span>
                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[7.5px] text-emerald-400 font-mono font-extrabold uppercase">V-SCHEDULER ACTIVE</span>
                </div>
              </div>

              {/* Instance Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className={`text-sm font-black text-transparent bg-clip-text bg-gradient-to-r ${getSubTitleColor(idx)}`}>
                    {template.name}
                  </h3>

                  {/* Ref hardware badge */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-500 font-bold">参考硬件:</span>
                      <span className="text-[10px] text-slate-300 font-mono font-semibold">{template.refHardwareName}</span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 leading-normal line-clamp-2">
                      {template.refSpecDescription}
                    </p>
                  </div>

                  <div className="mt-3 flex items-baseline gap-1 border-b border-white/5 pb-3">
                    <span className="text-2xl font-mono font-extrabold text-white tracking-tight">
                      {cost.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-xs font-mono font-bold">USDT</span>
                    <span className="text-slate-500 text-[9px] font-mono">/ {template.contractDays}天</span>
                  </div>

                  <div className="mt-3 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">规格参考价说明</span>
                      <span className="font-bold text-slate-300 text-[10px]">
                        {template.marketPriceRange}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">模拟日化比例</span>
                      <span className="font-mono font-bold text-green-400">
                        {simulatedMin.toFixed(2)}% ~ {simulatedMax.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Benefits lists */}
                  <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                    <p className="text-[8.5px] text-slate-500 font-extrabold uppercase tracking-widest block mb-1">
                      模拟特性与 API 场景
                    </p>
                    {template.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-1.5 text-[10.5px] text-slate-400 leading-normal">
                        <CheckCircle className="size-3 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                    <div className="text-[10px] text-slate-400 bg-white/5 p-2 rounded-xl border border-white/5 mt-2">
                      <span className="font-bold text-cyan-400">真实API场景:</span> {template.apiScenarios}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rent Action Button */}
              <div className="mt-5">
                <button
                  id={`btn-lease-${template.id}`}
                  disabled={currentStock === 0}
                  onClick={() => handleLeaseClick(template)}
                  className={`w-full py-3 rounded-xl font-bold tracking-wider text-[11px] uppercase transition-all duration-300 cursor-pointer ${
                    currentStock > 0
                      ? `${rentButtonClass} active:scale-95`
                      : "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {currentStock > 0 ? "立即租赁云实例" : "配额调配完毕"}
                </button>
                <p className="text-[9px] text-center text-slate-500 mt-2 font-mono">
                  * 仅提供虚拟云算力，非物理硬件交付
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee disclaimer */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col md:flex-row items-center gap-4 justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2.5 rounded-xl">
            <Flame className="size-5 text-cyan-400 animate-bounce" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">规格锚定模型与 AI Token 使用说明</h4>
            <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">
              本市场算力套餐均通过现实主流硬件型号进行配置和日产出锚定。产生额度的 AI Token 可于平台真实对接的大语言模型、网页总结、画图等 API 应用场景正常消耗，具有真实可信的价值流通。
            </p>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 text-right font-mono font-bold shrink-0">
          VIRTUAL CLOUD COMPUTING SERVICE
        </div>
      </div>

      {/* 5 Cards Comparison Table Modal */}
      <AnimatePresence>
        {isComparing && (
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
              className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-5xl w-full p-4 sm:p-6 text-center shadow-[0_0_40px_rgba(6,182,212,0.3)] relative max-h-[90vh] overflow-y-auto flex flex-col font-sans"
            >
              <button
                onClick={() => setIsComparing(false)}
                className="absolute top-2 right-2 p-3 text-slate-500 hover:text-white rounded-full hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px] touch-manipulation z-10"
              >
                <X className="size-6" />
              </button>

              <div className="text-left mb-4 sm:mb-6 space-y-1 pr-8">
                <span className="text-[9px] sm:text-[10px] text-cyan-400 font-mono font-extrabold tracking-widest block uppercase">VIRTUAL INSTANCE PARAMETER BLUEPRINT</span>
                <h3 className="text-sm sm:text-lg font-extrabold text-white leading-snug">5 款规格参考云算力实例对比</h3>
                <p className="text-[11px] text-slate-400">选择不同性能层级规格的虚拟云算力实例进行部署。</p>
              </div>

              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/45 scrollbar-thin scrollbar-thumb-slate-800">
                <table className="w-full text-left text-[11px] sm:text-xs min-w-[850px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-mono font-extrabold text-[9px] sm:text-[10px] tracking-wider uppercase">
                      <th className="p-3 sm:p-4">技术参数指标 (Technical Parameter)</th>
                      <th className="p-3 sm:p-4 text-cyan-400">L1 个人轻量实例</th>
                      <th className="p-3 sm:p-4 text-indigo-400">L2 开发者增强</th>
                      <th className="p-3 sm:p-4 text-purple-400">L3 国产 GPU 加速</th>
                      <th className="p-3 sm:p-4 text-yellow-400">L4 企业 AI 加速</th>
                      <th className="p-3 sm:p-4 text-pink-500">L5 算力中心旗舰</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-medium font-sans">
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">规格参考硬件 (Reference Hardware)</td>
                      <td className="p-3 sm:p-4 font-mono text-cyan-300">Mac mini M4</td>
                      <td className="p-3 sm:p-4 font-mono text-indigo-300">Mac mini M4 Pro</td>
                      <td className="p-3 sm:p-4 font-mono text-purple-300">MTT S4000</td>
                      <td className="p-3 sm:p-4 font-mono text-yellow-300">思元 MLU370-X8</td>
                      <td className="p-3 sm:p-4 font-mono text-pink-400 font-bold">Ascend 910B (Atlas 800)</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">规格参考价 (Ref. Hardware Price)</td>
                      <td className="p-3 sm:p-4">约 $599 起</td>
                      <td className="p-3 sm:p-4">约 $1,399 起</td>
                      <td className="p-3 sm:p-4">企业渠道询价</td>
                      <td className="p-3 sm:p-4">渠道询价 (不公开)</td>
                      <td className="p-3 sm:p-4 text-pink-400">大客户集成询价</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">云实例服务价 (Service Price)</td>
                      <td className="p-3 sm:p-4 font-mono text-white font-extrabold">20 USDT</td>
                      <td className="p-3 sm:p-4 font-mono text-white font-extrabold">80 USDT</td>
                      <td className="p-3 sm:p-4 font-mono text-white font-extrabold">300 USDT</td>
                      <td className="p-3 sm:p-4 font-mono text-white font-extrabold">1000 USDT</td>
                      <td className="p-3 sm:p-4 font-mono text-white font-extrabold">5000 USDT</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">服务期限 (Days)</td>
                      <td className="p-3 sm:p-4">30 天</td>
                      <td className="p-3 sm:p-4">30 天</td>
                      <td className="p-3 sm:p-4">60 天</td>
                      <td className="p-3 sm:p-4">90 天</td>
                      <td className="p-3 sm:p-4">180 天</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">模拟日化产出率 (Yield Ratio)</td>
                      <td className="p-3 sm:p-4 font-mono text-green-400">0.80% ~ 1.20%</td>
                      <td className="p-3 sm:p-4 font-mono text-green-400">0.90% ~ 1.30%</td>
                      <td className="p-3 sm:p-4 font-mono text-green-400">1.00% ~ 1.40%</td>
                      <td className="p-3 sm:p-4 font-mono text-green-400 font-semibold">1.20% ~ 1.60%</td>
                      <td className="p-3 sm:p-4 font-mono text-green-400 font-bold">1.40% ~ 1.80%</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">适合 API 场景 (API Use Cases)</td>
                      <td className="p-3 sm:p-4">基础对话、总结</td>
                      <td className="p-3 sm:p-4">网页分析、多Agent联动</td>
                      <td className="p-3 sm:p-4">知识库问答、多模态</td>
                      <td className="p-3 sm:p-4">画图应用、模型微调</td>
                      <td className="p-3 sm:p-4 text-pink-400">高频并发、长文本推理</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">设备并网说明</td>
                      <td className="p-3 sm:p-4 text-[10px] text-slate-400">本款虚拟实例不代表物理交付。所有产出由后台系数进行统筹结算。</td>
                      <td className="p-3 sm:p-4 text-[10px] text-slate-400">云实例运行状态稳定，极低物理降频率。</td>
                      <td className="p-3 sm:p-4 text-[10px] text-slate-400">采用国内自研GPU指标架构规格锚定。</td>
                      <td className="p-3 sm:p-4 text-[10px] text-slate-400">企业级加速卡标准架构，支持并发抵扣。</td>
                      <td className="p-3 sm:p-4 text-[10px] text-pink-400 font-semibold">旗舰集群标准服务，支持最大并发量API路由代理。</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-5 sm:mt-6 flex justify-end">
                <button
                  onClick={() => setIsComparing(false)}
                  className="w-full sm:w-auto px-6 py-3.5 sm:py-3 bg-gradient-to-r from-cyan-400 to-indigo-600 hover:brightness-110 text-slate-950 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all shadow-[0_2px_15px_rgba(6,182,212,0.3)] touch-manipulation min-h-[44px]"
                >
                  关闭技术比对表
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compliance Confirmation Dialog Modal */}
      <AnimatePresence>
        {confirmTemplate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-md w-full p-6 text-left shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden font-sans"
            >
              <button
                onClick={() => setConfirmTemplate(null)}
                className="absolute top-2 right-2 p-3 text-slate-500 hover:text-white rounded-full transition-all flex items-center justify-center cursor-pointer min-w-[44px]"
              >
                <X className="size-5" />
              </button>

              <div className="flex items-center gap-2 mb-4 text-amber-400 border-b border-white/5 pb-3">
                <ShieldAlert className="size-6 shrink-0" />
                <h3 className="text-base font-black text-white leading-none">确认租赁云实例及风险确认</h3>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                  <div className="flex justify-between font-bold text-white text-sm">
                    <span>{confirmTemplate.name}</span>
                    <span className="text-cyan-400">{confirmTemplate.cost} USDT</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    服务期限: {confirmTemplate.contractDays} 天 | 参考硬件: {confirmTemplate.refHardwareName}
                  </div>
                </div>

                <div className="space-y-2 leading-relaxed">
                  <p className="font-extrabold text-amber-300">🚨 重要合规声明（请逐条仔细阅读）：</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                    <li><b>非物理实体交付</b>：本服务为虚拟云算力服务，平台不交付、租赁、托管任何实体物理电脑或芯片硬件。</li>
                    <li><b>算力账本产出</b>：该实例为“规格参考模型”，您获得的是平台后端虚拟云算力账本计算得出的 <b>AI Token 产出额度</b>，实际额度将受后台配置的全局产出系数调控。</li>
                    <li><b>用途限定</b>：产出的 AI Token 可用于本平台提供的真实 AI 对话、总结、画图等 API 服务消耗，本平台不对任何投资回本周期及理财升值收益做任何承诺保证。</li>
                  </ul>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeDisclaimer}
                    onChange={(e) => setAgreeDisclaimer(e.target.checked)}
                    className="mt-0.5 size-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-[11px] leading-normal font-bold text-amber-200">
                    我已阅读并完全理解以上声明，已知晓此产品为“规格锚定虚拟实例”，非物理硬件，且无真实理财承诺。
                  </span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setConfirmTemplate(null)}
                  className="flex-1 py-3 text-xs font-bold bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-slate-300 cursor-pointer"
                >
                  取消
                </button>
                <button
                  disabled={!agreeDisclaimer}
                  onClick={handleConfirmLease}
                  className={`flex-1 py-3 text-xs font-black rounded-xl uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    agreeDisclaimer 
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      : "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  确认租赁并发起部署
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
