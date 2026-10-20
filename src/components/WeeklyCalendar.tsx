import React, { useState } from 'react';
import { SectionItem, ScheduleConflict } from '../types/routine';
import { DAYS_OF_WEEK, STANDARD_THEORY_SLOTS, getCoursePalette } from '../utils/routineUtils';
import {
  Calendar as CalendarIcon,
  Trash2,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeeklyCalendarProps {
  selectedSections: SectionItem[];
  allCourseCodes: string[];
  conflicts: ScheduleConflict[];
  onRemoveSection: (sectionId: string) => void;
  onSelectCourse?: (courseCode: string) => void;
  id?: string;
  isExportView?: boolean;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedSections,
  allCourseCodes,
  conflicts,
  onRemoveSection,
  onSelectCourse,
  id = 'weekly-calendar-view',
  isExportView = false
}) => {
  const [highlightConflictsOnly, setHighlightConflictsOnly] = useState(false);
  const [activeMobileDay, setActiveMobileDay] = useState<'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday'>('Saturday');

  // Total credits and stats
  const totalCredits = selectedSections.reduce((acc, s) => acc + s.credit, 0);
  const courseCount = selectedSections.length;

  // Minute range for compact calculation: 8:30 AM (510 min) to 4:30 PM (990 min) = 480 min total
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
  const freeDaysCount = 5 - activeDays.length;

  return (
    <div
      id={id}
      className={`w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col transition-all ${
        isExportView ? 'p-6 bg-white text-slate-900' : ''
      }`}
    >
      {/* 1. Modern Card Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                My Weekly Routine
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {totalCredits} Credits
                </span>
                <span aria-hidden="true">·</span>
                <span>{courseCount} Course{courseCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Conflict Status Pill */}
          <div className="flex items-center gap-2">
            {conflicts.length === 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>No Conflicts</span>
              </span>
            ) : (
              <button
                onClick={() => setHighlightConflictsOnly(!highlightConflictsOnly)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/80 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Click to toggle conflict highlight"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>
                  {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Empty State (Clean & friendly if no sections chosen) */}
      {selectedSections.length === 0 ? (
        <div className="p-10 sm:p-14 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-2xl shadow-inner">
            📅
          </div>
          <div className="max-w-xs space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Your timetable is empty
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select a course section on the left to preview your weekly routine.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Day Card View (sm:hidden) */}
          <div className="block sm:hidden p-3 border-b border-slate-100 dark:border-slate-800">
            {/* Day Selector Tabs */}
            <div className="flex items-center justify-between gap-1 pb-3">
              {DAYS_OF_WEEK.map(day => {
                const count = scheduledEvents.filter(e => e.slot.day === day).length;
                const isActive = activeMobileDay === day;

                return (
                  <button
                    key={day}
                    onClick={() => setActiveMobileDay(day)}
                    className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-semibold text-center transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div>{day.slice(0, 3)}</div>
                    <div className="text-[9px] opacity-75">{count}</div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Day Events List */}
            <div className="space-y-2 min-h-[160px]">
              {scheduledEvents.filter(e => e.slot.day === activeMobileDay).length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  No classes scheduled on {activeMobileDay}
                </div>
              ) : (
                scheduledEvents
                  .filter(e => e.slot.day === activeMobileDay)
                  .sort((a, b) => a.slot.startMinutes - b.slot.startMinutes)
                  .map((evt, idx) => {
                    const palette = getCoursePalette(evt.section.courseCode, allCourseCodes);

                    return (
                      <motion.div
                        key={`${evt.section.id}-${idx}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          evt.isConflicted
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200'
                            : `${palette.bg} ${palette.border} ${palette.text}`
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold font-mono">{evt.section.courseCode}</span>
                            <span className="font-semibold text-[10px] px-1 py-0.2 rounded-xs bg-slate-900/10 dark:bg-white/10">
                              Sec {evt.section.section}
                            </span>
                          </div>
                          <div className="text-[11px] truncate opacity-90">{evt.section.courseTitle}</div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{evt.slot.time}</span>
                            <span>·</span>
                            <span>{evt.slot.room}</span>
                            <span>·</span>
                            <span>{evt.section.facultyInitial}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveSection(evt.section.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Desktop Compact Google Calendar-Style Grid (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto">
            {/* Day Header Row */}
            <div className="grid grid-cols-[55px_repeat(5,1fr)] border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 sticky top-0 z-10 text-center">
              <div className="py-2 px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Time
              </div>
              {DAYS_OF_WEEK.map(day => {
                const count = scheduledEvents.filter(e => e.slot.day === day).length;
                return (
                  <div
                    key={day}
                    className="py-2 px-1 border-l border-slate-200 dark:border-slate-800"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {day}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono ml-1.5">
                      ({count})
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Compact Timetable Body: 380px total height, zero wasted vertical space */}
            <div className="grid grid-cols-[55px_repeat(5,1fr)] relative h-[380px]">
              {/* Left Compact Time Column */}
              <div className="relative border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 select-none">
                {STANDARD_THEORY_SLOTS.map((slot, index) => {
                  const topPercent = ((slot.startMinutes - START_MINUTES) / TOTAL_MINUTES) * 100;
                  return (
                    <div
                      key={index}
                      style={{ top: `${topPercent}%` }}
                      className="absolute left-0 right-0 px-1 -translate-y-1/2 text-right"
                    >
                      <span className="text-[10px] font-mono tabular-nums text-slate-400 dark:text-slate-500 font-medium">
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
                    className="relative border-r last:border-r-0 border-slate-200 dark:border-slate-800 h-full bg-white dark:bg-slate-900/40"
                  >
                    {/* Subtle horizontal slot guidelines */}
                    {STANDARD_THEORY_SLOTS.map((slot, index) => {
                      const topPercent = ((slot.startMinutes - START_MINUTES) / TOTAL_MINUTES) * 100;
                      return (
                        <div
                          key={index}
                          style={{ top: `${topPercent}%` }}
                          className="absolute left-0 right-0 border-t border-slate-100 dark:border-slate-800/60 pointer-events-none"
                        />
                      );
                    })}

                    {/* Classes on this day */}
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
                            initial={{ opacity: 0, scale: 0.95, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            style={{
                              top: `${Math.max(0.5, topPercent)}%`,
                              height: `${Math.max(8, heightPercent - 0.8)}%`,
                              left: '3px',
                              right: '3px'
                            }}
                            className={`absolute rounded-lg p-1.5 transition-all text-xs flex flex-col justify-between overflow-hidden shadow-2xs border ${
                              evt.isConflicted
                                ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/50'
                                : `${palette.bg} ${palette.border} ${palette.text}`
                            }`}
                          >
                            {/* Card Content: Compact Google Calendar style */}
                            <div className="flex items-start justify-between gap-1 leading-tight">
                              <div className="min-w-0">
                                <div className="font-bold text-[11px] truncate tracking-tight font-mono">
                                  {evt.section.courseCode}
                                </div>
                                <div className="text-[10px] font-semibold opacity-90 truncate">
                                  Sec {evt.section.section} · {evt.section.facultyInitial}
                                </div>
                              </div>

                              {!isExportView && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    onRemoveSection(evt.section.id);
                                  }}
                                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 opacity-60 hover:opacity-100 transition-opacity p-0.5"
                                  title="Remove section"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>

                            {/* Bottom Micro Details */}
                            <div className="flex items-center justify-between text-[9px] font-mono opacity-80 pt-0.5 leading-none">
                              <span className="truncate">{evt.slot.room}</span>
                              {evt.isConflicted && (
                                <span className="font-bold text-rose-600 dark:text-rose-400">
                                  CLASH
                                </span>
                              )}
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

      {/* 3. Summary Footer (Compact metrics row) */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Courses</div>
            <div className="font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
              {courseCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Credits</div>
            <div className="font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
              {totalCredits}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Busy Days</div>
            <div className="font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
              {activeDays.length}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Conflicts</div>
            <div
              className={`font-bold font-mono tabular-nums ${
                conflicts.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
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
