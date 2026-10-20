import React, { useState } from 'react';
import { SectionItem, ScheduleConflict } from '../types/routine';
import { DAYS_OF_WEEK, STANDARD_THEORY_SLOTS, getCoursePalette } from '../utils/routineUtils';
import {
  Calendar as CalendarIcon,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Download,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeeklyCalendarProps {
  selectedSections: SectionItem[];
  allCourseCodes: string[];
  conflicts: ScheduleConflict[];
  onRemoveSection: (sectionId: string) => void;
  onClearRoutine?: () => void;
  onOpenExport?: () => void;
  onSelectCourse?: (courseCode: string) => void;
  id?: string;
  isExportView?: boolean;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedSections,
  allCourseCodes,
  conflicts,
  onRemoveSection,
  onClearRoutine,
  onOpenExport,
  onSelectCourse,
  id = 'weekly-calendar-view',
  isExportView = false
}) => {
  const [highlightConflictsOnly, setHighlightConflictsOnly] = useState(false);
  const [activeMobileDay, setActiveMobileDay] = useState<'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday'>('Saturday');

  // Stats
  const totalCredits = selectedSections.reduce((acc, s) => acc + s.credit, 0);
  const courseCount = selectedSections.length;

  // Minute range: 8:30 AM (510 min) to 4:30 PM (990 min) = 480 min total
  const START_MINUTES = 510;
  const END_MINUTES = 990;
  const TOTAL_MINUTES = END_MINUTES - START_MINUTES;

  // Flatten events
  const scheduledEvents = selectedSections.flatMap(sec =>
    sec.schedules.map(slot => {
      const isConflicted = conflicts.some(
        c =>
          (c.existingSection.id === sec.id || c.conflictingSection.id === sec.id) &&
          c.day === slot.day
      );

      return {
        section: sec,
        slot,
        isConflicted
      };
    })
  );

  const activeDays = DAYS_OF_WEEK.filter(day =>
    scheduledEvents.some(e => e.slot.day === day)
  );

  return (
    <div
      id={id}
      className={`w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-all ${
        isExportView
          ? 'p-6 bg-white text-slate-900'
          : 'max-h-[calc(100vh-6rem)] overflow-hidden'
      }`}
    >
      {/* 1. Compact Google Calendar Style Header */}
      <div className="py-2.5 px-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Title & Stats */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  My Routine
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                  {totalCredits} Cr
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {courseCount} Course{courseCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Controls: Conflict Pill + Export + Reset */}
          <div className="flex items-center gap-1.5 shrink-0">
            {conflicts.length === 0 ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60">
                <CheckCircle2 className="w-3 h-3" />
                <span>No Conflicts</span>
              </span>
            ) : (
              <button
                onClick={() => setHighlightConflictsOnly(!highlightConflictsOnly)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/80 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Click to toggle conflict view"
              >
                <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>
                  {conflicts.length} Clash{conflicts.length > 1 ? 'es' : ''}
                </span>
              </button>
            )}

            {onClearRoutine && selectedSections.length > 0 && (
              <button
                onClick={onClearRoutine}
                className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset timetable"
                aria-label="Reset routine"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {onOpenExport && (
              <button
                onClick={onOpenExport}
                disabled={selectedSections.length === 0}
                className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-semibold shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                title="Export routine"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Scrollable Body: Internal Scroll container prevents page from stretching */}
      <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 relative select-none">
        {selectedSections.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2 min-h-[260px]">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl shadow-inner">
              📅
            </div>
            <div className="max-w-xs space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Your timetable is empty
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Select a course section on the left to preview your weekly routine.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View: Day Tabs & Vertical List (sm:hidden) */}
            <div className="block sm:hidden p-2.5">
              <div className="flex items-center justify-between gap-1 pb-2">
                {DAYS_OF_WEEK.map(day => {
                  const count = scheduledEvents.filter(e => e.slot.day === day).length;
                  const isActive = activeMobileDay === day;

                  return (
                    <button
                      key={day}
                      onClick={() => setActiveMobileDay(day)}
                      className={`flex-1 py-1 px-0.5 rounded-lg text-[10px] font-semibold text-center transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div>{day.slice(0, 3)}</div>
                      <div className="text-[9px] opacity-75">({count})</div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5 min-h-[140px]">
                {scheduledEvents.filter(e => e.slot.day === activeMobileDay).length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    No classes on {activeMobileDay}
                  </div>
                ) : (
                  scheduledEvents
                    .filter(e => e.slot.day === activeMobileDay)
                    .sort((a, b) => a.slot.startMinutes - b.slot.startMinutes)
                    .map((evt, idx) => {
                      const palette = getCoursePalette(evt.section.courseCode, allCourseCodes);

                      return (
                        <div
                          key={`${evt.section.id}-${idx}`}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                            evt.isConflicted
                              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200'
                              : `${palette.bg} ${palette.border} ${palette.text}`
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold font-mono text-[11px]">{evt.section.courseCode}</span>
                              <span className="font-semibold text-[9px] px-1 py-0.2 rounded-xs bg-slate-900/10 dark:bg-white/10">
                                Sec {evt.section.section}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>{evt.slot.time}</span>
                              <span>·</span>
                              <span>{evt.slot.room}</span>
                              <span>·</span>
                              <span>{evt.section.facultyInitial}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onRemoveSection(evt.section.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Desktop View: Google Calendar-Style Compact Grid (hidden sm:block) */}
            <div className="hidden sm:block min-w-[420px]">
              {/* Sticky Day Header */}
              <div className="grid grid-cols-[48px_repeat(5,1fr)] border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/90 sticky top-0 z-20 text-center backdrop-blur-xs">
                <div className="py-1 px-1 text-[9px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center">
                  Time
                </div>
                {DAYS_OF_WEEK.map(day => {
                  const count = scheduledEvents.filter(e => e.slot.day === day).length;
                  return (
                    <div
                      key={day}
                      className="py-1 px-1 border-l border-slate-200 dark:border-slate-800/70"
                    >
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {day.slice(0, 3)}
                      </span>
                      {count > 0 && (
                        <span className="text-[9px] text-orange-600 dark:text-orange-400 font-mono font-bold ml-1">
                          ({count})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Compact Timetable Grid: 270px height fits all 6 slots cleanly in screen! */}
              <div className="grid grid-cols-[48px_repeat(5,1fr)] relative h-[270px]">
                {/* Time labels column */}
                <div className="relative border-r border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20">
                  {STANDARD_THEORY_SLOTS.map((slot, index) => {
                    const topPercent = ((slot.startMinutes - START_MINUTES) / TOTAL_MINUTES) * 100;
                    return (
                      <div
                        key={index}
                        style={{ top: `${topPercent}%` }}
                        className="absolute left-0 right-0 pr-1 -translate-y-1/2 text-right"
                      >
                        <span className="text-[9px] font-mono tabular-nums text-slate-400 dark:text-slate-500 font-medium leading-none block">
                          {slot.label.split(' - ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 5 Day Columns */}
                {DAYS_OF_WEEK.map(day => {
                  const dayEvents = scheduledEvents.filter(e => e.slot.day === day);

                  return (
                    <div
                      key={day}
                      className="relative border-r last:border-r-0 border-slate-100 dark:border-slate-800/60 h-full bg-white dark:bg-slate-900/40"
                    >
                      {/* Slot Guideline Dividers */}
                      {STANDARD_THEORY_SLOTS.map((slot, index) => {
                        const topPercent = ((slot.startMinutes - START_MINUTES) / TOTAL_MINUTES) * 100;
                        return (
                          <div
                            key={index}
                            style={{ top: `${topPercent}%` }}
                            className="absolute left-0 right-0 border-t border-slate-100 dark:border-slate-800/50 pointer-events-none"
                          />
                        );
                      })}

                      {/* Event Cards */}
                      <AnimatePresence>
                        {dayEvents.map((evt, idx) => {
                          const startMin = Math.max(evt.slot.startMinutes, START_MINUTES);
                          const endMin = Math.min(evt.slot.endMinutes, END_MINUTES);
                          const topPercent = ((startMin - START_MINUTES) / TOTAL_MINUTES) * 100;
                          const heightPercent = ((endMin - startMin) / TOTAL_MINUTES) * 100;

                          const palette = getCoursePalette(evt.section.courseCode, allCourseCodes);

                          return (
                            <motion.div
                              key={`${evt.section.id}-${evt.slot.day}-${idx}`}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              style={{
                                top: `${Math.max(0.5, topPercent)}%`,
                                height: `${Math.max(10, heightPercent - 0.5)}%`,
                                left: '2px',
                                right: '2px'
                              }}
                              className={`absolute rounded-md p-1 transition-all text-xs flex flex-col justify-between overflow-hidden shadow-2xs border leading-tight ${
                                evt.isConflicted
                                  ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100 ring-1 ring-rose-500/50'
                                  : `${palette.bg} ${palette.border} ${palette.text}`
                              }`}
                            >
                              {/* Header: Code + Sec */}
                              <div className="flex items-start justify-between gap-0.5">
                                <div className="truncate">
                                  <button
                                    onClick={() => onSelectCourse && onSelectCourse(evt.section.courseCode)}
                                    className="font-bold text-[10px] font-mono hover:underline truncate block leading-none"
                                    title={`${evt.section.courseCode} - ${evt.section.courseTitle}`}
                                  >
                                    {evt.section.courseCode.replace('CSE ', '').replace('MATH ', 'M').replace('EEE ', 'E')}
                                  </button>
                                  <span className="text-[9px] opacity-90 font-semibold">
                                    Sec {evt.section.section}
                                  </span>
                                </div>

                                {!isExportView && (
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      onRemoveSection(evt.section.id);
                                    }}
                                    className="text-slate-400 hover:text-rose-600 opacity-50 hover:opacity-100 transition-opacity p-0.5"
                                    title="Remove section"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>

                              {/* Footer: Room + Faculty Initial */}
                              <div className="flex items-center justify-between text-[8px] font-mono opacity-85 leading-none">
                                <span className="truncate">{evt.slot.room.split(' ')[0]}</span>
                                <span>{evt.section.facultyInitial}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Compact Summary Footer (Fixed at bottom of widget) */}
      <div className="py-2 px-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shrink-0 text-xs">
        <div className="grid grid-cols-4 gap-1 text-center">
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Courses</div>
            <div className="font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums text-xs">
              {courseCount}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Credits</div>
            <div className="font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums text-xs">
              {totalCredits}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Active Days</div>
            <div className="font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums text-xs">
              {activeDays.length}/5
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Conflicts</div>
            <div
              className={`font-bold font-mono tabular-nums text-xs ${
                conflicts.length > 0 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {conflicts.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
