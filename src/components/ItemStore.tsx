import React, { useState } from "react";
import { UserStats, StoreItem } from "../types";
import { MOCK_STORE_ITEMS } from "../utils/storage";
import { 
  ShoppingBag, Box, ShieldCheck, Heart, X, Check, Copy, FileText, 
  Truck, ArrowRight, Smartphone, Coins, Cpu, Server, Snowflake, 
  Droplet, Wrench, Sparkles, Plus, Database, Calendar, Shield, ClipboardList
} from "lucide-react";

interface ItemStoreProps {
  stats: UserStats;
  onRedeemItem: (item: StoreItem) => void;
  onBuyCoolant?: (costInFragments: number) => void;
}

export const renderStoreItemIcon = (itemId: string, className = "size-10 text-cyan-400") => {
  switch (itemId) {
    case "item-1":
      return <Smartphone className={className} />;
    case "item-2":
      return <Coins className={className} />;
    case "item-3":
      return <Cpu className={className} />;
    case "item-4":
      return <Server className={className} />;
    case "item-5":
      return <Snowflake className={className} />;
    default:
      return <Box className={className} />;
  }
};

export const ItemStore: React.FC<ItemStoreProps> = ({ stats, onRedeemItem, onBuyCoolant }) => {
  const [filter, setFilter] = useState<"all" | "physical" | "hosting" | "erp">("all");
  const [erpTab, setErpTab] = useState<"inventory" | "procure" | "logs">("inventory");
  
  // Custom Receipt invoice state
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastItem, setLastItem] = useState<StoreItem | null>(null);
  const [receiptAddress, setReceiptAddress] = useState("yudeyou0118@gmail.com");
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [invoiceHash] = useState(() => "TX_MEMBER_" + Math.random().toString(36).substr(2, 9).toUpperCase());

  // Coolant purchase feedback notice
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  // Simulated AI Algorithm Licenses State
  const [algorithmLicenses, setAlgorithmLicenses] = useState([
    { id: "ALGO-V4", name: "DeepSeek-Chat 推理提效协议", status: "Active", bandwidth: "1.2 T/s", cost: "50 Shards", key: "0xFC88...AE9" },
    { id: "ALGO-QL", name: "Qwen-Coder 代码增强引擎协议", status: "Available", bandwidth: "3.5 T/s", cost: "300 Shards", key: "未授权" },
    { id: "ALGO-VLM", name: "Gemini-Vision 多模态感知模型授权", status: "Development", bandwidth: "Pending", cost: "Future Exp", key: "未来扩展" },
  ]);

  // Handle direct coolant buy via the prop passed from App
  const handleBuyCoolantDirect = () => {
    if (onBuyCoolant) {
      if (stats.hashFragments < 50) {
        setPurchaseNotice("⚠️ 碎片不足以购买纳米冷却灌洗液。");
        setTimeout(() => setPurchaseNotice(null), 3000);
        return;
      }
      onBuyCoolant(50);
      setPurchaseNotice("🧪 纳米冷却液液氮采购指令响应！库存已 +1。");
      setTimeout(() => setPurchaseNotice(null), 3000);
    }
  };

  // Handle local simulation for AI Algorithm License upgrade
  const handleActivateLicense = (licenseId: string, cost: number) => {
    if (stats.hashFragments < cost) {
      setPurchaseNotice("⚠️ 无法授权：算能碎片积余不足以支付算法服务期开销！");
      setTimeout(() => setPurchaseNotice(null), 3000);
      return;
    }
    setAlgorithmLicenses(prev => prev.map(l => {
      if (l.id === licenseId) {
        return { ...l, status: "Active", key: "0x" + Math.random().toString(16).substr(2, 6).toUpperCase() + "...OK" };
      }
      return l;
    }));
    
    // Call the items hook under the hood or notify user directly
    const dummyItem: StoreItem = {
      id: licenseId,
      name: `【AI算法授权协议】 - S级算法卡`,
      costFragments: cost,
      category: "hosting",
      image: "💾",
      description: "一键激活企业自研计算大模型对冲协议，永久防衰竭对冲提升。",
      stock: 1
    };
    onRedeemItem(dummyItem);
    setPurchaseNotice(`🔮 升级指令受理！【${licenseId}】算法加速协议验证通过，大盘效率增强！`);
    setTimeout(() => setPurchaseNotice(null), 3000);
  };

  const filteredItems = MOCK_STORE_ITEMS.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  const handleLocalRedeem = (item: StoreItem) => {
    onRedeemItem(item);
    setLastItem(item);
    setShowReceipt(true);
  };

  const handleCopyInvoiceCode = () => {
    const text = `算力魔方发运凭执\n流水编号: ${invoiceHash}\n承租商品: ${lastItem?.name}\n支付对消: ${lastItem?.costFragments} 碎片\n交割渠道: ${lastItem?.category === "physical" ? "顺丰冷链安全速运" : "中枢自主并网托管"}`;
    try {
      navigator.clipboard.writeText(text);
    } catch {}
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  // Simulated ERP storage items stats values represent raw data values
  const totalCapex = MOCK_STORE_ITEMS.length * 12 + stats.hashCrystals * 1500;

  return (
    <div className="space-y-6 font-sans text-slate-100">

      {/* Corporate ERP Overview Header Banner */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-cyan-400 size-5 animate-pulse" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              企业物资库 ── 资源管理大盘 (Enterprise Material ERP Ledger)
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium max-w-3xl leading-relaxed">
            本部门负责管理创始人在【算力魔方网络】中累积的所有高性能物理耗材、协议资产授权以及冷链交割物流。
            提供冷却液极速采购、AI算法协议授权卡开通等一站式智能化资产调度服务。
          </p>
          
          {purchaseNotice && (
            <div className="p-2 px-3 bg-cyan-950/80 border border-cyan-500/30 text-xs rounded-xl text-cyan-400 inline-block font-bold mt-2 animate-bounce">
              {purchaseNotice}
            </div>
          )}
        </div>

        {/* Global Action Tab Selector: Standard Store vs Detailed ERP */}
        <div className="flex bg-black/40 border border-white/5 p-1 rounded-2xl shrink-0 self-start lg:self-center">
          <button
            onClick={() => { setFilter("all"); }}
            className={`px-4 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer ${
              filter !== "erp"
                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_2px_10px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🛍️ 藏品物资商超
          </button>
          <button
            onClick={() => { setFilter("erp"); }}
            className={`px-4 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer ${
              filter === "erp"
                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_2px_10px_rgba(6,182,212,0.3)] animate-pulse"
                : "text-slate-400 hover:text-white"
            }`}
          >
            📊 企业级 ERP 精细化管理
          </button>
        </div>
      </div>

      {filter === "erp" ? (
        /* ==================== REDESIGNED ERP-STYLE VIEW ==================== */
        <div className="space-y-6">
          
          {/* Sub Tab Navigation inside ERP */}
          <div className="flex border-b border-white/10 gap-4">
            <button
              onClick={() => setErpTab("inventory")}
              className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 px-1 ${
                erpTab === "inventory" ? "border-cyan-400 text-cyan-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="size-4" />
              物资可用性总账 (Inventory Report)
            </button>
            <button
              onClick={() => setErpTab("procure")}
              className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 px-1 ${
                erpTab === "procure" ? "border-cyan-400 text-cyan-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Wrench className="size-4 animate-spin-slow" />
              维护耗材及算法协议卡采购 (Procurement Desk)
            </button>
            <button
              onClick={() => setErpTab("logs")}
              className={`pb-3 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-b-2 px-1 ${
                erpTab === "logs" ? "border-cyan-400 text-cyan-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Truck className="size-4" />
              交割发运与对账单明细 (Shipment Track)
            </button>
          </div>

          {erpTab === "inventory" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: Live Storage Grid Display */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual Storage Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Card 1: Coolant Container */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
                    <div className="absolute top-0 right-0 bg-cyan-500/5 w-16 h-16 rounded-full blur-xl" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono font-bold">WAREHOUSE // ZONE A</span>
                      <Droplet className="size-5 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[9px] block text-slate-400 uppercase font-bold tracking-wider">纳米防衰竭冷却液液氮</span>
                      <span className="text-2xl font-mono font-extrabold text-cyan-400 text-glow-cyan">
                        {stats.coolantCount} <span className="text-xs font-normal text-slate-400">瓶在库</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 border-t border-white/5 pt-2">
                      安全余量保证值: <b>1 瓶</b>
                    </div>
                  </div>

                  {/* Card 2: Crystals Block */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-yellow-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 bg-yellow-500/5 w-16 h-16 rounded-full blur-xl" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono font-bold">CORE // ASSET C</span>
                      <Sparkles className="size-5 text-yellow-500" />
                    </div>
                    <div>
                      <span className="text-[9px] block text-slate-400 uppercase font-bold tracking-wider">数字固化高纯度算能晶体</span>
                      <span className="text-2xl font-mono font-extrabold text-yellow-500 text-glow-gold">
                        {stats.hashCrystals} <span className="text-xs font-normal text-slate-400">颗在库</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 border-t border-white/5 pt-2">
                      熔炼估价: <b>{(stats.hashCrystals * 100).toLocaleString()} Shards</b>
                    </div>
                  </div>

                  {/* Card 3: Free Shards */}
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-emerald-500/10 transition-all duration-300">
                    <div className="absolute top-0 right-0 bg-emerald-500/5 w-16 h-16 rounded-full blur-xl" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono font-bold">LEDGER // SHARES</span>
                      <Database className="size-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[9px] block text-slate-400 uppercase font-bold tracking-wider">散装算量基础物理碎片</span>
                      <span className="text-2xl font-mono font-extrabold text-emerald-400">
                        {stats.hashFragments.toFixed(2)} <span className="text-xs font-normal text-slate-400">碎片额</span>
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 border-t border-white/5 pt-2">
                      可用累算值: <b>{stats.accumulatedFragments.toFixed(2)} Shards</b>
                    </div>
                  </div>

                </div>

                {/* Ledger Detailed Table */}
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                      <Box className="size-4 text-cyan-400" />
                      当前储备物资及状态明细表
                    </h3>
                    <span className="text-[9px] font-mono text-slate-500">REALTIME AUDITING</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500 font-mono text-[9px] font-bold tracking-widest uppercase">
                          <th className="pb-2">本位编码 (SKU)</th>
                          <th className="pb-2">物料名称</th>
                          <th className="pb-2">类别</th>
                          <th className="pb-2">账存数量</th>
                          <th className="pb-2">可用状况</th>
                          <th className="pb-2 text-right">消耗计提成本</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        <tr className="hover:bg-white/[0.01]">
                          <td className="py-2.5 font-mono text-cyan-400 block mt-1">C001-COOL</td>
                          <td className="py-2.5 font-bold text-white">纳米防爆高能冷却液 (Nanotech Coolant Liquid Nitrogen)</td>
                          <td className="py-2.5 text-slate-400">冷却易耗品</td>
                          <td className="py-2.5 font-mono text-cyan-300 font-bold">{stats.coolantCount} 箱</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[10px]">即刻冷却加注</span>
                          </td>
                          <td className="py-2.5 text-right font-mono text-slate-400">50 个碎片/件</td>
                        </tr>
                        <tr className="hover:bg-white/[0.01]">
                          <td className="py-2.5 font-mono text-cyan-400">AM-ALGO-V4</td>
                          <td className="py-2.5 font-bold text-white">DeepSeek推理逻辑加速协议授权 (Permanent Model License)</td>
                          <td className="py-2.5 text-slate-400">算法授权卡</td>
                          <td className="py-2.5 font-mono text-cyan-300 font-bold">1 份授权</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[10px]">运行正常</span>
                          </td>
                          <td className="py-2.5 text-right font-mono text-slate-400">50 个碎片已抵</td>
                        </tr>
                        <tr className="hover:bg-white/[0.01]">
                          <td className="py-2.5 font-mono text-cyan-400">C018-CRYS</td>
                          <td className="py-2.5 font-bold text-white">数字固化中枢固接晶体 (Fused Solid Cloud Crystal)</td>
                          <td className="py-2.5 text-slate-400">高级硬通晶化资产</td>
                          <td className="py-2.5 font-mono text-yellow-400 font-bold">{stats.hashCrystals} 块</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-[10px]">持仓蓄能中</span>
                          </td>
                          <td className="py-2.5 text-right font-mono text-slate-400">100 个碎片合成/块</td>
                        </tr>
                        <tr className="hover:bg-white/[0.01]">
                          <td className="py-2.5 font-mono text-cyan-400">SU-SHARD</td>
                          <td className="py-2.5 font-bold text-white">零散哈希智能代工积分凭证 (Operational Fragments)</td>
                          <td className="py-2.5 text-slate-400">基本结算积分</td>
                          <td className="py-2.5 font-mono text-emerald-400 font-bold">{stats.hashFragments.toFixed(1)} 积分</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px]">即刻结算/易用</span>
                          </td>
                          <td className="py-2.5 text-right font-mono text-slate-400">自检空投 / 挖矿日结</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
              
              {/* Right Side: Quick Action & System Rules */}
              <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="size-4 text-cyan-400" />
                    物资管理规定 & 折扣率说明
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    根据《算力魔方智能托管协议》，所有易耗类采购和升级产品均享有多级折扣。
                    当前由于您的职级加成，合成晶体或置换物理耗材时的多余量子尾尘溢出率自动降低 <b>1.5%</b>，极速缩减损耗。
                  </p>
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2 text-[10.5px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">当前执行折扣比</span>
                      <span className="text-cyan-400 font-mono font-bold">0.985 (减免1.5%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">配送交割时速</span>
                      <span className="text-white">特快的顺丰冷链运输</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">保价政策</span>
                      <span className="text-emerald-400 font-bold">全网对冲 100% 赔付保全</span>
                    </div>
                  </div>
                </div>

                {/* Simulated AI model license tracking */}
                <div className="bg-gradient-to-b from-[#111329] to-[#080916] border border-white/10 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="size-4 text-cyan-400 animate-pulse" />
                    AI模型协议对冲注册中心
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    并网托管大模型推理必须实时申请大模型加速卡及许可授权：
                  </p>
                  
                  <div className="space-y-2">
                    {algorithmLicenses.map(algo => (
                      <div key={algo.id} className="p-2.5 bg-black/45 border border-white/5 rounded-xl text-[10.5px] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{algo.name}</div>
                          <div className="text-[9.5px] text-slate-500 font-mono mt-0.5">授信密钥: {algo.key}</div>
                        </div>
                        {algo.status === "Active" ? (
                          <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-mono">
                            已验证运行
                          </span>
                        ) : algo.status === "Available" ? (
                          <button
                            onClick={() => handleActivateLicense(algo.id, parseInt(algo.cost))}
                            className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-bold text-[9px] py-1 px-2.5 rounded-lg transition-all"
                          >
                            激活 ({algo.cost})
                          </button>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 text-[9px] font-mono">
                            高层未解锁
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {erpTab === "procure" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* item Direct: Buy Coolant */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-500/20 transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-full h-32 rounded-2xl bg-black/45 border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial-gradient" />
                    <Droplet className="size-14 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-bounce" />
                    <span className="absolute top-2.5 left-2.5 text-[8.5px] font-mono font-bold uppercase bg-cyan-950 border border-cyan-500/20 text-cyan-400 px-2.5 py-0.5 rounded-full">
                      急救维护灌洗 (Fluid)
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      纳米防爆冷却液液氮 气调灌洗瓶装 (Nanotech Coolant CAN)
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal min-h-[36px] font-medium font-sans">
                      专门用于物理机房由于长期满负荷超频产生的过载高热维护。注入液氮可自动清除100%高热积沙, 并加赠15%永久溢价权。
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
                    <span className="text-xs text-slate-500">采购支出成本</span>
                    <span className="text-lg font-mono font-extrabold text-cyan-400">50 个算力碎片</span>
                  </div>
                  <button
                    onClick={handleBuyCoolantDirect}
                    className="w-full py-3 bg-gradient-to-r from-cyan-400 to-indigo-600 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_2px_12px_rgba(6,182,212,0.3)] cursor-pointer active:scale-95"
                  >
                    立即付款采购一罐
                  </button>
                </div>
              </div>

              {/* item Direct: Buy High Performance Algorithm license pack */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-violet-500/20 transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-full h-32 rounded-2xl bg-black/45 border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial-gradient" />
                    <Cpu className="size-14 text-violet-400 drop-shadow-[0_0_15px_rgba(139,92,246,0.4)] animate-pulse" />
                    <span className="absolute top-2.5 left-2.5 text-[8.5px] font-mono font-bold uppercase bg-purple-950 border border-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full">
                      算法主权增益 (Algorithm)
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      AI高效推理调度算法协议卡 (Computational Enhancer Licence)
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal min-h-[36px] font-medium font-sans">
                      一键并网注册自研智能模型对冲框架。采购并永久激活此算法卡，系统将直接为您的主频总算能速率附加永久性 <b>+5.0 T/s</b> 提效收益！
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
                    <span className="text-xs text-slate-500">采购支出成本</span>
                    <span className="text-lg font-mono font-extrabold text-violet-300">300 个算力碎片</span>
                  </div>
                  <button
                    onClick={() => handleActivateLicense("ALGO-QL", 300)}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_2px_12px_rgba(139,92,246,0.3)] cursor-pointer active:scale-95"
                  >
                    立即购买协议提速卡
                  </button>
                </div>
              </div>

              {/* item Direct: High speed passive cooler copper heatsink */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-yellow-500/10 transition-all duration-300 opacity-80 hover:opacity-100">
                <div className="space-y-4">
                  <div className="w-full h-32 rounded-2xl bg-black/45 border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial-gradient" />
                    <Snowflake className="size-14 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
                    <span className="absolute top-2.5 left-2.5 text-[8.5px] font-mono font-bold uppercase bg-yellow-950 border border-yellow-500/20 text-yellow-500 px-2.5 py-0.5 rounded-full">
                      企业硬件升级 (Passive Cooling)
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      高热导量子抗衰超导铜管散件 (Heatsink Module Pack)
                    </h3>
                    <p className="text-xs text-slate-400 leading-normal min-h-[36px] font-medium font-sans">
                      利用高纯超导物理冷凝科技加装在托管代工卡上。装配后可极大提高硬件阻热极，降低各机组日常超频时的冷衰损速度。
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-baseline justify-between border-b border-white/5 pb-3">
                    <span className="text-xs text-slate-500">采购支出成本</span>
                    <span className="text-lg font-mono font-extrabold text-yellow-400">1,200 个算力碎片</span>
                  </div>
                  <button
                    onClick={() => {
                      if (stats.hashFragments < 1200) {
                        setPurchaseNotice("⚠️ 碎片不足以购买硬件超导散热散件！");
                        setTimeout(() => setPurchaseNotice(null), 3000);
                        return;
                      }
                      const dummyItem: StoreItem = {
                        id: "item-heatsink",
                        name: "超导铜管散能模块",
                        costFragments: 1200,
                        category: "hosting",
                        image: "🧪",
                        description: "企业级高导物理散热模组，永久保修降温防阻。",
                        stock: 5
                      };
                      onRedeemItem(dummyItem);
                      setPurchaseNotice("✨ 自检模块部署成功！物理阻温抗衰延迟已全套加载上行。");
                      setTimeout(() => setPurchaseNotice(null), 3000);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_2px_12px_rgba(234,179,8,0.3)] cursor-pointer active:scale-95"
                  >
                    立即全款采购散件
                  </button>
                </div>
              </div>

            </div>
          )}

          {erpTab === "logs" && (
            <div className="bg-black/30 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">智能并网交割与物理物流追踪账目</h3>
                  <p className="text-[10px] text-slate-500 font-sans mt-0.5">跟踪发货单据以及中枢自主并网托管机器的安全权证签名</p>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">100% BLOCKCHAIN TRACKING OK</span>
              </div>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-black/50 border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-slate-400 font-bold">
                    <span>单据 TX_MEMBER_9824AA</span>
                    <span className="text-green-400">✓ 已递交顺丰特快揽收</span>
                  </div>
                  <div className="text-[11px] text-slate-300">商品名称: Custom Gold Bar (50g)定制黄金金条</div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-white/[0.03]">
                    <span>发运目的地: yudeyou0118@gmail.com</span>
                    <span>物流状态: 深圳公明航站区发出（已由深圳海关备案保值保运）</span>
                  </div>
                </div>

                <div className="p-3 bg-black/50 border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-slate-400 font-bold">
                    <span>单据 TX_MEMBER_8721BC</span>
                    <span className="text-green-400">✓ 自建并网云托管激活完毕</span>
                  </div>
                  <div className="text-[11px] text-slate-300">商品名称: iPhone 17 Pro Max仿生钛金版</div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-white/[0.03]">
                    <span>映射节点: 自主对冲物理并轨托管 L4箱</span>
                    <span>机组定位: 重庆高新区科学城1号自备冷水集群</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ==================== STANDARD BOUTIQUE EXCHANGE VIEW ==================== */
        <div className="space-y-6">
          
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-b border-white/5 pb-3">
            <span className="text-xs text-slate-400">
              筛选下的专属算能代工兑换藏品 (可用算力碎片积余: <b className="text-emerald-400 font-mono">{stats.hashFragments.toFixed(2)}</b> 个)
            </span>
            <div className="flex gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping self-center" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">ZERO CENTRAL INVOLVEMENT</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isAffordable = stats.hashFragments >= item.costFragments;
              
              return (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:-translate-y-1 group relative overflow-hidden"
                >
                  <div>
                    {/* Visual backdrop highlight */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/[0.02] rounded-full blur-2xl pointer-events-none" />

                    {/* Big icon representing the item */}
                    <div className="w-full h-36 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center mb-4 relative overflow-hidden group-hover:bg-black/50 transition-colors">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0%,transparent_70%)] pointer-events-none" />
                      <div className="transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        {renderStoreItemIcon(item.id, "size-14 text-cyan-400/90 drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]")}
                      </div>
                      
                      <span className="absolute top-3 left-3 text-[9px] font-bold tracking-wider bg-white/5 backdrop-blur-sm border border-white/10 px-2.5 py-0.5 rounded-full text-slate-300 font-mono uppercase">
                        {item.category === "physical" ? "实体爆品" : "协议引擎"}
                      </span>
                    </div>

                    {/* Info block */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-cyan-400 border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                          COSMIC LIMITED
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-medium">
                          限量库存 {item.stock} 件
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white tracking-wide group-hover:text-cyan-400 transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed min-h-[34px] font-medium font-sans">
                         {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Cost */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex flex-col gap-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        所需物理碎片
                      </span>
                      <span className="font-mono font-extrabold text-[#22d3ee] text-glow-cyan text-sm">
                        {item.costFragments.toLocaleString()} <span className="text-[10px] font-medium text-slate-400">Fragments</span>
                      </span>
                    </div>

                    <button
                      id={`btn-redeem-${item.id}`}
                      disabled={!isAffordable}
                      onClick={() => handleLocalRedeem(item)}
                      className={`w-full py-3.5 rounded-xl font-bold tracking-wider text-xs uppercase transition-all duration-300 select-none ${
                        isAffordable
                          ? "bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:brightness-110 text-white cursor-pointer active:scale-[0.98] shadow-[0_4px_12px_rgba(6,182,212,0.2)]"
                          : "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed font-medium"
                      }`}
                    >
                      {isAffordable ? "一键积分交割" : "碎片不足，努力打卡"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 🧾 ERP / Shipment Details Invoice Modal */}
      {showReceipt && lastItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in animate-duration-200">
          <div className="bg-[#0b0c16] border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 relative shadow-[0_15px_50px_rgba(6,182,212,0.15)]">
            
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-xs cursor-pointer bg-white/5 hover:bg-white/15 rounded-full w-6 h-6 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="text-center pt-2">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl animate-bounce">
                  {renderStoreItemIcon(lastItem.id, "size-10 text-cyan-400")}
                </div>
              </div>
              <span className="text-[9px] text-cyan-400 font-mono tracking-widest block uppercase font-extrabold">Logistics Dispatch Slip</span>
              <h3 className="text-base font-black text-white mt-1">算力物联仓储发运对消账单</h3>
            </div>

            {/* Simulated Carbon Paper Thermal Invoice */}
            <div className="bg-black/80 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-[11px] text-slate-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 bg-cyan-950 text-cyan-400 text-[8px] font-bold border-l border-b border-slate-800">
                ERP REGISTRY
              </div>
              
              <div className="space-y-1 border-b border-slate-900 pb-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">流水账单编号:</span>
                  <span className="text-white font-bold">{invoiceHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">交割扣消方式:</span>
                  <span className="text-yellow-400">大宗积分划拨</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">消扣对价:</span>
                  <span className="text-cyan-400 font-bold">-{lastItem.costFragments} 碎片</span>
                </div>
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex items-center gap-1.5">
                  <FileText className="size-3.5 text-slate-500" />
                  <span className="text-white font-bold">{lastItem.name}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-sans">
                  {lastItem.description}
                </p>
              </div>

              <div className="border-t border-slate-900 pt-2.5 space-y-2">
                <div>
                  <label className="text-[9px] text-slate-500 block uppercase font-bold mb-1">物理发运寄达邮箱 & 顺丰通知信箱</label>
                  <input
                    type="email"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-cyan-500 text-[10.5px]"
                    value={receiptAddress}
                    onChange={(e) => setReceiptAddress(e.target.value)}
                    placeholder="请输入收件信箱"
                  />
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 space-y-1 text-[9.5px]">
                  <div className="flex items-center gap-1.5 text-slate-400 font-sans font-bold">
                    <Truck className="size-3.5 text-cyan-400" />
                    <span>交割流向追踪备案:</span>
                  </div>
                  <p className="text-[10.5px] leading-relaxed text-slate-300 font-sans font-medium">
                    {lastItem.category === "physical" 
                      ? "【外部发货】顺丰特快空运（包装严密防静电，含公网发票，运单信息已送至上列邮箱）"
                      : "【并用并网】四川凉山水电代工托管库，直连3号自建对冲集装箱柜，智能提高1.2倍并网能效！"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyInvoiceCode}
                className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedInvoice ? (
                  <>
                    <Check className="size-3.5 text-green-400" />
                    凭扣已复制
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    复制发证凭扣
                  </>
                )}
              </button>

              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-400 to-indigo-600 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs uppercase transition-all shadow-[0_2px_15px_rgba(6,182,212,0.3)] cursor-pointer active:scale-95 text-center block"
              >
                确认交割账单
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
