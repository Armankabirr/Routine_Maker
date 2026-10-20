import React from 'react';
import { SectionItem, ScheduleConflict } from '../types/routine';
import { checkConflicts } from '../utils/routineUtils';
import { Check, AlertTriangle, User, Calendar, MapPin, Clock } from 'lucide-react';

interface SectionTableProps {
  courseCode: string;
  courseTitle: string;
  sections: SectionItem[];
  selectedSections: SectionItem[];
  onSelectSection: (section: SectionItem, conflicts: ScheduleConflict[]) => void;
  onDeselectCourse: (courseCode: string) => void;
  onFacultyClick?: (facultyName: string) => void;
}

export const SectionTable: React.FC<SectionTableProps> = ({
  courseCode,
  courseTitle,
  sections,
  selectedSections,
  onSelectSection,
  onDeselectCourse,
  onFacultyClick
}) => {
  const currentSelected = selectedSections.find(s => s.courseCode === courseCode);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
              {courseCode}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {sections.length} available section{sections.length > 1 ? 's' : ''}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
            {courseTitle}
          </h3>
        </div>

        {currentSelected && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Current: <strong className="text-slate-900 dark:text-white">Section {currentSelected.section}</strong> ({currentSelected.facultyInitial})
            </span>
            <button
              onClick={() => onDeselectCourse(courseCode)}
              className="text-xs font-semibold px-2.5 py-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-200 dark:border-rose-900/60"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 font-semibold">
              <th className="py-3 px-4">Section</th>
              <th className="py-3 px-4">Faculty</th>
              <th className="py-3 px-4">Class Days</th>
              <th className="py-3 px-4">Timing</th>
              <th className="py-3 px-4">Room</th>
              <th className="py-3 px-4 text-center">Credit</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sections.map(sec => {
              const isCurrent = currentSelected?.id === sec.id;
              // Check if selecting this section creates clashes with other already chosen courses
              const conflicts = checkConflicts(sec, selectedSections);
              const hasConflict = conflicts.length > 0;

              return (
                <tr
                  key={sec.id}
                  className={`transition-colors ${
                    isCurrent
                      ? 'bg-orange-50/60 dark:bg-orange-950/20 font-medium'
                      : hasConflict
                      ? 'bg-rose-50/30 dark:bg-rose-950/10 hover:bg-rose-50/50'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Section */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {sec.section}
                      </span>
                      {isCurrent && (
                        <span className="flex items-center gap-0.5 text-[10px] uppercase font-bold tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-1.5 py-0.5 rounded-md">
                          <Check className="w-2.5 h-2.5" /> Selected
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Faculty */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onFacultyClick && onFacultyClick(sec.facultyName)}
                      className="text-left group"
                      title={`View all sections taught by ${sec.facultyName}`}
                    >
                      <div className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 shrink-0" />
                        <span>{sec.facultyName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        Initial: {sec.facultyInitial}
                      </div>
                    </button>
                  </td>

                  {/* Day */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{sec.day2 ? `${sec.day1} & ${sec.day2}` : sec.day1}</span>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <div>{sec.time1}</div>
                        {sec.time2 && sec.time2 !== '-' && sec.time2 !== sec.time1 && (
                          <div className="text-slate-400 text-[11px]">{sec.time2}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Room */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{sec.room1 === sec.room2 || !sec.room2 ? sec.room1 : `${sec.room1} / ${sec.room2}`}</span>
                    </div>
                  </td>

                  {/* Credit */}
                  <td className="py-3.5 px-4 text-center tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                    {sec.credit}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {isCurrent ? (
                      <button
                        onClick={() => onDeselectCourse(sec.courseCode)}
                        className="inline-flex items-center gap-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Click to deselect"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Selected</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        {hasConflict && (
                          <span
                            className="hidden lg:flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium"
                            title={`Overlaps with ${conflicts.map(c => `${c.existingSection.courseCode} (${c.existingSection.section})`).join(', ')}`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Clash</span>
                          </span>
                        )}
                        <button
                          onClick={() => onSelectSection(sec, conflicts)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-98 ${
                            hasConflict
                              ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800'
                              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs'
                          }`}
                        >
                          {hasConflict ? 'Choose (Clash)' : 'Choose Section'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
