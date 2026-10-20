import React, { useRef } from 'react';
import { SectionItem, ScheduleConflict } from '../types/routine';
import { DAYS_OF_WEEK, STANDARD_THEORY_SLOTS, getCoursePalette } from '../utils/routineUtils';
import { Trash2, AlertTriangle, MapPin, User, Clock } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Minute range: 08:30 AM (510 min) to 04:30 PM (990 min) = 480 minutes total
  const START_MINUTES = 510;
  const END_MINUTES = 990;
  const TOTAL_MINUTES = END_MINUTES - START_MINUTES;

  // Flatten all scheduled slots from selected sections
  const scheduledEvents = selectedSections.flatMap(sec =>
    sec.schedules.map(slot => {
      // Check if this slot conflicts with any other
      const hasConflict = conflicts.some(
        c =>
          (c.existingSection.id === sec.id || c.conflictingSection.id === sec.id) &&
          c.day === slot.day
      );

      return {
        section: sec,
        slot,
        hasConflict
      };
    })
  );

  return (
    <div
      id={id}
      ref={containerRef}
      className={`w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col ${
        isExportView ? 'p-6 bg-white text-slate-900' : ''
      }`}
    >
      {/* Calendar Header with Days */}
      <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 sticky top-0 z-20 backdrop-blur-xs">
        <div className="py-3 px-2 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Time
        </div>
        {DAYS_OF_WEEK.map(day => {
          const countForDay = scheduledEvents.filter(e => e.slot.day === day).length;
          return (
            <div
              key={day}
              className="py-3 px-2 border-l border-slate-200 dark:border-slate-800 text-center"
            >
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {day}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {countForDay === 0 ? 'Free day' : `${countForDay} class${countForDay > 1 ? 'es' : ''}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Timetable Body with proportional time slots */}
      <div className="relative min-w-[700px] sm:min-w-0">
        <div className="grid grid-cols-[70px_repeat(5,1fr)] relative min-h-[640px]">
          {/* Time Gutter Column */}
          <div className="flex flex-col justify-between py-2 border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 select-none">
            {STANDARD_THEORY_SLOTS.map(slot => (
              <div
                key={slot.label}
                className="px-1 text-center"
                style={{
                  height: `${((slot.endMinutes - slot.startMinutes) / TOTAL_MINUTES) * 100}%`
                }}
              >
                <span className="text-[10px] sm:text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 font-medium leading-tight block">
                  {slot.label.split(' - ')[0]}
                </span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 block">
                  to {slot.label.split(' - ')[1]}
                </span>
              </div>
            ))}
          </div>

          {/* 5 Day Columns */}
          {DAYS_OF_WEEK.map(day => {
            const dayEvents = scheduledEvents.filter(e => e.slot.day === day);

            return (
              <div
                key={day}
                className="relative border-r last:border-r-0 border-slate-200 dark:border-slate-800 h-full min-h-[640px] bg-white dark:bg-slate-900/60"
              >
                {/* Horizontal reference grid lines */}
                {STANDARD_THEORY_SLOTS.map((slot, index) => {
                  const topPercent = ((slot.startMinutes - START_MINUTES) / TOTAL_MINUTES) * 100;
                  return (
                    <div
                      key={index}
                      style={{ top: `${topPercent}%` }}
                      className="absolute left-0 right-0 border-t border-dashed border-slate-100 dark:border-slate-800/80 pointer-events-none"
                    />
                  );
                })}

                {/* Empty State placeholder if no classes */}
                {dayEvents.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                    <span className="text-xs text-slate-400 italic">No classes</span>
                  </div>
                )}

                {/* Render Classes on this day */}
                {dayEvents.map((evt, idx) => {
                  const startMin = Math.max(evt.slot.startMinutes, START_MINUTES);
                  const endMin = Math.min(evt.slot.endMinutes, END_MINUTES);
                  const topPercent = ((startMin - START_MINUTES) / TOTAL_MINUTES) * 100;
                  const heightPercent = ((endMin - startMin) / TOTAL_MINUTES) * 100;

                  const palette = getCoursePalette(evt.section.courseCode, allCourseCodes);

                  return (
                    <div
                      key={`${evt.section.id}-${evt.slot.day}-${idx}`}
                      style={{
                        top: `${Math.max(0.5, topPercent)}%`,
                        height: `${Math.max(6, heightPercent - 0.8)}%`,
                        left: '4px',
                        right: '4px'
                      }}
                      className={`absolute rounded-xl p-2 sm:p-2.5 transition-all text-xs flex flex-col justify-between overflow-hidden shadow-xs border ${
                        evt.hasConflict
                          ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 dark:border-rose-500 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/50'
                          : `${palette.bg} ${palette.border} ${palette.text}`
                      }`}
                    >
                      {/* Top Bar: Code, Section & Remove */}
                      <div className="flex items-start justify-between gap-1">
                        <div className="truncate">
                          <button
                            onClick={() => onSelectCourse && onSelectCourse(evt.section.courseCode)}
                            className="font-bold text-xs sm:text-sm hover:underline text-left block truncate tracking-tight"
                            title={evt.section.courseTitle}
                          >
                            {evt.section.courseCode}
                          </button>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-90">
                            <span className="font-semibold uppercase tracking-wider px-1 py-0.2 rounded-xs bg-slate-900/10 dark:bg-white/10">
                              Sec {evt.section.section}
                            </span>
                            <span>·</span>
                            <span>{evt.section.credit} Cr</span>
                            {evt.section.isLab && (
                              <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-300">
                                Lab
                              </span>
                            )}
                          </div>
                        </div>

                        {!isExportView && (
                          <button
                            onClick={() => onRemoveSection(evt.section.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
                            title={`Remove ${evt.section.courseCode} Section ${evt.section.section}`}
                            aria-label={`Remove ${evt.section.courseCode}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Course Title snippet */}
                      <div className="text-[11px] leading-tight line-clamp-1 opacity-90 my-1 font-medium">
                        {evt.section.courseTitle}
                      </div>

                      {/* Bottom row: Faculty, Room, Time & Conflict Flag */}
                      <div className="flex flex-col gap-0.5 mt-auto text-[10px] opacity-85 pt-1 border-t border-slate-300/40 dark:border-slate-700/50 font-mono">
                        <div className="flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1 truncate" title={evt.section.facultyName}>
                            <User className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{evt.section.facultyInitial || evt.section.facultyName}</span>
                          </span>
                          <span className="flex items-center gap-1 shrink-0 font-bold">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span>{evt.slot.room}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1 text-[9px]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            <span>{evt.slot.time}</span>
                          </span>
                          {evt.hasConflict && (
                            <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              <span>CLASH</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
