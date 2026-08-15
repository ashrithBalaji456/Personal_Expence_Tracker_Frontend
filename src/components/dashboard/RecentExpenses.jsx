import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { CATEGORY_DETAILS } from '../../utils/constants';
import { formatCurrency } from '../../utils/currency';
import { formatDateFriendly } from '../../utils/date';

export const RecentExpenses = ({ expenses = [], loading = false }) => {
  const navigate = useNavigate();

  const getIcon = (category) => {
    const iconName = CATEGORY_DETAILS[category]?.icon;
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <LucideIcons.HelpCircle className="w-4 h-4" />;
  };

  const getCategoryClass = (category) => {
    return CATEGORY_DETAILS[category]?.textClass || 'text-slate-400';
  };

  const getCategoryBg = (category) => {
    return CATEGORY_DETAILS[category]?.bgClass || 'bg-slate-800/10';
  };

  const getCategoryBorder = (category) => {
    return CATEGORY_DETAILS[category]?.borderClass || 'border-slate-800/20';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-14 bg-slate-800/20 border border-white/5 rounded-2xl animate-pulse animate-pulse-slow" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-slate-700/60 rounded-2xl">
        <p className="text-slate-400 text-xs italic">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {expenses.map((exp) => (
        <div
          key={exp.id}
          onClick={() => navigate(`/expenses/${exp.id}/edit`)}
          className="glass-card glass-card-hover rounded-2xl p-3.5 border border-white/5 cursor-pointer flex items-center justify-between transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${getCategoryBg(exp.category)} ${getCategoryBorder(exp.category)} border flex items-center justify-center ${getCategoryClass(exp.category)} shadow-sm`}>
              {getIcon(exp.category)}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight truncate max-w-[120px] sm:max-w-xs">{exp.title}</h4>
              <span className="text-[10px] text-slate-400 leading-none">{formatDateFriendly(exp.expenseDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBg(exp.category)} ${getCategoryBorder(exp.category)} ${getCategoryClass(exp.category)}`}>
              {CATEGORY_DETAILS[exp.category]?.label || exp.category}
            </span>
            <span className="text-xs font-black text-white">{formatCurrency(exp.amount)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default RecentExpenses;
