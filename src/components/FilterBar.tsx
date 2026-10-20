import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

export interface FilterOptions {
  searchQuery: string;
  timeSlot: 'all' | 'morning' | 'afternoon';
  day: 'all' | 'Sat' | 'Sun' | 'Mon' | 'Tue' | 'Wed';
  type: 'all' | 'theory' | 'lab';
  program: 'all' | 'BSCSE' | 'BSDS';
}

interface FilterBarProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  totalMatching: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalMatching
}) => {
  const isFiltered =
    filters.searchQuery !== '' ||
    filters.timeSlot !== 'all' ||
    filters.day !== 'all' ||
    filters.type !== 'all' ||
    filters.program !== 'all';

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      timeSlot: 'all',
      day: 'all',
      type: 'all',
      program: 'all'
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col gap-4">
      {/* Search Input Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search by Course Code or Title (e.g. CSE 4165, Web Programming, Machine Learning)..."
            className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono tabular-nums">
            {totalMatching} course{totalMatching !== 1 ? 's' : ''} found
          </span>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Badges & Selectors */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Time Segment */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setFilters(prev => ({ ...prev, timeSlot: 'all' }))}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filters.timeSlot === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Times
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, timeSlot: 'morning' }))}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filters.timeSlot === 'morning'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Morning (Before 12 PM)
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, timeSlot: 'afternoon' }))}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filters.timeSlot === 'afternoon'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Afternoon (After 12 PM)
          </button>
        </div>

        {/* Day Segment */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {(['all', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'] as const).map(d => (
            <button
              key={d}
              onClick={() => setFilters(prev => ({ ...prev, day: d }))}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                filters.day === d
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {d === 'all' ? 'All Days' : d}
            </button>
          ))}
        </div>

        {/* Type Segment: Theory vs Lab */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filters.type === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, type: 'theory' }))}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filters.type === 'theory'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Theory
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, type: 'lab' }))}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filters.type === 'lab'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Lab
          </button>
        </div>

        {/* Program Segment: BSCSE / BSDS */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          {(['all', 'BSCSE', 'BSDS'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilters(prev => ({ ...prev, program: p }))}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                filters.program === p
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {p === 'all' ? 'All Depts' : p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
