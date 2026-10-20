import React from 'react';
import { Calendar, Sun, Moon, Download, Upload, BookOpen, Users, Sparkles, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  currentTab: 'planner' | 'calendar' | 'faculty' | 'stats';
  setCurrentTab: (tab: 'planner' | 'calendar' | 'faculty' | 'stats') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenExport: () => void;
  onOpenUpload: () => void;
  selectedCount: number;
  totalCredits: number;
  conflictCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode,
  onOpenExport,
  onOpenUpload,
  selectedCount,
  totalCredits,
  conflictCount = 0
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Wordmark / Logo */}
          <div
            onClick={() => setCurrentTab('planner')}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shadow-orange-600/20 group-hover:bg-orange-500 transition-colors">
              UIU
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  <span className="hidden xs:inline">Fall 2026 Routine</span>
                  <span className="xs:hidden">Routine '26</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60 hidden sm:inline-block">
                  Planner
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Pre-Registration</span>
                <span aria-hidden="true">·</span>
                <span>Dept. of CSE &amp; SDS</span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links for Desktop (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCurrentTab('planner')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'planner'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-orange-500" />
              <span>Course Planner</span>
              {selectedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] tabular-nums font-bold">
                  {selectedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('calendar')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Weekly Routine</span>
              {conflictCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold animate-pulse">
                  !
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('faculty')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'faculty'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Faculty Directory</span>
            </button>

            <button
              onClick={() => setCurrentTab('stats')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'stats'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Summary ({totalCredits} Cr)</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Update Routine PDF Trigger */}
            <button
              onClick={onOpenUpload}
              title="Upload official UIU routine PDF"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              aria-label="Upload routine"
            >
              <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="hidden lg:inline">Update PDF</span>
            </button>

            {/* Dark Mode / Light Mode Functional Toggle Button */}
            <button
              type="button"
              onClick={() => setDarkMode(prev => !prev)}
              className="relative p-2 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 active:scale-95 transition-all shadow-2xs cursor-pointer flex items-center justify-center min-w-[38px] min-h-[38px]"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 -rotate-12 hover:rotate-0" />
              )}
            </button>

            {/* Export Routine as PDF Button */}
            <button
              onClick={onOpenExport}
              className="px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 active:scale-95 text-white transition-all shadow-sm shadow-orange-600/30 flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[38px]"
              title="Export routine as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Export PDF</span>
              <span className="xs:hidden">PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-1.5 px-3 flex items-center justify-around shadow-xl">
        {/* Planner Tab */}
        <button
          onClick={() => setCurrentTab('planner')}
          className={`flex-1 py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative ${
            currentTab === 'planner'
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <div className="relative">
            <BookOpen className="w-4 h-4" />
            {selectedCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 min-w-[14px] text-[9px] rounded-full bg-orange-500 text-white font-mono font-bold leading-none text-center">
                {selectedCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Planner</span>
        </button>

        {/* Calendar / Routine Tab */}
        <button
          onClick={() => setCurrentTab('calendar')}
          className={`flex-1 py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative ${
            currentTab === 'calendar'
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <div className="relative">
            <Calendar className="w-4 h-4" />
            {conflictCount > 0 ? (
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 min-w-[14px] text-[9px] rounded-full bg-rose-500 text-white font-mono font-bold leading-none text-center animate-pulse">
                !
              </span>
            ) : totalCredits > 0 ? (
              <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 text-[8px] rounded-full bg-emerald-500 text-white font-mono font-bold leading-none text-center">
                {totalCredits}Cr
              </span>
            ) : null}
          </div>
          <span className="text-[10px]">Routine</span>
        </button>

        {/* Faculty Tab */}
        <button
          onClick={() => setCurrentTab('faculty')}
          className={`flex-1 py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
            currentTab === 'faculty'
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">Faculty</span>
        </button>

        {/* Summary & Stats Tab */}
        <button
          onClick={() => setCurrentTab('stats')}
          className={`flex-1 py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
            currentTab === 'stats'
              ? 'text-orange-600 dark:text-orange-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px]">Summary</span>
        </button>
      </nav>
    </>
  );
};
