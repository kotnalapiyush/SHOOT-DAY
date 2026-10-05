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
  Pause,
  Play,
  Trash2,
  Pencil,
  AlertTriangle,
  KeyRound,
  Camera,
  Users,
} from 'lucide-react';
import { Header } from './components/Header';
import { PhotographerCalendar } from './components/PhotographerCalendar';
import { ShootsList } from './components/ShootsList';
import { ClientBookingView } from './components/ClientBookingView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PhotographerProfileModal } from './components/PhotographerProfileModal';
import { PhotographerSelfEditModal } from './components/PhotographerSelfEditModal';
import { AdminAccountsModal } from './components/AdminAccountsModal';
import { LoginModal } from './components/LoginModal';
import { PhotographerSignUpModal } from './components/PhotographerSignUpModal';
import { AdminPhotographersModal } from './components/AdminPhotographersModal';
import { PhotographerDetailModal } from './components/PhotographerDetailModal';
import {
  syncPhotographerToFirestore,
  deletePhotographerFromFirestore,
  subscribeToPhotographers,
  subscribeToShoots,
  syncShootToFirestore,
  deleteShootFromFirestore,
  subscribeToAvailability,
  syncAvailabilityToFirestore,
  subscribeToNotifications,
  syncNotificationToFirestore,
} from './firebase/firestoreService';
import { SocialBaeLogo } from './components/SocialBaeLogo';
import { ShootLobbyLogo } from './components/ShootLobbyLogo';
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
  formatDateKey,
  APP_CURRENT_YEAR,
} from './utils/storage';
import { playNotificationChime } from './utils/sound';

