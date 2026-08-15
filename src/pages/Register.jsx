import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Wallet, UserPlus, Sparkles } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import toast from '../components/ui/Toast';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'None', width: 'w-0', color: 'bg-slate-700' };
    if (pwd.length < 6) return { label: 'Weak', width: 'w-1/3', color: 'bg-brand-rose' };
    const hasAlphaNum = /[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    
    if (pwd.length >= 8 && hasAlphaNum && hasSpecial) {
      return { label: 'Strong', width: 'w-full', color: 'bg-brand-emerald' };
    }
    if (pwd.length >= 6 && hasAlphaNum) {
      return { label: 'Good', width: 'w-2/3', color: 'bg-brand-amber' };
    }
    return { label: 'Weak', width: 'w-1/3', color: 'bg-brand-rose' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      toast.success('Registration successful! Welcome to ExpenseFlow.');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || 'Failed to register account.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative gradient blur blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-violet/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center gap-2 mb-2">
            <span className="px-3 py-1 text-[10px] font-semibold rounded-full bg-gradient-to-r from-brand-violet/20 to-indigo-500/20 text-brand-violet border border-brand-violet/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Start For Free
            </span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            <Wallet className="w-6 h-6 text-brand-violet" />
            ExpenseFlow
          </h2>
          <p className="text-xs text-slate-400 mt-1">Create an account to start tracking daily expenses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
            <input
              type="text"
              placeholder="Pick a unique username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="e.g. ashri@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input rounded-xl pl-4 pr-12 py-2.5 text-xs font-semibold focus:outline-none"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  <span>Strength</span>
                  <span className={
                    strength.label === 'Weak' ? 'text-brand-rose' : strength.label === 'Good' ? 'text-brand-amber' : 'text-brand-emerald'
                  }>{strength.label}</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-premium btn-violet w-full rounded-xl py-3 text-xs font-black flex items-center justify-center gap-2 mt-2 shadow-glow-violet"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-violet hover:underline font-bold">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default Register;
