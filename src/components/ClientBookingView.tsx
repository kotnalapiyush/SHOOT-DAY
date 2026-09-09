import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  CheckCircle2,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  Download,
  Filter,
  Check,
  MessageCircle,
  Link as LinkIcon,
  Clock,
  FileText,
  User,
  Camera,
} from 'lucide-react';
import { PhotographerProfile, ShootBooking, DayStatus } from '../types';
import { formatDateKey, formatDateDayMonth, APP_CURRENT_YEAR, APP_CURRENT_MONTH } from '../utils/storage';
import { CustomDatePicker } from './CustomDatePicker';

interface ClientBookingViewProps {
  photographers: PhotographerProfile[];
  availability: Record<string, Record<string, DayStatus>>;
  shoots: ShootBooking[];
  onBookShoot: (booking: Omit<ShootBooking, 'id' | 'createdAt'>) => ShootBooking;
}

const SHOOT_TYPES: string[] = [
  'Commercial Shoot',
  'One Day Shoot',
  'F&B Shoot',
  'Restaurant & Cafe Shoot',
  'Interior Shoot',
  'Hotel Shoot',
  'Fashion Shoot',
  'Jewellery Shoot',
  'Product Shoot',
  'Other / Custom Requirement',
];

export const ClientBookingView: React.FC<ClientBookingViewProps> = ({
  photographers,
  availability,
  shoots,
  onBookShoot,
}) => {
  // 1. Shoot Date / Event Date (default: 18th of current month September 2026)
  const [targetDate, setTargetDate] = useState<string>(() => {
    return formatDateKey(new Date(APP_CURRENT_YEAR, APP_CURRENT_MONTH, 18));
  });

  // 2. Type of Shoot (default: Commercial Shoot)
  const [selectedShootType, setSelectedShootType] = useState<string>(
    'Commercial Shoot'
  );

  // 3. Optional third column when "Other / Custom Requirement" is selected
  const [customRequirementText, setCustomRequirementText] = useState<string>('');

  // Active photographer chosen for booking modal
  const [activePhotographerForBooking, setActivePhotographerForBooking] =
    useState<PhotographerProfile | null>(null);

  // Booking Flow Steps: 'calendar' first, then 'details', then confirmed
  const [bookingStep, setBookingStep] = useState<'calendar' | 'details'>('calendar');
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>(() => {
    return formatDateKey(new Date(APP_CURRENT_YEAR, APP_CURRENT_MONTH, 18));
  });
  const [popupCalendarDate, setPopupCalendarDate] = useState<Date>(
    () => new Date(APP_CURRENT_YEAR, APP_CURRENT_MONTH, 1)
  );

  // Booking Form State (ordered strictly per user requirements)
  // Field 1: What type of shoot
  const [formShootType, setFormShootType] = useState<string>('Commercial Shoot');
  const [formCustomShootType, setFormCustomShootType] = useState<string>('');

  // Field 2: Client information (Name, Phone, Email ID)
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('+91 ');
  const [clientEmail, setClientEmail] = useState<string>('');

  // Field 3: Timing of the shoot (Start and End)
  const [timingStart, setTimingStart] = useState<string>('14:00');
  const [timingEnd, setTimingEnd] = useState<string>('22:00');

  // Field 4: Mood board link
  const [moodBoardLink, setMoodBoardLink] = useState<string>('');

  // Field 5: Briefs
  const [shootBrief, setShootBrief] = useState<string>('');

  // Field 6 (Last Thing): Shoot Location / Venue
  const [shootLocation, setShootLocation] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedShoot, setConfirmedShoot] = useState<ShootBooking | null>(null);
  const [popupFeedbackMsg, setPopupFeedbackMsg] = useState<string | null>(null);

  // Filter available photographers on the selected targetDate who match the required shoot type
  const availablePhotographers = photographers.filter((p) => {
    const pAvail = availability[p.id] || {};
    const status = pAvail[targetDate] || 'available';
    const isAvailable = status === 'available';
    if (!isAvailable) return false;

    // Compatibility check
    if (selectedShootType === 'Other / Custom Requirement') {
      if (!customRequirementText.trim()) return true;
      const q = customRequirementText.toLowerCase().trim();
      return (
        p.specialties.some((s) => s.toLowerCase().includes(q)) ||
        p.title.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q)
      );
    }

    const shootKeyword = selectedShootType.toLowerCase().split(' ')[0];
    const matchesSpecialty = p.specialties.some((spec) =>
      spec.toLowerCase().includes(shootKeyword)
    );
    const matchesTitle = p.title.toLowerCase().includes(shootKeyword);
    const matchesBio = p.bio.toLowerCase().includes(shootKeyword);

    return matchesSpecialty || matchesTitle || matchesBio;
  });

  // Open booking modal for a photographer: MUST POP UP CALENDAR FIRST!
  const handleOpenBookingModal = (p: PhotographerProfile) => {
    setActivePhotographerForBooking(p);
    setConfirmedShoot(null);
    setBookingStep('calendar'); // Show Calendar popup first!
    setSelectedBookingDate(targetDate);
    // Initialize popup calendar month from targetDate
    const [tY, tM] = targetDate.split('-').map(Number);
    if (!isNaN(tY) && !isNaN(tM)) {
      setPopupCalendarDate(new Date(tY, tM - 1, 1));
    } else {
      setPopupCalendarDate(new Date());
    }
    setFormShootType(selectedShootType);
    setFormCustomShootType(customRequirementText);
    setShootLocation(p.city);
    setPopupFeedbackMsg(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePhotographerForBooking || !clientName.trim() || !clientPhone.trim()) {
      return;
    }

    const effectiveShootType =
      formShootType === 'Other / Custom Requirement' && formCustomShootType.trim()
        ? formCustomShootType.trim()
        : formShootType;

    setIsSubmitting(true);
    setTimeout(() => {
      const newBooking = onBookShoot({
        photographerId: activePhotographerForBooking.id,
        date: selectedBookingDate,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || 'client@booking.in',
        shootType: effectiveShootType,
        timingStart,
        timingEnd,
        moodBoardUrl: moodBoardLink.trim(),
        shootBrief: shootBrief.trim(),
        cityVenue: shootLocation.trim() || activePhotographerForBooking.city,
        notes: `Timing: ${timingStart} - ${timingEnd}. Brief: ${shootBrief.trim()}`,
        source: 'client_booking',
        status: 'confirmed',
      });

      setConfirmedShoot(newBooking);
      setIsSubmitting(false);
    }, 400);
  };

  const handleDownloadICS = () => {
    if (!confirmedShoot || !activePhotographerForBooking) return;

    const dtStart = confirmedShoot.date.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Shoot Social BAE Calendar//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${confirmedShoot.shootType} with ${activePhotographerForBooking.name}`,
      `DESCRIPTION:${confirmedShoot.shootBrief || 'Photography Shoot'}\\nTiming: ${confirmedShoot.timingStart || ''} to ${confirmedShoot.timingEnd || ''}\\nClient: ${confirmedShoot.clientName} (${confirmedShoot.clientPhone} / ${confirmedShoot.clientEmail})`,
      `LOCATION:${confirmedShoot.cityVenue}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtStart}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shoot-${confirmedShoot.date}-${activePhotographerForBooking.name.replace(/\s+/g, '_')}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Popup calendar helpers
  const popYear = popupCalendarDate.getFullYear();
  const popMonth = popupCalendarDate.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const popDaysInMonth = new Date(popYear, popMonth + 1, 0).getDate();
  const popFirstDayIndex = new Date(popYear, popMonth, 1).getDay();

  return (
    <div id="client-portal-root" className="space-y-8 max-w-7xl mx-auto">
      {/* Starting Section: Hero Header & Date Booking Bar */}
      <div
        id="commercial-date-booking-section"
        className="bg-[#0b1733] border border-[#1d3870] rounded-3xl p-5 sm:p-8 text-stone-100 shadow-xl relative z-20"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d4f770]/15 text-[#d4f770] border border-[#d4f770]/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shoot Social BAE • Premier Photography Network</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Your shoot will be handled by us, <br className="hidden sm:inline" />
              <span className="text-[#d4f770]">just book your dates.</span>
            </h1>
            <p className="text-sm sm:text-lg font-bold text-stone-200">
              We provide the best photographers available in Delhi NCR and across India.
            </p>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              We click photos — we do click millions of photos a day! From high-impact commercial campaigns, F&amp;B and restaurant shoots, fashion lookbooks, hotel interiors, and product campaigns, Shoot Social BAE manages verified premier photographers ready for your exact shoot date.
            </p>
          </div>

          {/* Animated Film-Strip Ticker */}
          <div className="pt-2 pb-1 overflow-hidden rounded-2xl bg-[#060e22] border border-[#1d3870]">
            <div className="animate-marquee py-2 text-[11px] font-mono tracking-widest text-stone-300">
              <span className="flex items-center gap-4 px-4 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#d4f770]" />
                <strong className="text-white">DELHI NCR VERIFIED NETWORK</strong>
                <span>•</span>
                <span className="text-[#d4f770]">100% REAL-TIME CALENDAR DATES</span>
                <span>•</span>
                <span>DIRECT BOOKING WITH ZERO BROKERAGE</span>
                <span>•</span>
                <span className="text-white">MILLIONS OF CLICKS DELIVERED</span>
                <span>•</span>
                <span className="text-[#d4f770]">COMMERCIAL, F&amp;B &amp; FASHION</span>
                <span>•</span>
                <span>1-CLICK ICS CALENDAR SYNC</span>
                <span>•</span>
              </span>
              <span className="flex items-center gap-4 px-4 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#d4f770]" />
                <strong className="text-white">DELHI NCR VERIFIED NETWORK</strong>
                <span>•</span>
                <span className="text-[#d4f770]">100% REAL-TIME CALENDAR DATES</span>
                <span>•</span>
                <span>DIRECT BOOKING WITH ZERO BROKERAGE</span>
                <span>•</span>
                <span className="text-white">MILLIONS OF CLICKS DELIVERED</span>
                <span>•</span>
                <span className="text-[#d4f770]">COMMERCIAL, F&amp;B &amp; FASHION</span>
                <span>•</span>
                <span>1-CLICK ICS CALENDAR SYNC</span>
                <span>•</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar: Shoot Date & Type of Shoot */}
        <div className="mt-6 bg-[#060e22] p-4 sm:p-5 rounded-2xl border border-[#1d3870] relative z-30">
          <div
            className={`grid gap-4 ${
              selectedShootType === 'Other / Custom Requirement'
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}
          >
            {/* Column 1: Shoot Date / Event Date */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-white" />
                <span>Shoot Date / Event Date:</span>
              </label>
              <CustomDatePicker
                id="input-check-event-date"
                value={targetDate}
                onChange={(newDate) => setTargetDate(newDate)}
                minDate={`${APP_CURRENT_YEAR}-09-01`}
              />
            </div>

            {/* Column 2: Type of Shoot */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#d4f770]" />
                <span>Type of Shoot:</span>
              </label>
              <select
                id="select-shoot-type-filter"
                value={selectedShootType}
                onChange={(e) => setSelectedShootType(e.target.value)}
                className="w-full bg-[#0b1733] border border-[#1d3870] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#d4f770] cursor-pointer"
              >
                {SHOOT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Column 3: Appears ONLY when client chooses "Other / Custom Requirement" */}
            {selectedShootType === 'Other / Custom Requirement' && (
              <div>
                <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#d4f770]" />
                  <span>Write about the shoot requirement:</span>
                </label>
                <input
                  id="input-other-shoot-requirement"
                  type="text"
                  placeholder="e.g. Traditional puja, jewelry lookbook, pet portraits..."
                  value={customRequirementText}
                  onChange={(e) => setCustomRequirementText(e.target.value)}
                  className="w-full bg-[#0b1733] border border-[#d4f770]/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                />
              </div>
            )}
          </div>

          {/* Quick Date Availability Banner */}
          <div className="flex items-center justify-between pt-3.5 mt-3.5 border-t border-[#182f5e] text-xs">
            <div className="text-stone-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4f770] inline-block animate-pulse" />
              <span>
                <strong className="text-[#d4f770] font-bold">{availablePhotographers.length}</strong>{' '}
                photographer{availablePhotographers.length === 1 ? '' : 's'} available for{' '}
                <strong className="text-white">{selectedShootType}</strong> on{' '}
                <strong className="text-[#d4f770] font-bold">{formatDateDayMonth(targetDate)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Photographers for this Date & Shoot Type */}
      <div className="bg-[#0b1733] border border-[#1d3870] rounded-3xl p-5 sm:p-6 text-stone-100 shadow-xl space-y-4">
        <div className="border-b border-[#182f5e] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#d4f770]" />
              <span>
                Available Photographers ({availablePhotographers.length}) — Date: {formatDateDayMonth(targetDate)}
              </span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Verified available on <strong className="text-white">{formatDateDayMonth(targetDate)}</strong> for {selectedShootType}.
            </p>
          </div>
        </div>

        {availablePhotographers.length === 0 ? (
          <div className="p-12 text-center text-stone-400 bg-[#060e22] rounded-2xl border border-[#1d3870]">
            <CalendarIcon className="w-10 h-10 text-stone-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-stone-200">
              No photographers available on {formatDateDayMonth(targetDate)} for this shoot type
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Try picking another nearby date on the date picker above to see who is available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availablePhotographers.map((p) => (
              <div
                key={p.id}
                id={`available-photographer-card-${p.id}`}
                className="rounded-3xl p-5 border bg-[#060e22] border-[#1d3870] hover:border-[#2d529d] transition flex flex-col justify-between shadow-md group"
              >
                <div>
                  {/* Name, City, Experience & Available Tag */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      {p.avatarUrl ? (
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover border border-[#1d3870]"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.avatarColor} text-white flex items-center justify-center font-bold text-base shadow-sm`}
                        >
                          {p.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight group-hover:text-[#d4f770] transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#d4f770]" />
                          <span>{p.city} • {p.experienceYears}+ yrs exp</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#d4f770] text-[#0a152e] flex items-center gap-1 shrink-0">
                      <Check className="w-3 h-3 stroke-3" />
                      <span>Available</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#d4f770] font-bold mb-1.5">
                    {p.title}
                  </p>

                  <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed mb-4">
                    {p.bio}
                  </p>

                  {/* Specialties Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-0.5 rounded-md bg-[#0b1733] border border-[#1d3870] text-[10px] text-stone-300"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct 1-Click Action to Book for this date */}
                <div className="pt-3 border-t border-[#182f5e]">
                  <button
                    id={`btn-book-photographer-${p.id}`}
                    type="button"
                    onClick={() => handleOpenBookingModal(p)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#d4f770] hover:bg-[#c6f052] text-[#0a152e] text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Book for {formatDateDayMonth(targetDate)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* POPUP BOOKING FORM MODAL */}
      {activePhotographerForBooking && (
        <div
          id="client-booking-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setActivePhotographerForBooking(null)}
        >
          <div
            id="client-booking-modal-card"
            className="bg-[#0b1733] border border-[#1d3870] rounded-3xl max-w-2xl w-full p-5 sm:p-7 text-stone-100 shadow-2xl space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#182f5e] pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Book {activePhotographerForBooking.name}
                </h3>
                <p className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                  <span>Date: <strong className="text-[#d4f770] font-bold">{formatDateDayMonth(targetDate)}</strong></span>
                  <span>•</span>
                  <span className="text-[#d4f770] font-semibold">{activePhotographerForBooking.city}</span>
                  <span>•</span>
                  <span>{activePhotographerForBooking.title}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActivePhotographerForBooking(null)}
                className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-[#112349] text-sm"
              >
                ✕
              </button>
            </div>

            {/* Confirmation State */}
            {confirmedShoot ? (
              <div className="p-6 text-center space-y-4 bg-[#060e22] rounded-2xl border border-[#d4f770]/40">
                <div className="w-14 h-14 rounded-full bg-[#d4f770]/20 text-[#d4f770] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 stroke-2" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Shoot Confirmed & Booked!</h3>
                  <p className="text-xs text-stone-300 mt-1 max-w-md mx-auto">
                    The date <strong className="text-[#d4f770] font-bold">{formatDateDayMonth(confirmedShoot.date)}</strong> is now reserved on {activePhotographerForBooking.name}'s calendar via Shoot Social BAE.
                  </p>
                </div>

                {/* Summary Card with all entered details */}
                <div className="bg-[#0b1733] p-4 rounded-2xl border border-[#1d3870] text-left text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-[#182f5e] pb-2">
                    <span className="text-stone-400">Shoot Date:</span>
                    <span className="text-[#d4f770] font-bold">{formatDateDayMonth(confirmedShoot.date)}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#182f5e] pb-2">
                    <span className="text-stone-400">Type of Shoot:</span>
                    <span className="text-white font-semibold">{confirmedShoot.shootType}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#182f5e] pb-2">
                    <span className="text-stone-400">Client Name:</span>
                    <span className="text-white font-medium">{confirmedShoot.clientName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#182f5e] pb-2">
                    <span className="text-stone-400">Phone / WhatsApp:</span>
                    <span className="text-white font-medium">{confirmedShoot.clientPhone}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#182f5e] pb-2">
                    <span className="text-stone-400">Email ID:</span>
                    <span className="text-white font-medium">{confirmedShoot.clientEmail}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#182f5e] pb-2">
                    <span className="text-stone-400">Timing (Start & End):</span>
                    <span className="text-[#d4f770] font-bold">
                      {confirmedShoot.timingStart} - {confirmedShoot.timingEnd}
                    </span>
                  </div>
                  {confirmedShoot.moodBoardUrl && (
                    <div className="flex justify-between border-b border-[#182f5e] pb-2">
                      <span className="text-stone-400">Mood Board:</span>
                      <a
                        href={confirmedShoot.moodBoardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#d4f770] hover:underline flex items-center gap-1 max-w-[200px] truncate"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span className="truncate">{confirmedShoot.moodBoardUrl}</span>
                      </a>
                    </div>
                  )}
                  {confirmedShoot.shootBrief && (
                    <div className="border-b border-[#182f5e] pb-2">
                      <span className="text-stone-400 block mb-0.5">Brief of Shoot:</span>
                      <p className="text-stone-300 italic bg-[#060e22] p-2.5 rounded-lg border border-[#1d3870]">
                        "{confirmedShoot.shootBrief}"
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between pt-1">
                    <span className="text-stone-400">Shoot Location:</span>
                    <span className="text-white font-semibold">{confirmedShoot.cityVenue}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={`https://wa.me/${activePhotographerForBooking.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Namaste ${activePhotographerForBooking.name}, I have booked you for ${confirmedShoot.shootType} on ${confirmedShoot.date} at ${confirmedShoot.cityVenue}. Timing: ${confirmedShoot.timingStart} - ${confirmedShoot.timingEnd}. Client: ${confirmedShoot.clientName} (${confirmedShoot.clientPhone}, ${confirmedShoot.clientEmail}). Booked via Shoot Social BAE.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#060e22] hover:bg-[#112349] text-[#d4f770] border border-[#1d3870] hover:border-[#d4f770]/50 text-xs font-bold inline-flex items-center gap-2 transition shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-[#d4f770]" />
                    <span>WhatsApp Photographer</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleDownloadICS}
                    className="px-4 py-2.5 rounded-xl bg-[#112349] hover:bg-[#162f63] text-white text-xs inline-flex items-center gap-2 border border-[#1d3870]"
                  >
                    <Download className="w-4 h-4 text-[#d4f770]" />
                    <span>Download Calendar (.ics)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePhotographerForBooking(null)}
                    className="px-4 py-2.5 rounded-xl bg-[#060e22] hover:bg-[#112349] text-stone-300 text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : bookingStep === 'calendar' ? (
              /* STEP 1: CALENDAR POPUP FIRST (as requested by user) */
              <div className="space-y-4">
                {/* Step indicator */}
                <div className="flex items-center justify-between bg-[#060e22] p-3 rounded-2xl border border-[#1d3870]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#d4f770] text-[#0a152e] font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-bold text-white">
                      Step 1: Check Availability & Confirm Date on Calendar
                    </span>
                  </div>
                  <span className="text-[11px] text-[#d4f770]">
                    2 Steps
                  </span>
                </div>

                {/* Month Navigator */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#d4f770]" />
                    <span>
                      {monthNames[popMonth]} {popYear}
                    </span>
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={popYear === APP_CURRENT_YEAR && popMonth <= APP_CURRENT_MONTH}
                      onClick={() =>
                        setPopupCalendarDate(new Date(popYear, popMonth - 1, 1))
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#060e22] hover:bg-[#112349] disabled:opacity-40 text-xs text-stone-300 border border-[#1d3870] transition"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPopupCalendarDate(new Date(popYear, popMonth + 1, 1))
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#060e22] hover:bg-[#112349] text-xs text-stone-300 border border-[#1d3870] transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-3 bg-[#060e22] rounded-2xl border border-[#1d3870]">
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-stone-400 pb-2 border-b border-[#182f5e]">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 pt-2">
                    {/* Blank offset days */}
                    {Array.from({ length: popFirstDayIndex }).map((_, i) => (
                      <div key={`pop-empty-${i}`} className="h-11 sm:h-12 rounded-lg bg-transparent" />
                    ))}

                    {/* Day numbers */}
                    {Array.from({ length: popDaysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dateKey = `${popYear}-${String(popMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const photogAvail = availability[activePhotographerForBooking.id] || {};
                      const status = photogAvail[dateKey] || 'available';
                      const isBooked = status === 'booked';
                      const isSelected = selectedBookingDate === dateKey;

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() => {
                            if (isBooked) {
                              setPopupFeedbackMsg(
                                `${formatDateDayMonth(dateKey)} is booked for another shoot. Please choose an available date.`
                              );
                            } else {
                              setSelectedBookingDate(dateKey);
                              setPopupFeedbackMsg(null);
                            }
                          }}
                          className={`h-12 sm:h-14 rounded-xl p-1.5 text-left flex flex-col justify-between transition relative border ${
                            isSelected
                              ? 'ring-2 ring-[#d4f770] border-[#d4f770] bg-[#112349] shadow-md shadow-[#d4f770]/20'
                              : isBooked
                              ? 'bg-[#d4f770]/12 hover:bg-[#d4f770]/20 border-[#d4f770]/40 cursor-not-allowed'
                              : 'bg-[#0b1733] hover:bg-[#112349] border-[#1d3870] hover:border-[#2d529d]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={`text-[11px] sm:text-xs font-bold leading-none ${
                                isSelected
                                  ? 'text-white'
                                  : isBooked
                                  ? 'text-[#d4f770]'
                                  : 'text-stone-200'
                              }`}
                            >
                              {dayNum}
                            </span>
                            {isBooked ? (
                              <Camera className="w-3 h-3 text-[#d4f770]" />
                            ) : isSelected ? (
                              <Check className="w-3 h-3 text-[#d4f770] stroke-[3]" />
                            ) : null}
                          </div>

                          {isBooked && (
                            <div className="w-full">
                              <span className="text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded bg-[#d4f770] text-[#0a152e] tracking-wider block text-center leading-tight">
                                BOOKED
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {popupFeedbackMsg && (
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{popupFeedbackMsg}</span>
                  </div>
                )}

                {/* Selected Date Summary & CTA to Proceed to Shoot Details */}
                <div className="p-3.5 rounded-2xl bg-[#060e22] border border-[#1d3870] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
                      Target Shoot Date Selected
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm sm:text-base font-bold text-[#d4f770]">
                        {formatDateDayMonth(selectedBookingDate)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const photogAvail = availability[activePhotographerForBooking.id] || {};
                      if (photogAvail[selectedBookingDate] === 'booked') {
                        setPopupFeedbackMsg('The selected date is already booked. Please choose an available date.');
                        return;
                      }
                      setBookingStep('details');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#d4f770] hover:bg-[#c6f052] text-[#0a152e] text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>Confirm {formatDateDayMonth(selectedBookingDate)} & Enter Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: SHOOT DETAILS FEED (after user confirms date in popup calendar) */
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                {/* Back button and summary header */}
                <div className="flex items-center justify-between bg-[#060e22] p-3 rounded-2xl border border-[#1d3870]">
                  <button
                    type="button"
                    onClick={() => setBookingStep('calendar')}
                    className="text-xs text-[#d4f770] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>← Change Date on Calendar</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-400">Shoot Date:</span>
                    <span className="text-xs font-bold text-[#d4f770] bg-[#0b1733] px-2.5 py-1 rounded-lg border border-[#1d3870]">
                      {formatDateDayMonth(selectedBookingDate)}
                    </span>
                  </div>
                </div>

                {/* 1. What type of shoot is it? (First Thing) */}
                <div>
                  <label className="block text-xs font-semibold text-stone-200 mb-1">
                    1. What type of shoot is it? *
                  </label>
                  <select
                    id="input-form-shoot-type"
                    value={formShootType}
                    onChange={(e) => setFormShootType(e.target.value)}
                    className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#d4f770] cursor-pointer"
                  >
                    {SHOOT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  {formShootType === 'Other / Custom Requirement' && (
                    <input
                      type="text"
                      placeholder="Write about the shoot requirement..."
                      value={formCustomShootType}
                      onChange={(e) => setFormCustomShootType(e.target.value)}
                      className="w-full mt-2 bg-[#060e22] border border-[#d4f770]/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                    />
                  )}
                </div>

                {/* 2. Client Information: Name, Phone Number, Email ID */}
                <div className="p-3.5 bg-[#060e22] rounded-2xl border border-[#1d3870] space-y-3">
                  <div className="text-[11px] font-semibold text-[#d4f770] flex items-center gap-1.5 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5" />
                    <span>2. Client Information</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">
                      Client Full Name *
                    </label>
                    <input
                      id="input-form-client-name"
                      type="text"
                      required
                      placeholder="e.g. Client Name / Couple Name / Creative Lead"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[#0b1733] border border-[#1d3870] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#d4f770]" />
                        <span>Phone / WhatsApp (+91) *</span>
                      </label>
                      <input
                        id="input-form-client-phone"
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-[#0b1733] border border-[#1d3870] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#d4f770]" />
                        <span>Email ID *</span>
                      </label>
                      <input
                        id="input-form-client-email"
                        type="email"
                        required
                        placeholder="client@gmail.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-[#0b1733] border border-[#1d3870] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Timing of the shoot: Start and End */}
                <div className="p-3.5 bg-[#060e22] rounded-2xl border border-[#1d3870] space-y-2.5">
                  <div className="text-[11px] font-semibold text-[#d4f770] flex items-center gap-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>3. Timing of the Shoot (Start & End)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-stone-400 mb-1">
                        Start Time *
                      </label>
                      <input
                        id="input-form-time-start"
                        type="time"
                        required
                        value={timingStart}
                        onChange={(e) => setTimingStart(e.target.value)}
                        className="w-full bg-[#0b1733] border border-[#1d3870] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4f770]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-400 mb-1">
                        End Time *
                      </label>
                      <input
                        id="input-form-time-end"
                        type="time"
                        required
                        value={timingEnd}
                        onChange={(e) => setTimingEnd(e.target.value)}
                        className="w-full bg-[#0b1733] border border-[#1d3870] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4f770]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Mood board link */}
                <div>
                  <label className="block text-xs font-semibold text-stone-200 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-[#d4f770]" />
                    <span>4. Mood board link (Pinterest / Google Drive / Canva / Instagram)</span>
                  </label>
                  <input
                    id="input-form-moodboard"
                    type="url"
                    placeholder="https://pinterest.com/pin/... or Google Drive link"
                    value={moodBoardLink}
                    onChange={(e) => setMoodBoardLink(e.target.value)}
                    className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                  />
                </div>

                {/* 5. Brief of a shoot */}
                <div>
                  <label className="block text-xs font-semibold text-stone-200 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#d4f770]" />
                    <span>5. Brief of a shoot *</span>
                  </label>
                  <textarea
                    id="input-form-brief"
                    rows={2}
                    required
                    placeholder="Deliverables, ceremony/shot list, aesthetic vibe, reference details..."
                    value={shootBrief}
                    onChange={(e) => setShootBrief(e.target.value)}
                    className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                  />
                </div>

                {/* 6. Shoot Location / Venue (Last Thing) */}
                <div>
                  <label className="block text-xs font-semibold text-stone-200 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#d4f770]" />
                    <span>6. Shoot Location / Venue (Last Thing) *</span>
                  </label>
                  <input
                    id="input-form-location"
                    type="text"
                    required
                    placeholder="e.g. ITC Maurya New Delhi, The Leela Palace Chanakyapuri, Farmhouse Chattarpur"
                    value={shootLocation}
                    onChange={(e) => setShootLocation(e.target.value)}
                    className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    id="btn-confirm-shoot-booking"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#d4f770] hover:bg-[#c6f052] text-[#0a152e] font-bold text-xs transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Reserving Date on Calendar...</span>
                    ) : (
                      <>
                        <span>Confirm & Book Shoot for {formatDateDayMonth(selectedBookingDate)}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
