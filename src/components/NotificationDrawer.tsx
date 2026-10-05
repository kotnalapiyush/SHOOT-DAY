import React from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  MessageCircle,
  ArrowRight,
  Volume2,
  VolumeX,
  UserCheck,
  Pause,
} from 'lucide-react';
import { NotificationItem, ShootBooking, PhotographerProfile } from '../types';
import { formatDateDayMonth } from '../utils/storage';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  shoots: ShootBooking[];
  photographers?: PhotographerProfile[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectShoot: (photographerId: string, date: string) => void;
  onViewPhotographerDetailsById?: (photographerId: string) => void;
  onApprovePhotographer?: (photographerId: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  shoots,
  photographers = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectShoot,
  onViewPhotographerDetailsById,
  onApprovePhotographer,
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
        className="w-full max-w-md bg-white border-l border-[#DCE7D4] h-full flex flex-col shadow-2xl text-[#073B2F] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DCE7D4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0FFDA] text-[#073B2F] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#073B2F] font-['Space_Grotesk',sans-serif]">
                Shoot Booking Alerts
              </h2>
              <p className="text-xs text-[#5C6E5E]">
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
              className="p-1.5 rounded-lg text-[#5C6E5E] hover:text-[#073B2F] hover:bg-[#F6F3EC] transition cursor-pointer"
              title={soundEnabled ? 'Chime sound on' : 'Chime muted'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#073B2F]" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#5C6E5E] hover:text-[#073B2F] hover:bg-[#F6F3EC] text-sm px-2 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick action bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-[#F6F3EC] border-b border-[#DCE7D4] flex items-center justify-between text-xs text-[#5C6E5E]">
            <span>Live alerts for Shoot Lobby</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[#FF6A45] hover:underline font-semibold transition cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
        )}

        {/* List of alerts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#5C6E5E]">
              <CheckCircle2 className="w-10 h-10 text-[#5C6E5E] mb-2 stroke-1" />
              <p className="text-sm text-[#073B2F] font-semibold">No new booking alerts</p>
              <p className="text-xs text-[#5C6E5E] mt-1 max-w-xs">
                When clients book your open dates from your calendar, you will get instant alerts right here.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isRegistration = n.type === 'photographer_registration';
              const linkedPhotog = isRegistration
                ? photographers.find((p) => p.id === n.photographerId) ||
                  photographers.find((p) => (p.name && n.message?.toLowerCase().includes(p.name.toLowerCase())))
                : undefined;
              const targetPhotogId = linkedPhotog?.id || n.photographerId;
              const isPending = linkedPhotog ? linkedPhotog.status === 'on_hold' : true;

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border transition relative cursor-pointer hover:border-[#073B2F] active:scale-[0.99] ${
                    !n.read
                      ? 'bg-[#F0FFDA]/60 border-[#DCE7D4]'
                      : 'bg-[#F6F3EC] border-[#DCE7D4]'
                  }`}
                  onClick={() => {
                    if (!n.read) onMarkAsRead(n.id);
                    if (isRegistration && onViewPhotographerDetailsById) {
                      onViewPhotographerDetailsById(targetPhotogId);
                      onClose();
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-2 h-2 rounded-full bg-[#073B2F]" />
                      <span className="text-xs font-bold text-[#073B2F]">
                        {n.title}
                      </span>
                      {isRegistration && (
                        isPending ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>Pending Approval</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Active</span>
                          </span>
                        )
                      )}
                    </div>
                    <span className="text-[10px] text-[#5C6E5E] flex items-center gap-1 font-mono shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-[#073B2F] mt-1 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#DCE7D4] flex flex-wrap items-center justify-between gap-2 text-xs">
                    {isRegistration ? (
                      <span className="text-[#073B2F] font-bold text-[11px] flex items-center gap-1">
                        <span>👤 Partner Registration</span>
                      </span>
                    ) : (
                      <span className="text-[#FF6A45] font-mono text-[11px] font-bold">
                        📅 {formatDateDayMonth(n.date)}
                      </span>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {isRegistration ? (
                        <>
                          {onApprovePhotographer && isPending && (
                            <button
                              type="button"
                              id={`btn-approve-alert-${n.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!n.read) onMarkAsRead(n.id);
                                onApprovePhotographer(targetPhotogId);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold inline-flex items-center gap-1 transition shadow-xs cursor-pointer"
                              title="Instantly approve and activate this photographer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Approve & Activate</span>
                            </button>
                          )}
                          {onViewPhotographerDetailsById && (
                            <button
                              type="button"
                              id={`btn-review-alert-${n.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!n.read) onMarkAsRead(n.id);
                                onViewPhotographerDetailsById(targetPhotogId);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-[#073B2F] hover:bg-[#0c4e3f] active:scale-95 text-white text-xs font-bold inline-flex items-center gap-1 transition shadow-2xs cursor-pointer"
                              title="View full photographer profile details"
                            >
                              <span>Review Profile</span>
                              <ArrowRight className="w-3 h-3 text-[#F0FFDA]" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {n.clientPhone && (
                            <a
                              href={`https://wa.me/${n.clientPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-lg bg-white text-[#073B2F] border border-[#DCE7D4] hover:border-[#073B2F] text-[10px] font-semibold inline-flex items-center gap-1 transition shadow-2xs"
                            >
                              <MessageCircle className="w-3 h-3 text-[#073B2F]" />
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
                            className="px-2.5 py-1 rounded-lg bg-[#073B2F] hover:bg-[#0c4e3f] text-white text-xs font-bold inline-flex items-center gap-1 transition shadow-2xs cursor-pointer"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
