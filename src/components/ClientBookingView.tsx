import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Check,
  ArrowRight,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  Play,
  Film,
  Smartphone,
  Tv,
} from 'lucide-react';
import { PhotographerProfile, ShootBooking, DayStatus, CategoryVideoItem } from '../types';
import { formatDateKey, formatDateDayMonth, APP_CURRENT_YEAR, APP_CURRENT_MONTH } from '../utils/storage';
import { getCategoryPhotos } from '../utils/categoryGalleries';
import { getCategoryVideos } from '../utils/categoryVideos';
import { BrandLogos } from './BrandLogos';
import { ClientBookingModal } from './ClientBookingModal';
import { JoinNetworkModal } from './JoinNetworkModal';
import { PhotographerScheduleModal } from './PhotographerScheduleModal';
import { PortfolioShowcaseModal } from './PortfolioShowcaseModal';
import { VideoReelPlayerModal } from './VideoReelPlayerModal';
import { ShootLobbyLogo } from './ShootLobbyLogo';
import heroStudioImage from '../assets/images/photographer_studio_hero_1789075441635.jpg';

interface ClientBookingViewProps {
  photographers: PhotographerProfile[];
  availability: Record<string, Record<string, DayStatus>>;
  shoots: ShootBooking[];
  onBookShoot: (booking: Omit<ShootBooking, 'id' | 'createdAt'>) => ShootBooking;
  onOpenPhotographerSignUp?: () => void;
}

const SHOOT_TYPES: string[] = [
  'Commercial Shoot',
  'Fashion Shoot',
  'Jewellery Shoot',
  'Hotel Shoot',
  'Interior Shoot',
  'Restaurant & Cafe Shoot',
  'F&B Shoot',
  'One Day Shoot',
  'Product Shoot',
  'Other Shoot',
];

