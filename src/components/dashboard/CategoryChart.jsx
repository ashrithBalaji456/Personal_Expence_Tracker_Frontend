import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currency';
import { CATEGORY_DETAILS } from '../../utils/constants';

export const CategoryChart = ({ data = {}, onCategoryClick }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Convert map data {"FOOD": 100, ...} to Recharts Pie format [{name: "FOOD", value: 100}]
  const chartData = Object.entries(data)
    .map(([key, val]) => ({
      name: key,
      value: typeof val === 'string' ? parseFloat(val) : val
    }))
    .filter((item) => item.value > 0);

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const getCategoryColor = (name) => {
    return CATEGORY_DETAILS[name]?.color || '#94A3B8';
  };

  if (chartData.length === 0) {
    return (
      <div className="w-full h-56 border border-dashed border-slate-700/60 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
        <span className="text-3xl mb-2 select-none">🍩</span>
        <h4 className="text-slate-200 text-sm font-bold mb-1">No Categories Logged</h4>
        <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
          Categorized breakdowns will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-56 flex items-center justify-center">
      {/* Centered text display */}
      <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Spent</span>
        <span className="text-base sm:text-lg font-black text-white mt-1">
          {formatCurrency(totalValue)}
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={82}
            paddingAngle={5}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onClick={(dataItem) => onCategoryClick && onCategoryClick(dataItem.name)}
            className="cursor-pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getCategoryColor(entry.name)}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                stroke="rgba(21, 28, 44, 0.8)"
                strokeWidth={2}
                style={{
                  filter: activeIndex === index ? `drop-shadow(0px 0px 8px ${getCategoryColor(entry.name)}80)` : 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
export default CategoryChart;
