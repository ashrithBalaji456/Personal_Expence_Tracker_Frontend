import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CreditCard, PieChart, History, User, LogOut, Plus, Wallet, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const MobileMenu = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'Expenses', icon: CreditCard },
    { to: '/analytics', label: 'Analytics', icon: PieChart },
    { to: '/history', label: 'History', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 left-0 w-64 bg-[#151C2C] border-r border-white/10 z-50 p-6 flex flex-col justify-between md:hidden shadow-2xl"
          >
            <div className="space-y-8">
              {/* Logo & Close */}
              <div className="flex justify-between items-center">
                <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-cyan to-brand-blue flex items-center justify-center">
                    <Wallet className="w-4.5 h-4.5 text-dark-bg" />
                  </div>
                  <div>
                    <h1 className="font-black text-white text-sm tracking-wide">ExpenseFlow</h1>
                    <span className="text-[9px] text-brand-cyan font-bold tracking-wider uppercase leading-none block">Finance Hub</span>
                  </div>
                </Link>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label="Close Mobile Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Add Button */}
              <Link
                to="/expenses/add"
                onClick={onClose}
                className="btn-premium btn-cyan w-full rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-glow-cyan"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </Link>

              {/* Links list */}
              <nav className="flex flex-col gap-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-brand-violet/20 to-indigo-500/10 text-white border border-brand-violet/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`
                      }
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      {link.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Footer Profile & Logout */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-xs font-black text-brand-violet select-none">
                  {user?.username?.substring(0, 2).toUpperCase() || 'US'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-white text-xs font-bold truncate leading-none mb-1">{user?.username || 'User'}</p>
                  <span className="text-[9px] text-slate-400 leading-none">Standard User</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5 shrink-0" />
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default MobileMenu;
