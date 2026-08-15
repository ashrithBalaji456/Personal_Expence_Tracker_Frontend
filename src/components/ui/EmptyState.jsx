import React from 'react';
import { Plus } from 'lucide-react';

export const EmptyState = ({
  icon = '💸',
  title = 'No data available',
  description = 'There are no records to display here.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`glass-card rounded-3xl p-8 border border-white/10 flex flex-col items-center justify-center text-center max-w-md mx-auto ${className}`}>
      <span className="text-5xl mb-4 filter drop-shadow-md select-none">{icon}</span>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-xs leading-relaxed mb-6 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-premium btn-cyan rounded-xl px-5 py-2.5 text-xs font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
export default EmptyState;
