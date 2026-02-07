export interface ScheduleEntry {
  id?: number;
  weeklySchedule?: { id: number };
  courseId: number;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
}