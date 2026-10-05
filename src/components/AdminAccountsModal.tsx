import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Lock,
  Search,
  User,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { PhotographerProfile } from '../types';

interface AdminAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographers: PhotographerProfile[];
  onUpdatePhotographerPassword?: (photographerId: string, newPassword: string) => void;
  onUpdatePassword?: (photographerId: string, newPassword: string) => void;
  onEditPhotographerProfile?: (photographer: PhotographerProfile) => void;
  onEditFullProfile?: (photographer: PhotographerProfile) => void;
  onAddNewPhotographer?: () => void;
  onLogout?: () => void;
}

export const AdminAccountsModal: React.FC<AdminAccountsModalProps> = ({
  isOpen,
  onClose,
  photographers,
  onUpdatePhotographerPassword,
  onUpdatePassword,
  onEditPhotographerProfile,
  onEditFullProfile,
  onAddNewPhotographer,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPasswordId, setEditingPasswordId] = useState<string | null>(null);
  const [editPasswordInput, setEditPasswordInput] = useState('');

  const handleUpdatePassword = onUpdatePhotographerPassword || onUpdatePassword;
  const handleEditProfile = onEditPhotographerProfile || onEditFullProfile;

  if (!isOpen) return null;

  const filteredPhotographers = (photographers || []).filter(Boolean).filter((p) => {
    const q = (searchQuery || '').toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.city || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.loginEmail || '').toLowerCase().includes(q)
    );
  });

  const toggleReveal = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCredentials = (p: PhotographerProfile) => {
    const firstName = ((p.name || 'partner').trim().split(' ')[0] || 'partner').toLowerCase();
    const pass = p.loginPassword || `${firstName}123`;
    const text = `📸 Shoot Lobby — Partner Access\nName: ${p.name || 'Partner'}\nEmail: ${p.loginEmail || p.email}\nPassword: ${pass}\nWebsite: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditPassword = (p: PhotographerProfile) => {
    const firstName = ((p.name || 'partner').trim().split(' ')[0] || 'partner').toLowerCase();
    setEditingPasswordId(p.id);
    setEditPasswordInput(p.loginPassword || `${firstName}123`);
  };

  const saveEditedPassword = (id: string) => {
    if (editPasswordInput.trim() && handleUpdatePassword) {
      handleUpdatePassword(id, editPasswordInput.trim());
    }
    setEditingPasswordId(null);
  };

  const resetToDefault = (p: PhotographerProfile) => {
    const defaultPass = `${p.name.split(' ')[0].toLowerCase()}123`;
    if (handleUpdatePassword) {
      handleUpdatePassword(p.id, defaultPass);
    }
  };

  return (
    <div
      id="admin-accounts-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#DCE7D4] rounded-3xl max-w-3xl w-full text-[#073B2F] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-[#DCE7D4] bg-[#F6F3EC] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#073B2F] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Shield className="w-5 h-5 text-[#FF6A45]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#073B2F] font-['Space_Grotesk',sans-serif]">
                  Photographer Accounts & Passwords
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] font-bold">
                  Admin Master Access
                </span>
              </div>
              <p className="text-xs text-[#5C6E5E]">
                Full visibility of all photographer credentials. Change, reset, or copy passwords anytime.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                type="button"
                id="btn-admin-modal-logout-header"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-2xs cursor-pointer active:scale-95"
                title="Logout of Admin Panel"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout Admin</span>
                <span className="sm:hidden">Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-stone-200/60 text-[#5C6E5E] hover:text-[#073B2F] flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Search Strip */}
        <div className="p-4 border-b border-[#DCE7D4] bg-[#FAF8F5] flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#5C6E5E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by photographer name, city, or email..."
              className="w-full bg-white border border-[#DCE7D4] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F]"
            />
          </div>
          <div className="text-xs text-[#5C6E5E] font-medium whitespace-nowrap">
            {filteredPhotographers.length} Accounts
          </div>
        </div>

        {/* Accounts List */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-3 flex-1">
          {filteredPhotographers.map((p) => {
            const currentPass = p.loginPassword || `${p.name.split(' ')[0].toLowerCase()}123`;
            const isRevealed = revealedPasswords[p.id];
            const isEditingThisPass = editingPasswordId === p.id;
            const isCopied = copiedId === p.id;

            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white border border-[#DCE7D4] hover:border-[#073B2F]/40 transition space-y-3 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-[#DCE7D4] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#073B2F] truncate">
                          {p.name}
                        </h3>
                        {p.status === 'on_hold' ? (
                          <span className="text-[10px] px-2 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-bold flex items-center gap-0.5">
                            <Pause className="w-2.5 h-2.5 fill-current" />
                            <span>On Hold</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.2 rounded-md bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5C6E5E] truncate">
                        {p.city} • <span className="font-mono text-[#073B2F]">{p.loginEmail || p.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(p)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#F6F3EC] hover:bg-[#DCE7D4] text-[#073B2F] transition border border-[#DCE7D4] flex items-center gap-1"
                      title="Copy login details"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onEditPhotographerProfile(p);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 text-[#073B2F] transition border border-[#DCE7D4] flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Full Profile</span>
                    </button>
                  </div>
                </div>

                {/* Password Bar */}
                <div className="p-2.5 rounded-xl bg-[#F6F3EC] border border-[#DCE7D4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#5C6E5E] font-medium shrink-0">Password:</span>
                    {isEditingThisPass ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editPasswordInput}
                          onChange={(e) => setEditPasswordInput(e.target.value)}
                          className="bg-white border border-[#073B2F] rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-[#073B2F] focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => saveEditedPassword(p.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#073B2F] text-white hover:bg-[#0c4e3f]"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPasswordId(null)}
                          className="px-2 py-1 text-xs text-[#5C6E5E] hover:text-[#073B2F]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-mono font-bold text-[#073B2F]">
                        <span>{isRevealed ? currentPass : '••••••••••••'}</span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(p.id)}
                          className="text-[#5C6E5E] hover:text-[#073B2F]"
                          title={isRevealed ? 'Hide' : 'Reveal'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditingThisPass && (
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => startEditPassword(p)}
                        className="text-[11px] font-bold text-[#073B2F] hover:underline"
                      >
                        Change Password
                      </button>
                      <span className="text-stone-300">•</span>
                      <button
                        type="button"
                        onClick={() => resetToDefault(p)}
                        className="text-[11px] text-[#5C6E5E] hover:text-rose-600 flex items-center gap-0.5"
                        title="Reset to firstname123"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DCE7D4] bg-[#F6F3EC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5C6E5E]">
          <span>
            Studio Admin Master Security • Passwords are automatically updated when photographers change them.
          </span>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {onLogout && (
              <button
                type="button"
                id="btn-admin-modal-logout-footer"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout Admin</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#073B2F] text-white hover:bg-[#0c4e3f] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
