import React from 'react';
import { SectionItem, ScheduleConflict } from '../types/routine';
import { AlertTriangle, ArrowRight, X, ShieldAlert } from 'lucide-react';

interface ConflictAlertProps {
  conflictData: {
    candidateSection: SectionItem;
    conflicts: ScheduleConflict[];
  } | null;
  onCancel: () => void;
  onReplace: (candidateSection: SectionItem, conflictsToReplace: ScheduleConflict[]) => void;
}

export const ConflictAlert: React.FC<ConflictAlertProps> = ({
  conflictData,
  onCancel,
  onReplace
}) => {
  if (!conflictData) return null;

  const { candidateSection, conflicts } = conflictData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-2xl overflow-hidden p-6 sm:p-7 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Schedule Conflict Detected
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                The section you clicked overlaps with an existing class in your routine
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detailed Comparison */}
        <div className="space-y-3">
          {conflicts.map((conf, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col gap-2.5 text-xs"
            >
              <div className="flex items-center justify-between font-semibold text-rose-800 dark:text-rose-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Clash on {conf.day}</span>
                </span>
                <span className="font-mono text-[11px] bg-rose-200/60 dark:bg-rose-900/60 px-2 py-0.5 rounded-md text-rose-900 dark:text-rose-200">
                  {conf.timeOverlap}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                {/* Existing Section */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                    Currently Selected
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {conf.existingSection.courseCode} (Sec {conf.existingSection.section})
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {conf.existingSection.courseTitle}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    Faculty: {conf.existingSection.facultyInitial} · Room: {conf.existingSection.room1}
                  </div>
                </div>

                {/* Candidate Section */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 block mb-0.5">
                    Attempted Selection
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {candidateSection.courseCode} (Sec {candidateSection.section})
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {candidateSection.courseTitle}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    Faculty: {candidateSection.facultyInitial} · Room: {candidateSection.room1}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Warning text */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          UIU does not permit conflicting class schedules during registration. You can keep your current routine or replace the conflicting course.
        </p>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Keep Current Routine
          </button>

          <button
            onClick={() => onReplace(candidateSection, conflicts)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:scale-98 text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Replace Conflicting Class</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
