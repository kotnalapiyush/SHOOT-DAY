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
  KeyRound,
  Users,
} from 'lucide-react';
import { NotificationItem, PhotographerProfile, AuthSession } from '../types';
import { ShootLobbyLogo } from './ShootLobbyLogo';

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
  onOpenCreateProfile?: () => void;
  onOpenPhotographerSignUp?: () => void;
  onOpenPhotographersManager?: () => void;
  onOpenSelfEditProfile?: () => void;
  onOpenAdminAccounts?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
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
  onOpenPhotographerSignUp,
  onOpenPhotographersManager,
  onOpenSelfEditProfile,
  onOpenAdminAccounts,
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
    url.searchParams.delete('view');
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <>
      <header
        id="app-main-header"
        className="sticky top-0 z-40 bg-[#F6F3EC]/90 backdrop-blur-md text-[#12201A] border-b border-[#E3EEE7] shadow-2xs transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('client')}
                className="cursor-pointer focus:outline-none text-left"
                title="Shoot Lobby - Home"
              >
                <ShootLobbyLogo size="md" theme="green" variant="wordmark" />
              </button>

              {authSession && (
                <div className="hidden md:flex flex-col border-l border-[#E3EEE7] pl-2.5 sm:pl-3 py-0.5 shrink-0 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                    <p className="text-[11px] text-[#5C6E5E] leading-tight font-semibold whitespace-nowrap">
                      {authSession.role === 'admin'
                        ? 'Admin Panel'
                        : 'Partner Photographer'}
                    </p>
                  </div>
                  <p className="text-[10px] text-[#12201A] font-bold tracking-wider uppercase whitespace-nowrap">
                    {authSession.role === 'admin'
                      ? 'Master Control'
                      : 'Dashboard'}
                  </p>
                </div>
              )}
            </div>

            {/* Middle Section if logged in as photographer */}
            {authSession?.role === 'photographer' ? (
              <div className="hidden lg:flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-2xl border border-[#E3EEE7]">
                <img
                  src={activePhotographer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-[#E3EEE7]"
                />
                <span className="text-xs font-semibold text-[#5C6E5E]">
                  Logged in as <strong className="text-[#12201A]">{authSession.name}</strong>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#E3EEE7] text-[#33684C] border border-[#E3EEE7] font-bold">
                  {activePhotographer.city}
                </span>
              </div>
            ) : null}

            {/* Right Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {authSession ? (
                <>
                  {viewMode === 'client' && (
                    <button
                      id="btn-return-to-portal"
                      type="button"
                      onClick={() => setViewMode('photographer')}
                      className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-[#33684C] hover:bg-[#1F4331] text-white transition shadow-xs cursor-pointer active:scale-95"
                      title="Return to Calendar & Dashboard"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-[#FFDF70]" />
                      <span className="hidden sm:inline">Calendar & Dashboard</span>
                      <span className="sm:hidden">Calendar</span>
                    </button>
                  )}

                  <button
                    id="btn-share-client-calendar"
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F6F3EC] text-[#12201A] border border-[#E3EEE7] transition shadow-2xs cursor-pointer active:scale-95"
                    title="Share Shoot Lobby"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#5C6E5E]" />
                    <span className="hidden xs:inline">Share</span>
                  </button>

                  <button
                    id="btn-open-notifications"
                    type="button"
                    onClick={onOpenNotifications}
                    className="relative p-1.5 sm:p-2 rounded-xl text-[#12201A] hover:text-black bg-white hover:bg-[#F6F3EC] border border-[#E3EEE7] transition shadow-2xs cursor-pointer"
                    aria-label="Booking Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span
                        id="unread-notifications-badge"
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#33684C] text-[#FFDF70] border border-white text-[10px] font-extrabold flex items-center justify-center animate-pulse"
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Always prominent and accessible Logout button */}
                  <button
                    id="btn-user-logout"
                    type="button"
                    onClick={onLogout}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-[0.98] ${
                      authSession.role === 'admin'
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-extrabold shadow-xs'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                    title={authSession.role === 'admin' ? 'Logout of Admin Panel' : 'Logout of portal'}
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>{authSession.role === 'admin' ? 'Logout Admin' : 'Logout'}</span>
                  </button>
                </>
              ) : (
                /* Public Visitor: Join as Photographer & Login Buttons (Brand Guidelines Page 6) */
                <div className="flex items-center gap-2">
                  <button
                    id="btn-photographer-signup-header"
                    type="button"
                    onClick={onOpenPhotographerSignUp}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl font-bold text-xs bg-white hover:bg-[#F6F3EC] text-[#12201A] border border-[#E3EEE7] shadow-2xs transition active:scale-[0.98] cursor-pointer"
                    title="Register as a photographer to list your calendar"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-[#33684C]" />
                    <span className="hidden sm:inline">Join as Photographer</span>
                    <span className="sm:hidden">Sign Up</span>
                  </button>
                  <button
                    id="btn-open-portal-login"
                    type="button"
                    onClick={onOpenLogin}
                    className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-extrabold text-xs sm:text-sm bg-[#FFDF70] hover:bg-[#fbd351] text-[#12201A] shadow-xs transition active:scale-[0.98] cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#12201A]" />
                    <span>Login</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Share Calendar Modal */}
      {showShareModal && (
        <div
          id="share-calendar-modal"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white border border-[#E3EEE7] rounded-3xl max-w-lg w-full p-6 text-[#12201A] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E3EEE7] text-[#33684C] border border-[#E3EEE7] flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#12201A] font-headline">
                    Share Shoot Lobby to Clients
                  </h3>
                  <p className="text-xs text-[#5C6E5E]">
                    Clients can check dates across photographers and book instantly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-[#5C6E5E] hover:text-[#12201A] text-sm px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#F6F3EC] p-4 rounded-2xl border border-[#E3EEE7]">
              <label className="text-[11px] uppercase tracking-wider text-[#5C6E5E] block mb-1.5 font-semibold">
                Client Booking Portal Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="input-shareable-booking-link"
                  type="text"
                  readOnly
                  value={`${window.location.origin}${window.location.pathname}`}
                  className="w-full bg-white border border-[#E3EEE7] rounded-xl px-3 py-2 text-xs text-[#12201A] font-mono select-all focus:outline-none focus:border-[#33684C]"
                />
                <button
                  id="btn-copy-shareable-link"
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-[#33684C] hover:bg-[#1F4331] text-white text-xs font-bold shrink-0 flex items-center gap-1 transition shadow-xs cursor-pointer active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-2 text-[#FFDF70]" />
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
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#E3EEE7] hover:bg-[#d0e0d6] text-[#33684C] border border-[#E3EEE7] flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Client Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#F6F3EC] hover:bg-[#ebd5c0]/30 text-[#5C6E5E] transition"
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

