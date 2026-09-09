import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Bell,
  Share2,
  UserPlus,
  Eye,
  Check,
  ExternalLink,
  Lock,
  LogOut,
  Shield,
  Camera,
  ChevronDown,
} from 'lucide-react';
import { NotificationItem, PhotographerProfile, AuthSession } from '../types';
import { SocialBaeLogo } from './SocialBaeLogo';

interface HeaderProps {
  authSession: AuthSession | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  viewMode: 'photographer' | 'client';
  setViewMode: (mode: 'photographer' | 'client') => void;
  photographers: PhotographerProfile[];
  activePhotographer: PhotographerProfile;
  onSelectPhotographer: (id: string) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenCreateProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  authSession,
  onOpenLogin,
  onLogout,
  viewMode,
  setViewMode,
  photographers,
  activePhotographer,
  onSelectPhotographer,
  notifications,
  onOpenNotifications,
  onOpenCreateProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Filter notifications for current user
  const relevantNotifications = authSession?.role === 'photographer'
    ? notifications.filter((n) => n.photographerId === authSession.photographerId)
    : notifications;

  const unreadCount = relevantNotifications.filter((n) => !n.read).length;

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('view'); // Clean public client portal
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <>
      <header
        id="app-main-header"
        className="sticky top-0 z-30 bg-[#0b1733]/95 backdrop-blur-md text-stone-100 border-b border-[#1d3870] shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 gap-4">
            {/* Logo & Product Name */}
            <div className="flex items-center gap-3 min-w-0">
              <SocialBaeLogo size="md" variant="light" showBadge={false} />
              
              <div className="hidden lg:block border-l border-[#1d3870] pl-3 py-1">
                <p className="text-[11px] text-stone-400 leading-tight">
                  {authSession?.role === 'admin'
                    ? 'Studio Admin Master Dashboard'
                    : authSession?.role === 'photographer'
                    ? 'Partner Photographer Dashboard'
                    : 'Shoot Social BAE • Photography Productions'}
                </p>
                <p className="text-[10px] text-[#d4f770] font-bold tracking-wider">
                  {authSession?.role === 'admin'
                    ? 'ADMIN CONTROL SYSTEM'
                    : authSession?.role === 'photographer'
                    ? 'PHOTOGRAPHER CALENDAR'
                    : 'CLIENT BOOKING PORTAL'}
                </p>
              </div>
            </div>

            {/* Middle Section depends on authentication */}
            {authSession?.role === 'admin' ? (
              // ADMIN CONTROL BAR: Switch between photographers & toggle Client View preview
              <div className="hidden md:flex items-center gap-3 bg-[#060e22] p-1.5 rounded-2xl border border-[#1d3870]">
                <div className="flex items-center gap-2 pl-2">
                  <span className="text-[11px] text-stone-400 font-semibold">Photographer:</span>
                  <div className="relative">
                    <select
                      id="admin-photographer-select"
                      value={activePhotographer.id}
                      onChange={(e) => onSelectPhotographer(e.target.value)}
                      className="bg-[#0b1733] border border-[#1d3870] rounded-xl px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-[#d4f770] cursor-pointer pr-8 appearance-none"
                    >
                      {photographers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.city})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="h-4 w-px bg-[#1d3870]" />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('photographer')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      viewMode === 'photographer'
                        ? 'bg-[#d4f770] text-[#0a152e]'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Calendar & Shoots
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('client')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      viewMode === 'client'
                        ? 'bg-[#d4f770] text-[#0a152e]'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Client View</span>
                  </button>
                </div>
              </div>
            ) : authSession?.role === 'photographer' ? (
              // PHOTOGRAPHER LOGGED IN BADGE
              <div className="hidden sm:flex items-center gap-2 bg-[#060e22] px-3.5 py-2 rounded-2xl border border-[#1d3870]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-stone-300">
                  Logged in as <strong className="text-white">{authSession.name}</strong>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#d4f770]/15 text-[#d4f770] border border-[#d4f770]/30 font-bold">
                  {activePhotographer.city}
                </span>
              </div>
            ) : null}

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {authSession ? (
                <>
                  {/* Admin can Add Photographer */}
                  {authSession.role === 'admin' && (
                    <button
                      id="btn-admin-add-photographer"
                      type="button"
                      onClick={onOpenCreateProfile}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#d4f770] hover:bg-[#c6f052] text-[#0a152e] transition shadow-sm"
                      title="Create new photographer profile with portal credentials"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add Photographer</span>
                    </button>
                  )}

                  {/* Share Link */}
                  <button
                    id="btn-share-client-calendar"
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#060e22] hover:bg-[#112349] text-stone-200 border border-[#1d3870] transition"
                    title="Share client booking portal"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#d4f770]" />
                    <span className="hidden md:inline">Share Link</span>
                  </button>

                  {/* Notification Bell */}
                  <button
                    id="btn-open-notifications"
                    type="button"
                    onClick={onOpenNotifications}
                    className="relative p-2 rounded-xl text-stone-300 hover:text-white bg-[#060e22] hover:bg-[#112349] border border-[#1d3870] transition"
                    aria-label="Booking Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span
                        id="unread-notifications-badge"
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4f770] text-[#0a152e] text-[10px] font-extrabold flex items-center justify-center animate-pulse"
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Logout Button */}
                  <button
                    id="btn-user-logout"
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#1c0e14] hover:bg-[#2d1424] text-rose-300 border border-rose-900/40 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                /* Public Visitor: Simple, Elegant Photographer / Admin Login Button */
                <button
                  id="btn-open-portal-login"
                  type="button"
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0b1733] hover:bg-[#112349] text-[#d4f770] border border-[#d4f770]/40 transition shadow-sm hover:shadow-[#d4f770]/10"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Photographer / Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Share Calendar Modal */}
      {showShareModal && (
        <div
          id="share-calendar-modal"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[#0b1733] border border-[#1d3870] rounded-3xl max-w-lg w-full p-6 text-stone-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#d4f770]/15 text-[#d4f770] flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Send Shoot Social BAE to Clients
                  </h3>
                  <p className="text-xs text-stone-400">
                    Clients can check dates across photographers and book instantly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-stone-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#060e22] p-4 rounded-2xl border border-[#1d3870]">
              <label className="text-[11px] uppercase tracking-wider text-stone-400 block mb-1.5 font-semibold">
                Client Booking Portal Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="input-shareable-booking-link"
                  type="text"
                  readOnly
                  value={`${window.location.origin}${window.location.pathname}`}
                  className="w-full bg-[#0b1733] border border-[#1d3870] rounded-xl px-3 py-2 text-xs text-stone-200 select-all focus:outline-none focus:border-[#d4f770]"
                />
                <button
                  id="btn-copy-shareable-link"
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-[#d4f770] hover:bg-[#c6f052] text-[#0a152e] text-xs font-bold shrink-0 flex items-center gap-1 transition shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-2" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <span>Copy</span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  setViewMode('client');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#060e22] hover:bg-[#112349] text-white border border-[#1d3870] flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Client Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium bg-[#112349] hover:bg-[#162f63] text-stone-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
