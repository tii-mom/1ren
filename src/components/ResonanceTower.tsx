import React, { useMemo, useState } from "react";
import { UserStats, UserLevel } from "../types";
import { MOCK_REFERRALS } from "../utils/storage";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Lock,
  Network,
  Radio,
  ShieldCheck,
  Trophy,
  Users,
  Zap
} from "lucide-react";

interface ResonanceTowerProps {
  stats: UserStats;
}

interface TeamTier {
  level: number;
  code: "S0" | "S1" | "S2" | "S3" | "S4" | "S5";
  title: string;
  requirement: string;
  distribution: string;
  teamHashpower: string;
  kpi: string;
}

const TEAM_TIERS: TeamTier[] = [
  {
    level: 0,
    code: "S0",
    title: "自有设备节点",
    requirement: "无需购买设备，可使用手机或电脑共享算力",
    distribution: "不参与团队加权",
    teamHashpower: "+0.00 T/s",
    kpi: "完成设备接入，开始产出少量 Token。"
  },
  {
    level: 1,
    code: "S1",
    title: "共建合伙节点",
    requirement: "个人并网 GPU >= 100 USDT",
    distribution: "一级节点 15% 贡献加权",
    teamHashpower: "+55.00 T/s",
    kpi: "首台并网 GPU 设备在线，开启直属节点邀请。"
  },
  {
    level: 2,
    code: "S2",
    title: "团队合伙节点",
    requirement: "并网 GPU >= 500 USDT，直属活跃节点 >= 3",
    distribution: "一级 15%，二级 10%",
    teamHashpower: "+120.00 T/s",
    kpi: "直属 3 个节点保持在线，团队产出开始放大。"
  },
  {
    level: 3,
    code: "S3",
    title: "区域合伙节点",
    requirement: "并网 GPU >= 2000 USDT，直属活跃节点 >= 5",
    distribution: "一级 15%，二级 10%，三级 5%",
    teamHashpower: "+260.00 T/s",
    kpi: "团队具备稳定扩展能力，优先获得更高任务调度。"
  },
  {
    level: 4,
    code: "S4",
    title: "城市合伙节点",
    requirement: "团队级联活跃节点 >= 15",
    distribution: "前三级同上，四级 3%",
    teamHashpower: "+500.00 T/s",
    kpi: "级联节点达到 15 个，获得区域服务分配权。"
  },
  {
    level: 5,
    code: "S5",
    title: "全球理事节点",
    requirement: "团队级联活跃节点 >= 50",
    distribution: "全级联覆盖，参与 2% 服务费分配池",
    teamHashpower: "+1000.00 T/s",
    kpi: "团队节点达到 50 个，进入平台治理候选序列。"
  }
];

const getLevelDepth = (level: UserLevel): number => {
  switch (level) {
    case UserLevel.S1:
      return 1;
    case UserLevel.S2:
      return 2;
    case UserLevel.S3:
      return 3;
    case UserLevel.S4:
      return 4;
    case UserLevel.S5:
      return 5;
    case UserLevel.ZERO:
    default:
      return 0;
  }
};

