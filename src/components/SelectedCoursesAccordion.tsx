import React from 'react';
import { CourseGroup, SectionItem, ScheduleConflict } from '../types/routine';
import { checkConflicts, getCoursePalette } from '../utils/routineUtils';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SelectedCoursesAccordionProps {
  addedCourses: CourseGroup[];
  selectedSections: SectionItem[];
  allCourseCodes: string[];
  expandedCourseCode: string | null;
  onToggleCourse: (courseCode: string) => void;
  onSelectSection: (section: SectionItem, conflicts: ScheduleConflict[]) => void;
  onDeselectSection: (sectionId: string) => void;
  onRemoveCourse: (courseCode: string) => void;
  onBrowseCoursesClick: () => void;
}

export const SelectedCoursesAccordion: React.FC<SelectedCoursesAccordionProps> = ({
  addedCourses,
  selectedSections,
  allCourseCodes,
  expandedCourseCode,
  onToggleCourse,
  onSelectSection,
  onDeselectSection,
  onRemoveCourse,
  onBrowseCoursesClick
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-600" />
            <span>Selected Courses ({addedCourses.length})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any course to expand sections. Click Select to toggle your section choice.
          </p>
        </div>

        {addedCourses.length > 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {selectedSections.length} of {addedCourses.length} sections chosen
          </span>
        )}
      </div>

      {/* Empty State */}
      {addedCourses.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-orange-100/70 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-3xl shadow-inner">
            📚
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              No courses selected yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Search or browse courses in the Course Explorer below to begin planning your semester.
            </p>
          </div>
          <button
            onClick={onBrowseCoursesClick}
            className="mt-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Browse Available Courses</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addedCourses.map(course => {
            const isExpanded = expandedCourseCode === course.courseCode;
            const chosenSection = selectedSections.find(s => s.courseCode === course.courseCode);
            const palette = getCoursePalette(course.courseCode, allCourseCodes);

            return (
              <div
                key={course.courseCode}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isExpanded
                    ? 'bg-white dark:bg-slate-900 border-orange-300 dark:border-orange-800 ring-2 ring-orange-500/10'
                    : chosenSection
                    ? 'bg-white dark:bg-slate-900 border-emerald-300/70 dark:border-emerald-800/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {/* Accordion Head (Clickable) */}
                <div
                  onClick={() => onToggleCourse(course.courseCode)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none group"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        style={{ backgroundColor: `${palette.accent}20`, color: palette.accent }}
                        className="text-xs font-bold font-mono px-2 py-0.5 rounded-md"
                      >
                        {course.courseCode}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {course.credit} Credits
                      </span>
                      {course.isLab && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-xs">
                          Lab
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {course.courseTitle}
                    </h3>

                    {/* Status badge: Chosen section or pending */}
                    <div className="pt-0.5">
                      {chosenSection ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>
                            Section {chosenSection.section} ({chosenSection.facultyInitial}) ·{' '}
                            {chosenSection.day2
                              ? `${chosenSection.day1} & ${chosenSection.day2}`
                              : chosenSection.day1}{' '}
                            · {chosenSection.time1}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                          <span>No section chosen yet · Click to select</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Remove + Toggle Arrow */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onRemoveCourse(course.courseCode);
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Remove course from plan"
                      aria-label="Remove course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      <span className="hidden sm:inline">
                        {isExpanded ? 'Hide' : 'View Sections'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-orange-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Sections Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="border-t border-slate-100 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/60 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                        <span>Available Sections ({course.sections.length}):</span>
                        <span className="text-[11px] italic">
                          Click to select or deselect a section
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {course.sections.map(sec => {
                          const isCurrent = chosenSection?.id === sec.id;
                          const conflicts = checkConflicts(sec, selectedSections);
                          const hasConflict = conflicts.length > 0;

                          const handleButtonClick = (e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (isCurrent) {
                              // Deselect this section
                              onDeselectSection(sec.id);
                            } else {
                              // Select this section (automatically replaces any other section of this course)
                              onSelectSection(sec, conflicts);
                            }
                          };

                          return (
                            <div
                              key={sec.id}
                              onClick={handleButtonClick}
                              className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none ${
                                isCurrent
                                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700/80 shadow-2xs ring-1 ring-emerald-500/20'
                                  : hasConflict
                                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 hover:border-rose-300'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              {/* Section info */}
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                                    Section {sec.section}
                                  </span>
                                  <span className="text-slate-400">·</span>
                                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <User className="w-3 h-3 text-slate-400" />
                                    <span>{sec.facultyName}</span>
                                    <span className="font-mono text-slate-400 text-[11px]">
                                      ({sec.facultyInitial})
                                    </span>
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>
                                      {sec.day2 ? `${sec.day1} • ${sec.day2}` : sec.day1}
                                    </span>
                                    <span>·</span>
                                    <span>{sec.time1}</span>
                                  </span>

                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>Room {sec.room1}</span>
                                  </span>
                                </div>

                                {hasConflict && !isCurrent && (
                                  <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 pt-0.5">
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                    <span>
                                      Clashes with{' '}
                                      {conflicts
                                        .map(c => `${c.existingSection.courseCode} (${c.day})`)
                                        .join(', ')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Toggle Button */}
                              <div className="shrink-0 flex items-center">
                                {isCurrent ? (
                                  <button
                                    type="button"
                                    onClick={handleButtonClick}
                                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                                    title="Click to deselect this section"
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>Selected</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleButtonClick}
                                    className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                                      hasConflict
                                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200'
                                        : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-200'
                                    }`}
                                  >
                                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 flex items-center justify-center text-[9px] text-slate-500">
                                      ○
                                    </span>
                                    <span>{hasConflict ? 'Select (Clash)' : 'Select'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
