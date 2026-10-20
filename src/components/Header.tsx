import React from 'react';
import { Calendar, Sun, Moon, Download, Upload, BookOpen, Users, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: 'planner' | 'calendar' | 'faculty' | 'stats';
  setCurrentTab: (tab: 'planner' | 'calendar' | 'faculty' | 'stats') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenExport: () => void;
  onOpenUpload: () => void;
  selectedCount: number;
  totalCredits: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode,
  onOpenExport,
  onOpenUpload,
  selectedCount,
  totalCredits
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold shadow-sm shadow-orange-500/20">
            UIU
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Fall 2026 Routine Planner
            </span>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Trimester Pre-Registration</span>
              <span aria-hidden="true">·</span>
              <span>Dept. of CSE & SDS</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl text-sm font-medium">
          <button
            onClick={() => setCurrentTab('planner')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 text-xs font-semibold ${
              currentTab === 'planner'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Planner</span>
            {selectedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] tabular-nums font-bold">
                {selectedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('calendar')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 text-xs font-semibold ${
              currentTab === 'calendar'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Calendar</span>
          </button>

          <button
            onClick={() => setCurrentTab('faculty')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 text-xs font-semibold ${
              currentTab === 'faculty'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Faculty Directory</span>
          </button>

          <button
            onClick={() => setCurrentTab('stats')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 text-xs font-semibold ${
              currentTab === 'stats'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summary & Credits ({totalCredits})</span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenUpload}
            title="Upload or update routine PDF"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden lg:inline">Update Routine PDF</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            onClick={onOpenExport}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 active:scale-98 text-white transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
