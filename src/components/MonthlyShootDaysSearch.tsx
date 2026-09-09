import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  User,
  Filter,
} from 'lucide-react';
import { PhotographerProfile, DayStatus, ShootBooking } from '../types';
import { formatDateKey } from '../utils/storage';

interface MonthlyShootDaysSearchProps {
  photographers: PhotographerProfile[];
  activePhotographerId: string;
  onSelectPhotographer: (id: string) => void;
  availability: Record<string, Record<string, DayStatus>>;
  shoots: ShootBooking[];
  onNavigateCalendarMonth: (year: number, monthIndex: number) => void;
}

export const MonthlyShootDaysSearch: React.FC<MonthlyShootDaysSearchProps> = ({
  photographers,
  activePhotographerId,
  onSelectPhotographer,
  availability,
  shoots,
  onNavigateCalendarMonth,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Selected query mode: single month or 2-month summary
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewScope, setViewScope] = useState<'single' | 'two_months'>('single');

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Helper to compute booked and available days for a photographer in a specific month
  const getMonthStats = (photogId: string, year: number, monthIdx: number) => {
    const daysInM = new Date(year, monthIdx + 1, 0).getDate();
    const pAvail = availability[photogId] || {};
    let booked = 0;
    let available = 0;

    for (let d = 1; d <= daysInM; d++) {
      const dKey = formatDateKey(new Date(year, monthIdx, d));
      const st = pAvail[dKey] || 'available';
      if (st === 'booked') booked++;
      else available++;
    }

    // Shoots in this month
    const monthPrefix = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
    const monthShoots = shoots.filter(
      (s) => s.photographerId === photogId && s.date.startsWith(monthPrefix)
    );

    return { daysInM, booked, available, shoots: monthShoots };
  };

  // Determine target month from offset
  const targetDate = new Date(currentYear, currentMonth + selectedMonthOffset, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonthIdx = targetDate.getMonth();
  const targetMonthName = monthNames[targetMonthIdx];

  // Also previous 2 months dates for two_months view
  const prevMonth1Date = new Date(currentYear, currentMonth - 1, 1);
  const prevMonth2Date = new Date(currentYear, currentMonth - 2, 1);

  // Filter photographers based on search query
  const filteredPhotographers = photographers.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.specialties.some((s) => s.toLowerCase().includes(q))
    );
  });

  // Calculate totals across filtered photographers for selected month
  const teamTotals = filteredPhotographers.reduce(
    (acc, p) => {
      const stats = getMonthStats(p.id, targetYear, targetMonthIdx);
      acc.totalBooked += stats.booked;
      acc.totalAvailable += stats.available;
      acc.totalShoots += stats.shoots.length;
      return acc;
    },
    { totalBooked: 0, totalAvailable: 0, totalShoots: 0 }
  );

  return (
    <div
      id="monthly-shoot-days-search-root"
      className="bg-[#0b1733] border border-[#1d3870] rounded-3xl p-4 sm:p-6 text-stone-100 shadow-xl space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#182f5e] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4f770]/10 text-[#d4f770] border border-[#d4f770]/30 text-xs font-bold mb-1">
            <Camera className="w-3.5 h-3.5" />
            <span>Monthly Shoot Days & Guys Availability Search</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Check How Many Days the Guys Are Booked & Available
          </h2>
          <p className="text-xs text-stone-400">
            Search shoot days in current, previous months, or past 2 months across Delhi NCR and network photographers.
          </p>
        </div>

        {/* View Scope Toggle (Single Month vs Past 2 Months Comparison) */}
        <div className="flex items-center bg-[#060e22] p-1 rounded-2xl border border-[#1d3870] text-xs shrink-0">
          <button
            type="button"
            onClick={() => setViewScope('single')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              viewScope === 'single'
                ? 'bg-[#d4f770] text-[#0a152e] shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Month Breakdown
          </button>
          <button
            type="button"
            onClick={() => setViewScope('two_months')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              viewScope === 'two_months'
                ? 'bg-[#d4f770] text-[#0a152e] shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Past 2 Months Search
          </button>
        </div>
      </div>

      {/* Month Filter Selector Tabs & Search Input */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Quick Month Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-stone-400 shrink-0">Month:</span>
          {[
            { label: `Current (${monthNames[currentMonth].slice(0, 3)})`, offset: 0 },
            { label: `Last Month (${monthNames[(currentMonth - 1 + 12) % 12].slice(0, 3)})`, offset: -1 },
            { label: `2 Mo Ago (${monthNames[(currentMonth - 2 + 12) % 12].slice(0, 3)})`, offset: -2 },
            { label: `3 Mo Ago (${monthNames[(currentMonth - 3 + 12) % 12].slice(0, 3)})`, offset: -3 },
            { label: `Next (${monthNames[(currentMonth + 1) % 12].slice(0, 3)})`, offset: 1 },
          ].map((tab) => (
            <button
              key={tab.offset}
              type="button"
              onClick={() => {
                setSelectedMonthOffset(tab.offset);
                setViewScope('single');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border ${
                viewScope === 'single' && selectedMonthOffset === tab.offset
                  ? 'bg-[#d4f770] text-[#0a152e] border-[#d4f770] shadow-sm font-black'
                  : 'bg-[#060e22] text-stone-300 border-[#1d3870] hover:border-stone-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input for Photographer Name or City */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search guy by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#060e22] border border-[#1d3870] focus:border-[#d4f770] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Metric Banner for the Selected Month */}
      {viewScope === 'single' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#060e22] border border-[#1b3466]">
          {/* 1. Booked Shoot Days in Green */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4f770]/20 text-[#d4f770] border border-[#d4f770]/40 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Booked Shoot Days ({targetMonthName})
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#d4f770] font-mono">
                {teamTotals.totalBooked} <span className="text-xs font-normal text-stone-300">days</span>
              </div>
            </div>
          </div>

          {/* 2. Available Days in White */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white border border-white/30 flex items-center justify-center font-bold">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Available Days ({targetMonthName})
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {teamTotals.totalAvailable} <span className="text-xs font-normal text-stone-300">days</span>
              </div>
            </div>
          </div>

          {/* 3. Verified Shoots on Record */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#112349] text-stone-200 border border-[#1e3b78] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5 text-[#d4f770]" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Client Shoots on Record
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {teamTotals.totalShoots} <span className="text-xs font-normal text-stone-300">shoots</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW A: Single Month Breakdown per Photographer */}
      {viewScope === 'single' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <span>
              Showing data for <strong className="text-white">{targetMonthName} {targetYear}</strong> ({filteredPhotographers.length} photographers)
            </span>
            <span className="text-[11px] flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4f770]" />
                <strong className="text-stone-300">Green = Booked</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <strong className="text-stone-300">White = Available</strong>
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPhotographers.map((p) => {
              const stats = getMonthStats(p.id, targetYear, targetMonthIdx);
              const isActive = p.id === activePhotographerId;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition relative flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-[#060e22] border-[#d4f770]/60 ring-1 ring-[#d4f770]/30'
                      : 'bg-[#060e22]/90 border-[#182f5e] hover:border-[#1d3870]'
                  }`}
                >
                  {/* Top Bar: Photographer & Location */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{p.name}</h4>
                        {isActive && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-[#d4f770] text-[#0a152e]">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#d4f770]" />
                        <span>{p.city}</span>
                        <span>•</span>
                        <span>{p.title}</span>
                      </p>
                    </div>

                    {/* Button to open on calendar */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPhotographer(p.id);
                        onNavigateCalendarMonth(targetYear, targetMonthIdx);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-[#0b1733] hover:bg-[#112349] text-xs font-bold text-[#d4f770] border border-[#1d3870] hover:border-[#d4f770]/40 flex items-center gap-1 transition"
                      title="Open this month on the calendar above"
                    >
                      <span>View Calendar</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Days Booked vs Available Breakdown Card */}
                  <div className="grid grid-cols-2 gap-2 bg-[#0b1733] p-3 rounded-xl border border-[#182f5e]">
                    {/* Booked Days - Highlighted Green */}
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#d4f770] shrink-0 shadow-[0_0_6px_#d4f770]" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-stone-400">Booked Days</div>
                        <div className="text-base font-black text-[#d4f770] font-mono">
                          {stats.booked} <span className="text-[10px] font-normal text-stone-400">/ {stats.daysInM}</span>
                        </div>
                      </div>
                    </div>

                    {/* Available Days - Highlighted White */}
                    <div className="flex items-center gap-2.5 border-l border-[#182f5e] pl-2.5">
                      <span className="w-3 h-3 rounded-full bg-white shrink-0 shadow-[0_0_6px_white]" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-stone-400">Available Days</div>
                        <div className="text-base font-black text-white font-mono">
                          {stats.available} <span className="text-[10px] font-normal text-stone-400">days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ratio bar */}
                  <div>
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden flex">
                      <div
                        className="bg-[#d4f770] h-full"
                        style={{ width: `${(stats.booked / stats.daysInM) * 100}%` }}
                        title={`${stats.booked} days booked`}
                      />
                      <div
                        className="bg-white h-full"
                        style={{ width: `${(stats.available / stats.daysInM) * 100}%` }}
                        title={`${stats.available} days available`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-1">
                      <span className="text-[#d4f770]">{Math.round((stats.booked / stats.daysInM) * 100)}% Booked</span>
                      <span className="text-white">{Math.round((stats.available / stats.daysInM) * 100)}% Available</span>
                    </div>
                  </div>

                  {/* Shoots list in this month */}
                  {stats.shoots.length > 0 && (
                    <div className="border-t border-[#182f5e] pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block mb-1">
                        Booked Shoots in {targetMonthName}:
                      </span>
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {stats.shoots.map((s) => (
                          <div
                            key={s.id}
                            className="text-[11px] bg-[#0b1733] px-2.5 py-1 rounded-lg border border-[#182f5e] flex items-center justify-between"
                          >
                            <span className="font-semibold text-stone-200 truncate max-w-[180px]">
                              {s.clientName} ({s.shootType})
                            </span>
                            <span className="font-mono text-[#d4f770] text-[10px] shrink-0 font-bold">
                              {s.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW B: Multi-Month Search & Comparison Table (Past 2 Months) */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <span>
              Comparing shoot days across <strong className="text-white">{monthNames[prevMonth2Date.getMonth()]}</strong> and <strong className="text-white">{monthNames[prevMonth1Date.getMonth()]}</strong>
            </span>
            <span className="text-xs text-[#d4f770] font-mono">
              Past 2 Months History
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#182f5e] bg-[#060e22]">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-[#0b1733] border-b border-[#182f5e] text-[11px] uppercase tracking-wider text-stone-400">
                <tr>
                  <th className="p-3 font-bold">Photographer</th>
                  <th className="p-3 font-bold text-center">
                    {monthNames[prevMonth2Date.getMonth()]} ({prevMonth2Date.getFullYear()})
                  </th>
                  <th className="p-3 font-bold text-center">
                    {monthNames[prevMonth1Date.getMonth()]} ({prevMonth1Date.getFullYear()})
                  </th>
                  <th className="p-3 font-bold text-center text-[#d4f770]">
                    Total 2-Mo Booked
                  </th>
                  <th className="p-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182f5e]">
                {filteredPhotographers.map((p) => {
                  const m2Stats = getMonthStats(p.id, prevMonth2Date.getFullYear(), prevMonth2Date.getMonth());
                  const m1Stats = getMonthStats(p.id, prevMonth1Date.getFullYear(), prevMonth1Date.getMonth());
                  const totalTwoMonthsBooked = m2Stats.booked + m1Stats.booked;

                  return (
                    <tr key={p.id} className="hover:bg-[#0b1733]/70 transition">
                      <td className="p-3">
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-stone-400">{p.city} • {p.title}</div>
                      </td>

                      {/* Month -2 stats */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[#d4f770] font-bold font-mono">
                            {m2Stats.booked} Booked
                          </span>
                          <span className="text-stone-600">/</span>
                          <span className="text-white font-mono">
                            {m2Stats.available} Avail
                          </span>
                        </div>
                      </td>

                      {/* Month -1 stats */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[#d4f770] font-bold font-mono">
                            {m1Stats.booked} Booked
                          </span>
                          <span className="text-stone-600">/</span>
                          <span className="text-white font-mono">
                            {m1Stats.available} Avail
                          </span>
                        </div>
                      </td>

                      {/* Combined 2-Month Total Booked */}
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-[#d4f770]/15 text-[#d4f770] border border-[#d4f770]/40 font-mono font-black text-xs inline-block">
                          {totalTwoMonthsBooked} Shoot Days
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectPhotographer(p.id);
                            onNavigateCalendarMonth(prevMonth1Date.getFullYear(), prevMonth1Date.getMonth());
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#0b1733] hover:bg-[#112349] text-stone-200 border border-[#1d3870] hover:border-[#d4f770]/40 text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3 text-[#d4f770]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
