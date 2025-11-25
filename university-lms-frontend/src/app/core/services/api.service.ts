import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpClient,
  HttpHeaders,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError
} from 'rxjs';
import { User } from '../models/user.model';
import { Course } from '../models/course.model';
import { StudyProgram } from '../models/study-program.model';
import { Syllabus } from '../models/syllabus.model';
import { StudyHistory } from '../models/study-history.model';
import { environment } from '../../../enviroments/environment';
import { Evaluation } from '../models/evaluation.model';
import { Notification } from '../models/notification.model';
import { Schedule } from '../models/schedule.model';
import { CustomContent } from '../models/custom-content.model';
import { ExamApplication } from '../models/exam-application.model';
import { ExamGrade } from '../models/exam-grade.model';
import { Term } from '../models/term.model';
import { AppliedYear } from '../models/applied-year.model';
import { TermSchedule } from '../models/term-schedule.model';

interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';
  private user: User | null = null;

  private get authOptions() {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('token')
      : null;

    const headers: { [header: string]: string } = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return { headers: new HttpHeaders(headers) };
  }

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('user');
      if (stored) {
        this.user = JSON.parse(stored);
      }
    }
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    const form = new FormData();
    form.append('username', credentials.username);
    form.append('password', credentials.password);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, form).pipe(
      tap(resp => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', resp.token);
          localStorage.setItem('user', JSON.stringify(resp.user));
          this.user = resp.user;
        }
      }),
      catchError(this.handleError('login'))
    );
  }

   isLoggedIn(): boolean {
    return !!this.getToken();
    
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, user).pipe(
      catchError(this.handleError('register'))
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`, this.authOptions).pipe(
      tap(u => {
        if (isPlatformBrowser(this.platformId)) {
          this.user = u;
          localStorage.setItem('user', JSON.stringify(u));
        }
      }),
      catchError(this.handleError('getProfile'))
    );
  }

  
  updateProfile(user: User): Observable<User> {
  
    const payload = {
      username: user.username,       
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      indexNumber: user.indexNumber
   
  };

    return this.http.put<User>(`${this.apiUrl}/users/update`, payload, this.authOptions).pipe(
      tap(updated => {
        if (isPlatformBrowser(this.platformId)) {
          
          const current = this.getCurrentUser();
          const merged = { ...current, ...updated };
          this.user = merged;
          localStorage.setItem('user', JSON.stringify(merged));
        }
      }),
      catchError(this.handleError('updateProfile'))
    );
  }

  isAuthenticated(): boolean {
    return isPlatformBrowser(this.platformId) ? !!localStorage.getItem('token') : false;
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.user = null;
    }
  }

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/public/courses`).pipe(
      catchError(this.handleError('getCourses'))
    );
  }

  getStudyPrograms(): Observable<StudyProgram[]> {
    return this.http.get<StudyProgram[]>(`${this.apiUrl}/public/study-programs`).pipe(
      catchError(this.handleError('getStudyPrograms'))
    );
  }

  getSyllabuses(): Observable<Syllabus[]> {
    return this.http.get<Syllabus[]>(`${this.apiUrl}/public/syllabuses`).pipe(
      catchError(this.handleError('getSyllabuses'))
    );
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/public/notifications`).pipe(
      tap(data => console.log('getNotifications response:', data)),
      catchError(this.handleError('getNotifications'))
    );
  }

  getSyllabus(courseId: number): Observable<Syllabus> {
    return this.http.get<Syllabus>(`${this.apiUrl}/public/syllabuses/${courseId}`).pipe(
      tap(data => console.log(`getSyllabus(${courseId}) response:`, data)),
      catchError(this.handleError('getSyllabus'))
    );
  }

  getTeacherCourses(userId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/teacher/courses/${userId}`, this.authOptions).pipe(
      catchError(this.handleError('getTeacherCourses'))
    );
  }

  getAvailableExams(userId: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/student/exams/${userId}`, this.authOptions).pipe(
      catchError(this.handleError('getAvailableExams'))
    );
  }

  registerForExam(userId: number, evaluationId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/student/exams/register`,
      { userId, evaluationId },
      this.authOptions
    ).pipe(catchError(this.handleError('registerForExam')));
  }


  getAllUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.apiUrl}/admin/users`, {
        ...this.authOptions,
        observe: 'response'
      })
      .pipe(
        tap(resp => console.log('getAllUsers response:', resp)),
        map(resp => resp.body || []),
        catchError(this.handleError('getAllUsers'))
      );
  }

  getAllStudyPrograms(): Observable<StudyProgram[]> {
    return this.http
      .get<StudyProgram[]>(`${this.apiUrl}/admin/study-programs`, {
        ...this.authOptions,
        observe: 'response'
      })
      .pipe(
        tap(resp => console.log('getAllStudyPrograms response:', resp)),
        map(resp => resp.body || []),
        catchError(this.handleError('getAllStudyPrograms'))
      );
  }


  getAllSyllabuses(): Observable<Syllabus[]> {
    return this.http
      .get<Syllabus[]>(`${this.apiUrl}/admin/syllabuses`, {
        ...this.authOptions,
        observe: 'response'
      })
      .pipe(
        tap(resp => console.log('getAllSyllabuses response:', resp)),
        map(resp => resp.body || []),
        catchError(this.handleError('getAllSyllabuses'))
      );
  }

  createStudyProgram(program: StudyProgram): Observable<StudyProgram> {
    return this.http
      .post<StudyProgram>(`${this.apiUrl}/admin/study-programs`, program, {
        ...this.authOptions,
        observe: 'response'
      })
      .pipe(
        tap(resp => console.log('createStudyProgram response:', resp)),
        map(resp => resp.body || ({} as StudyProgram)),
        catchError(this.handleError('createStudyProgram'))
      );
  }


  createSyllabus(syllabus: Syllabus): Observable<Syllabus> {
    return this.http
      .post<Syllabus>(`${this.apiUrl}/admin/syllabuses`, syllabus, {
        ...this.authOptions,
        observe: 'response'
      })
      .pipe(
        tap(resp => console.log('createSyllabus response:', resp)),
        map(resp => resp.body || ({} as Syllabus)),
        catchError(this.handleError('createSyllabus'))
      );
  }

  createUser(user: User): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/admin/users`, user, {
        ...this.authOptions,
        observe: 'response'
      })
      .pipe(
        tap(resp => console.log('createUser response:', resp)),
        map(resp => resp.body || ({} as User)),
        catchError(this.handleError('createUser'))
      );
  }

 updateUser(user: User): Observable<User> {
  const payload: any = {
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    indexNumber: user.indexNumber
  };

  const currentUser = this.getCurrentUser();
  if ((currentUser?.role === 'ADMIN' || currentUser?.role === 'STAFF') && user.role) {
    payload.role = user.role;
  }

  return this.http.put<User>(`${this.apiUrl}/users/update`, payload, this.authOptions).pipe(
    tap(updated => {
      if (currentUser && currentUser.username === updated.username) {
        localStorage.setItem('user', JSON.stringify(updated));
        this.user = updated;
      }
    }),
    catchError(this.handleError('updateUser'))
  );
}

  deleteUser(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/admin/users/${id}`, {
        ...this.authOptions,
        observe: 'response'
      })
      .pipe(
        tap(resp => console.log(`deleteUser id=${id} response:`, resp)),
        map(() => undefined),
        catchError(this.handleError('deleteUser'))
      );
  }

  deleteStudyProgram(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/admin/study-programs/${id}`, {
        ...this.authOptions,
        observe: 'response'
      })
      .pipe(
        tap(resp => console.log(`deleteStudyProgram id=${id} response:`, resp)),
        map(() => undefined),
        catchError(this.handleError('deleteStudyProgram'))
      );
  }

  deleteSyllabus(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/admin/syllabuses/${id}`, {
        ...this.authOptions,
        observe: 'response'
      })
      .pipe(
        tap(resp => console.log(`deleteSyllabus id=${id} response:`, resp)),
        map(() => undefined),
        catchError(this.handleError('deleteSyllabus'))
      );
  }

  exportUsersPdf(p0: string): Observable<Blob> {
    return this.http
      .get(`${this.apiUrl}/admin/export/users?format=pdf`, {
        ...this.authOptions,
        responseType: 'blob'
      })
      .pipe(
        tap(() => console.log('exportUsersPdf request sent')),
        catchError(this.handleError('exportUsersPdf'))
      );
  }

  updateStudyProgram(id: number, studyProgram: StudyProgram): Observable<StudyProgram> {
    return this.http
      .put<StudyProgram>(`${this.apiUrl}/admin/study-programs/${id}`, studyProgram, this.authOptions)
      .pipe(catchError(this.handleError('updateStudyProgram')));
  }


  updateSyllabus(id: number, syllabus: Syllabus): Observable<Syllabus> {
    return this.http
      .put<Syllabus>(`${this.apiUrl}/admin/syllabuses/${id}`, syllabus, this.authOptions)
      .pipe(catchError(this.handleError('updateSyllabus')));
  }

  enrollStudentInCourse(studentId: number, courseId: number): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/staff/enroll/course`, { studentId, courseId }, this.authOptions)
      .pipe(
        tap(() => console.log(`Enrolled student ${studentId} in course ${courseId}`)),
        catchError(this.handleError('enrollStudentInCourse'))
      );
  }

  enrollStudentInStudyProgram(studentId: number, studyProgramId: number): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/staff/enroll/study-program`, { studentId, studyProgramId }, this.authOptions)
      .pipe(
        tap(() => console.log(`Enrolled student ${studentId} in study program ${studyProgramId}`)),
        catchError(this.handleError('enrollStudentInStudyProgram'))
      );
  }

  createNotification(notification: Notification): Observable<Notification> {
    return this.http
      .post<Notification>(`${this.apiUrl}/staff/notifications`, notification, this.authOptions)
      .pipe(
        tap(data => console.log('createNotification response:', data)),
        catchError(this.handleError('createNotification'))
      );
  }

  getSchedules(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/staff/schedules`, this.authOptions).pipe(
      tap(data => console.log('getSchedules response:', data)),
      catchError(this.handleError('getSchedules'))
    );
  }

  createSchedule(schedule: Schedule): Observable<Schedule> {
    return this.http
      .post<Schedule>(`${this.apiUrl}/staff/schedules`, schedule, this.authOptions)
      .pipe(
        tap(data => console.log('createSchedule response:', data)),
        catchError(this.handleError('createSchedule'))
      );
  }

  createCustomContent(content: CustomContent): Observable<CustomContent> {
    return this.http
      .post<CustomContent>(`${this.apiUrl}/staff/custom-content`, content, this.authOptions)
      .pipe(
        tap(data => console.log('createCustomContent response:', data)),
        catchError(this.handleError('createCustomContent'))
      );
  }

  getCustomContent(): Observable<CustomContent[]> {
    return this.http.get<CustomContent[]>(`${this.apiUrl}/staff/custom-content`, this.authOptions).pipe(
      catchError(this.handleError('getCustomContent'))
    );
  }

  deleteCustomContent(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/staff/custom-content/${id}`, this.authOptions)
      .pipe(catchError(this.handleError('deleteCustomContent')));
  }

  getStudentsByRole(role: string = 'STUDENT'): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/staff/students`, this.authOptions).pipe(
      tap(data => console.log(`getStudentsByRole(${role}) response:`, data)),
      catchError(this.handleError('getStudentsByRole'))
    );
  }

  searchStudents(params: { query: string }): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.apiUrl}/staff/students`, { ...this.authOptions, params })
      .pipe(
        tap(data => console.log('searchStudents response:', data)),
        catchError(this.handleError('searchStudents'))
      );
  }

  getExamApplicationsByUserId(userId: number): Observable<ExamApplication[]> {
    return this.http
      .get<ExamApplication[]>(`${this.apiUrl}/student-teacher/exam-applications/user/${userId}`, this.authOptions)
      .pipe(
        tap(data => console.log(`getBooleanApplicationsByUserId(${userId}) response:`, data)),
        catchError(this.handleError('getExamApplicationsByUserId'))
      );
  }

  getAllExamApplications(): Observable<ExamApplication[]> {
    return this.http
      .get<ExamApplication[]>(`${this.apiUrl}/student-teacher/exam-applications`, this.authOptions)
      .pipe(
        tap(data => console.log('getAllExamApplications response:', data)),
        catchError(this.handleError('getAllExamApplications'))
      );
  }

  deleteExamApplication(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/student-teacher/exam-applications/${id}`, this.authOptions)
      .pipe(
        tap(() => console.log(`deleteExamApplication(${id}) response: 204 No Content`)),
        catchError(this.handleError('deleteExamApplication'))
      );
  }

  getExamGradesByExamApplicationId(examApplicationId: number): Observable<ExamGrade[]> {
    return this.http
      .get<ExamGrade[]>(`${this.apiUrl}/student-teacher/exam-grades/application/${examApplicationId}`, this.authOptions)
      .pipe(
        tap(data => console.log(`getExamGradesByExamApplicationId(${examApplicationId}) response:`, data)),
        catchError(this.handleError('getExamGradesByExamApplicationId'))
      );
  }

  getAllExamGrades(): Observable<ExamGrade[]> {
    return this.http
      .get<ExamGrade[]>(`${this.apiUrl}/student-teacher/exam-grades`, this.authOptions)
      .pipe(
        tap(data => console.log('getAllExamGrades response:', data)),
        catchError(this.handleError('getAllExamGrades'))
      );
  }

  deleteExamGrade(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/student-teacher/exam-grades/${id}`, this.authOptions)
      .pipe(
        tap(() => console.log(`deleteExamGrade(${id}) response: 204 No Content`)),
        catchError(this.handleError('deleteExamGrade'))
      );
  }

  createExamApplication(userId: number, courseId: number, term: string): Observable<ExamApplication> {
    const body = { userId, courseId, term };
    return this.http
      .post<ExamApplication>(`${this.apiUrl}/student-teacher/exam-applications`, body, this.authOptions)
      .pipe(
        tap(data => console.log('createExamApplication response:', data)),
        catchError(this.handleError('createExamApplication'))
      );
  }

  gradeExam(examApplicationId: number, grade: number, numberOfTakenExams: number): Observable<ExamGrade> {
    const body = { examApplicationId, grade, numberOfTakenExams };
    return this.http
      .post<ExamGrade>(`${this.apiUrl}/student-teacher/exam-grades`, body, this.authOptions)
      .pipe(
        tap(data => console.log('gradeExam response:', data)),
        catchError(this.handleError('gradeExam'))
      );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`, this.authOptions).pipe(
      tap(data => console.log(`getUserById(${id}) response:`, data)),
      catchError(this.handleError('getUserById'))
    );
  }

  getStudentCourses(userId: number): Observable<Course[]> {
    return this.http.get<User[]>(`${this.apiUrl}/staff/students`, this.authOptions).pipe(
      map((students: User[]) => {
        const student = students.find(s => s.id === userId);
        if (!student) {
          console.warn(`No student found for userId ${userId}`);
          return [];
        }
        console.log(`getStudentCourses(${userId}) found student:`, student);
        return student.enrolledCourses || [];
      }),
      tap(courses => console.log(`getStudentCourses(${userId}) response:`, courses)),
      catchError(err => {
        console.warn(`Failed to fetch courses for userId ${userId}:`, err);
        return of([]);
      })
    );
  }

  getStudentStudyProgram(userId: number): Observable<StudyProgram | null> {
    return this.http.get<User[]>(`${this.apiUrl}/staff/students`, this.authOptions).pipe(
      map((students: User[]) => {
        const student = students.find(s => s.id === userId);
        if (!student) {
          console.warn(`No student found for userId ${userId}`);
          return null;
        }
        console.log(`getStudentStudyProgram(${userId}) found student:`, student);
        return student.studyProgram || null;
      }),
      tap(program => console.log(`getStudentStudyProgram(${userId}) response:`, program)),
      catchError(err => {
        console.warn(`Failed to fetch students for userId ${userId}:`, err);
        return of(null);
      })
    );
  }

  getStudentHistory(userId: number): Observable<StudyHistory[]> {
    return this.http
      .get<ExamApplication[]>(`${this.apiUrl}/student-teacher/exam-applications/user/${userId}`, this.authOptions)
      .pipe(
        switchMap((examApplications: ExamApplication[]) => {
          if (examApplications.length === 0) return of([]);
          const gradeRequests = examApplications.map(app =>
            this.http
              .get<ExamGrade[]>(`${this.apiUrl}/student-teacher/exam-grades/application/${app.id}`, this.authOptions)
              .pipe(
                map(grades => {
                  if (app.course.id === undefined) {
                    console.warn(`Skipping exam application ${app.id}: course.id is undefined`);
                    return null;
                  }
                  return {
                    courseId: app.course.id,
                    courseName: app.course.name,
                    term: app.term,
                    examsTaken: grades.length > 0 ? grades[0].numberOfTakenExams : 0,
                    grade: grades.length > 0 ? grades[0].grade : null,
                    ectsPoints: app.course.ectsPoints || 0,
                    passed: grades.length > 0 && grades[0].grade != null && grades[0].grade >= 5
                  } as StudyHistory;
                }),
                catchError(() => {
                  if (app.course.id === undefined) {
                    console.warn(`Skipping exam application ${app.id}: course.id is undefined`);
                    return of(null);
                  }
                  return of({
                    courseId: app.course.id,
                    courseName: app.course.name,
                    term: app.term,
                    examsTaken: 0,
                    grade: null,
                    ectsPoints: app.course.ectsPoints || 0,
                    passed: false
                  } as StudyHistory);
                })
              )
          );
          return forkJoin(gradeRequests).pipe(
            map(results => results.filter((r): r is StudyHistory => r !== null))
          );
        }),
        tap(data => console.log(`getStudentHistory(${userId}) response:`, data)),
        catchError(this.handleError('getStudentHistory'))
      );
  }

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      const msg = error.status
        ? `${operation}: HTTP ${error.status} – ${error.message}`
        : `${operation}: ${error.message}`;
      console.error(`API error in ${operation}:`, error);
      return throwError(() => new Error(msg));
    };
  }

  getStudentsByQuery(query: string): Observable<User[]> {
    const url = query
      ? `${this.apiUrl}/staff/students?query=${encodeURIComponent(query)}`
      : `${this.apiUrl}/staff/students`;
    return this.http.get<User[]>(url, {
      headers: new HttpHeaders({ Authorization: 'Basic YTp h' })
    });
  }

  hasRole(role: string): boolean {
  const user = this.getCurrentUser();
  return user?.role === role;
  
}


