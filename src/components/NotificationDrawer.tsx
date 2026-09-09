import React from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  MessageCircle,
  ArrowRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { NotificationItem, ShootBooking } from '../types';
import { formatDateDayMonth } from '../utils/storage';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  shoots: ShootBooking[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectShoot: (photographerId: string, date: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  shoots,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectShoot,
  soundEnabled,
  setSoundEnabled,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      id="notification-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        id="notification-drawer-panel"
        className="w-full max-w-md bg-[#0b1733] border-l border-[#1d3870] h-full flex flex-col shadow-2xl text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#182f5e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d4f770]/15 text-[#d4f770] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Shoot Booking Alerts
              </h2>
              <p className="text-xs text-stone-400">
                {unreadCount > 0
                  ? `${unreadCount} new booking alert${unreadCount > 1 ? 's' : ''}`
                  : 'All alerts read'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-[#112349] transition"
              title={soundEnabled ? 'Chime sound on' : 'Chime muted'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#d4f770]" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-500" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-[#112349] text-sm px-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick action bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-[#060e22] border-b border-[#182f5e] flex items-center justify-between text-xs text-stone-400">
            <span>Live booking alerts for Shoot Social BAE</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[#d4f770] hover:text-[#c4f042] font-semibold transition"
              >
                Mark all read
              </button>
            )}
          </div>
        )}

        {/* List of alerts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <CheckCircle2 className="w-10 h-10 text-stone-600 mb-2 stroke-1" />
              <p className="text-sm text-stone-300 font-semibold">No new booking alerts</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                When clients book your open dates from your calendar, you will get instant alerts right here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition relative ${
                  !n.read
                    ? 'bg-[#d4f770]/10 border-[#d4f770]/30'
                    : 'bg-[#060e22] border-[#182f5e]'
                }`}
                onClick={() => {
                  if (!n.read) onMarkAsRead(n.id);
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#d4f770]" />
                    <span className="text-xs font-bold text-[#d4f770]">
                      {n.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-xs text-stone-200 mt-1 leading-relaxed">
                  {n.message}
                </p>

                <div className="mt-2.5 pt-2 border-t border-[#182f5e] flex items-center justify-between text-xs">
                  <span className="text-[#d4f770] font-mono text-[11px] font-bold">
                    📅 {formatDateDayMonth(n.date)}
                  </span>

                  <div className="flex items-center gap-2">
                    {n.clientPhone && (
                      <a
                        href={`https://wa.me/${n.clientPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded-md bg-[#060e22] text-[#d4f770] border border-[#1d3870] hover:bg-[#112349] text-[10px] font-semibold inline-flex items-center gap-1 transition"
                      >
                        <MessageCircle className="w-3 h-3 text-[#d4f770]" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!n.read) onMarkAsRead(n.id);
                        onSelectShoot(n.photographerId, n.date);
                        onClose();
                      }}
                      className="text-xs text-[#d4f770] hover:text-[#c4f042] font-bold inline-flex items-center gap-1 transition"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