export default function App() {
  // Authentication session state (Admin, Photographer, or null for Public Client)
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => getStoredAuthSession());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalCreds, setLoginModalCreds] = useState<{ email?: string; password?: string }>({});

  // View Mode: Public visitors strictly see 'client'. Logged in photographer/admin sees 'photographer'.
  const [viewMode, setViewMode] = useState<'photographer' | 'client'>(() => {
    const session = getStoredAuthSession();
    return session ? 'photographer' : 'client';
  });

  // Ensure dark class is completely removed
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('shootday_theme');
  }, []);

  const [photographerTab, setPhotographerTab] = useState<'calendar' | 'shoots'>('calendar');

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
  const [photographerToDelete, setPhotographerToDelete] = useState<PhotographerProfile | null>(null);
  const [isSelfEditModalOpen, setIsSelfEditModalOpen] = useState(false);
  const [isAdminAccountsModalOpen, setIsAdminAccountsModalOpen] = useState(false);
  const [isPhotographerSignUpOpen, setIsPhotographerSignUpOpen] = useState(false);
  const [isAdminPhotographersModalOpen, setIsAdminPhotographersModalOpen] = useState(false);
  const [detailModalPhotographer, setDetailModalPhotographer] = useState<PhotographerProfile | null>(null);

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

  // Real-time Firestore synchronization across all devices and browser tabs
  useEffect(() => {
    const unsubPhotographers = subscribeToPhotographers((remotePhotographers) => {
      if (remotePhotographers && remotePhotographers.length > 0) {
        setPhotographers(remotePhotographers);
        savePhotographers(remotePhotographers);
      }
    }, loadPhotographers());

    const unsubShoots = subscribeToShoots((remoteShoots) => {
      if (remoteShoots && remoteShoots.length > 0) {
        setShoots(remoteShoots);
        saveShoots(remoteShoots);
      }
    }, loadShoots());

    const unsubAvailability = subscribeToAvailability((remoteAvail) => {
      if (remoteAvail && Object.keys(remoteAvail).length > 0) {
        setAvailability(remoteAvail);
        saveAvailability(remoteAvail);
      }
    }, loadAvailability());

    const unsubNotifications = subscribeToNotifications((remoteNotifs) => {
      if (remoteNotifs && remoteNotifs.length > 0) {
        setNotifications(remoteNotifs);
        saveNotifications(remoteNotifs);
      }
    }, loadNotifications());

    return () => {
      unsubPhotographers();
      unsubShoots();
      unsubAvailability();
      unsubNotifications();
    };
  }, []);

  useEffect(() => {
    const handleAuthSync = () => {
      const current = getStoredAuthSession();
      setAuthSession(current);
      if (current?.role === 'photographer' && current.photographerId) {
        setActivePhotographerId(current.photographerId);
        setViewMode('photographer');
      } else if (!current) {
        setViewMode('client');
      }
    };

    const unsubscribe = subscribeToUpdates((type) => {
      refreshAllData();
      if (type === 'AUTH_SESSION_CHANGED') {
        handleAuthSync();
      }
      if (type === 'NEW_CLIENT_BOOKING' && soundEnabled) {
        playNotificationChime();
      }
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'shoot_socialbae_auth_session_v1') {
        handleAuthSync();
      } else if (e.key?.startsWith('shoot_socialbae_')) {
        refreshAllData();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('shoot_auth_changed', handleAuthSync);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('shoot_auth_changed', handleAuthSync);
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
    syncAvailabilityToFirestore(photogId, updatedAvail[photogId]);

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
        syncShootToFirestore(shootData);
      }
    } else if (newStatus === 'available') {
      const targetShoot = shoots.find(
        (s) => s.photographerId === photogId && s.date === date
      );
      if (targetShoot) {
        deleteShootFromFirestore(targetShoot.id);
      }
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
    const target = updatedShoots.find((s) => s.id === shootId);
    if (target) {
      syncShootToFirestore(target);
    }
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
    syncShootToFirestore(newBooking);

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
    syncAvailabilityToFirestore(newBooking.photographerId, updatedAvail[newBooking.photographerId]);

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
    syncNotificationToFirestore(newNotification);

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
      updatedList = [...photographers.filter((p) => p.id !== profileData.id), profileData];
      setActivePhotographerId(profileData.id);
      saveActivePhotographerId(profileData.id);
    } else {
      updatedList = photographers.map((p) => (p.id === profileData.id ? profileData : p));
    }
    setPhotographers(updatedList);
    savePhotographers(updatedList);
    syncPhotographerToFirestore(profileData);
  };

  // Photographer Self-Registration Handler
  const handlePhotographerSignUp = (newProfile: PhotographerProfile) => {
    const updatedList = [...photographers.filter((p) => p.id !== newProfile.id), newProfile];
    setPhotographers(updatedList);
    savePhotographers(updatedList);
    syncPhotographerToFirestore(newProfile);

    // Immediately log in the photographer so their dashboard and calendar open right away
    const session: AuthSession = {
      role: 'photographer',
      id: newProfile.id,
      photographerId: newProfile.id,
      name: newProfile.name,
      email: newProfile.email || newProfile.loginEmail || '',
      avatarUrl: newProfile.avatarUrl,
    };
    saveAuthSession(session);
    setAuthSession(session);
    setActivePhotographerId(newProfile.id);
    saveActivePhotographerId(newProfile.id);
    setViewMode('photographer');
    setPhotographerTab('calendar');

    // Create Notification for admin
    const regNotif: NotificationItem = {
      id: `notif-reg-${Date.now()}`,
      photographerId: newProfile.id,
      title: '👤 New Photographer Registered',
      message: `${newProfile.name} (${newProfile.city}) registered their profile. Account is active and ready for bookings.`,
      date: formatDateKey(new Date()),
      read: false,
      createdAt: new Date().toISOString(),
      type: 'photographer_registration',
    };
    const updatedNotifs = [regNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveNotifications(updatedNotifs);
    syncNotificationToFirestore(regNotif);

    setRecentAlert({
      id: regNotif.id,
      title: '🎉 Account Created & Logged In!',
      message: `Welcome ${newProfile.name}! Your photographer partner portal is ready.`,
      photographerId: newProfile.id,
      date: 'Account Active',
    });
    if (soundEnabled) playNotificationChime();
  };

  // Toggle Hold / Resume Photographer status
  const handleTogglePhotographerHold = (photogId: string) => {
    const target = photographers.find((p) => p.id === photogId);
    if (!target) return;
    const nextStatus: 'active' | 'on_hold' = target.status === 'on_hold' ? 'active' : 'on_hold';
    const updatedList = photographers.map((p) => {
      if (p.id === photogId) {
        const updatedProfile = { ...p, status: nextStatus };
        syncPhotographerToFirestore(updatedProfile);
        return updatedProfile;
      }
      return p;
    });
    setPhotographers(updatedList);
    savePhotographers(updatedList);

    if (detailModalPhotographer?.id === photogId) {
      setDetailModalPhotographer((prev) =>
        prev ? { ...prev, status: nextStatus } : null
      );
    }

    setRecentAlert({
      id: `hold-${Date.now()}`,
      title: nextStatus === 'on_hold' ? 'Photographer Put On Hold' : 'Photographer Resumed & Active',
      message:
        nextStatus === 'on_hold'
          ? `${target.name}'s profile is paused. Client bookings are disabled.`
          : `${target.name}'s profile is now active and ready for client bookings.`,
      photographerId: photogId,
      date: nextStatus === 'on_hold' ? 'Status: On Hold' : 'Status: Active',
    });
    setTimeout(() => setRecentAlert(null), 5000);
  };

  // Delete Photographer Profile permanently
  const handleDeletePhotographer = (photogId: string) => {
    const target = photographers.find((p) => p.id === photogId);
    const remaining = photographers.filter((p) => p.id !== photogId);
    if (remaining.length === 0) {
      alert('At least one photographer profile must remain in the studio.');
      return;
    }

    setPhotographers(remaining);
    savePhotographers(remaining);
    deletePhotographerFromFirestore(photogId);

    // Switch active photographer if the deleted one was selected
    if (activePhotographerId === photogId) {
      setActivePhotographerId(remaining[0].id);
      saveActivePhotographerId(remaining[0].id);
    }

    if (detailModalPhotographer?.id === photogId) {
      setDetailModalPhotographer(null);
    }

    setPhotographerToDelete(null);
    setIsProfileModalOpen(false);

    setRecentAlert({
      id: `del-${Date.now()}`,
      title: 'Profile Deleted',
      message: `${target?.name || 'Photographer'} has been permanently removed from the network.`,
      photographerId: '',
      date: 'Profile Removed',
    });
    setTimeout(() => setRecentAlert(null), 5000);
  };

  // Photographer Self-Edit Save Handler
  const handlePhotographerSelfSave = (
    updatedProfile: PhotographerProfile,
    passwordChanged: boolean,
    newPassword?: string
  ) => {
    const updatedList = photographers.map((p) =>
      p.id === updatedProfile.id ? updatedProfile : p
    );
    setPhotographers(updatedList);
    savePhotographers(updatedList);
    syncPhotographerToFirestore(updatedProfile);

    // If password was changed, immediately create an admin notification and toast alert
    if (passwordChanged && newPassword) {
      const passNotif: NotificationItem = {
        id: `pass-${Date.now()}`,
        photographerId: updatedProfile.id,
        title: `🔑 Password Updated: ${updatedProfile.name}`,
        message: `${updatedProfile.name} changed their login password to "${newPassword}". Admin master access is synced.`,
        date: formatDateKey(new Date()),
        read: false,
        createdAt: new Date().toISOString(),
      };
      const updatedNotifs = [passNotif, ...notifications];
      setNotifications(updatedNotifs);
      saveNotifications(updatedNotifs);
      syncNotificationToFirestore(passNotif);

      setRecentAlert({
        id: passNotif.id,
        title: `🔑 Password Changed: ${updatedProfile.name}`,
        message: `New password: "${newPassword}". Synced with Admin accounts manager.`,
        photographerId: updatedProfile.id,
        date: formatDateKey(new Date()),
      });
      setTimeout(() => setRecentAlert(null), 9000);
    } else {
      setRecentAlert({
        id: `prof-upd-${Date.now()}`,
        title: 'Profile Updated',
        message: 'Your profile picture, portfolio link, and details have been updated.',
        photographerId: updatedProfile.id,
        date: formatDateKey(new Date()),
      });
      setTimeout(() => setRecentAlert(null), 5000);
    }
  };

  // Admin Account Password Reset / Change Handler
  const handleAdminUpdatePassword = (photographerId: string, newPassword: string) => {
    const target = photographers.find((p) => p.id === photographerId);
    const updatedList = photographers.map((p) =>
      p.id === photographerId ? { ...p, loginPassword: newPassword } : p
    );
    setPhotographers(updatedList);
    savePhotographers(updatedList);
    const updatedPhotog = updatedList.find((p) => p.id === photographerId);
    if (updatedPhotog) {
      syncPhotographerToFirestore(updatedPhotog);
    }

    setRecentAlert({
      id: `admin-pass-${Date.now()}`,
      title: 'Password Updated by Admin',
      message: `Updated login password for ${target?.name || 'photographer'} to "${newPassword}".`,
      photographerId,
      date: formatDateKey(new Date()),
    });
    setTimeout(() => setRecentAlert(null), 6000);
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
    <div
      className="min-h-screen flex flex-col font-sans antialiased bg-[#F6F3EC] text-[#073B2F] selection:bg-[#FF6A45] selection:text-white"
    >
      {/* Toast Alert for Instant Booking */}
      {recentAlert && (
        <div
          id="real-time-booking-banner"
          className="fixed top-20 sm:top-24 right-4 z-50 max-w-md bg-white border border-[#DCE7D4] rounded-3xl p-4 shadow-xl text-[#073B2F] flex items-start gap-3 animate-in slide-in-from-top-4"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-[#073B2F]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FF6A45]">
                {recentAlert.title}
              </span>
              <button
                type="button"
                onClick={() => setRecentAlert(null)}
                className="text-[#5C6E5E] hover:text-[#073B2F] text-xs px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#5C6E5E] mt-0.5">{recentAlert.message}</p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleSelectShootFromNotif(recentAlert.photographerId, recentAlert.date);
                  setRecentAlert(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#073B2F] hover:bg-[#052920] text-white text-xs font-bold inline-flex items-center gap-1 transition"
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
        onOpenPhotographerSignUp={() => setIsPhotographerSignUpOpen(true)}
        onOpenPhotographersManager={() => setIsAdminPhotographersModalOpen(true)}
        onOpenSelfEditProfile={() => setIsSelfEditModalOpen(true)}
        onOpenAdminAccounts={() => setIsAdminAccountsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {viewMode === 'photographer' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            {/* Photographer View Controls */}
            <div className="flex flex-wrap items-center justify-between border-b border-[#DCE7D4] pb-3.5 gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="tab-photographer-calendar"
                  type="button"
                  onClick={() => setPhotographerTab('calendar')}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    photographerTab === 'calendar'
                      ? 'bg-[#073B2F] text-white border border-[#073B2F] shadow-xs font-bold'
                      : 'text-[#5C6E5E] hover:text-[#073B2F]'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-[#FF6A45]" />
                  <span>Calendar</span>
                </button>

                <button
                  id="tab-photographer-shoots-list"
                  type="button"
                  onClick={() => setPhotographerTab('shoots')}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    photographerTab === 'shoots'
                      ? 'bg-[#073B2F] text-white border border-[#073B2F] shadow-xs font-bold'
                      : 'text-[#5C6E5E] hover:text-[#073B2F]'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5 text-[#FF6A45]" />
                  <span>Shoot Details ({shoots.length})</span>
                </button>
              </div>

              {authSession?.role === 'admin' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-admin-manage-photographers-subbar"
                    onClick={() => setIsAdminPhotographersModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#073B2F] text-white hover:bg-[#0c4e3f] shadow-2xs border border-[#073B2F] transition active:scale-[0.98] cursor-pointer"
                    title="Review registered photographers and manage status"
                  >
                    <Users className="w-3.5 h-3.5 text-[#F0FFDA]" />
                    <span>Manage Photographers ({photographers.length})</span>
                  </button>
                </div>
              ) : null}
            </div>

            {/* Calendar View */}
            {photographerTab === 'calendar' && (
              <PhotographerCalendar
                photographers={photographers}
                activePhotographer={activePhotographer}
                onSelectPhotographer={handleSelectPhotographer}
                availability={availability}
                onToggleDateStatus={handleToggleDateStatus}
                onOpenPhotographersManager={() => setIsAdminPhotographersModalOpen(true)}
                onViewPhotographerDetails={(p) => setDetailModalPhotographer(p)}
                onTogglePhotographerStatus={handleTogglePhotographerHold}
                onDeletePhotographer={(id) => {
                  const p = photographers.find((x) => x.id === id);
                  if (p) setPhotographerToDelete(p);
                }}
                onOpenSelfEditProfile={() => setIsSelfEditModalOpen(true)}
                onOpenAdminAccounts={() => setIsAdminAccountsModalOpen(true)}
                shoots={shoots}
                onSwitchToShoots={() => setPhotographerTab('shoots')}
                isAdmin={authSession?.role === 'admin'}
                onLogout={handleLogout}
              />
            )}

            {/* Shoot Details View */}
            {photographerTab === 'shoots' && (
              <div id="shoot-details-section" className="space-y-4">
                <ShootsList
                  shoots={shoots}
                  photographers={photographers}
                  activePhotographerId={activePhotographer.id}
                  onSelectShootDate={(photogId, date) => {
                    setActivePhotographerId(photogId);
                    setPhotographerTab('calendar');
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
            onOpenPhotographerSignUp={() => setIsPhotographerSignUpOpen(true)}
          />
        )}
      </main>

      {/* Footer showcasing Shoot Lobby Branding */}
      <footer
        className="mt-auto border-t border-[#DCE7D4] bg-white py-8 text-xs text-[#5C6E5E]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShootLobbyLogo size="md" theme="green" variant="wordmark" />
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#5C6E5E]">© {APP_CURRENT_YEAR} Shoot Lobby. All rights reserved.</span>
            {!authSession && (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="text-[#FF6A45] hover:underline font-bold"
              >
                Photographer Portal
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
        onViewPhotographerDetailsById={(photogId) => {
          const p = photographers.find((x) => x.id === photogId);
          if (p) {
            setDetailModalPhotographer(p);
          } else {
            setIsAdminPhotographersModalOpen(true);
          }
        }}
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
        onDeleteProfile={handleDeletePhotographer}
      />

      {/* Photographer Self-Registration Modal */}
      <PhotographerSignUpModal
        isOpen={isPhotographerSignUpOpen}
        onClose={() => setIsPhotographerSignUpOpen(false)}
        photographers={photographers}
        onSignUpSuccess={handlePhotographerSignUp}
        onOpenLogin={(email, password) => {
          setLoginModalCreds({ email, password });
          setIsLoginModalOpen(true);
        }}
      />

      {/* Admin Master Photographers Management Modal */}
      <AdminPhotographersModal
        isOpen={isAdminPhotographersModalOpen}
        onClose={() => setIsAdminPhotographersModalOpen(false)}
        photographers={photographers}
        onToggleStatus={handleTogglePhotographerHold}
        onDeleteProfile={(id) => {
          const p = photographers.find((x) => x.id === id);
          if (p) setPhotographerToDelete(p);
        }}
        onViewDetails={(p) => setDetailModalPhotographer(p)}
        onSelectInCalendar={(id) => {
          handleSelectPhotographer(id);
          setViewMode('photographer');
          setPhotographerTab('calendar');
        }}
      />

      {/* Photographer Full Details Inspector Modal */}
      <PhotographerDetailModal
        isOpen={Boolean(detailModalPhotographer)}
        onClose={() => setDetailModalPhotographer(null)}
        photographer={detailModalPhotographer}
        onToggleStatus={handleTogglePhotographerHold}
        onDeleteProfile={(id) => {
          const p = photographers.find((x) => x.id === id);
          if (p) setPhotographerToDelete(p);
        }}
        onSelectInCalendar={(id) => {
          handleSelectPhotographer(id);
          setViewMode('photographer');
          setPhotographerTab('calendar');
        }}
      />

      {/* Delete Photographer Confirmation Modal */}
      {photographerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div
            id="modal-confirm-delete-photographer"
            className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#DCE7D4] shadow-2xl space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#073B2F]">
                  Delete Photographer Profile?
                </h3>
                <p className="text-xs text-[#5C6E5E] mt-1">
                  Are you sure you want to remove <strong className="text-[#073B2F]">{photographerToDelete.name}</strong> ({photographerToDelete.city}) from Shoot Lobby?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
              This action cannot be undone. Their calendar, availability slots, and partner login credentials will be removed. All previous shoot history is retained.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPhotographerToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C6E5E] hover:bg-stone-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-photographer-action"
                onClick={() => handleDeletePhotographer(photographerToDelete.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photographer Self-Edit Profile & Portfolio Modal */}
      <PhotographerSelfEditModal
        isOpen={isSelfEditModalOpen}
        onClose={() => setIsSelfEditModalOpen(false)}
        photographer={activePhotographer}
        onSaveProfile={handlePhotographerSelfSave}
      />

      {/* Admin Accounts & Passwords Management Modal */}
      <AdminAccountsModal
        isOpen={isAdminAccountsModalOpen}
        onClose={() => setIsAdminAccountsModalOpen(false)}
        photographers={photographers}
        onUpdatePassword={handleAdminUpdatePassword}
        onEditFullProfile={(photog) => {
          setIsAdminAccountsModalOpen(false);
          setDetailModalPhotographer(photog);
        }}
        onLogout={handleLogout}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginModalCreds({});
        }}
        onLoginSuccess={handleLoginSuccess}
        photographers={photographers}
        onOpenPhotographerSignUp={() => setIsPhotographerSignUpOpen(true)}
        initialIdentifier={loginModalCreds.email}
        initialPassword={loginModalCreds.password}
      />
    </div>
  );
}
