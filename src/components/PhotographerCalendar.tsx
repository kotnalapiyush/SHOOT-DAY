import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  Plus,
  Camera,
  Pause,
  Play,
  AlertCircle,
  KeyRound,
  LogOut,
  Users,
  Eye,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { PhotographerProfile, DayStatus, ShootBooking } from '../types';
import { formatDateKey, formatDateDayMonth, APP_CURRENT_YEAR, APP_CURRENT_MONTH } from '../utils/storage';

interface PhotographerCalendarProps {
  photographers: PhotographerProfile[];
  activePhotographer: PhotographerProfile;
  onSelectPhotographer: (id: string) => void;
  availability: Record<string, Record<string, DayStatus>>;
  onToggleDateStatus: (date: string, newStatus: DayStatus) => void;
  onOpenCreateProfile?: () => void;
  onOpenSelfEditProfile?: () => void;
  onOpenAdminAccounts?: () => void;
  onOpenPhotographersManager?: () => void;
  onViewPhotographerDetails?: (photographer: PhotographerProfile) => void;
  onTogglePhotographerStatus?: (photogId: string) => void;
  onDeletePhotographer?: (photogId: string) => void;
  shoots?: ShootBooking[];
  onSwitchToShoots?: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export const PhotographerCalendar: React.FC<PhotographerCalendarProps> = ({
  photographers,
  activePhotographer,
  onSelectPhotographer,
  availability,
  onToggleDateStatus,
  onOpenCreateProfile,
  onOpenSelfEditProfile,
  onOpenAdminAccounts,
  onOpenPhotographersManager,
  onViewPhotographerDetails,
  onTogglePhotographerStatus,
  onDeletePhotographer,
  shoots = [],
  onSwitchToShoots,
  isAdmin = false,
  onLogout,
}) => {
  // Dynamic current date: automatically rolls over day-by-day in real time
  const todayDate = new Date();
  const todayKey = formatDateKey(todayDate);
  const currentRealYear = todayDate.getFullYear();
  const currentRealMonth = todayDate.getMonth();
  const currentRealDay = todayDate.getDate();

  const getOrdinalDay = (d: number): string => {
    if (d > 3 && d < 21) return `${d}th`;
    switch (d % 10) {
      case 1:  return `${d}st`;
      case 2:  return `${d}nd`;
      case 3:  return `${d}rd`;
      default: return `${d}th`;
    }
  };

  // Always default to current month of today
  const [currentDate, setCurrentDate] = useState(() => new Date(currentRealYear, currentRealMonth, 1));
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);
  const [onHoldNotice, setOnHoldNotice] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // No past months: only current month and next upcoming months
  const isAtCurrentMonth = year === currentRealYear && month === currentRealMonth;
  const isPastMonth = year < currentRealYear || (year === currentRealYear && month < currentRealMonth);

  const prevMonth = () => {
    if (!isAtCurrentMonth && !isPastMonth) {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(currentRealYear, currentRealMonth, 1));

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

  // Count active calendar availability from today onwards for the month
  let availableDaysCount = 0;
  let bookedDaysCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const key = formatDateKey(new Date(year, month, d));
    const isPastDate = key < todayKey;
    const status = activeAvail[key] || 'available';
    if (!isPastDate) {
      if (status === 'available') availableDaysCount++;
      else if (status === 'booked') bookedDaysCount++;
    }
  }

