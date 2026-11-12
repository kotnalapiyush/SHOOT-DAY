import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react';
import { formatDateKey } from '../utils/storage';

interface CustomDatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  minDate?: string; // e.g. '2026-09-01'
  id?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  minDate,
  id = 'custom-event-date-picker',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parseDate = (str: string): Date => {
    if (!str) return new Date();
    const [y, m, d] = str.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  };

  const currentDate = parseDate(value);

  // State for navigating the calendar month inside the popover
  const [displayMonth, setDisplayMonth] = useState<Date>(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );

  // Sync display month when value changes externally
  useEffect(() => {
    const d = parseDate(value);
    setDisplayMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  // Click outside listener to close the popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Month navigation
  const prevMonth = () => {
    setDisplayMonth(
      new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setDisplayMonth(
      new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1)
    );
  };

  // Step day backward/forward
  const stepDay = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newD = new Date(currentDate.getTime() + delta * 86400000);
    const key = formatDateKey(newD);
    if (minDate && key < minDate) return;
    onChange(key);
  };

  // Generate calendar days for displayMonth
  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Format value to DD - MM - YYYY (matching screenshot)
  const formatDisplayDate = (str: string) => {
    if (!str) return 'Select Date';
    const [y, m, d] = str.split('-');
    if (!y || !m || !d) return str;
    return `${d.padStart(2, '0')} - ${m.padStart(2, '0')} - ${y}`;
  };

  const weekDayShorts = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div ref={containerRef} className="relative w-full select-none" id={id}>
      {/* Main Clickable Date Field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#F6F3EC] border rounded-xl pl-3.5 pr-2.5 py-2.5 flex items-center justify-between text-xs font-mono font-bold text-[#12201A] cursor-pointer transition shadow-2xs ${
          isOpen
            ? 'border-[#33684C] ring-1 ring-[#33684C]/40'
            : 'border-[#E3EEE7] hover:border-[#33684C]/60'
        }`}
        title="Click to open calendar and choose shoot date"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-[#33684C] shrink-0" />
          <span className="text-[#12201A] tracking-wider text-xs">
            {formatDisplayDate(value)}
          </span>
        </div>

        {/* Subtle quick prev/next day arrow steppers */}
        <div className="flex items-center gap-0.5 text-[#5C6E5E]">
          <button
            type="button"
            onClick={(e) => stepDay(-1, e)}
            className="p-1 hover:text-[#33684C] hover:bg-white rounded-md transition"
            title="Previous Day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => stepDay(1, e)}
            className="p-1 hover:text-[#33684C] hover:bg-white rounded-md transition"
            title="Next Day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Dropdown Calendar Popover */}
      {isOpen && (
        <div
          id="custom-date-picker-popover"
          className="absolute left-0 top-full mt-2 z-[100] w-72 sm:w-80 bg-white border border-[#E3EEE7] rounded-2xl shadow-xl p-4 text-[#12201A] space-y-3 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Calendar Header: Month, Year & Arrows */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E3EEE7]">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-[#5C6E5E] hover:text-[#33684C] hover:bg-[#F6F3EC] transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-base text-[#12201A] tracking-wide font-headline">
              {monthNames[month]} {year}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-[#5C6E5E] hover:text-[#33684C] hover:bg-[#F6F3EC] transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-[#5C6E5E]">
            {weekDayShorts.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const isSelected = dateStr === value;
              const isDisabled = Boolean(minDate && dateStr < minDate);

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(dateStr);
                    setIsOpen(false);
                  }}
                  className={`h-8 w-8 mx-auto rounded-xl flex items-center justify-center font-semibold transition ${
                    isSelected
                      ? 'bg-[#FFDF70] text-[#12201A] font-bold shadow-xs scale-105'
                      : isDisabled
                      ? 'text-stone-300 opacity-40 cursor-not-allowed'
                      : 'text-[#12201A] hover:bg-[#F6F3EC] hover:text-[#33684C] cursor-pointer'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
