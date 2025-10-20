import { ExamApplication } from './exam-application.model';

export interface ExamGrade {
  id: number;
  examApplication: ExamApplication;
  grade: number | null;
  numberOfTakenExams: number;
}