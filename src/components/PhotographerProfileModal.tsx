import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  Check,
  KeyRound,
  Copy,
  CheckCheck,
  Sparkles,
  Trash2,
  ChevronDown,
  X,
  Pause,
  AlertTriangle,
  Eye,
  EyeOff,
  Upload,
} from 'lucide-react';
import { PhotographerProfile, ShootType } from '../types';

interface PhotographerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographerToEdit: PhotographerProfile | null;
  onSaveProfile: (profile: PhotographerProfile, isNew: boolean) => void;
  onDeleteProfile?: (photographerId: string) => void;
}

const INDIAN_CITIES = [
  'Delhi NCR',
  'Mumbai',
  'Jaipur & Udaipur',
  'Bengaluru',
  'Goa',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Chandigarh',
  'Ahmedabad',
  'Dehradun & Rishikesh',
  'Lucknow',
];

const AVAILABLE_SPECIALTIES: ShootType[] = [
  'Commercial Shoot',
  'One Day Shoot',
  'F&B Shoot',
  'Restaurant & Cafe Shoot',
  'Interior Shoot',
  'Hotel Shoot',
  'Fashion Shoot',
  'Jewellery Shoot',
  'Product Shoot',
  'Other / Custom',
];

const AVATAR_COLORS = [
  'from-blue-600 to-indigo-800',
  'from-emerald-600 to-teal-800',
  'from-cyan-600 to-blue-800',
  'from-amber-600 to-amber-700',
  'from-rose-600 to-pink-700',
  'from-purple-600 to-indigo-900',
];

