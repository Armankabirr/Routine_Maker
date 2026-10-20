import React, { useState, useMemo, useEffect } from 'react';
import initialRoutineData from './data/routineData.json';
import { SectionItem, ScheduleConflict } from './types/routine';
import {
  groupSectionsByCourse,
  checkConflicts,
  calculateStatistics
} from './utils/routineUtils';
import { Header } from './components/Header';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { CourseCard } from './components/CourseCard';
import { SectionTable } from './components/SectionTable';
import { ConflictAlert } from './components/ConflictAlert';
import { FacultySearch } from './components/FacultySearch';
import { FilterBar, FilterOptions } from './components/FilterBar';
import { StatisticsPanel } from './components/StatisticsPanel';
import { ExportModal } from './components/ExportModal';
import { UploadModal } from './components/UploadModal';
import {
  Calendar,
  Layers,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Upload,
  RotateCcw,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle2
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

  // Main dataset state (allows uploading updated PDF / JSON)
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

  // Student's selected sections (manual selection only)
  const [selectedSections, setSelectedSections] = useState<SectionItem[]>(() => {
    try {
      const saved = localStorage.getItem('uiu_planned_sections_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    // Default initial example courses to showcase the app immediately
    const defaultCodes = [
      { code: 'CSE 4165', sec: 'A' },
      { code: 'CSE 4889', sec: 'B' },
      { code: 'CSE 4451', sec: 'A' }
    ];
    return typedInitialData.filter(item =>
      defaultCodes.some(d => d.code === item.courseCode && d.sec === item.section)
    );
  });

  // Save selected sections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uiu_planned_sections_v1', JSON.stringify(selectedSections));
    } catch {
      // storage unavailable
    }
  }, [selectedSections]);

  // Courses explicitly pinned by the student to their active planning deck
  const [pinnedCourseCodes, setPinnedCourseCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('uiu_pinned_courses_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['CSE 4165', 'CSE 4889', 'CSE 4451', 'EEE 4261', 'CSE 3811', 'MATH 2205'];
  });

  useEffect(() => {
    try {
      localStorage.setItem('uiu_pinned_courses_v1', JSON.stringify(pinnedCourseCodes));
    } catch {
      // ignore
    }
  }, [pinnedCourseCodes]);

  // Section drawer open state (course code -> boolean)
  const [expandedCourseCode, setExpandedCourseCode] = useState<string | null>('CSE 4165');

  // Conflict modal state
  const [conflictState, setConflictState] = useState<{
    candidateSection: SectionItem;
    conflicts: ScheduleConflict[];
  } | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    timeSlot: 'all',
    day: 'all',
    type: 'all',
    program: 'all'
  });

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Calculate live statistics
  const stats = useMemo(() => {
    return calculateStatistics(selectedSections);
  }, [selectedSections]);

  // Find all current conflicts among selected sections
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

  // Filter courses based on filters
  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      // Program filter
      if (filters.program !== 'all' && course.program !== filters.program) {
        return false;
      }

      // Type filter
      if (filters.type === 'lab' && !course.isLab) return false;
      if (filters.type === 'theory' && course.isLab) return false;

      // Text query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesCode = course.courseCode.toLowerCase().includes(q);
        const matchesTitle = course.courseTitle.toLowerCase().includes(q);
        const matchesFaculty = course.sections.some(
          s =>
            s.facultyName.toLowerCase().includes(q) ||
            s.facultyInitial.toLowerCase().includes(q)
        );
        if (!matchesCode && !matchesTitle && !matchesFaculty) {
          return false;
        }
      }

      // Day filter
      if (filters.day !== 'all') {
        const hasDay = course.sections.some(s => s.day1 === filters.day || s.day2 === filters.day);
        if (!hasDay) return false;
      }

      // TimeSlot filter (morning < 12:00 PM (720m), afternoon >= 12:00 PM)
      if (filters.timeSlot === 'morning') {
        const hasMorning = course.sections.some(s =>
          s.schedules.some(sl => sl.startMinutes < 720)
        );
        if (!hasMorning) return false;
      } else if (filters.timeSlot === 'afternoon') {
        const hasAfternoon = course.sections.some(s =>
          s.schedules.some(sl => sl.startMinutes >= 720)
        );
        if (!hasAfternoon) return false;
      }

      return true;
    });
  }, [allCourses, filters]);

  // Pinned courses list
  const pinnedCourses = useMemo(() => {
    return allCourses.filter(c => pinnedCourseCodes.includes(c.courseCode));
  }, [allCourses, pinnedCourseCodes]);

  // Handler: Selecting a section
  const handleSelectSection = (candidate: SectionItem, detectedConflicts: ScheduleConflict[]) => {
    if (detectedConflicts.length > 0) {
      // DO NOT automatically add. Show conflict modal!
      setConflictState({
        candidateSection: candidate,
        conflicts: detectedConflicts
      });
      return;
    }

    // Add or replace existing section of the same course
    setSelectedSections(prev => {
      const filtered = prev.filter(s => s.courseCode !== candidate.courseCode);
      return [...filtered, candidate];
    });

    // Also ensure this course is in pinned deck
    if (!pinnedCourseCodes.includes(candidate.courseCode)) {
      setPinnedCourseCodes(prev => [...prev, candidate.courseCode]);
    }
  };

  // Handler: Confirm replace conflicting section
  const handleResolveConflictReplace = (
    candidate: SectionItem,
    conflictsToReplace: ScheduleConflict[]
  ) => {
    const conflictingIds = new Set(conflictsToReplace.map(c => c.existingSection.id));
    setSelectedSections(prev => {
      // Remove conflicting sections and same-course sections
      const kept = prev.filter(
        s => !conflictingIds.has(s.id) && s.courseCode !== candidate.courseCode
      );
      return [...kept, candidate];
    });
    setConflictState(null);
  };

  // Handler: Deselect / remove section from routine
  const handleDeselectSection = (sectionId: string) => {
    setSelectedSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const handleDeselectCourse = (courseCode: string) => {
    setSelectedSections(prev => prev.filter(s => s.courseCode !== courseCode));
  };

  const handlePinCourse = (courseCode: string) => {
    if (!pinnedCourseCodes.includes(courseCode)) {
      setPinnedCourseCodes(prev => [...prev, courseCode]);
      setExpandedCourseCode(courseCode);
    }
  };

  const handleUnpinCourse = (courseCode: string) => {
    setPinnedCourseCodes(prev => prev.filter(c => c !== courseCode));
    // also remove from routine if user wants
    handleDeselectCourse(courseCode);
    if (expandedCourseCode === courseCode) {
      setExpandedCourseCode(null);
    }
  };

  const handleClearRoutine = () => {
    setSelectedSections([]);
  };

  const handleResetOfficial = () => {
    setAllSections(typedInitialData);
  };

  const handleNavigateToCourse = (courseCode: string) => {
    setCurrentTab('planner');
    handlePinCourse(courseCode);
    setExpandedCourseCode(courseCode);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        {/* Hero Banner with Glassmorphism */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-6 sm:p-10 shadow-xl border border-slate-700/50">
          {/* Subtle geometric background blur elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-orange-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>UIU Fall 2026 Trimester Pre-Registration</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Plan Your Routine Before Section Selection Starts
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Compare every section, faculty member, room, and timing across BSCSE &amp; BSDS.
                Build your weekly timetable manually with real-time clash alerts and credit tracking.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setCurrentTab('planner');
                    const element = document.getElementById('planner-workspace');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2"
                >
                  <span>Start Planning Routine</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-98 text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/15 transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-orange-400" />
                  <span>Upload Routine PDF</span>
                </button>

                <button
                  onClick={() => setCurrentTab('calendar')}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>View Timetable</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium">Database Sections</div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {allSections.length}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Fall 2026 Verified</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium">Offered Courses</div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 tabular-nums">
                  {allCourses.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">BSCSE &amp; BSDS</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium">Your Routine Load</div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-orange-400 mt-1 tabular-nums">
                  {stats.totalCredits} Cr
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5">
                  {selectedSections.length} Courses Selected
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="text-[11px] text-slate-400 font-medium">Schedule Clashes</div>
                <div
                  className={`text-xl sm:text-2xl font-bold font-mono mt-1 tabular-nums ${
                    currentActiveConflicts.length > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {currentActiveConflicts.length}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {currentActiveConflicts.length === 0 ? 'Zero Overlaps' : 'Needs attention'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conflict Warning Toast if active clashes exist */}
        {currentActiveConflicts.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold">
                  {currentActiveConflicts.length} Schedule Conflict Detected in Your Routine
                </div>
                <div className="text-xs text-rose-700 dark:text-rose-300">
                  {currentActiveConflicts[0].existingSection.courseCode} clashes with{' '}
                  {currentActiveConflicts[0].conflictingSection.courseCode} on{' '}
                  {currentActiveConflicts[0].day}. Change one of their sections to avoid registration failure.
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentTab('calendar')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
            >
              Inspect Calendar
            </button>
          </div>
        )}

        {/* Tab 1: Planner Workspace */}
        {currentTab === 'planner' && (
          <div id="planner-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Course Search, Selection, and Section Browser (7 cols on Desktop) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Filter & Search Bar */}
              <FilterBar
                filters={filters}
                setFilters={setFilters}
                totalMatching={filteredCourses.length}
              />

              {/* My Selected Courses Deck (Pinned) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-orange-600" />
                      <span>My Planned Courses ({pinnedCourses.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Choose your sections manually for each course. Sections sync instantly with your calendar.
                    </p>
                  </div>

                  {selectedSections.length > 0 && (
                    <button
                      onClick={handleClearRoutine}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {pinnedCourses.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      No courses in your active planning deck yet. Add courses below to begin choosing sections.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pinnedCourses.map(course => {
                      const selectedSec = selectedSections.find(s => s.courseCode === course.courseCode);
                      const isExpanded = expandedCourseCode === course.courseCode;

                      return (
                        <div key={course.courseCode} className="space-y-2">
                          <CourseCard
                            course={course}
                            selectedSection={selectedSec}
                            isOpen={isExpanded}
                            onToggle={() =>
                              setExpandedCourseCode(isExpanded ? null : course.courseCode)
                            }
                            onRemoveFromSelection={() => handleUnpinCourse(course.courseCode)}
                            allCourseCodes={allCourseCodes}
                          />

                          {/* Inline Section Browser if Expanded */}
                          {isExpanded && (
                            <SectionTable
                              courseCode={course.courseCode}
                              courseTitle={course.courseTitle}
                              sections={course.sections}
                              selectedSections={selectedSections}
                              onSelectSection={handleSelectSection}
                              onDeselectCourse={handleDeselectCourse}
                              onFacultyClick={faculty => {
                                setCurrentTab('faculty');
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Browse All Other Offered Courses */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-blue-600" />
                    <span>All Available UIU Courses ({filteredCourses.length})</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Click &apos;Add&apos; or view sections to enroll
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredCourses
                    .filter(c => !pinnedCourseCodes.includes(c.courseCode))
                    .map(course => (
                      <div
                        key={course.courseCode}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {course.courseCode}
                            </span>
                            <span className="text-slate-400 font-mono">· {course.credit} Cr</span>
                            <span className="text-slate-400">· {course.sections.length} sec</span>
                            {course.isLab && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded-xs">
                                Lab
                              </span>
                            )}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400 truncate mt-0.5 font-medium">
                            {course.courseTitle}
                          </div>
                        </div>

                        <button
                          onClick={() => handlePinCourse(course.courseCode)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-orange-600 hover:text-white dark:bg-slate-800 dark:hover:bg-orange-600 font-semibold text-slate-700 dark:text-slate-300 transition-all text-xs shrink-0 flex items-center gap-1"
                        >
                          <span>Add to Plan</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Column: Live Calendar View (5 cols on Desktop) */}
            <div className="lg:col-span-5 sticky top-20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span>Live Weekly Timetable</span>
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{stats.totalCredits} Credits Selected</span>
                    <span aria-hidden="true">·</span>
                    <span>{stats.busyDays.length} Days Active</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExportOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    Export
                  </button>
                </div>
              </div>

              {/* Weekly Calendar Component */}
              <div className="w-full">
                <WeeklyCalendar
                  selectedSections={selectedSections}
                  allCourseCodes={allCourseCodes}
                  conflicts={currentActiveConflicts}
                  onRemoveSection={handleDeselectSection}
                  onSelectCourse={code => handleNavigateToCourse(code)}
                />
              </div>

              {/* Mini Quick Summary Footer */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Workload:
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {stats.theoryCount} Theory, {stats.labCount} Labs
                  </span>
                </div>
                <button
                  onClick={() => setCurrentTab('stats')}
                  className="text-orange-600 dark:text-orange-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Detailed Summary</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full-Width Weekly Calendar */}
        {currentTab === 'calendar' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span>Full-Screen Weekly Routine Timetable</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprehensive 5-day schedule from 8:30 AM to 4:30 PM with lab and theory classes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs"
                >
                  Export PDF / PNG
                </button>
              </div>
            </div>

            <WeeklyCalendar
              selectedSections={selectedSections}
              allCourseCodes={allCourseCodes}
              conflicts={currentActiveConflicts}
              onRemoveSection={handleDeselectSection}
              onSelectCourse={code => handleNavigateToCourse(code)}
            />
          </div>
        )}

        {/* Tab 3: Faculty Directory */}
        {currentTab === 'faculty' && (
          <div className="animate-in fade-in">
            <FacultySearch
              allSections={allSections}
              selectedSections={selectedSections}
              onSelectSection={handleSelectSection}
              onNavigateToCourse={handleNavigateToCourse}
            />
          </div>
        )}

        {/* Tab 4: Detailed Statistics & Routine Summary */}
        {currentTab === 'stats' && (
          <div className="animate-in fade-in">
            <StatisticsPanel
              selectedSections={selectedSections}
              onOpenExport={() => setIsExportOpen(true)}
              onClearRoutine={handleClearRoutine}
              onSelectCourse={handleNavigateToCourse}
            />
          </div>
        )}
      </main>

      {/* Conflict Detection Modal */}
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
        onResetOfficial={handleResetOfficial}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              UIU Fall 2026 Routine Planner
            </span>
            <span>·</span>
            <span>United International University</span>
          </div>
          <div>
            Built for UIU students to plan their weekly schedules before section registration.
          </div>
        </div>
      </footer>
    </div>
  );
}
