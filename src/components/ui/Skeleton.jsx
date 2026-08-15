import React from 'react';

export const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseClasses = 'bg-slate-800/40 animate-pulse';
  
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circle: 'rounded-full',
    rect: 'rounded-xl',
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
};

export const CardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="w-1/3 h-5" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
      <Skeleton variant="text" className="w-2/3 h-8" />
      <Skeleton variant="text" className="w-1/2 h-4" />
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5 space-x-4">
      <Skeleton variant="text" className="w-16 h-4" />
      <Skeleton variant="text" className="w-32 h-4" />
      <Skeleton variant="text" className="w-20 h-4" />
      <Skeleton variant="text" className="w-24 h-4" />
      <Skeleton variant="text" className="w-12 h-4" />
    </div>
  );
};
export default Skeleton;
