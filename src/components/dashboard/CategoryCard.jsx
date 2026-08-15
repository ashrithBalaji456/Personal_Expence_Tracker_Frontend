import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_DETAILS } from '../../utils/constants';
import { formatCurrency } from '../../utils/currency';
import * as LucideIcons from 'lucide-react';

export const CategoryCard = ({ category, amount, percentage, onClick }) => {
  const details = CATEGORY_DETAILS[category];
  if (!details) return null;

  // Resolve Lucide React icon dynamically
  const Icon = LucideIcons[details.icon] || LucideIcons.HelpCircle;

  // Dynamically resolve Tailwind background color class from text color class
  const getProgressBgClass = (textClass) => {
    if (textClass.includes('text-brand-violet')) return 'bg-brand-violet';
    if (textClass.includes('text-brand-cyan')) return 'bg-brand-cyan';
    if (textClass.includes('text-brand-rose')) return 'bg-brand-rose';
    return 'bg-slate-500';
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={onClick}
      className="glass-card glass-card-hover rounded-2xl p-4 border border-white/5 cursor-pointer flex flex-col justify-between"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${details.bgClass} ${details.borderClass} border flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${details.textClass}`} />
          </div>
          <span className="text-xs font-bold text-white">{details.label}</span>
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
            className={`h-full ${getProgressBgClass(details.textClass)}`}
          />
        </div>
      </div>
    </motion.div>
  );
};
export default CategoryCard;
