import { Course } from './course.model';
import { StudyProgram } from './study-program.model';
import { Syllabus } from './syllabus.model';

export interface User {
  email: string;
  id?: number;
  firstName: string;
  lastName: string;
  indexNumber: string;
  username: string;
  password?: string;
  role: string;
  enrolledCourses?: Course[];
  studyProgram?: StudyProgram | null;
  syllabuses?: Syllabus
}