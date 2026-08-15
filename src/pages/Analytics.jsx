import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowLeftRight, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import trackerApi from '../api/trackerApi';
import { formatCurrency } from '../utils/currency';
import { formatInputDate } from '../utils/date';
import toast from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DatePicker from '../components/ui/DatePicker';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#151C2C]/90 border border-white/10 p-3 rounded-xl backdrop-blur-md shadow-xl text-left">
        <p className="text-[10px] text-slate-400 font-bold mb-1">{payload[0].payload.date || payload[0].payload.name}</p>
        <p className="text-sm text-brand-cyan font-black">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export const Analytics = () => {
  const [activeTab, setActiveTab] = useState('TREND'); // 'TREND' | 'COMPARE'
  const [trendPeriod, setTrendPeriod] = useState('WEEKLY'); // 'WEEKLY' | 'MONTHLY' | 'LAST_7' | 'LAST_10' | 'LAST_30'
  const [trendData, setTrendData] = useState([]);
  const [totalTrendSpent, setTotalTrendSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  // Compare states
  const [firstStart, setFirstStart] = useState('');
  const [firstEnd, setFirstEnd] = useState('');
  const [secondStart, setSecondStart] = useState('');
  const [secondEnd, setSecondEnd] = useState('');
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Fetch trend profiles
  useEffect(() => {
    const fetchTrend = async () => {
      setLoading(true);
      try {
        let res = null;
        let startDateObj = null;
        let endDateObj = null;

        if (trendPeriod === 'WEEKLY') {
          res = await trackerApi.getWeeklySpending();
        } else if (trendPeriod === 'MONTHLY') {
          res = await trackerApi.getMonthlySpending();
        } else {
          // Rolling ranges: 'LAST_7', 'LAST_10', 'LAST_30'
          const end = new Date();
          const start = new Date();
          let days = 7;
          if (trendPeriod === 'LAST_10') days = 10;
          if (trendPeriod === 'LAST_30') days = 30;
          
          start.setDate(start.getDate() - (days - 1));
          
          startDateObj = start;
          endDateObj = end;

          const startStr = formatInputDate(start);
          const endStr = formatInputDate(end);
          res = await trackerApi.getSpendingBetweenDates(startStr, endStr);
        }

        if (res && res.dailySpending) {
          let rawList = res.dailySpending;
          
          // Pad client-side for rolling trend ranges
          if (trendPeriod !== 'WEEKLY' && trendPeriod !== 'MONTHLY' && startDateObj && endDateObj) {
            const dailyMap = {};
            rawList.forEach(item => {
              dailyMap[item.date] = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
            });

            const tempDate = new Date(startDateObj);
            const padded = [];
            while (tempDate <= endDateObj) {
              const dateStr = formatInputDate(tempDate);
              padded.push({
                date: dateStr,
                amount: dailyMap[dateStr] || 0
              });
              tempDate.setDate(tempDate.getDate() + 1);
            }
            rawList = padded;
          }

          const formatted = rawList.map(item => {
            const parts = item.date.split('-');
            let dateObj;
            if (parts.length === 3) {
              dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
              dateObj = new Date(item.date);
            }
            
            // Label formatting
            let label = '';
            if (trendPeriod === 'WEEKLY') {
              label = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
            } else {
              label = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            }

            return {
              name: label,
              amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount,
              date: item.date
            };
          });
          setTrendData(formatted);
          setTotalTrendSpent(typeof res.totalSpent === 'string' ? parseFloat(res.totalSpent) : res.totalSpent);
        } else {
          setTrendData([]);
          setTotalTrendSpent(0);
        }
      } catch (err) {
        toast.error('Failed to load trend analytics.');
        setTrendData([]);
        setTotalTrendSpent(0);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'TREND') {
      fetchTrend();
    } else {
      setLoading(false);
    }
  }, [activeTab, trendPeriod]);

  // Set default comparison dates (current month vs previous month)
  useEffect(() => {
    if (activeTab === 'COMPARE') {
      const now = new Date();
      const firstS = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstE = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const secondS = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const secondE = new Date(now.getFullYear(), now.getMonth(), 0);

      setFirstStart(formatInputDate(secondS));
      setFirstEnd(formatInputDate(secondE));
      setSecondStart(formatInputDate(firstS));
      setSecondEnd(formatInputDate(firstE));
    }
  }, [activeTab]);

  const handleCompareSubmit = async (e) => {
    e.preventDefault();
    if (!firstStart || !firstEnd || !secondStart || !secondEnd) {
      toast.error('Please enter all dates to compare.');
      return;
    }

    setCompareLoading(true);
    try {
      const data = await trackerApi.comparePeriods(firstStart, firstEnd, secondStart, secondEnd);
      setCompareData(data);
    } catch (err) {
      toast.error('Failed to calculate period comparisons.');
    } finally {
      setCompareLoading(false);
    }
  };

  const getPercentDifference = () => {
    if (!compareData) return 0;
    const a = compareData.firstPeriodTotal || 0;
    const b = compareData.secondPeriodTotal || 0;
    if (a === 0) return b > 0 ? 100 : 0;
    return ((b - a) / a) * 100;
  };

  const pctDiff = getPercentDifference();
  const isSaving = pctDiff < 0; // Negative percentage difference means second period is cheaper!

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">Analytics Dashboard</h2>
        <p className="text-xs text-slate-400 mt-1">Deep-dive breakdowns of your financial trends.</p>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit">
        {['TREND', 'COMPARE'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-brand-cyan to-brand-blue text-dark-bg font-extrabold shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'TREND' ? 'Trend Analysis' : 'Compare Periods'}
          </button>
        ))}
      </div>

      {/* View Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'TREND' ? (
          loading ? (
            <div key="loader" className="min-h-[40vh] flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <motion.div
              key="trends"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Trend Chart */}
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-violet/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {trendPeriod === 'WEEKLY' && 'Weekly Accumulations'}
                    {trendPeriod === 'MONTHLY' && 'Monthly Outflow Profile'}
                    {trendPeriod === 'LAST_7' && 'Last 7 Days Outflow'}
                    {trendPeriod === 'LAST_10' && 'Last 10 Days Outflow'}
                    {trendPeriod === 'LAST_30' && 'Last 30 Days Outflow'}
                  </h3>
                  
                  {/* Period Filter Toggles */}
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                    {['WEEKLY', 'MONTHLY', 'LAST_7', 'LAST_10', 'LAST_30'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTrendPeriod(p)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${
                          trendPeriod === p
                            ? 'bg-gradient-to-r from-brand-violet to-indigo-600 text-white shadow-glow-violet'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {p === 'WEEKLY' && 'Weekly'}
                        {p === 'MONTHLY' && 'Monthly'}
                        {p === 'LAST_7' && 'Last 7d'}
                        {p === 'LAST_10' && 'Last 10d'}
                        {p === 'LAST_30' && 'Last 30d'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#64748B"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#64748B"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `₹${val}`}
                        dx={-10}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="amount"
                        fill="#8B5CF6"
                        radius={[6, 6, 0, 0]}
                        className="cursor-pointer"
                        style={{
                          filter: 'drop-shadow(0px 4px 10px rgba(139, 92, 246, 0.2))'
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Statistics sidebar */}
              <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-cyan/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-sm font-bold text-white mb-4">Summary Stats</h3>
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Total Period Outflow
                    </span>
                    <span className="text-lg font-black text-white bg-gradient-to-r from-brand-cyan to-brand-blue bg-clip-text text-transparent">
                      {formatCurrency(totalTrendSpent)}
                    </span>
                  </div>
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Highest Period Outflow
                    </span>
                    <span className="text-lg font-black text-white">
                      {formatCurrency(Math.max(...trendData.map((d) => d.amount), 0))}
                    </span>
                  </div>
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Average Outflow
                    </span>
                    <span className="text-lg font-black text-brand-cyan">
                      {formatCurrency(
                        trendData.length > 0
                          ? trendData.reduce((s, d) => s + d.amount, 0) / trendData.length
                          : 0
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Total Data Periods
                    </span>
                    <span className="text-lg font-black text-brand-violet">
                      {trendData.length} records
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        ) : (
          <motion.div
            key="compare"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Compare configuration card */}
            <div className="glass-card rounded-3xl p-6 border border-white/5">
              <form onSubmit={handleCompareSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Period A */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-cyan" />
                      Period A (Reference Range)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
                        <DatePicker
                          value={firstStart}
                          onChange={(val) => setFirstStart(val)}
                          placeholder="Start Date"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">End Date</label>
                        <DatePicker
                          value={firstEnd}
                          onChange={(val) => setFirstEnd(val)}
                          placeholder="End Date"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Period B */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-violet" />
                      Period B (Target Range)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
                        <DatePicker
                          value={secondStart}
                          onChange={(val) => setSecondStart(val)}
                          placeholder="Start Date"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">End Date</label>
                        <DatePicker
                          value={secondEnd}
                          onChange={(val) => setSecondEnd(val)}
                          placeholder="End Date"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={compareLoading}
                  className="btn-premium btn-cyan rounded-xl px-6 py-3 text-xs font-black flex items-center justify-center gap-2 shadow-glow-cyan w-full md:w-auto"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Compare Periods
                </button>
              </form>
            </div>

            {/* Compare Results Output */}
            {compareLoading ? (
              <div className="min-h-[20vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : compareData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Period Comparison Values Card */}
                <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-cyan/5 rounded-full blur-2xl pointer-events-none" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Total Spending Comparison</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Period A Total</span>
                        <span className="text-base font-black text-white">
                          {formatCurrency(compareData.firstPeriodTotal)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Period B Total</span>
                        <span className="text-base font-black text-white">
                          {formatCurrency(compareData.secondPeriodTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Difference Card */}
                <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-violet/5 rounded-full blur-2xl pointer-events-none" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Net Change</h3>
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 block">Difference</span>
                      <h4 className={`text-2xl font-black ${isSaving ? 'text-brand-emerald' : 'text-brand-rose'}`}>
                        {formatCurrency(Math.abs(compareData.secondPeriodTotal - compareData.firstPeriodTotal))}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        Outgoing funds {isSaving ? 'decreased' : 'increased'} in target period B.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Directive Recommendation / Visual Indicator */}
                <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isSaving ? 'bg-brand-emerald' : 'bg-brand-rose'}`} />
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Performance</h3>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                        isSaving
                          ? 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald shadow-glow-emerald'
                          : 'bg-brand-rose/10 border-brand-rose/20 text-brand-rose shadow-glow-rose'
                      }`}>
                        {isSaving ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                      </div>
                      <div>
                        <span className={`text-lg font-black block leading-tight ${isSaving ? 'text-brand-emerald' : 'text-brand-rose'}`}>
                          {isSaving ? '-' : '+'}{Math.abs(pctDiff).toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {isSaving ? 'Net Savings' : 'Increase in Costs'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-700/60 rounded-3xl">
                <span className="text-3xl mb-2 select-none">📊</span>
                <h4 className="text-slate-200 text-sm font-bold mb-1">Ready for Comparison</h4>
                <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                  Enter ranges for Period A and Period B above to view comparative analytics.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default Analytics;
