import React, { useState } from 'react';
import {
  X,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  Globe,
  Briefcase,
  Pause,
  Play,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Shield,
  KeyRound,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { PhotographerProfile } from '../types';

interface PhotographerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographer: PhotographerProfile | null;
  onToggleStatus: (photogId: string) => void;
  onDeleteProfile: (photogId: string) => void;
  onSelectInCalendar?: (photogId: string) => void;
}

export const PhotographerDetailModal: React.FC<PhotographerDetailModalProps> = ({
  isOpen,
  onClose,
  photographer,
  onToggleStatus,
  onDeleteProfile,
  onSelectInCalendar,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!isOpen || !photographer) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isActive = photographer.status !== 'on_hold';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-[#DCE7D4] relative text-[#073B2F] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-[#DCE7D4] flex items-center justify-between bg-[#F6F3EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#073B2F] font-['Space_Grotesk',sans-serif]">
                Photographer Profile Details
              </h3>
              <p className="text-xs text-[#5C6E5E]">
                Admin review, verification & status control
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-200 text-[#5C6E5E] hover:text-[#073B2F] flex items-center justify-center transition border border-[#DCE7D4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Profile Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F6F3EC] border border-[#DCE7D4]">
            <div className="flex items-center gap-3.5">
              {photographer.avatarUrl ? (
                <img
                  src={photographer.avatarUrl}
                  alt={photographer.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                    photographer.avatarColor || 'from-[#073B2F] to-[#125847]'
                  } text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0`}
                >
                  {photographer.name[0]}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-lg font-bold text-[#073B2F]">{photographer.name}</h4>
                  {isActive ? (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#073B2F]" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
                      <Pause className="w-2.5 h-2.5 fill-current" />
                      <span>On Hold / Paused</span>
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-[#073B2F] mt-0.5">{photographer.title}</p>
                <div className="flex items-center gap-3 text-xs text-[#5C6E5E] mt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#5C6E5E]" />
                    {photographer.city}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#5C6E5E]" />
                    {photographer.experienceYears}+ Years Exp
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Toggle Button */}
            <div className="shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => onToggleStatus(photographer.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                    : 'bg-[#073B2F] hover:bg-[#0c4e3f] text-white'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause / Put On Hold</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Set Active & Approve</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Registration Meta */}
          {photographer.registeredAt && (
            <div className="text-[11px] text-[#5C6E5E] flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F3EC] rounded-xl border border-[#DCE7D4]">
              <Calendar className="w-3.5 h-3.5 text-[#073B2F]" />
              <span>
                Registered on:{' '}
                <strong className="text-[#073B2F]">
                  {new Date(photographer.registeredAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </span>
            </div>
          )}

          {/* Contact Details Grid */}
          <div>
            <h5 className="text-xs font-bold text-[#073B2F] uppercase tracking-wider mb-2">
              Contact Information
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Phone */}
              <div className="p-3 bg-white border border-[#DCE7D4] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F6F3EC] text-[#073B2F] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#5C6E5E] font-medium">Phone Number</div>
                    <div className="text-xs font-bold text-[#073B2F] truncate">
                      {photographer.phone}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(photographer.phone, 'phone')}
                  className="p-1.5 rounded-lg hover:bg-[#F6F3EC] text-[#5C6E5E] hover:text-[#073B2F] transition"
                  title="Copy phone"
                >
                  {copiedField === 'phone' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Email */}
              <div className="p-3 bg-white border border-[#DCE7D4] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F6F3EC] text-[#073B2F] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#5C6E5E] font-medium">Email Address</div>
                    <div className="text-xs font-bold text-[#073B2F] truncate">
                      {photographer.email}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(photographer.email, 'email')}
                  className="p-1.5 rounded-lg hover:bg-[#F6F3EC] text-[#5C6E5E] hover:text-[#073B2F] transition"
                  title="Copy email"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Partner Portal Credentials */}
          <div className="p-3.5 bg-[#F6F3EC] rounded-2xl border border-[#DCE7D4] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-[#073B2F]" />
                <span className="text-xs font-bold text-[#073B2F]">
                  Partner Portal Credentials
                </span>
              </div>
              <span className="text-[10px] text-[#5C6E5E]">Admin Access Only</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-[#DCE7D4]">
                <div className="text-[10px] text-[#5C6E5E]">Login Email</div>
                <div className="font-mono font-bold text-[#073B2F] truncate">
                  {photographer.loginEmail || photographer.email}
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#DCE7D4]">
                <div className="text-[10px] text-[#5C6E5E]">Password</div>
                <div className="font-mono font-bold text-[#073B2F] truncate">
                  {photographer.loginPassword || '••••••••'}
                </div>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h5 className="text-xs font-bold text-[#073B2F] uppercase tracking-wider mb-2">
              Shoot Specialties & Categories
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {photographer.specialties.map((spec) => (
                <span
                  key={spec}
                  className="px-2.5 py-1 rounded-xl bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] text-xs font-bold"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <h5 className="text-xs font-bold text-[#073B2F] uppercase tracking-wider mb-1.5">
              About & Bio Statement
            </h5>
            <p className="text-xs text-[#073B2F] leading-relaxed p-3.5 bg-white border border-[#DCE7D4] rounded-2xl">
              {photographer.bio}
            </p>
          </div>

          {/* Portfolio Link */}
          {photographer.portfolioUrl && (
            <div>
              <h5 className="text-xs font-bold text-[#073B2F] uppercase tracking-wider mb-1.5">
                External Portfolio Link
              </h5>
              <a
                href={photographer.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#DCE7D4] text-xs font-bold text-[#073B2F] hover:text-[#FF6A45] hover:border-[#FF6A45] transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{photographer.portfolioUrl}</span>
                <ExternalLink className="w-3 h-3 text-[#5C6E5E]" />
              </a>
            </div>
          )}

          {/* Delete Confirmation or Actions */}
          {isConfirmingDelete ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h5 className="text-xs font-bold">Permanently Delete Photographer Profile?</h5>
              </div>
              <p className="text-xs leading-relaxed text-rose-700">
                Are you sure you want to delete <strong>{photographer.name}</strong>? This will permanently remove their profile, availability calendar, and credentials from the system.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteProfile(photographer.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-2xs cursor-pointer"
                >
                  Yes, Delete Profile
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-3 py-2 bg-white hover:bg-stone-50 border border-rose-200 text-rose-800 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#DCE7D4] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Profile</span>
              </button>

              <div className="flex items-center gap-2">
                {onSelectInCalendar && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectInCalendar(photographer.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#073B2F] hover:bg-[#0c4e3f] text-white transition shadow-2xs cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#F0FFDA]" />
                    <span>View in Calendar</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 border border-[#DCE7D4] text-[#073B2F] transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
