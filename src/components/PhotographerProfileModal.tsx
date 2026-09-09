import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Camera, Check, KeyRound, Copy, CheckCheck, Sparkles } from 'lucide-react';
import { PhotographerProfile, ShootType } from '../types';

interface PhotographerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographerToEdit: PhotographerProfile | null;
  onSaveProfile: (profile: PhotographerProfile, isNew: boolean) => void;
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
  'Other / Custom Requirement',
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
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
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
    const text = `📸 Shoot Social BAE — Photographer Portal Access\nHi ${createdCredentials.name}!\nHere are your login credentials to manage your calendar and bookings:\n\n🔗 Website: ${window.location.origin}\n📧 Login: ${createdCredentials.email}\n🔑 Password: ${createdCredentials.pass}\n\nLogin to view your client bookings and set your available dates!`;
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

    const cleanEmail = email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@shootsocialbae.com`;
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
      experienceYears: parseInt(experienceYears, 10) || 5,
      bio: bio.trim() || 'Specializing in cinematic storytelling and celebrations.',
      specialties: specialties.length > 0 ? (specialties as ShootType[]) : ['Commercial Shoot'],
      avatarColor: photographerToEdit?.avatarColor || avatarColor,
      avatarUrl: photographerToEdit?.avatarUrl,
      portfolioSamples: photographerToEdit?.portfolioSamples,
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-photographer-profile-content"
        className="bg-[#0b1733] border border-[#1d3870] rounded-3xl max-w-lg w-full p-6 text-stone-100 shadow-2xl space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#182f5e] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d4f770]/20 text-[#d4f770] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isEditing ? `Edit ${photographerToEdit?.name}'s Profile` : 'Onboard Partner Photographer'}
              </h3>
              <p className="text-xs text-stone-400">
                Shoot Social BAE • Photographer Partner Network
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {createdCredentials ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-stone-100 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Check className="w-5 h-5" />
                <span>Photographer Profile & Account Created!</span>
              </div>
              <p className="text-xs text-stone-300">
                The profile for <strong className="text-white">{createdCredentials.name}</strong> is live. Share these credentials with the photographer so they can log in to manage their calendar and bookings:
              </p>

              <div className="bg-[#060e22] border border-[#1d3870] rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-300">
                  <span className="text-stone-500">Portal:</span>
                  <span className="text-white select-all">{window.location.origin}</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span className="text-stone-500">Login Email:</span>
                  <span className="text-[#d4f770] font-bold select-all">{createdCredentials.email}</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span className="text-stone-500">Password:</span>
                  <span className="text-white font-bold select-all">{createdCredentials.pass}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-3 px-4 rounded-xl bg-[#d4f770] hover:bg-[#c6f052] text-[#0a152e] font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
              >
                {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Credentials Copied to Clipboard!' : 'Copy Login Credentials for WhatsApp'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-[#112349] hover:bg-[#162f63] text-stone-200 text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Photographer Full Name */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Photographer Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                id="input-photog-name"
                type="text"
                required
                placeholder="e.g. Vikramaditya Rathore"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
              />
            </div>
          </div>

          {/* City / Hub with Manual Putting Option */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-stone-300">
                Primary City / Base Hub
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCity(!isCustomCity)}
                className="text-[11px] text-[#d4f770] hover:underline font-semibold"
              >
                {isCustomCity ? '← Choose from List' : 'Enter Manually'}
              </button>
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              {isCustomCity ? (
                <input
                  type="text"
                  placeholder="Type city manually (e.g. Udaipur, Shimla, Varanasi)..."
                  value={customCityInput}
                  onChange={(e) => setCustomCityInput(e.target.value)}
                  className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
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
                  className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4f770] cursor-pointer"
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
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Title / Specialty Tagline
            </label>
            <input
              type="text"
              placeholder="e.g. Commercial, F&B & Product Campaign Specialist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
            />
          </div>

          {/* Contact Details (Phone & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                WhatsApp / Phone Number (+91) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98123 45678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="name@studio.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                />
              </div>
            </div>
          </div>

          {/* Experience in Years */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Experience (Years)
            </label>
            <input
              type="number"
              min="1"
              max="40"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4f770]"
            />
          </div>

          {/* Specialties Selection with Manual Putting Option */}
          <div>
            <label className="block text-xs font-semibold text-stone-200 mb-1.5 uppercase font-mono">
              Photography Genres & Commercial Specialties
            </label>

            {/* Manual Putting Option Input */}
            <div className="flex items-center gap-2 mb-2.5">
              <input
                id="input-manual-genre"
                type="text"
                placeholder="Manually add category/specialty (e.g. Lookbook, Beverage, Architecture)..."
                value={customSpecialtyInput}
                onChange={(e) => setCustomSpecialtyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSpecialty();
                  }
                }}
                className="flex-1 bg-[#070a10] border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
              />
              <button
                id="btn-add-manual-genre"
                type="button"
                onClick={handleAddCustomSpecialty}
                className="px-3 py-1.5 bg-[#d4f770] hover:bg-[#c6f052] text-[#080a0f] text-xs font-black uppercase tracking-wider rounded-xl transition shrink-0 shadow-xs font-mono"
              >
                + Add Specialty
              </button>
            </div>

            {/* Tag Badges (Predefined + Any Custom Added) */}
            <div className="flex flex-wrap gap-1.5">
              {Array.from(new Set([...AVAILABLE_SPECIALTIES, ...specialties])).map((spec) => {
                const isSelected = specialties.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#d4f770] text-[#080a0f] border-[#d4f770] font-black shadow-xs'
                        : 'bg-[#070a10] text-stone-400 border-stone-800 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-3" />}
                    <span>{spec}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Photographer Bio & Commercial Style
            </label>
            <textarea
              rows={2}
              placeholder="Tell clients about your photography journey, style, setup, and aesthetic..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#060e22] border border-[#1d3870] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
            />
          </div>

          {/* Photographer Portal Login Credentials Section */}
          <div className="p-3.5 bg-[#060e22] border border-[#1d3870] rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#d4f770]" />
                <span className="text-xs font-bold text-white">Photographer Login Credentials</span>
              </div>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-[#d4f770] hover:underline font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Generate Password</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-400">
              The photographer will use these credentials to log in, view bookings, and manage their calendar.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-stone-300 mb-1">
                  Login Email / Username
                </label>
                <input
                  type="text"
                  placeholder={email || (name ? `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@shootsocialbae.com` : 'photog@studio.in')}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#0b1733] border border-[#1d3870] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-300 mb-1">
                  Login Password
                </label>
                <input
                  type="text"
                  placeholder={name ? `${name.split(' ')[0].toLowerCase()}123` : 'pass123'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#0b1733] border border-[#1d3870] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4f770]"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#182f5e] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#0b1733] hover:bg-[#112349] text-stone-300 transition"
            >
              Cancel
            </button>
            <button
              id="btn-save-photographer-profile"
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#d4f770] hover:bg-[#c6f052] text-[#0a152e] transition flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-4 h-4 stroke-2" />
              <span>{isEditing ? 'Save Changes' : 'Create & Add Photographer'}</span>
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
