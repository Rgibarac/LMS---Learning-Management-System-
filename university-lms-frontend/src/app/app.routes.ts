import { Routes } from '@angular/router';
import { LoginComponent } from '../app/components/auth/login/login.component';
import { RegisterComponent } from '../app/components/auth/register/register.component';
import { StudentDashboardComponent } from './components/student/dashboard/dashboard.component';
import { AdminDashboardComponent } from './components/admin/dashboard/dashboard.component';
import { TeacherDashboardComponent } from './components/teacher/dashboard/dashboard.component';
import { StaffDashboardComponent } from './components/staff/dashboard/dashboard.component';
import { ProfileComponent } from './components/auth/profile/profile.component';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './components/public/home/home.component';
import { FacultyListComponent } from './components/public/faculty-list/faculty-list.component';
import { StudyProgramListComponent } from './components/public/study-program-list/study-program-list.component';
import { CourseListComponent } from './components/public/course-list/course-list.component';
import { SyllabusListComponent } from './components/public/syllabus-list/syllabus-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'faculties', component: FacultyListComponent },
  { path: 'study-programs', component: StudyProgramListComponent },
  { path: 'courses', component: CourseListComponent },
  { path: 'syllabuses', component: SyllabusListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'student', component: StudentDashboardComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'teacher', component: TeacherDashboardComponent, canActivate: [AuthGuard] },
  { path: 'staff', component: StaffDashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];