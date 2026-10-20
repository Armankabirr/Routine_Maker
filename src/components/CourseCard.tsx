import React from 'react';
import { CourseGroup, SectionItem } from '../types/routine';
import { getCoursePalette } from '../utils/routineUtils';
import { Check, ChevronDown, ChevronUp, Layers, Clock, MapPin, User, AlertCircle, Plus } from 'lucide-react';

interface CourseCardProps {
  course: CourseGroup;
  selectedSection?: SectionItem;
  isOpen: boolean;
  onToggle: () => void;
  onRemoveFromSelection?: () => void;
  allCourseCodes: string[];
  isPinned?: boolean;
  onPinCourse?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  selectedSection,
  isOpen,
  onToggle,
  onRemoveFromSelection,
  allCourseCodes,
  isPinned = true,
  onPinCourse
}) => {
  const palette = getCoursePalette(course.courseCode, allCourseCodes);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        selectedSection
          ? 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-sm'
          : 'bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Top Header: Code, Badges, Credit */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              style={{ backgroundColor: `${palette.accent}20`, color: palette.accent }}
              className="text-xs font-bold font-mono px-2 py-0.5 rounded-md"
            >
              {course.courseCode}
            </span>

            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {course.credit} Credit{course.credit > 1 ? 's' : ''}
            </span>

            <span className="text-[11px] text-slate-400 dark:text-slate-500">·</span>

            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {course.sections.length} Section{course.sections.length > 1 ? 's' : ''}
            </span>

            {course.isLab && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded-xs">
                Lab
              </span>
            )}
          </div>

          {/* Quick Action: Pin or Remove */}
          <div className="flex items-center gap-1">
            {!isPinned && onPinCourse && (
              <button
                onClick={onPinCourse}
                className="p-1 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 font-semibold px-2 py-1 transition-colors"
                title="Add to My Courses"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            )}

            {isPinned && onRemoveFromSelection && (
              <button
                onClick={onRemoveFromSelection}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Remove course from active list"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
          {course.courseTitle}
        </h4>

        {/* Selected Section Banner */}
        {selectedSection ? (
          <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Section {selectedSection.section}
                </span>
                <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                  ({selectedSection.facultyInitial || selectedSection.facultyName})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{selectedSection.day2 ? `${selectedSection.day1}/${selectedSection.day2}` : selectedSection.day1}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{selectedSection.room1}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/40 p-2.5 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>No section chosen yet. Open browser below to pick a section.</span>
          </div>
        )}

        {/* Bottom Toggle Button */}
        <button
          onClick={onToggle}
          className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isOpen ? 'Hide Available Sections' : `View Sections (${course.sections.length})`}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </button>
      </div>
    </div>
  );
};
