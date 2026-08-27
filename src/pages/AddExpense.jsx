import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, Check, Home, ShoppingCart, Lightbulb, Shield, 
  TrendingUp, Coins, Heart, PiggyBank, Train, Wallet, HelpCircle 
} from 'lucide-react';
import trackerApi from '../api/trackerApi';
import { formatInputDate } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import toast from '../components/ui/Toast';
import DatePicker from '../components/ui/DatePicker';

const ICON_MAP = {
  Home,
  ShoppingCart,
  Lightbulb,
  Shield,
  TrendingUp,
  Coins,
  Heart,
  PiggyBank,
  Train,
  Wallet
};

export const AddExpense = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [expenseDate, setExpenseDate] = useState(formatInputDate(new Date()));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expenseDate) return;
    const parts = expenseDate.split('-');
    if (parts.length < 2) return;
    const targetMonth = `${parts[0]}-${parts[1]}`;

    const fetchIncome = async () => {
      try {
        const res = await trackerApi.getMonthlyIncome(targetMonth);
        setMonthlyIncome(res.amount || 0);
      } catch (err) {
        setMonthlyIncome(0);
      }
    };
    fetchIncome();
  }, [expenseDate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await trackerApi.getBudgetCategories();
        setCategoriesList(data);
        if (data.length > 0) {
          setCategory(data[0].name);
        }
      } catch (err) {
        setCategoriesList([
          { name: 'Rent', color: '#EC4899' },
          { name: 'Groceries', color: '#10B981' },
          { name: 'Electricity + Wi-Fi', color: '#F59E0B' },
          { name: 'Term Insurance', color: '#EF4444' },
          { name: 'SIP Investment', color: '#8B5CF6' },
          { name: 'Gold Saving', color: '#EAB308' },
          { name: 'Parents Support', color: '#6366F1' },
          { name: 'FD/Emergency', color: '#14B8A6' },
          { name: 'Travel & Commute', color: '#3B82F6' },
          { name: 'Other Expenses', color: '#64748B' }
        ]);
        setCategory('Rent');
      }
    };
    fetchCategories();
  }, []);

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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
              {categoriesList.map((cat) => {
                const isSelected = category === cat.name;
                const IconComponent = ICON_MAP[cat.icon];
                return (
                  <button
                    key={cat.id || cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    disabled={loading}
                    className="p-3 rounded-xl border flex flex-col items-center justify-center gap-2.5 transition-all duration-300 relative text-center min-h-[96px]"
                    style={{
                      backgroundColor: isSelected ? `${cat.color}22` : 'rgba(255,255,255,0.05)',
                      borderColor: isSelected ? cat.color : 'rgba(255,255,255,0.05)',
                      opacity: isSelected ? 1 : 0.7
                    }}
                  >
                    {IconComponent ? (
                      <motion.div 
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="w-8 h-8 rounded-full flex items-center justify-center border"
                        style={{ 
                          backgroundColor: isSelected ? `${cat.color}22` : 'rgba(255,255,255,0.05)',
                          borderColor: isSelected ? cat.color : 'rgba(255,255,255,0.1)',
                          color: cat.color 
                        }}
                      >
                        <IconComponent className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center border-2"
                        style={{ 
                          backgroundColor: `${cat.color}22`,
                          borderColor: cat.color
                        }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      </div>
                    )}
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-white truncate max-w-full">{cat.name}</span>
                      <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                        {monthlyIncome > 0 
                          ? `Limit: ${formatCurrency((monthlyIncome * parseFloat(cat.percentage)) / 100)}` 
                          : `${cat.percentage}% allocation`
                        }
                      </span>
                    </div>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#151C2C] flex items-center justify-center border border-white/10">
                        <Check className="w-2.5 h-2.5 text-brand-cyan" />
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
