import React, { useState } from 'react';
import {
  X,
  Users,
  Search,
  CheckCircle2,
  Pause,
  Play,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Award,
  Clock,
  Filter,
  Sparkles,
} from 'lucide-react';
import { PhotographerProfile } from '../types';

interface AdminPhotographersModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographers: PhotographerProfile[];
  onToggleStatus: (photogId: string) => void;
  onDeleteProfile: (photogId: string) => void;
  onViewDetails: (photographer: PhotographerProfile) => void;
  onSelectInCalendar: (photogId: string) => void;
}

export const AdminPhotographersModal: React.FC<AdminPhotographersModalProps> = ({
  isOpen,
  onClose,
  photographers,
  onToggleStatus,
  onDeleteProfile,
  onViewDetails,
  onSelectInCalendar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_hold'>('all');

  if (!isOpen) return null;

  const totalCount = photographers.length;
  const activeCount = photographers.filter((p) => p.status !== 'on_hold').length;
  const onHoldCount = photographers.filter((p) => p.status === 'on_hold').length;

  // Filter photographers
  const filteredPhotographers = photographers.filter((p) => {
    // Status filter
    if (statusFilter === 'active' && p.status === 'on_hold') return false;
    if (statusFilter === 'on_hold' && p.status !== 'on_hold') return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.city || '').toLowerCase().includes(q) ||
      (p.title || '').toLowerCase().includes(q) ||
      (p.specialties || []).some((s) => (s || '').toLowerCase().includes(q)) ||
      (p.email || p.loginEmail || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-[#DCE7D4] relative text-[#073B2F] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Strip */}
        <div className="p-5 sm:p-6 border-b border-[#DCE7D4] flex items-center justify-between bg-[#F6F3EC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] flex items-center justify-center shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#073B2F] font-['Space_Grotesk',sans-serif]">
                  Photographer Network Management
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#073B2F] text-[#F0FFDA] font-bold font-mono">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-[#5C6E5E]">
                Review self-registered photographers, inspect details, set Active / Hold, or remove profiles
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

        {/* Big Dashboard Metrics & Filters */}
        <div className="p-4 sm:p-6 bg-white border-b border-[#DCE7D4] space-y-4">
          {/* 3 Big Metric Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Total Registered Photographers */}
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`p-4 rounded-2xl border text-left transition relative cursor-pointer group active:scale-[0.99] ${
                statusFilter === 'all'
                  ? 'bg-[#073B2F] text-white border-[#073B2F] shadow-md ring-2 ring-[#073B2F]/30'
                  : 'bg-[#F6F3EC] text-[#073B2F] border-[#DCE7D4] hover:border-[#073B2F]/40 hover:bg-[#efece4]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-extrabold uppercase tracking-wider ${
                    statusFilter === 'all' ? 'text-[#F0FFDA]' : 'text-[#5C6E5E]'
                  }`}
                >
                  Total Photographers
                </span>
                <Users
                  className={`w-4 h-4 ${
                    statusFilter === 'all' ? 'text-[#F0FFDA]' : 'text-[#5C6E5E]'
                  }`}
                />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-3xl sm:text-4xl font-black font-['Space_Grotesk',sans-serif] tracking-tight ${
                    statusFilter === 'all' ? 'text-white' : 'text-[#073B2F]'
                  }`}
                >
                  {totalCount}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    statusFilter === 'all' ? 'text-white/80' : 'text-[#5C6E5E]'
                  }`}
                >
                  Registered
                </span>
              </div>
              <div
                className={`mt-1 text-[11px] font-medium ${
                  statusFilter === 'all' ? 'text-[#DCE7D4]/90' : 'text-[#5C6E5E]'
                }`}
              >
                All partner profiles created
              </div>
            </button>

            {/* 2. Active Photographers */}
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`p-4 rounded-2xl border text-left transition relative cursor-pointer group active:scale-[0.99] ${
                statusFilter === 'active'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/40'
                  : 'bg-emerald-50/60 text-emerald-950 border-emerald-200/80 hover:border-emerald-400 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-extrabold uppercase tracking-wider ${
                    statusFilter === 'active' ? 'text-emerald-200' : 'text-emerald-700'
                  }`}
                >
                  Active
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-3xl sm:text-4xl font-black font-['Space_Grotesk',sans-serif] tracking-tight ${
                    statusFilter === 'active' ? 'text-white' : 'text-emerald-800'
                  }`}
                >
                  {activeCount}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    statusFilter === 'active' ? 'text-white/80' : 'text-emerald-700'
                  }`}
                >
                  Bookable
                </span>
              </div>
              <div
                className={`mt-1 text-[11px] font-medium ${
                  statusFilter === 'active' ? 'text-emerald-100/90' : 'text-emerald-700'
                }`}
              >
                Live on client calendar
              </div>
            </button>

            {/* 3. On Hold / Paused Photographers */}
            <button
              type="button"
              onClick={() => setStatusFilter('on_hold')}
              className={`p-4 rounded-2xl border text-left transition relative cursor-pointer group active:scale-[0.99] ${
                statusFilter === 'on_hold'
                  ? 'bg-amber-800 text-white border-amber-900 shadow-md ring-2 ring-amber-500/40'
                  : 'bg-amber-50/60 text-amber-950 border-amber-200/80 hover:border-amber-400 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-extrabold uppercase tracking-wider ${
                    statusFilter === 'on_hold' ? 'text-amber-200' : 'text-amber-700'
                  }`}
                >
                  On Hold / Paused
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-3xl sm:text-4xl font-black font-['Space_Grotesk',sans-serif] tracking-tight ${
                    statusFilter === 'on_hold' ? 'text-white' : 'text-amber-800'
                  }`}
                >
                  {onHoldCount}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    statusFilter === 'on_hold' ? 'text-white/80' : 'text-amber-700'
                  }`}
                >
                  Paused
                </span>
              </div>
              <div
                className={`mt-1 text-[11px] font-medium ${
                  statusFilter === 'on_hold' ? 'text-amber-100/90' : 'text-amber-700'
                }`}
              >
                Pending review or paused
              </div>
            </button>
          </div>

          {/* Search Bar & Active Filter Label */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-xs font-semibold text-[#5C6E5E] flex items-center gap-1.5">
              <span>Showing:</span>
              <span className="font-bold text-[#073B2F] capitalize">
                {statusFilter === 'all'
                  ? `All Registered (${filteredPhotographers.length})`
                  : statusFilter === 'active'
                  ? `Active Photographers (${filteredPhotographers.length})`
                  : `On Hold / Paused (${filteredPhotographers.length})`}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#5C6E5E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, city, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-[#F6F3EC] border border-[#DCE7D4] rounded-xl text-xs font-medium text-[#073B2F] focus:outline-none focus:border-[#073B2F] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Photographers List */}
        <div className="p-4 sm:p-6 space-y-3 max-h-[58vh] overflow-y-auto">
          {filteredPhotographers.length === 0 ? (
            <div className="text-center py-12 px-4 bg-[#F6F3EC] rounded-2xl border border-[#DCE7D4]">
              <Users className="w-10 h-10 text-[#5C6E5E]/40 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#073B2F]">No photographers match your filter</h4>
              <p className="text-xs text-[#5C6E5E] mt-0.5">
                Try clearing your search query or selecting a different status filter.
              </p>
            </div>
          ) : (
            filteredPhotographers.map((p) => {
              const isActive = p.status !== 'on_hold';
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !isActive
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-white border-[#DCE7D4] hover:border-[#073B2F]/40'
                  }`}
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-13 h-13 rounded-2xl object-cover border border-[#DCE7D4] shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${
                          p.avatarColor || 'from-[#073B2F] to-[#125847]'
                        } text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0`}
                      >
                        {p.name[0]}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#073B2F] truncate">{p.name}</h4>
                        {isActive ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#073B2F]" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
                            <Pause className="w-2.5 h-2.5 fill-current" />
                            <span>On Hold / Paused</span>
                          </span>
                        )}
                        {p.registeredAt && (
                          <span className="text-[10px] text-[#5C6E5E] font-mono">
                            Registered: {new Date(p.registeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#073B2F] font-medium truncate mt-0.5">
                        {p.title}
                      </p>

                      <div className="flex items-center gap-2.5 text-[11px] text-[#5C6E5E] mt-1 font-medium flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#5C6E5E]" />
                          {p.city}
                        </span>
                        <span>•</span>
                        <span>{p.experienceYears}+ yrs exp</span>
                        <span>•</span>
                        <span>{p.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => onViewDetails(p)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F6F3EC] border border-[#DCE7D4] text-[#073B2F] text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                      title="View all details entered by photographer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#073B2F]" />
                      <span>Details</span>
                    </button>

                    {/* Status Toggle Button: Active vs On Hold */}
                    <button
                      type="button"
                      onClick={() => onToggleStatus(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 ${
                        isActive
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                          : 'bg-[#073B2F] hover:bg-[#0c4e3f] text-white'
                      }`}
                      title={isActive ? 'Pause / Hold this photographer' : 'Set active for client bookings'}
                    >
                      {isActive ? (
                        <>
                          <Pause className="w-3 h-3 fill-current" />
                          <span>Hold</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>

                    {/* View in Calendar */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectInCalendar(p.id);
                        onClose();
                      }}
                      className="p-1.5 rounded-xl bg-[#F6F3EC] hover:bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] transition cursor-pointer"
                      title="Open schedule in calendar"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Profile */}
                    <button
                      type="button"
                      onClick={() => onDeleteProfile(p.id)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                      title="Delete photographer profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F6F3EC] border-t border-[#DCE7D4] flex items-center justify-between text-xs text-[#5C6E5E]">
          <span>
            {totalCount} total registered photographer{totalCount > 1 ? 's' : ''} ({onHoldCount} on hold/paused)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-stone-50 border border-[#DCE7D4] text-[#073B2F] font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
