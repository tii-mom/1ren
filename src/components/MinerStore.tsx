import React, { useState, useEffect } from "react";
import { UserStats, MinerTemplate, ActiveMiner, UserLevel } from "../types";
import { Cpu, Calendar, TrendingUp, CheckCircle, Flame, Sparkles, ServerCrash, X, Award, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Initial set of store packages
const MINER_TEMPLATES: MinerTemplate[] = [
  {
    id: "miner-bronze",
    name: "基础推理引擎 (S1资格)",
    cost: 100,
    contractDays: 30,
    baseYieldRange: [0.008, 0.012],
    benefits: ["组建并激活AI算力公司（解锁S1职级）", "基础AI文本推理与图像代工业务处理", "日分红率：历史参考 0.8% ~ 1.2%（受景气度浮动）"],
    stockToday: 5
  },
  {
    id: "miner-silver",
    name: "进阶训练引擎 (订单分配)",
    cost: 500,
    contractDays: 60,
    baseYieldRange: [0.009, 0.013],
    benefits: ["分配“紧急高价值订单”，随机激发算能溢出", "多节点分布式智能深度计算训练代工", "日分红率：历史参考 0.9% ~ 1.3%"],
    stockToday: 3
  },
  {
    id: "miner-gold",
    name: "旗舰集群引擎 (弹性调度)",
    cost: 2000,
    contractDays: 90,
    baseYieldRange: [0.011, 0.015],
    benefits: ["尊享“弹性算力调度”，免液冷多维折损率 +10%", "下一代全新人工智能硬件认购权与保养优先权", "日分红率：历史参考 1.1% ~ 1.5%"],
    stockToday: 2
  },
  {
    id: "miner-genesis",
    name: "创世算力主节点 (上市铭牌)",
    cost: 10000,
    contractDays: 9999, // Permanent
    baseYieldRange: [0.013, 0.018],
    benefits: ["享有全球AI服务费 3% 加权分红、公司上市铭牌", "永续挖矿周期，全寿命不老化无损耗契约", "全级劳动合同雇员产出提速 20%", "自动授权集团调配决策委员会一席高爆席位"],
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
    "miner-bronze": 4,
    "miner-silver": 2,
    "miner-gold": 2,
    "miner-genesis": 1
  });

  const [yieldMultiplier, setYieldMultiplier] = useState(1.0);
  const [isComparing, setIsComparing] = useState(false);

  // Simulate global yield fluctuation (heartbeat pattern)
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate back and forth between 0.95 and 1.05
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
      case 1: return "from-violet-400 to-amber-400";
      case 2: return "from-yellow-400 to-orange-400 text-glow-gold";
      case 3: return "from-pink-500 via-red-500 to-yellow-500";
      default: return "from-cyan-400 to-blue-400";
    }
  };

  const maxSlots = 8;
  const occupiedSlots = activeMiners.filter(m => m.status !== "stopped").length;
  const loadPercentage = maxSlots > 0 ? Math.round((occupiedSlots / maxSlots) * 100) : 0;
  
  // Dynamic operating net profit calculation
  const hasDecayedMiner = activeMiners.some(m => m.status === "decayed");
  const hasSuperboostedMiner = activeMiners.some(m => m.efficiency > 1.10);
  
  let profitMargin = 0;
  let profitStatusLabel = "空闲待装载";
  let profitStatusColor = "text-slate-400";
  
  if (occupiedSlots > 0) {
    if (hasDecayedMiner) {
      profitMargin = 64.20;
      profitStatusLabel = "物理阻热半衰，效率降低";
      profitStatusColor = "text-amber-400";
    } else if (hasSuperboostedMiner) {
      profitMargin = 96.50;
      profitStatusLabel = "极高能加速，晶体溢出段";
      profitStatusColor = "text-emerald-400 font-extrabold animate-pulse text-glow-green";
    } else {
      profitMargin = 89.40;
      profitStatusLabel = "主频满载，爆块平稳期";
      profitStatusColor = "text-cyan-400 text-glow-cyan";
    }
  }

  return (
    <div className="space-y-6">

      {/* 🚀 AI Engine Room Realtime Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Telemetry 1: 全球节点实时收益监测中心 */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md hover:border-cyan-500/20 transition-all duration-300 col-span-1 lg:col-span-1 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl animate-pulse" />
          <div className="space-y-3">
            <h2 className="text-xs font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
              <TrendingUp className="text-cyan-400 size-4 animate-pulse" />
              全球节点算力调度
            </h2>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
              算力分布式物理信道对冲平衡中轨。全网日化哈希产出效率受全球总并网装机量周期对冲调控。
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest">物理自检效率</span>
              <span className="text-sm font-mono font-extrabold text-cyan-400 text-glow-cyan">
                {(yieldMultiplier * 100).toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-widest">全在线节点</span>
              <span className="text-sm font-mono font-extrabold text-violet-400 text-glow-purple">1,482,593 台</span>
            </div>
          </div>
        </div>

        {/* Telemetry 2: 经营利润率析卡 (显示动态日化收益) */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md hover:border-emerald-500/25 transition-all duration-300 col-span-1 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                <Flame className="text-emerald-400 size-4 animate-pulse" />
                经营利润率分析 (Operating Net Margin)
              </h2>
              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">LIVE REPORT</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
              综合托管电费损耗、耗散液及自检阻热系数扣除后的<b>真实净结算收益折算率</b>。主频状态佳时利润最高。
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-mono">日化参考经营效益</span>
              <span className="text-xl font-mono font-black text-emerald-400 text-glow-green">
                {profitMargin.toFixed(2)}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-500 block uppercase font-mono">当前健康能级状态</span>
              <span className={`text-[10.5px] font-bold ${profitStatusColor}`}>
                {profitStatusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry 3: 算力设备负载 (显示算力插槽占用) */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md hover:border-violet-500/25 transition-all duration-300 col-span-1 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                <Cpu className="text-violet-400 size-4" />
                算力设备负载监控 (Chassis Slot Load)
              </h2>
              <span className="text-[8px] font-mono text-violet-400 bg-violet-950 px-2 py-0.5 rounded border border-violet-500/20 font-bold">HARDWARE</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
              本内网独配 <b>{maxSlots}</b> 路超高能液冷/固态碳主板，用于承接分布式计算。插槽占用越多，公司爆块频次越高。
            </p>
          </div>

          <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">插槽总装填负载 ({occupiedSlots}/{maxSlots})</span>
              <span className="font-mono font-black text-violet-400">{loadPercentage}%</span>
            </div>
            {/* Real Progress Bar */}
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
          <Cpu className="size-4 animate-spin-slow" />
          📦 对比4款主力AI引擎托管参数及回本周期 (ROI Spec Table)
        </button>
      </div>

      {/* Trial Reminder Alert */}
      {stats.hasClaimedDemo && activeMiners.some(m => m.isDemo && m.status === "stopped") && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 text-xs md:text-sm text-red-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-red-500/20 w-full h-[1.5px]" />
          <ServerCrash className="text-red-400 size-6 shrink-0" />
          <div>
            <h4 className="font-extrabold text-red-200 uppercase tracking-wide">⚠️ 免费体验AI算力孵化契约已过期折算！</h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed font-medium">
              您的免费体验引擎已停机，算力产出已暂停。立即激活下方任意一款企业算力推理/训练引擎设备，即可恢复被断层上抛阻断的收益，并获得您1人有限公司的企业主管职级特权！
            </p>
          </div>
        </div>
      )}

      {/* 4 Cards Grid - Styled as premium hardware modules in Bento Grid style */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {MINER_TEMPLATES.map((template, idx) => {
          const currentStock = stocks[template.id] ?? template.stockToday;
          const cost = template.cost;
          const isPermanent = template.contractDays > 1000;
          const [minY, maxY] = template.baseYieldRange;
          
          // Apply simulation yield
          const simulatedMin = minY * yieldMultiplier * 100;
          const simulatedMax = maxY * yieldMultiplier * 100;

          // Craft individual bento styles for Bronze, Silver, Gold, and Genesis packages
          let cardBg = "bg-white/5 border-white/10";
          let hardwareHeader = "bg-gradient-to-br from-cyan-400/20 to-transparent border-cyan-500/20";
          let rentButtonClass = "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white shadow-[0_4px_12px_rgba(6,182,212,0.3)]";
          
          if (template.id === "miner-bronze") {
            cardBg = "bg-white/5 border border-white/10 hover:border-cyan-500/30";
            hardwareHeader = "bg-gradient-to-br from-orange-400/10 to-transparent border border-orange-400/20";
          } else if (template.id === "miner-silver") {
            cardBg = "bg-white/5 border border-white/10 hover:border-violet-500/30";
            hardwareHeader = "bg-gradient-to-br from-slate-400/15 to-transparent border border-slate-400/25";
            rentButtonClass = "bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)]";
          } else if (template.id === "miner-gold") {
            cardBg = "bg-gradient-to-br from-yellow-500/5 via-white/[0.02] to-transparent border border-yellow-500/20 hover:border-yellow-500/40";
            hardwareHeader = "bg-gradient-to-br from-yellow-400/15 to-transparent border border-yellow-400/30";
            rentButtonClass = "bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:brightness-110 text-black font-extrabold shadow-[0_0_15px_rgba(234,179,8,0.4)]";
          } else if (template.id === "miner-genesis") {
            cardBg = "bg-gradient-to-br from-pink-500/10 via-purple-600/5 to-black/90 border border-pink-500/30 hover:border-pink-500/50 shadow-[inset_0_0_20px_rgba(236,72,153,0.05)]";
            hardwareHeader = "bg-gradient-to-br from-pink-500/20 via-purple-600/20 to-transparent border border-pink-500/30";
            rentButtonClass = "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:brightness-110 text-white font-extrabold shadow-[0_0_20px_rgba(236,72,153,0.5)]";
          }
          
          return (
            <div
              key={template.id}
              className={`${cardBg} rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
                currentStock === 0 ? "opacity-60 grayscale" : "hover:-translate-y-1.5"
              }`}
            >
              {/* Card Title Header with custom serial code */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase">
                  NODE MODEL // M-{idx + 1}
                </span>
                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                  currentStock > 1
                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-500/20"
                    : "bg-red-400/10 text-red-500 border border-red-500/20 animate-pulse"
                }`}>
                  {currentStock > 0 ? `限量剩余 ${currentStock} 台` : "已抢空售罄"}
                </span>
              </div>

              {/* Hardware visual simulator box */}
              <div className={`h-24 ${hardwareHeader} rounded-2xl mb-5 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm`}>
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <Cpu className={`size-8 mb-1.5 ${
                  template.id === 'miner-genesis' ? 'text-pink-400 animate-pulse' : template.id === 'miner-gold' ? 'text-yellow-400' : 'text-slate-400'
                }`} />
                <span className="font-mono text-[9px] text-slate-400 tracking-wider font-semibold">
                  CHIP LEVEL MODULE 0{idx + 1}
                </span>
                <div className="absolute bottom-1 right-2 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[7.5px] text-emerald-400 font-mono font-extrabold uppercase">HW OUTSTAND</span>
                </div>
              </div>

              {/* Miner Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className={`text-base font-bold text-transparent bg-clip-text bg-gradient-to-r ${getSubTitleColor(idx)}`}>
                    {template.name}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-1.5 border-b border-white/5 pb-4">
                    <span className="text-3xl font-mono font-extrabold text-white tracking-tight">
                      {cost.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-xs font-mono font-bold">USDT</span>
                    <span className="text-slate-600 text-[10px] font-mono">({(cost * 7.2).toLocaleString()} CNY)</span>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center text-xs justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <Calendar className="size-3.5 text-slate-500" />
                        租赁期
                      </span>
                      <span className="font-bold text-slate-200">
                        {isPermanent ? "永久性终身合约" : `${template.contractDays} 天契约期限`}
                      </span>
                    </div>

                    <div className="flex items-center text-xs justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                        <Cpu className="size-3.5 text-cyan-400" />
                        结算日化比率
                      </span>
                      <span className="font-mono font-bold text-green-400 text-glow-cyan">
                        {simulatedMin.toFixed(2)}% ~ {simulatedMax.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Benefits lists */}
                  <div className="mt-5 space-y-2 border-t border-white/5 pt-4">
                    <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block mb-1">
                      专属算力劳役特权 / HOSTING SERVICES
                    </p>
                    {template.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-1.5 text-xs text-slate-300 leading-normal">
                        <CheckCircle className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rent Action Button */}
              <div className="mt-6">
                <button
                  id={`btn-lease-${template.id}`}
                  disabled={currentStock === 0}
                  onClick={() => onLeaseMiner(template)}
                  className={`w-full py-3.5 rounded-xl font-bold tracking-wider text-xs uppercase transition-all duration-300 cursor-pointer ${
                    currentStock > 0
                      ? `${rentButtonClass} active:scale-95`
                      : "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {currentStock > 0 ? "立即托管租赁" : "已全部调配完毕"}
                </button>
                <p className="text-[9.5px] text-center text-slate-500 mt-2.5 font-mono font-medium">
                  * 每日0点由气象熔炉统一自检算力及提币权益
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
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">分布式 AI 算力并网服务说明</h4>
            <p className="text-[10px] text-slate-400 font-medium leading-normal mt-0.5">
              本地部署并网的设备由平台进行全局网络调度和协同维护，主要承接大模型微调、训练和 API 接口调用任务。页面数值为模拟参考，不代表固定回报。
            </p>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 text-right font-mono font-bold shrink-0">
          LOCAL DEPLOYMENT & GRID SERVICE
        </div>
      </div>

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
              {/* Close button optimized for touch interaction (Hit area size min 44x44px) */}
              <button
                onClick={() => setIsComparing(false)}
                className="absolute top-2 right-2 p-3 text-slate-500 hover:text-white rounded-full hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px] touch-manipulation z-10"
              >
                <X className="size-6" />
              </button>

              <div className="text-left mb-4 sm:mb-6 space-y-1 pr-8">
                <span className="text-[9px] sm:text-[10px] text-cyan-400 font-mono font-extrabold tracking-widest block uppercase">CROSS-HARDWARE PARAMETER BLUEPRINT</span>
                <h3 className="text-sm sm:text-lg font-extrabold text-white leading-snug">4 款并网 GPU 设备规格对比</h3>
                <p className="text-[11px] text-slate-400">根据预算、并网周期和动态产出参考选择设备。</p>
              </div>

              {/* Mobile horizontal swipe notice */}
              <div className="block lg:hidden text-left text-cyan-400/80 font-sans text-[10px] mb-2 tracking-wide font-medium">
                💡 左右滑动表格可查看全部 4 款 AI 算力设备的详细对比
              </div>

              <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/45 scrollbar-thin scrollbar-thumb-slate-800">
                <table className="w-full text-left text-[11px] sm:text-xs min-w-[750px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-400 font-mono font-extrabold text-[9px] sm:text-[10px] tracking-wider uppercase">
                      <th className="p-3 sm:p-4">核心参数指标 (Technical Parameter)</th>
                      <th className="p-3 sm:p-4 text-cyan-400">A100 算力单元 (S1级)</th>
                      <th className="p-3 sm:p-4 text-violet-400">8 × H100 集群 (S2级)</th>
                      <th className="p-3 sm:p-4 text-yellow-400">H200 NVL 集群 (S3级)</th>
                      <th className="p-3 sm:p-4 text-pink-500">GH200 超级集群 (S5级)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 font-medium font-sans">
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">GPU 硬件规格与内存 (GPU & Memory)</td>
                      <td className="p-3 sm:p-4 font-mono text-cyan-300">A100 80GB PCIe</td>
                      <td className="p-3 sm:p-4 font-mono text-violet-300">8 × H100 80GB SXM5</td>
                      <td className="p-3 sm:p-4 font-mono text-yellow-300">8 × H200 NVL 141GB</td>
                      <td className="p-3 sm:p-4 font-mono text-pink-400 font-bold">GH200 Grace Hopper 576GB</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">配置资产成本 (Cost)</td>
                      <td className="p-3 sm:p-4 font-mono text-white font-extrabold">100 USDT</td>
                      <td className="p-3 sm:p-4 font-mono text-white font-extrabold">500 USDT</td>
                      <td className="p-3 sm:p-4 font-mono text-white font-extrabold">2000 USDT</td>
                      <td className="p-3 sm:p-4 font-mono text-white font-extrabold">10000 USDT</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">并网周期 (Days)</td>
                      <td className="p-3 sm:p-4">30 天</td>
                      <td className="p-3 sm:p-4">60 天</td>
                      <td className="p-3 sm:p-4">90 天</td>
                      <td className="p-3 sm:p-4 text-pink-400 font-bold">长期并网 (终身)</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">日化产出率 (Yield Ratio)</td>
                      <td className="p-3 sm:p-4 font-mono text-green-400">0.80% ~ 1.20%</td>
                      <td className="p-3 sm:p-4 font-mono text-green-400">0.90% ~ 1.30%</td>
                      <td className="p-3 sm:p-4 font-mono text-green-400 font-semibold">1.10% ~ 1.50%</td>
                      <td className="p-3 sm:p-4 font-mono text-green-400 font-bold">1.30% ~ 1.80%</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">理论月度收益 (Est. Yield)</td>
                      <td className="p-3 sm:p-4 font-mono text-white">24 U ~ 36 U</td>
                      <td className="p-3 sm:p-4 font-mono text-white">135 U ~ 195 U</td>
                      <td className="p-3 sm:p-4 font-mono text-white font-bold">660 U ~ 900 U</td>
                      <td className="p-3 sm:p-4 font-mono text-yellow-400 font-extrabold">3,900 U ~ 5,400 U</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">回本周期 (ROI)</td>
                      <td className="p-3 sm:p-4">约 25 ~ 30 天</td>
                      <td className="p-3 sm:p-4">约 23 ~ 28 天</td>
                      <td className="p-3 sm:p-4 font-semibold text-cyan-300">约 18 ~ 24 天</td>
                      <td className="p-3 sm:p-4 text-emerald-400 font-bold">约 16 ~ 21 天</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">团队等级权限</td>
                      <td className="p-3 sm:p-4 text-[10px] text-slate-400">解锁 S1 级网络拓扑。</td>
                      <td className="p-3 sm:p-4 text-[10px] text-slate-400">满足团队条件后支持 S2 级调度。</td>
                      <td className="p-3 sm:p-4 text-[10px] text-slate-400">满足团队条件后支持 S3 级调度。</td>
                      <td className="p-3 sm:p-4 text-[10px] text-pink-400 font-semibold">支持 S5 级骨干中枢决策席位。</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">降频与温控维护</td>
                      <td className="p-3 sm:p-4 text-[10px] text-slate-400">需定期加注温控维护液以恢复超频产出。</td>
                      <td className="p-3 sm:p-4 text-[10px] text-slate-400">散热条件良好，降频概率较低。</td>
                      <td className="p-3 sm:p-4 text-[10px] text-yellow-400 font-semibold">平台优先保障液冷温控，极低降频率。</td>
                      <td className="p-3 sm:p-4 text-[10px] text-green-400 font-semibold">全天候专属液冷运维队列，保障满载运行。</td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-white bg-white/[0.01]">网络故障冗余与安全保障</td>
                      <td className="p-3 sm:p-4 font-sans text-[10px] text-slate-400">基础并网冗余，24小时故障迁移。</td>
                      <td className="p-3 sm:p-4 font-sans text-[10px] text-violet-300">骨干节点，支持高频负载自适应调节与任务冗余。</td>
                      <td className="p-3 sm:p-4 font-sans text-[10px] text-yellow-300 font-semibold">核心并网物理集群，硬件级双路 NVLink 备援，无损切换。</td>
                      <td className="p-3 sm:p-4 font-semibold text-[10px] text-pink-400">骨干中枢级冷化温控与灾备物理防护，享有最高调度优先级。</td>
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

    </div>
  );
};
