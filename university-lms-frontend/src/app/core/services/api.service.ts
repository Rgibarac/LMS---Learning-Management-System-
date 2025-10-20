import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';
  private user: User | null = null;
  private credentials: { username: string; password: string } | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user');
      const credentialsData = localStorage.getItem('credentials');
      if (userData) {
        this.user = JSON.parse(userData);
      }
      if (credentialsData) {
        this.credentials = JSON.parse(credentialsData);
      }
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.user && isPlatformBrowser(this.platformId)) {
          this.user = response.user;
          this.credentials = credentials;
          localStorage.setItem('user', JSON.stringify(this.user));
          localStorage.setItem('credentials', JSON.stringify(this.credentials));
          console.log('User and credentials saved:', this.user, this.credentials);
        } else if (!response.user) {
          console.error('Login response missing user:', response);
        }
      }),
      catchError(this.handleError('login'))
    );
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, user).pipe(
      catchError(this.handleError('register'))
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`).pipe(
      catchError(this.handleError('getProfile'))
    );
  }

  updateProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/update`, user).pipe(
      tap((updatedUser: User) => {
        if (isPlatformBrowser(this.platformId)) {
          this.user = updatedUser;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('User profile updated:', updatedUser);
        }
      }),
      catchError(this.handleError('updateProfile'))
    );
  }

  getTeacherCourses(userId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/teacher/courses/${userId}`).pipe(
      catchError(this.handleError('getTeacherCourses'))
    );
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







  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getCredentials(): { username: string; password: string } | null {
    return this.credentials;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.user = null;
      this.credentials = null;
      localStorage.removeItem('user');
      localStorage.removeItem('credentials');
      console.log('User logged out');
    }
  }

  getAvailableExams(userId: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/student/exams/${userId}`).pipe(
      catchError(this.handleError('getAvailableExams'))
    );
  }

  registerForExam(userId: number, evaluationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/student/exams/register`, { userId, evaluationId }).pipe(
      catchError(this.handleError('registerForExam'))
    );
  }


  updateStudyProgram(id: number, studyProgram: StudyProgram): Observable<StudyProgram> {
    return this.http.put<StudyProgram>(`${this.apiUrl}/admin/study-programs/${id}`, studyProgram).pipe(
      catchError(this.handleError('updateStudyProgram'))
    );
  }

  getCoursesByStudyProgram(studyProgramId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/admin/study-programs/${studyProgramId}/courses`).pipe(
      catchError(this.handleError('getCoursesByStudyProgram'))
    );
  }

  updateCourse(id: number, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/admin/courses/${id}`, course).pipe(
      catchError(this.handleError('updateCourse'))
    );
  }

  getSyllabusesByCourse(courseId: number): Observable<Syllabus[]> {
    return this.http.get<Syllabus[]>(`${this.apiUrl}/admin/courses/${courseId}/syllabuses`).pipe(
      catchError(this.handleError('getSyllabusesByCourse'))
    );
  }

  updateSyllabus(id: number, syllabus: Syllabus): Observable<Syllabus> {
    return this.http.put<Syllabus>(`${this.apiUrl}/admin/syllabuses/${id}`, syllabus).pipe(
      catchError(this.handleError('updateSyllabus'))
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`, { observe: 'response' }).pipe(
      tap((response: HttpResponse<User[]>) => console.log('getAllUsers response:', { status: response.status, body: response.body, headers: response.headers })),
      map(response => response.body || []),
      catchError(this.handleError('getAllUsers'))
    );
  }

  getAllStudyPrograms(): Observable<StudyProgram[]> {
    return this.http.get<StudyProgram[]>(`${this.apiUrl}/admin/study-programs`, { observe: 'response' }).pipe(
      tap((response: HttpResponse<StudyProgram[]>) => console.log('getAllStudyPrograms response:', { status: response.status, body: response.body, headers: response.headers })),
      map(response => response.body || []),
      catchError(this.handleError('getAllStudyPrograms'))
    );
  }




  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/admin/courses`, { observe: 'response' }).pipe(
      tap((response: HttpResponse<Course[]>) => console.log('getAllCourses response:', { status: response.status, body: response.body, headers: response.headers })),
      map(response => response.body || []),
      catchError(this.handleError('getAllCourses'))
    );
  }




  getAllSyllabuses(): Observable<Syllabus[]> {
    return this.http.get<Syllabus[]>(`${this.apiUrl}/admin/syllabuses`, { observe: 'response' }).pipe(
      tap((response: HttpResponse<Syllabus[]>) => console.log('getAllSyllabuses response:', { status: response.status, body: response.body, headers: response.headers })),
      map(response => response.body || []),
      catchError(this.handleError('getAllSyllabuses'))
    );
  }




createStudyProgram(program: StudyProgram): Observable<StudyProgram> {
    return this.http.post<StudyProgram>(`${this.apiUrl}/admin/study-programs`, program, { observe: 'response' }).pipe(
      tap((response: HttpResponse<StudyProgram>) => console.log('createStudyProgram response:', { status: response.status, body: response.body })),
      map(response => response.body || {} as StudyProgram),
      catchError(this.handleError('createStudyProgram'))
    );
  }

  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/admin/courses`, course, { observe: 'response' }).pipe(
      tap((response: HttpResponse<Course>) => console.log('createCourse response:', { status: response.status, body: response.body })),
      map(response => response.body || {} as Course),
      catchError(this.handleError('createCourse'))
    );
  }

  createSyllabus(syllabus: Syllabus): Observable<Syllabus> {
    return this.http.post<Syllabus>(`${this.apiUrl}/admin/syllabuses`, syllabus, { observe: 'response' }).pipe(
      tap((response: HttpResponse<Syllabus>) => console.log('createSyllabus response:', { status: response.status, body: response.body })),
      map(response => response.body || {} as Syllabus),
      catchError(this.handleError('createSyllabus'))
    );
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/admin/users`, user, { observe: 'response' }).pipe(
      tap((response: HttpResponse<User>) => console.log('createUser response:', { status: response.status, body: response.body })),
      map(response => response.body || {} as User),
      catchError(this.handleError('createUser'))
    );
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/users/${id}`, user, { observe: 'response' }).pipe(
      tap((response: HttpResponse<User>) => console.log('updateUser response:', { status: response.status, body: response.body })),
      map(response => response.body || {} as User),
      catchError(this.handleError('updateUser'))
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/users/${id}`, { observe: 'response' }).pipe(
      tap((response: HttpResponse<void>) => console.log(`deleteUser id=${id} response:`, { status: response.status })),
      map(() => undefined),
      catchError(this.handleError('deleteUser'))
    );
  }

  deleteStudyProgram(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/study-programs/${id}`, { observe: 'response' }).pipe(
      tap((response: HttpResponse<void>) => console.log(`deleteStudyProgram id=${id} response:`, { status: response.status })),
      map(() => undefined),
      catchError(this.handleError('deleteStudyProgram'))
    );
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/courses/${id}`, { observe: 'response' }).pipe(
      tap((response: HttpResponse<void>) => console.log(`deleteCourse id=${id} response:`, { status: response.status })),
      map(() => undefined),
      catchError(this.handleError('deleteCourse'))
    );
  }

  deleteSyllabus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/syllabuses/${id}`, { observe: 'response' }).pipe(
      tap((response: HttpResponse<void>) => console.log(`deleteSyllabus id=${id} response:`, { status: response.status })),
      map(() => undefined),
      catchError(this.handleError('deleteSyllabus'))
    );
  }

  exportUsersPdf(p0: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/admin/export/users?format=pdf`, { responseType: 'blob' }).pipe(
      tap(() => console.log('exportUsersPdf request sent')),
      catchError(this.handleError('exportUsersPdf'))
    );
  }



  enrollStudentInCourse(studentId: number, courseId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/staff/enroll/course`, { studentId, courseId }).pipe(
      tap(() => console.log(`Enrolled student ${studentId} in course ${courseId}`)),
      catchError(this.handleError('enrollStudentInCourse'))
    );
  }


  enrollStudentInStudyProgram(studentId: number, studyProgramId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/staff/enroll/study-program`, { studentId, studyProgramId }).pipe(
      tap(() => console.log(`Enrolled student ${studentId} in study program ${studyProgramId}`)),
      catchError(this.handleError('enrollStudentInStudyProgram'))
    );
  }


  createNotification(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/staff/notifications`, notification).pipe(
      tap((data) => console.log('createNotification response:', data)),
      catchError(this.handleError('createNotification'))
    );
  }


  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/public/notifications`).pipe(
      tap((data) => console.log('getNotifications response:', data)),
      catchError(this.handleError('getNotifications'))
    );
  }


  getSchedules(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/staff/schedules`).pipe(
      tap((data) => console.log('getSchedules response:', data)),
      catchError(this.handleError('getSchedules'))
    );
  }


  createSchedule(schedule: Schedule): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.apiUrl}/staff/schedules`, schedule).pipe(
      tap((data) => console.log('createSchedule response:', data)),
      catchError(this.handleError('createSchedule'))
    );
  }





  createCustomContent(content: CustomContent): Observable<CustomContent> {
    return this.http.post<CustomContent>(`${this.apiUrl}/staff/custom-content`, content).pipe(
      tap((data) => console.log('createCustomContent response:', data)),
      catchError(this.handleError('createCustomContent'))
    );
  }

  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      const errorMessage = error.status
        ? `${operation}: HTTP ${error.status} - ${error.message || 'Server error'}`
        : `${operation}: ${error.message || 'Unknown error'}`;
      console.error(`API error in ${operation}:`, error);
      return throwError(() => new Error(errorMessage));
    };
  }
  getStudentsByRole(role: string = 'STUDENT'): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/staff/students`).pipe(
      tap((data) => console.log(`getStudentsByRole(${role}) response:`, data)),
      catchError(this.handleError('getStudentsByRole'))
    );
  }

  searchStudents(params: { query: string }): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/staff/students`, { params }).pipe(
      tap((data) => console.log('searchStudents response:', data)),
      catchError(this.handleError('searchStudents'))
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`).pipe(
      tap((data) => console.log(`getUserById(${id}) response:`, data)),
      catchError(this.handleError('getUserById'))
    );
  }

  getStudentsByQuery(query: string): Observable<User[]> {
    const url = query ? `${this.apiUrl}/staff/students?query=${encodeURIComponent(query)}` : `${this.apiUrl}/staff/students`;
    return this.http.get<User[]>(url, {
      headers: new HttpHeaders({ Authorization: 'Basic YTp h' })
    });
  }
  deleteCustomContent(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/staff/custom-content/${id}`,
      { headers: new HttpHeaders({ Authorization: 'Basic YTp h' }) }
    );
  }
  getCustomContent(): Observable<CustomContent[]> {
    return this.http.get<CustomContent[]>(`${this.apiUrl}/staff/custom-content`, {
      headers: new HttpHeaders({ Authorization: 'Basic YTp h' })
    });
  }

getExamApplicationsByUserId(userId: number): Observable<ExamApplication[]> {
  return this.http.get<ExamApplication[]>(`${this.apiUrl}/student-teacher/exam-applications/user/${userId}`).pipe(
    tap((data) => console.log(`getExamApplicationsByUserId(${userId}) response:`, data)),
    catchError(this.handleError('getExamApplicationsByUserId'))
  );
}

getAllExamApplications(): Observable<ExamApplication[]> {
  return this.http.get<ExamApplication[]>(`${this.apiUrl}/student-teacher/exam-applications`).pipe(
    tap((data) => console.log('getAllExamApplications response:', data)),
    catchError(this.handleError('getAllExamApplications'))
  );
}

deleteExamApplication(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/student-teacher/exam-applications/${id}`).pipe(
    tap(() => console.log(`deleteExamApplication(${id}) response: 204 No Content`)),
    catchError(this.handleError('deleteExamApplication'))
  );
}