export const PhotographerProfileModal: React.FC<PhotographerProfileModalProps> = ({
  isOpen,
  onClose,
  photographerToEdit,
  onSaveProfile,
  onDeleteProfile,
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState(INDIAN_CITIES[0]);
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experienceYears, setExperienceYears] = useState('6');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [portfolioSamples, setPortfolioSamples] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [status, setStatus] = useState<'active' | 'on_hold'>('active');
  const [holdReason, setHoldReason] = useState('');
  const [isSpecialtiesDropdownOpen, setIsSpecialtiesDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    pass: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCreatedCredentials(null);
    setCopied(false);
    if (photographerToEdit) {
      setName(photographerToEdit.name);
      if (INDIAN_CITIES.includes(photographerToEdit.city)) {
        setCity(photographerToEdit.city);
        setIsCustomCity(false);
      } else {
        setCity('Other');
        setIsCustomCity(true);
        setCustomCityInput(photographerToEdit.city);
      }
      setTitle(photographerToEdit.title);
      setPhone(photographerToEdit.phone);
      setEmail(photographerToEdit.email);
      setLoginEmail(photographerToEdit.loginEmail || photographerToEdit.email);
      setLoginPassword(photographerToEdit.loginPassword || `${photographerToEdit.name.split(' ')[0].toLowerCase()}123`);
      setExperienceYears(String(photographerToEdit.experienceYears));
      setBio(photographerToEdit.bio);
      setSpecialties(photographerToEdit.specialties);
      setAvatarColor(photographerToEdit.avatarColor);
      setAvatarUrl(photographerToEdit.avatarUrl || '');
      setPortfolioSamples(photographerToEdit.portfolioSamples || []);
      setStatus(photographerToEdit.status || 'active');
      setHoldReason(photographerToEdit.holdReason || '');
    } else {
      setName('');
      setCity(INDIAN_CITIES[0]);
      setIsCustomCity(false);
      setCustomCityInput('');
      setTitle('Commercial & Brand Campaign Specialist');
      setPhone('+91 ');
      setEmail('');
      setLoginEmail('');
      setLoginPassword('');
      setExperienceYears('5');
      setBio('Specializing in high-impact commercial campaigns, product shoots, F&B, and brand lookbooks.');
      setSpecialties(['Commercial Shoot', 'Product Shoot']);
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
      setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
      setPortfolioSamples([]);
      setStatus('active');
      setHoldReason('');
    }
  }, [photographerToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleSpecialty = (spec: string) => {
    if (specialties.includes(spec)) {
      setSpecialties(specialties.filter((s) => s !== spec));
    } else {
      setSpecialties([...specialties, spec]);
    }
  };

  const handleAddCustomSpecialty = () => {
    const trimmed = customSpecialtyInput.trim();
    if (!trimmed) return;
    if (!specialties.includes(trimmed)) {
      setSpecialties([...specialties, trimmed]);
    }
    setCustomSpecialtyInput('');
  };

  const handleGeneratePassword = () => {
    const cleanFirst = name.trim().split(' ')[0]?.toLowerCase() || 'photog';
    const randNum = Math.floor(100 + Math.random() * 900);
    setLoginPassword(`${cleanFirst}@${randNum}`);
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `📸 Shoot Lobby — Photographer Portal Access\nHi ${createdCredentials.name}!\nHere are your login credentials to manage your calendar and bookings:\n\n🔗 Website: ${window.location.origin}\n📧 Login: ${createdCredentials.email}\n🔑 Password: ${createdCredentials.pass}\n\nLogin to view your client bookings and set your available dates!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCity = isCustomCity ? (customCityInput.trim() || 'Custom City') : city;
    const isNew = !photographerToEdit;
    const newId = photographerToEdit
      ? photographerToEdit.id
      : `photog-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const cleanEmail = email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@shootlobby.in`;
    const finalLoginEmail = loginEmail.trim() || cleanEmail;
    const finalLoginPass = loginPassword.trim() || `${name.trim().split(' ')[0].toLowerCase()}123`;

    const profileData: PhotographerProfile = {
      id: newId,
      name: name.trim(),
      city: finalCity,
      title: title.trim() || 'Professional Photographer',
      phone: phone.trim(),
      email: cleanEmail,
      loginEmail: finalLoginEmail,
      loginPassword: finalLoginPass,
      status,
      holdReason: holdReason.trim(),
      experienceYears: parseInt(experienceYears, 10) || 5,
      bio: bio.trim() || 'Specializing in cinematic storytelling and commercial shoots.',
      specialties: specialties.length > 0 ? (specialties as ShootType[]) : ['Commercial Shoot'],
      avatarColor: photographerToEdit?.avatarColor || avatarColor,
      avatarUrl: avatarUrl.trim() || photographerToEdit?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      portfolioSamples: portfolioSamples.length > 0 ? portfolioSamples : (photographerToEdit?.portfolioSamples || []),
    };

    onSaveProfile(profileData, isNew);

    if (isNew) {
      setCreatedCredentials({
        name: profileData.name,
        email: finalLoginEmail,
        pass: finalLoginPass,
      });
    } else {
      onClose();
    }
  };

  const isEditing = Boolean(photographerToEdit);

  return (
    <div
      id="modal-photographer-profile-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-photographer-profile-content"
        className="bg-white border border-[#DCE7D4] rounded-3xl max-w-lg w-full p-6 text-[#073B2F] shadow-2xl space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#DCE7D4] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#073B2F] tracking-tight font-['Space_Grotesk',sans-serif]">
                {isEditing ? `Edit ${photographerToEdit?.name}'s Profile` : 'Onboard Partner Photographer'}
              </h3>
              <p className="text-xs text-[#5C6E5E]">
                Shoot Lobby • Photographer Partner Network
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#5C6E5E] hover:text-[#073B2F] p-1 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {createdCredentials ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-[#F0FFDA] border border-[#DCE7D4] text-[#073B2F] space-y-3">
              <div className="flex items-center gap-2 text-[#073B2F] font-bold text-sm">
                <Check className="w-5 h-5 text-emerald-700" />
                <span>Photographer Profile & Account Created!</span>
              </div>
              <p className="text-xs text-[#5C6E5E]">
                The profile for <strong className="text-[#073B2F]">{createdCredentials.name}</strong> is live. Share these credentials with the photographer so they can log in to manage their calendar and bookings:
              </p>

              <div className="bg-white border border-[#DCE7D4] rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#5C6E5E]">
                  <span>Portal:</span>
                  <span className="text-[#073B2F] select-all font-mono">{window.location.origin}</span>
                </div>
                <div className="flex items-center justify-between text-[#5C6E5E]">
                  <span>Login Email:</span>
                  <span className="text-[#073B2F] font-bold select-all font-mono">{createdCredentials.email}</span>
                </div>
                <div className="flex items-center justify-between text-[#5C6E5E]">
                  <span>Password:</span>
                  <span className="text-[#073B2F] font-bold select-all font-mono">{createdCredentials.pass}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-3 px-4 rounded-xl bg-[#073B2F] hover:bg-[#0c4e3f] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
              >
                {copied ? <CheckCheck className="w-4 h-4 text-[#F0FFDA]" /> : <Copy className="w-4 h-4 text-[#F0FFDA]" />}
                <span>{copied ? 'Credentials Copied to Clipboard!' : 'Copy Login Credentials for WhatsApp'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-[#F6F3EC] hover:bg-[#ece8df] text-[#073B2F] border border-[#DCE7D4] text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Photographer Full Name */}
          <div>
            <label className="block text-xs font-medium text-[#073B2F] mb-1">
              Photographer Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5C6E5E] absolute left-3 top-2.5" />
              <input
                id="input-photog-name"
                type="text"
                required
                placeholder="e.g. Vikramaditya Rathore"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F6F3EC] border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl pl-9 pr-3 py-2 text-xs text-[#073B2F] placeholder-[#5C6E5E]/60 focus:outline-none focus:ring-1 focus:ring-[#073B2F]"
              />
            </div>
          </div>

          {/* Profile Picture Section */}
          <div className="p-3 bg-[#F6F3EC] rounded-2xl border border-[#DCE7D4]">
            <div>
              <label className="block text-[11px] font-bold text-[#073B2F] mb-1 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-[#073B2F]" />
                <span>Profile Photo URL</span>
              </label>
              <div className="flex items-center gap-2">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-xl object-cover border border-[#DCE7D4] bg-white shrink-0"
                />
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1 bg-white border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl px-2.5 py-1.5 text-xs text-[#073B2F] focus:outline-none focus:ring-1 focus:ring-[#073B2F]"
                />
              </div>
            </div>
          </div>

          {/* City / Hub with Manual Putting Option */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#073B2F]">
                Primary City / Base Hub
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCity(!isCustomCity)}
                className="text-[11px] text-[#073B2F] hover:underline font-semibold"
              >
                {isCustomCity ? '← Choose from List' : 'Enter Manually'}
              </button>
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#5C6E5E] absolute left-3 top-2.5" />
              {isCustomCity ? (
                <input
                  type="text"
                  placeholder="Type city manually (e.g. Udaipur, Shimla, Varanasi)..."
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  className="w-full bg-[#F6F3EC] border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl pl-9 pr-3 py-2 text-xs text-[#073B2F] placeholder-[#5C6E5E]/60 focus:outline-none focus:ring-1 focus:ring-[#073B2F]"
                />
              ) : (
                <select
                  value={city}
                  onChange={(e) => {
                    if (e.target.value === 'OTHER_CUSTOM') {
                      setIsCustomCity(true);
                    } else {
                      setCity(e.target.value);
                    }
                  }}
                  className="w-full bg-[#F6F3EC] border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl pl-9 pr-3 py-2 text-xs text-[#073B2F] focus:outline-none focus:ring-1 focus:ring-[#073B2F] cursor-pointer"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="OTHER_CUSTOM">+ Other (Type Manually)</option>
                </select>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[#073B2F] mb-1">
              Title / Specialty Tagline
            </label>
            <input
              type="text"
              placeholder="e.g. Commercial, F&B & Product Campaign Specialist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F6F3EC] border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl px-3 py-2 text-xs text-[#073B2F] placeholder-[#5C6E5E]/60 focus:outline-none focus:ring-1 focus:ring-[#073B2F]"
            />
          </div>

          {/* Contact Details (Phone & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#073B2F] mb-1">
                WhatsApp / Phone Number (+91) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#5C6E5E] absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98123 45678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F6F3EC] border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl pl-9 pr-3 py-2 text-xs text-[#073B2F] placeholder-[#5C6E5E]/60 focus:outline-none focus:ring-1 focus:ring-[#073B2F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#073B2F] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5C6E5E] absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="name@studio.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F6F3EC] border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl pl-9 pr-3 py-2 text-xs text-[#073B2F] placeholder-[#5C6E5E]/60 focus:outline-none focus:ring-1 focus:ring-[#073B2F]"
                />
              </div>
            </div>
          </div>

          {/* Experience in Years */}
          <div>
            <label className="block text-xs font-medium text-[#073B2F] mb-1">
              Experience (Years)
            </label>
            <input
              type="number"
              min="1"
              max="40"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full bg-[#F6F3EC] border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl px-3 py-2 text-xs text-[#073B2F] focus:outline-none focus:ring-1 focus:ring-[#073B2F]"
            />
          </div>

          {/* Status Selection: Active vs On Hold per User Request */}
          <div>
            <label className="block text-xs font-semibold text-[#073B2F] mb-1.5 uppercase tracking-wide">
              Photographer Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Active Option */}
              <button
                type="button"
                id="btn-status-active"
                onClick={() => setStatus('active')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
                  status === 'active'
                    ? 'bg-[#F0FFDA] border-[#073B2F] text-[#073B2F] shadow-xs ring-1 ring-[#073B2F]'
                    : 'bg-white border-[#DCE7D4] text-[#5C6E5E] hover:border-[#073B2F]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center border shrink-0 ${
                    status === 'active' ? 'border-[#073B2F] bg-[#073B2F]' : 'border-stone-400 bg-white'
                  }`}
                >
                  {status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#073B2F] flex items-center gap-1.5">
                    <span>Active Status</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#073B2F]" />
                  </div>
                  <p className="text-[11px] text-[#5C6E5E] mt-0.5 leading-snug">
                    Working on Shoot Lobby. Visible to clients and accepting bookings.
                  </p>
                </div>
              </button>

              {/* On Hold Option */}
              <button
                type="button"
                id="btn-status-onhold"
                onClick={() => setStatus('on_hold')}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
                  status === 'on_hold'
                    ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-500'
                    : 'bg-white border-[#DCE7D4] text-[#5C6E5E] hover:border-amber-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center border shrink-0 ${
                    status === 'on_hold' ? 'border-amber-600 bg-amber-600' : 'border-stone-400 bg-white'
                  }`}
                >
                  {status === 'on_hold' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <span>On Hold (On Leave)</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  </div>
                  <p className="text-[11px] text-amber-800/80 mt-0.5 leading-snug">
                    If photographer is going on leave or temporarily paused.
                  </p>
                </div>
              </button>
            </div>

            {status === 'on_hold' && (
              <div className="mt-2 animate-in fade-in duration-150">
                <input
                  type="text"
                  placeholder="Reason for leave / pause (e.g. On vacation till 28th, away on personal leave)..."
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full bg-white border border-amber-300 focus:border-amber-600 rounded-xl px-3 py-2 text-xs text-amber-950 placeholder-amber-700/60 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Specialties Selection: Multi-select Dropdown + Manual Putting Option */}
          <div>
            <label className="block text-xs font-semibold text-[#073B2F] mb-1.5 uppercase tracking-wide">
              Photography Genres & Commercial Specialties
            </label>

            {/* Dropdown button for multi-select */}
            <div className="relative mb-2">
              <button
                type="button"
                id="btn-toggle-specialties-dropdown"
                onClick={() => setIsSpecialtiesDropdownOpen(!isSpecialtiesDropdownOpen)}
                className="w-full bg-[#F6F3EC] border border-[#DCE7D4] hover:border-[#073B2F] rounded-xl px-3 py-2.5 text-xs text-[#073B2F] font-medium flex items-center justify-between transition"
              >
                <span>
                  {specialties.length > 0
                    ? `Selected Genres (${specialties.length} chosen)`
                    : 'Select photography genres...'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#5C6E5E] transition-transform ${
                    isSpecialtiesDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu with Multi-select Checkboxes */}
              {isSpecialtiesDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#DCE7D4] rounded-2xl shadow-xl p-3 z-30 max-h-56 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-bold text-[#5C6E5E] uppercase tracking-wider px-1 pb-1 border-b border-[#DCE7D4]">
                    Select multiple specialties:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                    {Array.from(new Set([...AVAILABLE_SPECIALTIES, ...specialties])).map((spec) => {
                      const isSelected = specialties.includes(spec);
                      return (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => toggleSpecialty(spec)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition w-full ${
                            isSelected
                              ? 'bg-[#F0FFDA] text-[#073B2F] font-bold'
                              : 'text-[#5C6E5E] hover:bg-[#F6F3EC]'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#073B2F] border-[#073B2F] text-white'
                                : 'border-[#DCE7D4] bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-3" />}
                          </div>
                          <span className="truncate">{spec}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Manual Putting Option Input */}
            <div className="flex items-center gap-2 mb-2">
              <input
                id="input-manual-genre"
                type="text"
                placeholder="Manually add category/specialty (e.g. Lookbook, Drone, Beverage)..."
                value={customSpecialtyInput}
                onChange={(e) => setCustomSpecialtyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSpecialty();
                  }
                }}
                className="flex-1 bg-[#F6F3EC] border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl px-3 py-2 text-xs text-[#073B2F] placeholder-[#5C6E5E]/60 focus:outline-none focus:ring-1 focus:ring-[#073B2F]"
              />
              <button
                id="btn-add-manual-genre"
                type="button"
                onClick={handleAddCustomSpecialty}
                className="px-3.5 py-2 bg-[#073B2F] hover:bg-[#0c4e3f] text-white text-xs font-bold rounded-xl transition shrink-0 shadow-xs"
              >
                + Add
              </button>
            </div>

            {/* Selected Specialties Badges (Removable) */}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {specialties.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs bg-[#073B2F] text-white font-semibold shadow-xs"
                  >
                    <span>{spec}</span>
                    <button
                      type="button"
                      onClick={() => toggleSpecialty(spec)}
                      className="text-[#F0FFDA] hover:text-white p-0.5 rounded-full hover:bg-white/20 transition"
                      aria-label={`Remove ${spec}`}
                    >
                      <X className="w-3 h-3 stroke-2" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Photographer Bio & Commercial Style - Generous height so text is never cut off */}
          <div>
            <label className="block text-xs font-medium text-[#073B2F] mb-1">
              Photographer Bio & Commercial Style
            </label>
            <textarea
              rows={4}
              placeholder="Tell clients about your photography journey, style, setup, aesthetic, equipment, and portfolio experience..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full min-h-[96px] bg-[#F6F3EC] border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl p-3 text-xs leading-relaxed text-[#073B2F] placeholder-[#5C6E5E]/60 focus:outline-none focus:ring-1 focus:ring-[#073B2F]"
            />
          </div>

          {/* Photographer Portal Login Credentials Section */}
          <div className="p-3.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#073B2F]" />
                <span className="text-xs font-bold text-[#073B2F]">Photographer Login Credentials</span>
              </div>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-[#073B2F] hover:underline font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Generate Password</span>
              </button>
            </div>
            <p className="text-[11px] text-[#5C6E5E]">
              The photographer will use these credentials to log in, view bookings, and manage their calendar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-[#073B2F] mb-1">
                  Login Email / Username
                </label>
                <input
                  type="text"
                  placeholder={email || (name ? `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@shootlobby.in` : 'photog@studio.in')}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-white border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl px-3 py-2 text-xs text-[#073B2F] placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#073B2F]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-[#073B2F]">
                    Login Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-[#5C6E5E] hover:text-[#073B2F] flex items-center gap-0.5"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={name ? `${name.split(' ')[0].toLowerCase()}123` : 'pass123'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-white border border-[#DCE7D4] focus:border-[#073B2F] rounded-xl px-3 py-2 text-xs font-mono font-medium text-[#073B2F] placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#073B2F]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delete Profile Confirmation Prompt */}
          {showDeleteConfirm && isEditing && onDeleteProfile && photographerToEdit && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold">Delete {photographerToEdit.name}'s Profile?</span>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    This will permanently remove this photographer, their calendar, and all associated booking entries. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-[#5C6E5E] border border-rose-200 hover:bg-rose-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-delete-photographer"
                  onClick={() => {
                    onDeleteProfile(photographerToEdit.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#DCE7D4] flex items-center justify-between gap-2">
            <div>
              {isEditing && onDeleteProfile && !showDeleteConfirm && (
                <button
                  type="button"
                  id="btn-delete-photographer-profile"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Profile</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F6F3EC] hover:bg-[#ece8df] border border-[#DCE7D4] text-[#073B2F] transition"
              >
                Cancel
              </button>
              <button
                id="btn-save-photographer-profile"
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#073B2F] hover:bg-[#0c4e3f] text-white transition flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <Check className="w-4 h-4 stroke-2" />
                <span>{isEditing ? 'Save Changes' : 'Create & Add Photographer'}</span>
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
