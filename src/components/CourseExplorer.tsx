import React, { useState, useMemo } from 'react';
import { CourseGroup } from '../types/routine';
import { isCoreCourse, getCoursePalette } from '../utils/routineUtils';
import { Search, Plus, X, Layers, Check, Sparkles } from 'lucide-react';

interface CourseExplorerProps {
  allCourses: CourseGroup[];
  addedCourseCodes: string[];
  allCourseCodes: string[];
  onAddCourse: (courseCode: string) => void;
}

export type CourseFilterType = 'all' | 'core' | 'elective' | 'theory' | 'lab' | 'morning' | 'afternoon';

export const CourseExplorer: React.FC<CourseExplorerProps> = ({
  allCourses,
  addedCourseCodes,
  allCourseCodes,
  onAddCourse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<CourseFilterType>('all');

  // Filter available courses
  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      // 1. If already added to Selected Courses, omit from explorer
      if (addedCourseCodes.includes(course.courseCode)) {
        return false;
      }

      // 2. Search query (Course Code or Course Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = course.courseCode.toLowerCase().includes(q);
        const matchesTitle = course.courseTitle.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle) {
          return false;
        }
      }

      // 3. Filter chips
      const isCore = isCoreCourse(course.courseCode);
      if (activeFilter === 'core' && !isCore) return false;
      if (activeFilter === 'elective' && isCore) return false;
      if (activeFilter === 'theory' && course.isLab) return false;
      if (activeFilter === 'lab' && !course.isLab) return false;

      if (activeFilter === 'morning') {
        const hasMorning = course.sections.some(s =>
          s.schedules.some(sl => sl.startMinutes < 720)
        );
        if (!hasMorning) return false;
      }

      if (activeFilter === 'afternoon') {
        const hasAfternoon = course.sections.some(s =>
          s.schedules.some(sl => sl.startMinutes >= 720)
        );
        if (!hasAfternoon) return false;
      }

      return true;
    });
  }, [allCourses, addedCourseCodes, searchQuery, activeFilter]);

  const filterChips: { id: CourseFilterType; label: string }[] = [
    { id: 'all', label: 'All Courses' },
    { id: 'core', label: 'Core' },
    { id: 'elective', label: 'Elective' },
    { id: 'theory', label: 'Theory' },
    { id: 'lab', label: 'Lab' },
    { id: 'morning', label: 'Morning' },
    { id: 'afternoon', label: 'Afternoon' }
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-600" />
            <span>Course Explorer</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search and add the courses you want to take. Then choose sections above.
          </p>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
        </span>
      </div>

      {/* Large Search Bar */}
      <div className="relative w-full">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="🔍 Search by Course Code or Course Name (e.g. CSE 4157, Machine Learning)..."
          className="w-full pl-11 pr-10 py-3.5 text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 dark:focus:border-orange-500 shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Modern Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {filterChips.map(chip => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Large Course Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No matching courses found
          </p>
          <p className="text-xs text-slate-400">
            Try adjusting your search terms or filter chip selection.
          </p>
          {(searchQuery || activeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline"
            >
              Reset Search &amp; Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCourses.map(course => {
            const isCore = isCoreCourse(course.courseCode);
            const palette = getCoursePalette(course.courseCode, allCourseCodes);

            return (
              <div
                key={course.courseCode}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-orange-300 dark:hover:border-orange-800/80 transition-all duration-200 flex flex-col justify-between gap-4"
              >
                {/* Top: Code, Type Badges, Credits */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      style={{ backgroundColor: `${palette.accent}15`, color: palette.accent }}
                      className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg tracking-wide"
                    >
                      {course.courseCode}
                    </span>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-600 dark:text-slate-300 font-mono">
                        {course.credit} Credits
                      </span>
                      <span>·</span>
                      <span className="text-slate-500">
                        {course.sections.length} Section{course.sections.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {course.courseTitle}
                    </h3>
                  </div>

                  {/* Metadata Tags (Zero-Pill clean typography per constitution) */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{isCore ? 'Core Subject' : 'Elective / Major'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.isLab ? 'Laboratory Session' : 'Theory Course'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{course.program}</span>
                  </div>
                </div>

                {/* Add Course Button */}
                <button
                  onClick={() => onAddCourse(course.courseCode)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-orange-600 hover:text-white dark:bg-slate-800 dark:hover:bg-orange-600 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all active:scale-98 flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Course</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
