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
import { ShootLobbyLogo } from './ShootLobbyLogo';

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
      className="bg-white border border-[#E3EEE7] rounded-3xl p-4 sm:p-6 text-[#12201A] shadow-sm space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E3EEE7] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3EEE7] text-[#33684C] border border-[#33684C]/20 text-xs font-bold mb-1">
            <span>Monthly Shoot Days & Guys Availability Search</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#12201A] tracking-tight font-headline">
            Check How Many Days the Guys Are Booked & Available
          </h2>
          <p className="text-xs text-[#5C6E5E]">
            Search shoot days in current, previous months, or past 2 months across Delhi NCR and network photographers.
          </p>
        </div>

        {/* View Scope Toggle (Single Month vs Past 2 Months Comparison) */}
        <div className="flex items-center bg-[#F6F3EC] p-1 rounded-2xl border border-[#E3EEE7] text-xs shrink-0">
          <button
            type="button"
            onClick={() => setViewScope('single')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              viewScope === 'single'
                ? 'bg-[#33684C] text-white shadow-xs'
                : 'text-[#5C6E5E] hover:text-[#12201A]'
            }`}
          >
            Month Breakdown
          </button>
          <button
            type="button"
            onClick={() => setViewScope('two_months')}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              viewScope === 'two_months'
                ? 'bg-[#33684C] text-white shadow-xs'
                : 'text-[#5C6E5E] hover:text-[#12201A]'
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
          <span className="text-xs font-bold text-[#5C6E5E] shrink-0">Month:</span>
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 border cursor-pointer ${
                viewScope === 'single' && selectedMonthOffset === tab.offset
                  ? 'bg-[#33684C] text-white border-[#33684C] shadow-xs'
                  : 'bg-[#F6F3EC] text-[#12201A] border-[#E3EEE7] hover:border-[#33684C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input for Photographer Name or City */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6E5E]" />
          <input
            type="text"
            placeholder="Search guy by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F6F3EC] border border-[#E3EEE7] focus:border-[#33684C] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#12201A] placeholder-[#5C6E5E]/70 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5C6E5E] hover:text-[#12201A] text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Metric Banner for the Selected Month */}
      {viewScope === 'single' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#F6F3EC] border border-[#E3EEE7]">
          {/* 1. Booked Shoot Days in Coral/Amber */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6E5E]">
                Booked Shoot Days ({targetMonthName})
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-800 font-mono">
                {teamTotals.totalBooked} <span className="text-xs font-normal text-[#5C6E5E]">days</span>
              </div>
            </div>
          </div>

          {/* 2. Available Days in Lobby Green */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E3EEE7] text-[#33684C] border border-[#33684C]/20 flex items-center justify-center font-bold">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6E5E]">
                Available Days ({targetMonthName})
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#33684C] font-mono">
                {teamTotals.totalAvailable} <span className="text-xs font-normal text-[#5C6E5E]">days</span>
              </div>
            </div>
          </div>

          {/* 3. Verified Shoots on Record */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#33684C] border border-[#E3EEE7] flex items-center justify-center font-bold shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-[#33684C]" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6E5E]">
                Client Shoots on Record
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#12201A] font-mono">
                {teamTotals.totalShoots} <span className="text-xs font-normal text-[#5C6E5E]">shoots</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW A: Single Month Breakdown per Photographer */}
      {viewScope === 'single' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#5C6E5E] px-1">
            <span>
              Showing data for <strong className="text-[#33684C]">{targetMonthName} {targetYear}</strong> ({filteredPhotographers.length} photographers)
            </span>
            <span className="text-[11px] flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <strong className="text-[#12201A]">Amber = Booked</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#33684C]" />
                <strong className="text-[#12201A]">Green = Available</strong>
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
                      ? 'bg-[#E3EEE7]/50 border-[#33684C] ring-1 ring-[#33684C]/30'
                      : 'bg-[#F6F3EC]/50 border-[#E3EEE7] hover:border-[#33684C]'
                  }`}
                >
                  {/* Top Bar: Photographer & Location */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#12201A] font-headline">{p.name}</h4>
                        {isActive && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-[#33684C] text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5C6E5E] flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#5C6E5E]" />
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
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#E3EEE7] text-xs font-bold text-[#33684C] border border-[#E3EEE7] hover:border-[#33684C] flex items-center gap-1 transition shadow-2xs cursor-pointer"
                      title="Open this month on the calendar above"
                    >
                      <span>View Calendar</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Days Booked vs Available Breakdown Card */}
                  <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-[#E3EEE7]">
                    {/* Booked Days */}
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#5C6E5E]">Booked Days</div>
                        <div className="text-base font-black text-amber-800 font-mono">
                          {stats.booked} <span className="text-[10px] font-normal text-[#5C6E5E]">/ {stats.daysInM}</span>
                        </div>
                      </div>
                    </div>

                    {/* Available Days */}
                    <div className="flex items-center gap-2.5 border-l border-[#E3EEE7] pl-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#33684C] shrink-0" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#5C6E5E]">Available Days</div>
                        <div className="text-base font-black text-[#33684C] font-mono">
                          {stats.available} <span className="text-[10px] font-normal text-[#5C6E5E]">days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ratio bar */}
                  <div>
                    <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden flex">
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${(stats.booked / stats.daysInM) * 100}%` }}
                        title={`${stats.booked} days booked`}
                      />
                      <div
                        className="bg-[#33684C] h-full"
                        style={{ width: `${(stats.available / stats.daysInM) * 100}%` }}
                        title={`${stats.available} days available`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[#5C6E5E] mt-1">
                      <span className="text-amber-800">{Math.round((stats.booked / stats.daysInM) * 100)}% Booked</span>
                      <span className="text-[#33684C]">{Math.round((stats.available / stats.daysInM) * 100)}% Available</span>
                    </div>
                  </div>

                  {/* Shoots list in this month */}
                  {stats.shoots.length > 0 && (
                    <div className="border-t border-[#E3EEE7] pt-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#5C6E5E] font-bold block mb-1">
                        Booked Shoots in {targetMonthName}:
                      </span>
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {stats.shoots.map((s) => (
                          <div
                            key={s.id}
                            className="text-[11px] bg-white px-2.5 py-1 rounded-lg border border-[#E3EEE7] flex items-center justify-between shadow-2xs"
                          >
                            <span className="font-semibold text-[#12201A] truncate max-w-[180px]">
                              {s.clientName} ({s.shootType})
                            </span>
                            <span className="font-mono text-amber-800 text-[10px] shrink-0 font-bold">
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
          <div className="flex items-center justify-between text-xs text-[#5C6E5E] px-1">
            <span>
              Comparing shoot days across <strong className="text-[#33684C]">{monthNames[prevMonth2Date.getMonth()]}</strong> and <strong className="text-[#33684C]">{monthNames[prevMonth1Date.getMonth()]}</strong>
            </span>
            <span className="text-xs text-[#33684C] font-mono font-bold">
              Past 2 Months History
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E3EEE7] bg-white shadow-2xs">
            <table className="w-full text-left text-xs text-[#12201A]">
              <thead className="bg-[#F6F3EC] border-b border-[#E3EEE7] text-[11px] uppercase tracking-wider text-[#5C6E5E]">
                <tr>
                  <th className="p-3 font-bold">Photographer</th>
                  <th className="p-3 font-bold text-center">
                    {monthNames[prevMonth2Date.getMonth()]} ({prevMonth2Date.getFullYear()})
                  </th>
                  <th className="p-3 font-bold text-center">
                    {monthNames[prevMonth1Date.getMonth()]} ({prevMonth1Date.getFullYear()})
                  </th>
                  <th className="p-3 font-bold text-center text-[#12201A]">
                    Total 2-Mo Booked
                  </th>
                  <th className="p-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EEE7]">
                {filteredPhotographers.map((p) => {
                  const m2Stats = getMonthStats(p.id, prevMonth2Date.getFullYear(), prevMonth2Date.getMonth());
                  const m1Stats = getMonthStats(p.id, prevMonth1Date.getFullYear(), prevMonth1Date.getMonth());
                  const totalTwoMonthsBooked = m2Stats.booked + m1Stats.booked;

                  return (
                    <tr key={p.id} className="hover:bg-[#F6F3EC]/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-[#12201A]">{p.name}</div>
                        <div className="text-[10px] text-[#5C6E5E]">{p.city} • {p.title}</div>
                      </td>

                      {/* Month -2 stats */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-amber-800 font-bold font-mono">
                            {m2Stats.booked} Booked
                          </span>
                          <span className="text-stone-400">/</span>
                          <span className="text-[#33684C] font-mono">
                            {m2Stats.available} Avail
                          </span>
                        </div>
                      </td>

                      {/* Month -1 stats */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-amber-800 font-bold font-mono">
                            {m1Stats.booked} Booked
                          </span>
                          <span className="text-stone-400">/</span>
                          <span className="text-[#33684C] font-mono">
                            {m1Stats.available} Avail
                          </span>
                        </div>
                      </td>

                      {/* Combined 2-Month Total Booked */}
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono font-black text-xs inline-block">
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
                          className="px-2.5 py-1 rounded-lg bg-[#F6F3EC] hover:bg-[#E3EEE7] text-[#33684C] border border-[#E3EEE7] hover:border-[#33684C] text-xs font-semibold inline-flex items-center gap-1 transition shadow-2xs cursor-pointer"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3 text-[#33684C]" />
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
