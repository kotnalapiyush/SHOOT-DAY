import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Check,
  CheckCircle2,
  Clock,
  Link as LinkIcon,
  FileText,
  User,
  Phone,
  Mail,
  Camera,
  X,
  Sparkles,
  Download,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { PhotographerProfile, ShootBooking, DayStatus } from '../types';
import { formatDateDayMonth, formatDateKey } from '../utils/storage';
import { PhotographerAvailabilityPicker } from './PhotographerAvailabilityPicker';
import { ShootLobbyLogo } from './ShootLobbyLogo';

// Standard 30-min shoot time slots
const TIME_OPTIONS = [
  { value: '06:00', label: '06:00 AM' },
  { value: '06:30', label: '06:30 AM' },
  { value: '07:00', label: '07:00 AM' },
  { value: '07:30', label: '07:30 AM' },
  { value: '08:00', label: '08:00 AM' },
  { value: '08:30', label: '08:30 AM' },
  { value: '09:00', label: '09:00 AM' },
  { value: '09:30', label: '09:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '13:30', label: '01:30 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '14:30', label: '02:30 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '15:30', label: '03:30 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '16:30', label: '04:30 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '17:30', label: '05:30 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '18:30', label: '06:30 PM' },
  { value: '19:00', label: '07:00 PM' },
  { value: '19:30', label: '07:30 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '20:30', label: '08:30 PM' },
  { value: '21:00', label: '09:00 PM' },
  { value: '21:30', label: '09:30 PM' },
  { value: '22:00', label: '10:00 PM' },
];

interface ClientBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographer: PhotographerProfile | null;
  targetDate: string;
  shootType: string;
  onConfirmBooking: (booking: Omit<ShootBooking, 'id' | 'createdAt'>) => ShootBooking;
  availability?: Record<string, Record<string, DayStatus>>;
  shoots?: ShootBooking[];
}

