import React, { useState } from "react";
import { UserStats, StoreItem } from "../types";
import { MOCK_STORE_ITEMS } from "../utils/storage";
import {
  Box,
  Check,
  Copy,
  FileText,
  KeyRound,
  Link,
  PackageOpen,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wrench,
  X
} from "lucide-react";

interface ItemStoreProps {
  stats: UserStats;
  onRedeemItem: (item: StoreItem) => void;
  onBuyCoolant?: (costInFragments: number) => void;
}

export const renderStoreItemIcon = (itemId: string, className = "size-10 text-cyan-400") => {
  if (itemId.includes("api") || itemId === "item-1") return <KeyRound className={className} />;
  if (itemId.includes("url")) return <Link className={className} />;
  if (itemId.includes("buyback") || itemId === "item-2") return <RefreshCw className={className} />;
  if (itemId.includes("report") || itemId === "item-3") return <FileText className={className} />;
  if (itemId.includes("maintenance") || itemId === "item-4") return <Wrench className={className} />;
  if (itemId.includes("mobile") || itemId === "item-5") return <Smartphone className={className} />;
  return <Box className={className} />;
};

const QUICK_SERVICES: StoreItem[] = [
  {
    id: "service-api-url",
    name: "生成 API Key 和访问 URL",
    costFragments: 100,
    category: "hosting",
    image: "api",
    description: "生成一组可交付的算力服务凭证，可自用或出售给客户。",
    stock: 999
  },
  {
    id: "service-sale-url",
    name: "生成对外出售链接",
    costFragments: 80,
    category: "hosting",
    image: "url",
    description: "创建一个可复制的服务链接，用于向外部客户出售算力额度。",
    stock: 999
  },
  {
    id: "service-buyback",
    name: "提交平台回收申请",
    costFragments: 200,
    category: "hosting",
    image: "buyback",
    description: "将闲置 Token 打包成回收单，由平台给出模拟报价。",
    stock: 999
  }
];

