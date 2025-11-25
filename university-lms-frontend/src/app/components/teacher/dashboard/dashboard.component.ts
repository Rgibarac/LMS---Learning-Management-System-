import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Course } from '../../../core/models/course.model';
import { Syllabus } from '../../../core/models/syllabus.model';
import { Notification } from '../../../core/models/notification.model';
import { User } from '../../../core/models/user.model';
import { StudyHistory } from '../../../core/models/study-history.model';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatList, MatListItem } from "@angular/material/list";
import { ExamApplication } from '../../../core/models/exam-application.model';



@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatList,
    MatListItem
],
  template: `
    <div class="dashboard-header">
      <h1>Teacher Portal</h1>
      <p class="welcome">Welcome back, <strong>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</strong></p>
    </div>

    <div *ngIf="isLoading" class="loading">
      <mat-spinner diameter="60"></mat-spinner>
      <p>Loading your courses and data...</p>
    </div>

    <div *ngIf="!isLoading" class="dashboard-grid">

      <mat-card class="action-card" (click)="openDialog('courses')">
        <mat-card-header>
          <div mat-card-avatar class="icon courses"><mat-icon>book</mat-icon></div>
          <mat-card-title>My Courses</mat-card-title>
          <mat-card-subtitle>{{ courses.length }} active</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content><p>View syllabuses & exam applications</p></mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="primary"><mat-icon>arrow_forward</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="action-card" (click)="openDialog('syllabus')">
        <mat-card-header>
          <div mat-card-avatar class="icon syllabus"><mat-icon>description</mat-icon></div>
          <mat-card-title>Syllabus Management</mat-card-title>
          <mat-card-subtitle>{{ syllabusesCount }} uploaded</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content><p>Create or update course syllabuses</p></mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="accent"><mat-icon>edit</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="action-card" (click)="openDialog('grading')">
        <mat-card-header>
          <div mat-card-avatar class="icon grading"><mat-icon>grading</mat-icon></div>
          <mat-card-title>Grade Exams</mat-card-title>
          <mat-card-subtitle>Search & grade students</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content><p>Enter final grades and view history</p></mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="warn"><mat-icon>rate_review</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="action-card" (click)="openDialog('notifications')">
        <mat-card-header>
          <div mat-card-avatar class="icon notify"><mat-icon>notifications</mat-icon></div>
          <mat-card-title>Notifications</mat-card-title>
          <mat-card-subtitle>{{ notifications.length }} unread</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content><p>System updates and announcements</p></mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="primary"><mat-icon>mark_email_read</mat-icon></button>
        </mat-card-actions>
      </mat-card>
    </div>

    <ng-template #coursesDialog>
  <h2 mat-dialog-title><mat-icon>book</mat-icon> My Courses</h2>
  <mat-dialog-content class="scrollable">
    @if (courses.length > 0) {
      <mat-table [dataSource]="courses">
        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef>Course Name</mat-header-cell>
          <mat-cell *matCellDef="let c">{{ c.name }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="code">
          <mat-header-cell *matHeaderCellDef>Code</mat-header-cell>
          <mat-cell *matCellDef="let c">{{ c.code }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="ects">
          <mat-header-cell *matHeaderCellDef>ECTS</mat-header-cell>
          <mat-cell *matCellDef="let c">{{ c.ectsPoints }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="syllabus">
          <mat-header-cell *matHeaderCellDef>Syllabus</mat-header-cell>
          <mat-cell *matCellDef="let c">
            @if (syllabuses[c.id!]) {
              <a [href]="syllabuses[c.id!].content" target="_blank" class="link">
                <mat-icon>description</mat-icon> View PDF
              </a>
            } @else {
              <span class="missing">Not uploaded</span>
            }
            <button mat-icon-button (click)="openSyllabusForm(c); $event.stopPropagation()">
              <mat-icon>edit</mat-icon>
            </button>
          </mat-cell>
        </ng-container>
        <ng-container matColumnDef="actions">
          <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
          <mat-cell *matCellDef="let c">
            <button mat-stroked-button (click)="viewCourseApplications(c.id!)">
              Exam Applications
            </button>
          </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="courseColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: courseColumns"></mat-row>
      </mat-table>

      <div *ngIf="selectedCourse" style="margin-top: 40px;">
        <h3>Exam Applications: {{ selectedCourse.name }}</h3>

        <div *ngIf="examApplicationsForSelectedCourse.length === 0" style="text-align: center; padding: 20px; color: #666;">
          <p>No students have applied for the exam yet.</p>
        </div>

        <mat-table *ngIf="examApplicationsForSelectedCourse.length > 0" [dataSource]="examApplicationsForSelectedCourse">
          <ng-container matColumnDef="student">
            <mat-header-cell *matHeaderCellDef>Student</mat-header-cell>
            <mat-cell *matCellDef="let app">
              <strong>{{ app.user.firstName }} {{ app.user.lastName }}</strong><br>
              <small>{{ app.user.indexNumber }}</small>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="term">
            <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
            <mat-cell *matCellDef="let app">{{ app.term }}</mat-cell>
          </ng-container>

          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
            <mat-cell *matCellDef="let app">
              <span style="color: orange; font-weight: bold;">Applied</span>
              <br><small>Go to "Grade Exams" to assign grade</small>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="['student', 'term', 'status']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['student', 'term', 'status']"></mat-row>
        </mat-table>
      </div>
    } @else {
      <p>No courses assigned to you.</p>
    }
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>

    <ng-template #syllabusDialog>
  <h2 mat-dialog-title><mat-icon>description</mat-icon> Syllabus Management</h2>
  <mat-dialog-content class="scrollable">

    <button mat-raised-button color="primary" (click)="openSyllabusForm(null)" style="margin-bottom: 20px;">
      + Create New Syllabus
    </button>

    @if (showSyllabusForm) {
      <div class="form-box">
        <h3>{{ editingSyllabus ? 'Edit' : 'Create' }} Syllabus</h3>
        <form #syllabusForm="ngForm" (ngSubmit)="saveSyllabus()">
          <mat-form-field appearance="fill">
            <mat-label>Course</mat-label>
            <mat-select [(ngModel)]="newSyllabus.courseId" name="courseId" required [disabled]="!!editingSyllabus">
              @for (c of courses; track c.id) {
                <mat-option [value]="c.id">{{ c.name }} ({{ c.code }})</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Content URL (PDF link)</mat-label>
            <input matInput [(ngModel)]="newSyllabus.content" name="content" required>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Academic Year (optional)</mat-label>
            <input matInput [(ngModel)]="newSyllabus.academicYear" name="year">
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="syllabusForm.invalid">
              {{ editingSyllabus ? 'Update' : 'Create' }}
            </button>
            @if (editingSyllabus) {
              <button mat-raised-button color="warn" (click)="deleteSyllabus()">Delete</button>
            }
            <button mat-button (click)="cancelSyllabusForm()">Cancel</button>
          </div>
        </form>
      </div>
    }

    @if (syllabusesCount > 0 && !showSyllabusForm) {
      <mat-list>
        @for (entry of syllabuses | keyvalue; track entry.key) {
          <mat-list-item class="syllabus-row">
            <div class="syllabus-info">
              <strong>{{ getCourseName(entry.value.courseId) }}</strong>
              <span class="year" *ngIf="entry.value.academicYear">({{ entry.value.academicYear }})</span>
            </div>
          </mat-list-item>
        }
      </mat-list>
    }
  </mat-dialog-content>
</ng-template>

    <ng-template #gradingDialog>
  <h2 mat-dialog-title><mat-icon>grading</mat-icon> Grade Exams & Search Students</h2>
  <mat-dialog-content class="scrollable">

    <form #searchForm="ngForm" (ngSubmit)="searchStudents()" class="search-bar">
      <mat-form-field appearance="fill">
        <mat-label>Search by</mat-label>
        <mat-select [(ngModel)]="searchCategory" name="searchCategory" required>
          <mat-option value="name">Name</mat-option>
          <mat-option value="indexNumber">Index Number</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>Search term</mat-label>
        <input matInput [(ngModel)]="searchTerm" name="searchTerm" required>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="searchForm.invalid">
        Search
      </button>
    </form>

    @if (filteredStudents.length > 0) {
      <mat-table [dataSource]="filteredStudents" class="results-table">
        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
          <mat-cell *matCellDef="let s">{{ s.firstName }} {{ s.lastName }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="index">
          <mat-header-cell *matHeaderCellDef>Index</mat-header-cell>
          <mat-cell *matCellDef="let s">{{ s.indexNumber }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="action">
          <mat-header-cell *matHeaderCellDef></mat-header-cell>
          <mat-cell *matCellDef="let s">
            <button mat-stroked-button (click)="viewStudentDetails(s.id!)">View, View History</button>
          </mat-cell>
        </ng-container>
        <mat-header-row *matHeaderRowDef="['name', 'index', 'action']"></mat-header-row>
        <mat-row *matRowDef="let row; columns: ['name', 'index', 'action']"></mat-row>
      </mat-table>
    } @else if (searchTerm) {
      <p>No students found.</p>
    }

    @if (selectedStudent) {
      <div class="student-section">
        <h3>{{ selectedStudent.firstName }} {{ selectedStudent.lastName }} – Study History</h3>
        @if (studyHistory.length > 0) {
          <mat-table [dataSource]="studyHistory">
            <ng-container matColumnDef="course">
              <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
              <mat-cell *matCellDef="let h">{{ h.courseName }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="term">
              <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
              <mat-cell *matCellDef="let h">{{ h.term }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="exams">
  <mat-header-cell *matHeaderCellDef>Exams Taken</mat-header-cell>
  <mat-cell *matCellDef="let h">
    <strong>{{ getExamAttemptsCount(selectedStudent?.id, h.courseId) }}</strong>
    <small class="text-muted">
      (Attempt {{ getExamAttemptsCount(selectedStudent?.id, h.courseId) }})
    </small>
  </mat-cell>
</ng-container>
            <ng-container matColumnDef="grade">
              <mat-header-cell *matHeaderCellDef>Grade</mat-header-cell>
              <mat-cell *matCellDef="let h">
                <strong *ngIf="h.grade !== null">{{ h.grade }}</strong>
                <em *ngIf="h.grade === null">Not graded</em>
              </mat-cell>
            </ng-container>
            <ng-container matColumnDef="action">
              <mat-header-cell *matHeaderCellDef></mat-header-cell>
              <mat-cell *matCellDef="let h">
                <button mat-raised-button color="primary" 
                        (click)="openGradeForm(h)" 
                        [disabled]="h.grade != null">
                  Grade Exam
                </button>
              </mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="['course','term','exams','grade','action']"></mat-header-row>
            <mat-row *matRowDef="let row; columns: ['course','term','exams','grade','action']"></mat-row>
          </mat-table>
        } @else {
          <p>No study history found for this student.</p>
        }
      </div>
    }


    @if (showGradeForm && gradingHistory) {
      <div class="overlay">
        <div class="grade-box">
          <h3>Grade: {{ gradingHistory.courseName }} ({{ gradingHistory.term }})</h3>
          <form #gradeForm="ngForm" (ngSubmit)="submitGrade()">
            <mat-form-field appearance="fill">
              <mat-label>Final Grade (5–10)</mat-label>
              <input matInput type="number" [(ngModel)]="newGrade" name="grade" required min="5" max="10">
            </mat-form-field>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="gradeForm.invalid">
                Submit Grade
              </button>
              <button mat-button (click)="cancelGradeForm()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    }
  </mat-dialog-content>
</ng-template>
    <ng-template #notificationsDialog>
      <h2 mat-dialog-title><mat-icon>notifications</mat-icon> Notifications</h2>
      <mat-dialog-content>
        <mat-list *ngIf="notifications.length">
          <mat-list-item *ngFor="let n of notifications">
            <h4 matLine>{{ n.title }}</h4>
            <p matLine>{{ n.message }}</p>
            <small matLine>{{ n.createdAt | date:'short' }}</small>
          </mat-list-item>
        </mat-list>
        <p *ngIf="!notifications.length">No notifications</p>
      </mat-dialog-content>
      <mat-dialog-actions><button mat-button mat-dialog-close>Close</button></mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .dashboard-header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 0 0 20px 20px; }
    .welcome { margin: 10px 0 0; font-size: 1.3rem; }
    .loading { text-align: center; padding: 100px; }
    .dashboard-grid { padding: 30px; display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); max-width: 1400px; margin: 0 auto; }
    .action-card { cursor: pointer; transition: all 0.3s; height: 100%; }
    .action-card:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important; }
    .icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; }
    .courses { background: #1976d2; }
    .syllabus { background: #7b1fa2; }
    .grading { background: #d32f2f; }
    .notify { background: #f57c00; }
    .scrollable { max-height: 75vh; overflow-y: auto; }
    .attempt-info {
  font-size: 0.8em;
  color: #666;
  margin-left: 4px;
}
  `]
})
export class TeacherDashboardComponent implements OnInit {

