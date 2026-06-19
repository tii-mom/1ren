import React, { useState, useEffect, useMemo } from "react";
import { UserStats, ActiveMiner, UserIssuedToken } from "../../types";
import { 
  Coins, Cpu, Award, Zap, AlertTriangle, ShieldCheck, 
  HelpCircle, Sparkles, CheckCircle, ArrowRight, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TokenLaunchProps {
  stats: UserStats;
  activeMiners: ActiveMiner[];
  onSatisfyConditions: () => void;
  onLaunchToken: (token: UserIssuedToken) => boolean;
  setCurrentTab: (tab: string) => void;
}

export const TokenLaunch: React.FC<TokenLaunchProps> = ({
  stats,
  activeMiners,
  onSatisfyConditions,
  onLaunchToken,
  setCurrentTab
}) => {
  // Form states
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [initialPrice, setInitialPrice] = useState("");
  const [targetPool, setTargetPool] = useState("");
  const [description, setDescription] = useState("");

  // Deployment animation state
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);

  // List of mock tokens issued by this user (from localStorage)
  const [issuedTokens, setIssuedTokens] = useState<UserIssuedToken[]>([]);

  // Read issued tokens from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("r1_user_issued_tokens");
    if (saved) {
      try {
        setIssuedTokens(JSON.parse(saved));
      } catch (e) {
        console.warn("Could not load issued tokens:", e);
      }
    }
  }, []);

  // Check conditions
  const condLevel = useMemo(() => stats.level !== "S0 自有设备节点" && stats.level !== ("ZERO" as any), [stats.level]);
  const condOutput = useMemo(() => stats.accumulatedFragments >= 500.0, [stats.accumulatedFragments]);
  const condDevices = useMemo(() => activeMiners.filter(m => m.status !== "stopped").length >= 1, [activeMiners]);
  const condStake = useMemo(() => stats.hashFragments >= 100.0, [stats.hashFragments]);

  const metCount = useMemo(() => {
    let count = 0;
    if (condLevel) count++;
    if (condOutput) count++;
    if (condDevices) count++;
    if (condStake) count++;
    return count;
  }, [condLevel, condOutput, condDevices, condStake]);

  const progressPercent = Math.round((metCount / 4) * 100);
  const isEligible = metCount === 4;

  // Deployment simulator script
  const startDeployment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEligible || isDeploying) return;

    if (!tokenName || !tokenSymbol || !totalSupply || !initialPrice || !targetPool) {
      alert("请填写完整的表单信息！");
      return;
    }

    setIsDeploying(true);
    setDeployStep(1);
    setDeployLogs(["[INFO] 正在建立 R1 影子部署通道..."]);

    setTimeout(() => {
      setDeployStep(2);
      setDeployLogs(prev => [
        ...prev,
        "[SUCCESS] 编译器就绪。验证押金质押 100 R1... OK",
        "[INFO] 正在编译 模拟合约 字节码 (使用影子编译器 v0.8.20)..."
      ]);
    }, 600);

    setTimeout(() => {
      setDeployStep(3);
      setDeployLogs(prev => [
        ...prev,
        "[SUCCESS] 模拟合约生成成功。",
        `[INFO] 正在进行影子部署 [${tokenSymbol}] ...`,
        "[INFO] 模拟支持池结算通道验证中..."
      ]);
    }, 1300);

    setTimeout(() => {
      const newToken: UserIssuedToken = {
        id: `token-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: tokenName,
        symbol: tokenSymbol.toUpperCase(),
        totalSupply: parseInt(totalSupply),
        initialPrice: parseFloat(initialPrice),
        targetPool: parseFloat(targetPool),
        description,
        status: "launching",
        raisedUsdt: 0,
        progress: 0,
        lockedR1: 100,
        ownerLevel: stats.level,
        createdAt: new Date().toISOString()
      };
      
      const success = onLaunchToken(newToken);
      
      if (!success) {
        setIsDeploying(false);
        setDeployStep(0);
        setDeployLogs(prev => [
          ...prev,
          "[ERROR] 影子部署失败：锁定 100 R1 押金校验未通过。"
        ]);
        return;
      }
      
      // Update local view
      setIssuedTokens(prev => [...prev, newToken]);

      // Reset Form
      setTokenName("");
      setTokenSymbol("");
      setTotalSupply("");
      setInitialPrice("");
      setTargetPool("");
      setDescription("");
      setIsDeploying(false);
      setDeployStep(0);
      setDeployLogs([]);
    }, 2200);
  };

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* 🚀 Header panel */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2">
          <Coins className="text-emerald-400 size-5.5 icon-glow-emerald" />
          <h1 className="text-base font-extrabold text-white">R1 企业 Token 自助发行中心</h1>
        </div>
        <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
          「1人算力有限公司」提供基于 R1 公共算力池的影子发行平台。在这里，满足门槛条件的算力节点主可以为自己的项目发行模拟 Token，模拟筹集 USDT 支持资金。
        </p>
      </div>

      {/* 📊 Progress indicator and requirements checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Progress dashboard */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                发行资格准入评级
              </h2>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">
                达标率 {progressPercent}%
              </span>
            </div>
            <p className="text-xs text-slate-400">
              为防止低质量垃圾项目泛滥并确保持仓真实度，发行 Token 必须满足以下硬件 and 产出资质：
            </p>

            {/* Checklist */}
            <div className="mt-5 space-y-3 font-mono text-xs">
              {/* Cond 1 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/[0.03]">
                <span className="text-slate-300 flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${condLevel ? "bg-emerald-400" : "bg-red-400"}`} />
                  1. 节点等级达 S1 共建合伙人
                </span>
                <span className={`font-bold flex items-center gap-1 ${condLevel ? "text-emerald-400" : "text-slate-500"}`}>
                  {condLevel ? <CheckCircle className="size-4" /> : "未达标"}
                  {stats.level}
                </span>
              </div>

              {/* Cond 2 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/[0.03]">
                <span className="text-slate-300 flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${condOutput ? "bg-emerald-400" : "bg-red-400"}`} />
                  2. 累计 R1 产出 &gt;= 500 R1
                </span>
                <span className={`font-bold flex items-center gap-1 ${condOutput ? "text-emerald-400" : "text-slate-500"}`}>
                  {condOutput ? <CheckCircle className="size-4" /> : "未达标"}
                  {stats.accumulatedFragments.toFixed(1)} / 500 R1
                </span>
              </div>

              {/* Cond 3 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/[0.03]">
                <span className="text-slate-300 flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${condDevices ? "bg-emerald-400" : "bg-red-400"}`} />
                  3. 运行中设备数 &gt;= 1
                </span>
                <span className={`font-bold flex items-center gap-1 ${condDevices ? "text-emerald-400" : "text-slate-500"}`}>
                  {condDevices ? <CheckCircle className="size-4" /> : "未达标"}
                  {activeMiners.filter(m => m.status !== "stopped").length}台
                </span>
              </div>

              {/* Cond 4 */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/[0.03]">
                <span className="text-slate-300 flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${condStake ? "bg-emerald-400" : "bg-red-400"}`} />
                  4. 可锁定质押押金 &gt;= 100 R1
                </span>
                <span className={`font-bold flex items-center gap-1 ${condStake ? "text-emerald-400" : "text-slate-500"}`}>
                  {condStake ? <CheckCircle className="size-4" /> : "未达标"}
                  {stats.hashFragments.toFixed(1)} / 100 R1
                </span>
              </div>
            </div>
          </div>

          {/* Developer backdoor - ONLY visible in DEV environment */}
          {((import.meta as any).env?.DEV) && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-yellow-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="size-3.5" />
                  开发者快捷调试入口 (DEV MODE ONLY)
                </span>
              </div>
              <p className="text-[9px] text-slate-400">为了方便您快速测试创建 Token 合约表单及部署动画，您可点击下方按钮直接修改参数满足准入条件。</p>
              <button
                type="button"
                onClick={onSatisfyConditions}
                className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-black rounded-xl cursor-pointer min-h-[38px] active:scale-98 transition-all flex items-center justify-center gap-1"
              >
                一键满足 4 项资格门槛
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Action Box */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              准入决策引导
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              若未达成相应准入资格，您可以通过以下方式提速：
            </p>

            <div className="mt-5 space-y-3.5 text-xs">
              <div className="flex items-start gap-3 p-3 bg-black/20 border border-white/5 rounded-2xl">
                <span className="font-mono text-cyan-400 font-black">01</span>
                <div>
                  <span className="text-slate-300 font-semibold block">个人等级不足？</span>
                  <p className="text-[10px] text-slate-500 mt-1">前往【设备机房】购买部署 100 USDT 以上的 GPU 主机，系统将自动升级您为 S1 共建合伙人并解锁团队架构。</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-black/20 border border-white/5 rounded-2xl">
                <span className="font-mono text-cyan-400 font-black">02</span>
                <div>
                  <span className="text-slate-300 font-semibold block">R1 余额不足？</span>
                  <p className="text-[10px] text-slate-500 mt-1">每日微调代工或完成签到可以迅速产出 Token。如果急需，可以在【交易页】直接使用模拟金市价买入 R1 Token。</p>
                </div>
              </div>
            </div>
          </div>

          {metCount < 4 && (
            <button
              onClick={() => setCurrentTab("store")}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl min-h-[44px] shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 mt-5 cursor-pointer"
            >
              前往设备大厅部署矿机
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Form input block - visible only when user meets the requirements */}
      {isEligible && (
        <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.02] rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
            <Sparkles className="text-yellow-400 size-4 animate-spin animate-duration-[10s]" />
            创建我的公司 Token
          </h2>

          <form onSubmit={startDeployment} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Token Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-mono block uppercase">Token 名称 (e.g., 矩阵动力)</label>
                <input
                  type="text"
                  required
                  disabled={isDeploying}
                  placeholder="如: 星际魔方"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/40 outline-none rounded-xl px-4 py-3 text-xs text-white font-bold min-h-[44px]"
                />
              </div>

              {/* Token Symbol */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-mono block uppercase">Token 符号 (大写，最多6位)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  disabled={isDeploying}
                  placeholder="如: CUBE"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/40 outline-none rounded-xl px-4 py-3 text-xs text-white font-bold font-mono min-h-[44px]"
                />
              </div>

              {/* Total Supply */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-mono block uppercase">发行总量</label>
                <input
                  type="number"
                  inputMode="decimal"
                  required
                  min="1000"
                  disabled={isDeploying}
                  placeholder="如: 1,000,000"
                  value={totalSupply}
                  onChange={(e) => setTotalSupply(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/40 outline-none rounded-xl px-4 py-3 text-xs text-white font-bold font-mono min-h-[44px]"
                />
              </div>

              {/* Initial Price */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-mono block uppercase">初始发行价 (USDT)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  required
                  step="0.0001"
                  min="0.0001"
                  disabled={isDeploying}
                  placeholder="如: 0.1"
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/40 outline-none rounded-xl px-4 py-3 text-xs text-white font-bold font-mono min-h-[44px]"
                />
              </div>

              {/* Target pool */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-slate-500 font-mono block uppercase">模拟支持池目标 (USDT)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  required
                  min="10"
                  disabled={isDeploying}
                  placeholder="如: 10,000"
                  value={targetPool}
                  onChange={(e) => setTargetPool(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/40 outline-none rounded-xl px-4 py-3 text-xs text-white font-bold font-mono min-h-[44px]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] text-slate-500 font-mono block uppercase">项目算力规划说明</label>
                <textarea
                  disabled={isDeploying}
                  rows={3}
                  placeholder="说明您公司的主要算力调度用途与募资方向..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-cyan-400/40 outline-none rounded-xl px-4 py-3 text-xs text-white font-bold min-h-[80px]"
                />
              </div>
            </div>

            {/* Deploying state log console */}
            <AnimatePresence>
              {(isDeploying || deployLogs.length > 0) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-black/80 border border-cyan-500/20 rounded-2xl p-4 font-mono text-[10px] text-cyan-400 space-y-1"
                >
                  <div className="flex items-center gap-2 mb-2 font-bold uppercase text-[10.5px]">
                    {isDeploying && <Loader2 className="size-3.5 animate-spin" />}
                    影子部署控制台
                  </div>
                  {deployLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">{log}</div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isDeploying}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all min-h-[44px] cursor-pointer flex items-center justify-center gap-2 ${
                isDeploying
                  ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-98"
              }`}
            >
              {isDeploying ? "部署发行中..." : "一键申请并部署发行 (消耗 100 R1 押金)"}
            </button>
          </form>
        </div>
      )}

      {/* 4. Issued tokens history logs list */}
      {issuedTokens.length > 0 && (
        <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3">
            已发行的影子企业 Token ({issuedTokens.length})
          </h2>
          
          <div className="space-y-3">
            {issuedTokens.map((token, idx) => (
              <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-extrabold text-white">{token.name}</span>
                    <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-950/30 border border-yellow-500/20 px-2 py-0.2 rounded uppercase">
                      {token.symbol}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-sans">{token.description || "无规划说明"}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-6 font-mono text-[10.5px] text-slate-500 shrink-0 w-full sm:w-auto text-right">
                  <div>
                    <span>发行总量</span>
                    <span className="text-white font-bold block mt-0.5">{token.totalSupply.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>发行价</span>
                    <span className="text-cyan-400 font-bold block mt-0.5">{token.initialPrice.toFixed(4)} U</span>
                  </div>
                  <div>
                    <span>支持池目标</span>
                    <span className="text-white font-bold block mt-0.5">{token.targetPool.toLocaleString()} U</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⚠️ Risk alert notice */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold text-red-400 uppercase tracking-wider">影子网络部署与模拟支持池风险声明</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans font-medium">
            当前发行中心为 R1 影子部署测试环境。发行的模拟合约编译、锁定质押及模拟支持池仅作为本地数据模拟演示，并不代表真实募资融券、证券发行、或者任何外部中心化交易所的价格报价。测试资金不具真实商业用途，请注意规避模拟欺诈风险。
          </p>
        </div>
      </div>

    </div>
  );
};