getTerms(): Observable<Term[]> {
  return this.http.get<Term[]>(`${this.apiUrl}/terms`);
}

getCurrentTerm(): Observable<Term> {
  return this.http.get<Term>(`${this.apiUrl}/terms/current`);
}

createTerm(term: Term): Observable<Term> {
  return this.http.post<Term>(`${this.apiUrl}/terms`, term, this.authOptions);
}

updateTerm(id: number, term: Term): Observable<Term> {
  return this.http.put<Term>(`${this.apiUrl}/terms/${id}`, term, this.authOptions);
}

deleteTerm(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/terms/${id}`, this.authOptions);
}



  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/public/courses`).pipe(
      catchError(this.handleError('getAllCourses'))
    );
  }

  getMyCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/public/courses/my`, this.authOptions).pipe(
      catchError(this.handleError('getMyCourses'))
    );
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/public`, course, this.authOptions).pipe(
      catchError(this.handleError('createCourse'))
    );
  }

  updateCourse(id: number, course: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/public/courses/${id}`, course, this.authOptions).pipe(
      catchError(this.handleError('updateCourse'))
    );
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/public/courses/${id}`, this.authOptions).pipe(
      catchError(this.handleError('deleteCourse'))
    );
  }

  getCoursesByStudyYear(studyYear: number): Observable<Course[]> 
    {
    return this.http.get<Course[]>(`${this.apiUrl}/public/courses/year/${studyYear}`).pipe(
      catchError(this.handleError('getCoursesByStudyYear'))
    );
  }

