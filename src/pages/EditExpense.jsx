import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Check, AlertTriangle } from 'lucide-react';
import trackerApi from '../api/trackerApi';
import { CATEGORIES, CATEGORY_DETAILS } from '../utils/constants';
import { formatInputDate } from '../utils/date';
import toast from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DatePicker from '../components/ui/DatePicker';

export const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [expenseDate, setExpenseDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const data = await trackerApi.getExpenseById(id);
      setTitle(data.title);
      setAmount(data.amount.toString());
      setCategory(data.category);
      setExpenseDate(formatInputDate(data.expenseDate));
      setNotes(data.notes || '');
    } catch (err) {
      toast.error('Failed to load expense details.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpense();
  }, [id]);

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

    setSaving(true);
    try {
      await trackerApi.updateExpense(id, {
        title: title.trim(),
        amount: numAmount,
        category,
        expenseDate,
        notes: notes.trim() || null
      });
      toast.success('Expense updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await trackerApi.deleteExpense(id);
      toast.success('Expense deleted successfully.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to delete expense.');
      setShowConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto space-y-6 relative"
    >
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </Link>
        <div>
          <h2 className="text-xl font-black text-white leading-tight">Edit Expense</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Modify or remove expense record</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Expense Name
            </label>
            <input
              type="text"
              placeholder="Starbucks, Taxi, Dinner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none"
              required
              disabled={saving}
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
              disabled={saving}
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
                    disabled={saving}
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
              placeholder="Expense details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none resize-none"
              disabled={saving}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              disabled={saving}
              className="btn-premium btn-danger rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-2 order-2 sm:order-none"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <div className="flex-1 flex gap-3">
              <Link
                to="/dashboard"
                className="btn-premium btn-secondary flex-1 rounded-xl py-3 text-xs font-bold text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn-premium btn-cyan flex-1 rounded-xl py-3 text-xs font-black flex items-center justify-center gap-2 shadow-glow-cyan"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmDelete(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            {/* Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass-modal rounded-3xl p-6 border border-white/10 relative z-10 space-y-6 text-center shadow-2xl"
            >
              <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-rose/10 border border-brand-rose/20 flex items-center justify-center text-brand-rose">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-white">Delete Transaction?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to delete this expense record? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={deleting}
                  className="btn-premium btn-secondary flex-1 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-premium btn-danger flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-brand-rose border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default EditExpense;
