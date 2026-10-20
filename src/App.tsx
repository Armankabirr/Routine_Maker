import React, { useState, useMemo, useEffect, useRef } from 'react';
import initialRoutineData from './data/routineData.json';
import { SectionItem, ScheduleConflict } from './types/routine';
import {
  groupSectionsByCourse,
  calculateStatistics
} from './utils/routineUtils';
import { Header } from './components/Header';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { PlanningProgressBar } from './components/PlanningProgressBar';
import { SelectedCoursesAccordion } from './components/SelectedCoursesAccordion';
import { CourseExplorer } from './components/CourseExplorer';
import { ConflictAlert } from './components/ConflictAlert';
import { FacultySearch } from './components/FacultySearch';
import { StatisticsPanel } from './components/StatisticsPanel';
import { ExportModal } from './components/ExportModal';
import { UploadModal } from './components/UploadModal';
import {
  Calendar,
  Sparkles,
  Download,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const typedInitialData = initialRoutineData as SectionItem[];

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('uiu_routine_dark') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('uiu_routine_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('uiu_routine_dark', 'false');
    }
  }, [darkMode]);

  // Main routine dataset state
  const [allSections, setAllSections] = useState<SectionItem[]>(typedInitialData);

  // Grouped courses
  const allCourses = useMemo(() => {
    return groupSectionsByCourse(allSections);
  }, [allSections]);

  const allCourseCodes = useMemo(() => {
    return allCourses.map(c => c.courseCode);
  }, [allCourses]);

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<'planner' | 'calendar' | 'faculty' | 'stats'>('planner');

  // Courses added to the student's planner (initially empty per requested workflow)
  const [addedCourseCodes, setAddedCourseCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('uiu_added_courses_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('uiu_added_courses_v2', JSON.stringify(addedCourseCodes));
    } catch {
      // ignore
    }
  }, [addedCourseCodes]);

  // Selected sections for timetable (initially empty)
  const [selectedSections, setSelectedSections] = useState<SectionItem[]>(() => {
    try {
      const saved = localStorage.getItem('uiu_selected_sections_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('uiu_selected_sections_v2', JSON.stringify(selectedSections));
    } catch {
      // ignore
    }
  }, [selectedSections]);

  // Single course expanded in accordion
  const [expandedCourseCode, setExpandedCourseCode] = useState<string | null>(null);

  // Conflict modal state
  const [conflictState, setConflictState] = useState<{
    candidateSection: SectionItem;
    conflicts: ScheduleConflict[];
  } | null>(null);

  // Export & Upload modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Reference to selected courses panel for auto-scrolling
  const selectedPanelRef = useRef<HTMLDivElement>(null);

  // Added courses objects
  const addedCourses = useMemo(() => {
    return allCourses.filter(c => addedCourseCodes.includes(c.courseCode));
  }, [allCourses, addedCourseCodes]);

  // Live statistics
  const stats = useMemo(() => {
    return calculateStatistics(selectedSections);
  }, [selectedSections]);

  // Active clashes
  const currentActiveConflicts = useMemo(() => {
    const clashes: ScheduleConflict[] = [];
    for (let i = 0; i < selectedSections.length; i++) {
      for (let j = i + 1; j < selectedSections.length; j++) {
        const secA = selectedSections[i];
        const secB = selectedSections[j];
        for (const slotA of secA.schedules) {
          for (const slotB of secB.schedules) {
            if (slotA.day === slotB.day) {
              const overlap =
                slotA.startMinutes < slotB.endMinutes &&
                slotB.startMinutes < slotA.endMinutes;
              if (overlap) {
                clashes.push({
                  existingSection: secA,
                  conflictingSection: secB,
                  day: slotA.day,
                  timeOverlap: `${slotA.time} vs ${slotB.time}`
                });
              }
            }
          }
        }
      }
    }
    return clashes;
  }, [selectedSections]);

  // Workflow Handlers:
  // 1. Add course to planner
  const handleAddCourse = (courseCode: string) => {
    if (!addedCourseCodes.includes(courseCode)) {
      setAddedCourseCodes(prev => [...prev, courseCode]);
      // Open the accordion for this newly added course so the student can immediately pick a section
      setExpandedCourseCode(courseCode);
      // Smooth scroll up to selected courses
      selectedPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 2. Remove course from planner
  const handleRemoveCourse = (courseCode: string) => {
    setAddedCourseCodes(prev => prev.filter(c => c !== courseCode));
    setSelectedSections(prev => prev.filter(s => s.courseCode !== courseCode));
    if (expandedCourseCode === courseCode) {
      setExpandedCourseCode(null);
    }
  };

  // 3. Toggle accordion
  const handleToggleCourse = (courseCode: string) => {
    setExpandedCourseCode(prev => (prev === courseCode ? null : courseCode));
  };

  // 4. Select section (manual only)
  const handleSelectSection = (candidate: SectionItem, detectedConflicts: ScheduleConflict[]) => {
    if (detectedConflicts.length > 0) {
      setConflictState({
        candidateSection: candidate,
        conflicts: detectedConflicts
      });
      return;
    }

    // Replace if this course already had a section selected
    setSelectedSections(prev => {
      const filtered = prev.filter(s => s.courseCode !== candidate.courseCode);
      return [...filtered, candidate];
    });
  };

  // 5. Replace conflicting section
  const handleResolveConflictReplace = (
    candidate: SectionItem,
    conflictsToReplace: ScheduleConflict[]
  ) => {
    const conflictingIds = new Set(conflictsToReplace.map(c => c.existingSection.id));
    setSelectedSections(prev => {
      const kept = prev.filter(
        s => !conflictingIds.has(s.id) && s.courseCode !== candidate.courseCode
      );
      return [...kept, candidate];
    });
    setConflictState(null);
  };

  // 6. Remove section directly from timetable
  const handleRemoveSectionFromCalendar = (sectionId: string) => {
    setSelectedSections(prev => prev.filter(s => s.id !== sectionId));
  };

  // 7. Clear all planner state
  const handleClearAll = () => {
    setAddedCourseCodes([]);
    setSelectedSections([]);
    setExpandedCourseCode(null);
  };

  // 8. Navigation helper from faculty or calendar
  const handleNavigateToCourse = (courseCode: string) => {
    setCurrentTab('planner');
    if (!addedCourseCodes.includes(courseCode)) {
      setAddedCourseCodes(prev => [...prev, courseCode]);
    }
    setExpandedCourseCode(courseCode);
    selectedPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        selectedCount={selectedSections.length}
        totalCredits={stats.totalCredits}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Planner Tab (Redesigned 2-Column Clean Layout) */}
        {currentTab === 'planner' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Visual Planning Progress Indicator */}
            <PlanningProgressBar
              coursesAddedCount={addedCourseCodes.length}
              sectionsSelectedCount={selectedSections.length}
              totalCredits={stats.totalCredits}
            />

            {/* Modern Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Side: Course Selection & Explorer (7 cols) */}
              <div className="lg:col-span-7 space-y-8">
                {/* 1. Selected Courses Panel (Accordion) */}
                <div ref={selectedPanelRef} className="scroll-mt-24">
                  <SelectedCoursesAccordion
                    addedCourses={addedCourses}
                    selectedSections={selectedSections}
                    allCourseCodes={allCourseCodes}
                    expandedCourseCode={expandedCourseCode}
                    onToggleCourse={handleToggleCourse}
                    onSelectSection={handleSelectSection}
                    onDeselectSection={handleRemoveSectionFromCalendar}
                    onRemoveCourse={handleRemoveCourse}
                    onBrowseCoursesClick={() => {
                      const el = document.getElementById('course-explorer-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                </div>

                {/* 2. Course Explorer (Large Search + Filter Chips + Large Cards) */}
                <div id="course-explorer-section" className="scroll-mt-24 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <CourseExplorer
                    allCourses={allCourses}
                    addedCourseCodes={addedCourseCodes}
                    allCourseCodes={allCourseCodes}
                    onAddCourse={handleAddCourse}
                  />
                </div>
              </div>

              {/* Right Side: Fixed/Sticky Timetable (5 cols) */}
              <div className="lg:col-span-5 sticky top-20 space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span>Live Weekly Timetable</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Saturday – Wednesday · Updates instantly as you select sections
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedSections.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-slate-400 hover:text-rose-500 font-medium transition-colors p-1"
                        title="Reset all selected courses and timetable"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => setIsExportOpen(true)}
                      disabled={selectedSections.length === 0}
                      className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Weekly Timetable Component with empty state */}
                <div className="w-full">
                  <WeeklyCalendar
                    selectedSections={selectedSections}
                    allCourseCodes={allCourseCodes}
                    conflicts={currentActiveConflicts}
                    onRemoveSection={handleRemoveSectionFromCalendar}
                    onSelectCourse={code => handleNavigateToCourse(code)}
                  />
                </div>

                {/* Quick Info Footer under Timetable */}
                {selectedSections.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {stats.totalCredits} Credits Planned
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        {stats.theoryCount} Theory · {stats.labCount} Lab · {stats.busyDays.length} Active Days
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentTab('stats')}
                      className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      View Full Analysis →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Screen Calendar */}
        {currentTab === 'calendar' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span>Full-Screen Weekly Routine Timetable</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  5-day weekly schedule from 8:30 AM to 4:30 PM with lab and theory classes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExportOpen(true)}
                  disabled={selectedSections.length === 0}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF / PNG</span>
                </button>
              </div>
            </div>

            <WeeklyCalendar
              selectedSections={selectedSections}
              allCourseCodes={allCourseCodes}
              conflicts={currentActiveConflicts}
              onRemoveSection={handleRemoveSectionFromCalendar}
              onSelectCourse={code => handleNavigateToCourse(code)}
            />
          </div>
        )}

        {/* Tab 3: Faculty Search */}
        {currentTab === 'faculty' && (
          <div className="animate-in fade-in duration-200">
            <FacultySearch
              allSections={allSections}
              selectedSections={selectedSections}
              onSelectSection={handleSelectSection}
              onDeselectSection={handleRemoveSectionFromCalendar}
              onNavigateToCourse={handleNavigateToCourse}
            />
          </div>
        )}

        {/* Tab 4: Routine Summary & Stats */}
        {currentTab === 'stats' && (
          <div className="animate-in fade-in duration-200">
            <StatisticsPanel
              selectedSections={selectedSections}
              onOpenExport={() => setIsExportOpen(true)}
              onClearRoutine={handleClearAll}
              onSelectCourse={handleNavigateToCourse}
            />
          </div>
        )}
      </main>

      {/* Conflict Modal */}
      <ConflictAlert
        conflictData={conflictState}
        onCancel={() => setConflictState(null)}
        onReplace={handleResolveConflictReplace}
      />

      {/* Export Routine Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        selectedSections={selectedSections}
        allCourseCodes={allCourseCodes}
      />

      {/* Upload Routine Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={data => {
          setAllSections(data);
          setIsUploadOpen(false);
        }}
        currentCount={allSections.length}
        onResetOfficial={() => setAllSections(typedInitialData)}
      />

      {/* Minimal clean footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              UIU Fall 2026 Routine Planner
            </span>
            <span>·</span>
            <span>United International University</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Pre-Registration Planning Tool</span>
            <span>·</span>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="hover:underline text-orange-600 dark:text-orange-400"
            >
              Update Routine PDF
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
