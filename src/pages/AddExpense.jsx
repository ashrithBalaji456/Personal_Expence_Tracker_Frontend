import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import trackerApi from '../api/trackerApi';
import { CATEGORIES, CATEGORY_DETAILS } from '../utils/constants';
import { formatInputDate } from '../utils/date';
import toast from '../components/ui/Toast';
import DatePicker from '../components/ui/DatePicker';

export const AddExpense = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [expenseDate, setExpenseDate] = useState(formatInputDate(new Date()));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Expense title is required.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Amount must be greater than zero.');
      return;
    }
    if (!category) {
      toast.error('Please select a category.');
      return;
    }
    if (!expenseDate) {
      toast.error('Please select a date.');
      return;
    }

    setLoading(true);
    try {
      await trackerApi.createExpense({
        title: title.trim(),
        amount: numAmount,
        category,
        expenseDate,
        notes: notes.trim() || null
      });
      toast.success('Expense logged successfully!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || 'Failed to log expense.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-white leading-tight">Add New Expense</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Record a daily cash transaction</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              What did you spend on?
            </label>
            <input
              type="text"
              placeholder="e.g. Starbucks, Taxi ride, Grocery shopping"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => {
                const details = CATEGORY_DETAILS[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    disabled={loading}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative ${
                      isSelected
                        ? `${details.bgClass} ${details.borderClass} border-opacity-100 ring-1 ${
                            cat === 'FOOD'
                              ? 'ring-brand-cyan'
                              : cat === 'TRAVEL'
                              ? 'ring-brand-rose'
                              : 'ring-brand-violet'
                          }`
                        : 'bg-white/5 border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className="text-lg">{details.emoji}</span>
                    <span className="text-[10px] font-bold text-white">{details.label}</span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center border border-white/10">
                        <Check className="w-2.5 h-2.5 text-brand-emerald" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Expense Date
            </label>
            <DatePicker
              value={expenseDate}
              onChange={(val) => setExpenseDate(val)}
              placeholder="Pick expense date"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Notes / Description (Optional)
            </label>
            <textarea
              placeholder="e.g. dinner with colleagues, booked via Uber, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none resize-none"
              disabled={loading}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Link
              to="/dashboard"
              className="btn-premium btn-secondary flex-1 rounded-xl py-3 text-xs font-bold text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-premium btn-cyan flex-1 rounded-xl py-3 text-xs font-black flex items-center justify-center gap-2 shadow-glow-cyan"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
export default AddExpense;
