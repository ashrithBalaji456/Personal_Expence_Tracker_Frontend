import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, ArrowUpDown, Edit3, Trash2, CalendarDays, ChevronDown } from 'lucide-react';
import trackerApi from '../api/trackerApi';
import { CATEGORIES, CATEGORY_DETAILS } from '../utils/constants';
import { formatCurrency } from '../utils/currency';
import { formatDateFriendly, formatInputDate } from '../utils/date';
import toast from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Select from '../components/ui/Select';
import DatePicker from '../components/ui/DatePicker';

export const Expenses = () => {
  const navigate = useNavigate();

  const categoryOptions = [
    { value: 'ALL', label: 'All Categories' },
    ...CATEGORIES.map((cat) => ({ value: cat, label: CATEGORY_DETAILS[cat]?.label || cat }))
  ];

  const dateOptions = [
    { value: 'ALL', label: 'All Dates' },
    { value: 'TODAY', label: 'Today' },
    { value: 'YESTERDAY', label: 'Yesterday' },
    { value: 'CUSTOM', label: 'Custom Range' }
  ];

  const sortOptions = [
    { value: 'NEWEST', label: 'Newest First' },
    { value: 'OLDEST', label: 'Oldest First' },
    { value: 'HIGHEST', label: 'Highest Amount' },
    { value: 'LOWEST', label: 'Lowest Amount' }
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState(categoryParam || 'ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'YESTERDAY' | 'CUSTOM'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST'); // 'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST'

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      let data = [];

      // Determine backend endpoint call based on filters
      if (categoryFilter !== 'ALL') {
        data = await trackerApi.getExpensesByCategory(categoryFilter);
      } else if (dateFilter === 'TODAY') {
        data = await trackerApi.getExpensesByDate(formatInputDate(new Date()));
      } else if (dateFilter === 'YESTERDAY') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        data = await trackerApi.getExpensesByDate(formatInputDate(yesterday));
      } else if (dateFilter === 'CUSTOM' && customStartDate && customEndDate) {
        data = await trackerApi.getExpensesInRange(customStartDate, customEndDate);
      } else {
        data = await trackerApi.getAllExpenses();
      }

      setExpenses(data);
    } catch (err) {
      toast.error('Failed to load expenses list.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, dateFilter, customStartDate, customEndDate]);

  useEffect(() => {
    // Synchronize category selection from URL query parameters if present
    if (categoryParam) {
      setCategoryFilter(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleDeleteExpense = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await trackerApi.deleteExpense(id);
        toast.success('Expense deleted successfully.');
        loadExpenses();
      } catch (err) {
        toast.error('Failed to delete expense.');
      }
    }
  };

  // Client-side text search & sorting
  const filteredAndSortedExpenses = expenses
    .filter((exp) => {
      if (!searchQuery.trim()) return true;
      return exp.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') {
        // Date Desc, Created Desc
        const dateDiff = new Date(b.expenseDate) - new Date(a.expenseDate);
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'OLDEST') {
        // Date Asc, Created Asc
        const dateDiff = new Date(a.expenseDate) - new Date(b.expenseDate);
        if (dateDiff !== 0) return dateDiff;
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'HIGHEST') {
        return b.amount - a.amount;
      }
      if (sortBy === 'LOWEST') {
        return a.amount - b.amount;
      }
      return 0;
    });

  const getCategoryDetails = (cat) => {
    return CATEGORY_DETAILS[cat] || { label: cat, textClass: 'text-slate-400', bgClass: 'bg-slate-800/10', borderClass: 'border-slate-800/20' };
  };

  const handleResetFilters = () => {
    setCategoryFilter('ALL');
    setDateFilter('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');
    setSortBy('NEWEST');
    setSearchParams({});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">Expenses</h2>
          <p className="text-xs text-slate-400 mt-1">Track where your money goes.</p>
        </div>
        <Link
          to="/expenses/add"
          className="btn-premium btn-cyan rounded-xl px-5 py-3 text-xs font-black flex items-center justify-center gap-2 self-start sm:self-auto shadow-glow-cyan"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </Link>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-card rounded-3xl p-5 border border-white/5 space-y-4 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <Select
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val);
              setSearchParams(val === 'ALL' ? {} : { category: val });
            }}
            options={categoryOptions}
            icon={Filter}
          />

          {/* Date Options */}
          <Select
            value={dateFilter}
            onChange={(val) => setDateFilter(val)}
            options={dateOptions}
            icon={CalendarDays}
          />

          {/* Sort Option */}
          <Select
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={sortOptions}
            icon={ArrowUpDown}
          />
        </div>

        {/* Custom Date Range picker inputs */}
        {dateFilter === 'CUSTOM' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-white/5 text-xs"
          >
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-400 font-semibold shrink-0">From</span>
              <DatePicker
                value={customStartDate}
                onChange={(val) => setCustomStartDate(val)}
                placeholder="Start Date"
                className="w-full sm:max-w-[160px]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-400 font-semibold shrink-0">To</span>
              <DatePicker
                value={customEndDate}
                onChange={(val) => setCustomEndDate(val)}
                placeholder="End Date"
                className="w-full sm:max-w-[160px]"
              />
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-brand-violet hover:underline sm:ml-auto"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Main Expense Content Area */}
      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredAndSortedExpenses.length === 0 ? (
        <EmptyState
          title="No Expenses Logged"
          description={
            searchQuery.trim() || categoryFilter !== 'ALL' || dateFilter !== 'ALL'
              ? 'No transaction records match your active search filter settings.'
              : 'Keep track of daily expenditures by logging your first transaction.'
          }
          actionLabel={
            searchQuery.trim() || categoryFilter !== 'ALL' || dateFilter !== 'ALL' ? 'Clear Filters' : 'Add Expense'
          }
          onAction={
            searchQuery.trim() || categoryFilter !== 'ALL' || dateFilter !== 'ALL'
              ? handleResetFilters
              : () => navigate('/expenses/add')
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block glass-card rounded-3xl border border-white/5 overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredAndSortedExpenses.map((exp) => {
                  const details = getCategoryDetails(exp.category);
                  return (
                    <tr
                      key={exp.id}
                      onClick={() => navigate(`/expenses/${exp.id}/edit`)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-400">
                        {formatDateFriendly(exp.expenseDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white leading-tight">{exp.title}</div>
                        {exp.notes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${details.bgClass} ${details.borderClass} ${details.textClass}`}>
                          {details.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-white">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/expenses/${exp.id}/edit`);
                            }}
                            className="p-1.5 bg-white/5 hover:bg-brand-cyan/20 border border-white/5 hover:border-brand-cyan/20 rounded-lg text-slate-400 hover:text-brand-cyan transition-all"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteExpense(exp.id, e)}
                            className="p-1.5 bg-white/5 hover:bg-brand-rose/20 border border-white/5 hover:border-brand-rose/20 rounded-lg text-slate-400 hover:text-brand-rose transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card-Based View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredAndSortedExpenses.map((exp) => {
              const details = getCategoryDetails(exp.category);
              return (
                <div
                  key={exp.id}
                  onClick={() => navigate(`/expenses/${exp.id}/edit`)}
                  className="glass-card rounded-2xl p-4 border border-white/5 flex items-center justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400">
                      {formatDateFriendly(exp.expenseDate)}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight">{exp.title}</h4>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${details.bgClass} ${details.borderClass} ${details.textClass}`}>
                      {details.label}
                    </span>
                  </div>
                  <div className="text-right space-y-2">
                    <span className="text-xs font-black text-white block">
                      {formatCurrency(exp.amount)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/expenses/${exp.id}/edit`);
                        }}
                        className="p-1.5 bg-white/5 rounded-lg text-slate-400"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteExpense(exp.id, e)}
                        className="p-1.5 bg-white/5 rounded-lg text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
export default Expenses;
