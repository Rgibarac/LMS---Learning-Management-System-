import { Course } from './course.model';
import { User } from './user.model';

export interface ExamApplication {
  id: number;
  user: User;
  course: Course;
  term: string;
}