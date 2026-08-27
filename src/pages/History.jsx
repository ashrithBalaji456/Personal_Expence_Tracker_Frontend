import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Edit3, Trash2, Search, Filter, ArrowUpDown, CalendarDays, Plus, ChevronDown, Download, FileText } from 'lucide-react';
import trackerApi from '../api/trackerApi';
import { CATEGORIES, CATEGORY_DETAILS } from '../utils/constants';
import { formatCurrency } from '../utils/currency';
import { formatDateFriendly, formatInputDate } from '../utils/date';
import toast from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Select from '../components/ui/Select';
import DatePicker from '../components/ui/DatePicker';

export const History = () => {
  const navigate = useNavigate();

  const [categoriesList, setCategoriesList] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [specificMonth, setSpecificMonth] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await trackerApi.getBudgetCategories();
        setCategoriesList(cats);
      } catch (err) {
        // ignore
      }
    };
    fetchCats();
  }, []);

  const categoryOptions = [
    { value: 'ALL', label: 'All Categories' },
    ...categoriesList.map((cat) => ({ value: cat.name, label: cat.name }))
  ];

  const dateOptions = [
    { value: 'ALL', label: 'All Dates' },
    { value: 'TODAY', label: 'Today' },
    { value: 'YESTERDAY', label: 'Yesterday' },
    { value: 'LAST_WEEK', label: 'Last Week (7 Days)' },
    { value: 'LAST_MONTH', label: 'Last Month (30 Days)' },
    { value: 'SPECIFIC_MONTH', label: 'Specific Month' },
    { value: 'SPECIFIC', label: 'Specific Date' },
    { value: 'CUSTOM', label: 'Custom Range' }
  ];

  const sortOptions = [
    { value: 'NEWEST', label: 'Newest First' },
    { value: 'OLDEST', label: 'Oldest First' },
    { value: 'HIGHEST', label: 'Highest Amount' },
    { value: 'LOWEST', label: 'Lowest Amount' }
  ];

  const pageSizeOptions = [
    { value: '5', label: '5 items' },
    { value: '10', label: '10 items' },
    { value: '20', label: '20 items' },
    { value: '50', label: '50 items' },
    { value: '1000000', label: 'Show All' }
  ];

  const [historyData, setHistoryData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'YESTERDAY' | 'SPECIFIC' | 'CUSTOM'
  const [specificDate, setSpecificDate] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST'); // 'NEWEST' | 'OLDEST' | 'HIGHEST' | 'LOWEST'

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      
      const isFiltered = categoryFilter !== 'ALL' || 
                         dateFilter !== 'ALL' || 
                         searchQuery.trim() !== '';

      if (!isFiltered) {
        // Use server-side paginated endpoint when no filter is active
        const res = await trackerApi.getExpensesHistory(currentPage, pageSize);
        setHistoryData(res);
        setFilteredExpenses([]);
      } else {
        // Fetch filtered datasets from backend REST endpoints
        let data = [];
        if (categoryFilter !== 'ALL') {
          data = await trackerApi.getExpensesByCategory(categoryFilter);
        } else if (dateFilter === 'TODAY') {
          data = await trackerApi.getExpensesByDate(formatInputDate(new Date()));
        } else if (dateFilter === 'YESTERDAY') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          data = await trackerApi.getExpensesByDate(formatInputDate(yesterday));
        } else if (dateFilter === 'SPECIFIC' && specificDate) {
          data = await trackerApi.getExpensesByDate(specificDate);
        } else if (dateFilter === 'CUSTOM' && customStartDate && customEndDate) {
          data = await trackerApi.getExpensesInRange(customStartDate, customEndDate);
        } else {
          data = await trackerApi.getAllExpenses();
        }

        // Apply ALL filters client-side to handle compound combinations
        let filtered = data.filter((exp) => {
          // Category filter (in case we fetched by date/range but also have a category filter)
          if (categoryFilter !== 'ALL' && exp.category !== categoryFilter) {
            return false;
          }
          
          // Date filter (in case we fetched by category but also have a date filter)
          if (dateFilter !== 'ALL') {
            const expDate = exp.expenseDate;
            if (dateFilter === 'TODAY') {
              const todayStr = formatInputDate(new Date());
              if (expDate !== todayStr) return false;
            } else if (dateFilter === 'YESTERDAY') {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              if (expDate !== formatInputDate(yesterday)) return false;
            } else if (dateFilter === 'SPECIFIC' && specificDate) {
              if (expDate !== specificDate) return false;
            } else if (dateFilter === 'CUSTOM' && customStartDate && customEndDate) {
              if (expDate < customStartDate || expDate > customEndDate) return false;
            } else if (dateFilter === 'LAST_WEEK') {
              const limit = new Date();
              limit.setDate(limit.getDate() - 7);
              const limitStr = formatInputDate(limit);
              if (expDate < limitStr) return false;
            } else if (dateFilter === 'LAST_MONTH') {
              const limit = new Date();
              limit.setDate(limit.getDate() - 30);
              const limitStr = formatInputDate(limit);
              if (expDate < limitStr) return false;
            } else if (dateFilter === 'SPECIFIC_MONTH' && specificMonth) {
              if (!expDate.startsWith(specificMonth)) return false;
            }
          }

          // Search text query match
          if (searchQuery.trim()) {
            return exp.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
          }

          return true;
        });

        // Apply client-side sorting parameters
        filtered.sort((a, b) => {
          if (sortBy === 'NEWEST') {
            const dateDiff = new Date(b.expenseDate) - new Date(a.expenseDate);
            if (dateDiff !== 0) return dateDiff;
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          if (sortBy === 'OLDEST') {
            const dateDiff = new Date(a.expenseDate) - new Date(b.expenseDate);
            if (dateDiff !== 0) return dateDiff;
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
          if (sortBy === 'HIGHEST') return b.amount - a.amount;
          if (sortBy === 'LOWEST') return a.amount - b.amount;
          return 0;
        });

        // Save the full un-paginated filtered list for export
        setFilteredExpenses(filtered);

        // Paginate locally over the filtered dataset
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / pageSize);
        const startIndex = currentPage * pageSize;
        const pageContent = filtered.slice(startIndex, startIndex + pageSize);

        setHistoryData({
          content: pageContent,
          totalPages,
          totalElements,
          number: currentPage
        });
      }
    } catch (err) {
      toast.error('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, categoryFilter, dateFilter, specificDate, specificMonth, customStartDate, customEndDate, searchQuery, sortBy]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDeleteExpense = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await trackerApi.deleteExpense(id);
        toast.success('Expense deleted successfully.');
        loadHistory();
      } catch (err) {
        toast.error('Failed to delete expense.');
      }
    }
  };

  const handleResetFilters = () => {
    setCategoryFilter('ALL');
    setDateFilter('ALL');
    setSpecificDate('');
    setSpecificMonth('');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');
    setSortBy('NEWEST');
    setCurrentPage(0);
  };

  const getExportData = async () => {
    const isFiltered = categoryFilter !== 'ALL' || 
                       dateFilter !== 'ALL' || 
                       searchQuery.trim() !== '';
    if (isFiltered) {
      return filteredExpenses;
    } else {
      try {
        const data = await trackerApi.getAllExpenses();
        data.sort((a, b) => {
          if (sortBy === 'NEWEST') {
            const dateDiff = new Date(b.expenseDate) - new Date(a.expenseDate);
            if (dateDiff !== 0) return dateDiff;
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          if (sortBy === 'OLDEST') {
            const dateDiff = new Date(a.expenseDate) - new Date(b.expenseDate);
            if (dateDiff !== 0) return dateDiff;
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
          if (sortBy === 'HIGHEST') return b.amount - a.amount;
          if (sortBy === 'LOWEST') return a.amount - b.amount;
          return 0;
        });
        return data;
      } catch (err) {
        toast.error('Failed to retrieve export records.');
        return [];
      }
    }
  };

  const handleExportCSV = async () => {
    const exportData = await getExportData();
    if (!exportData || exportData.length === 0) {
      toast.error('No transaction records available to export.');
      return;
    }

    // CSV Header row
    const headers = ['ID', 'Date', 'Title', 'Category', 'Amount', 'Notes', 'Created At'];
    
    // Map transactions to CSV rows
    const rows = exportData.map(exp => {
      const parts = exp.expenseDate.split('-');
      let formattedDate = exp.expenseDate;
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      const categoryLabel = getCategoryDetails(exp.category).label;

      return [
        exp.id,
        formattedDate,
        `"${exp.title.replace(/"/g, '""')}"`, // escape double quotes
        categoryLabel,
        exp.amount,
        `"${(exp.notes || '').replace(/"/g, '""')}"`,
        exp.createdAt
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Expense_History_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV report exported successfully!');
  };

  const handleExportPDF = async () => {
    const exportData = await getExportData();
    if (!exportData || exportData.length === 0) {
      toast.error('No transaction records available to export.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to export PDF reports.');
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const rowsHtml = exportData.map((exp, idx) => {
      const parts = exp.expenseDate.split('-');
      let formattedDate = exp.expenseDate;
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      const catDetails = getCategoryDetails(exp.category);
      const categoryLabel = catDetails.label;

      return `
        <tr style="border-bottom: 1px solid #1E293B;">
          <td style="padding: 10px; text-align: left; color: #94A3B8;">${idx + 1}</td>
          <td style="padding: 10px; text-align: left; color: #94A3B8;">${formattedDate}</td>
          <td style="padding: 10px; text-align: left; font-weight: bold; color: #FFFFFF;">${exp.title}</td>
          <td style="padding: 10px; text-align: left;"><span class="category-pill" style="background-color: ${catDetails.color}22; border-color: ${catDetails.color}33; color: ${catDetails.color}">${categoryLabel}</span></td>
          <td style="padding: 10px; text-align: right; font-weight: bold; color: #38BDF8;">${formatCurrency(exp.amount)}</td>
        </tr>
      `;
    }).join('');

    const totalAmount = exportData.reduce((sum, exp) => sum + exp.amount, 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Expense History Report</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background-color: #0B0F19 !important;
              color: #E2E8F0;
              font-family: 'Inter', sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .wrapper {
              background-color: #0B0F19 !important;
              min-height: 100vh;
              padding: 40px;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8B5CF6; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: 900; color: #A78BFA; }
            .meta { font-size: 12px; text-align: right; color: #94A3B8; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #151C2C !important; border-bottom: 2px solid #334155; padding: 12px 10px; text-align: left; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #94A3B8; }
            .category-pill { background-color: rgba(139, 92, 246, 0.15) !important; border: 1px solid rgba(139, 92, 246, 0.25); color: #C084FC; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; }
            .total-row { border-top: 2px solid #334155; font-size: 16px; font-weight: bold; }
            .footer { font-size: 10px; text-align: center; color: #64748B; margin-top: 50px; border-top: 1px solid #1E293B; padding-top: 20px; }
            
            @media print {
              html, body, .wrapper {
                background-color: #0B0F19 !important;
                color: #E2E8F0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              th { background-color: #151C2C !important; color: #94A3B8 !important; }
              td { color: #E2E8F0 !important; }
              .category-pill { background-color: rgba(139, 92, 246, 0.15) !important; color: #C084FC !important; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <div>
                <div class="title">ExpenseFlow</div>
                <div style="font-size: 12px; color: #94A3B8; margin-top: 5px;">Transaction History Report</div>
              </div>
              <div class="meta">
                <div>Date: ${dateStr}</div>
                <div>Records: ${exportData.length}</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 8%;">S.No</th>
                  <th style="width: 20%;">Date</th>
                  <th style="width: 42%;">Title</th>
                  <th style="width: 15%;">Category</th>
                  <th style="width: 15%; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
                <tr class="total-row">
                  <td colspan="4" style="padding: 15px 10px; text-align: right; color: #94A3B8;">Total Outflow:</td>
                  <td style="padding: 15px 10px; text-align: right; color: #38BDF8;">${formatCurrency(totalAmount)}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              Generated automatically by ExpenseFlow Finance Hub. All rights reserved.
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    toast.success('PDF report window opened successfully!');
  };

  const getCategoryDetails = (catName) => {
    const found = categoriesList.find(c => c.name === catName || c.name.toUpperCase() === catName.toUpperCase());
    if (found) {
      return {
        label: found.name,
        color: found.color,
        style: {
          backgroundColor: `${found.color}15`,
          borderColor: `${found.color}25`,
          color: found.color
        }
      };
    }
    const legacy = CATEGORY_DETAILS[catName] || CATEGORY_DETAILS[catName?.toUpperCase()];
    if (legacy) {
      return {
        label: legacy.label,
        color: legacy.color,
        style: {
          backgroundColor: `${legacy.color}15`,
          borderColor: `${legacy.color}25`,
          color: legacy.color
        }
      };
    }
    return {
      label: catName,
      color: '#94A3B8',
      style: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
        color: '#94A3B8'
      }
    };
  };

  const totalPages = historyData?.totalPages || 0;
  const totalElements = historyData?.totalElements || 0;
  const content = historyData?.content || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">Transaction History</h2>
          <p className="text-xs text-slate-400 mt-1">Complete paginated ledger list.</p>
        </div>

        {/* Page size picker & Export Buttons */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-xs font-black transition-all h-[38px]"
            title="Export filtered records to CSV"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs font-black transition-all h-[38px]"
            title="Export filtered records to PDF Statement"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Show</span>
            <Select
              value={String(pageSize)}
              onChange={(val) => {
                setPageSize(parseInt(val));
                setCurrentPage(0);
              }}
              options={pageSizeOptions}
              className="w-28"
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-card rounded-3xl p-5 border border-white/5 space-y-4 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full glass-input rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold focus:outline-none h-[38px]"
            />
          </div>

          {/* Category Dropdown */}
          <Select
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val);
              setCurrentPage(0);
            }}
            options={categoryOptions}
            icon={Filter}
          />

          {/* Date Filter Dropdown */}
          <Select
            value={dateFilter}
            onChange={(val) => {
              setDateFilter(val);
              setCurrentPage(0);
            }}
            options={dateOptions}
            icon={CalendarDays}
          />

          {/* Sort Option */}
          <Select
            value={sortBy}
            onChange={(val) => {
              setSortBy(val);
              setCurrentPage(0);
            }}
            options={sortOptions}
            icon={ArrowUpDown}
          />
        </div>

        {/* Specific Date Picker input */}
        {dateFilter === 'SPECIFIC' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-3 pt-2 border-t border-white/5 text-xs"
          >
            <span className="text-slate-400 font-semibold">Select Date:</span>
            <DatePicker
              value={specificDate}
              onChange={(val) => {
                setSpecificDate(val);
                setCurrentPage(0);
              }}
              placeholder="Pick a date"
              className="max-w-[200px]"
            />
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-brand-violet hover:underline ml-auto"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

        {/* Specific Month Picker input */}
        {dateFilter === 'SPECIFIC_MONTH' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-3 pt-2 border-t border-white/5 text-xs"
          >
            <span className="text-slate-400 font-semibold">Select Month:</span>
            <input
              type="month"
              value={specificMonth}
              onChange={(e) => {
                setSpecificMonth(e.target.value);
                setCurrentPage(0);
              }}
              className="bg-[#151C2C] border border-white/10 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-brand-cyan"
            />
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-brand-violet hover:underline ml-auto"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

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
                onChange={(val) => {
                  setCustomStartDate(val);
                  setCurrentPage(0);
                }}
                placeholder="Start Date"
                className="w-full sm:max-w-[160px]"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-400 font-semibold shrink-0">To</span>
              <DatePicker
                value={customEndDate}
                onChange={(val) => {
                  setCustomEndDate(val);
                  setCurrentPage(0);
                }}
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

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : content.length === 0 ? (
        <EmptyState
          title="No Transactions Logged"
          description={
            searchQuery.trim() || categoryFilter !== 'ALL' || dateFilter !== 'ALL'
              ? 'No transaction records match your active search filter settings.'
              : 'Your complete ledger history will appear here once expenses are added.'
          }
          actionLabel={
            searchQuery.trim() || categoryFilter !== 'ALL' || dateFilter !== 'ALL' ? 'Clear Filters' : 'Log First Expense'
          }
          onAction={
            searchQuery.trim() || categoryFilter !== 'ALL' || dateFilter !== 'ALL'
              ? handleResetFilters
              : () => navigate('/expenses/add')
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
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
                {content.map((exp) => {
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
                        <span 
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                          style={details.style}
                        >
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
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteExpense(exp.id, e)}
                            className="p-1.5 bg-white/5 hover:bg-brand-rose/20 border border-white/5 hover:border-brand-rose/20 rounded-lg text-slate-400 hover:text-brand-rose transition-all"
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

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {content.map((exp) => {
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
                    <span 
                      className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border"
                      style={details.style}
                    >
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

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xs">
              <span className="text-slate-400 font-semibold">
                Page {currentPage + 1} of {totalPages} ({totalElements} items)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-slate-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-8 h-8 rounded-xl font-bold transition-all text-[11px] ${
                      currentPage === idx
                        ? 'bg-gradient-to-r from-brand-violet/20 to-indigo-500/20 text-white border border-brand-violet/30 shadow-glow-violet'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-slate-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
export default History;
