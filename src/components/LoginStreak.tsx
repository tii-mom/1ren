import React, { useState, useEffect } from "react";
import { Calendar, CalendarCheck2, Fuel, Sparkles, Zap, Award, CheckCircle } from "lucide-react";

interface LoginStreakProps {
  onCheckInCompleted: (rewardShards: number, addCoolant: boolean, description: string) => void;
}

interface StreakDay {
  dayIndex: number; // 1 to 7
  reward: number;
  label: string;
  extra?: string;
}

const STREAK_DAYS: StreakDay[] = [
  { dayIndex: 1, reward: 1.5, label: "Day 1" },
  { dayIndex: 2, reward: 2.5, label: "Day 2" },
  { dayIndex: 3, reward: 4.0, label: "Day 3" },
  { dayIndex: 4, reward: 6.0, label: "Day 4" },
  { dayIndex: 5, reward: 8.5, label: "Day 5" },
  { dayIndex: 6, reward: 11.0, label: "Day 6" },
  { dayIndex: 7, reward: 15.0, label: "Day 7", extra: "+1瓶纳米液氮" }
];

export const LoginStreak: React.FC<LoginStreakProps> = ({ onCheckInCompleted }) => {
  const [streak, setStreak] = useState<number>(0);
  const [lastCheckIn, setLastCheckIn] = useState<string>("");
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(false);

  // Load state on mount
  useEffect(() => {
    const savedStreak = localStorage.getItem("hashcube_streak_count");
    const savedLastDate = localStorage.getItem("hashcube_last_check_in_date") || "";
    
    const parsedStreak = savedStreak ? parseInt(savedStreak, 10) : 0;
    setStreak(parsedStreak);
    setLastCheckIn(savedLastDate);

    const todayStr = new Date().toISOString().substring(0, 10);
    setHasCheckedInToday(savedLastDate === todayStr);

    // If they missed a day, reset streak to 0 (unless checked in today)
    if (savedLastDate && savedLastDate !== todayStr) {
      const lastCheckDateObj = new Date(savedLastDate);
      const todayDateObj = new Date(todayStr);
      const diffTime = Math.abs(todayDateObj.getTime() - lastCheckDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If of difference is greater than 1 day, reset consecutive login streak
      if (diffDays > 1) {
        setStreak(0);
        localStorage.setItem("hashcube_streak_count", "0");
      }
    }
  }, []);

  const handleCheckIn = () => {
    if (hasCheckedInToday) return;

    const todayStr = new Date().toISOString().substring(0, 10);
    
    // Determine new streak count. Max out at 7 days, then cycle back
    let nextStreak = streak + 1;
    if (nextStreak > 7) {
      nextStreak = 1;
    }

    // Determine rewards
    const matchingDay = STREAK_DAYS[nextStreak - 1];
    const rewardShards = matchingDay.reward;
    const isDay7 = nextStreak === 7;

    setStreak(nextStreak);
    setLastCheckIn(todayStr);
    setHasCheckedInToday(true);

    localStorage.setItem("hashcube_streak_count", nextStreak.toString());
    localStorage.setItem("hashcube_last_check_in_date", todayStr);

    const desc = `每日签到打卡 (第 ${nextStreak} 天连签), 获 ${rewardShards} Token 利润${isDay7 ? " +1瓶纳米防爆液氮" : ""}`;
    onCheckInCompleted(rewardShards, isDay7, desc);
  };

  // Skip date-check validator strictly for DEMO testing cycle (fast forward checkins)
  const handleSimulateNextDay = () => {
    // Treat yesterday as checkin
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().substring(0, 10);

    localStorage.setItem("hashcube_last_check_in_date", yesterdayStr);
    setLastCheckIn(yesterdayStr);
    setHasCheckedInToday(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
        <div className="space-y-1">
          <span className="text-[9px] text-cyan-400 font-mono font-extrabold tracking-widest block uppercase">LOYALTY REBATE SEQUENCE</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CalendarCheck2 className="text-yellow-400 size-4" />
            连续并网签到日历 (7-Day Login Streak)
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            坚持每日连接中心通道，签到奖励逐日递增。连续签到至第 7 天可获得极境大礼包！
          </p>
        </div>

        <div className="flex items-center gap-3 bg-black/40 border border-white/5 px-4 py-2 rounded-2xl shrink-0">
          <div className="text-left font-mono">
            <span className="text-[8px] text-slate-400 block font-bold uppercase">Current Streak</span>
            <span className="text-sm font-extrabold text-yellow-400 leading-none">
              连续签到 {streak} 天
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day calendar-like bento grid */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-6">
        {STREAK_DAYS.map((day) => {
          const isCompleted = day.dayIndex <= streak;
          const isCurrent = day.dayIndex === streak + 1 && !hasCheckedInToday;
          const isLocked = day.dayIndex > streak + (hasCheckedInToday ? 0 : 1);

          let bgStyle = "bg-black/35 border-white/5 text-slate-500 opacity-60";
          let borderGlow = "";

          if (isCompleted) {
            bgStyle = "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold";
          } else if (isCurrent) {
            bgStyle = "bg-white/5 border-white/15 text-slate-200 animate-pulse font-semibold";
            borderGlow = "shadow-[0_0_15px_rgba(234,179,8,0.2)] border-yellow-500/40";
          } else if (!isLocked) {
            bgStyle = "bg-white/[0.02] border-white/10 text-slate-400";
          }

          return (
            <div
              key={day.dayIndex}
              className={`p-3.5 rounded-2xl border text-center flex flex-col justify-between items-center relative transition-all duration-300 min-h-[95px] ${bgStyle} ${borderGlow}`}
            >
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                {day.label}
              </span>

              <div className="my-2 select-none">
                {isCompleted ? (
                  <CheckCircle className="size-5.5 text-cyan-400 fill-cyan-950/50" />
                ) : (
                  <span className={`font-mono text-sm ${isCurrent ? "text-yellow-400 text-glow-gold font-extrabold" : "text-slate-400 font-medium"}`}>
                    +{day.reward}U
                  </span>
                )}
              </div>

              <div className="text-[9px] text-slate-400 font-sans tracking-tight">
                {day.dayIndex === 7 ? (
                  <span className="text-[8.5px] text-amber-400 font-extrabold bg-amber-950/50 border border-amber-500/20 px-1 py-0.5 rounded uppercase font-mono block truncate">
                    氮+Token
                  </span>
                ) : (
                  <span className="text-slate-500 truncate">Token</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/35 border border-white/5 rounded-2xl p-4">
        <p className="text-xs text-slate-400 text-left font-sans">
          提示：签到不需要耗气、免提领费。断签一天，签到阶段将被迫重新从 Day 1 起算。
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Simulation fast forward for preview */}
          <button
            onClick={handleSimulateNextDay}
            className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors font-mono tracking-tight underline border-none bg-transparent cursor-pointer py-1"
          >
            <span>模拟跨日签到 (Test Days)</span>
          </button>

          <button
            onClick={handleCheckIn}
            disabled={hasCheckedInToday}
            className={`px-5 py-2.5 rounded-xl font-bold tracking-wider text-xs uppercase transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 ${
              hasCheckedInToday
                ? "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 hover:brightness-110 active:scale-95 shadow-[0_2px_15px_rgba(6,182,212,0.3)] cursor-pointer"
            }`}
          >
            <Zap className={`size-3.5 ${hasCheckedInToday ? "text-slate-500" : "animate-bounce"}`} />
            {hasCheckedInToday ? "今日已完成签到" : "签到连接公链"}
          </button>
        </div>
      </div>
    </div>
  );
};
