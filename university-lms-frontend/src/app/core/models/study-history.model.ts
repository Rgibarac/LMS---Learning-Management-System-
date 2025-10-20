export interface StudyHistory {
  courseId: number;
  courseName: string;
  term: string;
  examsTaken: number;
  grade: number | null;
  ectsPoints: number;
  passed: boolean;
}