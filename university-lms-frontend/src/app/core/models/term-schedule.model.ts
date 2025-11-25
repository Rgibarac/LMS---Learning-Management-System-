import { Course } from './course.model';

export interface TermSchedule {
  id?: number;
  name: string;                  
  termId: number;                
  location?: string;             
  date: string;                  
  startTime: string;             
  endTime?: string;              
  
  courses?: Course[];            
  courseIds?: number[];      
}