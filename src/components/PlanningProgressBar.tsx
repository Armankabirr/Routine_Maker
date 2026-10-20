import React from 'react';
import { BookOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface PlanningProgressBarProps {
  coursesAddedCount: number;
  sectionsSelectedCount: number;
  totalCredits: number;
  maxRecommendedCredits?: number;
}

export const PlanningProgressBar: React.FC<PlanningProgressBarProps> = ({
  coursesAddedCount,
  sectionsSelectedCount,
  totalCredits,
  maxRecommendedCredits = 15
}) => {
  const allSectionsPicked =
    coursesAddedCount > 0 && sectionsSelectedCount === coursesAddedCount;
  const creditProgress = Math.min(100, (totalCredits / maxRecommendedCredits) * 100);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Progress title & description */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Planning Progress</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Fall 2026 Worksheet
            </span>
          </div>

          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {coursesAddedCount === 0 ? (
              <span className="text-slate-600 dark:text-slate-300">
                Step 1: Add the courses you plan to take this trimester
              </span>
            ) : allSectionsPicked ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                All sections selected! Your weekly routine is ready to review &amp; export.
              </span>
            ) : (
              <span className="text-slate-800 dark:text-slate-200">
                Step 2: Choose a section for each added course below
              </span>
            )}
          </div>
        </div>

        {/* Right: Metrics Pills */}
        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-3">
          {/* Courses Added */}
          <div className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 text-center sm:text-left">
            <BookOpen className="w-4 h-4 text-slate-400 mx-auto sm:mx-0 shrink-0" />
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">
                Courses
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {coursesAddedCount}
              </div>
            </div>
          </div>

          {/* Sections Selected */}
          <div className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 text-center sm:text-left">
            <Clock className="w-4 h-4 text-orange-500 mx-auto sm:mx-0 shrink-0" />
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate">
                Sections
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {sectionsSelectedCount}/{coursesAddedCount}
              </div>
            </div>
          </div>

          {/* Total Credits */}
          <div className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 text-center sm:text-left">
            <div className="w-full">
              <div className="text-[9px] sm:text-[10px] text-orange-700 dark:text-orange-300 font-semibold uppercase tracking-wider truncate">
                Credits
              </div>
              <div className="text-xs sm:text-sm font-bold text-orange-900 dark:text-orange-200 font-mono tabular-nums">
                {totalCredits}<span className="text-[10px] font-normal text-slate-400">/15</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Progress Line */}
      {coursesAddedCount > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${creditProgress}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                totalCredits > 15
                  ? 'bg-rose-500'
                  : totalCredits >= 9
                  ? 'bg-emerald-500'
                  : 'bg-orange-500'
              }`}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            {totalCredits >= 9 && totalCredits <= 15
              ? 'Optimal UIU trimester load'
              : totalCredits > 15
              ? 'Credit overload'
              : 'Add more courses (Min 9 Cr recommended)'}
          </span>
        </div>
      )}
    </div>
  );
};
