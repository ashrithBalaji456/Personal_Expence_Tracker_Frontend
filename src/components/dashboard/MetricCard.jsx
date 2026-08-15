import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/currency';

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  comparisonText,
  comparisonType = 'neutral', // 'positive' | 'negative' | 'neutral'
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(end) || end <= 0) {
      setDisplayValue(0);
      return;
    }
    
    const duration = 800; // ms
    const startTime = performance.now();
    
    const animateCount = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeOutQuad
      const easedProgress = progress * (2 - progress);
      const current = start + easedProgress * (end - start);
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setDisplayValue(end);
      }
    };
    
    requestAnimationFrame(animateCount);
  }, [value]);

  const getComparisonColor = () => {
    if (comparisonType === 'positive') return 'text-brand-emerald';
    if (comparisonType === 'negative') return 'text-brand-rose';
    return 'text-slate-400';
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015 }}
      className={`glass-card glass-card-hover rounded-2xl p-5 border border-white/5 relative overflow-hidden flex flex-col justify-between ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl sm:text-2xl font-black text-white leading-none tracking-tight mb-2">
          {formatCurrency(displayValue)}
        </h3>
        {comparisonText && (
          <p className={`text-[10px] font-semibold ${getComparisonColor()}`}>
            {comparisonText}
          </p>
        )}
      </div>
    </motion.div>
  );
};
export default MetricCard;