// Month names short
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const ClientBookingView: React.FC<ClientBookingViewProps> = ({
  photographers,
  availability,
  shoots,
  onBookShoot,
  onOpenPhotographerSignUp,
}) => {
  // 1. Shoot Date (defaults to dynamic today's date)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return formatDateKey(new Date());
  });

  // Automatically update selectedDate if day changes and selected date is in the past
  useEffect(() => {
    const today = formatDateKey(new Date());
    if (selectedDate < today) {
      setSelectedDate(today);
    }
  }, [selectedDate]);

  // 2. Type of Shoot (default: Commercial Shoot matching screenshot)
  const [selectedShootType, setSelectedShootType] = useState<string>('Commercial Shoot');
  const [customShootQuery, setCustomShootQuery] = useState<string>('');

  // Popover states for Date Picker and Shoot Type Picker
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Month navigation for Date Popover
  const [popoverMonth, setPopoverMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const datePickerRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Modals
  const [activePhotographerForBooking, setActivePhotographerForBooking] =
    useState<PhotographerProfile | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activePhotographerForSchedule, setActivePhotographerForSchedule] =
    useState<PhotographerProfile | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isJoinNetworkOpen, setIsJoinNetworkOpen] = useState(false);
  const [portfolioShowcasePhotographer, setPortfolioShowcasePhotographer] =
    useState<PhotographerProfile | null>(null);
  const [cardActiveCategory, setCardActiveCategory] = useState<Record<string, string>>({});
  const [selectedShowcaseCategory, setSelectedShowcaseCategory] = useState<string | undefined>(undefined);
  const [cardMediaType, setCardMediaType] = useState<Record<string, 'photos' | 'videos'>>({});
  const [activeVideoModal, setActiveVideoModal] = useState<{
    videos: CategoryVideoItem[];
    index: number;
    photographer: PhotographerProfile;
  } | null>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePopoverOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format "18 Sep 2026"
  const formatFilterDateDisplay = (dateKey: string) => {
    if (!dateKey) return 'Select Date';
    const parts = dateKey.split('-');
    if (parts.length < 3) return dateKey;
    const y = parts[0];
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return `${d} ${MONTHS_SHORT[m - 1] || ''} ${y}`;
  };

  // Filter available photographers for the chosen date & shoot type
  const availablePhotographers = photographers.filter((p) => {
    // Photographers on hold are suspended from accepting bookings and cannot appear in results
    if (p.status === 'on_hold') return false;

    const pAvail = availability[p.id] || {};
    const status = pAvail[selectedDate] || 'available';
    if (status !== 'available') return false;

    // Specialty or title compatibility
    const q = selectedShootType.toLowerCase();
    if (q === 'other shoot' || q.includes('other')) return true;
    const pSpecialties = Array.isArray(p.specialties) ? p.specialties : [];
    const matchesSpecialty = pSpecialties.some(
      (s) => typeof s === 'string' && (s.toLowerCase().includes(q) || q.includes(s.toLowerCase()))
    );
    const matchesTitle = p.title ? p.title.toLowerCase().includes(q) : false;
    const matchesBio = p.bio ? p.bio.toLowerCase().includes(q) : false;

    return matchesSpecialty || matchesTitle || matchesBio;
  });

  // Prioritize newly registered partners so users immediately see their profile, then standard priority
  const priorityIds = ['photo-2', 'photo-3', 'photo-5'];
  const displayPhotographers = [...availablePhotographers].sort((a, b) => {
    const aIsNew = Boolean(a.registeredAt);
    const bIsNew = Boolean(b.registeredAt);
    if (aIsNew && !bIsNew) return -1;
    if (!aIsNew && bIsNew) return 1;
    if (aIsNew && bIsNew) {
      return new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime();
    }
    const aIdx = priorityIds.indexOf(a.id);
    const bIdx = priorityIds.indexOf(b.id);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return 0;
  });

  const handleBookClick = (photographer: PhotographerProfile) => {
    setActivePhotographerForBooking(photographer);
    setIsBookingModalOpen(true);
  };

  const handleOpenSchedule = (photographer: PhotographerProfile) => {
    setActivePhotographerForSchedule(photographer);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleDateSelected = (photographer: PhotographerProfile, date: string) => {
    setIsScheduleModalOpen(false);
    setSelectedDate(date);
    setActivePhotographerForBooking(photographer);
    setIsBookingModalOpen(true);
  };

  const handleFindClick = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calendar math for Popover
  const calYear = popoverMonth.getFullYear();
  const calMonth = popoverMonth.getMonth();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const todayKey = formatDateKey(new Date());
  const now = new Date();
  const isCurrentOrPastMonth =
    calYear < now.getFullYear() ||
    (calYear === now.getFullYear() && calMonth <= now.getMonth());

  return (
    <div id="shoot-lobby-page-root" className="w-full bg-[#F6F3EC]/40 text-[#073B2F] pb-16">
      {/* 1. Integrated Hero & Filter Section */}
      <section className="relative z-30 bg-white border-b border-[#DCE7D4]">
        {/* Studio Photographer Background Visual on right side with seamless gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[55%] md:w-[50%] lg:w-[46%] pointer-events-none overflow-hidden select-none z-0">
          <img
            src={heroStudioImage}
            alt="Commercial photoshoot studio with camera operator and lighting"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[75%_center] sm:object-center opacity-70 sm:opacity-90"
          />
          {/* Smooth horizontal gradient fade to white on the left ensuring crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-35% sm:via-white/70 to-transparent" />
          {/* Subtle top/bottom edge feather */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40 sm:hidden" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-9 lg:pt-10 pb-7 sm:pb-8 z-10">
          {/* Left Hero Content */}
          <div className="max-w-3xl lg:max-w-4xl">
            {/* Main Headline - "Are you free?" in vibrant brand orange */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#073B2F] tracking-tight leading-[1.2] mb-3 font-['Space_Grotesk',sans-serif]">
              <span>Stop asking Photographers,</span>
              <span className="block mt-1 sm:mt-1.5 text-[#FF6A45] font-extrabold underline decoration-[#FF6A45]/40 decoration-4 underline-offset-8">
                Are you free?
              </span>
            </h1>

            {/* Subheadline - Clean Shoot Lobby text without extra icon */}
            <p className="text-[#5C6E5E] text-base sm:text-lg font-normal leading-relaxed mb-6 max-w-2xl flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Check their schedule and plan your shoot with</span>
              <span className="font-bold tracking-[0.12em] uppercase text-[#073B2F]">
                Shoot Lobby
              </span>
            </p>

            {/* Search / Filter Bar Card */}
            <div
              className={`bg-white rounded-2xl border border-[#DCE7D4] p-2.5 sm:p-3 transition-all duration-200 w-full shadow-sm ${
                selectedShootType === 'Other Shoot' ? 'max-w-3xl lg:max-w-5xl' : 'max-w-3xl lg:max-w-4xl'
              }`}
            >
              <div
                className={`grid gap-2.5 items-center ${
                  selectedShootType === 'Other Shoot'
                    ? 'grid-cols-1 md:grid-cols-[1fr_1fr_1.35fr_auto]'
                    : 'grid-cols-1 sm:grid-cols-[1fr_1fr_auto]'
                }`}
              >
                {/* Column 1: Select Date */}
                <div ref={datePickerRef} className="relative flex">
                  <button
                    type="button"
                    id="btn-select-date-picker"
                    onClick={() => {
                      setIsDatePopoverOpen(!isDatePopoverOpen);
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`w-full h-[52px] sm:h-[54px] flex items-center gap-3 px-3.5 sm:px-4 py-2 rounded-xl border transition text-left group outline-none focus:outline-none focus-visible:outline-none select-none ${
                      isDatePopoverOpen
                        ? 'border-[#073B2F] ring-1 ring-[#073B2F]/40 bg-[#F6F3EC]'
                        : 'border-[#DCE7D4] bg-white hover:bg-[#F6F3EC]/50 hover:border-[#073B2F]/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5 text-[#073B2F]" />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="text-[11px] text-[#5C6E5E] font-medium leading-tight mb-0.5 whitespace-nowrap">
                        Shoot Date
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-[#073B2F] whitespace-nowrap truncate">
                        {formatFilterDateDisplay(selectedDate)}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#5C6E5E] group-hover:text-[#073B2F] transition shrink-0 ml-auto" />
                  </button>

                  {/* Date Popover Calendar: Centered on mobile so top/bottom are never cut off, anchored on desktop */}
                  {isDatePopoverOpen && (
                    <>
                      {/* Mobile Centered Backdrop Modal */}
                      <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs sm:hidden"
                        onClick={() => setIsDatePopoverOpen(false)}
                      >
                        <div
                          className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-[320px] border border-[#DCE7D4] animate-in fade-in zoom-in-95 duration-150"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DCE7D4]">
                            <button
                              type="button"
                              disabled={isCurrentOrPastMonth}
                              onClick={() => {
                                if (isCurrentOrPastMonth) return;
                                setPopoverMonth(
                                  new Date(calYear, calMonth - 1, 1)
                                );
                              }}
                              className={`p-2 rounded-lg transition ${
                                isCurrentOrPastMonth
                                  ? 'text-stone-300 cursor-not-allowed opacity-30'
                                  : 'hover:bg-[#F6F3EC] text-[#073B2F]'
                              }`}
                              title={isCurrentOrPastMonth ? 'Cannot navigate to past months' : 'Previous Month'}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="font-bold text-base text-[#073B2F]">
                              {MONTHS_SHORT[calMonth]} {calYear}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setPopoverMonth(
                                  new Date(calYear, calMonth + 1, 1)
                                )
                              }
                              className="p-2 rounded-lg hover:bg-[#F6F3EC] text-[#073B2F]"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase text-[#5C6E5E] mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                              <div key={d} className="py-1">
                                {d}
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1 text-sm">
                            {Array.from({ length: firstDayIndex }).map((_, i) => (
                              <div key={`empty-${i}`} className="h-9" />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                              const dayNum = i + 1;
                              const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                              const isSelected = dateKey === selectedDate;
                              const isPast = dateKey < todayKey;

                              return (
                                <button
                                  key={dateKey}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    if (isPast) return;
                                    setSelectedDate(dateKey);
                                    setIsDatePopoverOpen(false);
                                  }}
                                  className={`h-9 w-9 mx-auto rounded-xl flex items-center justify-center font-bold transition ${
                                    isPast
                                      ? 'text-stone-300 bg-stone-50 cursor-not-allowed opacity-35 select-none'
                                      : isSelected
                                      ? 'bg-[#073B2F] text-white shadow-sm'
                                      : 'text-[#073B2F] hover:bg-[#F6F3EC] hover:text-[#073B2F]'
                                  }`}
                                  title={isPast ? 'Past date cannot be selected' : undefined}
                                >
                                  {dayNum}
                                </button>
                              );
                            })}
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#DCE7D4] flex items-center justify-between">
                            <span className="text-xs text-[#5C6E5E]">Selected: <strong className="text-[#073B2F]">{formatFilterDateDisplay(selectedDate)}</strong></span>
                            <button
                              type="button"
                              onClick={() => setIsDatePopoverOpen(false)}
                              className="px-3 py-1.5 rounded-lg bg-[#F6F3EC] hover:bg-[#ece8df] border border-[#DCE7D4] text-xs font-bold text-[#073B2F]"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Anchored Dropdown Popover */}
                      <div className="hidden sm:block absolute left-0 top-full mt-2 w-80 bg-white border border-[#DCE7D4] rounded-2xl shadow-xl p-4 z-50 text-[#073B2F] animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCE7D4]">
                          <button
                            type="button"
                            disabled={isCurrentOrPastMonth}
                            onClick={() => {
                              if (isCurrentOrPastMonth) return;
                              setPopoverMonth(
                                new Date(calYear, calMonth - 1, 1)
                              );
                            }}
                            className={`p-1.5 rounded-lg transition outline-none focus:outline-none ${
                              isCurrentOrPastMonth
                                ? 'text-stone-300 cursor-not-allowed opacity-30'
                                : 'hover:bg-[#F6F3EC] text-[#073B2F]'
                            }`}
                            title={isCurrentOrPastMonth ? 'Cannot navigate to past months' : 'Previous Month'}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-sm text-[#073B2F]">
                            {MONTHS_SHORT[calMonth]} {calYear}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPopoverMonth(
                                new Date(calYear, calMonth + 1, 1)
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-[#F6F3EC] text-[#073B2F] outline-none focus:outline-none"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase text-[#5C6E5E] mb-1">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <div key={d} className="py-1">
                              {d}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-xs">
                          {Array.from({ length: firstDayIndex }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-8" />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                            const isSelected = dateKey === selectedDate;
                            const isPast = dateKey < todayKey;

                            return (
                              <button
                                key={dateKey}
                                type="button"
                                disabled={isPast}
                                onClick={() => {
                                  if (isPast) return;
                                  setSelectedDate(dateKey);
                                  setIsDatePopoverOpen(false);
                                }}
                                className={`h-8 w-8 mx-auto rounded-xl flex items-center justify-center font-bold transition outline-none focus:outline-none ${
                                  isPast
                                    ? 'text-stone-300 bg-stone-50 cursor-not-allowed opacity-35 select-none'
                                    : isSelected
                                    ? 'bg-[#073B2F] text-white shadow-sm'
                                    : 'text-[#073B2F] hover:bg-[#F6F3EC]'
                                }`}
                                title={isPast ? 'Past date cannot be selected' : undefined}
                              >
                                {dayNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Column 2: Type of Shoot */}
                <div ref={typeDropdownRef} className="relative flex">
                  <button
                    type="button"
                    id="btn-select-shoot-type"
                    onClick={() => {
                      setIsTypeDropdownOpen(!isTypeDropdownOpen);
                      setIsDatePopoverOpen(false);
                    }}
                    className={`w-full h-[52px] sm:h-[54px] flex items-center gap-3 px-3.5 sm:px-4 py-2 rounded-xl border transition text-left group outline-none focus:outline-none focus-visible:outline-none select-none ${
                      isTypeDropdownOpen
                        ? 'border-[#073B2F] ring-1 ring-[#073B2F]/40 bg-[#F6F3EC]'
                        : 'border-[#DCE7D4] bg-white hover:bg-[#F6F3EC]/50 hover:border-[#073B2F]/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F6F3EC] text-[#073B2F] border border-[#DCE7D4] flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5 text-[#073B2F]" />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="text-[11px] text-[#5C6E5E] font-medium leading-tight mb-0.5 whitespace-nowrap">
                        Type of Shoot
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-[#073B2F] whitespace-nowrap truncate">
                        {selectedShootType}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#5C6E5E] group-hover:text-[#073B2F] transition shrink-0 ml-auto" />
                  </button>

                  {/* Type Dropdown Menu: Centered on mobile, anchored on desktop */}
                  {isTypeDropdownOpen && (
                    <>
                      {/* Mobile Centered Backdrop Modal */}
                      <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs sm:hidden"
                        onClick={() => setIsTypeDropdownOpen(false)}
                      >
                        <div
                          className="bg-white border border-[#DCE7D4] rounded-2xl shadow-2xl p-3 w-full max-w-[320px] z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[75vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-xs font-bold text-[#5C6E5E] uppercase tracking-wider px-2 py-2 mb-1 border-b border-[#DCE7D4] flex items-center justify-between">
                            <span>Select Type of Shoot</span>
                            <button
                              type="button"
                              onClick={() => setIsTypeDropdownOpen(false)}
                              className="text-[#5C6E5E] hover:text-[#073B2F] text-xs"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="space-y-1">
                            {SHOOT_TYPES.map((type) => {
                              const isSelected = type === selectedShootType;
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    setSelectedShootType(type);
                                    setIsTypeDropdownOpen(false);
                                  }}
                                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition ${
                                    isSelected
                                      ? 'bg-[#073B2F] text-white font-bold'
                                      : 'text-[#073B2F] hover:bg-[#F6F3EC]'
                                  }`}
                                >
                                  <span>{type}</span>
                                  {isSelected && <Check className="w-4 h-4 text-[#F0FFDA]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Anchored Dropdown */}
                      <div className="hidden sm:block absolute left-0 top-full mt-2 w-full sm:w-72 bg-white border border-[#DCE7D4] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto">
                        {SHOOT_TYPES.map((type) => {
                          const isSelected = type === selectedShootType;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setSelectedShootType(type);
                                setIsTypeDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition outline-none focus:outline-none ${
                                isSelected
                                  ? 'bg-[#073B2F] text-white font-bold'
                                  : 'text-[#073B2F] hover:bg-[#F6F3EC]'
                              }`}
                            >
                              <span>{type}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#F0FFDA]" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Column 3: Specify Shoot (separate column appearing when 'Other Shoot' is selected) */}
                {selectedShootType === 'Other Shoot' && (
                  <div className="relative flex animate-in fade-in zoom-in-95 duration-150">
                    <div className="w-full h-[52px] sm:h-[54px] flex items-center gap-3 px-3.5 sm:px-4 py-2 rounded-xl border border-[#DCE7D4] bg-white hover:border-[#073B2F]/50 focus-within:border-[#073B2F] focus-within:ring-1 focus-within:ring-[#073B2F]/40 transition text-left group">
                      <div className="w-10 h-10 rounded-xl bg-[#F6F3EC] text-[#073B2F] border border-[#DCE7D4] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-[#073B2F]" />
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="text-[11px] text-[#5C6E5E] font-medium leading-tight mb-0.5 whitespace-nowrap">
                          What type of shoot is it?
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Drone, Maternity..."
                          value={customShootQuery}
                          onChange={(e) => setCustomShootQuery(e.target.value)}
                          className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#073B2F] focus:outline-none placeholder:text-[#5C6E5E]/60 truncate"
                          autoFocus
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Column Action: Check Availability Button (always in the same row / grid) */}
                <button
                  type="button"
                  id="btn-find-available-photographers"
                  onClick={handleFindClick}
                  className="w-full sm:w-auto h-[52px] sm:h-[54px] px-6 sm:px-7 bg-[#073B2F] hover:bg-[#0c4e3f] active:scale-[0.98] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition text-xs sm:text-sm whitespace-nowrap outline-none focus:outline-none focus-visible:outline-none shrink-0 shadow-xs cursor-pointer"
                >
                  <span>Check Availability</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Available Photographers Section */}
      <section ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* Section Heading without extra icon */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold text-[#073B2F] tracking-tight font-['Space_Grotesk',sans-serif]">
            Available Photographers ({displayPhotographers.length})
          </h2>
        </div>

        {/* Photographers Grid */}
        {displayPhotographers.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#DCE7D4]">
            <Camera className="w-12 h-12 text-[#5C6E5E]/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#073B2F]">No photographers available for this exact date</h3>
            <p className="text-xs text-[#5C6E5E] mt-1 max-w-sm mx-auto">
              Try picking another nearby date or selecting a different shoot category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPhotographers.map((p) => {
              return (
                <div
                  key={p.id}
                  id={`photographer-card-${p.id}`}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-[#DCE7D4] hover:border-[#073B2F]/40 p-5 sm:p-6 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div>
                    {/* Top Row: Avatar, Name, Available Badge, Location & Exp */}
                    <div className="flex items-start gap-4">
                      <img
                        src={p.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-cover border border-[#DCE7D4] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-base font-bold text-[#073B2F] truncate">
                              {p.name}
                            </h3>
                            {p.registeredAt && (
                              <span className="bg-[#FF6A45]/15 text-[#FF6A45] border border-[#FF6A45]/30 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                                New Partner
                              </span>
                            )}
                          </div>
                          <span className="bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#073B2F]" />
                            <span>Available</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#5C6E5E] mt-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#5C6E5E] shrink-0" />
                          <span>{p.city} • {p.experienceYears}+ yrs exp</span>
                        </div>
                      </div>
                    </div>

                    {/* Headline / Specialty Title */}
                    <h4 className="text-[14px] sm:text-[15px] font-bold text-[#073B2F] mt-4 leading-snug">
                      {p.title}
                    </h4>

                    {/* Bio Description */}
                    <p className="text-xs sm:text-[13px] text-[#5C6E5E] leading-relaxed mt-2 line-clamp-3 font-normal">
                      {p.bio}
                    </p>

                    {/* Tappable Specialization Categories & Media Showcase */}
                    {(() => {
                      const pSpecs = Array.isArray(p.specialties) && p.specialties.length > 0 ? p.specialties : ['Commercial Shoot'];
                      const activeCardCategory = cardActiveCategory[p.id] || pSpecs[0] || 'Commercial Shoot';
                      const activeMedia = cardMediaType[p.id] || 'photos';
                      const category6Photos = getCategoryPhotos(p, activeCardCategory, 6);
                      const category6Videos = getCategoryVideos(p, activeCardCategory, 6);

                      return (
                        <>
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-1.5">
                              {pSpecs.map((spec) => {
                                const isSelected = spec === activeCardCategory;
                                return (
                                  <button
                                    key={spec}
                                    type="button"
                                    onClick={() => {
                                      setCardActiveCategory((prev) => ({ ...prev, [p.id]: spec }));
                                    }}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer active:scale-95 ${
                                      isSelected
                                        ? 'bg-[#073B2F] text-white shadow-xs'
                                        : 'bg-[#F6F3EC] text-[#073B2F] hover:bg-[#ECE7DC] border border-[#DCE7D4]'
                                    }`}
                                  >
                                    <span>{spec}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Category Media Showcase Strip (Photos vs Reels/Videos) */}
                          <div className="mt-4 pt-3 border-t border-[#DCE7D4]/60">
                            <div className="flex items-center justify-between mb-2">
                              {/* Media Type Switcher: Photos vs Reels */}
                              <div className="flex items-center bg-[#F6F3EC] p-0.5 rounded-lg border border-[#DCE7D4] text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => setCardMediaType((prev) => ({ ...prev, [p.id]: 'photos' }))}
                                  className={`px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                                    activeMedia === 'photos'
                                      ? 'bg-[#073B2F] text-white shadow-2xs'
                                      : 'text-[#5C6E5E] hover:text-[#073B2F]'
                                  }`}
                                >
                                  <Camera className="w-3 h-3" />
                                  <span>Photos</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCardMediaType((prev) => ({ ...prev, [p.id]: 'videos' }))}
                                  className={`px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                                    activeMedia === 'videos'
                                      ? 'bg-[#FF6A45] text-white shadow-2xs'
                                      : 'text-[#5C6E5E] hover:text-[#073B2F]'
                                  }`}
                                >
                                  <Film className="w-3 h-3" />
                                  <span>Reels ({category6Videos.length})</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedShowcaseCategory(activeCardCategory);
                                  setPortfolioShowcasePhotographer(p);
                                }}
                                className="text-xs font-bold text-[#073B2F] hover:text-[#0c4e3f] flex items-center gap-1.5 hover:underline cursor-pointer group"
                              >
                                <span>{activeCardCategory} see all</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#FF6A45] transition-transform group-hover:translate-x-0.5" />
                              </button>
                            </div>

                            {activeMedia === 'photos' ? (
                              /* 6 Photos Showcase Strip */
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedShowcaseCategory(activeCardCategory);
                                  setPortfolioShowcasePhotographer(p);
                                }}
                                className="w-full group/sample text-left transition cursor-pointer"
                              >
                                <div className="grid grid-cols-6 gap-1 sm:gap-1.5 rounded-xl overflow-hidden p-1 bg-[#F6F3EC] border border-[#DCE7D4] group-hover/sample:border-[#073B2F] transition">
                                  {category6Photos.map((sampleImg, sIdx) => (
                                    <div key={sIdx} className="relative aspect-4/3 overflow-hidden rounded-lg bg-stone-200">
                                      <img
                                        src={sampleImg}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover/sample:scale-105"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </button>
                            ) : (
                              /* Reels & Videos Showcase Strip */
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5 rounded-xl overflow-hidden p-1 bg-[#F6F3EC] border border-[#DCE7D4] transition">
                                {category6Videos.slice(0, 6).map((video, vIdx) => {
                                  const isReel = video.format === 'reel';
                                  return (
                                    <div
                                      key={video.id || vIdx}
                                      onClick={() => {
                                        setActiveVideoModal({
                                          videos: category6Videos,
                                          index: vIdx,
                                          photographer: p,
                                        });
                                      }}
                                      className={`relative rounded-lg overflow-hidden bg-stone-900 border border-[#DCE7D4] cursor-pointer group hover:border-[#073B2F] transition-all shadow-2xs ${
                                        isReel ? 'aspect-9/14 sm:aspect-9/16' : 'aspect-4/3 sm:aspect-16/9'
                                      }`}
                                    >
                                      <img
                                        src={
                                          video.thumbnailUrl ||
                                          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'
                                        }
                                        alt={video.title || 'Video'}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform"
                                      />
                                      {/* Format Badge */}
                                      <div className="absolute top-1 left-1 z-10">
                                        {isReel ? (
                                          <span className="px-1 py-0.2 rounded-sm bg-[#FF6A45] text-white text-[8px] font-bold">
                                            Reel
                                          </span>
                                        ) : (
                                          <span className="px-1 py-0.2 rounded-sm bg-amber-600 text-white text-[8px] font-bold">
                                            16:9
                                          </span>
                                        )}
                                      </div>
                                      {/* Center Play Icon */}
                                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/40 backdrop-blur-xs flex items-center justify-center text-white shadow-sm group-hover:scale-115 transition-transform">
                                          <Play className="w-3 h-3 fill-white translate-x-0.2" />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Action Buttons: Forest Green for booking */}
                  <div className="mt-6 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleBookClick(p)}
                      className="w-full py-3 px-4 bg-[#073B2F] hover:bg-[#0c4e3f] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>Book for {formatDateDayMonth(selectedDate)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenSchedule(p)}
                      className="w-full py-2.5 px-3 text-xs text-[#073B2F] hover:text-[#073B2F] font-bold hover:bg-[#F6F3EC] rounded-xl transition flex items-center justify-center gap-1.5 border border-[#DCE7D4]"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-[#073B2F]" />
                      <span>Schedule of {p.name.split(' ')[0]} for this month</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Social Proof & Brand Partners Section */}
        <div className="border-t border-[#DCE7D4] pt-8 mt-16 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#073B2F]">
                Trusted by leading agencies and brands
              </h3>
              <p className="text-xs sm:text-sm text-[#5C6E5E] mt-0.5">
                Marketing teams, creative agencies and production houses rely on Shoot Lobby for their photography needs.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPhotographerSignUp ? onOpenPhotographerSignUp : () => setIsJoinNetworkOpen(true)}
              className="text-[#073B2F] hover:text-[#0c4e3f] font-bold text-sm inline-flex items-center gap-1 shrink-0 group self-start sm:self-auto hover:underline cursor-pointer"
            >
              <span>Join our network as Photographer</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Precision monochrome brand logos */}
          <BrandLogos className="mt-4" />
        </div>
      </section>

      {/* Photographer Schedule & Availability Modal */}
      <PhotographerScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        photographer={activePhotographerForSchedule}
        targetDate={selectedDate}
        availability={availability}
        shoots={shoots}
        onSelectDateAndBook={handleScheduleDateSelected}
      />

      {/* Booking Modal */}
      <ClientBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        photographer={activePhotographerForBooking}
        targetDate={selectedDate}
        shootType={
          selectedShootType === 'Other Shoot' && customShootQuery
            ? `Other Shoot: ${customShootQuery}`
            : selectedShootType
        }
        availability={availability}
        shoots={shoots}
        onConfirmBooking={onBookShoot}
      />

      {/* Portfolio Showcase Modal */}
      <PortfolioShowcaseModal
        isOpen={Boolean(portfolioShowcasePhotographer)}
        onClose={() => {
          setPortfolioShowcasePhotographer(null);
          setSelectedShowcaseCategory(undefined);
        }}
        photographer={portfolioShowcasePhotographer}
        initialCategory={selectedShowcaseCategory}
        onBookPhotographer={(photog) => {
          setPortfolioShowcasePhotographer(null);
          setSelectedShowcaseCategory(undefined);
          handleBookClick(photog);
        }}
      />

      {/* Join Network Modal */}
      <JoinNetworkModal
        isOpen={isJoinNetworkOpen}
        onClose={() => setIsJoinNetworkOpen(false)}
      />

      {/* Video & Reel Player Modal */}
      {activeVideoModal && (
        <VideoReelPlayerModal
          isOpen={Boolean(activeVideoModal)}
          onClose={() => setActiveVideoModal(null)}
          videos={activeVideoModal.videos}
          initialIndex={activeVideoModal.index}
          photographer={activeVideoModal.photographer}
          onBookPhotographer={handleBookClick}
        />
      )}
    </div>
  );
};
