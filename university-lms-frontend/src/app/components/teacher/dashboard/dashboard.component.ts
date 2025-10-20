import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Course } from '../../../core/models/course.model';
import { Syllabus } from '../../../core/models/syllabus.model';
import { Notification } from '../../../core/models/notification.model';
import { User } from '../../../core/models/user.model';
import { ExamApplication } from '../../../core/models/exam-application.model';
import { ExamGrade } from '../../../core/models/exam-grade.model';
import { StudyHistory } from '../../../core/models/study-history.model';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatListModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule
  ],
  template: `
    <h2>Teacher Dashboard</h2>
    @if (isLoading) {
      <mat-spinner></mat-spinner>
      <p>Loading data...</p>
    } @else {
      <h4>All Courses</h4>
      @if (courses.length > 0) {
        <mat-table [dataSource]="courses">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Course Name</mat-header-cell>
            <mat-cell *matCellDef="let course">{{ course.name }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="code">
            <mat-header-cell *matHeaderCellDef>Code</mat-header-cell>
            <mat-cell *matCellDef="let course">{{ course.code }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="ectsPoints">
            <mat-header-cell *matHeaderCellDef>ECTS Points</mat-header-cell>
            <mat-cell *matCellDef="let course">{{ course.ectsPoints }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="syllabus">
            <mat-header-cell *matHeaderCellDef>Syllabus</mat-header-cell>
            <mat-cell *matCellDef="let course">
              <a *ngIf="syllabuses[course.id!]" [href]="syllabuses[course.id!].content" target="_blank">View</a>
              <span *ngIf="!syllabuses[course.id!]">Not available</span>
              <button mat-button (click)="openSyllabusForm(course)">Edit Syllabus</button>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
            <mat-cell *matCellDef="let course">
              <button mat-button (click)="viewCourseApplications(course.id!)">Exam Applications</button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="courseColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: courseColumns"></mat-row>
        </mat-table>
        <button mat-raised-button color="primary" (click)="openSyllabusForm(null)">Create Syllabus</button>
      } @else {
        <p>No courses available</p>
      }

      @if (showCourseApplications && selectedCourse) {
        <h4>Exam Applications for {{ selectedCourse.name }}</h4>
        <form #appSearchForm="ngForm" (ngSubmit)="searchCourseApplications()">
          <mat-form-field>
            <mat-label>Search By</mat-label>
            <mat-select [(ngModel)]="appSearchCategory" name="appSearchCategory" required>
              <mat-option value="name">Student Name</mat-option>
              <mat-option value="indexNumber">Index Number</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Search Term</mat-label>
            <input matInput [(ngModel)]="appSearchTerm" name="appSearchTerm" required>
            <mat-error *ngIf="appSearchForm.controls['appSearchTerm']?.errors?.['required']">Search term is required</mat-error>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="appSearchForm.invalid">Search</button>
          <button mat-raised-button (click)="clearCourseApplications()">Clear</button>
        </form>
        @if (filteredCourseApplications.length > 0) {
          <mat-table [dataSource]="filteredCourseApplications">
            <ng-container matColumnDef="studentName">
              <mat-header-cell *matHeaderCellDef>Student Name</mat-header-cell>
              <mat-cell *matCellDef="let app">{{ app.student?.firstName }} {{ app.student?.lastName }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="indexNumber">
              <mat-header-cell *matHeaderCellDef>Index Number</mat-header-cell>
              <mat-cell *matCellDef="let app">{{ app.student?.indexNumber }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="term">
              <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
              <mat-cell *matCellDef="let app">{{ app.term }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="examsTaken">
              <mat-header-cell *matHeaderCellDef>Exams Taken</mat-header-cell>
              <mat-cell *matCellDef="let app">{{ app.examsTaken }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="grade">
              <mat-header-cell *matHeaderCellDef>Grade</mat-header-cell>
              <mat-cell *matCellDef="let app">{{ app.grade != null ? app.grade : 'N/A' }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="passed">
              <mat-header-cell *matHeaderCellDef>Passed</mat-header-cell>
              <mat-cell *matCellDef="let app">{{ app.passed ? 'Yes' : 'No' }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="actions">
              <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
              <mat-cell *matCellDef="let app">
                <button mat-button (click)="openGradeForm(app)" [disabled]="app.grade != null">Grade Exam</button>
                <button mat-button color="warn" (click)="deleteCourseApplication(app)">Delete Application</button>
              </mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="applicationColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: applicationColumns"></mat-row>
          </mat-table>
        } @else {
          <p>No exam applications found</p>
        }
      }

      @if (showSyllabusForm) {
        <h4>{{ editingSyllabus ? 'Edit Syllabus' : 'Create Syllabus' }}</h4>
        <form #syllabusForm="ngForm" (ngSubmit)="saveSyllabus()">
          <mat-form-field>
            <mat-label>Course</mat-label>
            <mat-select [(ngModel)]="newSyllabus.courseId" name="courseId" required [disabled]="editingSyllabus != null">
              <mat-option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</mat-option>
            </mat-select>
            <mat-error *ngIf="syllabusForm.controls['courseId']?.errors?.['required']">Course is required</mat-error>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Content URL</mat-label>
            <input matInput [(ngModel)]="newSyllabus.content" name="content" required>
            <mat-error *ngIf="syllabusForm.controls['content']?.errors?.['required']">Content URL is required</mat-error>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Academic Year</mat-label>
            <input matInput [(ngModel)]="newSyllabus.academicYear" name="academicYear">
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="syllabusForm.invalid">Save</button>
          <button mat-raised-button color="warn" *ngIf="editingSyllabus" (click)="deleteSyllabus()">Delete</button>
          <button mat-raised-button (click)="cancelSyllabusForm()">Cancel</button>
        </form>
      }

      <h4>Notifications</h4>
      @if (notifications.length > 0) {
        <mat-list>
          <mat-list-item *ngFor="let notification of notifications">
            <strong>{{ notification.title }}</strong>: {{ notification.message }} ({{ notification.createdAt | date:'short' }})
          </mat-list-item>
        </mat-list>
      } @else {
        <p>No notifications available</p>
      }

      <h4>Search Students</h4>
      <form #searchForm="ngForm" (ngSubmit)="searchStudents()">
        <mat-form-field>
          <mat-label>Search By</mat-label>
          <mat-select [(ngModel)]="searchCategory" name="searchCategory" required>
            <mat-option value="name">Name</mat-option>
            <mat-option value="indexNumber">Index Number</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Search Term</mat-label>
          <input matInput [(ngModel)]="searchTerm" name="searchTerm" required>
          <mat-error *ngIf="searchForm.controls['searchTerm']?.errors?.['required']">Search term is required</mat-error>
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" [disabled]="searchForm.invalid">Search</button>
      </form>

      @if (filteredStudents.length > 0) {
        <h4>Search Results</h4>
        <mat-table [dataSource]="filteredStudents">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
            <mat-cell *matCellDef="let student">{{ student.firstName }} {{ student.lastName }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="indexNumber">
            <mat-header-cell *matHeaderCellDef>Index Number</mat-header-cell>
            <mat-cell *matCellDef="let student">{{ student.indexNumber }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
            <mat-cell *matCellDef="let student">
              <button mat-button (click)="viewStudentDetails(student.id!)">View Details</button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="studentColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: studentColumns"></mat-row>
        </mat-table>
      }

      @if (selectedStudent) {
        <h4>Student Details: {{ selectedStudent.firstName }} {{ selectedStudent.lastName }}</h4>
        <p>Index Number: {{ selectedStudent.indexNumber }}</p>
        <p>Email: {{ selectedStudent.email }}</p>
        <h5>Study History</h5>
        @if (studyHistory.length > 0) {
          <mat-table [dataSource]="studyHistory">
            <ng-container matColumnDef="courseName">
              <mat-header-cell *matHeaderCellDef>Course Name</mat-header-cell>
              <mat-cell *matCellDef="let history">{{ history.courseName }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="term">
              <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
              <mat-cell *matCellDef="let history">{{ history.term }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="examsTaken">
              <mat-header-cell *matHeaderCellDef>Exams Taken</mat-header-cell>
              <mat-cell *matCellDef="let history">{{ history.examsTaken }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="grade">
              <mat-header-cell *matHeaderCellDef>Grade</mat-header-cell>
              <mat-cell *matCellDef="let history">{{ history.grade != null ? history.grade : 'N/A' }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="passed">
              <mat-header-cell *matHeaderCellDef>Passed</mat-header-cell>
              <mat-cell *matCellDef="let history">{{ history.passed ? 'Yes' : 'No' }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="actions">
              <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
              <mat-cell *matCellDef="let history">
                <button mat-button (click)="openGradeForm(history)" [disabled]="history.grade != null">Grade Exam</button>
                <button mat-button color="warn" (click)="deleteStudentApplication(history)">Delete Application</button>
              </mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="historyColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: historyColumns"></mat-row>
          </mat-table>
        } @else {
          <p>No study history available</p>
        }
      }

      @if (showGradeForm && gradingHistory) {
        <h4>Grade Exam for {{ gradingHistory.courseName }} ({{ gradingHistory.term }})</h4>
        <form #gradeForm="ngForm" (ngSubmit)="submitGrade()">
          <mat-form-field>
            <mat-label>Grade (0-10)</mat-label>
            <input matInput type="number" [(ngModel)]="newGrade" name="grade" required min="0" max="10">
            <mat-error *ngIf="gradeForm.controls['grade']?.errors?.['required']">Grade is required</mat-error>
            <mat-error *ngIf="gradeForm.controls['grade']?.errors?.['min'] || gradeForm.controls['grade']?.errors?.['max']">Grade must be between 0 and 10</mat-error>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Number of Taken Exams</mat-label>
            <input matInput type="number" [(ngModel)]="numberOfTakenExams" name="numberOfTakenExams" required min="1">
            <mat-error *ngIf="gradeForm.controls['numberOfTakenExams']?.errors?.['required']">Number of taken exams is required</mat-error>
            <mat-error *ngIf="gradeForm.controls['numberOfTakenExams']?.errors?.['min']">Must be at least 1</mat-error>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="gradeForm.invalid">Submit Grade</button>
          <button mat-raised-button (click)="cancelGradeForm()">Cancel</button>
        </form>
      }
    }
  `,
  styles: [`
    mat-table {
      margin-bottom: 20px;
    }
    h3, h4, h5 {
      margin: 20px 0 10px;
    }
    p {
      margin: 10px 0;
    }
    mat-form-field {
      margin-right: 10px;
      width: 200px;
    }
    button {
      margin: 10px 5px;
    }
    mat-spinner {
      margin: 20px auto;
    }
    a {
      color: #3f51b5;
      text-decoration: none;
      margin-right: 10px;
    }
    a:hover {
      text-decoration: underline;
    }
    mat-list-item {
      margin-bottom: 10px;
    }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  isLoading: boolean = true;
  courses: Course[] = [];
  syllabuses: { [key: number]: Syllabus } = {};
  notifications: Notification[] = [];
  filteredStudents: User[] = [];
  selectedStudent: User | null = null;
  studyHistory: StudyHistory[] = [];
  showSyllabusForm: boolean = false;
  editingSyllabus: Syllabus | null = null;
  newSyllabus: Syllabus = { courseId: 0, content: '' };
  showGradeForm: boolean = false;
  gradingHistory: StudyHistory | null = null;
  newGrade: number | null = null;
  numberOfTakenExams: number = 1;
  searchCategory: 'name' | 'indexNumber' = 'name';
  searchTerm: string = '';
  showCourseApplications: boolean = false;
  selectedCourse: Course | null = null;
  courseApplications: StudyHistory[] = [];
  filteredCourseApplications: (StudyHistory & { student?: User })[] = [];
  appSearchCategory: 'name' | 'indexNumber' = 'name';
  appSearchTerm: string = '';
  courseColumns: string[] = ['name', 'code', 'ectsPoints', 'syllabus', 'actions'];
  studentColumns: string[] = ['name', 'indexNumber', 'actions'];
  historyColumns: string[] = ['courseName', 'term', 'examsTaken', 'grade', 'passed', 'actions'];
  applicationColumns: string[] = ['studentName', 'indexNumber', 'term', 'examsTaken', 'grade', 'passed', 'actions'];

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    const user = this.apiService.getCurrentUser();
    if (!user || user.role !== 'TEACHER') {
      this.snackBar.open('Unauthorized access', 'Close', { duration: 3003 });
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    Promise.all([
      this.loadCourses(),
      this.loadSyllabuses(),
      this.loadNotifications()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  private loadCourses(): Promise<void> {
    return new Promise((resolve) => {
      this.apiService.getAllCourses().subscribe({
        next: (courses: Course[]) => {
          this.courses = courses;
          if (courses.length === 0) {
            this.snackBar.open('No courses available', 'Close', { duration: 3003 });
          }
          resolve();
        },
        error: (err: any) => {
          console.error('Failed to load courses:', err);
          this.snackBar.open('Failed to load courses: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
          resolve();
        }
      });
    });
  }

  private loadSyllabuses(): Promise<void> {
    return new Promise((resolve) => {
      this.apiService.getSyllabuses().subscribe({
        next: (syllabuses: Syllabus[]) => {
          this.syllabuses = syllabuses.reduce((acc, syllabus) => {
            if (syllabus.courseId) {
              acc[syllabus.courseId] = syllabus;
            }
            return acc;
          }, {} as { [key: number]: Syllabus });
          console.log('Syllabuses loaded:', this.syllabuses);
          resolve();
        },
        error: (err: any) => {
          console.error('Failed to load syllabuses:', err);
          this.snackBar.open('Failed to load syllabuses: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
          resolve();
        }
      });
    });
  }

  private loadNotifications(): Promise<void> {
    return new Promise((resolve) => {
      this.apiService.getNotifications().subscribe({
        next: (notifications: Notification[]) => {
          this.notifications = notifications.filter(n => n.recipientRole === 'TEACHER');
          if (this.notifications.length === 0) {
            this.snackBar.open('No notifications available', 'Close', { duration: 3003 });
          }
          resolve();
        },
        error: (err: any) => {
          console.error('Failed to load notifications:', err);
          this.snackBar.open('Failed to load notifications: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
          resolve();
        }
      });
    });
  }

  openSyllabusForm(course: Course | null): void {
    this.showSyllabusForm = true;
    if (course && this.syllabuses[course.id!]) {
      this.editingSyllabus = { ...this.syllabuses[course.id!] };
      this.newSyllabus = { ...this.syllabuses[course.id!] };
    } else {
      this.editingSyllabus = null;
      this.newSyllabus = { courseId: course?.id || 0, content: '' };
    }
  }

  saveSyllabus(): void {
    if (this.newSyllabus.courseId === 0) {
      this.snackBar.open('Please select a course', 'Close', { duration: 3003 });
      return;
    }
    if (this.editingSyllabus && this.editingSyllabus.id) {
      this.apiService.updateSyllabus(this.editingSyllabus.id, this.newSyllabus).subscribe({
        next: (syllabus: Syllabus) => {
          this.syllabuses[syllabus.courseId] = syllabus;
          this.showSyllabusForm = false;
          this.newSyllabus = { courseId: 0, content: '' };
          this.snackBar.open('Syllabus updated successfully', 'Close', { duration: 3003 });
        },
        error: (err: any) => {
          console.error('Failed to update syllabus:', err);
          this.snackBar.open('Failed to update syllabus: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
        }
      });
    } else {
      this.apiService.createSyllabus(this.newSyllabus).subscribe({
        next: (syllabus: Syllabus) => {
          this.syllabuses[syllabus.courseId] = syllabus;
          this.showSyllabusForm = false;
          this.newSyllabus = { courseId: 0, content: '' };
          this.snackBar.open('Syllabus created successfully', 'Close', { duration: 3003 });
        },
        error: (err: any) => {
          console.error('Failed to create syllabus:', err);
          this.snackBar.open('Failed to create syllabus: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
        }
      });
    }
  }

  deleteSyllabus(): void {
    if (this.editingSyllabus && this.editingSyllabus.id) {
      this.apiService.deleteSyllabus(this.editingSyllabus.id).subscribe({
        next: () => {
          delete this.syllabuses[this.editingSyllabus!.courseId];
          this.showSyllabusForm = false;
          this.newSyllabus = { courseId: 0, content: '' };
          this.snackBar.open('Syllabus deleted successfully', 'Close', { duration: 3003 });
        },
        error: (err: any) => {
          console.error('Failed to delete syllabus:', err);
          this.snackBar.open('Failed to delete syllabus: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
        }
      });
    }
  }

  cancelSyllabusForm(): void {
    this.showSyllabusForm = false;
    this.newSyllabus = { courseId: 0, content: '' };
    this.editingSyllabus = null;
  }

  viewCourseApplications(courseId: number): void {
    this.selectedCourse = this.courses.find(c => c.id === courseId) || null;
    if (!this.selectedCourse) {
      this.snackBar.open('Course not found', 'Close', { duration: 3003 });
      return;
    }
    this.showCourseApplications = true;
    this.appSearchTerm = '';
    this.filteredCourseApplications = [];
    this.loadCourseApplications(courseId);
  }

  private loadCourseApplications(courseId: number): void {
    this.apiService.getStudentsByQuery('').subscribe({
      next: (students: User[]) => {
        const studentIds = students
          .filter(s => s.role === 'STUDENT' && s.enrolledCourses?.some(c => c.id === courseId))
          .map(s => s.id!);
        if (studentIds.length === 0) {
          this.courseApplications = [];
          this.filteredCourseApplications = [];
          this.snackBar.open('No students enrolled in this course', 'Close', { duration: 3003 });
          return;
        }
        const historyRequests = studentIds.map(id =>
          this.apiService.getStudentHistory(id).pipe(
            catchError(() => of([] as StudyHistory[]))
          )
        );
        forkJoin(historyRequests).subscribe({
          next: (histories: StudyHistory[][]) => {
            this.courseApplications = histories.flat().filter(h => h.courseId === courseId);
            this.filteredCourseApplications = this.courseApplications.map(h => ({
              ...h,
              student: students.find(s => {
                let found = false;
                this.apiService.getExamApplicationsByUserId(s.id!).pipe(
                  catchError(() => of([] as ExamApplication[]))
                ).subscribe(apps => {
                  found = apps.some(a => a.course.id === h.courseId && a.term === h.term);
                });
                return found;
              })
            }));
            if (this.courseApplications.length === 0) {
              this.snackBar.open('No exam applications for this course', 'Close', { duration: 3003 });
            }
          },
          error: (err: any) => {
            console.error('Failed to load course applications:', err);
            this.snackBar.open('Failed to load course applications: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
            this.courseApplications = [];
            this.filteredCourseApplications = [];
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to load students:', err);
        this.snackBar.open('Failed to load students: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
        this.courseApplications = [];
        this.filteredCourseApplications = [];
      }
    });
  }

  searchCourseApplications(): void {
    if (!this.appSearchTerm.trim()) {
      this.filteredCourseApplications = this.courseApplications.map(h => ({
        ...h,
        student: this.filteredStudents.find(s => {
          let found = false;
          this.apiService.getExamApplicationsByUserId(s.id!).pipe(
            catchError(() => of([] as ExamApplication[]))
          ).subscribe(apps => {
            found = apps.some(a => a.course.id === h.courseId && a.term === h.term);
          });
          return found;
        })
      }));
      return;
    }
    this.filteredCourseApplications = this.courseApplications
      .map(h => ({
        ...h,
        student: this.filteredStudents.find(s => {
          let found = false;
          this.apiService.getExamApplicationsByUserId(s.id!).pipe(
            catchError(() => of([] as ExamApplication[]))
          ).subscribe(apps => {
            found = apps.some(a => a.course.id === h.courseId && a.term === h.term);
          });
          return found;
        })
      }))
      .filter(app => {
        if (!app.student) return false;
        if (this.appSearchCategory === 'name') {
          const fullName = `${app.student.firstName} ${app.student.lastName}`.toLowerCase();
          return fullName.includes(this.appSearchTerm.toLowerCase());
        } else {
          return app.student.indexNumber?.toLowerCase().includes(this.appSearchTerm.toLowerCase());
        }
      });
    if (this.filteredCourseApplications.length === 0) {
      this.snackBar.open('No applications match the search criteria', 'Close', { duration: 3003 });
    }
  }

  clearCourseApplications(): void {
    this.showCourseApplications = false;
    this.selectedCourse = null;
    this.courseApplications = [];
    this.filteredCourseApplications = [];
    this.appSearchTerm = '';
    this.appSearchCategory = 'name';
  }

  searchStudents(): void {
    if (!this.searchTerm.trim()) {
      this.filteredStudents = [];
      this.snackBar.open('Please enter a search term', 'Close', { duration: 3003 });
      return;
    }
    const query = this.searchCategory === 'name'
      ? `${this.searchTerm}`
      : `indexNumber:${this.searchTerm}`;
    this.apiService.getStudentsByQuery(query).subscribe({
      next: (students: User[]) => {
        this.filteredStudents = students.filter(s => s.role === 'STUDENT');
        if (this.filteredStudents.length === 0) {
          this.snackBar.open('No students found', 'Close', { duration: 3003 });
        }
        this.selectedStudent = null;
        this.studyHistory = [];
      },
      error: (err: any) => {
        console.error('Failed to search students:', err);
        this.snackBar.open('Failed to search students: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
        this.filteredStudents = [];
      }
    });
  }

  viewStudentDetails(userId: number): void {
    const student = this.filteredStudents.find(s => s.id === userId);
    if (!student) {
      this.snackBar.open('Student not found in search results', 'Close', { duration: 3003 });
      return;
    }
    if (student.role !== 'STUDENT') {
      this.snackBar.open('Selected user is not a student', 'Close', { duration: 3003 });
      return;
    }
    this.selectedStudent = student;
    this.loadStudentHistory(userId);
  }

  private loadStudentHistory(userId: number): void {
    this.apiService.getStudentHistory(userId).subscribe({
      next: (history: StudyHistory[]) => {
        this.studyHistory = history;
        if (history.length === 0) {
          this.snackBar.open('No study history for this student', 'Close', { duration: 3003 });
        }
      },
      error: (err: any) => {
        console.error('Failed to load student history:', err);
        this.snackBar.open('Failed to load student history: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
        this.studyHistory = [];
      }
    });
  }

  openGradeForm(history: StudyHistory): void {
    this.showGradeForm = true;
    this.gradingHistory = history;
    this.newGrade = null;
    this.numberOfTakenExams = history.examsTaken + 1;
  }

  submitGrade(): void {
    if (this.gradingHistory && this.newGrade !== null) {
      this.apiService.getExamApplicationsByUserId(this.selectedStudent!.id!).subscribe({
        next: (applications: ExamApplication[]) => {
          const application = applications.find(app => 
            app.course.id === this.gradingHistory!.courseId && 
            app.term === this.gradingHistory!.term
          );
          if (!application) {
            this.snackBar.open('Exam application not found', 'Close', { duration: 3003 });
            return;
          }
          this.apiService.gradeExam(application.id, this.newGrade!, this.numberOfTakenExams).subscribe({
            next: () => {
              this.showGradeForm = false;
              this.gradingHistory = null;
              this.newGrade = null;
              this.numberOfTakenExams = 1;
              this.snackBar.open('Exam graded successfully', 'Close', { duration: 3003 });
              if (this.selectedStudent) {
                this.loadStudentHistory(this.selectedStudent.id!);
              }
              if (this.selectedCourse) {
                this.loadCourseApplications(this.selectedCourse.id!);
              }
            },
            error: (err: any) => {
              console.error('Failed to grade exam:', err);
              this.snackBar.open('Failed to grade exam: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
            }
          });
        },
        error: (err: any) => {
          console.error('Failed to fetch exam applications:', err);
          this.snackBar.open('Failed to fetch exam applications: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
        }
      });
    }
  }

  deleteCourseApplication(history: StudyHistory & { student?: User }): void {
    if (!history.student?.id) {
      this.snackBar.open('Student information missing', 'Close', { duration: 3003 });
      return;
    }
    this.apiService.getExamApplicationsByUserId(history.student.id).subscribe({
      next: (applications: ExamApplication[]) => {
        const application = applications.find(app => 
          app.course.id === history.courseId && 
          app.term === history.term
        );
        if (!application) {
          this.snackBar.open('Exam application not found', 'Close', { duration: 3003 });
          return;
        }
        this.apiService.deleteExamApplication(application.id).subscribe({
          next: () => {
            this.snackBar.open('Exam application deleted successfully', 'Close', { duration: 3003 });
            this.loadCourseApplications(this.selectedCourse!.id!);
          },
          error: (err: any) => {
            console.error('Failed to delete exam application:', err);
            this.snackBar.open('Failed to delete exam application: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to fetch exam applications:', err);
        this.snackBar.open('Failed to fetch exam applications: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
      }
    });
  }

  deleteStudentApplication(history: StudyHistory): void {
    this.apiService.getExamApplicationsByUserId(this.selectedStudent!.id!).subscribe({
      next: (applications: ExamApplication[]) => {
        const application = applications.find(app => 
          app.course.id === history.courseId && 
          app.term === history.term
        );
        if (!application) {
          this.snackBar.open('Exam application not found', 'Close', { duration: 3003 });
          return;
        }
        this.apiService.deleteExamApplication(application.id).subscribe({
          next: () => {
            this.snackBar.open('Exam application deleted successfully', 'Close', { duration: 3003 });
            this.loadStudentHistory(this.selectedStudent!.id!);
          },
          error: (err: any) => {
            console.error('Failed to delete exam application:', err);
            this.snackBar.open('Failed to delete exam application: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to fetch exam applications:', err);
        this.snackBar.open('Failed to fetch exam applications: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
      }
    });
  }

  cancelGradeForm(): void {
    this.showGradeForm = false;
    this.gradingHistory = null;
    this.newGrade = null;
    this.numberOfTakenExams = 1;
  }
}