  @ViewChild('coursesDialog') coursesDialog!: TemplateRef<any>;
  @ViewChild('syllabusDialog') syllabusDialog!: TemplateRef<any>;
  @ViewChild('gradingDialog') gradingDialog!: TemplateRef<any>;
  @ViewChild('notificationsDialog') notificationsDialog!: TemplateRef<any>;

    currentUser = this.apiService.getCurrentUser();

  isLoading = true;
  courses: Course[] = [];
  syllabuses: { [key: number]: Syllabus } = {};
  notifications: Notification[] = [];

  filteredStudents: User[] = [];
  selectedStudent: User | null = null;
  studyHistory: StudyHistory[] = [];

  showSyllabusForm = false;
  editingSyllabus: Syllabus | null = null;
  newSyllabus: Syllabus = { courseId: 0, content: '', academicYear: '' };

  showGradeForm = false;
  gradingHistory: StudyHistory | null = null;
  newGrade: number | null = null;
  numberOfTakenExams = 1;

  searchCategory: 'name' | 'indexNumber' = 'name';
  searchTerm = '';

  showCourseApplications = false;
  selectedCourse: Course | null = null;
  courseApplications: StudyHistory[] = [];
  filteredCourseApplications: any[] = [];
  appSearchCategory: 'name' | 'indexNumber' = 'name';
  appSearchTerm = '';

