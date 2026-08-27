import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, TrendingUp, Compass, ArrowUpRight, BarChart2, Plus, PiggyBank } from 'lucide-react';
import trackerApi from '../api/trackerApi';
import MetricCard from '../components/dashboard/MetricCard';
import SpendingChart from '../components/dashboard/SpendingChart';
import CategoryChart from '../components/dashboard/CategoryChart';
import CategoryCard from '../components/dashboard/CategoryCard';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import toast from '../components/ui/Toast';
import { formatCurrency } from '../utils/currency';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Specified month search filter & metrics states
  const [dashboardMonth, setDashboardMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthIncomeAmt, setMonthIncomeAmt] = useState(0);
  const [monthSpentAmt, setMonthSpentAmt] = useState(0);

  // AI Predictive alerts states
  const [aiAlerts, setAiAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Chart filtering states
  const [period, setPeriod] = useState('WEEKLY'); // 'WEEKLY' | 'MONTHLY'
  const [chartData, setChartData] = useState({ daily: [], category: {} });
  const [chartLoading, setChartLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await trackerApi.getDashboardData();
      setData(res);
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        // 1. Fetch Income
        const incRes = await trackerApi.getMonthlyIncome(dashboardMonth);
        setMonthIncomeAmt(incRes.amount || 0);

        // 2. Fetch expenses in range to calculate total spent
        const parts = dashboardMonth.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const lastDay = new Date(year, month, 0).getDate();
        const start = `${dashboardMonth}-01`;
        const end = `${dashboardMonth}-${String(lastDay).padStart(2, '0')}`;
        
        const monthExpenses = await trackerApi.getExpensesInRange(start, end);
        const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        setMonthSpentAmt(totalSpent);
      } catch (err) {
        setMonthIncomeAmt(0);
        setMonthSpentAmt(0);
      }
    };
    fetchMonthlyStats();
  }, [dashboardMonth]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setAlertsLoading(true);
        const res = await trackerApi.getAiPredictiveAlerts();
        setAiAlerts(res || []);
      } catch (err) {
        setAiAlerts([]);
      } finally {
        setAlertsLoading(false);
      }
    };
    fetchAlerts();
  }, [dashboardMonth]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setChartLoading(true);
        let res = null;
        if (period === 'WEEKLY') {
          res = await trackerApi.getWeeklySpending();
        } else if (period === 'MONTHLY') {
          res = await trackerApi.getMonthlySpending();
        } else if (period === 'YEARLY') {
          // Compute yearly stats client-side by aggregating all expenses
          const allExpenses = await trackerApi.getAllExpenses();
          const currentYear = new Date().getFullYear();
          
          // Filter for current year
          const yearlyExpenses = allExpenses.filter(exp => {
            const parts = exp.expenseDate.split('-');
            const yearVal = parts.length === 3 ? parseInt(parts[0]) : new Date(exp.expenseDate).getFullYear();
            return yearVal === currentYear;
          });

          // Group by Month (0 to 11)
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthlyTotals = Array(12).fill(0);
          const categoryTotals = {};

          yearlyExpenses.forEach(exp => {
            const parts = exp.expenseDate.split('-');
            const monthIdx = parts.length === 3 ? parseInt(parts[1]) - 1 : new Date(exp.expenseDate).getMonth();
            if (monthIdx >= 0 && monthIdx < 12) {
              monthlyTotals[monthIdx] += typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount;
            }

            const cat = exp.category;
            categoryTotals[cat] = (categoryTotals[cat] || 0) + (typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount);
          });

          const formattedDaily = months.map((m, idx) => ({
            date: `${currentYear}-${String(idx + 1).padStart(2, '0')}-01`,
            formattedDate: m,
            amount: monthlyTotals[idx]
          }));

          setChartData({
            daily: formattedDaily,
            category: categoryTotals
          });
          setChartLoading(false);
          return;
        } else if (period === 'OVERALL') {
          // Compute overall stats client-side by aggregating all expenses
          const allExpenses = await trackerApi.getAllExpenses();
          if (allExpenses.length === 0) {
            setChartData({ daily: [], category: {} });
            setChartLoading(false);
            return;
          }

          // Sort expenses chronologically to find bounds
          const sorted = [...allExpenses].sort((a, b) => new Date(a.expenseDate) - new Date(b.expenseDate));
          const firstYear = new Date(sorted[0].expenseDate).getFullYear();
          const lastYear = new Date(sorted[sorted.length - 1].expenseDate).getFullYear();
          
          const yearDiff = lastYear - firstYear;
          const categoryTotals = {};
          
          allExpenses.forEach(exp => {
            const cat = exp.category;
            categoryTotals[cat] = (categoryTotals[cat] || 0) + (typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount);
          });

          let formattedDaily = [];

          if (yearDiff >= 1) {
            // Group by Year
            const yearTotals = {};
            for (let y = firstYear; y <= lastYear; y++) {
              yearTotals[y] = 0;
            }
            
            allExpenses.forEach(exp => {
              const parts = exp.expenseDate.split('-');
              const y = parts.length === 3 ? parseInt(parts[0]) : new Date(exp.expenseDate).getFullYear();
              if (yearTotals[y] !== undefined) {
                yearTotals[y] += typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount;
              }
            });

            formattedDaily = Object.keys(yearTotals).map(y => ({
              date: `${y}-01-01`,
              formattedDate: String(y),
              amount: yearTotals[y]
            }));
          } else {
            // Group by Month (since it's a single year or less)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyTotals = Array(12).fill(0);
            
            allExpenses.forEach(exp => {
              const parts = exp.expenseDate.split('-');
              const monthIdx = parts.length === 3 ? parseInt(parts[1]) - 1 : new Date(exp.expenseDate).getMonth();
              if (monthIdx >= 0 && monthIdx < 12) {
                monthlyTotals[monthIdx] += typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount;
              }
            });

            formattedDaily = months.map((m, idx) => ({
              date: `${firstYear}-${String(idx + 1).padStart(2, '0')}-01`,
              formattedDate: m,
              amount: monthlyTotals[idx]
            }));
          }

          setChartData({
            daily: formattedDaily,
            category: categoryTotals
          });
          setChartLoading(false);
          return;
        }

        if (res) {
          const formattedDaily = (res.dailySpending || []).map(item => {
            const parts = item.date.split('-');
            let dateObj;
            if (parts.length === 3) {
              dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
              dateObj = new Date(item.date);
            }
            
            const label = period === 'WEEKLY'
              ? dateObj.toLocaleDateString('en-GB', { weekday: 'short' })
              : dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            
            return {
              date: item.date,
              formattedDate: label,
              amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount
            };
          });

          setChartData({
            daily: formattedDaily,
            category: res.categorySpending || {}
          });
        }
      } catch (err) {
        toast.error('Failed to load chart trends.');
      } finally {
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [period]);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderFormattedAlert = (text) => {
    if (typeof text !== 'string') return text;
    const parts = text.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-extrabold text-white">{part}</strong>;
      }
      return part;
    });
  };

  const username = localStorage.getItem('username') || 'Friend';
  const monthSavedAmt = monthIncomeAmt - monthSpentAmt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Title greeting block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {getGreeting()}, {username} 👋
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-slate-400">Personal spending overview for</p>
            <input 
              type="month"
              value={dashboardMonth}
              onChange={(e) => setDashboardMonth(e.target.value)}
              className="bg-[#151C2C]/80 border border-white/10 text-white rounded-xl px-3 py-1 text-xs focus:outline-none focus:border-brand-cyan h-7 font-bold cursor-pointer"
            />
          </div>
        </div>
        <Link
          to="/expenses/add"
          className="btn-premium btn-cyan rounded-xl px-5 py-3 text-xs font-black flex items-center justify-center gap-2 self-start sm:self-auto shadow-glow-cyan"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </Link>
      </div>

      {/* Monthly Savings Hub Banner */}
      <div className="glass-card rounded-3xl p-5 border border-white/5 bg-gradient-to-r from-[#0F172A]/80 to-[#1E293B]/80 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-2xl select-none">
            💰
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Monthly Savings Tracker</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Summary for {new Date(dashboardMonth + '-15').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 w-full md:w-auto text-center md:text-left">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Income (Salary)</span>
            <span className="text-sm sm:text-base font-black text-white mt-1 block">
              {formatCurrency(monthIncomeAmt)}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Spent</span>
            <span className="text-sm sm:text-base font-black text-brand-rose mt-1 block">
              {formatCurrency(monthSpentAmt)}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Saved / Remaining</span>
            <span className={`text-sm sm:text-base font-black mt-1 block ${monthSavedAmt >= 0 ? 'text-brand-emerald' : 'text-brand-rose'}`}>
              {formatCurrency(monthSavedAmt)}
            </span>
          </div>
        </div>

        <div className="w-full md:w-auto shrink-0 flex flex-col items-center md:items-end gap-2 text-center md:text-right">
          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${
            monthSavedAmt >= 0 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}>
            {monthSavedAmt >= 0 
              ? `Saved ${(monthIncomeAmt > 0 ? ((monthSavedAmt / monthIncomeAmt) * 100) : 0).toFixed(0)}% of income`
              : `Overspent by ${formatCurrency(Math.abs(monthSavedAmt))}`
            }
          </span>
        </div>
      </div>

      {/* Animated AI Budget Advisor Banner */}
      <AnimatePresence mode="wait">
        {(alertsLoading || aiAlerts.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-brand-violet/10 via-[#1E293B]/70 to-[#0F172A]/70 border border-brand-violet/20 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4 relative shadow-lg">
              <div className="absolute inset-0 bg-brand-violet/5 blur-xl rounded-full pointer-events-none" />
              
              <div className="w-11 h-11 rounded-2xl bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-lg select-none shrink-0 shadow-inner">
                {alertsLoading ? '⏳' : '💡'}
              </div>

              <div className="flex-1 w-full text-center sm:text-left">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-violet mb-1 flex items-center justify-center sm:justify-start gap-1">
                  Gemini Predictive Budget Advisor
                </h4>
                
                {alertsLoading ? (
                  <p className="text-xs text-slate-400 animate-pulse font-medium">
                    Analyzing spending habits, recent transactions, and category allocations...
                  </p>
                ) : aiAlerts.length > 0 && aiAlerts[0].includes("Gemini API Key is not configured") ? (
                  <p className="text-xs text-slate-300 font-medium">
                    AI analysis is disabled.{' '}
                    <Link to="/ai-advisor" className="text-brand-cyan hover:underline font-extrabold inline-flex items-center gap-0.5">
                      Setup your Gemini API Key in the AI Advisor workspace to enable alerts.
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-2 mt-1">
                    {aiAlerts.map((alert, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-2 text-xs sm:text-sm font-semibold text-slate-200"
                      >
                        <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full mt-1.5 shrink-0 animate-ping" />
                        <span className="leading-relaxed">{renderFormattedAlert(alert)}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/20 border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : (
          <>
            <MetricCard
              label="Total Savings"
              value={data?.lifetimeSavings || 0}
              comparisonText="Cumulative overall savings"
              icon={PiggyBank}
              color="emerald"
            />
            <MetricCard
              label="Total Spent"
              value={data?.totalSpent || 0}
              comparisonText="Overall tracked spending"
              icon={TrendingUp}
              color="rose"
            />
            <MetricCard
              label="Today"
              value={data?.todaySpent || 0}
              comparisonText="Today's outgoing funds"
              icon={Calendar}
              color="amber"
            />
            <MetricCard
              label="Last 3 Days"
              value={data?.last3DaysSpent || 0}
              comparisonText="Outgoing in last 72 hours"
              icon={BarChart2}
              color="indigo"
            />
            <MetricCard
              label="This Week"
              value={data?.currentWeekSpent || 0}
              comparisonText="Weekly accumulated total"
              icon={Compass}
              color="cyan"
            />
            <MetricCard
              label="This Month"
              value={data?.currentMonthSpent || 0}
              comparisonText="Monthly billing projection"
              icon={Sparkles}
              color="violet"
            />
          </>
        )}
      </div>

      {/* Main Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Spending area chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-violet/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center gap-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Daily Spending Trend</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {period === 'WEEKLY' && 'Tracking daily outflows of the last week'}
                {period === 'MONTHLY' && 'Tracking daily outflows of the last month'}
                {period === 'YEARLY' && 'Tracking monthly outflows of the current year'}
                {period === 'OVERALL' && 'Tracking spending outflows over all logged history'}
              </p>
            </div>
            
            {/* Toggle Filters */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 ml-auto">
              <button
                type="button"
                onClick={() => setPeriod('WEEKLY')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  period === 'WEEKLY'
                    ? 'bg-gradient-to-r from-brand-violet to-indigo-600 text-white shadow-glow-violet'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setPeriod('MONTHLY')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  period === 'MONTHLY'
                    ? 'bg-gradient-to-r from-brand-violet to-indigo-600 text-white shadow-glow-violet'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setPeriod('YEARLY')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  period === 'YEARLY'
                    ? 'bg-gradient-to-r from-brand-violet to-indigo-600 text-white shadow-glow-violet'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly
              </button>
              <button
                type="button"
                onClick={() => setPeriod('OVERALL')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  period === 'OVERALL'
                    ? 'bg-gradient-to-r from-brand-violet to-indigo-600 text-white shadow-glow-violet'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Overall
              </button>
            </div>

            <Link
              to="/analytics"
              className="text-[10px] font-bold text-brand-cyan hover:underline flex items-center gap-1 bg-brand-cyan/10 border border-brand-cyan/15 px-2.5 py-1 rounded-full shrink-0"
            >
              Analytics Details <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <SpendingChart data={chartData.daily} loading={chartLoading} />
        </div>

        {/* Category donut distribution chart */}
        <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-cyan/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white leading-tight">Category Breakdown</h3>
            <span className="text-[9px] font-extrabold text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {period}
            </span>
          </div>
          {chartLoading ? (
            <div className="w-full h-56 bg-slate-800/20 border border-white/5 rounded-2xl animate-pulse flex items-center justify-center">
              <span className="text-xs text-slate-400">Loading chart...</span>
            </div>
          ) : (
            <CategoryChart
              data={chartData.category}
              onCategoryClick={(cat) => navigate(`/expenses?category=${cat}`)}
            />
          )}
        </div>
      </div>

      {/* Category progression list and Recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Cards Progress Grid */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-800/20 border border-white/5 rounded-2xl animate-pulse" />
              ))
            ) : (
              Object.entries(data?.categoryBreakdown || {}).map(([key, val]) => {
                const total = data?.totalSpent || 1;
                const percentage = total > 0 ? (val / total) * 100 : 0;
                return (
                  <CategoryCard
                    key={key}
                    category={key}
                    amount={val}
                    percentage={percentage}
                    onClick={() => navigate(`/expenses?category=${key}`)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Recent Expenses layout */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Recent Outflows</h3>
            <Link to="/history" className="text-[10px] font-bold text-brand-violet hover:underline flex items-center gap-1">
              View History <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <RecentExpenses expenses={data?.recentExpenses} loading={loading} />
        </div>
      </div>
    </motion.div>
  );
};
export default Dashboard;