getExamGradesByExamApplicationId(examApplicationId: number): Observable<ExamGrade[]> {
  return this.http.get<ExamGrade[]>(`${this.apiUrl}/student-teacher/exam-grades/application/${examApplicationId}`).pipe(
    tap((data) => console.log(`getExamGradesByExamApplicationId(${examApplicationId}) response:`, data)),
    catchError(this.handleError('getExamGradesByExamApplicationId'))
  );
}

getAllExamGrades(): Observable<ExamGrade[]> {
  return this.http.get<ExamGrade[]>(`${this.apiUrl}/student-teacher/exam-grades`).pipe(
    tap((data) => console.log('getAllExamGrades response:', data)),
    catchError(this.handleError('getAllExamGrades'))
  );
}

deleteExamGrade(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/student-teacher/exam-grades/${id}`).pipe(
    tap(() => console.log(`deleteExamGrade(${id}) response: 204 No Content`)),
    catchError(this.handleError('deleteExamGrade'))
  );
}





getStudentCourses(userId: number): Observable<Course[]> {
  return this.http.get<User[]>(`${this.apiUrl}/staff/students`).pipe(
    map((students: User[]) => {
      const student = students.find(s => s.id === userId);
      if (!student) {
        console.warn(`No student found for userId ${userId}`);
        return [];
      }
      console.log(`getStudentCourses(${userId}) found student:`, student);
      return student.enrolledCourses || [];
    }),
    tap((courses) => console.log(`getStudentCourses(${userId}) response:`, courses)),
    catchError((error: any) => {
      console.warn(`Failed to fetch courses for userId ${userId}:`, error);
      return of([]);
    })
  );
}


getStudentStudyProgram(userId: number): Observable<StudyProgram | null> {
  return this.http.get<User[]>(`${this.apiUrl}/staff/students`).pipe(
    map((students: User[]) => {
      const student = students.find(s => s.id === userId);
      if (!student) {
        console.warn(`No student found for userId ${userId}`);
        return null;
      }
      console.log(`getStudentStudyProgram(${userId}) found student:`, student);
      return student.studyProgram || null;
    }),
    tap((program) => console.log(`getStudentStudyProgram(${userId}) response:`, program)),
    catchError((error: any) => {
      console.warn(`Failed to fetch students for userId ${userId}:`, error);
      return of(null);
    })
  );
}

getSyllabus(courseId: number): Observable<Syllabus> {
  return this.http.get<Syllabus>(`${this.apiUrl}/public/syllabuses/${courseId}`).pipe(
    tap((data) => console.log(`getSyllabus(${courseId}) response:`, data)),
    catchError(this.handleError('getSyllabus'))
  );
}

createExamApplication(userId: number, courseId: number, term: string): Observable<ExamApplication> {
  const body = { userId, courseId, term };
  return this.http.post<ExamApplication>(`${this.apiUrl}/student-teacher/exam-applications`, body).pipe(
    tap((data) => console.log('createExamApplication response:', data)),
    catchError(this.handleError('createExamApplication'))
  );
}

getStudentHistory(userId: number): Observable<StudyHistory[]> {
  return this.http.get<ExamApplication[]>(`${this.apiUrl}/student-teacher/exam-applications/user/${userId}`).pipe(
    switchMap((examApplications: ExamApplication[]) => {
      if (examApplications.length === 0) {
        return of([]);
      }
      const gradeRequests = examApplications.map(app =>
        this.http.get<ExamGrade[]>(`${this.apiUrl}/student-teacher/exam-grades/application/${app.id}`).pipe(
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
        map(results => results.filter((result): result is StudyHistory => result !== null))
      );
    }),
    tap((data) => console.log(`getStudentHistory(${userId}) response:`, data)),
    catchError(this.handleError('getStudentHistory'))
  );
}

gradeExam(examApplicationId: number, grade: number, numberOfTakenExams: number): Observable<ExamGrade> {
  const body = { examApplicationId, grade, numberOfTakenExams };
  return this.http.post<ExamGrade>(`${this.apiUrl}/student-teacher/exam-grades`, body).pipe(
    tap((data) => console.log('gradeExam response:', data)),
    catchError(this.handleError('gradeExam'))
  );
}


}


