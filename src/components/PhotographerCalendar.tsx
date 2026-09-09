import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  Plus,
  Camera,
} from 'lucide-react';
import { PhotographerProfile, DayStatus, ShootBooking } from '../types';
import { formatDateKey, formatDateDayMonth, APP_CURRENT_YEAR, APP_CURRENT_MONTH } from '../utils/storage';

interface PhotographerCalendarProps {
  photographers: PhotographerProfile[];
  activePhotographer: PhotographerProfile;
  onSelectPhotographer: (id: string) => void;
  availability: Record<string, Record<string, DayStatus>>;
  onToggleDateStatus: (date: string, newStatus: DayStatus) => void;
  onOpenCreateProfile: () => void;
  shoots?: ShootBooking[];
  onSwitchToShoots?: () => void;
  isAdmin?: boolean;
}

export const PhotographerCalendar: React.FC<PhotographerCalendarProps> = ({
  photographers,
  activePhotographer,
  onSelectPhotographer,
  availability,
  onToggleDateStatus,
  onOpenCreateProfile,
  shoots = [],
  onSwitchToShoots,
  isAdmin = false,
}) => {
  // Always default to current month: September 2026
  const [currentDate, setCurrentDate] = useState(() => new Date(APP_CURRENT_YEAR, APP_CURRENT_MONTH, 1));
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // No past months: only current month and next upcoming months
  const isAtCurrentMonth = year === APP_CURRENT_YEAR && month <= APP_CURRENT_MONTH;

  const prevMonth = () => {
    if (!isAtCurrentMonth) {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(APP_CURRENT_YEAR, APP_CURRENT_MONTH, 1));

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayNamesFull = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Current active photographer's availability dictionary
  const activeAvail = availability[activePhotographer.id] || {};

  // Count calendar availability for current month
  let availableDaysCount = 0;
  let bookedDaysCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const key = formatDateKey(new Date(year, month, d));
    const status = activeAvail[key] || 'available';
    if (status === 'available') availableDaysCount++;
    else if (status === 'booked') bookedDaysCount++;
  }

  const todayKey = formatDateKey(new Date(APP_CURRENT_YEAR, APP_CURRENT_MONTH, 8));

  // Handle direct click on a date
  const handleDateClick = (dateKey: string) => {
    setSelectedDateModal(dateKey);
  };

  const handleSelectStatus = (dateKey: string, status: DayStatus) => {
    onToggleDateStatus(dateKey, status);
    setSelectedDateModal(null);
  };

  const modalCurrentStatus = selectedDateModal
    ? activeAvail[selectedDateModal] || 'available'
    : 'available';

  return (
    <div id="photographer-calendar-wrapper" className="space-y-4">
      {/* Photographer Switcher & Month Navigation Header */}
      <div className="bg-[#0b1733] border border-[#1d3870] rounded-3xl p-4 sm:p-5 text-stone-100 shadow-md space-y-4">
        {/* Active Photographer Header */}
        {isAdmin ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#182f5e]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-stone-400 font-semibold">Switch Photographer:</span>
                <select
                  id="select-active-photographer"
                  value={activePhotographer.id}
                  onChange={(e) => onSelectPhotographer(e.target.value)}
                  className="bg-[#060e22] border border-[#1d3870] rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#d4f770] cursor-pointer max-w-[200px] sm:max-w-none"
                >
                  {photographers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city})
                    </option>
                  ))}
                </select>
                <button
                  id="btn-add-new-photographer-header"
                  type="button"
                  onClick={onOpenCreateProfile}
                  className="text-xs text-[#d4f770] hover:underline font-bold inline-flex items-center gap-1 ml-1 transition"
                  title="Onboard another photographer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photographer</span>
                </button>
              </div>
              <p className="text-xs text-stone-300 font-medium mt-1">
                {activePhotographer.title} • <span className="text-[#d4f770] font-semibold">{activePhotographer.city}</span>
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                Admin Master View
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#182f5e]">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${
                  activePhotographer.avatarColor || 'from-amber-600 to-amber-700'
                } text-white flex items-center justify-center font-bold text-sm shadow-md`}
              >
                {activePhotographer.name[0]}
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{activePhotographer.name}'s Schedule</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4f770]/20 text-[#d4f770] border border-[#d4f770]/40 font-mono font-bold">
                    Partner Portal
                  </span>
                </h2>
                <p className="text-xs text-stone-300 font-medium">
                  {activePhotographer.title} • <span className="text-[#d4f770] font-semibold">{activePhotographer.city}</span>
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-stone-400">Click any date to update your Available or Booked status</span>
            </div>
          </div>
        )}

        {/* Booked & Available counts on LEFT side ABOVE September 2026 */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          {/* LEFT SIDE: Booked and Available will be ABOVE of September */}
          <div className="space-y-1.5">
            {/* Booked and Available pill tags ABOVE the month */}
            <div className="flex items-center gap-3 text-xs font-mono font-bold">
              <span className="text-[#d4f770] flex items-center gap-1.5 bg-[#060e22] px-2.5 py-1 rounded-xl border border-[#1d3870]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4f770] inline-block shadow-[0_0_8px_#d4f770]" />
                <span>{bookedDaysCount} Booked</span>
              </span>
              <span className="text-white flex items-center gap-1.5 bg-[#060e22] px-2.5 py-1 rounded-xl border border-[#1d3870]">
                <span className="w-2.5 h-2.5 rounded-full bg-white inline-block shadow-[0_0_8px_white]" />
                <span>{availableDaysCount} Available</span>
              </span>
            </div>

            {/* September 2026 Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {monthNames[month]} {year}
            </h3>
          </div>

          {/* RIGHT SIDE: Month Selector & Navigation Controls (Current & Upcoming Only) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Direct Month Selector Dropdown - Only Current Month (September 2026) and Upcoming Months */}
            <select
              id="select-calendar-month-year"
              value={`${year}-${month}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number);
                setCurrentDate(new Date(y, m, 1));
              }}
              className="bg-[#060e22] border border-[#1d3870] rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#d4f770] cursor-pointer"
              title="Jump to current or upcoming months"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((offset) => {
                const d = new Date(APP_CURRENT_YEAR, APP_CURRENT_MONTH + offset, 1);
                const yVal = d.getFullYear();
                const mVal = d.getMonth();
                const isCurrent = offset === 0;
                return (
                  <option key={`${yVal}-${mVal}`} value={`${yVal}-${mVal}`}>
                    {monthNames[mVal]} {yVal} {isCurrent ? '(Current)' : ''}
                  </option>
                );
              })}
            </select>

            {/* Navigation buttons: Prev (disabled on current month), Month Name, Next */}
            <div className="flex items-center gap-1 bg-[#060e22] p-1 rounded-2xl border border-[#1d3870]">
              <button
                id="btn-cal-prev"
                type="button"
                disabled={isAtCurrentMonth}
                onClick={prevMonth}
                className={`p-1.5 rounded-xl transition ${
                  isAtCurrentMonth
                    ? 'text-stone-600 cursor-not-allowed opacity-30'
                    : 'hover:bg-[#112349] text-stone-300'
                }`}
                aria-label="Previous month"
                title={isAtCurrentMonth ? 'Cannot go to past months' : 'Previous month'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="btn-cal-today"
                type="button"
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-semibold text-stone-300 hover:text-white transition"
                title="Current Month"
              >
                {monthNames[month]}
              </button>
              <button
                id="btn-cal-next"
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-xl hover:bg-[#112349] text-stone-300 transition"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Only Calendar (No Agenda view, as requested) */}
      <div className="bg-[#0b1733] border border-[#1d3870] rounded-3xl overflow-hidden shadow-md">
        {/* Day of Week Header */}
        <div className="grid grid-cols-7 border-b border-[#182f5e] bg-[#060e22] text-center py-2">
          {dayNamesFull.map((d, i) => (
            <div
              key={d}
              className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                i === 0 || i === 6 ? 'text-[#d4f770]' : 'text-stone-400'
              }`}
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{dayNamesShort[i]}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 auto-rows-fr bg-[#0b1733] divide-x divide-y divide-[#182f5e]">
          {/* Previous month filler */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div
              key={`prev-${idx}`}
              className="h-12 sm:min-h-[85px] p-1.5 sm:p-2 bg-[#060c1c]/50 opacity-25 text-stone-600 cursor-default"
            >
              <span className="text-[11px] sm:text-xs font-mono">
                {daysInPrevMonth - firstDayIndex + idx + 1}
              </span>
            </div>
          ))}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateKey = formatDateKey(new Date(year, month, dayNum));
            const status: DayStatus = activeAvail[dateKey] || 'available';
            const isBooked = status === 'booked';
            const isToday = dateKey === todayKey;

            return (
              <div
                key={dateKey}
                id={`photographer-day-${dateKey}`}
                onClick={() => handleDateClick(dateKey)}
                className={`min-h-[58px] sm:min-h-[85px] p-1.5 sm:p-2.5 transition relative flex flex-col justify-between cursor-pointer group select-none ${
                  isBooked
                    ? 'bg-[#d4f770]/10 hover:bg-[#d4f770]/18 border-t sm:border-t-0 border-[#d4f770]/40'
                    : 'hover:bg-[#112349]/70'
                } ${isToday ? 'ring-2 ring-[#d4f770] ring-inset' : ''}`}
                title={`Tap to toggle ${dateKey} between Available (White) and Booked (Green)`}
              >
                {/* Date number only (no month name, no 'available' text) */}
                <div className="flex items-start justify-between">
                  <span
                    className={`text-xs sm:text-sm font-mono font-bold ${
                      isToday
                        ? 'px-1.5 py-0.5 rounded-md bg-[#d4f770] text-[#0a152e] font-black shadow-xs'
                        : isBooked
                        ? 'text-[#d4f770] font-black'
                        : 'text-stone-200 group-hover:text-white'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* On Booked days: Show Booked indicator */}
                  {isBooked && (
                    <>
                      <div className="hidden sm:block">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#d4f770] text-[#0a152e] tracking-wider flex items-center gap-1 shadow-xs">
                          <Camera className="w-2.5 h-2.5" />
                          <span>BOOKED</span>
                        </span>
                      </div>
                      <div className="sm:hidden mt-0.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#d4f770] ring-2 ring-[#d4f770]/50 inline-block shadow-[0_0_8px_#d4f770]" />
                      </div>
                    </>
                  )}
                </div>

                {/* Desktop Footer: Only on Booked days */}
                {isBooked && (
                  <div className="hidden sm:block mt-2 text-[10px]">
                    <p className="text-[#d4f770] font-bold truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4f770] shrink-0" />
                      <span>Shoot Booked</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP 2-CHOICE STATUS MODAL - Strict Colors (Booked=Green, Available=White, No cross icon) */}
      {selectedDateModal && (
        <div
          id="photographer-status-toggle-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedDateModal(null)}
        >
          <div
            className="bg-[#0b1733] border border-[#1d3870] rounded-3xl max-w-sm w-full p-6 text-stone-100 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#d4f770]/15 text-[#d4f770] flex items-center justify-center mx-auto mb-2">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {formatDateDayMonth(selectedDateModal)}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Set date status for <strong className="text-white">{activePhotographer.name}</strong>
              </p>
            </div>

            <div className="p-3 bg-[#060e22] rounded-2xl border border-[#182f5e] text-xs">
              <span className="text-stone-400">Current status: </span>
              <strong
                className={
                  modalCurrentStatus === 'booked' ? 'text-[#d4f770] font-black' : 'text-white font-bold'
                }
              >
                {modalCurrentStatus.toUpperCase()}
              </strong>
            </div>

            {/* ONLY TWO CHOICES: Available (White) or Booked (Green) - NO CROSS SIGN FOR BOOKED! */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                id="btn-modal-mark-available"
                type="button"
                onClick={() => handleSelectStatus(selectedDateModal, 'available')}
                className={`py-4 px-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-2 border shadow-sm min-h-[72px] ${
                  modalCurrentStatus === 'available'
                    ? 'bg-white text-[#0a152e] border-white ring-2 ring-white/60 font-black'
                    : 'bg-[#060e22] hover:bg-[#112349] text-stone-200 border-[#1d3870]'
                }`}
              >
                <Check className="w-5 h-5 stroke-3" />
                <span>Available</span>
              </button>

              <button
                id="btn-modal-mark-booked"
                type="button"
                onClick={() => handleSelectStatus(selectedDateModal, 'booked')}
                className={`py-4 px-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-2 border shadow-sm min-h-[72px] ${
                  modalCurrentStatus === 'booked'
                    ? 'bg-[#d4f770] text-[#0a152e] border-[#d4f770] ring-2 ring-[#d4f770]/60 font-black'
                    : 'bg-[#060e22] hover:bg-[#112349] text-stone-200 border-[#1d3870]'
                }`}
              >
                <Camera className="w-5 h-5" />
                <span>Booked</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDateModal(null)}
              className="w-full py-2.5 rounded-xl text-xs text-stone-400 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