getAllAppliedYears(): Observable<AppliedYear[]> {
  return this.http.get<AppliedYear[]>(`${this.apiUrl}/applied-years`).pipe(
    catchError(this.handleError('getAllAppliedYears'))
  );
}

getAppliedYearsByUser(userId: number): Observable<AppliedYear[]> {
  return this.http.get<AppliedYear[]>(`${this.apiUrl}/applied-years/user/${userId}`).pipe(
    catchError(this.handleError('getAppliedYearsByUser'))
  );
}

getCurrentAppliedYear(userId: number): Observable<AppliedYear> {
  return this.http.get<AppliedYear>(`${this.apiUrl}/applied-years/user/${userId}/current`).pipe(
    catchError(this.handleError('getCurrentAppliedYear'))
  );
}

createAppliedYear(appliedYear: AppliedYear): Observable<AppliedYear> {
  return this.http.post<AppliedYear>(`${this.apiUrl}/applied-years`, appliedYear, this.authOptions).pipe(
    catchError(this.handleError('createAppliedYear'))
  );
}

deleteAppliedYear(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/api/applied-years/${id}`, this.authOptions);
}

getTermSchedulesByTerm(termId: number): Observable<TermSchedule[]> {
  return this.http.get<TermSchedule[]>(`${this.apiUrl}/term-schedules/term/${termId}`).pipe(
    catchError(this.handleError('getTermSchedulesByTerm'))
  );
}

getWeeklySchedule(termId: number, startOfWeek: string): Observable<TermSchedule[]> {
  return this.http.get<TermSchedule[]>(
    `${this.apiUrl}/term-schedules/term/${termId}/week?startOfWeek=${startOfWeek}`
  ).pipe(
    catchError(this.handleError('getWeeklySchedule'))
  );
}

createTermSchedule(schedule: TermSchedule): Observable<TermSchedule> {
  return this.http.post<TermSchedule>(`${this.apiUrl}/term-schedules`, schedule, this.authOptions).pipe(
    catchError(this.handleError('createTermSchedule'))
  );
}

updateTermSchedule(id: number, schedule: TermSchedule): Observable<TermSchedule> {
  return this.http.put<TermSchedule>(`${this.apiUrl}/term-schedules/${id}`, schedule, this.authOptions).pipe(
    catchError(this.handleError('updateTermSchedule'))
  );
}

deleteTermSchedule(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/term-schedules/${id}`, this.authOptions).pipe(
    catchError(this.handleError('deleteTermSchedule'))
  );
}

}