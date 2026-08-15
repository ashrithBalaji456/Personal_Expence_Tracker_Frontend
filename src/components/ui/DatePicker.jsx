import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatInputDate } from '../../utils/date';

export const DatePicker = ({
  value,
  onChange,
  placeholder = 'Select date',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const todayDate = new Date();
  
  // Track currently viewed month/year in the calendar
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      }
    }
    return new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  });

  // Sync view Date when value changes
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setViewDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1));
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (dayDate) => {
    onChange(formatInputDate(dayDate));
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    onChange(formatInputDate(new Date()));
    setIsOpen(false);
  };

  // Generate calendar days grid cells (42 cells)
  const cells = [];
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  // Prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
      isCurrentMonth: false,
      id: `prev-${i}`
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
      id: `curr-${i}`
    });
  }

  // Next month padding
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    cells.push({
      date: new Date(nextYear, nextMonth, i),
      isCurrentMonth: false,
      id: `next-${i}`
    });
  }

  const getFormattedButtonDate = () => {
    if (!value) return placeholder;
    const parts = value.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return value;
  };

  const isToday = (cellDate) => {
    return cellDate.getDate() === todayDate.getDate() &&
           cellDate.getMonth() === todayDate.getMonth() &&
           cellDate.getFullYear() === todayDate.getFullYear();
  };

  const isSelected = (cellDate) => {
    if (!value) return false;
    const parts = value.split('-');
    if (parts.length === 3) {
      return cellDate.getDate() === parseInt(parts[2]) &&
             cellDate.getMonth() === parseInt(parts[1]) - 1 &&
             cellDate.getFullYear() === parseInt(parts[0]);
    }
    return false;
  };

  return (
    <div ref={dropdownRef} className={`relative flex-1 min-w-[140px] ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-input rounded-xl pl-11 pr-10 py-2.5 text-xs font-semibold focus:outline-none cursor-pointer flex items-center justify-between text-left h-[38px] relative"
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <span className={value ? 'text-white font-bold truncate' : 'text-slate-400 font-semibold truncate'}>
            {getFormattedButtonDate()}
          </span>
        </div>
        {value && (
          <span
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-white text-slate-400 p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Calendar Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[100] left-0 mt-2 glass-modal rounded-2xl border border-white/10 shadow-2xl p-4 w-72"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-white">
                {monthNames[month]} {year}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
              {daysOfWeek.map((day) => (
                <span key={day} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-1">
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {cells.map((cell) => {
                const cellSelected = isSelected(cell.date);
                const cellToday = isToday(cell.date);
                return (
                  <button
                    key={cell.id}
                    type="button"
                    onClick={() => handleSelectDay(cell.date)}
                    className={`h-7 w-7 mx-auto rounded-lg text-[10px] font-bold transition-all flex items-center justify-center relative ${
                      !cell.isCurrentMonth
                        ? 'text-slate-600 hover:bg-white/[0.02]'
                        : cellSelected
                        ? 'bg-gradient-to-r from-brand-violet to-indigo-600 text-white font-black shadow-glow-violet'
                        : cellToday
                        ? 'border border-brand-cyan/40 text-brand-cyan hover:bg-white/5'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Calendar Footer Actions */}
            <div className="flex gap-2 pt-3 mt-3 border-t border-white/5 text-[10px] font-bold">
              <button
                type="button"
                onClick={handleSelectToday}
                className="btn-premium btn-secondary rounded-lg py-1.5 px-3 flex-1 text-center text-white"
              >
                Today
              </button>
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="btn-premium btn-danger rounded-lg py-1.5 px-3 flex-1 text-center"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default DatePicker;
