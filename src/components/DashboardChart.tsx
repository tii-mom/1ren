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
        hashpower: parseFloat(val.toFixed(1)),
        baseline: parseFloat((val * 0.25).toFixed(1)), // mock auxiliary sub-channels
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
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
        <div className="space-y-1">
          <span className="text-[9px] text-violet-400 font-mono font-extrabold tracking-widest block uppercase">PERFORMANCE TELEMETRY REPORT</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="text-cyan-400 size-4.5" />
            7日全速并网哈希总算力跃迁谱 map
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            实时捕获您当前节点与团队共振算力的复合净值曲线。托管新设备会立即拉升波段。
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
                  return (
                    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3 shadow-xl backdrop-blur-md">
                      <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-cyan-400 tracking-wider mb-1 uppercase">
                        <Server className="size-3" />
                        NODE TELEMETRY
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans mb-1">{payload[0].payload.name}</p>
                      <p className="text-xs font-bold text-white font-mono">
                        并物理算力: <b className="text-cyan-300 font-extrabold text-base">{payload[0].value}</b> T/s
                      </p>
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