export const ResonanceTower: React.FC<ResonanceTowerProps> = ({ stats }) => {
  const userLevelIndex = getLevelDepth(stats.level);
  const [selectedLevel, setSelectedLevel] = useState(Math.max(1, userLevelIndex));
  const selectedTier = TEAM_TIERS.find((tier) => tier.level === selectedLevel) || TEAM_TIERS[1];
  const progressPercent = Math.round((userLevelIndex / 5) * 100);
  const visibleReferrals = useMemo(() => MOCK_REFERRALS.filter((ref) => ref.depth <= 5).slice(0, 8), []);
  const offlineCount = stats.totalReferrals >= 15 ? 2 : stats.totalReferrals >= 3 ? 1 : 0;

  const directTarget = selectedTier.level <= 1 ? 0 : selectedTier.level === 2 ? 3 : selectedTier.level === 3 ? 5 : 5;
  const totalTarget = selectedTier.level >= 5 ? 50 : selectedTier.level >= 4 ? 15 : 0;
  const directProgress = directTarget ? Math.min(100, Math.round((stats.directReferrals / directTarget) * 100)) : 100;
  const totalProgress = totalTarget ? Math.min(100, Math.round((stats.totalReferrals / totalTarget) * 100)) : 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Network className="size-5" />
            </span>
            团队节点 <span className="text-xs text-slate-500 font-mono font-normal">/ S0-S5</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            保留 1人公司的团队分销架构，用直属节点和级联节点提升算力加权。
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-black/45 border border-white/5 px-3 py-1.5 rounded-xl font-mono">
          <ShieldCheck className="size-4 text-cyan-400" />
          当前等级 {stats.level}
        </div>
      </div>

      {offlineCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-amber-300">团队节点离线提醒</h2>
              <p className="text-xs text-slate-400 mt-1">
                检测到 {offlineCount} 个级联节点 24 小时内未在线，团队加权可能下降。可以发送唤醒 Ping。
              </p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold active:scale-95 transition-all">
            发送节点 Ping
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-sm font-bold text-white">团队等级路径</h2>
              <p className="text-xs text-slate-400 mt-1">点击等级查看门槛、加权和权益。</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-mono block">完成度</span>
              <span className="text-lg font-mono font-black text-cyan-400">{progressPercent}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TEAM_TIERS.map((tier) => {
              const unlocked = tier.level <= userLevelIndex;
              const selected = tier.level === selectedTier.level;
              return (
                <button
                  key={tier.code}
                  onClick={() => setSelectedLevel(tier.level)}
                  className={`rounded-2xl border p-4 text-left transition-all active:scale-95 ${
                    selected
                      ? "border-cyan-400 bg-cyan-500/10 text-white"
                      : unlocked
                        ? "border-cyan-500/25 bg-white/[0.04] text-slate-200"
                        : "border-white/5 bg-black/25 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-black">{tier.code}</span>
                    {unlocked ? <CheckCircle className="size-4 text-cyan-400" /> : <Lock className="size-4" />}
                  </div>
                  <div className="mt-3 text-[11px] font-bold leading-snug">{tier.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="size-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">当前团队数据</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/35 border border-white/5 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 font-mono block">直属节点</span>
              <span className="text-2xl font-mono font-black text-white">{stats.directReferrals}</span>
            </div>
            <div className="bg-black/35 border border-white/5 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 font-mono block">级联节点</span>
              <span className="text-2xl font-mono font-black text-cyan-400">{stats.totalReferrals}</span>
            </div>
            <div className="bg-black/35 border border-white/5 rounded-xl p-4 col-span-2">
              <span className="text-[10px] text-slate-500 font-mono block">团队算力加权</span>
              <span className="text-2xl font-mono font-black text-cyan-400">+{stats.teamHashpower.toFixed(2)} T/s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">{selectedTier.code}</span>
              <h2 className="text-lg font-extrabold text-white mt-1">{selectedTier.title}</h2>
              <p className="text-xs text-slate-400 mt-2">{selectedTier.kpi}</p>
            </div>
            <Trophy className="size-6 text-amber-400 shrink-0" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-black/35 border border-white/5 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 font-mono block">升级门槛</span>
              <p className="text-sm font-bold text-white mt-2">{selectedTier.requirement}</p>
            </div>
            <div className="bg-black/35 border border-white/5 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 font-mono block">贡献分配</span>
              <p className="text-sm font-bold text-cyan-300 mt-2">{selectedTier.distribution}</p>
            </div>
            <div className="bg-black/35 border border-white/5 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 font-mono block">团队算力</span>
              <p className="text-sm font-bold text-white mt-2">{selectedTier.teamHashpower}</p>
            </div>
            <div className="bg-black/35 border border-white/5 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 font-mono block">状态</span>
              <p className="text-sm font-bold text-white mt-2">
                {selectedTier.level <= userLevelIndex ? "已达到或已超过" : "未达到"}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {directTarget > 0 && (
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>直属节点进度</span>
                  <span>{stats.directReferrals}/{directTarget}</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${directProgress}%` }} />
                </div>
              </div>
            )}
            {totalTarget > 0 && (
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>级联节点进度</span>
                  <span>{stats.totalReferrals}/{totalTarget}</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${totalProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="size-5 text-cyan-400" />
              节点样例
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">Depth 1-5</span>
          </div>
          <div className="space-y-3">
            {visibleReferrals.map((node) => (
              <div key={node.id} className="bg-black/35 border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{node.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1">第 {node.depth} 层节点</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-cyan-400 font-mono font-bold">{node.totalHashpower.toFixed(1)} T/s</div>
                  <div className="text-[9px] text-slate-500">{node.level}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Radio className="size-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-white">团队增长说明</h2>
            <p className="text-xs text-slate-400 mt-1">
              团队节点等级只影响平台内的算力贡献加权和任务调度优先级。用户仍可只使用自有设备产出 Token。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-cyan-300 font-bold">
          查看机房设备
          <ArrowRight className="size-4" />
        </div>
      </div>
    </div>
  );
};