export const ClientBookingModal: React.FC<ClientBookingModalProps> = ({
  isOpen,
  onClose,
  photographer,
  targetDate,
  shootType,
  onConfirmBooking,
  availability = {},
  shoots = [],
}) => {
  const [date, setDate] = useState(targetDate || formatDateKey(new Date()));
  const [selectedType, setSelectedType] = useState(shootType || 'Commercial Shoot');
  const [customRequirement, setCustomRequirement] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+91 ');
  const [clientEmail, setClientEmail] = useState('');
  const [timingStart, setTimingStart] = useState('10:00');
  const [timingEnd, setTimingEnd] = useState('18:00');
  const [moodBoardLink, setMoodBoardLink] = useState('');
  const [shootBrief, setShootBrief] = useState('');
  const [shootLocation, setShootLocation] = useState(photographer?.city || 'Mumbai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ShootBooking | null>(null);

  // Sync date when targetDate changes
  React.useEffect(() => {
    if (targetDate) setDate(targetDate);
  }, [targetDate]);

  React.useEffect(() => {
    if (shootType) setSelectedType(shootType);
  }, [shootType]);

  React.useEffect(() => {
    if (photographer) {
      setShootLocation(photographer.city);
    }
    setConfirmedBooking(null);
  }, [photographer]);

  // Lock body scroll when modal is open to prevent background scrolling
  useEffect(() => {
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

  // Check if date is booked for this photographer
  const isDateBooked = (dateKey: string): boolean => {
    if (!photographer) return false;
    const photogAvail = availability[photographer.id] || {};
    if (photogAvail[dateKey] === 'booked') return true;
    return shoots.some(
      (s) =>
        s.photographerId === photographer.id &&
        s.date === dateKey &&
        s.status !== 'cancelled'
    );
  };

  const isCurrentDateBooked = isDateBooked(date);

  if (!isOpen || !photographer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCurrentDateBooked) {
      alert(`Notice: ${photographer.name} is already booked on ${formatDateDayMonth(date)}. Please choose an available date.`);
      return;
    }

    setIsSubmitting(true);

    const finalShootType =
      selectedType === 'Other Shoot' && customRequirement.trim()
        ? `Other Shoot: ${customRequirement.trim()}`
        : selectedType;

    const finalBrief =
      selectedType === 'Other Shoot' && customRequirement.trim()
        ? [customRequirement.trim(), shootBrief].filter(Boolean).join('\n\nRequirement: ')
        : shootBrief;

    const booking = onConfirmBooking({
      photographerId: photographer.id,
      date,
      clientName: clientName || 'Direct Client',
      clientPhone,
      clientEmail,
      cityVenue: shootLocation || photographer.city,
      shootType: finalShootType,
      moodBoardUrl: moodBoardLink,
      shootBrief: finalBrief,
      timingStart,
      timingEnd,
      source: 'client_booking',
      status: 'confirmed',
    });

    setConfirmedBooking(booking);
    setIsSubmitting(false);
  };

  const handleAddToGoogleCalendar = () => {
    if (!confirmedBooking || !photographer) return;
    const [y, m, d] = confirmedBooking.date.split('-');
    const [startH, startM] = (confirmedBooking.timingStart || '10:00').split(':');
    const [endH, endM] = (confirmedBooking.timingEnd || '18:00').split(':');
    const pad = (v: string) => v.padStart(2, '0');
    const dtStart = `${y}${pad(m)}${pad(d)}T${pad(startH || '10')}${pad(startM || '00')}00`;
    const dtEnd = `${y}${pad(m)}${pad(d)}T${pad(endH || '18')}${pad(endM || '00')}00`;

    const title = `Shoot with ${photographer.name} (${confirmedBooking.shootType})`;
    const details = `Confirmed Shoot with ${photographer.name} via Shoot Lobby.\n\nPhotographer: ${photographer.name} (${photographer.phone || ''})\nShoot Type: ${confirmedBooking.shootType}\nClient: ${confirmedBooking.clientName} (${confirmedBooking.clientPhone})\nVenue: ${confirmedBooking.cityVenue}\nTime: ${confirmedBooking.timingStart} - ${confirmedBooking.timingEnd}`;
    const location = confirmedBooking.cityVenue || photographer.city;

    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dtStart}/${dtEnd}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    window.open(gCalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadICS = () => {
    if (!confirmedBooking) return;
    const [y, m, d] = confirmedBooking.date.split('-');
    const [startH, startM] = (confirmedBooking.timingStart || '10:00').split(':');
    const [endH, endM] = (confirmedBooking.timingEnd || '18:00').split(':');

    const dtStart = `${y}${m}${d}T${startH || '10'}${startM || '00'}00`;
    const dtEnd = `${y}${m}${d}T${endH || '18'}${endM || '00'}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Shoot Lobby//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:shoot-${Date.now()}@shootlobby.in`,
      `DTSTAMP:${y}${m}${d}T000000Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:Shoot Lobby with ${photographer.name} (${confirmedBooking.shootType})`,
      `DESCRIPTION:Shoot with ${photographer.name}. Client: ${confirmedBooking.clientName}. Venue: ${confirmedBooking.cityVenue}`,
      `LOCATION:${confirmedBooking.cityVenue}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ShootLobby_${confirmedBooking.date}_${photographer.name.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden overscroll-contain select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#DCE7D4] relative overflow-hidden text-[#073B2F] overscroll-contain touch-pan-y animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {confirmedBooking ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 relative text-center space-y-4 overscroll-contain">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-[#5C6E5E] hover:text-[#073B2F] p-2 rounded-xl hover:bg-[#F6F3EC] transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Circular Shoot Lobby Aperture Ring with Tick inside */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#F0FFDA] border border-[#DCE7D4]" />
              <svg
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 absolute inset-2 select-none"
                aria-hidden="true"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  fill="none"
                  stroke="#073B2F"
                  strokeWidth="2.8"
                  strokeDasharray="1.2 3.6"
                  strokeLinecap="round"
                />
              </svg>
              <Check className="w-8 h-8 text-[#073B2F] stroke-3 relative z-10" />
            </div>

            {/* Big Headline & Reservation Line */}
            <div className="space-y-2 pt-1">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#073B2F] font-['Space_Grotesk',sans-serif] tracking-tight">
                Your shoot is confirmed!
              </h3>
              <p className="text-base sm:text-lg text-[#073B2F] max-w-md mx-auto leading-relaxed">
                <strong className="font-bold">{photographer.name}</strong> is reserved for you for{' '}
                <strong className="font-bold text-[#FF6A45]">{formatDateDayMonth(confirmedBooking.date)}</strong>.
              </p>
            </div>

            <div className="bg-[#F6F3EC] border border-[#DCE7D4] rounded-2xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between pb-1.5 border-b border-[#DCE7D4]">
                <span className="text-[#5C6E5E] font-medium">Photographer</span>
                <span className="font-bold text-[#073B2F]">{photographer.name}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#DCE7D4]">
                <span className="text-[#5C6E5E] font-medium">Date</span>
                <span className="font-bold text-[#FF6A45]">{formatDateDayMonth(confirmedBooking.date)}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#DCE7D4]">
                <span className="text-[#5C6E5E] font-medium">Timing</span>
                <span className="font-semibold text-[#073B2F]">
                  {confirmedBooking.timingStart} - {confirmedBooking.timingEnd}
                </span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#DCE7D4]">
                <span className="text-[#5C6E5E] font-medium">Type of Shoot</span>
                <span className="font-bold text-[#073B2F] text-right">{confirmedBooking.shootType}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-[#DCE7D4]">
                <span className="text-[#5C6E5E] font-medium">Client</span>
                <span className="font-semibold text-[#073B2F]">{confirmedBooking.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C6E5E] font-medium">Location</span>
                <span className="font-semibold text-[#073B2F]">{confirmedBooking.cityVenue}</span>
              </div>
            </div>

            {/* Direct Add to Google Calendar Action Button */}
            <div className="flex flex-col gap-2 pt-2 max-w-md mx-auto">
              <button
                type="button"
                id="btn-add-google-calendar"
                onClick={handleAddToGoogleCalendar}
                className="w-full py-3.5 px-6 bg-[#073B2F] hover:bg-[#052d24] active:scale-[0.98] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2.5 transition shadow-sm"
              >
                <CalendarIcon className="w-4 h-4 text-[#F0FFDA]" />
                <span>Add to Google Calendar</span>
              </button>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadICS}
                  className="flex-1 py-2.5 px-3 bg-white hover:bg-[#F6F3EC] text-[#073B2F] border border-[#DCE7D4] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-[#5C6E5E]" />
                  <span>Download .ics file</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-5 bg-[#F6F3EC] hover:bg-[#ece8df] text-[#073B2F] border border-[#DCE7D4] font-bold rounded-xl text-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[92vh] overflow-hidden">
            {/* Fixed Header with Photographer Card Summary & Dedicated Close Button */}
            <div className="shrink-0 p-4 sm:p-5 pb-3.5 border-b border-[#DCE7D4] flex items-start justify-between gap-3 bg-white">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={photographer.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'}
                  alt={photographer.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-[#DCE7D4] shrink-0"
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
                    <span>{photographer.city} • {photographer.experienceYears}+ yrs exp</span>
                  </p>
                  <p className="text-[11px] font-semibold text-[#FF6A45] truncate mt-0.5">
                    {photographer.title}
                  </p>
                </div>
              </div>

              {/* Dedicated Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="text-[#5C6E5E] hover:text-[#073B2F] p-2 rounded-xl hover:bg-[#F6F3EC] transition shrink-0 -mr-1 -mt-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
              {/* Field 1: Date & Shoot Type */}
              <div
                className={`grid grid-cols-1 ${
                  selectedType === 'Other Shoot' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                } gap-3 transition-all`}
              >
                {/* Column 1: Shoot Date */}
                <div>
                  <label className="block text-xs font-bold text-[#073B2F] mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#073B2F]" />
                      <span>Shoot Date</span>
                    </span>
                    <span className="text-[10px] text-[#5C6E5E] font-semibold">Open Calendar</span>
                  </label>
                  <PhotographerAvailabilityPicker
                    value={date}
                    onChange={(newDate) => setDate(newDate)}
                    photographer={photographer}
                    availability={availability}
                    shoots={shoots}
                  />
                </div>

                {/* Column 2: Type of Shoot */}
                <div>
                  <label htmlFor="field-shoottype" className="block text-xs font-bold text-[#073B2F] mb-1 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#073B2F]" />
                    <span>Type of Shoot</span>
                  </label>
                  <select
                    id="field-shoottype"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-[16px] sm:text-xs font-semibold text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white cursor-pointer"
                  >
                    <option value="Commercial Shoot">Commercial Shoot</option>
                    <option value="Fashion Shoot">Fashion Shoot</option>
                    <option value="Jewellery Shoot">Jewellery Shoot</option>
                    <option value="Hotel Shoot">Hotel Shoot</option>
                    <option value="Interior Shoot">Interior Shoot</option>
                    <option value="Restaurant & Cafe Shoot">Restaurant & Cafe Shoot</option>
                    <option value="F&B Shoot">F&B Shoot</option>
                    <option value="One Day Shoot">One Day Shoot</option>
                    <option value="Product Shoot">Product Shoot</option>
                    <option value="Other Shoot">Other Shoot (Custom Shoot)</option>
                  </select>
                </div>

                {/* Column 3: Dedicated column for Other Shoot */}
                {selectedType === 'Other Shoot' && (
                  <div className="animate-in fade-in zoom-in-95 duration-150">
                    <label htmlFor="field-customrequirement" className="block text-xs font-bold text-[#073B2F] mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#FF6A45]" />
                      <span>What type of shoot is it? <span className="text-red-500">*</span></span>
                    </label>
                    <input
                      id="field-customrequirement"
                      type="text"
                      required
                      enterKeyHint="next"
                      placeholder="e.g. Drone, Maternity, Lookbook..."
                      value={customRequirement}
                      onChange={(e) => setCustomRequirement(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FFF4EE] border border-[#FF6A45]/30 rounded-xl text-[16px] sm:text-xs font-bold text-[#073B2F] focus:outline-none focus:border-[#FF6A45] focus:bg-white transition"
                    />
                  </div>
                )}
              </div>

              {/* Availability Warning Banner if Booked */}
              {isCurrentDateBooked && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in duration-150">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      {photographer.name} is already booked on {formatDateDayMonth(date)}!
                    </p>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      Click the <strong>Shoot Date</strong> box above to open the calendar and pick an available date.
                    </p>
                  </div>
                </div>
              )}

              {/* Field 2: Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="field-clientname" className="block text-xs font-bold text-[#073B2F] mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#5C6E5E]" />
                    <span>Your Name</span>
                  </label>
                  <input
                    id="field-clientname"
                    type="text"
                    required
                    enterKeyHint="next"
                    placeholder="e.g. Priya Shah"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-[16px] sm:text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="field-clientphone" className="block text-xs font-bold text-[#073B2F] mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#5C6E5E]" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    id="field-clientphone"
                    type="tel"
                    required
                    enterKeyHint="next"
                    placeholder="+91 98100 00000"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-[16px] sm:text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="field-clientemail" className="block text-xs font-bold text-[#073B2F] mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#5C6E5E]" />
                    <span>Email ID</span>
                  </label>
                  <input
                    id="field-clientemail"
                    type="email"
                    enterKeyHint="next"
                    placeholder="priya@agency.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-[16px] sm:text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
                  />
                </div>
              </div>

              {/* Field 3: Timing */}
              <div>
                <label className="block text-xs font-bold text-[#073B2F] mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#073B2F]" />
                  <span>Shoot Timing</span>
                </label>

                {/* Two Distinct Time Select Cards with Clear Gap */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Start Time Box */}
                  <div className="bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl p-2.5 focus-within:border-[#073B2F] focus-within:bg-white transition">
                    <label htmlFor="field-timingstart" className="block text-[11px] font-bold text-[#5C6E5E] mb-1">
                      Start Time
                    </label>
                    <div className="relative">
                      <select
                        id="field-timingstart"
                        value={timingStart}
                        onChange={(e) => setTimingStart(e.target.value)}
                        className="w-full bg-transparent font-bold text-[#073B2F] text-[16px] sm:text-xs appearance-none pr-6 cursor-pointer focus:outline-none"
                      >
                        {TIME_OPTIONS.map((opt) => (
                          <option key={`start-${opt.value}`} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#5C6E5E] pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* End Time Box */}
                  <div className="bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl p-2.5 focus-within:border-[#073B2F] focus-within:bg-white transition">
                    <label htmlFor="field-timingend" className="block text-[11px] font-bold text-[#5C6E5E] mb-1">
                      End Time
                    </label>
                    <div className="relative">
                      <select
                        id="field-timingend"
                        value={timingEnd}
                        onChange={(e) => setTimingEnd(e.target.value)}
                        className="w-full bg-transparent font-bold text-[#073B2F] text-[16px] sm:text-xs appearance-none pr-6 cursor-pointer focus:outline-none"
                      >
                        {TIME_OPTIONS.map((opt) => (
                          <option key={`end-${opt.value}`} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#5C6E5E] pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 4: Mood Board Link */}
              <div>
                <label htmlFor="field-moodboard" className="block text-xs font-bold text-[#073B2F] mb-1 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#5C6E5E]" />
                  <span>Mood Board Link (Optional)</span>
                </label>
                <input
                  id="field-moodboard"
                  type="url"
                  enterKeyHint="next"
                  placeholder="https://pinterest.com/... or Google Drive link"
                  value={moodBoardLink}
                  onChange={(e) => setMoodBoardLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-[16px] sm:text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
                />
              </div>

              {/* Field 5: Briefs */}
              <div>
                <label htmlFor="field-shootbrief" className="block text-xs font-bold text-[#073B2F] mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#5C6E5E]" />
                  <span>Brief / Specific Requirements</span>
                </label>
                <textarea
                  id="field-shootbrief"
                  rows={2}
                  placeholder="Number of looks, brand guidelines, lighting requirements, etc."
                  value={shootBrief}
                  onChange={(e) => setShootBrief(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-[16px] sm:text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
                />
              </div>

              {/* Field 6: Shoot Location / Venue */}
              <div>
                <label htmlFor="field-shootlocation" className="block text-xs font-bold text-[#073B2F] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#5C6E5E]" />
                  <span>Shoot Location / Venue</span>
                </label>
                <input
                  id="field-shootlocation"
                  type="text"
                  required
                  enterKeyHint="done"
                  placeholder="e.g. Studio 44, Bandra West, Mumbai"
                  value={shootLocation}
                  onChange={(e) => setShootLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-[16px] sm:text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
                />
              </div>
            </div>

            {/* Fixed Bottom Action Footer */}
            <div className="shrink-0 p-3.5 sm:p-4 border-t border-[#DCE7D4] bg-[#FDFBF7]">
              <button
                type="submit"
                id="btn-confirm-lock-booking"
                disabled={isSubmitting || isCurrentDateBooked}
                className={`w-full py-3.5 px-4 font-bold rounded-xl text-sm transition shadow-xs flex items-center justify-center gap-2 ${
                  isCurrentDateBooked
                    ? 'bg-stone-200 text-stone-500 cursor-not-allowed border border-stone-300'
                    : 'bg-[#FF6A45] hover:bg-[#e55835] text-white active:scale-[0.99]'
                }`}
              >
                {isCurrentDateBooked ? (
                  <span>⚠️ {photographer.name} Booked on {formatDateDayMonth(date)} — Pick Available Date</span>
                ) : (
                  <span>Confirm & Lock Booking for {formatDateDayMonth(date)}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
