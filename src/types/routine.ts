export interface ScheduleSlot {
  day: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  dayCode: 'Sat' | 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  time: string; // e.g. "08:30:AM - 09:50:AM"
  startMinutes: number; // e.g. 510 for 8:30
  endMinutes: number;   // e.g. 590 for 9:50
  room: string;
}

export interface SectionItem {
  id: string;
  sl: number;
  program: 'BSCSE' | 'BSDS';
  courseCode: string;
  courseTitle: string;
  section: string;
  room1: string;
  room2: string;
  day1: string;
  day2: string;
  time1: string;
  time2: string;
  facultyName: string;
  facultyInitial: string;
  credit: number;
  isLab: boolean;
  schedules: ScheduleSlot[];
}

export interface CourseGroup {
  courseCode: string;
  courseTitle: string;
  program: 'BSCSE' | 'BSDS';
  credit: number;
  isLab: boolean;
  sections: SectionItem[];
}

export interface ScheduleConflict {
  existingSection: SectionItem;
  conflictingSection: SectionItem;
  day: string;
  timeOverlap: string;
}

export interface RoutineStatistics {
  totalCredits: number;
  courseCount: number;
  labCount: number;
  theoryCount: number;
  busyDays: string[];
  freeDays: string[];
  dayHours: Record<string, number>;
}
