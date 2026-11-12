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
import { VideoThumbnailPoster } from './VideoThumbnailPoster';
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
    <div id="shoot-lobby-page-root" className="w-full bg-[#F6F3EC]/40 text-[#12201A] pb-16">
      {/* 1. Official Shoot Lobby Brand Hero Section (Brand Guidelines Page 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#33684C] text-white p-6 sm:p-9 lg:p-11 shadow-sm">
          {/* Subtle atmospheric ambient glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-[#1F4331]/40 blur-2xl pointer-events-none" />

          {/* Floating Yellow Camera Mark at top right corner as in Page 6 */}
          <div className="absolute -top-3 -right-3 sm:top-2 sm:right-4 w-24 h-24 sm:w-32 sm:h-32 opacity-95 pointer-events-none select-none z-10">
            <img
              src="/assets/shoot-lobby-camera-mark.png"
              alt="Shoot Lobby Camera Mark"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>

          <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Tag, Headline, Subtitle, Search Filter */}
            <div className="lg:col-span-7">
              {/* Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-[#E3EEE7] tracking-wider uppercase mb-4 backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFDF70]" />
                <span>FOR AGENCIES · VERIFIED EXPERTS ONLY</span>
              </div>

              {/* Main Headline in Baskervville (Guidelines Page 4 & 6) */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-normal text-white tracking-tight leading-[1.14] mb-3 font-headline">
                <span>Stop asking</span><br />
                <span>photographers,</span><br />
                <span>are you <span className="italic text-[#FFDF70] font-normal">free?</span></span>
              </h1>

              {/* Subheadline in clean sans */}
              <p className="text-[#E3EEE7] text-sm sm:text-base font-normal leading-relaxed mb-6 sm:mb-7 max-w-lg font-sans">
                Check their schedule and plan your shoot with Shoot Lobby.
              </p>

              {/* Search / Filter Bar Card */}
              <div
                className={`bg-white rounded-2xl border border-[#E3EEE7] p-2 sm:p-2.5 transition-all duration-200 w-full shadow-xl text-[#12201A] ${
                  selectedShootType === 'Other Shoot' ? 'max-w-3xl lg:max-w-5xl' : 'max-w-2xl'
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
                        ? 'border-[#33684C] ring-1 ring-[#33684C]/40 bg-[#F6F3EC]'
                        : 'border-[#E3EEE7] bg-white hover:bg-[#F6F3EC]/50 hover:border-[#33684C]/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E3EEE7] text-[#33684C] border border-[#E3EEE7] flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5 text-[#33684C]" />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="text-[11px] text-[#5C6E5E] font-medium leading-tight mb-0.5 whitespace-nowrap">
                        Shoot Date
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-[#12201A] whitespace-nowrap truncate">
                        {formatFilterDateDisplay(selectedDate)}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#5C6E5E] group-hover:text-[#33684C] transition shrink-0 ml-auto" />
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
                          className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-[320px] border border-[#E3EEE7] animate-in fade-in zoom-in-95 duration-150"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E3EEE7]">
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
                                  : 'hover:bg-[#F6F3EC] text-[#33684C]'
                              }`}
                              title={isCurrentOrPastMonth ? 'Cannot navigate to past months' : 'Previous Month'}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="font-bold text-base text-[#12201A]">
                              {MONTHS_SHORT[calMonth]} {calYear}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setPopoverMonth(
                                  new Date(calYear, calMonth + 1, 1)
                                )
                              }
                              className="p-2 rounded-lg hover:bg-[#F6F3EC] text-[#33684C]"
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
                                      ? 'bg-[#33684C] text-white shadow-sm'
                                      : 'text-[#12201A] hover:bg-[#F6F3EC]'
                                  }`}
                                  title={isPast ? 'Past date cannot be selected' : undefined}
                                >
                                  {dayNum}
                                </button>
                              );
                            })}
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#E3EEE7] flex items-center justify-between">
                            <span className="text-xs text-[#5C6E5E]">Selected: <strong className="text-[#33684C]">{formatFilterDateDisplay(selectedDate)}</strong></span>
                            <button
                              type="button"
                              onClick={() => setIsDatePopoverOpen(false)}
                              className="px-3 py-1.5 rounded-lg bg-[#F6F3EC] hover:bg-[#ece8df] border border-[#E3EEE7] text-xs font-bold text-[#12201A]"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Anchored Dropdown Popover */}
                      <div className="hidden sm:block absolute left-0 top-full mt-2 w-80 bg-white border border-[#E3EEE7] rounded-2xl shadow-xl p-4 z-50 text-[#12201A] animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E3EEE7]">
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
                                : 'hover:bg-[#F6F3EC] text-[#33684C]'
                            }`}
                            title={isCurrentOrPastMonth ? 'Cannot navigate to past months' : 'Previous Month'}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-sm text-[#12201A]">
                            {MONTHS_SHORT[calMonth]} {calYear}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPopoverMonth(
                                new Date(calYear, calMonth + 1, 1)
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-[#F6F3EC] text-[#33684C] outline-none focus:outline-none"
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
                                    ? 'bg-[#33684C] text-white shadow-sm'
                                    : 'text-[#12201A] hover:bg-[#F6F3EC]'
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
                        ? 'border-[#33684C] ring-1 ring-[#33684C]/40 bg-[#F6F3EC]'
                        : 'border-[#E3EEE7] bg-white hover:bg-[#F6F3EC]/50 hover:border-[#33684C]/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E3EEE7] text-[#33684C] border border-[#E3EEE7] flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5 text-[#33684C]" />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="text-[11px] text-[#5C6E5E] font-medium leading-tight mb-0.5 whitespace-nowrap">
                        Type of Shoot
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-[#12201A] whitespace-nowrap truncate">
                        {selectedShootType}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#5C6E5E] group-hover:text-[#33684C] transition shrink-0 ml-auto" />
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
                          className="bg-white border border-[#E3EEE7] rounded-2xl shadow-2xl p-3 w-full max-w-[320px] z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[75vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-xs font-bold text-[#5C6E5E] uppercase tracking-wider px-2 py-2 mb-1 border-b border-[#E3EEE7] flex items-center justify-between">
                            <span>Select Type of Shoot</span>
                            <button
                              type="button"
                              onClick={() => setIsTypeDropdownOpen(false)}
                              className="text-[#5C6E5E] hover:text-[#12201A] text-xs"
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
                                      ? 'bg-[#33684C] text-white font-bold'
                                      : 'text-[#12201A] hover:bg-[#F6F3EC]'
                                  }`}
                                >
                                  <span>{type}</span>
                                  {isSelected && <Check className="w-4 h-4 text-[#FFDF70]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Anchored Dropdown */}
                      <div className="hidden sm:block absolute left-0 top-full mt-2 w-full sm:w-72 bg-white border border-[#E3EEE7] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto">
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
                                  ? 'bg-[#33684C] text-white font-bold'
                                  : 'text-[#12201A] hover:bg-[#F6F3EC]'
                              }`}
                            >
                              <span>{type}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#FFDF70]" />}
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
                    <div className="w-full h-[52px] sm:h-[54px] flex items-center gap-3 px-3.5 sm:px-4 py-2 rounded-xl border border-[#E3EEE7] bg-white hover:border-[#33684C]/50 focus-within:border-[#33684C] focus-within:ring-1 focus-within:ring-[#33684C]/40 transition text-left group">
                      <div className="w-10 h-10 rounded-xl bg-[#F6F3EC] text-[#33684C] border border-[#E3EEE7] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-[#33684C]" />
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
                          className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#12201A] focus:outline-none placeholder:text-[#5C6E5E]/60 truncate"
                          autoFocus
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Column Action: Check Availability Button (Flash Yellow #FFDF70 on Green Hero) */}
                <button
                  type="button"
                  id="btn-find-available-photographers"
                  onClick={handleFindClick}
                  className="w-full sm:w-auto h-[50px] sm:h-[52px] px-6 sm:px-7 bg-[#FFDF70] hover:bg-[#fbd351] active:scale-[0.98] text-[#12201A] font-extrabold rounded-xl flex items-center justify-center gap-2 transition text-xs sm:text-sm whitespace-nowrap outline-none focus:outline-none focus-visible:outline-none shrink-0 shadow-xs cursor-pointer select-none"
                >
                  <span>Check availability</span>
                  <ArrowRight className="w-4 h-4 text-[#12201A]" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Studio Availability Interactive Calendar Card (Brand Guidelines Page 6) */}
          <div className="hidden lg:flex lg:col-span-5 justify-end">
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl text-[#12201A] w-full max-w-[310px] border border-white/20 select-none">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E3EEE7]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[#12201A]">
                    {MONTHS_SHORT[calMonth]} {calYear}
                  </span>
                  <div className="flex items-center">
                    <button
                      type="button"
                      disabled={isCurrentOrPastMonth}
                      onClick={() => {
                        if (isCurrentOrPastMonth) return;
                        setPopoverMonth(new Date(calYear, calMonth - 1, 1));
                      }}
                      className={`p-1 rounded hover:bg-[#F6F3EC] text-[#12201A] ${
                        isCurrentOrPastMonth ? 'opacity-25 cursor-not-allowed' : ''
                      }`}
                      title="Previous month"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPopoverMonth(new Date(calYear, calMonth + 1, 1))}
                      className="p-1 rounded hover:bg-[#F6F3EC] text-[#12201A]"
                      title="Next month"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-[#33684C] bg-[#E3EEE7] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#33684C] animate-pulse" />
                  <span>Live availability</span>
                </span>
              </div>

              {/* Day of Week Headers: M T W T F S S */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase text-[#5C6E5E] mb-1.5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="py-0.5">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-xs">
                {/* Empty cells before month starts (Monday aligned) */}
                {Array.from({ length: (firstDayIndex + 6) % 7 }).map((_, i) => (
                  <div key={`empty-hero-${i}`} className="h-7 w-7" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = dateKey === selectedDate;
                  const isPast = dateKey < todayKey;

                  // Check if date has available photographers
                  const hasAvailable = displayPhotographers.some(
                    (p) => availability[p.id]?.[dateKey] !== 'booked'
                  );
                  const isBooked = !hasAvailable;

                  return (
                    <button
                      key={`hero-day-${dateKey}`}
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        if (isPast) return;
                        setSelectedDate(dateKey);
                      }}
                      className={`h-7 w-7 mx-auto rounded-lg flex items-center justify-center font-bold text-xs transition cursor-pointer ${
                        isPast
                          ? 'text-stone-300 opacity-30 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#FFDF70] text-[#12201A] shadow-xs ring-2 ring-[#FFDF70]/40 font-extrabold'
                          : isBooked
                          ? 'text-stone-400 line-through decoration-stone-300'
                          : 'text-[#12201A] hover:bg-[#E3EEE7]'
                      }`}
                      title={
                        isPast
                          ? 'Past date'
                          : isSelected
                          ? 'Your selected shoot date'
                          : isBooked
                          ? 'Fully booked'
                          : 'Click to select this shoot date'
                      }
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Legend matching Page 6 */}
              <div className="mt-3.5 pt-2.5 border-t border-[#E3EEE7] flex items-center justify-between text-[10px] text-[#5C6E5E]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#33684C]" />
                  <span>Free</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-[#12201A]">
                  <span className="w-2 h-2 rounded-sm bg-[#FFDF70]" />
                  <span>Your date</span>
                </span>
                <span className="flex items-center gap-1 text-stone-400">
                  <span className="line-through">00</span>
                  <span>Booked</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* 2. Available Photographers Section (Guidelines Page 6) */}
      <section ref={resultsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
        {/* Section Heading in Baskervville Serif */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-normal text-[#12201A] tracking-tight font-headline">
            Available photographers ({displayPhotographers.length})
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6E5E] mt-1 font-sans">
            Free on {formatFilterDateDisplay(selectedDate)} · {selectedShootType}
          </p>
        </div>

        {/* Photographers Grid */}
        {displayPhotographers.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#E3EEE7]">
            <Camera className="w-12 h-12 text-[#5C6E5E]/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#12201A]">No photographers available for this exact date</h3>
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
                  className="bg-white rounded-2xl sm:rounded-3xl border border-[#E3EEE7] hover:border-[#33684C]/50 p-5 sm:p-6 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div>
                    {/* Top Row: Avatar, Name, Available Badge, Location & Exp */}
                    <div className="flex items-start gap-4">
                      <img
                        src={p.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-2xl object-cover border border-[#E3EEE7] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-base font-bold text-[#12201A] truncate">
                              {p.name}
                            </h3>
                            {p.registeredAt && (
                              <span className="bg-[#FFF3C4] text-[#12201A] border border-[#FFDF70]/60 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                                New Partner
                              </span>
                            )}
                          </div>
                          <span className="bg-[#E3EEE7] text-[#12201A] border border-[#E3EEE7] text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#33684C]" />
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
                    <h4 className="text-[14px] sm:text-[15px] font-bold text-[#12201A] mt-4 leading-snug">
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
                                        ? 'bg-[#33684C] text-white shadow-xs'
                                        : 'bg-[#F6F3EC] text-[#12201A] hover:bg-[#E3EEE7] border border-[#E3EEE7]'
                                    }`}
                                  >
                                    <span>{spec}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Category Media Showcase Strip (Photos vs Reels/Videos) */}
                          <div className="mt-4 pt-3 border-t border-[#E3EEE7]">
                            <div className="flex items-center justify-between mb-2">
                              {/* Media Type Switcher: Photos vs Reels */}
                              <div className="flex items-center bg-[#F6F3EC] p-0.5 rounded-lg border border-[#E3EEE7] text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => setCardMediaType((prev) => ({ ...prev, [p.id]: 'photos' }))}
                                  className={`px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer ${
                                    activeMedia === 'photos'
                                      ? 'bg-[#33684C] text-white shadow-2xs'
                                      : 'text-[#5C6E5E] hover:text-[#12201A]'
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
                                      ? 'bg-[#33684C] text-white shadow-2xs'
                                      : 'text-[#5C6E5E] hover:text-[#12201A]'
                                  }`}
                                >
                                  <Film className="w-3 h-3" />
                                  <span>Videos</span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedShowcaseCategory(activeCardCategory);
                                  setPortfolioShowcasePhotographer(p);
                                }}
                                className="text-xs font-bold text-[#33684C] hover:text-[#1F4331] flex items-center gap-1.5 hover:underline cursor-pointer group"
                              >
                                <span>{activeCardCategory} see all</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#33684C] transition-transform group-hover:translate-x-0.5" />
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
                                <div className="grid grid-cols-6 gap-1 sm:gap-1.5 rounded-xl overflow-hidden p-1 bg-[#F6F3EC] border border-[#E3EEE7] group-hover/sample:border-[#33684C] transition">
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
                              /* Videos Showcase Strip - Uniform tall format */
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5 rounded-xl overflow-hidden p-1 bg-[#F6F3EC] border border-[#E3EEE7] transition">
                                {category6Videos.slice(0, 6).map((video, vIdx) => {
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
                                      className="relative rounded-lg overflow-hidden bg-stone-900 border border-[#E3EEE7] cursor-pointer group hover:border-[#33684C] transition-all shadow-2xs aspect-9/14 sm:aspect-9/16"
                                    >
                                      <VideoThumbnailPoster
                                        video={video}
                                        isReel={true}
                                        alt={video.title || 'Video'}
                                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform"
                                      />
                                      {/* Video Badge */}
                                      <div className="absolute top-1 left-1 z-10">
                                        <span className="px-1 py-0.2 rounded-sm bg-[#33684C] text-white text-[8px] font-bold">
                                          Video
                                        </span>
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

                  {/* Action Buttons: Lobby Green for booking */}
                  <div className="mt-6 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleBookClick(p)}
                      className="w-full py-3 px-4 bg-[#33684C] hover:bg-[#1F4331] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>Book for {formatDateDayMonth(selectedDate)}</span>
                      <ArrowRight className="w-4 h-4 text-[#FFDF70]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenSchedule(p)}
                      className="w-full py-2.5 px-3 text-xs text-[#12201A] hover:text-[#33684C] font-bold hover:bg-[#F6F3EC] rounded-xl transition flex items-center justify-center gap-1.5 border border-[#E3EEE7] cursor-pointer"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-[#33684C]" />
                      <span>Schedule of {p.name.split(' ')[0]} for this month</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Social Proof & Brand Partners Section */}
        <div className="border-t border-[#E3EEE7] pt-8 mt-16 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-normal text-[#12201A] font-headline">
                Trusted by leading agencies and brands
              </h3>
              <p className="text-xs sm:text-sm text-[#5C6E5E] mt-0.5 font-sans">
                Marketing teams, creative agencies and production houses rely on Shoot Lobby for their photography needs.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPhotographerSignUp ? onOpenPhotographerSignUp : () => setIsJoinNetworkOpen(true)}
              className="text-[#33684C] hover:text-[#1F4331] font-bold text-sm inline-flex items-center gap-1.5 shrink-0 group self-start sm:self-auto hover:underline cursor-pointer"
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
