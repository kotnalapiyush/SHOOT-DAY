import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  X,
  MapPin,
  Mail,
  Phone,
  User,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Briefcase,
  Globe,
  Award,
  AlertCircle,
  Plus,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { PhotographerProfile, ShootType } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

interface PhotographerSignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographers?: PhotographerProfile[];
  onSignUpSuccess: (photographer: PhotographerProfile) => void;
  onOpenLogin?: (initialEmail?: string, initialPassword?: string) => void;
}

const POPULAR_CITIES = [
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
];

const AVAILABLE_SPECIALTIES: ShootType[] = [
  'Commercial Shoot',
  'Fashion Shoot',
  'Jewellery Shoot',
  'Hotel Shoot',
  'F&B Shoot',
  'Restaurant & Cafe Shoot',
  'One Day Shoot',
  'Product Shoot',
  'Interior Shoot',
];

const AVATAR_COLOR_GRADIENTS = [
  'from-[#073B2F] to-[#145644]',
  'from-amber-600 to-amber-700',
  'from-rose-600 to-pink-700',
  'from-orange-600 to-amber-800',
  'from-emerald-600 to-teal-800',
  'from-cyan-600 to-blue-800',
  'from-purple-600 to-indigo-900',
];

export const PhotographerSignUpModal: React.FC<PhotographerSignUpModalProps> = ({
  isOpen,
  onClose,
  photographers = [],
  onSignUpSuccess,
  onOpenLogin,
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [customCity, setCustomCity] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [title, setTitle] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('+91 ');
  const [bio, setBio] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([
    'Commercial Shoot',
    'One Day Shoot',
  ]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLOR_GRADIENTS[0]);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPhotographer, setSubmittedPhotographer] = useState<PhotographerProfile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResetForm = () => {
    setSubmittedPhotographer(null);
    setName('');
    setCity('Delhi NCR');
    setCustomCity('');
    setIsCustomCity(false);
    setTitle('');
    setExperienceYears('5');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setPhone('+91 ');
    setBio('');
    setSelectedSpecialties(['Commercial Shoot', 'One Day Shoot']);
    setAvatarUrl('');
    setPortfolioUrl('');
    setFormError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      handleResetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      const compressed = await compressImageFile(file, 600, 600, 0.85);
      setAvatarUrl(compressed);
      setFormError(null);
    } catch {
      setFormError('Failed to process image file. Please try another image.');
    }
  };

  const toggleSpecialty = (item: string) => {
    if (selectedSpecialties.includes(item)) {
      if (selectedSpecialties.length > 1) {
        setSelectedSpecialties(selectedSpecialties.filter((s) => s !== item));
      }
    } else {
      setSelectedSpecialties([...selectedSpecialties, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    const cleanName = name.trim();
    if (!cleanName) {
      setFormError('Please enter your full name.');
      return;
    }

    const resolvedCity = isCustomCity ? customCity.trim() : city;
    if (!resolvedCity) {
      setFormError('Please select or specify your primary base city.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    // Check if account already exists
    const existingPhotog = photographers.find((p) => {
      const emailMatch = (p.email || p.loginEmail || '').trim().toLowerCase() === cleanEmail;
      return emailMatch;
    });

    if (existingPhotog) {
      setFormError(
        `An account with email "${cleanEmail}" already exists for ${existingPhotog.name}. Click below to sign into your existing account.`
      );
      return;
    }

    if (!password || password.length < 5) {
      setFormError('Password must be at least 5 characters for partner portal access.');
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      setFormError('Please enter your phone / WhatsApp contact number.');
      return;
    }

    const effectiveSpecialties =
      selectedSpecialties.length > 0 ? selectedSpecialties : ['Commercial Shoot', 'Product Shoot'];

    setIsSubmitting(true);

    const generatedTitle =
      title.trim() ||
      `${effectiveSpecialties[0]} & Visual Production Specialist`;

    const generatedBio =
      bio.trim() ||
      `${cleanName} is a verified ${resolvedCity}-based photographer specializing in ${effectiveSpecialties.join(
        ', '
      )} with ${experienceYears}+ years of production experience.`;

    const newId = `photo-${Date.now()}`;

    // Sample category galleries
    const defaultGalleries: Record<string, string[]> = {
      'Commercial Shoot': [
        'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80',
      ],
    };

    const newPhotographer: PhotographerProfile = {
      id: newId,
      name: cleanName,
      city: resolvedCity,
      title: generatedTitle,
      phone: cleanPhone,
      email: cleanEmail,
      loginEmail: cleanEmail,
      loginPassword: password,
      bio: generatedBio,
      specialties: effectiveSpecialties,
      experienceYears: parseInt(experienceYears, 10) || 5,
      avatarColor,
      avatarUrl:
        avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      categoryGalleries: defaultGalleries,
      portfolioSamples: defaultGalleries['Commercial Shoot'],
      status: 'on_hold', // Newly registered photographers start on hold awaiting Studio Admin review / activation
      holdReason: 'Pending Studio Admin Approval & Verification',
      registeredAt: new Date().toISOString(),
      portfolioUrl: portfolioUrl.trim(),
    };

    onSignUpSuccess(newPhotographer);
    setIsSubmitting(false);
    setSubmittedPhotographer(newPhotographer);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-[#DCE7D4] relative text-[#073B2F] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Strip */}
        <div className="p-5 sm:p-6 border-b border-[#DCE7D4] flex items-center justify-between bg-[#F6F3EC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] flex items-center justify-center shadow-2xs">
              <Camera className="w-5 h-5 text-[#073B2F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#073B2F] font-['Space_Grotesk',sans-serif]">
                  Photographer Sign Up
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#073B2F] text-[#F0FFDA] font-bold font-mono">
                  Partner Network
                </span>
              </div>
              <p className="text-xs text-[#5C6E5E]">
                Create your photographer profile & list your shoot calendar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-[#5C6E5E] hover:text-[#073B2F] flex items-center justify-center transition border border-[#DCE7D4] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedPhotographer ? (
          /* Celebratory Confirmation Screen */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] mx-auto flex items-center justify-center shadow-xs animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-bold text-[#073B2F] font-['Space_Grotesk',sans-serif]">
                Registration Submitted!
              </h3>
              <p className="text-sm font-semibold text-[#073B2F]">
                Welcome, {submittedPhotographer.name}
              </p>
              <p className="text-xs text-[#5C6E5E] max-w-md mx-auto leading-relaxed">
                Your account details have been recorded. Studio Admin will review your profile and activate your account for client bookings.
              </p>
            </div>

            {/* Profile summary card */}
            <div className="bg-[#F6F3EC] border border-[#DCE7D4] rounded-2xl p-4 text-left max-w-md mx-auto space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={submittedPhotographer.avatarUrl}
                  alt={submittedPhotographer.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#DCE7D4]"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#073B2F]">{submittedPhotographer.name}</h4>
                  <p className="text-xs text-[#5C6E5E]">{submittedPhotographer.title} • {submittedPhotographer.city}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#DCE7D4] text-xs text-[#5C6E5E] space-y-1.5">
                <div><span className="font-semibold text-[#073B2F]">Login Email:</span> {submittedPhotographer.loginEmail}</div>
                <div><span className="font-semibold text-[#073B2F]">Phone:</span> {submittedPhotographer.phone}</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#073B2F]">Status:</span>
                  <span className="text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md font-bold text-[11px] inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-700" />
                    Pending Studio Admin Approval
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                id="btn-register-another-photographer"
                onClick={handleResetForm}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#F0FFDA] hover:bg-[#ddf7b7] text-[#073B2F] border border-[#DCE7D4] font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Another</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#073B2F] hover:bg-[#0c4e3f] text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{formError}</span>
                </div>
                {formError.includes('already exists') && onOpenLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      const cleanEmail = email.trim().toLowerCase();
                      handleClose();
                      onOpenLogin(cleanEmail);
                    }}
                    className="w-full py-2 px-3 bg-[#073B2F] hover:bg-[#0c4e3f] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <span>Sign In to This Account Now →</span>
                  </button>
                )}
              </div>
            )}

            {/* Profile Avatar Upload */}
            <div className="flex items-center gap-4 p-3.5 bg-[#F6F3EC] rounded-2xl border border-[#DCE7D4]">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs"
                  />
                ) : (
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColor} text-white flex items-center justify-center font-bold text-lg shadow-xs`}
                  >
                    {name ? name[0].toUpperCase() : <Camera className="w-6 h-6 opacity-70" />}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#073B2F]">Profile Photo</div>
                <p className="text-[11px] text-[#5C6E5E] mt-0.5">
                  Upload your professional headshot or studio portrait.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE7D4] text-[#073B2F] hover:bg-[#F0FFDA] text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-[11px] text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Basic Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#073B2F] mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5C6E5E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Sehgal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
                  />
                </div>
              </div>

              {/* City & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#073B2F] mb-1">
                    Primary Base City <span className="text-rose-600">*</span>
                  </label>
                  {!isCustomCity ? (
                    <div className="space-y-1">
                      <select
                        value={city}
                        onChange={(e) => {
                          if (e.target.value === 'OTHER_CUSTOM') {
                            setIsCustomCity(true);
                          } else {
                            setCity(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white cursor-pointer"
                      >
                        {POPULAR_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="OTHER_CUSTOM">+ Other City (Custom)...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Enter your city name"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCity(false)}
                        className="px-2 py-2 rounded-xl text-[11px] font-bold text-[#5C6E5E] hover:text-[#073B2F] bg-[#F6F3EC]"
                        title="Back to list"
                      >
                        List
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#073B2F] mb-1">
                    Experience (Years) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-[#5C6E5E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      min="1"
                      max="40"
                      required
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Title / Headline */}
              <div>
                <label className="block text-xs font-bold text-[#073B2F] mb-1">
                  Professional Title / Headline
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#5C6E5E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Commercial, Brand & Product Campaign Lead"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
                  />
                </div>
              </div>

              {/* Account Credentials: Email & Password */}
              <div className="p-3.5 bg-[#F6F3EC] rounded-2xl border border-[#DCE7D4] space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#073B2F]" />
                  <span className="text-xs font-bold text-[#073B2F]">
                    Partner Portal Login Credentials
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#073B2F] mb-1">
                      Login Email <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#5C6E5E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCE7D4] rounded-xl text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#073B2F] mb-1">
                      Create Password <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={5}
                        placeholder="Min 5 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-white border border-[#DCE7D4] rounded-xl text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5C6E5E] hover:text-[#073B2F]"
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-[#073B2F] mb-1">
                  Phone / WhatsApp <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#5C6E5E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
                  />
                </div>
              </div>

              {/* Bio / Artist Statement */}
              <div>
                <label className="block text-xs font-bold text-[#073B2F] mb-1">
                  Bio / Artist Statement
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a short bio about your production experience, equipment, creative approach, and brands you've worked with..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white leading-relaxed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#FF6A45] hover:bg-[#e55835] text-white font-bold rounded-xl text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Complete Registration & Create Profile</span>
              </button>
            </div>

            {/* Already have an account */}
            {onOpenLogin && (
              <div className="text-center pt-2">
                <span className="text-xs text-[#5C6E5E]">Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="text-xs font-bold text-[#073B2F] hover:text-[#FF6A45] underline cursor-pointer"
                >
                  Sign In Here
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