  // Handle direct click on a date
  const handleDateClick = (dateKey: string) => {
    // Past dates cannot be touched or modified
    if (dateKey < todayKey) {
      return;
    }
    if (!isAdmin && activePhotographer.status === 'on_hold') {
      setOnHoldNotice(true);
      setTimeout(() => setOnHoldNotice(false), 4500);
      return;
    }
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
      {/* Account On Hold Notice Toast for Partner */}
      {onHoldNotice && (
        <div className="p-3.5 bg-amber-500 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Your photographer account is currently ON HOLD. Date status modifications are locked. Contact studio admin to resume.</span>
          </div>
          <button
            type="button"
            onClick={() => setOnHoldNotice(false)}
            className="text-white/80 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-black/20 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Photographer Switcher & Month Navigation Header */}
      <div className="bg-white border border-[#DCE7D4] rounded-3xl p-4 sm:p-5 text-[#073B2F] shadow-xs space-y-4">
        {/* Active Photographer Header */}
        {isAdmin ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE7D4]">
            {/* Top Row: Switcher & Add Photographer button side by side */}
            <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-[#5C6E5E] font-semibold whitespace-nowrap hidden xs:inline">Photographer:</span>
                <select
                  id="select-active-photographer"
                  value={activePhotographer.id}
                  onChange={(e) => onSelectPhotographer(e.target.value)}
                  className="bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#073B2F] focus:outline-none focus:border-[#073B2F] cursor-pointer min-w-0 max-w-[170px] sm:max-w-[220px] truncate"
                >
                  {photographers.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white text-[#073B2F]">
                      {p.name} ({p.city}){p.status === 'on_hold' ? ' ⏸ [On Hold]' : ''}
                    </option>
                  ))}
                </select>

                {activePhotographer.status === 'on_hold' ? (
                  <button
                    type="button"
                    onClick={() => onTogglePhotographerStatus?.(activePhotographer.id)}
                    className="px-2.5 py-1 rounded-lg bg-[#073B2F] hover:bg-[#0c4e3f] text-[#F0FFDA] text-[11px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer active:scale-95 shadow-2xs"
                    title="Click to Activate this photographer for client bookings"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Set Active</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onTogglePhotographerStatus?.(activePhotographer.id)}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer active:scale-95 shadow-2xs"
                    title="Click to Pause / Put this photographer on hold"
                  >
                    <Pause className="w-2.5 h-2.5" />
                    <span>Pause / Hold</span>
                  </button>
                )}

                {/* View Details Button */}
                <button
                  type="button"
                  onClick={() => onViewPhotographerDetails?.(activePhotographer)}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-[#F6F3EC] border border-[#DCE7D4] text-[#073B2F] text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                  title="View full signup details for this photographer"
                >
                  <Eye className="w-3 h-3 text-[#073B2F]" />
                  <span>Details</span>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onDeletePhotographer?.(activePhotographer.id)}
                  className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                  title="Delete photographer profile"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-xl bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] font-bold whitespace-nowrap shadow-2xs">
                Admin Master View
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE7D4]">
            <div className="flex items-center gap-3">
              {activePhotographer.avatarUrl ? (
                <img
                  src={activePhotographer.avatarUrl}
                  alt={activePhotographer.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl object-cover border border-[#DCE7D4] shadow-xs shrink-0"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                    activePhotographer.avatarColor || 'from-[#073B2F] to-[#04241d]'
                  } text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}
                >
                  {activePhotographer.name[0]}
                </div>
              )}
              <div>
                <h2 className="text-base font-bold text-[#073B2F] flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                  <span>{activePhotographer.name}'s Schedule</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] font-mono font-bold">
                    Partner Portal
                  </span>
                  {activePhotographer.status === 'on_hold' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold flex items-center gap-1">
                      <Pause className="w-2.5 h-2.5 fill-current" />
                      <span>On Hold</span>
                    </span>
                  )}
                </h2>
                <p className="text-xs text-[#5C6E5E] font-medium">
                  {activePhotographer.title} • <span className="text-[#073B2F] font-semibold">{activePhotographer.city}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onOpenSelfEditProfile && (
                <button
                  type="button"
                  id="btn-partner-self-edit-profile"
                  onClick={onOpenSelfEditProfile}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#073B2F] hover:bg-[#0c4e3f] text-white transition shadow-xs shrink-0 active:scale-[0.98]"
                  title="Edit your photo, portfolio link, and change password"
                >
                  <Camera className="w-3.5 h-3.5 text-[#FF6A45]" />
                  <span>Edit My Profile & Portfolio</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Prominent On-Hold Alert Banner */}
        {activePhotographer.status === 'on_hold' && (
          <div className="flex items-start sm:items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Pause className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold flex items-center gap-2">
                <span>Photographer Profile is Currently ON HOLD</span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded font-semibold">
                  Paused
                </span>
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {isAdmin
                  ? `New client bookings and partner calendar editing are paused for ${activePhotographer.name}. Status can be changed in Edit Profile.`
                  : 'Your photographer account is currently paused by studio management. You cannot modify dates or accept bookings.'}
                {activePhotographer.holdReason ? ` (Note: ${activePhotographer.holdReason})` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Month Header Section: Dynamic title based on today, only Book & Available counters below, and non-overflowing navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            {/* Direct date title - dynamically updates day by day e.g. "September 24th" */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#073B2F] tracking-tight font-['Space_Grotesk',sans-serif] whitespace-nowrap">
              {isAtCurrentMonth
                ? `${monthNames[currentRealMonth]} ${getOrdinalDay(currentRealDay)}`
                : `${monthNames[month]} ${year}`}
            </h3>

            {/* Below the date: only Book in Green and Available in Orange */}
            <div className="flex items-center gap-2.5 text-xs font-mono font-bold">
              {/* Book in GREEN */}
              <span className="text-[#073B2F] flex items-center gap-1.5 bg-[#F0FFDA] px-3 py-1.5 rounded-xl border border-[#DCE7D4] shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#073B2F] inline-block shadow-2xs" />
                <span>{bookedDaysCount} Book</span>
              </span>
              {/* Available in ORANGE */}
              <span className="text-[#FF6A45] flex items-center gap-1.5 bg-[#FFF4EE] px-3 py-1.5 rounded-xl border border-[#FF6A45]/30 shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A45] inline-block shadow-2xs" />
                <span>{availableDaysCount} Available</span>
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: Compact Month Selector & Arrow Navigation Controls (no text cut-off) */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <select
              id="select-calendar-month-year"
              value={`${year}-${month}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number);
                setCurrentDate(new Date(y, m, 1));
              }}
              className="bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#073B2F] focus:outline-none focus:border-[#073B2F] cursor-pointer"
              title="Select month"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((offset) => {
                const d = new Date(currentRealYear, currentRealMonth + offset, 1);
                const yVal = d.getFullYear();
                const mVal = d.getMonth();
                return (
                  <option key={`${yVal}-${mVal}`} value={`${yVal}-${mVal}`} className="bg-white text-[#073B2F]">
                    {monthNames[mVal]} {yVal}
                  </option>
                );
              })}
            </select>

            {/* Clean compact arrow navigation (prev/next) without cut-off text */}
            <div className="flex items-center bg-[#F6F3EC] p-0.5 rounded-xl border border-[#DCE7D4] shrink-0">
              <button
                id="btn-cal-prev"
                type="button"
                disabled={isAtCurrentMonth}
                onClick={prevMonth}
                className={`p-1.5 rounded-lg transition ${
                  isAtCurrentMonth
                    ? 'text-stone-300 cursor-not-allowed opacity-40'
                    : 'hover:bg-white text-[#073B2F]'
                }`}
                aria-label="Previous month"
                title={isAtCurrentMonth ? 'Cannot go to past months' : 'Previous month'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="btn-cal-next"
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-white text-[#073B2F] transition"
                aria-label="Next month"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Only Calendar */}
      <div className="bg-white border border-[#DCE7D4] rounded-3xl overflow-hidden shadow-xs">
        {/* Day of Week Header */}
        <div className="grid grid-cols-7 border-b border-[#DCE7D4] bg-[#F6F3EC] text-center py-2.5">
          {dayNamesFull.map((d, i) => (
            <div
              key={d}
              className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                i === 0 || i === 6 ? 'text-[#FF6A45]' : 'text-[#5C6E5E]'
              }`}
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{dayNamesShort[i]}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 auto-rows-fr bg-[#DCE7D4] gap-[1px]">
          {/* Previous month filler */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div
              key={`prev-${idx}`}
              className="h-12 sm:min-h-[85px] p-1.5 sm:p-2 bg-[#FAF8F5] text-stone-300 cursor-default"
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
            const isPast = dateKey < todayKey;

            return (
              <div
                key={dateKey}
                id={`photographer-day-${dateKey}`}
                onClick={() => !isPast && handleDateClick(dateKey)}
                className={`min-h-[58px] sm:min-h-[85px] p-1.5 sm:p-2.5 transition relative flex flex-col justify-between select-none ${
                  isPast
                    ? 'bg-[#EFECE6]/90 text-stone-400 cursor-not-allowed border-t sm:border-t-0 border-[#DCE7D4]/60'
                    : isBooked
                    ? 'bg-[#F0FFDA]/50 hover:bg-[#F0FFDA] border-t sm:border-t-0 border-[#DCE7D4] cursor-pointer group'
                    : 'bg-white hover:bg-[#FFF4EE]/60 cursor-pointer group'
                } ${isToday ? 'ring-2 ring-[#FF6A45] ring-inset' : ''}`}
                title={
                  isPast
                    ? `Date ${dateKey} has passed and cannot be modified.`
                    : `Tap to toggle ${dateKey} between Available and Booked`
                }
              >
                {/* Date number */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs sm:text-sm font-mono font-bold ${
                        isToday
                          ? 'px-1.5 py-0.5 rounded-md bg-[#FF6A45] text-white font-black shadow-xs'
                          : isPast
                          ? 'text-stone-400/80'
                          : isBooked
                          ? 'text-[#073B2F] font-black'
                          : 'text-[#5C6E5E] group-hover:text-[#073B2F]'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="hidden sm:inline-block text-[9px] font-mono font-black uppercase px-1 rounded bg-[#FF6A45]/15 text-[#FF6A45]">
                        Today
                      </span>
                    )}
                  </div>

                  {/* On Booked days: Show Booked indicator */}
                  {isBooked && (
                    <>
                      <div className="hidden sm:block">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wider flex items-center gap-1 shadow-2xs ${
                            isPast
                              ? 'bg-stone-300 text-stone-600'
                              : 'bg-[#073B2F] text-white'
                          }`}
                        >
                          <Camera className="w-2.5 h-2.5" />
                          <span>BOOK</span>
                        </span>
                      </div>
                      <div className="sm:hidden mt-0.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full inline-block ${
                            isPast
                              ? 'bg-stone-400'
                              : 'bg-[#073B2F] ring-2 ring-[#073B2F]/30'
                          }`}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Desktop Footer: Booked indicator */}
                {isBooked && (
                  <div className="hidden sm:block mt-2 text-[10px]">
                    <p
                      className={`font-bold truncate flex items-center gap-1 ${
                        isPast ? 'text-stone-500' : 'text-[#073B2F]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isPast ? 'bg-stone-400' : 'bg-[#073B2F]'
                        }`}
                      />
                      <span>{isPast ? 'Past Shoot' : 'Shoot Booked'}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP 2-CHOICE STATUS MODAL */}
      {selectedDateModal && (
        <div
          id="photographer-status-toggle-modal"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedDateModal(null)}
        >
          <div
            className="bg-white border border-[#DCE7D4] rounded-3xl max-w-sm w-full p-6 text-[#073B2F] shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] flex items-center justify-center mx-auto mb-2">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#073B2F] tracking-tight font-['Space_Grotesk',sans-serif]">
                {formatDateDayMonth(selectedDateModal)}
              </h3>
              <p className="text-xs text-[#5C6E5E] mt-0.5">
                Set date status for <strong className="text-[#073B2F]">{activePhotographer.name}</strong>
              </p>
            </div>

            <div className="p-3 bg-[#F6F3EC] rounded-2xl border border-[#DCE7D4] text-xs">
              <span className="text-[#5C6E5E]">Current status: </span>
              <strong
                className={
                  modalCurrentStatus === 'booked' ? 'text-[#073B2F] font-black' : 'text-[#FF6A45] font-black'
                }
              >
                {modalCurrentStatus.toUpperCase()}
              </strong>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Book button in GREEN */}
              <button
                id="btn-modal-mark-booked"
                type="button"
                onClick={() => handleSelectStatus(selectedDateModal, 'booked')}
                className={`py-4 px-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-2 border shadow-xs min-h-[72px] ${
                  modalCurrentStatus === 'booked'
                    ? 'bg-[#073B2F] text-white border-[#073B2F] ring-2 ring-[#073B2F]/20 font-black'
                    : 'bg-[#F6F3EC] hover:bg-[#F0FFDA] text-[#073B2F] border-[#DCE7D4]'
                }`}
              >
                <Camera className="w-5 h-5" />
                <span>Book</span>
              </button>

              {/* Available button in ORANGE */}
              <button
                id="btn-modal-mark-available"
                type="button"
                onClick={() => handleSelectStatus(selectedDateModal, 'available')}
                className={`py-4 px-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-2 border shadow-xs min-h-[72px] ${
                  modalCurrentStatus === 'available'
                    ? 'bg-[#FF6A45] text-white border-[#FF6A45] ring-2 ring-[#FF6A45]/20 font-black'
                    : 'bg-[#F6F3EC] hover:bg-[#FFF4EE] text-[#FF6A45] border-[#DCE7D4]'
                }`}
              >
                <Check className="w-5 h-5 stroke-3" />
                <span>Available</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDateModal(null)}
              className="w-full py-2.5 rounded-xl text-xs text-[#5C6E5E] hover:text-[#073B2F] transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
