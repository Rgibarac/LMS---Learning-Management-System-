export interface Course {
  id?: number;
  name: string;
  description: string;
  code: string;
  ectsPoints: number;
  studyProgramId: number;

  studyYear?: number | null; 
  teacherId?: number | null;  
}