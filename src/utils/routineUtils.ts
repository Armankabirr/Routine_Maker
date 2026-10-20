import { SectionItem, ScheduleSlot, ScheduleConflict, RoutineStatistics, CourseGroup } from '../types/routine';

export const DAYS_OF_WEEK: Array<'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday'> = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday'
];

export const STANDARD_THEORY_SLOTS = [
  { label: '08:30 - 09:50', startMinutes: 8 * 60 + 30, endMinutes: 9 * 60 + 50 },
  { label: '09:51 - 11:10', startMinutes: 9 * 60 + 51, endMinutes: 11 * 60 + 10 },
  { label: '11:11 - 12:30', startMinutes: 11 * 60 + 11, endMinutes: 12 * 60 + 30 },
  { label: '12:31 - 01:50', startMinutes: 12 * 60 + 31, endMinutes: 13 * 60 + 50 },
  { label: '01:51 - 03:10', startMinutes: 13 * 60 + 51, endMinutes: 15 * 60 + 10 },
  { label: '03:11 - 04:30', startMinutes: 15 * 60 + 11, endMinutes: 16 * 60 + 30 }
];

// Elegant color palette for distinct courses in schedule
export const COURSE_PALETTES = [
  {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    border: 'border-indigo-400 dark:border-indigo-500/50',
    text: 'text-indigo-800 dark:text-indigo-200',
    badge: 'bg-indigo-500 text-white',
    accent: '#6366F1'
  },
  {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-400 dark:border-emerald-500/50',
    text: 'text-emerald-800 dark:text-emerald-200',
    badge: 'bg-emerald-500 text-white',
    accent: '#10B981'
  },
  {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    border: 'border-amber-400 dark:border-amber-500/50',
    text: 'text-amber-800 dark:text-amber-200',
    badge: 'bg-amber-500 text-white',
    accent: '#F59E0B'
  },
  {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    border: 'border-rose-400 dark:border-rose-500/50',
    text: 'text-rose-800 dark:text-rose-200',
    badge: 'bg-rose-500 text-white',
    accent: '#F43F5E'
  },
  {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    border: 'border-cyan-400 dark:border-cyan-500/50',
    text: 'text-cyan-800 dark:text-cyan-200',
    badge: 'bg-cyan-500 text-white',
    accent: '#06B6D4'
  },
  {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    border: 'border-purple-400 dark:border-purple-500/50',
    text: 'text-purple-800 dark:text-purple-200',
    badge: 'bg-purple-500 text-white',
    accent: '#A855F7'
  },
  {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    border: 'border-blue-400 dark:border-blue-500/50',
    text: 'text-blue-800 dark:text-blue-200',
    badge: 'bg-blue-500 text-white',
    accent: '#3B82F6'
  },
  {
    bg: 'bg-teal-500/10 dark:bg-teal-500/20',
    border: 'border-teal-400 dark:border-teal-500/50',
    text: 'text-teal-800 dark:text-teal-200',
    badge: 'bg-teal-500 text-white',
    accent: '#14B8A6'
  },
  {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    border: 'border-orange-400 dark:border-orange-500/50',
    text: 'text-orange-800 dark:text-orange-200',
    badge: 'bg-orange-500 text-white',
    accent: '#F97316'
  }
];

export function getCoursePalette(courseCode: string, allCourses: string[]) {
  const index = allCourses.indexOf(courseCode);
  if (index === -1) {
    let hash = 0;
    for (let i = 0; i < courseCode.length; i++) {
      hash = (hash << 5) - hash + courseCode.charCodeAt(i);
    }
    const safeIdx = Math.abs(hash) % COURSE_PALETTES.length;
    return COURSE_PALETTES[safeIdx];
  }
  return COURSE_PALETTES[index % COURSE_PALETTES.length];
}

/**
 * Checks if candidate section conflicts with existing selected sections.
 * Returns array of conflicts.
 */
export function checkConflicts(
  candidateSection: SectionItem,
  selectedSections: SectionItem[]
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (const existing of selectedSections) {
    // Skip if it's the section of the same course that user is switching
    if (existing.courseCode === candidateSection.courseCode) {
      continue;
    }

    for (const candSlot of candidateSection.schedules) {
      for (const existSlot of existing.schedules) {
        if (candSlot.day === existSlot.day) {
          // Check minute overlap
          const overlap =
            candSlot.startMinutes < existSlot.endMinutes &&
            existSlot.startMinutes < candSlot.endMinutes;

          if (overlap) {
            conflicts.push({
              existingSection: existing,
              conflictingSection: candidateSection,
              day: candSlot.day,
              timeOverlap: `${candSlot.time} vs ${existSlot.time}`
            });
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Helper to determine if course is Core or Elective
 */
export function isCoreCourse(courseCode: string): boolean {
  const codeNum = parseInt(courseCode.replace(/[^0-9]/g, ''), 10);
  // Non-CSE general university core courses
  if (
    courseCode.startsWith('ACT') ||
    courseCode.startsWith('BDS') ||
    courseCode.startsWith('BIO') ||
    courseCode.startsWith('ENG') ||
    courseCode.startsWith('MATH') ||
    courseCode.startsWith('PHY') ||
    courseCode.startsWith('SOC') ||
    courseCode.startsWith('GED')
  ) {
    return true;
  }
  // CSE / DS lower level foundation courses are Core (<4000)
  if (!isNaN(codeNum) && codeNum < 4000) {
    return true;
  }
  return false;
}

/**
 * Group raw sections by course code
 */
export function groupSectionsByCourse(sections: SectionItem[]): CourseGroup[] {
  const map = new Map<string, CourseGroup>();

  for (const item of sections) {
    if (!map.has(item.courseCode)) {
      map.set(item.courseCode, {
        courseCode: item.courseCode,
        courseTitle: item.courseTitle,
        program: item.program,
        credit: item.credit,
        isLab: item.isLab,
        sections: []
      });
    }
    map.get(item.courseCode)!.sections.push(item);
  }

  return Array.from(map.values()).sort((a, b) => a.courseCode.localeCompare(b.courseCode));
}

/**
 * Calculate credits and weekly stats
 */
export function calculateStatistics(selectedSections: SectionItem[]): RoutineStatistics {
  const totalCredits = selectedSections.reduce((acc, curr) => acc + curr.credit, 0);
  const courseCount = selectedSections.length;
  const labCount = selectedSections.filter(s => s.isLab).length;
  const theoryCount = courseCount - labCount;

  const dayHours: Record<string, number> = {
    Saturday: 0,
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0
  };

  selectedSections.forEach(sec => {
    sec.schedules.forEach(slot => {
      if (dayHours[slot.day] !== undefined) {
        const durationMinutes = slot.endMinutes - slot.startMinutes;
        dayHours[slot.day] += durationMinutes / 60;
      }
    });
  });

  const busyDays = DAYS_OF_WEEK.filter(d => dayHours[d] > 0);
  const freeDays = DAYS_OF_WEEK.filter(d => dayHours[d] === 0);

  return {
    totalCredits,
    courseCount,
    labCount,
    theoryCount,
    busyDays,
    freeDays,
    dayHours
  };
}

/**
 * Formats time from minutes to 12h display
 */
export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${period}`;
}
