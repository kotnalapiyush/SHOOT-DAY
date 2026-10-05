import React, { useState } from 'react';
import {
  Lock,
  User,
  Shield,
  Camera,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound,
  X,
} from 'lucide-react';
import { AuthSession, PhotographerProfile } from '../types';
import { verifyAdminLogin, verifyPhotographerLogin, DEFAULT_ADMIN_CREDENTIALS } from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographers: PhotographerProfile[];
  onLoginSuccess: (session: AuthSession) => void;
  onOpenPhotographerSignUp?: () => void;
  initialIdentifier?: string;
  initialPassword?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  photographers,
  onLoginSuccess,
  onOpenPhotographerSignUp,
  initialIdentifier,
  initialPassword,
}) => {
  const [roleTab, setRoleTab] = useState<'photographer' | 'admin'>('photographer');

  // Photographer form state
  const defaultFirstEmail =
    photographers?.find((p) => p?.email || p?.loginEmail)?.email ||
    photographers?.find((p) => p?.email || p?.loginEmail)?.loginEmail ||
    'rohan.sharma@lensdelhi.in';

  const [photographerIdInput, setPhotographerIdInput] = useState(
    initialIdentifier || defaultFirstEmail
  );
  const [photographerPassword, setPhotographerPassword] = useState(
    initialPassword || 'rohan123'
  );

  // Sync initial identifier if provided when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (initialIdentifier) {
        setPhotographerIdInput(initialIdentifier);
        setRoleTab('photographer');
      } else if (!photographerIdInput) {
        const found = photographers?.find((p) => p?.email || p?.loginEmail);
        if (found) {
          setPhotographerIdInput(found.email || found.loginEmail || 'rohan.sharma@lensdelhi.in');
        }
      }
      if (initialPassword) {
        setPhotographerPassword(initialPassword);
      }
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialIdentifier, initialPassword, photographers]);

  // Admin form state
  const [adminEmail, setAdminEmail] = useState(DEFAULT_ADMIN_CREDENTIALS.email);
  const [adminPassword, setAdminPassword] = useState(DEFAULT_ADMIN_CREDENTIALS.password);

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotographerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = verifyPhotographerLogin(
      photographerIdInput || '',
      photographerPassword || '',
      photographers || []
    );
    if (result.success && result.session) {
      setSuccessMsg(`Welcome, ${result.session.name}!`);
      setTimeout(() => {
        onLoginSuccess(result.session!);
        onClose();
      }, 500);
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = verifyAdminLogin(adminEmail, adminPassword);
    if (result.success && result.session) {
      setSuccessMsg('Admin Access Granted!');
      setTimeout(() => {
        onLoginSuccess(result.session!);
        onClose();
      }, 500);
    } else {
      setError(result.error || 'Admin login failed.');
    }
  };

  const handleSelectQuickPhotographer = (p: PhotographerProfile) => {
    if (!p) return;
    const defaultEmail = p.email || p.loginEmail || p.name || '';
    const cleanFirst = (p.name || 'photog').trim().split(' ')[0].toLowerCase();
    setPhotographerIdInput(defaultEmail);
    setPhotographerPassword(p.loginPassword || `${cleanFirst}123`);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-[#DCE7D4] rounded-3xl shadow-2xl overflow-hidden text-[#073B2F] transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-[#DCE7D4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FFDA] border border-[#DCE7D4] flex items-center justify-center text-[#073B2F]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#073B2F] flex items-center gap-2 font-['Space_Grotesk',sans-serif]">
                <span>Secure Portal Login</span>
              </h3>
              <p className="text-xs text-[#5C6E5E]">
                Sign in to manage your schedule & shoots
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F6F3EC] hover:bg-stone-200 text-[#5C6E5E] hover:text-[#073B2F] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection: Photographer vs Admin */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F6F3EC] rounded-2xl border border-[#DCE7D4]">
            <button
              type="button"
              onClick={() => {
                setRoleTab('photographer');
                setError(null);
              }}
              className={`py-2.5 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${
                roleTab === 'photographer'
                  ? 'bg-[#073B2F] text-white shadow-xs'
                  : 'text-[#5C6E5E] hover:text-[#073B2F]'
              }`}
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span>Shoot Partner</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab('admin');
                setError(null);
              }}
              className={`py-2.5 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${
                roleTab === 'admin'
                  ? 'bg-[#073B2F] text-white shadow-xs'
                  : 'text-[#5C6E5E] hover:text-[#073B2F]'
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>Studio Admin</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="px-6">
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 pt-3">
          {roleTab === 'photographer' ? (
            <form onSubmit={handlePhotographerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#073B2F] mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#073B2F]" />
                  <span>Shoot Partner Email / Username:</span>
                </label>
                <input
                  type="text"
                  required
                  value={photographerIdInput}
                  onChange={(e) => setPhotographerIdInput(e.target.value)}
                  placeholder="e.g. rohan.sharma@lensdelhi.in"
                  className="w-full bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl px-3.5 py-2.5 text-xs text-[#073B2F] placeholder:text-[#5C6E5E]/60 focus:outline-none focus:border-[#073B2F] focus:ring-1 focus:ring-[#073B2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#073B2F] mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#073B2F]" />
                  <span>Password:</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={photographerPassword}
                    onChange={(e) => setPhotographerPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#073B2F] placeholder:text-[#5C6E5E]/60 focus:outline-none focus:border-[#073B2F] focus:ring-1 focus:ring-[#073B2F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C6E5E] hover:text-[#073B2F]"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Select demo profiles */}
              <div className="pt-1">
                <p className="text-[10px] text-[#5C6E5E] uppercase tracking-wider font-semibold mb-2">
                  1-Click Select Shoot Partner:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {(photographers || []).filter(Boolean).map((p) => {
                    const pEmail = (p.email || p.loginEmail || '').trim().toLowerCase();
                    const pName = (p.name || '').trim().toLowerCase();
                    const currentInput = (photographerIdInput || '').trim().toLowerCase();
                    const isSelected = Boolean(
                      currentInput && (currentInput === pEmail || (pName && currentInput === pName))
                    );
                    return (
                      <button
                        key={p.id || p.email || Math.random().toString()}
                        type="button"
                        onClick={() => handleSelectQuickPhotographer(p)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#F0FFDA] border-[#073B2F] text-[#073B2F] font-bold'
                            : 'bg-[#F6F3EC] border-[#DCE7D4] text-[#5C6E5E] hover:border-[#073B2F]'
                        }`}
                      >
                        {p.name || 'Photographer'} ({p.city || 'India'})
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-[#FF6A45] hover:bg-[#e55835] text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Sign In as Shoot Partner</span>
              </button>

              {/* Link to Self-Registration */}
              {onOpenPhotographerSignUp && (
                <div className="pt-2 text-center border-t border-[#DCE7D4]">
                  <p className="text-[11px] text-[#5C6E5E]">
                    Not on the platform yet?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPhotographerSignUp();
                    }}
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#073B2F] hover:text-[#FF6A45] transition cursor-pointer"
                  >
                    <span>Sign Up & Create Your Profile Here →</span>
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#073B2F] mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#073B2F]" />
                  <span>Admin Email:</span>
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="kotnalapiyush@gmail.com"
                  className="w-full bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl px-3.5 py-2.5 text-xs text-[#073B2F] placeholder:text-[#5C6E5E]/60 focus:outline-none focus:border-[#073B2F] focus:ring-1 focus:ring-[#073B2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#073B2F] mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#073B2F]" />
                  <span>Admin Password:</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#073B2F] placeholder:text-[#5C6E5E]/60 focus:outline-none focus:border-[#073B2F] focus:ring-1 focus:ring-[#073B2F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C6E5E] hover:text-[#073B2F]"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F6F3EC] border border-[#DCE7D4] text-[11px] text-[#073B2F]">
                <div className="flex items-center gap-1.5 text-[#073B2F] font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6A45]" />
                  <span>Admin Privileges:</span>
                </div>
                <p className="text-[#5C6E5E] leading-relaxed">
                  As Studio Admin, you can add new photographers, set up their login credentials, view all calendars, and oversee all shoot bookings.
                </p>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-[#FF6A45] hover:bg-[#e55835] text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Shield className="w-4 h-4" />
                <span>Sign In as Studio Admin</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#DCE7D4] text-center">
          <p className="text-[11px] text-[#5C6E5E]">
            Public visitors see only the Client Booking Portal without requiring any login.
          </p>
        </div>
      </div>
    </div>
  );
};