  courseColumns = ['name', 'code', 'ects', 'syllabus', 'actions'];
  studentColumns = ['name', 'index', 'action'];
  historyColumns = ['courseName', 'term', 'grade', 'action'];
  examApplicationsForSelectedCourse: ExamApplication[] = [];
  allExamApplications: ExamApplication[] = [];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

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
    const currentTeacherId = this.apiService.getCurrentUser()?.id;

    if (!currentTeacherId) {
      this.snackBar.open('Teacher not logged in', 'Error', { duration: 5000 });
      this.courses = [];
      resolve();
      return;
    }

    this.apiService.getAllCourses().subscribe({
      next: (allCourses: Course[]) => {
        
        this.courses = allCourses.filter(course => 
          course.teacherId === currentTeacherId
        );

        if (this.courses.length === 0) {
          this.snackBar.open('No courses assigned to you yet', 'Info', { duration: 5000 });
        } else {
          this.snackBar.open(`Loaded ${this.courses.length} your course(s)`, 'Success', { duration: 3000 });
        }
        resolve();
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
        this.snackBar.open('Failed to load your courses', 'Error', { duration: 5000 });
        this.courses = [];
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
  const course = this.courses.find(c => c.id === courseId);
  if (!course) return;

  this.selectedCourse = course;

  this.apiService.getAllExamApplications().subscribe({
    next: (apps: ExamApplication[]) => {
      this.examApplicationsForSelectedCourse = apps.filter(
        app => app.course.id === courseId
      );

      if (this.examApplicationsForSelectedCourse.length === 0) {
        this.snackBar.open('No applications yet', 'Info');
      } else {
        this.snackBar.open(`${this.examApplicationsForSelectedCourse.length} student(s) applied`, 'Success');
      }
    },
    error: () => this.snackBar.open('Failed to load applications', 'Error')
  });
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
    this.selectedStudent = null;
    this.studyHistory = [];
    return;
  }

  const term = this.searchTerm.trim().toLowerCase();


  if (this.allExamApplications.length === 0) {
    this.apiService.getAllExamApplications().subscribe({
      next: (apps: ExamApplication[]) => {
        this.allExamApplications = apps;

        this.filterStudentsFromApplications(term);
      },
      error: () => {
        this.snackBar.open('Failed to load exam applications', 'Error', { duration: 5000 });
        this.filteredStudents = [];
      }
    });
  } else {
    this.filterStudentsFromApplications(term);
  }
}

private filterStudentsFromApplications(term: string): void {
  const uniqueStudents = new Map<number, User>();

  this.allExamApplications.forEach(app => {
    const user = app.user;
    if (user && user.role === 'STUDENT' && !uniqueStudents.has(user.id!)) {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const indexMatch = user.indexNumber?.toLowerCase().includes(term);

      if (fullName.includes(term) || indexMatch) {
        uniqueStudents.set(user.id!, user);
      }
    }
  });

  this.filteredStudents = Array.from(uniqueStudents.values());

  if (this.filteredStudents.length === 0) {
    this.snackBar.open('No students found with exam applications', 'Info', { duration: 4000 });
  } else {
    this.snackBar.open(`Found ${this.filteredStudents.length} student(s)`, 'Success', { duration: 3000 });
  }

  this.selectedStudent = null;
  this.studyHistory = [];
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
  console.log('submitGrade called', { 
    gradingHistory: this.gradingHistory,
    newGrade: this.newGrade,
    selectedStudent: this.selectedStudent
  });

  if (!this.selectedStudent?.id) {
    this.snackBar.open('No student selected', 'Error');
    return;
  }
  if (!this.gradingHistory?.courseId) {
    this.snackBar.open('No course selected for grading', 'Error');
    return;
  }
  if (this.newGrade === null || this.newGrade < 5 || this.newGrade > 10) {
    this.snackBar.open('Please enter a valid grade (5-10)', 'Error');
    return;
  }

  if (this.allExamApplications.length === 0) {
    this.apiService.getAllExamApplications().subscribe({
      next: (apps) => {
        this.allExamApplications = apps;
        this.submitGradeAfterLoad();
      },
      error: () => this.snackBar.open('Failed to load applications', 'Error')
    });
  } else {
    this.submitGradeAfterLoad();
  }
}

private submitGradeAfterLoad(): void {
  const apps = this.allExamApplications.filter(app => 
    app.user.id === this.selectedStudent!.id &&
    app.course.id === this.gradingHistory!.courseId &&
    app.term === this.gradingHistory!.term
  );

  if (apps.length === 0) {
    this.snackBar.open('No application found for this course/term', 'Error');
    return;
  }

  const latestApp = apps[apps.length - 1];
  const attempts = this.getExamAttemptsCount(this.selectedStudent!.id!, this.gradingHistory!.courseId);

  this.apiService.gradeExam(latestApp.id, this.newGrade!, attempts).subscribe({
    next: () => {
      this.snackBar.open(`Grade ${this.newGrade} saved! (Attempt ${attempts})`, 'Success', { duration: 5000 });
      this.showGradeForm = false;
      this.gradingHistory = null;
      this.newGrade = null;
      this.loadStudentHistory(this.selectedStudent!.id!);
    },
    error: (err) => {
      console.error('Grade failed:', err);
      this.snackBar.open('Failed to save grade', 'Error');
    }
  });
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

  openDialog(type: 'courses' | 'syllabus' | 'grading' | 'notifications'): void {
    const templates: Record<string, TemplateRef<any>> = {
      courses: this.coursesDialog,
      syllabus: this.syllabusDialog,
      grading: this.gradingDialog,
      notifications: this.notificationsDialog
    };
    this.dialog.open(templates[type], { width: '95vw', maxWidth: '1200px', height: type === 'grading' ? '90vh' : 'auto' });
  }

  get syllabusesCount(): number {
    return Object.keys(this.syllabuses).length;
  }

  getCourseName(courseId: number): string {
  return this.courses.find(c => c.id === courseId)?.name || 'Unknown Course';
}

getExamAttemptsCount(studentId: number | undefined, courseId: number): number {
  if (!studentId || !courseId || this.allExamApplications.length === 0) {
    return 0;
  }

  return this.allExamApplications.filter(app => {
    return app.user?.id === studentId && app.course?.id === courseId;
  }).length;
}

}