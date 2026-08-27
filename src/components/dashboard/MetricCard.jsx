import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/currency';

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  comparisonText,
  comparisonType = 'neutral', // 'positive' | 'negative' | 'neutral'
  color = 'cyan', // 'cyan' | 'violet' | 'emerald' | 'rose' | 'amber' | 'indigo'
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

  const colorSchemes = {
    cyan: {
      text: 'text-brand-cyan',
      border: 'border-brand-cyan/15 hover:border-brand-cyan/30',
      bg: 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20',
      glow: 'bg-brand-cyan/5'
    },
    violet: {
      text: 'text-brand-violet',
      border: 'border-brand-violet/15 hover:border-brand-violet/30',
      bg: 'bg-brand-violet/10 text-brand-violet border-brand-violet/20',
      glow: 'bg-brand-violet/5'
    },
    emerald: {
      text: 'text-brand-emerald',
      border: 'border-brand-emerald/15 hover:border-brand-emerald/30',
      bg: 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20',
      glow: 'bg-brand-emerald/5'
    },
    rose: {
      text: 'text-brand-rose',
      border: 'border-brand-rose/15 hover:border-brand-rose/30',
      bg: 'bg-brand-rose/10 text-brand-rose border-brand-rose/20',
      glow: 'bg-brand-rose/5'
    },
    amber: {
      text: 'text-amber-400',
      border: 'border-amber-400/15 hover:border-amber-400/30',
      bg: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
      glow: 'bg-amber-400/5'
    },
    indigo: {
      text: 'text-indigo-400',
      border: 'border-indigo-400/15 hover:border-indigo-400/30',
      bg: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
      glow: 'bg-indigo-400/5'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.cyan;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015 }}
      className={`glass-card glass-card-hover rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${scheme.border} ${className}`}
    >
      {/* Soft Glow Ambient light */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl pointer-events-none ${scheme.glow}`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${scheme.bg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-xl sm:text-2xl font-black text-white leading-none tracking-tight mb-2">
          {formatCurrency(displayValue)}
        </h3>
        {comparisonText && (
          <p className={`text-[10px] font-bold ${scheme.text}`}>
            {comparisonText}
          </p>
        )}
      </div>
    </motion.div>
  );
};
export default MetricCard;
