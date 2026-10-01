import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { PhotographerProfile, DayStatus, ShootBooking } from '../types';
import {
  formatDateKey,
  APP_CURRENT_YEAR,
  APP_CURRENT_MONTH,
} from '../utils/storage';

interface PhotographerAvailabilityPickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  photographer: PhotographerProfile;
  availability?: Record<string, Record<string, DayStatus>>;
  shoots?: ShootBooking[];
  id?: string;
}

export const PhotographerAvailabilityPicker: React.FC<PhotographerAvailabilityPickerProps> = ({
  value,
  onChange,
  photographer,
  availability = {},
  shoots = [],
  id = 'photographer-availability-picker',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected value or default to today's date
  const parseDate = (str: string): Date => {
    if (!str) return new Date();
    const [y, m, d] = str.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  };

  const selectedDateObj = parseDate(value);

  // Month navigation inside popover
  const [displayMonth, setDisplayMonth] = useState<Date>(
    () => new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1)
  );

  // Keep display month in sync if value changes externally
  useEffect(() => {
    const d = parseDate(value);
    setDisplayMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  // Click outside to close
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

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Calendar math
  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const weekDayShorts = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const todayKey = formatDateKey(new Date());
  const now = new Date();
  const isCurrentOrPastMonth =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month <= now.getMonth());

  // Month navigation handlers
  const prevMonth = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isCurrentOrPastMonth) return;
    setDisplayMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDisplayMonth(new Date(year, month + 1, 1));
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const curTodayKey = formatDateKey(new Date());
    onChange(curTodayKey);
    const nowDate = new Date();
    setDisplayMonth(new Date(nowDate.getFullYear(), nowDate.getMonth(), 1));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  // Photographer availability map
  const photogAvail = availability[photographer.id] || {};

  // Check if a specific date is booked for this photographer
  const isDateBooked = (dateKey: string): boolean => {
    if (photogAvail[dateKey] === 'booked') return true;
    const hasShoot = shoots.some(
      (s) =>
        s.photographerId === photographer.id &&
        s.date === dateKey &&
        s.status !== 'cancelled'
    );
    return hasShoot;
  };

  // Counts for current display month
  let bookedCountInMonth = 0;
  let availableCountInMonth = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (isDateBooked(dKey)) {
      bookedCountInMonth++;
    } else {
      availableCountInMonth++;
    }
  }

  // Formatted date string for input display: DD-MM-YYYY (e.g. 19-09-2026)
  const formatDisplayDate = (str: string): string => {
    if (!str) return 'Select Shoot Date';
    const parts = str.split('-');
    if (parts.length < 3) return str;
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  };

  // Status of currently selected date
  const isSelectedDateBooked = isDateBooked(value);

  return (
    <div ref={containerRef} className="relative w-full select-none" id={id}>
      {/* Clickable Date Display Field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full px-3.5 py-2.5 bg-[#F6F3EC] border rounded-xl flex items-center justify-between cursor-pointer transition shadow-2xs ${
          isOpen
            ? 'border-[#073B2F] ring-1 ring-[#073B2F]/20 bg-white'
            : 'border-[#DCE7D4] hover:border-[#073B2F] hover:bg-white'
        }`}
        title="Click to open photographer availability calendar"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon className="w-4 h-4 text-[#073B2F] shrink-0" />
          <span className="text-xs font-mono font-bold text-[#073B2F] tracking-wide">
            {formatDisplayDate(value)}
          </span>
        </div>

        {/* Right side: Only show Booked warning if date is booked */}
        <div className="flex items-center gap-2">
          {isSelectedDateBooked && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
              <span>Booked</span>
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#5C6E5E] transition-transform ${
              isOpen ? 'rotate-180 text-[#073B2F]' : ''
            }`}
          />
        </div>
      </div>

      {/* Floating Calendar Popover: Compact size with Shoot Lobby styling */}
      {isOpen && (
        <div
          id="photographer-availability-calendar-popover"
          className="absolute left-0 top-full mt-1.5 z-[150] w-[275px] sm:w-[285px] max-w-[calc(100vw-36px)] bg-white border border-[#DCE7D4] rounded-2xl shadow-[0_16px_40px_-8px_rgba(7,59,47,0.15)] p-3 text-[#073B2F] space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Row: Month selector & navigation arrows */}
          <div className="flex items-center justify-between pb-1.5 border-b border-[#DCE7D4]">
            {/* Month & Year Dropdown */}
            <div className="flex items-center gap-1">
              <select
                value={`${year}-${month}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-').map(Number);
                  setDisplayMonth(new Date(y, m, 1));
                }}
                className="bg-[#F6F3EC] border border-[#DCE7D4] text-[#073B2F] font-bold text-xs tracking-tight cursor-pointer focus:outline-none py-1 px-2 rounded-lg hover:bg-[#eae5da]"
                title="Select Month and Year"
              >
                {[0, 1, 2, 3, 4, 5].map((offset) => {
                  const d = new Date(APP_CURRENT_YEAR, APP_CURRENT_MONTH + offset, 1);
                  const yVal = d.getFullYear();
                  const mVal = d.getMonth();
                  return (
                    <option
                      key={`${yVal}-${mVal}`}
                      value={`${yVal}-${mVal}`}
                      className="bg-white text-[#073B2F]"
                    >
                      {monthNames[mVal]}, {yVal}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Up & Down arrow buttons */}
            <div className="flex items-center gap-0.5 text-[#5C6E5E]">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 rounded-md hover:bg-[#F6F3EC] hover:text-[#073B2F] transition"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-md hover:bg-[#F6F3EC] hover:text-[#073B2F] transition"
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Photographer Availability Status */}
          <div className="bg-[#F6F3EC] rounded-xl border border-[#DCE7D4] px-2.5 py-1.5 text-[11px] space-y-0.5">
            <div className="font-bold text-[#073B2F] truncate">
              Schedule of {photographer.name.split(' ')[0]} for this month
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#5C6E5E] font-medium">
              <span className="text-amber-800 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                <span>{bookedCountInMonth} Booked</span>
              </span>
              <span className="text-[#073B2F] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>{availableCountInMonth} Available</span>
              </span>
            </div>
          </div>

          {/* Weekday headers: Su Mo Tu We Th Fr Sa */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#5C6E5E]">
            {weekDayShorts.map((w) => (
              <div key={w} className="py-0.5">
                {w}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-xs">
            {/* Trailing days from previous month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const prevDayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
              return (
                <div
                  key={`prev-filler-${i}`}
                  className="h-7 w-7 mx-auto flex items-center justify-center text-stone-300 font-mono text-[11px] select-none"
                >
                  {prevDayNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const isSelected = dateStr === value;
              const isToday = dateStr === todayKey;
              const booked = isDateBooked(dateStr);
              const isPast = dateStr < todayKey;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    if (isPast) return;
                    onChange(dateStr);
                    setIsOpen(false);
                  }}
                  className={`h-7 w-7 mx-auto rounded-lg flex flex-col items-center justify-center font-mono text-[11px] font-bold transition relative ${
                    isPast
                      ? 'text-stone-300 bg-stone-50/50 cursor-not-allowed opacity-35 select-none'
                      : isSelected
                      ? 'bg-[#073B2F] text-white font-black shadow-xs scale-105'
                      : isToday
                      ? 'border border-[#073B2F] text-[#073B2F] bg-[#F0FFDA] hover:bg-[#e4f9c5]'
                      : booked
                      ? 'bg-amber-50 text-amber-900 border border-amber-300/80 hover:bg-amber-100 font-extrabold'
                      : 'text-[#073B2F] hover:bg-[#F6F3EC] hover:text-[#073B2F]'
                  }`}
                  title={
                    isPast
                      ? 'Past date cannot be selected'
                      : `${dayNum} ${monthNames[month]} ${year} — ${
                          booked ? 'Booked (Busy)' : 'Available'
                        }`
                  }
                >
                  <span className="leading-none">{dayNum}</span>

                  {/* On booked day: subtle amber indicator dot */}
                  {booked && !isSelected && !isPast && (
                    <span className="w-1 h-1 rounded-full bg-amber-600 mt-0.5" />
                  )}
                </button>
              );
            })}

            {/* Leading days into next month to complete the 7xN grid */}
            {(() => {
              const totalCells = firstDayOfWeek + daysInMonth;
              const remainder = (7 - (totalCells % 7)) % 7;
              return Array.from({ length: remainder }).map((_, i) => (
                <div
                  key={`next-filler-${i}`}
                  className="h-7 w-7 mx-auto flex items-center justify-center text-stone-300 font-mono text-[11px] select-none"
                >
                  {i + 1}
                </div>
              ));
            })()}
          </div>

          {/* Footer: "Clear" on left, "Today" on right */}
          <div className="flex items-center justify-between pt-1.5 border-t border-[#DCE7D4] text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-[#5C6E5E] hover:text-[#073B2F] font-semibold transition py-0.5 px-1.5 rounded hover:bg-[#F6F3EC] text-[11px]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[#073B2F] hover:text-[#052d24] font-bold transition py-0.5 px-1.5 rounded hover:bg-[#F0FFDA] text-[11px]"
            >
              Today
            </button>
          </div>

          {/* Return notice */}
          <div className="text-[10px] pt-1 text-center font-sans border-t border-[#DCE7D4]">
            {isSelectedDateBooked ? (
              <p className="text-amber-800 bg-amber-50 rounded-lg py-1 px-2 font-semibold flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>{photographer.name.split(' ')[0]} is booked on this date</span>
              </p>
            ) : (
              <p className="text-[#073B2F] bg-[#F0FFDA] rounded-lg py-1 px-2 font-semibold flex items-center justify-center">
                <span>Schedule of {photographer.name.split(' ')[0]} for this month</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
