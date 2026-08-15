import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, TrendingUp, Compass, ArrowUpRight, BarChart2, Plus } from 'lucide-react';
import trackerApi from '../api/trackerApi';
import MetricCard from '../components/dashboard/MetricCard';
import SpendingChart from '../components/dashboard/SpendingChart';
import CategoryChart from '../components/dashboard/CategoryChart';
import CategoryCard from '../components/dashboard/CategoryCard';
import RecentExpenses from '../components/dashboard/RecentExpenses';
import toast from '../components/ui/Toast';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const username = localStorage.getItem('username') || 'Friend';

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
          <p className="text-xs text-slate-400 mt-1">Here's your personal spending overview.</p>
        </div>
        <Link
          to="/expenses/add"
          className="btn-premium btn-cyan rounded-xl px-5 py-3 text-xs font-black flex items-center justify-center gap-2 self-start sm:self-auto shadow-glow-cyan"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/20 border border-white/5 rounded-2xl animate-pulse" />
          ))
        ) : (
          <>
            <MetricCard
              label="Total Spent"
              value={data?.totalSpent || 0}
              comparisonText="Overall tracked spending"
              icon={TrendingUp}
            />
            <MetricCard
              label="Today"
              value={data?.todaySpent || 0}
              comparisonText="Today's outgoing funds"
              icon={Calendar}
            />
            <MetricCard
              label="Last 3 Days"
              value={data?.last3DaysSpent || 0}
              comparisonText="Outgoing in last 72 hours"
              icon={BarChart2}
            />
            <MetricCard
              label="This Week"
              value={data?.currentWeekSpent || 0}
              comparisonText="Weekly accumulated total"
              icon={Compass}
            />
            <MetricCard
              label="This Month"
              value={data?.currentMonthSpent || 0}
              comparisonText="Monthly billing projection"
              icon={Sparkles}
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
