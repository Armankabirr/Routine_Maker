import React, { useState, useMemo } from 'react';
import { SectionItem, ScheduleConflict } from '../types/routine';
import { checkConflicts } from '../utils/routineUtils';
import { Search, User, BookOpen, Clock, MapPin, Check, AlertTriangle, ArrowRight } from 'lucide-react';

interface FacultySearchProps {
  allSections: SectionItem[];
  selectedSections: SectionItem[];
  onSelectSection: (section: SectionItem, conflicts: ScheduleConflict[]) => void;
  onDeselectSection?: (sectionId: string) => void;
  onNavigateToCourse: (courseCode: string) => void;
}

export const FacultySearch: React.FC<FacultySearchProps> = ({
  allSections,
  selectedSections,
  onSelectSection,
  onDeselectSection,
  onNavigateToCourse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);

  // Group sections by faculty
  const facultyDirectory = useMemo(() => {
    const map = new Map<string, { facultyName: string; facultyInitial: string; sections: SectionItem[] }>();

    for (const sec of allSections) {
      if (!sec.facultyName || sec.facultyName === 'TBA') continue;

      const key = sec.facultyName.trim();
      if (!map.has(key)) {
        map.set(key, {
          facultyName: key,
          facultyInitial: sec.facultyInitial,
          sections: []
        });
      }
      map.get(key)!.sections.push(sec);
    }

    return Array.from(map.values()).sort((a, b) => a.facultyName.localeCompare(b.facultyName));
  }, [allSections]);

  // Filter faculties based on search query
  const filteredFaculties = useMemo(() => {
    if (!searchQuery.trim()) return facultyDirectory;
    const q = searchQuery.toLowerCase().trim();
    return facultyDirectory.filter(
      f =>
        f.facultyName.toLowerCase().includes(q) ||
        f.facultyInitial.toLowerCase().includes(q) ||
        f.sections.some(s => s.courseCode.toLowerCase().includes(q) || s.courseTitle.toLowerCase().includes(q))
    );
  }, [facultyDirectory, searchQuery]);

  // Active faculty view
  const activeFacultyData = useMemo(() => {
    if (selectedFaculty) {
      return facultyDirectory.find(f => f.facultyName === selectedFaculty);
    }
    return filteredFaculties.length > 0 ? filteredFaculties[0] : null;
  }, [facultyDirectory, selectedFaculty, filteredFaculties]);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      {/* Header with Search Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              <span>UIU Faculty Directory & Routine Search</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Search by faculty name or initials (e.g. Sadia Islam, MNH, Tanvir Raihan) to view all their classes
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search faculty name / initials..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 dark:focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2-Column Split: Faculty List & Faculty Offerings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
        {/* Left column: Faculty list */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 max-h-[220px] sm:max-h-[300px] lg:max-h-[580px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          <div className="p-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10 flex items-center justify-between">
            <span>Faculties ({filteredFaculties.length})</span>
            <span className="text-[10px] text-slate-400 lg:hidden">Tap to view</span>
          </div>

          {filteredFaculties.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No faculty matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredFaculties.map(fac => {
              const isSelected = activeFacultyData?.facultyName === fac.facultyName;
              const hasClassInRoutine = fac.sections.some(s =>
                selectedSections.some(sel => sel.id === s.id)
              );

              return (
                <button
                  key={fac.facultyName}
                  onClick={() => setSelectedFaculty(fac.facultyName)}
                  className={`w-full text-left p-3.5 transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-950 dark:text-white font-medium'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold truncate">
                      {fac.facultyName}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                      <span>{fac.facultyInitial}</span>
                      <span>·</span>
                      <span>{fac.sections.length} Section{fac.sections.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {hasClassInRoutine && (
                    <span className="shrink-0 text-[10px] bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-bold px-1.5 py-0.5 rounded-md">
                      In Routine
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Right column: Sections taught by the selected faculty */}
        <div className="lg:col-span-8 p-5 sm:p-6 overflow-y-auto max-h-[550px] space-y-4">
          {activeFacultyData ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeFacultyData.facultyName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    <span>Initial: {activeFacultyData.facultyInitial}</span>
                    <span>·</span>
                    <span>Total Allocated Classes: {activeFacultyData.sections.length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {activeFacultyData.sections.map(sec => {
                  const isCurrent = selectedSections.some(s => s.id === sec.id);
                  const conflicts = checkConflicts(sec, selectedSections);
                  const hasConflict = conflicts.length > 0;

                  return (
                    <div
                      key={sec.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800'
                          : hasConflict
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onNavigateToCourse(sec.courseCode)}
                            className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-orange-600 transition-colors font-mono flex items-center gap-1 group"
                          >
                            <span>{sec.courseCode}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <span className="font-semibold text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Section {sec.section}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {sec.credit} Cr
                          </span>
                          {sec.isLab && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-xs">
                              Lab
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {sec.courseTitle}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {sec.day2 ? `${sec.day1} & ${sec.day2}` : sec.day1}: {sec.time1}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>Room: {sec.room1}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent ? (
                          <button
                            onClick={() => onDeselectSection && onDeselectSection(sec.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold px-3 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                            title="Click to deselect"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Selected</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectSection(sec, conflicts)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-98 flex items-center gap-1.5 ${
                              hasConflict
                                ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200'
                                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xs'
                            }`}
                          >
                            {hasConflict ? (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                <span>Choose (Clash)</span>
                              </>
                            ) : (
                              <span>Choose Section</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs py-16">
              Select a faculty to inspect schedule and sections
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
