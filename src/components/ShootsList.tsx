import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Phone,
  Search,
  Filter,
  MessageCircle,
  ExternalLink,
  User,
  Clock,
  Link as LinkIcon,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { ShootBooking, PhotographerProfile } from '../types';
import { formatDateDayMonth } from '../utils/storage';

interface ShootsListProps {
  shoots: ShootBooking[];
  photographers: PhotographerProfile[];
  activePhotographerId: string;
  onSelectShootDate: (photographerId: string, date: string) => void;
  onUpdateShootStatus?: (shootId: string, status: ShootBooking['status']) => void;
  isAdmin?: boolean;
}

export const ShootsList: React.FC<ShootsListProps> = ({
  shoots,
  photographers,
  activePhotographerId,
  onSelectShootDate,
  onUpdateShootStatus,
  isAdmin = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhotographerFilter, setSelectedPhotographerFilter] =
    useState<string>(activePhotographerId);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // If not admin, strictly lock filter to activePhotographerId
  const effectivePhotographerFilter = isAdmin ? selectedPhotographerFilter : activePhotographerId;

  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Filtered shoots for list display
  const filteredShoots = shoots
    .filter((s) => {
      const matchesPhotographer =
        effectivePhotographerFilter === 'all' || s.photographerId === effectivePhotographerFilter;

      const matchesStatus =
        statusFilter === 'all' || s.status === statusFilter;

      const clientName = s.clientName || '';
      const shootType = s.shootType || '';
      const cityVenue = s.cityVenue || '';
      const brief = s.shootBrief || '';

      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shootType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cityVenue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brief.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.date.includes(searchTerm);

      return matchesPhotographer && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      // Latest booking comes first:
      // 1. Most recently created/booked first (newest createdAt timestamp)
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      // 2. Fallback to latest shoot date first (descending)
      return b.date.localeCompare(a.date);
    });

  // Shoots scoped for metric statistics (based on photographer filter)
  const scopedShoots = shoots.filter((s) =>
    selectedPhotographerFilter === 'all' ? true : s.photographerId === selectedPhotographerFilter
  );

  // 1. Booked shoots this month
  const bookedThisMonthCount = scopedShoots.filter((s) =>
    s.date.startsWith(currentMonthPrefix)
  ).length;

  // 2. Active shoots (confirmed or in_progress)
  const activeShootsCount = scopedShoots.filter(
    (s) => s.status === 'confirmed' || s.status === 'in_progress'
  ).length;

  // 3. Shoots done / completed
  const shootsCompletedCount = scopedShoots.filter((s) => s.status === 'completed').length;

  const currentPhotographerName =
    selectedPhotographerFilter === 'all'
      ? 'All Photographers'
      : photographers.find((p) => p.id === selectedPhotographerFilter)?.name || 'Photographer';

  return (
    <div id="shoots-registry-wrapper" className="space-y-5">
      {/* Top Metric Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Booked Shoots This Month */}
        <div
          id="stat-booked-this-month"
          className="bg-white border border-[#DCE7D4] hover:border-[#073B2F]/40 rounded-3xl p-5 text-[#073B2F] transition shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#5C6E5E] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6E5E]">
              Booked This Month
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F0FFDA] flex items-center justify-center text-[#073B2F]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#073B2F]">
              {bookedThisMonthCount}
            </span>
            <span className="text-xs text-[#5C6E5E]">shoots booked</span>
          </div>
          <p className="text-[11px] text-[#5C6E5E] mt-2">
            {currentMonthName} • <span className="text-[#073B2F] font-semibold">{currentPhotographerName}</span>
          </p>
        </div>

        {/* Metric 2: Active Shoots */}
        <div
          id="stat-active-shoots"
          className="bg-white border border-[#DCE7D4] hover:border-[#FF6A45]/40 rounded-3xl p-5 text-[#073B2F] transition shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#5C6E5E] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6E5E]">
              Active Shoots
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF4EE] flex items-center justify-center text-[#FF6A45]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#FF6A45]">
              {activeShootsCount}
            </span>
            <span className="text-xs text-[#5C6E5E]">upcoming / in prep</span>
          </div>
          <p className="text-[11px] text-[#5C6E5E] mt-2">
            Confirmed ceremonies & live projects
          </p>
        </div>

        {/* Metric 3: Shoots Done / Completed */}
        <div
          id="stat-shoots-completed"
          className="bg-white border border-[#DCE7D4] hover:border-[#073B2F]/40 rounded-3xl p-5 text-[#073B2F] transition shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#5C6E5E] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6E5E]">
              Shoots Done
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#073B2F]">
              {shootsCompletedCount}
            </span>
            <span className="text-xs text-[#5C6E5E]">completed</span>
          </div>
          <p className="text-[11px] text-[#5C6E5E] mt-2">
            Successfully delivered & finished shoots
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#5C6E5E] absolute left-3.5 top-3" />
          <input
            id="input-search-shoots"
            type="text"
            placeholder="Search by client name, ceremony, venue, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#DCE7D4] rounded-2xl pl-10 pr-3 py-2.5 text-xs text-[#073B2F] placeholder-[#5C6E5E]/60 focus:outline-none focus:border-[#073B2F]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#DCE7D4] shrink-0">
          <span className="text-xs text-[#5C6E5E] pl-3 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-[#073B2F] py-1.5 px-2 focus:outline-none cursor-pointer font-bold"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed (Done)</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Photographer Filter - Only visible to admin */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#DCE7D4] shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#5C6E5E] ml-3" />
            <select
              value={selectedPhotographerFilter}
              onChange={(e) => setSelectedPhotographerFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-[#073B2F] py-1.5 px-2 focus:outline-none cursor-pointer font-bold"
            >
              <option value="all">All Photographers ({shoots.length})</option>
              {photographers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Shoots Grid */}
      {filteredShoots.length === 0 ? (
        <div className="bg-white border border-[#DCE7D4] rounded-3xl p-12 text-center text-[#5C6E5E]">
          <Calendar className="w-10 h-10 text-[#5C6E5E] mx-auto mb-3 stroke-1" />
          <h3 className="text-sm font-semibold text-[#073B2F]">No shoot records found</h3>
          <p className="text-xs text-[#5C6E5E] mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'Try different search keywords or adjust the photographer/status filter.'
              : 'When dates are booked, client records will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShoots.map((shoot) => {
            const photog = photographers.find((p) => p.id === shoot.photographerId);

            return (
              <div
                key={shoot.id}
                id={`shoot-card-${shoot.id}`}
                className="bg-white border border-[#DCE7D4] hover:border-[#073B2F]/40 rounded-3xl p-5 text-[#073B2F] transition shadow-xs flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  {/* Top Bar: Date & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#FF6A45] font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateDayMonth(shoot.date)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {onUpdateShootStatus ? (
                        <select
                          value={shoot.status || 'confirmed'}
                          onChange={(e) =>
                            onUpdateShootStatus(shoot.id, e.target.value as ShootBooking['status'])
                          }
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                            shoot.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : shoot.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : shoot.status === 'cancelled'
                              ? 'bg-stone-100 text-stone-600 border-stone-300'
                              : 'bg-[#F0FFDA] text-[#073B2F] border-[#DCE7D4]'
                          }`}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed (Done)</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                            shoot.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-[#F0FFDA] text-[#073B2F] border-[#DCE7D4]'
                          }`}
                        >
                          {shoot.status === 'completed' ? 'Completed' : 'Booked'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Client & Shoot Type */}
                  <div>
                    <h3 className="text-base font-bold text-[#073B2F] line-clamp-1 group-hover:text-[#FF6A45] transition-colors font-['Space_Grotesk',sans-serif]">
                      {shoot.clientName || 'Direct Booking'}
                    </h3>
                    {shoot.shootType && (
                      <div className="text-xs text-[#FF6A45] font-semibold mt-0.5">
                        {shoot.shootType}
                      </div>
                    )}
                  </div>

                  {/* Photographer Assigned */}
                  {photog && (
                    <div className="text-xs text-[#5C6E5E] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#073B2F] shrink-0" />
                      <span className="truncate">
                        Photographer: <strong className="text-[#073B2F]">{photog.name}</strong>
                      </span>
                    </div>
                  )}

                  {/* Timing */}
                  {(shoot.timingStart || shoot.timingEnd) && (
                    <div className="text-xs text-[#5C6E5E] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#073B2F] shrink-0" />
                      <span className="font-mono">
                        {shoot.timingStart && shoot.timingEnd
                          ? `${shoot.timingStart} - ${shoot.timingEnd}`
                          : shoot.timingStart || shoot.timingEnd}
                      </span>
                    </div>
                  )}

                  {/* Location / Venue */}
                  {shoot.cityVenue && (
                    <div className="text-xs text-[#5C6E5E] flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#5C6E5E] shrink-0" />
                      <span className="truncate">{shoot.cityVenue}</span>
                    </div>
                  )}

                  {/* Mood Board Link */}
                  {shoot.moodBoardUrl && (
                    <div className="text-xs text-[#073B2F] flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                      <a
                        href={shoot.moodBoardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline truncate max-w-[220px] font-semibold"
                      >
                        Mood Board: {shoot.moodBoardUrl}
                      </a>
                    </div>
                  )}

                  {/* Shoot Brief */}
                  {shoot.shootBrief && (
                    <div className="text-[11px] text-[#073B2F] bg-[#F6F3EC] p-2.5 rounded-xl border border-[#DCE7D4]">
                      <span className="text-[#5C6E5E] block text-[10px] uppercase font-bold tracking-wider">Brief:</span>
                      <p className="line-clamp-2 italic text-[#073B2F]">"{shoot.shootBrief}"</p>
                    </div>
                  )}
                </div>

                {/* Footer Connect Actions */}
                <div className="mt-4 pt-3.5 border-t border-[#DCE7D4] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {shoot.clientPhone && (
                      <>
                        <a
                          href={`https://wa.me/${shoot.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${shoot.clientName}, regarding your ${shoot.shootType || 'shoot'} on ${shoot.date} at ${shoot.cityVenue || ''}. Booked via Shoot Lobby.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-[#F0FFDA] hover:bg-[#e4fabc] text-[#073B2F] border border-[#DCE7D4] text-[11px] font-bold inline-flex items-center gap-1.5 transition"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#073B2F]" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${shoot.clientPhone}`}
                          className="p-2 rounded-xl bg-[#F6F3EC] hover:bg-stone-200 text-[#073B2F] border border-[#DCE7D4] transition"
                          title={`Call ${shoot.clientPhone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectShootDate(shoot.photographerId, shoot.date)}
                    className="text-xs text-[#073B2F] hover:text-[#FF6A45] font-bold inline-flex items-center gap-1 transition"
                  >
                    <span>View Calendar</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
