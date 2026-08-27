import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, DollarSign, Plus, Trash2, Edit3, Check, X, RotateCcw, 
  Info, Sparkles, Home, ShoppingCart, Lightbulb, Shield, TrendingUp, 
  Coins, Heart, PiggyBank, Train, Wallet, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import trackerApi from '../api/trackerApi';
import { formatCurrency } from '../utils/currency';
import toast from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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

export const Budget = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  });

  const [income, setIncome] = useState(0);
  const [incomeInput, setIncomeInput] = useState('');
  const [isEditingIncome, setIsEditingIncome] = useState(false);

  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Add / Edit Category State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatPercentage, setNewCatPercentage] = useState('');
  const [newCatColor, setNewCatColor] = useState('#EC4899');
  const [newCatIcon, setNewCatIcon] = useState('Wallet');

  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatPercentage, setEditCatPercentage] = useState('');
  const [editCatColor, setEditCatColor] = useState('');
  const [editCatIcon, setEditCatIcon] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Income
      const incomeData = await trackerApi.getMonthlyIncome(selectedMonth);
      setIncome(incomeData.amount || 0);
      setIncomeInput(String(incomeData.amount || 0));

      // 2. Fetch Categories
      const categoriesData = await trackerApi.getBudgetCategories();
      setCategories(categoriesData);

      // 3. Fetch Rollover Summary
      const summaryData = await trackerApi.getBudgetSummary(selectedMonth);
      setSummary(summaryData);
    } catch (err) {
      toast.error('Failed to load budget parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, [selectedMonth]);

  const handleUpdateIncome = async (e) => {
    e.preventDefault();
    const amount = parseFloat(incomeInput);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid positive income amount.');
      return;
    }
    try {
      await trackerApi.setMonthlyIncome({ amount, month: selectedMonth });
      setIncome(amount);
      setIsEditingIncome(false);
      toast.success('Monthly income updated successfully.');
      const summaryData = await trackerApi.getBudgetSummary(selectedMonth);
      setSummary(summaryData);
    } catch (err) {
      toast.error('Failed to save monthly income.');
    }
  };

  const totalPercentage = categories.reduce((sum, c) => sum + parseFloat(c.percentage), 0);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Category name is required.');
      return;
    }
    const percent = parseFloat(newCatPercentage);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      toast.error('Please enter a valid percentage between 0 and 100.');
      return;
    }
    if (totalPercentage + percent > 100) {
      toast.error(`Total percentage cannot exceed 100%. Remaining capacity is ${(100 - totalPercentage).toFixed(1)}%.`);
      return;
    }
    try {
      await trackerApi.addBudgetCategory({
        name: newCatName.trim(),
        percentage: percent,
        color: newCatColor,
        icon: newCatIcon
      });
      toast.success('Category added successfully.');
      setShowAddForm(false);
      setNewCatName('');
      setNewCatPercentage('');
      fetchBudgetData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add custom category.');
    }
  };

  const handleSaveEditCategory = async (e, id) => {
    e.preventDefault();
    if (!editCatName.trim()) {
      toast.error('Category name is required.');
      return;
    }
    const percent = parseFloat(editCatPercentage);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      toast.error('Please enter a valid percentage between 0 and 100.');
      return;
    }
    const oldPercent = parseFloat(categories.find(c => c.id === id)?.percentage || 0);
    if (totalPercentage - oldPercent + percent > 100) {
      toast.error(`Total percentage cannot exceed 100%. Remaining capacity is ${(100 - totalPercentage + oldPercent).toFixed(1)}%.`);
      return;
    }
    try {
      await trackerApi.updateBudgetCategory(id, {
        name: editCatName.trim(),
        percentage: percent,
        color: editCatColor,
        icon: editCatIcon
      });
      toast.success('Category updated successfully.');
      setEditingCatId(null);
      fetchBudgetData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category.');
    }
  };

  const handleDeleteCategory = (id) => {
    setConfirmModal({
      title: 'Delete Category?',
      message: 'Are you sure you want to delete this category? All expenses linked to this category will lose their budget parameters.',
      onConfirm: async () => {
        try {
          await trackerApi.deleteBudgetCategory(id);
          toast.success('Category deleted successfully.');
          fetchBudgetData();
        } catch (err) {
          toast.error('Failed to delete category.');
        }
      }
    });
  };

  const handleResetToDefaults = () => {
    setConfirmModal({
      title: 'Restore Default Categories?',
      message: 'This will delete all custom categories and restore the default 10 seeded category plan. Continue?',
      onConfirm: async () => {
        try {
          await trackerApi.resetBudgetCategories();
          toast.success('Reset categories to standard defaults.');
          fetchBudgetData();
        } catch (err) {
          toast.error('Failed to reset categories.');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );
  }

  // Prepping Chart Data
  const allocationPieData = categories.map(c => ({
    name: c.name,
    value: parseFloat(c.percentage),
    color: c.color
  }));

  const spentBarData = summary?.categories.map(c => ({
    name: c.categoryName,
    Allocated: parseFloat(c.allocatedAmount),
    Spent: parseFloat(c.actualSpent)
  })) || [];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 font-sans pb-24 relative overflow-hidden">
      {/* Decorative gradient blur blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-violet/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Upper Header Control Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-200 to-brand-cyan bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-brand-cyan animate-pulse" />
              Monthly Budget allocations
            </h1>
            <p className="text-sm text-slate-400">Configure income percentages and track carryover rollovers</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-400 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-brand-cyan" /> Select Month:
            </span>
            <input 
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#151C2C] border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-cyan font-bold transition-all"
            />
          </div>
        </div>

        {/* Section 1: Income and Allocation Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card A: Income Configuration */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between min-h-[180px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-brand-cyan" /> Monthly Salary Input
                </span>
                {!isEditingIncome && (
                  <button 
                    onClick={() => setIsEditingIncome(true)}
                    className="text-xs text-brand-cyan hover:underline font-bold"
                  >
                    Change
                  </button>
                )}
              </div>

              {isEditingIncome ? (
                <form onSubmit={handleUpdateIncome} className="flex gap-2 mt-3">
                  <input 
                    type="number"
                    value={incomeInput}
                    onChange={(e) => setIncomeInput(e.target.value)}
                    className="flex-1 bg-[#0B0F19] border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-cyan"
                    placeholder="Enter salary (e.g. 50000)"
                    min="0"
                  />
                  <button type="submit" className="bg-brand-cyan text-[#0B0F19] rounded-xl px-3 py-2 text-xs font-black flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Save
                  </button>
                  <button type="button" onClick={() => setIsEditingIncome(false)} className="bg-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs font-bold">
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="mt-3">
                  <h2 className="text-3xl font-black text-white">{formatCurrency(income)}</h2>
                  <p className="text-xs text-slate-400 mt-1">Allocated to envelopes dynamically by percentages</p>
                </div>
              )}
            </div>
          </div>

          {/* Card B: Total Allocations Capacity */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between min-h-[180px]">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                Allocations Budget Cap
              </span>
              <div className="mt-3">
                <h2 className={`text-3xl font-black ${totalPercentage === 100 ? 'text-brand-cyan' : 'text-amber-500'}`}>
                  {totalPercentage.toFixed(1)}%
                </h2>
                <div className="w-full bg-white/5 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${totalPercentage === 100 ? 'bg-brand-cyan' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <span className="text-xs text-slate-400 flex items-center gap-1 mt-2">
              <Info className="w-3.5 h-3.5 text-brand-cyan" />
              {totalPercentage === 100 ? 'Perfect! allocations total 100%.' : `Remaining target capacity is ${(100 - totalPercentage).toFixed(1)}%.`}
            </span>
          </div>

          {/* Card C: Total Actual Spent */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between min-h-[180px]">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                Overall Spent
              </span>
              <div className="mt-3">
                <h2 className="text-3xl font-black text-rose-500">
                  {formatCurrency(summary?.totalSpent || 0)}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Out of {formatCurrency(income)} total income
                </p>
              </div>
            </div>
            <span className={`text-xs font-bold mt-2 ${summary?.overallRemaining >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              Remaining Surplus: {formatCurrency(summary?.overallRemaining || 0)}
            </span>
          </div>
        </div>

        {/* Section 2: Visual Graphic Breakdowns */}
        {categories.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Allocation pie chart */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 min-h-[420px] flex flex-col justify-between">
              <h3 className="text-md font-bold mb-2 flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse" /> Target Allocation Percentages
              </h3>
              <div className="h-60 relative flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                      data={allocationPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {allocationPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      contentStyle={{ backgroundColor: '#151C2C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#E2E8F0' }}
                      labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Custom HTML Legend - Clean, wrapping, and highly readable */}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center shrink-0 p-1">
                {allocationPieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: entry.color }} 
                    />
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spent bar chart */}
            <div className="glass-card rounded-3xl p-6 border border-white/10 min-h-[420px] flex flex-col justify-between">
              <h3 className="text-md font-bold mb-4 flex items-center gap-2 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse" /> Allocated Budget vs Actual Spent
              </h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spentBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), '']}
                      contentStyle={{ backgroundColor: '#151C2C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#E2E8F0' }}
                      labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Bar dataKey="Allocated" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Spent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Rollover Balance Tracker (Category Envelopes) */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-white">Monthly Category Envelopes</h3>
              <p className="text-xs text-slate-400 mt-1">Including cumulative carryover balances from previous months</p>
            </div>
            <button 
              onClick={handleResetToDefaults}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restore Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary?.categories.map((c) => {
              const IconComponent = ICON_MAP[c.icon] || Wallet;
              const percentSpent = c.allocatedAmount > 0 ? (c.actualSpent / c.allocatedAmount) * 100 : 0;
              const isExpanded = expandedCategory === c.categoryId;

              return (
                <div 
                  key={c.categoryId}
                  className="bg-[#151C2C]/50 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/15"
                >
                  <div 
                    onClick={() => setExpandedCategory(isExpanded ? null : c.categoryId)}
                    className="p-5 cursor-pointer flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      {/* Top Row: Icon, Title, Rollover Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2.5 rounded-xl text-white flex items-center justify-center"
                            style={{ backgroundColor: `${c.color}22`, color: c.color }}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200">{c.categoryName}</h4>
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{c.percentage}% Allocation</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="text-right">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${c.status === 'surplus' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                            {c.status === 'surplus' ? 'Surplus' : 'Exceeded'}
                          </span>
                        </div>
                      </div>

                      {/* Middle row: Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                          <span>Spent: {formatCurrency(c.actualSpent)}</span>
                          <span>Budget: {formatCurrency(c.allocatedAmount)}</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(percentSpent, 100)}%`, 
                              backgroundColor: percentSpent > 100 ? '#EF4444' : c.color 
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: Rollover Carryovers & remaining */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-[11px] text-slate-400">
                      <div>
                        {c.previousCarryover !== 0 && (
                          <span className="mr-2">
                            Carryover: <strong className={c.previousCarryover >= 0 ? 'text-emerald-500' : 'text-rose-500'}>{formatCurrency(c.previousCarryover)}</strong>
                          </span>
                        )}
                      </div>
                      <div className="font-bold">
                        {c.status === 'surplus' ? (
                          <span className="text-emerald-500">Still have: {formatCurrency(c.amountRemaining)}</span>
                        ) : (
                          <span className="text-rose-500">Exceeded by: {formatCurrency(c.amountExceeded)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center mt-2">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>

                  {/* Expanded Transaction History */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="border-t border-white/5 bg-[#0B0F19]/40 overflow-hidden"
                      >
                        <div className="p-4 space-y-3">
                          <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">History Log for this Month</h5>
                          {c.history.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2">No transactions logged in this category for this month.</p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                              {c.history.map(item => (
                                <div key={item.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/5 border border-white/5">
                                  <div>
                                    <p className="font-bold text-slate-200">{item.title}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{item.expenseDate}</p>
                                  </div>
                                  <span className="font-bold text-slate-200">{formatCurrency(item.amount)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Budget Percentages Settings (Add / Update allocations) */}
        <div className="glass-card rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-white">Allocation settings</h3>
              <p className="text-xs text-slate-400 mt-1">Reassign target percentages and adjust category themes</p>
            </div>
            {!showAddForm && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-brand-cyan hover:bg-brand-cyan-dark text-[#0B0F19] font-black rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            )}
          </div>

          {/* Real-time Percentage Warnings & Advice Banner */}
          {totalPercentage !== 100 && (
            <div className={`mb-6 p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
              totalPercentage > 100 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
            }`}>
              <AlertCircle className={`w-5 h-5 shrink-0 ${totalPercentage > 100 ? 'text-rose-500' : 'text-amber-500'}`} />
              <div>
                <p className="font-bold mb-1">
                  {totalPercentage > 100 
                    ? `Allocation exceeded by ${(totalPercentage - 100).toFixed(1)}%` 
                    : `Allocation is less than 100% (currently ${totalPercentage.toFixed(1)}%)`
                  }
                </p>
                <p className="opacity-95">
                  {totalPercentage > 100 
                    ? `Your current allocation totals ${totalPercentage.toFixed(1)}%. Please reduce some categories' percentages by a total of ${(totalPercentage - 100).toFixed(1)}% to ensure it sums to exactly 100%.` 
                    : `You have ${(100 - totalPercentage).toFixed(1)}% unallocated. Please increase existing categories or add a new category with a target of ${(100 - totalPercentage).toFixed(1)}% to make it exactly 100%.`
                  }
                </p>
              </div>
            </div>
          )}
          {totalPercentage === 100 && (
            <div className="mb-6 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 text-xs leading-relaxed flex items-start gap-3">
              <Check className="w-5 h-5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-bold mb-1">Allocation Perfect!</p>
                <p className="opacity-95">All categories total exactly 100%. Your dynamic salary allocations will distribute perfectly.</p>
              </div>
            </div>
          )}

          {/* Add Category Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleAddCategory}
                className="bg-[#151C2C] border border-white/10 rounded-2xl p-5 mb-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <h4 className="text-sm font-black text-brand-cyan">Create Custom Category</h4>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Name</label>
                    <input 
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-cyan"
                      placeholder="e.g. Subscriptions"
                    />
                  </div>

                  {/* Percentage */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Target Percentage (%)</label>
                    <input 
                      type="number"
                      value={newCatPercentage}
                      onChange={(e) => setNewCatPercentage(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-cyan"
                      placeholder="e.g. 5"
                      min="0"
                      max="100"
                    />
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Hex Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color"
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        className="w-10 h-9 bg-transparent border-0 rounded cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        className="flex-1 bg-[#0B0F19] border border-white/10 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                  </div>

                  {/* Icon selector */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Icon Style</label>
                    <select 
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand-cyan"
                    >
                      {Object.keys(ICON_MAP).map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="bg-[#0B0F19] text-slate-400 hover:text-white rounded-xl px-4 py-2 text-xs font-bold border border-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-brand-cyan text-[#0B0F19] rounded-xl px-4 py-2 text-xs font-black flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" /> Save Category
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Categories allocation list */}
          <div className="space-y-3">
            {categories.map((c) => {
              const IconComponent = ICON_MAP[c.icon] || Wallet;
              const isEditing = editingCatId === c.id;

              if (isEditing) {
                return (
                  <form 
                    key={c.id}
                    onSubmit={(e) => handleSaveEditCategory(e, c.id)}
                    className="bg-[#151C2C] border border-white/10 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
                  >
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Name</label>
                      <input 
                        type="text"
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Percentage (%)</label>
                      <input 
                        type="number"
                        value={editCatPercentage}
                        onChange={(e) => setEditCatPercentage(e.target.value)}
                        className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Color</label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={editCatColor}
                          onChange={(e) => setEditCatColor(e.target.value)}
                          className="w-8 h-8 bg-transparent border-0 rounded cursor-pointer"
                        />
                        <input 
                          type="text"
                          value={editCatColor}
                          onChange={(e) => setEditCatColor(e.target.value)}
                          className="flex-1 bg-[#0B0F19] border border-white/10 text-white rounded-xl px-3 py-1.5 text-[10px] focus:outline-none focus:border-brand-cyan"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Icon</label>
                      <select 
                        value={editCatIcon}
                        onChange={(e) => setEditCatIcon(e.target.value)}
                        className="w-full bg-[#0B0F19] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        {Object.keys(ICON_MAP).map(key => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="submit" 
                        className="flex-1 bg-brand-cyan text-[#0B0F19] rounded-xl py-2 text-xs font-black flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditingCatId(null)}
                        className="flex-1 bg-slate-800 text-slate-300 rounded-xl py-2 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <div 
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#151C2C]/30 border border-white/5 rounded-2xl gap-4 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-2 rounded-xl text-white"
                      style={{ backgroundColor: `${c.color}22`, color: c.color }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">{c.name}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Allocates {formatCurrency((income * parseFloat(c.percentage)) / 100)} monthly
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <span className="text-sm font-black text-slate-300 bg-white/5 border border-white/5 px-3 py-1 rounded-xl">
                      {c.percentage}%
                    </span>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingCatId(c.id);
                          setEditCatName(c.name);
                          setEditCatPercentage(c.percentage);
                          setEditCatColor(c.color);
                          setEditCatIcon(c.icon);
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        title="Edit Allocation"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {confirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#151C2C] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
              >
                {/* Glow decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 shrink-0">
                    <AlertCircle className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-100 mb-1">
                      {confirmModal.title}
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {confirmModal.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      confirmModal.onConfirm();
                      setConfirmModal(null);
                    }}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-lg shadow-rose-500/20"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Budget;
