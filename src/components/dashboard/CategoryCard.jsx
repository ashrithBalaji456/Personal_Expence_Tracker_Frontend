import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_DETAILS } from '../../utils/constants';
import { formatCurrency } from '../../utils/currency';
import * as LucideIcons from 'lucide-react';
import trackerApi from '../../api/trackerApi';

export const CategoryCard = ({ category, amount, percentage, onClick }) => {
  const [catConfig, setCatConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const cats = await trackerApi.getBudgetCategories();
        const found = cats.find(c => c.name === category || c.name.toUpperCase() === category.toUpperCase());
        if (found) {
          setCatConfig(found);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchConfig();
  }, [category]);

  const label = catConfig ? catConfig.name : (CATEGORY_DETAILS[category]?.label || category);
  const color = catConfig ? catConfig.color : (CATEGORY_DETAILS[category]?.color || '#64748B');
  const iconName = catConfig ? catConfig.icon : (CATEGORY_DETAILS[category]?.icon || 'Wallet');
  const Icon = LucideIcons[iconName] || LucideIcons.Wallet;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={onClick}
      className="glass-card glass-card-hover rounded-2xl p-4 border border-white/5 cursor-pointer flex flex-col justify-between"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg border flex items-center justify-center"
            style={{ backgroundColor: `${color}22`, borderColor: `${color}33` }}
          >
            <Icon className="w-4 h-4" style={{ color: color }} />
          </div>
          <span className="text-xs font-bold text-white">{label}</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400">{percentage.toFixed(1)}%</span>
      </div>

      <div>
        <h4 className="text-base font-black text-white mb-2">{formatCurrency(amount)}</h4>
        
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-800/60 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </motion.div>
  );
};
export default CategoryCard;
