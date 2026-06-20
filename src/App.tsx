import { useState, useEffect, useRef, useMemo } from "react";
import { UserStats, UserLevel, ActiveMiner, TaskState, MiningRecord, StoreItem, MinerTemplate, UserIssuedToken } from "./types";
import { 
  loadStats, saveStats, loadMiners, saveMiners, loadTasks, saveTasks, loadRecords, saveRecords, addRecord, MOCK_STORE_ITEMS, MOCK_REFERRALS,
  INITIAL_STATS, INITIAL_TASKS, INITIAL_RECORDS, STORAGE_KEYS, LEGACY_STORAGE_KEYS, migrateLegacyStorage, loadUsdtBalance, saveUsdtBalance
} from "./utils/storage";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { MinerStore } from "./components/MinerStore";
import { R1Exchange } from "./components/exchange/R1Exchange";
import { MyCompany } from "./components/MyCompany";
import { TokenLaunch } from "./components/launch/TokenLaunch";
import { BottomNavigation } from "./components/BottomNavigation";
import { Info, X, Zap, CheckCircle2, ShieldCheck, Heart, AlertTriangle, TrendingUp, Coins } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { loadIssuedTokens, saveIssuedTokens, updateIssuedToken } from "./utils/issuedTokens";
import { useBackendConnection } from "./hooks/useBackendConnection";

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>("home");

  // Backend Connection (PR-3D)
  const backendConn = useBackendConnection();

  // Core Persisted States
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [activeMiners, setActiveMiners] = useState<ActiveMiner[]>([]);
  const [tasks, setTasks] = useState<TaskState>(INITIAL_TASKS);
  const [records, setRecords] = useState<MiningRecord[]>([]);
  const [usdtBalance, setUsdtBalance] = useState<number>(500.0); // Start with 500U free mock testbed fund

  // Lifecycle & Throttling Refs for localStorage writes
  const hasHydratedRef = useRef<boolean>(false);
  const pendingStatsRef = useRef<UserStats | null>(null);
  const pendingMinersRef = useRef<ActiveMiner[] | null>(null);
  const pendingRecordsRef = useRef<MiningRecord[] | null>(null);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // R1 Market price and exchange states
  const [r1Price, setR1Price] = useState<number>(0.05);
  const dayOpenPrice = 0.0475;
  const aiTokenBuybackPrice = 0.001;
  const r1PriceChange = useMemo(() => {
    return parseFloat((((r1Price - dayOpenPrice) / dayOpenPrice) * 100).toFixed(2));
  }, [r1Price]);
  const [r1PriceDir, setR1PriceDir] = useState<"up" | "down" | "flat">("flat");

  // Ticking price simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setR1Price((prev) => {
        const isUp = Math.random() > 0.46; // slightly upward biased random walk
        const delta = (Math.random() * 0.0008) * (isUp ? 1 : -1);
        const next = Math.max(0.0400, Math.min(0.0800, prev + delta));
        
        // update dir
        if (next > prev) setR1PriceDir("up");
        else if (next < prev) setR1PriceDir("down");
        else setR1PriceDir("flat");
        
        return parseFloat(next.toFixed(6));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Shared unified transaction handler for R1/USDT spot exchange and platform AI Token buybacks
  const handleExchangeTrade = (type: "buy" | "sell", amount: number, price: number, assetType: "r1" | "ai" = "r1"): boolean => {
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(price) || price <= 0) {
      triggerNotification("交易失败", "输入的交易数量或报价无效。", "warn");
      return false;
    }
    const feePct = 0.003; // 0.3% commission fee
    
    if (assetType === "ai") {
      if (type === "sell") {
        if (stats.hashFragments < amount) {
          triggerNotification("额度不足", `变现所需 ${amount.toFixed(4)} AI Token 超出您的余额。`, "warn");
          return false;
        }
        
        const totalSold = amount;
        const usdtReceivedRaw = totalSold * price;
        const fee = usdtReceivedRaw * feePct;
        const usdtReceivedNet = usdtReceivedRaw - fee;
        
        setStats(prev => ({
          ...prev,
          hashFragments: Math.max(0, prev.hashFragments - totalSold)
        }));
        setUsdtBalance(prev => prev + usdtReceivedNet);
        
        const logDesc = `[平台回收] 出售 ${totalSold.toFixed(4)} AI Token @ ${price.toFixed(4)} USDT`;
        addRecordLog("trade", totalSold, logDesc);
        
        triggerNotification("平台变现已撮合", `成功向平台出售 ${totalSold.toFixed(4)} AI Token (扣除 0.3% 手续费)。`, "success");
        return true;
      }
      return false;
    } else {
      if (type === "buy") {
        // amount is the quantity of USDT the user pays
        if (usdtBalance < amount) {
          triggerNotification("余额不足", `买入所需 ${amount.toFixed(2)} USDT 超出您的模拟金余额。`, "warn");
          return false;
        }
        
        const totalCost = amount;
        const r1ReceivedRaw = totalCost / price;
        const fee = r1ReceivedRaw * feePct;
        const r1ReceivedNet = r1ReceivedRaw - fee;
        
        setUsdtBalance(prev => prev - totalCost);
        setStats(prev => ({
          ...prev,
          r1Balance: (prev.r1Balance || 0) + r1ReceivedNet
        }));
        
        const logDesc = `[交易市场] 买入 ${r1ReceivedNet.toFixed(4)} R1 @ ${price.toFixed(6)} USDT`;
        addRecordLog("trade", r1ReceivedNet, logDesc);
        
        triggerNotification("买入交易已撮合", `成功以 ${price.toFixed(5)} USDT 价格买入 ${r1ReceivedNet.toFixed(4)} R1 (扣除 0.3% 手续费)。`, "success");
        return true;
      } else {
        // amount is the quantity of R1 the user sells
        const latestStats = statsRef.current;
        if ((latestStats.r1Balance || 0) < amount) {
          triggerNotification("R1 不足", `卖出所需 ${amount.toFixed(4)} R1 超出您的 R1 权益余额。`, "warn");
          return false;
        }
        
        const totalR1Sold = amount;
        const usdtReceivedRaw = totalR1Sold * price;
        const fee = usdtReceivedRaw * feePct;
        const usdtReceivedNet = usdtReceivedRaw - fee;
        
        setStats(prev => ({
          ...prev,
          r1Balance: Math.max(0, (prev.r1Balance || 0) - totalR1Sold)
        }));
        setUsdtBalance(prev => prev + usdtReceivedNet);
        
        const logDesc = `[交易市场] 卖出 ${totalR1Sold.toFixed(4)} R1 @ ${price.toFixed(6)} USDT`;
        addRecordLog("trade", totalR1Sold, logDesc);
        
        triggerNotification("卖出交易已撮合", `成功以 ${price.toFixed(5)} USDT 价格卖出 ${totalR1Sold.toFixed(4)} R1 (扣除 0.3% 手续费)。`, "success");
        return true;
      }
    }
  };

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
      // First run storage migration
      migrateLegacyStorage();

      const loadedS = loadStats();
      const loadedM = loadMiners();
      const loadedT = loadTasks();
      const loadedR = loadRecords();
      const loadedUsdt = loadUsdtBalance();
      
      setStats(loadedS ? { ...INITIAL_STATS, ...loadedS } : INITIAL_STATS);
      setActiveMiners(Array.isArray(loadedM) ? loadedM : []);
      setTasks(loadedT || INITIAL_TASKS);
      setRecords(Array.isArray(loadedR) ? loadedR : []);
      setUsdtBalance(loadedUsdt);
      hasHydratedRef.current = true;
    } catch (e) {
      console.error("Critical storage load failed, restoring to defaults:", e);
      setStats(INITIAL_STATS);
      setActiveMiners([]);
      setTasks(INITIAL_TASKS);
      setRecords([]);
      setUsdtBalance(500.0);
      hasHydratedRef.current = true;
    }
  }, []);

  const scheduleStorageFlush = () => {
    if (flushTimeoutRef.current) return;

    flushTimeoutRef.current = setTimeout(() => {
      flushStorageNow();
    }, 5000);
  };

  const flushStorageNow = () => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }

    if (pendingStatsRef.current) {
      try {
        saveStats(pendingStatsRef.current);
      } catch (e) {
        console.warn("Could not flush stats to storage:", e);
      }
      pendingStatsRef.current = null;
    }

    if (pendingMinersRef.current) {
      try {
        saveMiners(pendingMinersRef.current);
      } catch (e) {
        console.warn("Could not flush miners to storage:", e);
      }
      pendingMinersRef.current = null;
    }

    if (pendingRecordsRef.current) {
      try {
        saveRecords(pendingRecordsRef.current);
      } catch (e) {
        console.warn("Could not flush records to storage:", e);
      }
      pendingRecordsRef.current = null;
    }
  };

  // Synchronous flush ref to avoid closure issues
  const flushStorageNowRef = useRef(flushStorageNow);
  useEffect(() => {
    flushStorageNowRef.current = flushStorageNow;
  });

  // Page visibility & unload handlers
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushStorageNowRef.current();
      }
    };

    const handleBeforeUnload = () => {
      flushStorageNowRef.current();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Cleanup timeout and flush on unmount
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }
      flushStorageNowRef.current();
    };
  }, []);

  // Save changes
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    pendingStatsRef.current = stats;
    scheduleStorageFlush();
  }, [stats]);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    pendingMinersRef.current = activeMiners;
    scheduleStorageFlush();
  }, [activeMiners]);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    pendingRecordsRef.current = records;
    scheduleStorageFlush();
  }, [records]);

  useEffect(() => {
    try {
      saveTasks(tasks);
    } catch (e) {
      console.warn("Could not save tasks to storage:", e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      saveUsdtBalance(usdtBalance);
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
        
        // For demo miner: cost is 0, so reward is based on a default virtual cost of 100 U
        const actualRewardPerSec = miner.isDemo 
          ? (100 * miner.dailyYield * miner.efficiency * simulationFactor) / 3600
          : rewardPerSec;

        shardBonus += actualRewardPerSec;

        // Decrease efficiency or check aging
        let nextInEfficiency = miner.efficiency;
        let nextStatus = miner.status;

        // Special rule for free demo miner expiry simulator (stops after 180 seconds of live use for 3 minutes demo)
        if (miner.isDemo) {
          const ageSecs = (Date.now() - new Date(miner.purchasedAt).getTime()) / 1000;
          if (ageSecs > 180) { // stops after 3 minutes of live use
            nextStatus = "stopped";
            nextInEfficiency = 0;
            hasChange = true;
          }
        } else {
          // Standard miner aging: when accumulatedRewards >= cost * 0.5, it decays
          const currentAccumulated = miner.accumulatedRewards + actualRewardPerSec;
          if (currentAccumulated >= miner.cost * 0.5 && miner.status === "running") {
            nextStatus = "decayed";
            nextInEfficiency = 0.5; // drops to 50% efficiency
            hasChange = true;
          }
        }

        if (miner.efficiency !== nextInEfficiency || miner.status !== nextStatus) {
          hasChange = true;
        }

        return {
          ...miner,
          efficiency: Math.max(0, parseFloat(nextInEfficiency.toFixed(4))),
          status: nextStatus,
          accumulatedRewards: miner.accumulatedRewards + actualRewardPerSec
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
          
          if (prev.hashFragments < 100 && nextFragments >= 100) {
            triggerNotification(
              "AI Token 已满足打包条件",
              "账户 AI Token 已满 100，可生成 API Key、访问 URL，或提交平台回收申请。",
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
        addRecordLog("buff", 0, "算力加速时段结束。");
      }

    }, 1000);

    return () => clearInterval(interval);
  }, []);


  // Automatically recompute base and team hash power relative to active miners and dynamic upgrades
  useEffect(() => {
    // 50.0 is the baseline free P license allocation
    const minersBase = activeMiners.reduce((sum, m) => {
      if (m.status === "stopped") return sum;
      // An M1 miner (100U) contributes its cost * coefficient * efficiency
      // Under full efficiency (1.0), 100U adds 15 T/s. Under decay (0.5), it adds 7.5 T/s.
      return sum + (m.cost * 0.15 * m.efficiency);
    }, 50.0);

    // Auto calculate user affiliation rank
    const activeNonDemoSumCost = activeMiners
      .filter(m => !m.isDemo && m.status !== "stopped")
      .reduce((sum, m) => sum + m.cost, 0);

    let calculatedLevel = UserLevel.ZERO;
    let computedTeam = 0.0; // Baseline default team resonance (S0 gets 0)

    const directCount = stats.directReferrals;
    const totalCount = stats.totalReferrals;

    // Mapping S1-S5 DePIN structure based on user investment and team nodes.
    if (activeNonDemoSumCost >= 100) {
      calculatedLevel = UserLevel.S1;
      computedTeam = 55.0;

      if (activeNonDemoSumCost >= 500 && directCount >= 3) {
        calculatedLevel = UserLevel.S2;
        computedTeam = 120.0;
      }
      if (activeNonDemoSumCost >= 2000 && directCount >= 5) {
        calculatedLevel = UserLevel.S3;
        computedTeam = 260.0;
      }
      if (totalCount >= 15) {
        calculatedLevel = UserLevel.S4;
        computedTeam = 500.0;
      }
      if (totalCount >= 50) {
        calculatedLevel = UserLevel.S5;
        computedTeam = 1000.0;
      }
    }

    setStats((prev) => {
      return {
        ...prev,
        baseHashpower: parseFloat(minersBase.toFixed(2)),
        teamHashpower: parseFloat(computedTeam.toFixed(2)),
        level: calculatedLevel
      };
    });

  }, [activeMiners, stats.directReferrals, stats.totalReferrals]);


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
      "模拟余额已补充",
      "已增加 1,000 USDT 测试额度。您可以购买企业级 GPU 并网部署，或继续使用自有设备产出少量 Token。",
      "success"
    );
  };

  const handleCompleteTask = (taskKey: "watchAd" | "likeContent" | "shareMoments") => {
    if (tasks[taskKey]) return;

    let reward = 0;
    let label = "";
    if (taskKey === "watchAd") {
      reward = 2.0;
      label = "设备在线检测";
    } else if (taskKey === "likeContent") {
      reward = 1.0;
      label = "AI 测试任务";
    } else if (taskKey === "shareMoments") {
      reward = 3.0;
      label = "邀请链接分享";
    }

    setTasks((prev) => ({ ...prev, [taskKey]: true }));
    setStats((prev) => ({
      ...prev,
      hashFragments: prev.hashFragments + reward,
      accumulatedFragments: prev.accumulatedFragments + reward
    }));

    addRecordLog("mining", reward, `每日任务：${label}已完成。`);
    triggerNotification(
      "任务已完成",
      `系统已结算 ${reward} Token。余额可用于生成 API/URL、设备维护或平台回收。`,
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

    addRecordLog("buff", 0, "开启一小时算力加速，产出倍率提升。");
    triggerNotification(
      "算力加速已开启",
      "接下来 60 分钟内，自有设备和团队节点的 AI Token 产出会按加速倍率结算。",
      "success"
    );
  };

  const handleSynthesize = () => {
    if (stats.hashFragments < 100) {
      triggerNotification("AI Token 不足", "生成一组 API/URL 需要 100 AI Token。您可以连接手机、完成每日任务或购买高性能并网设备继续产出。 ", "warn");
      return;
    }

    setStats((prev) => ({
      ...prev,
      hashFragments: prev.hashFragments - 100,
      hashCrystals: prev.hashCrystals + 1,
      totalSynthesized: prev.totalSynthesized + 1
    }));

    addRecordLog("synthesize", 100, "消耗 100 AI Token 生成 1 组可用算力凭证。");
    triggerNotification(
      "API/URL 凭证已生成",
      "已消耗 100 AI Token，生成 1 组算力服务凭证。您可以用于自用、对外出售或提交平台回收。 ",
      "success"
    );
  };

  const handleBuyCoolant = (cost: number) => {
    if (stats.hashFragments < cost) {
      triggerNotification("AI Token 不足", "购买设备维护包需要 50 AI Token。", "warn");
      return;
    }

    setStats((prev) => ({
      ...prev,
      hashFragments: prev.hashFragments - cost,
      coolantCount: prev.coolantCount + 1
    }));

    addRecordLog("coolant", cost, "花费 50 AI Token 购买设备维护包。");
    triggerNotification(
      "设备维护包已入库",
      "已扣除 50 AI Token。可在后台为降频设备执行维护，恢复设备产出效率。 ",
      "success"
    );
  };

  const handleApplyCoolant = (minerId: string) => {
    if (stats.coolantCount < 1) {
      triggerNotification("维护包不足", "当前没有可用设备维护包。请先在物资页或后台购买。", "warn");
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
            efficiency: 1.10, // +10% performance boost
            status: "running"
          };
        }
        return m;
      })
    );

    addRecordLog("coolant", 1, `设备【${targetMiner.name}】完成维护。`);
    triggerNotification(
      "设备维护完成",
      `【${targetMiner.name}】已恢复运行，当前效率提升至 110%。`,
      "success"
    );
  };

  const handleClaimDemoMiner = () => {
    if (stats.hasClaimedDemo) return;

    const nowIso = new Date().toISOString();
    const demoMiner: ActiveMiner = {
      id: "demo-miner",
      name: "本地显卡共享算力体验节点",
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

    addRecordLog("mining", 0, "激活免费本地显卡共享算力体验节点 (3 分钟体验)");
    triggerNotification(
      "本地共享节点已激活",
      "系统已为您开启 3 分钟体验节点。您可以用自有本地设备并网共享算力，产出少量 AI Token。",
      "success"
    );
  };

  const handleResetDemoData = () => {
    // 0. Clear pending flush first to prevent writing old states back
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
    pendingStatsRef.current = null;
    pendingMinersRef.current = null;
    pendingRecordsRef.current = null;

    // 1. Clear all localStorage keys in STORAGE_KEYS and LEGACY_STORAGE_KEYS
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      Object.values(LEGACY_STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (e) {
      console.warn("Failed to clear localStorage keys during reset:", e);
    }

    // 2. Clear user issued tokens
    saveIssuedTokens([]);

    // 3. Reset react state
    setStats(INITIAL_STATS);
    setTasks(INITIAL_TASKS);
    setRecords(INITIAL_RECORDS);
    setActiveMiners([]);
    setUsdtBalance(500.0);

    // 4. Show success notification
    triggerNotification(
      "数据重置成功",
      "所有本地数据和旧版缓存已彻底清空，已恢复为全新初始状态。",
      "success"
    );
  };

  const handleLeaseMiner = (template: MinerTemplate) => {
    if (usdtBalance < template.cost) {
      triggerNotification(
        "余额不足",
        `购买【${template.name}】需要 ${template.cost} USDT。可点击顶部 + 补充模拟测试额度。`,
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
    addRecordLog("mining", template.cost, `本地部署并激活并网 ${template.name} 算力设备。`);
    triggerNotification(
      "设备部署并网成功",
      `已扣除 ${template.cost} USDT 并本地部署激活【${template.name}】。设备会并网微调训练产生 AI Token，可用于 API/URL、出售或平台回收。`,
      "success"
    );
    setCurrentTab("my"); // Auto jump to My Profile to check
  };

  const handleRedeemItem = (item: StoreItem) => {
    if (stats.hashFragments < item.costFragments) {
      triggerNotification("AI Token 不足", `该项目需要 ${item.costFragments.toLocaleString()} AI Token，当前余额不足。`, "warn");
      return;
    }

    // Deduct fragments
    setStats((prev) => ({
      ...prev,
      hashFragments: prev.hashFragments - item.costFragments
    }));

    addRecordLog("exchange", item.costFragments, `兑换或开通「${item.name}」。`);
    triggerNotification(
      "订单已受理",
      `已消耗 ${item.costFragments.toLocaleString()} AI Token。实体商品会进入发货流程，算力服务会生成对应凭证。`,
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
      "设备签到成功",
      `今日在线检测完成，获得 +${rewardShards} AI Token。${addCoolant ? "额外获得 1 个设备维护包。" : ""}`,
      "success"
    );
  };

  const handleSatisfyLaunchConditions = () => {
    if (!import.meta.env.DEV) {
      console.warn("Blocked DEV-only launch condition shortcut in production.");
      return;
    }

    const activeNonDemoSumCost = activeMiners
      .filter(m => !m.isDemo && m.status !== "stopped")
      .reduce((sum, m) => sum + m.cost, 0);

    let updatedMiners = [...activeMiners];
    if (updatedMiners.length === 0) {
      const nowIso = new Date().toISOString();
      const testMiner: ActiveMiner = {
        id: `miner-test-${Date.now()}`,
        name: "GPU 并网算力节点 S1",
        cost: 100,
        dailyYield: 0.015,
        contractDays: 30,
        purchasedAt: nowIso,
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        status: "running",
        accumulatedRewards: 0,
        efficiency: 1.0
      };
      updatedMiners = [testMiner];
      setActiveMiners(updatedMiners);
    } else if (activeNonDemoSumCost < 100) {
      const nowIso = new Date().toISOString();
      const testMiner: ActiveMiner = {
        id: `miner-test-${Date.now()}`,
        name: "GPU 并网算力节点 S1",
        cost: 100,
        dailyYield: 0.015,
        contractDays: 30,
        purchasedAt: nowIso,
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        status: "running",
        accumulatedRewards: 0,
        efficiency: 1.0
      };
      updatedMiners = [testMiner, ...updatedMiners];
      setActiveMiners(updatedMiners);
    }

    setStats((prev) => ({
      ...prev,
      level: UserLevel.S1,
      accumulatedFragments: 500.0,
      hashFragments: 500.0,
      r1Balance: 150.0
    }));

    triggerNotification("开发测试条件已满足", "已将等级设为 S1，累计 AI Token 产出设为 500，AI Token 余额设为 500，R1 权益余额设为 150，并激活算力设备。", "success");
  };

  const handleLaunchToken = (tokenData: UserIssuedToken): boolean => {
    const latestStats = statsRef.current;
    if ((latestStats.r1Balance || 0) < 100) {
      triggerNotification("R1 押金不足", "可锁定质押押金不足 100 R1，无法发行影子 Token。", "warn");
      return false;
    }

    setStats((prev) => {
      if ((prev.r1Balance || 0) < 100) return prev;
      return {
        ...prev,
        r1Balance: prev.r1Balance - 100
      };
    });

    addRecordLog("exchange", 100, `[发行中心] 质押锁仓 100 R1 成功发行影子 Token [${tokenData.symbol}]`);

    const currentTokens = loadIssuedTokens();
    const updatedTokens = [...currentTokens, tokenData];
    saveIssuedTokens(updatedTokens);

    triggerNotification(
      "企业 Token 发行成功",
      `已质押锁仓 100 R1 押金。影子 Token [${tokenData.symbol}] 模拟合约影子部署成功，进入模拟支持池。`,
      "success"
    );
    return true;
  };

  const handleSupportCompanyToken = (tokenId: string, amount: number): boolean => {
    if (usdtBalance < amount) {
      triggerNotification("余额不足", `账户模拟 USDT 余额不足 ${amount} U，无法提供支持。`, "warn");
      return false;
    }
    
    const tokens = loadIssuedTokens();
    const targetToken = tokens.find(t => t.id === tokenId);
    if (!targetToken) {
      triggerNotification("错误", "找不到指定的公司 Token。", "warn");
      return false;
    }

    const remaining = targetToken.targetPool - targetToken.raisedUsdt;
    if (amount > remaining) {
      triggerNotification("超额支持", `支持金额不能超过模拟支持池剩余额度 ${remaining.toFixed(2)} USDT。`, "warn");
      return false;
    }

    setUsdtBalance((prev) => prev - amount);
    
    updateIssuedToken(tokenId, (t) => {
      const nextRaised = t.raisedUsdt + amount;
      const nextProgress = Math.min(100, (nextRaised / t.targetPool) * 100);
      return {
        ...t,
        raisedUsdt: nextRaised,
        progress: nextProgress
      };
    });

    setStats((prev) => ({ ...prev }));

    addRecordLog("exchange", amount, `[公司支持] 投入 ${amount} USDT 支持影子公司 Token [${targetToken.symbol}]`);
    triggerNotification("支持成功", `已成功模拟注入 ${amount} USDT 参与影子项目 [${targetToken.symbol}] 的建设。`, "success");
    return true;
  };

  const handleUpdateCompanyTokenStatus = (tokenId: string, newStatus: "launching" | "listed" | "closed"): boolean => {
    const tokens = loadIssuedTokens();
    const targetToken = tokens.find(t => t.id === tokenId);
    if (!targetToken) return false;

    updateIssuedToken(tokenId, (t) => ({ ...t, status: newStatus }));
    addRecordLog("exchange", 0, `[影子挂牌] 影子公司 [${targetToken.symbol}] 影子挂牌成功`);
    triggerNotification("影子挂牌成功", `影子公司 [${targetToken.symbol}] 影子挂牌成功！`, "success");
    // Trigger stats state update to refresh Dashboard/exchange views
    setStats(prev => ({ ...prev }));
    return true;
  };

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans tracking-tight relative select-none">
      
      {/* SVG Linear Gradient definitions for cyberpunk icon strokes */}
      <svg className="sr-only" width="0" height="0" style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <linearGradient id="gradient-cyan-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="gradient-purple-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
          <linearGradient id="gradient-emerald-teal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="gradient-amber-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
      </svg>

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
        r1Price={r1Price}
      />

      {/* Master Main Container Body and Page switches */}
      <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto px-4 py-4 md:py-6 pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-8 flex flex-col justify-between">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="w-full"
            >
              {currentTab === "home" && (
                <Dashboard
                  stats={stats}
                  tasks={tasks}
                  activeMiners={activeMiners}
                  records={records}
                  onCompleteTask={handleCompleteTask}
                  onTriggerBuff={handleTriggerBuff}
                  onSynthesize={handleSynthesize}
                  onCheckInCompleted={handleCheckInCompleted}
                  r1Price={r1Price}
                  r1PriceDir={r1PriceDir}
                  r1PriceChange={r1PriceChange}
                  aiTokenBuybackPrice={aiTokenBuybackPrice}
                  handleExchangeTrade={handleExchangeTrade}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "store" && (
                <MinerStore
                  stats={stats}
                  activeMiners={activeMiners}
                  onLeaseMiner={handleLeaseMiner}
                />
              )}

              {currentTab === "exchange" && (
                <R1Exchange
                  stats={stats}
                  usdtBalance={usdtBalance}
                  r1Price={r1Price}
                  r1PriceDir={r1PriceDir}
                  r1PriceChange={r1PriceChange}
                  handleExchangeTrade={handleExchangeTrade}
                  onSupportCompanyToken={handleSupportCompanyToken}
                  onUpdateCompanyTokenStatus={handleUpdateCompanyTokenStatus}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {currentTab === "launch" && (
                <TokenLaunch
                  stats={stats}
                  activeMiners={activeMiners}
                  onSatisfyConditions={handleSatisfyLaunchConditions}
                  onLaunchToken={handleLaunchToken}
                  setCurrentTab={setCurrentTab}
                />
              )}


               {currentTab === "my" && (
                <MyCompany
                  stats={stats}
                  activeMiners={activeMiners}
                  records={records}
                  usdtBalance={usdtBalance}
                  onSynthesize={handleSynthesize}
                  onBuyCoolant={handleBuyCoolant}
                  onApplyCoolant={handleApplyCoolant}
                  onClaimDemoMiner={handleClaimDemoMiner}
                  onUpdateSimulatedStats={(updater) => setStats(updater)}
                  onRedeemItem={handleRedeemItem}
                  onResetDemoData={handleResetDemoData}
                  backendConnected={backendConn.backendConnected}
                  backendUser={backendConn.backendUser}
                  backendAssets={backendConn.backendAssets}
                  backendDevices={backendConn.backendDevices}
                  backendError={backendConn.backendError}
                  backendLoading={backendConn.backendLoading}
                  onConnectBackend={backendConn.connectBackend}
                  onRefreshBackend={backendConn.refreshBackend}
                  onDisconnectBackend={backendConn.disconnectBackend}
                  onClearBackendError={backendConn.clearBackendError}
                  onForceAgeMiner={() => {
                    setActiveMiners((prev) => {
                      if (prev.length === 0) return prev;
                      let aged = false;
                      return prev.map((m) => {
                        if (!m.isDemo && m.status === "running" && !aged) {
                          aged = true;
                          return {
                            ...m,
                            accumulatedRewards: m.cost * 0.5,
                            status: "decayed",
                            efficiency: 0.5
                          };
                        }
                        return m;
                      });
                    });
                    triggerNotification(
                      "设备降频模拟触发",
                      "已模拟首台运行设备进入降频状态。可在后台使用设备维护包恢复效率。",
                      "warn"
                    );
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Ambient footer */}
        <footer className="border-t border-slate-900/60 bg-transparent mt-12 py-6 text-center text-[10px] text-slate-500 pb-2">
          <p>© 2026 1人算力有限公司 · 本地设备部署并网 · 训练大模型产出 Token</p>
          <p className="text-[9px] text-zinc-600 mt-1 max-w-xl mx-auto leading-relaxed">
            Token 作为平台内算力服务额度，可用于生成 API Key、访问 URL、兑换服务或提交平台回收。
          </p>
        </footer>
      </main>

      {/* Modern, tactile Mobile Bottom Navigation Menu */}
      <BottomNavigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

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
                {modal.type === "success" && <CheckCircle2 stroke="url(#gradient-emerald-teal)" className="size-6 icon-glow-emerald stroke-[2.5]" />}
                {modal.type === "warn" && <AlertTriangle stroke="url(#gradient-amber-orange)" className="size-6 icon-glow-amber stroke-[2.5]" />}
                {modal.type === "info" && <Info stroke="url(#gradient-cyan-blue)" className="size-6 icon-glow-cyan stroke-[2.5]" />}
                {modal.type === "crystal" && <Zap stroke="url(#gradient-amber-orange)" className="size-6 icon-glow-amber stroke-[2.5] animate-pulse" />}
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
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 hover:brightness-110 active:scale-95"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 active:bg-slate-700"
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
