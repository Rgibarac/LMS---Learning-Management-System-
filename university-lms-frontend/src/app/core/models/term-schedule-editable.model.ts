import { TermSchedule } from './term-schedule.model';

export interface TermScheduleEditable extends TermSchedule {
  courseId?: number | null;  
}