import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currency';
import { CATEGORY_DETAILS } from '../../utils/constants';
import trackerApi from '../../api/trackerApi';

export const CategoryChart = ({ data = {}, onCategoryClick }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [categoryColors, setCategoryColors] = useState({});

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const cats = await trackerApi.getBudgetCategories();
        const colors = {};
        cats.forEach(c => {
          colors[c.name] = c.color;
          colors[c.name.toUpperCase()] = c.color;
        });
        setCategoryColors(colors);
      } catch (err) {
        // ignore
      }
    };
    fetchColors();
  }, []);

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
    return categoryColors[name] || categoryColors[name.toUpperCase()] || CATEGORY_DETAILS[name]?.color || CATEGORY_DETAILS[name.toUpperCase()]?.color || '#94A3B8';
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

  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full h-56 flex items-center justify-center">
        {/* Centered text display */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none text-center max-w-[130px]">
          <span 
            className="text-[9px] font-bold uppercase tracking-widest truncate max-w-full"
            style={{ color: activeItem ? getCategoryColor(activeItem.name) : '#94A3B8' }}
          >
            {activeItem ? activeItem.name : "Total Spent"}
          </span>
          <span className="text-base sm:text-lg font-black text-white mt-0.5 truncate max-w-full">
            {activeItem ? formatCurrency(activeItem.value) : formatCurrency(totalValue)}
          </span>
          {activeItem && (
            <span className="text-[8px] font-semibold text-slate-400 mt-0.5">
              {((activeItem.value / totalValue) * 100).toFixed(0)}% of spent
            </span>
          )}
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

      {/* Grid Legend showing category name + percentage */}
      <div className="grid grid-cols-2 gap-2 w-full px-1">
        {chartData.map((item) => {
          const color = getCategoryColor(item.name);
          const percent = ((item.value / totalValue) * 100).toFixed(0);
          return (
            <div 
              key={item.name} 
              className="flex items-center justify-between text-[10px] font-bold bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => onCategoryClick && onCategoryClick(item.name)}
            >
              <div className="flex items-center gap-1.5 truncate mr-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-white truncate">{item.name}</span>
              </div>
              <span className="text-slate-400 shrink-0">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CategoryChart;
