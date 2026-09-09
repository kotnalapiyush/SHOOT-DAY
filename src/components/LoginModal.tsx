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
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  photographers,
  onLoginSuccess,
}) => {
  const [roleTab, setRoleTab] = useState<'photographer' | 'admin'>('photographer');

  // Photographer form state
  const [photographerIdInput, setPhotographerIdInput] = useState(photographers[0]?.email || 'rohan.sharma@lensdelhi.in');
  const [photographerPassword, setPhotographerPassword] = useState('rohan123');

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
    const result = verifyPhotographerLogin(photographerIdInput, photographerPassword, photographers);
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
    setPhotographerIdInput(p.email || p.loginEmail || p.name);
    setPhotographerPassword(p.loginPassword || `${p.name.split(' ')[0].toLowerCase()}123`);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a152e] border border-[#1e3b78] rounded-3xl shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="p-6 border-b border-[#182f5e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0e214d] border border-[#d4f770]/40 flex items-center justify-center text-[#d4f770]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Secure Portal Login</span>
              </h3>
              <p className="text-xs text-stone-400">
                Sign in to manage your schedule & shoots
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#060e22] hover:bg-[#142957] text-stone-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection: Photographer vs Admin */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#060c1d] rounded-2xl border border-[#1b3160]">
            <button
              type="button"
              onClick={() => {
                setRoleTab('photographer');
                setError(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                roleTab === 'photographer'
                  ? 'bg-[#d4f770] text-[#0a152e] shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photographer Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab('admin');
                setError(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                roleTab === 'admin'
                  ? 'bg-[#d4f770] text-[#0a152e] shadow-md'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Studio Admin</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        <div className="px-6">
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 pt-3">
          {roleTab === 'photographer' ? (
            <form onSubmit={handlePhotographerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#d4f770]" />
                  <span>Photographer Email / Username:</span>
                </label>
                <input
                  type="text"
                  required
                  value={photographerIdInput}
                  onChange={(e) => setPhotographerIdInput(e.target.value)}
                  placeholder="e.g. rohan.sharma@lensdelhi.in"
                  className="w-full bg-[#060c1d] border border-[#1b3160] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#d4f770]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#d4f770]" />
                  <span>Password:</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={photographerPassword}
                    onChange={(e) => setPhotographerPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#060c1d] border border-[#1b3160] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#d4f770]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Select demo profiles */}
              <div className="pt-1">
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mb-2">
                  1-Click Select Photographer Profile:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {photographers.map((p) => {
                    const isSelected = photographerIdInput.toLowerCase() === p.email.toLowerCase();
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectQuickPhotographer(p)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          isSelected
                            ? 'bg-[#d4f770]/20 border-[#d4f770] text-[#d4f770] font-bold'
                            : 'bg-[#060c1d] border-[#1b3160] text-stone-300 hover:border-stone-400'
                        }`}
                      >
                        {p.name} ({p.city})
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-[#d4f770] hover:bg-[#c4f042] text-[#0a152e] font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Sign In as Photographer</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#d4f770]" />
                  <span>Admin Email:</span>
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="kotnalapiyush@gmail.com"
                  className="w-full bg-[#060c1d] border border-[#1b3160] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#d4f770]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#d4f770]" />
                  <span>Admin Password:</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full bg-[#060c1d] border border-[#1b3160] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#d4f770]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#060c1d] border border-[#1b3160] text-[11px] text-stone-300">
                <div className="flex items-center gap-1.5 text-[#d4f770] font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Admin Privileges:</span>
                </div>
                <p className="text-stone-400 leading-relaxed">
                  As Studio Admin, you can add new photographers, set up their login credentials, view all calendars, and oversee all shoot bookings.
                </p>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-[#d4f770] hover:bg-[#c4f042] text-[#0a152e] font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Sign In as Studio Admin</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#060c1d] border-t border-[#182f5e] text-center">
          <p className="text-[11px] text-stone-400">
            Public visitors see only the Client Booking Portal without requiring any login.
          </p>
        </div>
      </div>
    </div>
  );
};
