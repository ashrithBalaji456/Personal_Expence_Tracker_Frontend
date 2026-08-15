import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Mail, LogOut, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Profile = () => {
  const { user, logout } = useAuth();
  
  // Clean fallback details
  const email = user?.username ? `${user.username.toLowerCase()}@expenseflow.io` : 'user@expenseflow.io';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto space-y-6"
    >
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">User Account</h2>
        <p className="text-xs text-slate-400 mt-1">Manage credentials and profile details.</p>
      </div>

      {/* Profile Info Card */}
      <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden space-y-6">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-violet/5 rounded-full blur-2xl pointer-events-none" />

        {/* Profile Avatar Header */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="w-16 h-16 rounded-full bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-xl font-black text-brand-violet select-none">
            {user?.username?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div>
            <h3 className="text-base font-black text-white leading-tight">{user?.username || 'User'}</h3>
            <span className="text-[10px] text-brand-cyan font-bold tracking-wider uppercase leading-none block mt-1.5">
              Standard Membership
            </span>
          </div>
        </div>

        {/* Profile Details List */}
        <div className="space-y-4 text-xs font-semibold">
          <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
            <span className="text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-cyan" />
              Username
            </span>
            <span className="text-white font-bold">{user?.username || 'user'}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
            <span className="text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-cyan" />
              Email Address
            </span>
            <span className="text-white font-bold">{email}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
            <span className="text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-cyan" />
              Security Role
            </span>
            <span className="text-slate-400 font-bold flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-brand-cyan animate-pulse" />
              Regular Member
            </span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={logout}
          className="btn-premium btn-danger rounded-xl py-3 text-xs font-black flex items-center justify-center gap-2 w-full shadow-md"
        >
          <LogOut className="w-4 h-4" />
          Logout from Account
        </button>
      </div>
    </motion.div>
  );
};
export default Profile;
