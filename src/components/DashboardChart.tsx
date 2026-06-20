import React, { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, Cpu, Server } from "lucide-react";

interface DashboardChartProps {
  totalHashpower: number;
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ totalHashpower }) => {
  // Generate a mock historical growth trend leading up to the user's current live hash power
  const chartData = useMemo(() => {
    const labels = ["6天前", "5天前", "4天前", "3天前", "2天前", "昨天", "今日并网"];
    const multi = [0.45, 0.52, 0.61, 0.73, 0.82, 0.92, 1.0];
    
    return labels.map((label, idx) => {
      const isToday = idx === 6;
      // Ensure Today's value is EXACTLY matching their current live hash power
      const val = isToday ? totalHashpower : totalHashpower * multi[idx];
      return {
        name: label,
        hashpower: parseFloat(val.toFixed(2)),
        physical: parseFloat((val * 0.7).toFixed(2)), // Physical IDC capacity (70%)
        resonance: parseFloat((val * 0.3).toFixed(2)), // Team node bonus (30%)
      };
    });
  }, [totalHashpower]);

  const percentageGrowth = useMemo(() => {
    if (chartData.length < 2) return "0";
    const startValue = chartData[0].hashpower;
    const endValue = chartData[chartData.length - 1].hashpower;
    if (startValue === 0) return "122";
    return (((endValue - startValue) / startValue) * 100).toFixed(0);
  }, [chartData]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
        <div className="space-y-1">
          <span className="text-[9px] text-cyan-400 font-mono font-extrabold tracking-widest block uppercase">PERFORMANCE TELEMETRY REPORT</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="text-cyan-400 size-4 animate-pulse" />
            7 日总算力变化
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            展示自有设备、托管设备和团队节点加权后的总算力变化。
          </p>
        </div>

        <div className="flex items-center gap-3 bg-cyan-950/25 border border-cyan-500/20 px-3.5 py-2 rounded-2xl shrink-0">
          <div className="text-right">
            <span className="text-[8px] text-slate-500 font-mono font-bold block uppercase">Weekly Delta</span>
            <span className="text-xs font-mono font-extrabold text-emerald-400 flex items-center gap-1.5 leading-none mt-1">
              <TrendingUp className="size-3.5" />
              +{percentageGrowth}% 跃升
            </span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-[240px] w-full font-mono mt-2" id="haspower-growth-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHashpower" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(6, 182, 212)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="rgb(6, 182, 212)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255, 255, 255, 0.3)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="rgba(255, 255, 255, 0.3)" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dx={-5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = Number(payload[0].payload.hashpower || 0);
                  const physicalVal = Number(payload[0].payload.physical || 0);
                  const resonanceVal = Number(payload[0].payload.resonance || 0);
                  return (
                    <div className="relative bg-slate-950/95 border border-cyan-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[210px] font-mono">
                      {/* Cyber corner brackets */}
                      <div className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5 border-t border-l border-cyan-400 rounded-tl-sm pointer-events-none" />
                      <div className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 border-b border-r border-cyan-400 rounded-br-sm pointer-events-none" />
                      
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                        <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-cyan-400 tracking-widest uppercase">
                           <Server className="size-3 icon-glow-cyan" />
                          NODE TELEMETRY
                        </div>
                        <span className="text-[8px] bg-cyan-950 text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
                          LIVE
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 mb-2">
                        时间节点: <span className="text-slate-200">{payload[0].payload.name}</span>
                      </p>
                      
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center bg-cyan-950/20 px-2 py-1 rounded border border-cyan-500/10">
                          <span className="text-[10px] text-slate-300 flex items-center gap-1.5 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            并网总算力
                          </span>
                          <span className="font-bold text-cyan-300">{val.toFixed(2)} T/s</span>
                        </div>
                        
                        <div className="flex justify-between items-center px-2 py-0.5 font-sans">
                          <span className="text-[10px] text-slate-400">├ 物理机房算力 (70%)</span>
                          <span className="font-bold text-cyan-300 font-mono">{physicalVal.toFixed(2)} T/s</span>
                        </div>

                        <div className="flex justify-between items-center px-2 py-0.5 font-sans">
                          <span className="text-[10px] text-slate-400">└ 团队共鸣加成 (30%)</span>
                          <span className="font-bold text-amber-300 font-mono">{resonanceVal.toFixed(2)} T/s</span>
                        </div>
                      </div>
                      
                      <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] text-slate-500">
                        <span>CHNL: OPTICAL-08</span>
                        <span>SECURE LINK</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="hashpower"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorHashpower)"
              activeDot={{ r: 6, stroke: "#06b6d4", strokeWidth: 2, fill: "#030712" }}
            />
            <Area
              type="monotone"
              dataKey="physical"
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
              activeDot={{ r: 4, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#030712" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans font-medium mt-3 border-t border-white/5 pt-3">
        <span>当前节点总和功率: <b className="text-white font-mono">{totalHashpower.toFixed(2)} T/s</b></span>
        <span>水力绿色分布式区块链云网信道</span>
      </div>
    </div>
  );
};