export const ItemStore: React.FC<ItemStoreProps> = ({ stats, onRedeemItem, onBuyCoolant }) => {
  const [activeTab, setActiveTab] = useState<"services" | "inventory">("services");
  const [lastItem, setLastItem] = useState<StoreItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [credentialId] = useState(() => "API_" + Math.random().toString(36).slice(2, 10).toUpperCase());

  const handleUseItem = (item: StoreItem) => {
    if (stats.hashFragments < item.costFragments) {
      setNotice(`Token 不足。该服务需要 ${item.costFragments.toLocaleString()} Token。`);
      setTimeout(() => setNotice(null), 2600);
      return;
    }
    onRedeemItem(item);
    setLastItem(item);
  };

  const handleBuyMaintenance = () => {
    if (!onBuyCoolant) return;
    if (stats.hashFragments < 50) {
      setNotice("Token 不足。购买 GPU 集群温控维护液需要 50 Token。");
      setTimeout(() => setNotice(null), 2600);
      return;
    }
    onBuyCoolant(50);
    setNotice("GPU 集群温控维护液已入库。");
    setTimeout(() => setNotice(null), 2600);
  };

  const handleCopy = () => {
    const url = `https://api.1ren-power.local/use/${credentialId}`;
    const text = `${lastItem?.name || "算力服务凭证"}\nAPI Key: ${credentialId}\nURL: ${url}`;
    try {
      navigator.clipboard.writeText(text);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="text-cyan-400 size-5" />
            <h1 className="text-base font-extrabold text-white">Token 服务台</h1>
          </div>
          <p className="text-xs text-slate-400 mt-2 max-w-3xl leading-relaxed">
            Token 可以生成 API Key、访问 URL、出售链接，也可以提交平台回收或购买 GPU 集群温控维护液。
          </p>
          {notice && (
            <div className="mt-3 inline-flex rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300">
              {notice}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="bg-black/35 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] text-slate-500 font-mono block">可用 Token</span>
            <span className="text-lg font-mono font-black text-cyan-400">{stats.hashFragments.toFixed(1)}</span>
          </div>
          <div className="bg-black/35 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] text-slate-500 font-mono block">服务凭证</span>
            <span className="text-lg font-mono font-black text-white">{stats.hashCrystals}</span>
          </div>
          <div className="bg-black/35 border border-white/5 rounded-xl p-3">
            <span className="text-[10px] text-slate-500 font-mono block">维护液</span>
            <span className="text-lg font-mono font-black text-white">{stats.coolantCount}</span>
          </div>
        </div>
      </div>

      <div className="flex bg-black/40 border border-white/5 p-1 rounded-2xl w-full sm:w-max">
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 text-xs rounded-xl font-bold transition-all ${
            activeTab === "services" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
          }`}
        >
          Token 服务
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 text-xs rounded-xl font-bold transition-all ${
            activeTab === "inventory" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
          }`}
        >
          液冷与温控维护
        </button>
      </div>

      {activeTab === "services" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUICK_SERVICES.map((item) => {
              const affordable = stats.hashFragments >= item.costFragments;
              return (
                <button
                  key={item.id}
                  onClick={() => handleUseItem(item)}
                  className={`text-left bg-white/5 border rounded-2xl p-6 transition-all active:scale-[0.98] ${
                    affordable ? "border-white/10 hover:border-cyan-500/35" : "border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                      {renderStoreItemIcon(item.id, "size-6 text-cyan-400")}
                    </div>
                    <span className="text-sm font-mono font-black text-cyan-400">{item.costFragments} Token</span>
                  </div>
                  <h2 className="text-sm font-bold text-white mt-5">{item.name}</h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.description}</p>
                  <div className="mt-5 text-xs font-bold text-cyan-300 flex items-center gap-2">
                    {affordable ? "立即开通" : "Token 不足"}
                    <PackageOpen className="size-4" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {MOCK_STORE_ITEMS.map((item) => {
              const affordable = stats.hashFragments >= item.costFragments;
              return (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-2xl bg-black/35 border border-white/5">
                        {renderStoreItemIcon(item.id, "size-7 text-cyan-400")}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">库存 {item.stock}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-5">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed min-h-[48px]">{item.description}</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-slate-500 font-bold">所需 Token</span>
                      <span className="text-sm font-mono font-black text-cyan-400">{item.costFragments.toLocaleString()}</span>
                    </div>
                    <button
                      disabled={!affordable}
                      onClick={() => handleUseItem(item)}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                        affordable
                          ? "bg-cyan-500 text-slate-950 hover:brightness-110 active:scale-[0.98]"
                          : "bg-white/5 text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      {affordable ? "开通或兑换" : "Token 不足"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="size-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">GPU 集群温控维护液</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              本地并网的高性能 GPU 设备在超频或满载运行后容易产生过热并触发保护性降频。使用温控维护液可重置核心温度，快速恢复超频计算并恢复 110% 算力效率。
            </p>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/35 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] text-slate-500 font-mono block">库存</span>
                <span className="text-2xl font-mono font-black text-white">{stats.coolantCount}</span>
              </div>
              <div className="bg-black/35 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] text-slate-500 font-mono block">单价</span>
                <span className="text-2xl font-mono font-black text-cyan-400">50 Token</span>
              </div>
              <button
                onClick={handleBuyMaintenance}
                className="rounded-xl bg-cyan-500 text-slate-950 text-xs font-black hover:brightness-110 active:scale-[0.98]"
              >
                购买维护液
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="size-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">服务记录说明</h2>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-black/35 border border-white/5 rounded-xl p-3">API/URL 凭证会在开通后弹出，可复制给客户。</div>
              <div className="bg-black/35 border border-white/5 rounded-xl p-3">平台回收申请会生成模拟回收单，方便后续接入真实流程。</div>
              <div className="bg-black/35 border border-white/5 rounded-xl p-3">温控维护液只用于冷却恢复降频设备，不会直接增加 Token 余额。</div>
            </div>
          </div>
        </div>
      )}

      {lastItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0b0c16] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 relative shadow-[0_15px_50px_rgba(6,182,212,0.15)]">
            <button
              onClick={() => setLastItem(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center bg-white/5"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                {renderStoreItemIcon(lastItem.id, "size-8 text-cyan-400")}
              </div>
              <div>
                <h3 className="text-base font-black text-white">{lastItem.name}</h3>
                <p className="text-xs text-slate-400 mt-1">服务已受理，以下为模拟交付信息。</p>
              </div>
            </div>

            <div className="bg-black/60 border border-white/5 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">API Key</span>
                <span className="text-cyan-300 font-bold break-all">{credentialId}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">URL</span>
                <span className="text-slate-300 break-all">https://api.1ren-power.local/use/{credentialId}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">消耗</span>
                <span className="text-amber-300">{lastItem.costFragments} Token</span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "已复制" : "复制 API/URL"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
