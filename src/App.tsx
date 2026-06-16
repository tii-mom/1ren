import { useState, useEffect, useRef } from "react";
import { UserStats, UserLevel, ActiveMiner, TaskState, MiningRecord, StoreItem, MinerTemplate } from "./types";
import { 
  loadStats, saveStats, loadMiners, saveMiners, loadTasks, saveTasks, loadRecords, saveRecords, addRecord, MOCK_STORE_ITEMS, MOCK_REFERRALS
} from "./utils/storage";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { MinerStore } from "./components/MinerStore";
import { ResonanceTower } from "./components/ResonanceTower";
import { ItemStore } from "./components/ItemStore";
import { MyProfile } from "./components/MyProfile";
import { BottomNavigation } from "./components/BottomNavigation";
import { Info, X, Zap, CheckCircle2, ShieldCheck, Heart, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>("home");

  // Core Persisted States
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [activeMiners, setActiveMiners] = useState<ActiveMiner[]>([]);
  const [tasks, setTasks] = useState<TaskState>(INITIAL_TASKS);
  const [records, setRecords] = useState<MiningRecord[]>([]);
  const [usdtBalance, setUsdtBalance] = useState<number>(500.0); // Start with 500U free mock testbed fund

  // Sync refs to avoid stale closures in stable single-instance timers
  const activeMinersRef = useRef<ActiveMiner[]>(activeMiners);
  const statsRef = useRef<UserStats>(stats);

  activeMinersRef.current = activeMiners;
  statsRef.current = stats;

  // Custom visual modal notification
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    text: string;
    type: "success" | "warn" | "info" | "crystal";
  } | null>(null);

  // Initialize
  useEffect(() => {
    try {
      const loadedS = loadStats();
      const loadedM = loadMiners();
      const loadedT = loadTasks();
      const loadedR = loadRecords();
      
      setStats(loadedS || INITIAL_STATS);
      setActiveMiners(Array.isArray(loadedM) ? loadedM : []);
      setTasks(loadedT || INITIAL_TASKS);
      setRecords(Array.isArray(loadedR) ? loadedR : []);

      const savedUsdt = localStorage.getItem("hashcube_usdt_balance");
      if (savedUsdt) {
        const parsed = parseFloat(savedUsdt);
        setUsdtBalance(isNaN(parsed) ? 500.0 : parsed);
      }
    } catch (e) {
      console.error("Critical storage load failed, restoring to defaults:", e);
      setStats(INITIAL_STATS);
      setActiveMiners([]);
      setTasks(INITIAL_TASKS);
      setRecords([]);
      setUsdtBalance(500.0);
    }
  }, []);

  // Save changes
  useEffect(() => {
    try {
      if (stats.inviteCode) {
        saveStats(stats);
      }
    } catch (e) {
      console.warn("Could not save stats to storage:", e);
    }
  }, [stats]);

  useEffect(() => {
    try {
      saveMiners(activeMiners);
    } catch (e) {
      console.warn("Could not save miners to storage:", e);
    }
  }, [activeMiners]);

  useEffect(() => {
    try {
      saveTasks(tasks);
    } catch (e) {
      console.warn("Could not save tasks to storage:", e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem("hashcube_usdt_balance", usdtBalance.toString());
    } catch (e) {
      console.warn("Could not save USDT balance to storage:", e);
    }
  }, [usdtBalance]);

  // Dynamic status evaluation & mining rewards calculator loop
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Process active miners ticking of rewards & thermal erosion
      let hasChange = false;
      let shardBonus = 0;
      
      const currentMiners = activeMinersRef.current;
      const currentStats = statsRef.current;
      
      const updatedMiners = currentMiners.map((miner) => {
        if (miner.status === "stopped") return miner;

        // Process a tick of output
        // yield is per day, so per-second is yield / 86400 times costs
        // Let's speed it up by a healthy simulation multiplier so they see things actually progress!
        const simulationFactor = 15; // Speed multiplier for impressive real-time feedback
        const rewardPerSec = (miner.cost * miner.dailyYield * miner.efficiency * simulationFactor) / 3600;
        shardBonus += rewardPerSec;

        // Decrease efficiency slowly (chips heat up!)
        // 0.003 units per second means in ~150-200 seconds the miner falls to 50% half-life decay
        let nextInEfficiency = miner.efficiency - 0.003;
        let nextStatus = miner.status;

        // Special rule for free demo miner expiry simulator (stays active for roughly 120 ticks, then stops)
        if (miner.isDemo) {
          const ageSecs = (Date.now() - new Date(miner.purchasedAt).getTime()) / 1000;
          if (ageSecs > 180) { // stops after 180 seconds of live use for impressive countdown demo
            nextStatus = "stopped";
            nextInEfficiency = 0;
            hasChange = true;
          }
        }

        if (nextInEfficiency <= 0.5 && nextStatus === "running") {
          nextStatus = "decayed";
          nextInEfficiency = 0.5; // caps at 50% decay
          hasChange = true;
        }

        if (miner.efficiency !== nextInEfficiency || miner.status !== nextStatus) {
          hasChange = true;
        }

        return {
          ...miner,
          efficiency: Math.max(0, parseFloat(nextInEfficiency.toFixed(4))),
          status: nextStatus,
          accumulatedRewards: miner.accumulatedRewards + rewardPerSec
        };
      });

      if (hasChange || shardBonus > 0) {
        if (hasChange) {
          setActiveMiners(updatedMiners);
        }

        // Apply reward delta to fragments
        setStats((prev) => {
          const hasBuff = prev.buffActiveUntil && new Date(prev.buffActiveUntil).getTime() > Date.now();
          const added = shardBonus * (hasBuff ? 2.0 : 1.0);
          const nextFragments = prev.hashFragments + added;
          
          // Auto-synthesize hint trigger
          if (prev.hashFragments < 100 && nextFragments >= 100) {
            // Queue a subtle info alert
            triggerNotification(
              "⚙️ 晶体融合反应包就绪",
              "您的账户算力碎片已积攒满 100 个！可以点击大盘下方或前往[我的矿仓]进行高灵能算力晶体聚变合成啦！",
              "crystal"
            );
          }

          return {
            ...prev,
            hashFragments: nextFragments,
            accumulatedFragments: prev.accumulatedFragments + added
          };
        });
      }

      // Check double buff expiry
      if (currentStats.buffActiveUntil && new Date(currentStats.buffActiveUntil).getTime() <= Date.now()) {
        setStats(prev => ({ ...prev, buffActiveUntil: null }));
        addRecordLog("buff", 0, "超限突袭两倍收益契约结束冷却。");
      }

    }, 1000);

    return () => clearInterval(interval);
  }, []);


  // Automatically recompute base and team hash power relative to active miners and dynamic upgrades
  useEffect(() => {
    // 10.0 is the baseline free CPU allocation
    const minersBase = activeMiners.reduce((sum, m) => {
      if (m.status === "stopped") return sum;
      // An M1 miner (100U) contributes its cost * coefficient * efficiency
      // Under full efficiency (1.0), 100U adds 15 T/s. Under decay (0.5), it adds 7.5 T/s.
      return sum + (m.cost * 0.15 * m.efficiency);
    }, 10.0);

    // Auto calculate user affiliation rank
    const activeNonDemoSumCost = activeMiners
      .filter(m => !m.isDemo && m.status !== "stopped")
      .reduce((sum, m) => sum + m.cost, 0);

    let calculatedLevel = UserLevel.ZERO;
    let computedTeam = 45.5; // Baseline default simulated team resonance

    // Count team referrals
    const totalTeamReferrals = MOCK_REFERRALS.length; // 15 referrals in mock dataset
    const directReferrals = MOCK_REFERRALS.filter(r => r.depth === 1).length; // 2 in mock

    // Mapping S1 - S9 gamified structure based on user investment & referrals
    if (activeNonDemoSumCost >= 10000 && totalTeamReferrals >= 15) {
      calculatedLevel = UserLevel.S9; // 算力集团联席CEO
      computedTeam = 480.0;
    } else if (activeNonDemoSumCost >= 2000 && totalTeamReferrals >= 15) {
      calculatedLevel = UserLevel.S7; // 算力集团合伙人 (or S8/S9 if referrals grow)
      computedTeam = 280.0;
    } else if (activeNonDemoSumCost >= 500 && totalTeamReferrals >= 10) {
      calculatedLevel = UserLevel.S5; // 算力集团副总裁
      computedTeam = 160.0;
    } else if (activeNonDemoSumCost >= 500) {
      calculatedLevel = UserLevel.S4; // 区域算力总裁
      computedTeam = 120.0;
    } else if (activeNonDemoSumCost >= 100 && directReferrals >= 5) {
      calculatedLevel = UserLevel.S3; // 算力分公司总监
      computedTeam = 95.0;
    } else if (activeNonDemoSumCost >= 100 && directReferrals >= 3) {
      calculatedLevel = UserLevel.S2; // 算力部门经理
      computedTeam = 75.0;
    } else if (activeNonDemoSumCost >= 100) {
      calculatedLevel = UserLevel.S1; // 算力工作室创始人
      computedTeam = 55.0;
    }

    setStats((prev) => {
      // Safely restrict Zero-tier users to max 100 T/s team cap
      let finalTeam = computedTeam;
      if (calculatedLevel === UserLevel.ZERO && finalTeam > 100) {
        finalTeam = 100;
      }
      return {
        ...prev,
        baseHashpower: parseFloat(minersBase.toFixed(2)),
        teamHashpower: parseFloat(finalTeam.toFixed(2)),
        level: calculatedLevel
      };
    });

  }, [activeMiners]);


  // Helpers
  const triggerNotification = (title: string, text: string, type: "success" | "warn" | "info" | "crystal" = "success") => {
    setModal({ show: true, title, text, type });
  };

  const addRecordLog = (type: MiningRecord["type"], amount: number, description: string) => {
    setRecords((prev) => {
      const updated = addRecord(prev, type, amount, description);
      return updated;
    });
  };

  // Operations
  const handleAddTestUsdt = () => {
    setUsdtBalance((prev) => prev + 1000.0);
    triggerNotification(
      "虚拟机床充值完成",
      "成功分配 +1,000.0 USDT 虚拟机床体验金！快去[设备租赁 / 资产]挑选高频AI算力推理引擎组装代工，极具算力溢出穿透力吧！",
      "success"
    );
  };

  const handleCompleteTask = (taskKey: "watchAd" | "likeContent" | "shareMoments") => {
    if (tasks[taskKey]) return;

    let reward = 0;
    let label = "";
    if (taskKey === "watchAd") {
      reward = 2.0;
      label = "观看区视频广告行为";
    } else if (taskKey === "likeContent") {
      reward = 1.0;
      label = "节点扩建社区点赞共鸣";
    } else if (taskKey === "shareMoments") {
      reward = 3.0;
      label = "宣传绿色低碳算力朋友圈扩散";
    }

    setTasks((prev) => ({ ...prev, [taskKey]: true }));
    setStats((prev) => ({
      ...prev,
      hashFragments: prev.hashFragments + reward,
      accumulatedFragments: prev.accumulatedFragments + reward
    }));

    addRecordLog("mining", reward, `每日打卡任务：${label}已审结。`);
    triggerNotification(
      "✅ 共建打卡完成",
      `赞颂您的生态奉献！由于您的代工传播，系统额外回馈 ${reward} 个算力碎片！已经瞬时入账、并入大盘累加。`,
      "success"
    );
  };

  const handleTriggerBuff = () => {
    if (stats.buffActiveUntil) return;

    const expiryTime = new Date(Date.now() + 3600 * 1000).toISOString();
    setStats((prev) => ({
      ...prev,
      buffActiveUntil: expiryTime
    }));

    addRecordLog("buff", 0, "点击激发虫洞：超级能量突袭一小时算力加倍");
    triggerNotification(
      "⚔️ 突击暴击激活 (200%倍率)",
      "由于虫洞产生器高热共谐，全站物理挖矿与社区叠加产率极速翻倍 (200%效率)！倒计时60分钟正式开拔运转，不要错过黄金代工收益！",
      "success"
    );
  };

  const handleSynthesize = () => {
    if (stats.hashFragments < 100) {
      triggerNotification("⚠️ 自检熔炉失败", "账户内的算力碎片累计未满 100 颗。快去完成每日打卡或租赁更多高性能矿代工槽！", "warn");
      return;
    }

    setStats((prev) => ({
      ...prev,
      hashFragments: prev.hashFragments - 100,
      hashCrystals: prev.hashCrystals + 1,
      totalSynthesized: prev.totalSynthesized + 1
    }));

    addRecordLog("synthesize", 100, "算力熔合聚变：聚变 100 碎片固化出 1 颗中枢晶体");
    triggerNotification(
      "🌟 固化合成圆满宣告",
      "能量场运转圆满！成功消减100枚低聚碎片，并聚变凝结出 1 颗高度稳定的【数字固化算力晶体】！持有此物可大幅提高全球排名及后期轻奢提现优先契契。",
      "success"
    );
  };

  const handleBuyCoolant = (cost: number) => {
    if (stats.hashFragments < cost) {
      triggerNotification("⚠️ 易耗库置办失败", "算力碎片储备未达 50 颗，无法置换除垢液。", "warn");
      return;
    }

    setStats((prev) => ({
      ...prev,
      hashFragments: prev.hashFragments - cost,
      coolantCount: prev.coolantCount + 1
    }));

    addRecordLog("coolant", cost, "花费 50 个算力碎片置办纳米冷却液一瓶。");
    triggerNotification(
      "🧪 冷却装备到仓",
      "化学防护置办成功！耗散 50 碎片购得一瓶新型防半衰纳米冷却灌洗液，已安全放入账户行囊。前往‘我的矿仓’找到高阻衰退设备执行注入吧！",
      "success"
    );
  };

  const handleApplyCoolant = (minerId: string) => {
    if (stats.coolantCount < 1) {
      triggerNotification("⚠️ 维护物资短缺", "您的防爆包内当前一滴冷却常温液也未存储，请点击合成台旁购买置办一整瓶！", "warn");
      return;
    }

    const targetMiner = activeMiners.find((m) => m.id === minerId);
    if (!targetMiner || targetMiner.status !== "decayed") return;

    // Subtract 1 coolant, reset efficiency to 1.10 (+10% permanent speed boost relative to cost!), and status to running
    setStats((prev) => ({ ...prev, coolantCount: prev.coolantCount - 1 }));

    setActiveMiners((prevMiners) =>
      prevMiners.map((m) => {
        if (m.id === minerId) {
          return {
            ...m,
            efficiency: 1.15, // +15% performance boost
            status: "running"
          };
        }
        return m;
      })
    );

    addRecordLog("coolant", 1, `设备【${targetMiner.name}】注入灌洗维护。`);
    triggerNotification(
      "💦 注入清洗成功 (+15% 极其狂暴)",
      `冷却高能介质注入完毕！彻底祛除【${targetMiner.name}】的物理积碳污浊，设备恢复115%的极高状态物理产率！额外回馈全家永久 +15% 物理溢出算力红利！`,
      "success"
    );
  };

  const handleClaimDemoMiner = () => {
    if (stats.hasClaimedDemo) return;

    const nowIso = new Date().toISOString();
    const demoMiner: ActiveMiner = {
      id: "demo-miner",
      name: "免费新手智能云代工槽",
      cost: 0,
      dailyYield: 0.012, // 1.2% base
      contractDays: 7,
      purchasedAt: nowIso,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      status: "running",
      accumulatedRewards: 0,
      efficiency: 1.0,
      isDemo: true
    };

    setActiveMiners((prev) => [demoMiner, ...prev]);
    setStats((prev) => ({ ...prev, hasClaimedDemo: true }));

    addRecordLog("mining", 0, "空投部署并激活免费体验期AI算力自研引擎 (7天试用)");
    triggerNotification(
      "新手孵化体验引擎部署完成",
      "尊敬的合伙人！免费体验AI算力引擎已为您自动实报部署至您的公司算力库里！提供 10 T/s 物理算效以开启分布式代工试练，请多加关注注入液氮冷媒维护流程！",
      "success"
    );
  };

  const handleLeaseMiner = (template: MinerTemplate) => {
    if (usdtBalance < template.cost) {
      triggerNotification(
        "❌ 虚拟机床入金失败",
        `组装【${template.name}】需要 ${template.cost} USDT 体验代用卷，而您的钱包剩余可用余额不足！请点击顶部导航区微小的‘+’按钮免费补充体验金哦。`,
        "warn"
      );
      return;
    }

    // Deduct USDT
    setUsdtBalance((prev) => prev - template.cost);

    // Compute standard average yield range
    const avgYield = (template.baseYieldRange[0] + template.baseYieldRange[1]) / 2;
    const nowIso = new Date().toISOString();
    
    // Add active miner
    const nextMiner: ActiveMiner = {
      id: `miner-${Date.now()}`,
      name: template.name,
      cost: template.cost,
      dailyYield: avgYield,
      contractDays: template.contractDays,
      purchasedAt: nowIso,
      expiresAt: template.contractDays > 1000 
        ? new Date(Date.now() + 999 * 24 * 3600 * 1000).toISOString()
        : new Date(Date.now() + template.contractDays * 24 * 3600 * 1000).toISOString(),
      status: "running",
      accumulatedRewards: 0,
      efficiency: 1.0
    };

    setActiveMiners((prev) => [nextMiner, ...prev]);
    addRecordLog("mining", template.cost, `成功租借组装 ${template.name} 设备一台。`);
    triggerNotification(
      "星网并网托管部署成功",
      `恭喜！成功耗用 ${template.cost}U 签约组装【${template.name}】。设备已直连四川凉山水电代工网端口，已并网释放哈希物理运算流量！`,
      "success"
    );
    setCurrentTab("my"); // Auto jump to My Profile to check
  };

  const handleRedeemItem = (item: StoreItem) => {
    if (stats.hashFragments < item.costFragments) {
      triggerNotification("⚠️ 自检商检阻断", `兑换该精品需要花费 ${item.costFragments.toLocaleString()} 碎片，您的可用算力碎片额度不足以结算！`, "warn");
      return;
    }

    // Deduct fragments
    setStats((prev) => ({
      ...prev,
      hashFragments: prev.hashFragments - item.costFragments
    }));

    addRecordLog("exchange", item.costFragments, `兑换：置购「${item.name}」商品。`);
    triggerNotification(
      "实物交割与并网托管单生成",
      `恭喜您！系统成功受理您的兑换。消耗 ${item.costFragments.toLocaleString()} 个碎片起航。顺丰冷链物理寄递条码、或对应的物理矿场水电托管代托管契约已派发至您的邮箱。请及时留意。`,
      "success"
    );
  };

  const handleCheckInCompleted = (rewardShards: number, addCoolant: boolean, description: string) => {
    setStats((prev) => ({
      ...prev,
      hashFragments: prev.hashFragments + rewardShards,
      accumulatedFragments: prev.accumulatedFragments + rewardShards,
      coolantCount: prev.coolantCount + (addCoolant ? 1 : 0)
    }));
    addRecordLog("mining", rewardShards, description);
    triggerNotification(
      "并网签到成功 (Check-in Verified)",
      `每日公链对冲节点自检完成！获得 +${rewardShards} 算力碎片! ${addCoolant ? "额外空投高阻半衰「纳米防爆冷却液液氮」 1 瓶！" : ""}`,
      "success"
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans tracking-tight relative overflow-x-hidden">
      
      {/* Visual background lights for massive atmospheric cyberpunk aura */}
      <div className="absolute top-0 left-[-15%] w-[60%] h-[500px] bg-gradient-to-tr from-cyan-500/10 to-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[500px] bg-gradient-to-bl from-purple-600/10 to-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Embedded top navbar row */}
      <Header
        stats={stats}
        usdtBalance={usdtBalance}
        onAddTestUsdt={handleAddTestUsdt}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Master Main Container Body and Page switches */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8 min-h-[calc(100vh-140px)]">
        
        {currentTab === "home" && (
          <Dashboard
            stats={stats}
            tasks={tasks}
            activeMiners={activeMiners}
            onCompleteTask={handleCompleteTask}
            onTriggerBuff={handleTriggerBuff}
            onSynthesize={handleSynthesize}
            onCheckInCompleted={handleCheckInCompleted}
          />
        )}

        {currentTab === "store" && (
          <MinerStore
            stats={stats}
            activeMiners={activeMiners}
            onLeaseMiner={handleLeaseMiner}
          />
        )}

        {currentTab === "tower" && (
          <ResonanceTower stats={stats} />
        )}

        {currentTab === "items" && (
          <ItemStore
            stats={stats}
            onRedeemItem={handleRedeemItem}
            onBuyCoolant={handleBuyCoolant}
          />
        )}

        {currentTab === "my" && (
          <MyProfile
            stats={stats}
            activeMiners={activeMiners}
            records={records}
            onSynthesize={handleSynthesize}
            onBuyCoolant={handleBuyCoolant}
            onApplyCoolant={handleApplyCoolant}
            onClaimDemoMiner={handleClaimDemoMiner}
          />
        )}

      </main>

      {/* Modern, tactile Mobile Bottom Navigation Menu */}
      <BottomNavigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Cyberpunk ambient footer with literal human metrics */}
      <footer className="border-t border-slate-900 bg-slate-950/70 py-6 md:py-8 text-center text-xs text-slate-500 pb-28 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 算力有限公司 · 算力魔方智能共建挖矿网络生态 · 物理云托管</p>
          <p className="text-[10px] text-zinc-600">
            算力碎片仅作为系统自检积分代工凭证，本着零金融炒作、无资本吸纳的绿色合规积分兑换，服务广大分布式代工节点。
          </p>
        </div>
      </footer>

      {/* Elegant global popup overlay modal */}
      <AnimatePresence>
        {modal && modal.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="bg-slate-900 border border-violet-500/40 rounded-2xl max-w-sm sm:max-w-md w-full p-6 text-center shadow-[0_0_35px_rgba(139,92,246,0.35)] relative overflow-hidden"
            >
              
              {/* Ambient gold glow for crystal synths */}
              {modal.type === "crystal" && (
                <div className="absolute inset-0 bg-yellow-500/[0.04] rounded-2xl pointer-events-none blur-3xl animate-pulse" />
              )}

              {/* Close button with high-fidelity hit target (minimum 44x44px for touch interactions) */}
              <button
                onClick={() => setModal(null)}
                className="absolute top-2 right-2 p-3 text-slate-500 hover:text-slate-300 rounded-full hover:bg-white/5 active:scale-90 transition-all flex items-center justify-center cursor-pointer min-w-[44px] min-h-[44px] touch-manipulation z-10"
              >
                <X className="size-5" />
              </button>

              {/* Emblem icon */}
              <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-slate-950 border border-slate-800 shadow-inner">
                {modal.type === "success" && <CheckCircle2 className="size-6 text-emerald-400 stroke-[2.5]" />}
                {modal.type === "warn" && <AlertTriangle className="size-6 text-amber-500 stroke-[2.5]" />}
                {modal.type === "info" && <Info className="size-6 text-cyan-400 stroke-[2.5]" />}
                {modal.type === "crystal" && <Zap className="size-6 text-yellow-400 stroke-[2.5] animate-pulse" />}
              </div>

              <h3 className={`text-sm sm:text-base font-extrabold mb-2 tracking-tight ${
                modal.type === "crystal" ? "text-yellow-400 text-glow-gold" : "text-slate-100"
              }`}>
                {modal.title}
              </h3>

              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                {modal.text}
              </p>

              <button
                onClick={() => setModal(null)}
                className={`w-full py-3.5 sm:py-2.5 rounded-xl font-extrabold text-[11px] sm:text-xs tracking-wider uppercase transition-colors select-none touch-manipulation min-h-[44px] cursor-pointer flex items-center justify-center ${
                  modal.type === "crystal"
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 hover:brightness-110 active:scale-98"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 active:bg-slate-750"
                }`}
              >
                收到并关闭
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Initial defaults to satisfy hydration compilation
const INITIAL_STATS: UserStats = {
  hashFragments: 42.50,
  hashCrystals: 0,
  level: UserLevel.ZERO,
  baseHashpower: 10.0,
  teamHashpower: 45.5,
  totalSynthesized: 0,
  accumulatedFragments: 42.50,
  inviteCode: "CUBE888",
  referrerName: "星际创世神-波卡老詹",
  coolantCount: 1,
  buffActiveUntil: null,
  hasClaimedDemo: false
};

const INITIAL_TASKS: TaskState = {
  watchAd: false,
  likeContent: false,
  shareMoments: false,
  lastCompletedDate: ""
};
