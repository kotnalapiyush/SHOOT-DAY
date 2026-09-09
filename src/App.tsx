import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ListOrdered,
  Bell,
  ArrowRight,
  Sparkles,
  Lock,
  LogOut,
  Shield,
} from 'lucide-react';
import { Header } from './components/Header';
import { PhotographerCalendar } from './components/PhotographerCalendar';
import { ShootsList } from './components/ShootsList';
import { ClientBookingView } from './components/ClientBookingView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PhotographerProfileModal } from './components/PhotographerProfileModal';
import { LoginModal } from './components/LoginModal';
import { SocialBaeLogo } from './components/SocialBaeLogo';
import {
  PhotographerProfile,
  ShootBooking,
  NotificationItem,
  DayStatus,
  AuthSession,
} from './types';
import { getStoredAuthSession, saveAuthSession } from './utils/auth';
import {
  loadPhotographers,
  savePhotographers,
  loadAvailability,
  saveAvailability,
  loadShoots,
  saveShoots,
  loadNotifications,
  saveNotifications,
  loadActivePhotographerId,
  saveActivePhotographerId,
  subscribeToUpdates,
} from './utils/storage';
import { playNotificationChime } from './utils/sound';

export default function App() {
  // Authentication session state (Admin, Photographer, or null for Public Client)
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // View Mode: Public visitors strictly see 'client'. Logged in photographer/admin sees 'photographer'.
  const [viewMode, setViewMode] = useState<'photographer' | 'client'>(() => {
    const session = getStoredAuthSession();
    return session ? 'photographer' : 'client';
  });

  const [photographerTab, setPhotographerTab] = useState<'all' | 'calendar' | 'shoots'>('all');

  // Core Data States
  const [photographers, setPhotographers] = useState<PhotographerProfile[]>(() =>
    loadPhotographers()
  );
  const [activePhotographerId, setActivePhotographerId] = useState<string>(() => {
    const session = getStoredAuthSession();
    if (session?.role === 'photographer' && session.photographerId) {
      return session.photographerId;
    }
    return loadActivePhotographerId();
  });
  const [availability, setAvailability] = useState<Record<string, Record<string, DayStatus>>>(() =>
    loadAvailability()
  );
  const [shoots, setShoots] = useState<ShootBooking[]>(() => loadShoots());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadNotifications()
  );

  // Modals & Drawer States
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [photographerToEdit, setPhotographerToEdit] = useState<PhotographerProfile | null>(null);

  // Sound preference & Banner alert
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentAlert, setRecentAlert] = useState<{
    id: string;
    title: string;
    message: string;
    photographerId: string;
    date: string;
  } | null>(null);

  // Active photographer object
  const activePhotographer =
    photographers.find((p) => p.id === activePhotographerId) || photographers[0];

  // Refresh all data
  const refreshAllData = useCallback(() => {
    setPhotographers(loadPhotographers());
    setAvailability(loadAvailability());
    setShoots(loadShoots());
    setNotifications(loadNotifications());
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToUpdates((type) => {
      refreshAllData();
      if (type === 'NEW_CLIENT_BOOKING' && soundEnabled) {
        playNotificationChime();
      }
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('shoot_socialbae_')) {
        refreshAllData();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshAllData, soundEnabled]);

  // Handle Login & Session
  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    if (session.role === 'photographer' && session.photographerId) {
      setActivePhotographerId(session.photographerId);
      saveActivePhotographerId(session.photographerId);
      setViewMode('photographer');
    } else if (session.role === 'admin') {
      setViewMode('photographer');
    }
  };

  const handleLogout = () => {
    saveAuthSession(null);
    setAuthSession(null);
    setViewMode('client');
  };

  const handleSetViewMode = (mode: 'photographer' | 'client') => {
    if (mode === 'photographer' && !authSession) {
      setIsLoginModalOpen(true);
      return;
    }
    setViewMode(mode);
  };

  const handleSelectPhotographer = (id: string) => {
    // If logged in as photographer, keep locked to their own account
    if (authSession?.role === 'photographer' && authSession.photographerId) {
      return;
    }
    setActivePhotographerId(id);
    saveActivePhotographerId(id);
  };

  // Toggle date status for active photographer: STRICTLY Available or Booked
  const handleToggleDateStatus = (date: string, newStatus: DayStatus) => {
    const photogId = activePhotographer.id;

    // 1. Update availability
    const updatedAvail = { ...availability };
    if (!updatedAvail[photogId]) {
      updatedAvail[photogId] = {};
    }
    updatedAvail[photogId] = {
      ...updatedAvail[photogId],
      [date]: newStatus,
    };
    setAvailability(updatedAvail);
    saveAvailability(updatedAvail);

    // 2. Manage shoot record
    if (newStatus === 'booked') {
      const existingShootIndex = shoots.findIndex(
        (s) => s.photographerId === photogId && s.date === date
      );

      if (existingShootIndex === -1) {
        const shootData: ShootBooking = {
          id: `shoot-${Date.now()}`,
          photographerId: photogId,
          date,
          clientName: 'Direct Booking',
          clientPhone: '',
          cityVenue: activePhotographer.city,
          shootType: activePhotographer.specialties[0] || 'Commercial Shoot',
          status: 'confirmed',
          notes: `Reserved directly by ${activePhotographer.name}`,
          source: 'photographer_direct',
          createdAt: new Date().toISOString(),
        };

        const updatedShoots = [shootData, ...shoots];
        setShoots(updatedShoots);
        saveShoots(updatedShoots);
      }
    } else if (newStatus === 'available') {
      // Remove or mark cancelled
      const updatedShoots = shoots.filter(
        (s) => !(s.photographerId === photogId && s.date === date)
      );
      setShoots(updatedShoots);
      saveShoots(updatedShoots);
    }
  };

  // Update shoot status (Confirmed, In Progress, Completed, Cancelled)
  const handleUpdateShootStatus = (shootId: string, status: ShootBooking['status']) => {
    const updatedShoots = shoots.map((s) => (s.id === shootId ? { ...s, status } : s));
    setShoots(updatedShoots);
    saveShoots(updatedShoots);
  };

  // Booking from Client view
  const handleClientBookShoot = (
    bookingData: Omit<ShootBooking, 'id' | 'createdAt'>
  ): ShootBooking => {
    const newBooking: ShootBooking = {
      ...bookingData,
      id: `shoot-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // 1. Save shoot record
    const updatedShoots = [newBooking, ...shoots];
    setShoots(updatedShoots);
    saveShoots(updatedShoots);

    // 2. Mark date as 'booked'
    const updatedAvail = { ...availability };
    if (!updatedAvail[newBooking.photographerId]) {
      updatedAvail[newBooking.photographerId] = {};
    }
    updatedAvail[newBooking.photographerId] = {
      ...updatedAvail[newBooking.photographerId],
      [newBooking.date]: 'booked',
    };
    setAvailability(updatedAvail);
    saveAvailability(updatedAvail);

    // 3. Create notification
    const bookedPhotog = photographers.find((p) => p.id === newBooking.photographerId);
    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      photographerId: newBooking.photographerId,
      title: 'New Shoot Booked!',
      message: `${newBooking.clientName || 'Client'} booked on ${newBooking.date}${
        newBooking.shootType ? ` for ${newBooking.shootType}` : ''
      }.`,
      date: newBooking.date,
      clientName: newBooking.clientName,
      clientPhone: newBooking.clientPhone,
      shootType: newBooking.shootType,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const updatedNotifs = [newNotification, ...notifications];
    setNotifications(updatedNotifs);
    saveNotifications(updatedNotifs);

    // Play chime sound
    if (soundEnabled) {
      playNotificationChime();
    }

    // Trigger toast alert banner
    setRecentAlert({
      id: newNotification.id,
      title: `🎉 ${bookedPhotog?.name || 'Photographer'} Booked!`,
      message: `${newBooking.clientName || 'Client'} booked on ${newBooking.date}`,
      photographerId: newBooking.photographerId,
      date: newBooking.date,
    });
    setTimeout(() => {
      setRecentAlert(null);
    }, 9000);

    return newBooking;
  };

  // Onboard / Save Photographer profile
  const handleSavePhotographerProfile = (
    profileData: PhotographerProfile,
    isNew: boolean
  ) => {
    let updatedList: PhotographerProfile[];
    if (isNew) {
      updatedList = [...photographers, profileData];
      setActivePhotographerId(profileData.id);
      saveActivePhotographerId(profileData.id);
    } else {
      updatedList = photographers.map((p) => (p.id === profileData.id ? profileData : p));
    }
    setPhotographers(updatedList);
    savePhotographers(updatedList);
  };

  // Notification actions
  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleSelectShootFromNotif = (photographerId: string, date: string) => {
    setActivePhotographerId(photographerId);
    saveActivePhotographerId(photographerId);
    setViewMode('photographer');
    setPhotographerTab('calendar');
  };

  return (
    <div className="min-h-screen bg-[#060e22] text-stone-100 flex flex-col selection:bg-[#d4f770] selection:text-[#0a152e] font-sans antialiased">
      {/* Toast Alert for Instant Booking */}
      {recentAlert && (
        <div
          id="real-time-booking-banner"
          className="fixed top-20 right-4 z-50 max-w-md bg-[#0b1733] border border-[#d4f770]/60 rounded-3xl p-4 shadow-2xl text-stone-100 flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#d4f770]/20 text-[#d4f770] border border-[#d4f770]/40 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#d4f770]">
                {recentAlert.title}
              </span>
              <button
                type="button"
                onClick={() => setRecentAlert(null)}
                className="text-stone-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-200 mt-0.5">{recentAlert.message}</p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleSelectShootFromNotif(recentAlert.photographerId, recentAlert.date);
                  setRecentAlert(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#d4f770] hover:bg-[#c6f052] text-[#0a152e] text-xs font-extrabold inline-flex items-center gap-1 transition"
              >
                <span>View on Calendar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        authSession={authSession}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        viewMode={viewMode}
        setViewMode={handleSetViewMode}
        photographers={photographers}
        activePhotographer={activePhotographer}
        onSelectPhotographer={handleSelectPhotographer}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenCreateProfile={() => {
          setPhotographerToEdit(null);
          setIsProfileModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {viewMode === 'photographer' ? (
          <div className="space-y-6">
            {/* Photographer View Controls */}
            <div className="flex flex-wrap items-center justify-between border-b border-[#182f5e] pb-3.5 gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="tab-photographer-all"
                  type="button"
                  onClick={() => setPhotographerTab('all')}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                    photographerTab === 'all'
                      ? 'bg-[#0b1733] text-white border border-[#1d3870] shadow-sm ring-1 ring-[#d4f770]/40'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="Calendar on top, shoot details below"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-[#d4f770]" />
                  <span>Calendar on Top + Details Below</span>
                </button>

                <button
                  id="tab-photographer-calendar"
                  type="button"
                  onClick={() => setPhotographerTab('calendar')}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    photographerTab === 'calendar'
                      ? 'bg-[#0b1733] text-white border border-[#1d3870] shadow-sm ring-1 ring-[#d4f770]/40'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>Calendar Only</span>
                </button>

                <button
                  id="tab-photographer-shoots-list"
                  type="button"
                  onClick={() => setPhotographerTab('shoots')}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    photographerTab === 'shoots'
                      ? 'bg-[#0b1733] text-white border border-[#1d3870] shadow-sm ring-1 ring-[#d4f770]/40'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5 text-[#d4f770]" />
                  <span>Details Only ({shoots.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {photographerTab === 'all' && (
                  <a
                    href="#shoot-details-section"
                    className="text-xs text-stone-400 hover:text-[#d4f770] transition flex items-center gap-1 font-mono"
                  >
                    <span>↓ Jump to Details ({shoots.length})</span>
                  </a>
                )}

                {authSession?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotographerToEdit(activePhotographer);
                      setIsProfileModalOpen(true);
                    }}
                    className="text-xs text-[#d4f770] hover:text-[#c4f042] font-bold hidden sm:block underline transition"
                  >
                    Edit {activePhotographer.name}'s Profile
                  </button>
                )}
              </div>
            </div>

            {/* 1. CALENDAR ON TOP (Rendered first) */}
            {(photographerTab === 'all' || photographerTab === 'calendar') && (
              <PhotographerCalendar
                photographers={photographers}
                activePhotographer={activePhotographer}
                onSelectPhotographer={handleSelectPhotographer}
                availability={availability}
                onToggleDateStatus={handleToggleDateStatus}
                onOpenCreateProfile={() => {
                  setPhotographerToEdit(null);
                  setIsProfileModalOpen(true);
                }}
                shoots={shoots}
                onSwitchToShoots={() => setPhotographerTab('shoots')}
                isAdmin={authSession?.role === 'admin'}
              />
            )}

            {/* 2. DETAILS OF THINGS BELOW (Rendered down after the calendar) */}
            {(photographerTab === 'all' || photographerTab === 'shoots') && (
              <div id="shoot-details-section" className={photographerTab === 'all' ? 'pt-6 border-t border-[#182f5e] space-y-4' : 'space-y-4'}>
                {photographerTab === 'all' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <ListOrdered className="w-4 h-4 text-[#d4f770]" />
                        <span>Booked Shoot Details & Client Feed ({shoots.length})</span>
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Client briefs, timings, mood boards, contact numbers, and venues for {activePhotographer.name}.
                      </p>
                    </div>
                  </div>
                )}
                <ShootsList
                  shoots={shoots}
                  photographers={photographers}
                  activePhotographerId={activePhotographer.id}
                  onSelectShootDate={(photogId, date) => {
                    setActivePhotographerId(photogId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onUpdateShootStatus={handleUpdateShootStatus}
                  isAdmin={authSession?.role === 'admin'}
                />
              </div>
            )}
          </div>
        ) : (
          /* Client Portal View */
          <ClientBookingView
            photographers={photographers}
            availability={availability}
            shoots={shoots}
            onBookShoot={handleClientBookShoot}
          />
        )}
      </main>

      {/* Footer showcasing Shoot Social BAE Branding */}
      <footer className="mt-auto border-t border-stone-800/80 bg-[#05070a] py-8 text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SocialBaeLogo size="sm" variant="light" showBadge={false} />
            <span className="text-stone-500">|</span>
            <span className="text-stone-300 font-medium">
              Shoot Social BAE • Live Calendar & Shoot Network
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {authSession ? (
              <div className="flex items-center gap-3">
                <span className="text-stone-300">
                  Logged in as <strong className="text-white">{authSession.name}</strong> ({authSession.role === 'admin' ? 'Admin' : 'Photographer'})
                </span>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-rose-300 hover:text-rose-200 transition flex items-center gap-1 font-semibold"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                id="btn-footer-portal-login"
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="text-stone-400 hover:text-[#d4f770] transition flex items-center gap-1.5 font-semibold"
              >
                <Lock className="w-3 h-3" />
                <span>Photographer & Admin Portal Login</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals & Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        shoots={shoots}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSelectShoot={handleSelectShootFromNotif}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      <PhotographerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setPhotographerToEdit(null);
        }}
        photographerToEdit={photographerToEdit}
        onSaveProfile={handleSavePhotographerProfile}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        photographers={photographers}
      />
    </div>
  );
}
