import React from 'react';
import { Menu, Wallet, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Header = ({ onMenuToggle }) => {
  const { user } = useAuth();
  
  const formatDate = () => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date());
  };

  return (
    <header className="bg-[#151C2C]/50 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Toggle Mobile Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Mobile Logo stub */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-cyan to-brand-blue flex items-center justify-center">
            <Wallet className="w-4.5 h-4.5 text-dark-bg" />
          </div>
          <span className="font-black text-white text-sm">ExpenseFlow</span>
        </div>
        
        {/* Desktop Calendar Info */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-semibold bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">
          <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
          <span>{formatDate()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-white text-xs font-bold leading-none mb-1">Hi, {user?.username || 'User'} 👋</p>
          <span className="text-[9px] text-brand-cyan font-bold tracking-wide">DAILY EXPENSES</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-xs font-black text-brand-cyan select-none">
          {user?.username?.substring(0, 2).toUpperCase() || 'US'}
        </div>
      </div>
    </header>
  );
};
export default Header;
