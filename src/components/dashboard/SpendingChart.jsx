import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currency';
import { formatDateFriendly } from '../../utils/date';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#151C2C]/90 border border-white/10 p-3 rounded-xl backdrop-blur-md shadow-xl text-left">
        <p className="text-[10px] text-slate-400 font-bold mb-1">
          {formatDateFriendly(payload[0].payload.date)}
        </p>
        <p className="text-sm text-brand-cyan font-black">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const SpendingChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="w-full h-72 bg-slate-800/20 border border-white/5 rounded-2xl animate-pulse flex items-center justify-center">
        <span className="text-xs text-slate-400">Loading chart...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-72 border border-dashed border-slate-700/60 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
        <span className="text-3xl mb-2 select-none">📈</span>
        <h4 className="text-slate-200 text-sm font-bold mb-1">No Spending Trends</h4>
        <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
          Daily transaction trends will appear once expenses are added.
        </p>
      </div>
    );
  }

  // Format dates for X-Axis display
  const chartData = data.map((d) => ({
    ...d,
    formattedDate: d.formattedDate || new Date(d.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    })
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis
            dataKey="formattedDate"
            stroke="#64748B"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="#64748B"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val}`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#8B5CF6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSpending)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
export default SpendingChart;
