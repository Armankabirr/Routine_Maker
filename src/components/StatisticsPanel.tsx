import React from 'react';
import { SectionItem } from '../types/routine';
import { calculateStatistics } from '../utils/routineUtils';
import { BookOpen, Award, Clock, Calendar, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

interface StatisticsPanelProps {
  selectedSections: SectionItem[];
  onOpenExport: () => void;
  onClearRoutine: () => void;
  onSelectCourse?: (courseCode: string) => void;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  selectedSections,
  onOpenExport,
  onClearRoutine,
  onSelectCourse
}) => {
  const stats = calculateStatistics(selectedSections);

  // UIU credit evaluation:
  // Typical trimester load: 9.0 to 15.0 credits
  const isOptimalLoad = stats.totalCredits >= 9 && stats.totalCredits <= 15;
  const isUnderload = stats.totalCredits > 0 && stats.totalCredits < 9;
  const isOverload = stats.totalCredits > 15;

  return (
    <div className="w-full space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Credits */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Credits</span>
            <Award className="w-4 h-4 text-orange-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.totalCredits}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Credits</span>
          </div>
          <div className="text-[11px] font-medium flex items-center gap-1.5">
            {isOptimalLoad && (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Optimal UIU Load (9–15 Cr)
              </span>
            )}
            {isUnderload && (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Underload (&lt;9 Cr)
              </span>
            )}
            {isOverload && (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Overload (&gt;15 Cr)
              </span>
            )}
            {stats.totalCredits === 0 && (
              <span className="text-slate-400">No courses selected yet</span>
            )}
          </div>
        </div>

        {/* Total Courses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Courses Count</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.courseCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Courses</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>{stats.theoryCount} Theory</span>
            <span aria-hidden="true">·</span>
            <span>{stats.labCount} Lab</span>
          </div>
        </div>

        {/* Busy Days */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Class Days</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.busyDays.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Days/Week</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {stats.busyDays.length > 0 ? stats.busyDays.join(', ') : 'None'}
          </div>
        </div>

        {/* Free Days */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Free Days</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.freeDays.length}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Off Days</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {stats.freeDays.length > 0 ? stats.freeDays.join(', ') : 'No free weekdays'}
          </div>
        </div>
      </div>

      {/* Daily Workload Breakdown & Selected Section Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Schedule Hours */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Weekly Hours Breakdown
          </h4>

          <div className="space-y-3">
            {Object.entries(stats.dayHours).map(([day, hours]) => {
              const maxDayHours = 6;
              const percentage = Math.min(100, (hours / maxDayHours) * 100);

              return (
                <div key={day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{day}</span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {hours.toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full rounded-full transition-all ${
                        hours > 4 ? 'bg-orange-500' : hours > 0 ? 'bg-emerald-500' : 'bg-transparent'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Course List Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Selected Routine Courses ({selectedSections.length})
              </h4>
              {selectedSections.length > 0 && (
                <button
                  onClick={onClearRoutine}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {selectedSections.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                You haven&apos;t added any courses to your routine yet. Use the Course Planner to select courses and sections.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 pb-2">
                      <th className="py-2">Course</th>
                      <th className="py-2">Section</th>
                      <th className="py-2">Faculty</th>
                      <th className="py-2">Days & Time</th>
                      <th className="py-2">Room</th>
                      <th className="py-2 text-right">Cr</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedSections.map(sec => (
                      <tr key={sec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 font-bold font-mono">
                          <button
                            onClick={() => onSelectCourse && onSelectCourse(sec.courseCode)}
                            className="text-left hover:text-orange-600 transition-colors flex items-center gap-1 group"
                          >
                            <span>{sec.courseCode}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                          </button>
                          <div className="text-[10px] font-sans font-normal text-slate-500 truncate max-w-[150px]">
                            {sec.courseTitle}
                          </div>
                        </td>
                        <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                          {sec.section}
                        </td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-400">
                          <div>{sec.facultyInitial}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {sec.facultyName}
                          </div>
                        </td>
                        <td className="py-2.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          <div>{sec.day2 ? `${sec.day1} & ${sec.day2}` : sec.day1}</div>
                          <div className="text-[10px] text-slate-400">{sec.time1}</div>
                        </td>
                        <td className="py-2.5 font-mono text-slate-600 dark:text-slate-400">
                          {sec.room1}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-right text-slate-800 dark:text-slate-200">
                          {sec.credit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Ready to print or save your schedule?
            </span>
            <button
              onClick={onOpenExport}
              disabled={selectedSections.length === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-xs transition-all cursor-pointer"
            >
              Export as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
