import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  ArrowRight,
  Clock,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { PhotographerProfile, ShootBooking, DayStatus } from '../types';
import {
  formatDateKey,
  formatDateDayMonth,
  APP_CURRENT_YEAR,
  APP_CURRENT_MONTH,
} from '../utils/storage';
import { ShootLobbyLogo } from './ShootLobbyLogo';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface PhotographerScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographer: PhotographerProfile | null;
  targetDate: string;
  availability: Record<string, Record<string, DayStatus>>;
  shoots: ShootBooking[];
  onSelectDateAndBook: (photographer: PhotographerProfile, date: string) => void;
}

export const PhotographerScheduleModal: React.FC<PhotographerScheduleModalProps> = ({
  isOpen,
  onClose,
  photographer,
  targetDate,
  availability,
  shoots,
  onSelectDateAndBook,
}) => {
  // Hooks must always be declared unconditionally at the top of the component
  const [selectedDate, setSelectedDate] = useState<string>(
    targetDate || formatDateKey(new Date())
  );

  const initialDateObj = targetDate ? new Date(targetDate) : new Date();
  const [currentYear, setCurrentYear] = useState<number>(
    isNaN(initialDateObj.getFullYear()) ? new Date().getFullYear() : initialDateObj.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    isNaN(initialDateObj.getMonth()) ? new Date().getMonth() : initialDateObj.getMonth()
  );

  // Sync state whenever modal is opened or targetDate changes
  React.useEffect(() => {
    if (isOpen && targetDate) {
      setSelectedDate(targetDate);
      const d = new Date(targetDate);
      if (!isNaN(d.getFullYear())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [isOpen, targetDate]);

  // Lock body scroll when modal is open to prevent background scrolling on mobile
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  if (!isOpen || !photographer) return null;

  const firstName = photographer.name.split(' ')[0];

  // Calendar math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const todayKey = formatDateKey(new Date());
  const now = new Date();
  const isCurrentOrPastMonth =
    currentYear < now.getFullYear() ||
    (currentYear === now.getFullYear() && currentMonth <= now.getMonth());

  // Find all booked shoots for this photographer in the current viewed month
  const photographerShoots = shoots.filter((s) => s.photographerId === photographer.id);

  // Month navigation
  const prevMonth = () => {
    if (isCurrentOrPastMonth) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Helper to check if a specific day is booked
  const isDateBooked = (day: number) => {
    const dateKey = formatDateKey(new Date(currentYear, currentMonth, day));
    const dayAvailability = availability[dateKey]?.[photographer.id];
    const hasShoot = photographerShoots.some(
      (s) => s.date === dateKey && s.status !== 'cancelled'
    );
    return hasShoot || dayAvailability === 'booked';
  };

  // Month summary counts
  let bookedCount = 0;
  let availableCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (isDateBooked(d)) {
      bookedCount++;
    } else {
      availableCount++;
    }
  }

  // Selected day status
  const selectedDateParts = selectedDate.split('-');
  const isSelectedDateInView =
    parseInt(selectedDateParts[0], 10) === currentYear &&
    parseInt(selectedDateParts[1], 10) - 1 === currentMonth;
  const selectedDayNum = isSelectedDateInView ? parseInt(selectedDateParts[2], 10) : null;
  const isSelectedBooked = selectedDayNum ? isDateBooked(selectedDayNum) : false;

  // Shoots scheduled specifically for this month
  const currentMonthShoots = photographerShoots.filter((s) => {
    if (s.status === 'cancelled') return false;
    const parts = s.date.split('-');
    return (
      parseInt(parts[0], 10) === currentYear &&
      parseInt(parts[1], 10) - 1 === currentMonth
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-hidden overscroll-contain select-none"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-[#DCE7D4] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-[#073B2F] overscroll-contain touch-pan-y"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="shrink-0 p-4 sm:p-6 border-b border-[#DCE7D4] flex items-start justify-between gap-3 bg-[#F6F3EC]">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <img
              src={
                photographer.avatarUrl ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
              }
              alt={photographer.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover border border-[#DCE7D4] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#073B2F] leading-tight truncate font-['Space_Grotesk',sans-serif]">
                  {photographer.name}
                </h3>
                <span className="bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#073B2F]" />
                  <span>Available</span>
                </span>
              </div>
              <p className="text-xs text-[#5C6E5E] mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#5C6E5E] shrink-0" />
                <span>
                  {photographer.city} • {photographer.experienceYears}+ yrs exp
                </span>
              </p>
              <div className="mt-0.5">
                <p className="text-xs font-semibold text-[#FF6A45] truncate">
                  {photographer.title}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F6F3EC] hover:bg-[#eae5da] active:scale-95 text-[#5C6E5E] flex items-center justify-center transition shrink-0 border border-[#DCE7D4]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
          {/* Headline & Month Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F6F3EC] border border-[#DCE7D4] p-3.5 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-[#073B2F] font-['Space_Grotesk',sans-serif]">
                  Schedule of {firstName} for {MONTH_NAMES[currentMonth]}
                </h4>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs font-semibold">
                <span className="text-amber-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  <span>{bookedCount} Booked</span>
                </span>
                <span className="text-[#073B2F] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>{availableCount} Available Days</span>
                </span>
              </div>
            </div>

            {/* Prev/Next Month Controls */}
            <div className="flex items-center gap-1 self-start sm:self-auto bg-white border border-[#DCE7D4] rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                disabled={isCurrentOrPastMonth}
                onClick={prevMonth}
                className={`p-1.5 rounded-lg transition ${
                  isCurrentOrPastMonth
                    ? 'text-stone-300 cursor-not-allowed opacity-30'
                    : 'hover:bg-[#F6F3EC] text-[#073B2F]'
                }`}
                title={isCurrentOrPastMonth ? 'Cannot navigate to past months' : 'Previous Month'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-[#073B2F] px-2 min-w-[100px] text-center">
                {MONTH_NAMES[currentMonth].slice(0, 3)} {currentYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-[#F6F3EC] text-[#073B2F] transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white border border-[#DCE7D4] rounded-2xl p-4 shadow-2xs">
            {/* Day labels */}
            <div className="grid grid-cols-7 mb-2 text-center">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="text-[11px] font-bold text-[#5C6E5E] uppercase py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {/* Previous month filler cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`fill-${i}`} className="h-9 rounded-xl text-stone-300 flex items-center justify-center text-xs">
                  •
                </div>
              ))}

              {/* Days of current month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = formatDateKey(new Date(currentYear, currentMonth, day));
                const isSelected = selectedDate === dateKey;
                const booked = isDateBooked(day);
                const isPast = dateKey < todayKey;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    disabled={isPast}
                    onClick={() => {
                      if (isPast) return;
                      setSelectedDate(dateKey);
                    }}
                    className={`h-9 w-full rounded-xl text-xs font-bold transition flex flex-col items-center justify-center relative ${
                      isPast
                        ? 'bg-stone-50/50 text-stone-300 border border-stone-100 cursor-not-allowed opacity-35 select-none'
                        : isSelected
                        ? 'bg-[#073B2F] text-white shadow-xs ring-2 ring-[#073B2F]/20'
                        : booked
                        ? 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:border-amber-400'
                        : 'bg-[#F6F3EC]/70 text-[#073B2F] border border-[#DCE7D4] hover:border-[#073B2F] hover:bg-[#F0FFDA]'
                    }`}
                    title={isPast ? 'Past date cannot be selected' : undefined}
                  >
                    <span>{day}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isPast
                          ? 'bg-transparent'
                          : isSelected
                          ? 'bg-white'
                          : booked
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-[#DCE7D4] text-[11px] text-[#5C6E5E] font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Booked / Reserved</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#073B2F]" />
                <span>Selected</span>
              </span>
            </div>
          </div>

          {/* Selected Date Action Card */}
          <div className="bg-[#F6F3EC] border border-[#DCE7D4] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-[#5C6E5E] uppercase tracking-wider">
                Selected Date
              </div>
              <div className="text-sm sm:text-base font-bold text-[#073B2F] mt-0.5">
                {formatDateDayMonth(selectedDate)}
              </div>
              <div className="mt-1 text-xs">
                {isSelectedBooked ? (
                  <span className="text-amber-800 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Already booked for a shoot on this date</span>
                  </span>
                ) : (
                  <span className="text-[#073B2F] font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Open & available for booking</span>
                  </span>
                )}
              </div>
            </div>

            {/* Book button for selected date */}
            <button
              type="button"
              disabled={isSelectedBooked}
              onClick={() => onSelectDateAndBook(photographer, selectedDate)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shrink-0 ${
                isSelectedBooked
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-[#FF6A45] hover:bg-[#e55835] active:scale-95 text-white shadow-xs'
              }`}
            >
              <span>Book for {formatDateDayMonth(selectedDate)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scheduled Shoots & Bookings list for this month */}
          <div>
            <h5 className="text-xs font-bold text-[#073B2F] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#073B2F]" />
              <span>Bookings & Scheduled Shoots in {MONTH_NAMES[currentMonth]}</span>
            </h5>

            {currentMonthShoots.length === 0 ? (
              <div className="p-3.5 bg-[#F0FFDA] border border-[#DCE7D4] rounded-2xl text-xs text-[#073B2F] font-medium">
                {firstName} has no active shoots booked in {MONTH_NAMES[currentMonth]}. All available dates are wide open for booking!
              </div>
            ) : (
              <div className="space-y-2">
                {currentMonthShoots.map((shoot) => (
                  <div
                    key={shoot.id}
                    className="p-3 bg-white border border-[#DCE7D4] rounded-xl flex items-center justify-between text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#F0FFDA] text-[#073B2F] flex items-center justify-center font-bold text-[11px] shrink-0">
                        {shoot.date.split('-')[2]}
                      </div>
                      <div>
                        <div className="font-bold text-[#073B2F]">{shoot.shootType}</div>
                        <div className="text-[11px] text-[#5C6E5E]">
                          {formatDateDayMonth(shoot.date)} • {shoot.clientName || 'Reserved'}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Booked
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#DCE7D4] bg-[#F6F3EC] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-[#073B2F] hover:bg-[#eae5da] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
