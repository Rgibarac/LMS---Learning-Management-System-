import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Course } from '../../../core/models/course.model';
import { StudyHistory } from '../../../core/models/study-history.model';
import { User } from '../../../core/models/user.model';
import { Syllabus } from '../../../core/models/syllabus.model';
import { StudyProgram } from '../../../core/models/study-program.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Term } from '../../../core/models/term.model';
import { TermSchedule } from '../../../core/models/term-schedule.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="dashboard-header">
      <h1>Student Portal</h1>
      <p class="welcome-text" *ngIf="user">Welcome back, <strong>{{ user.firstName }} {{ user.lastName }}</strong></p>
    </div>

    <div *ngIf="isLoading" class="loading-container">
      <mat-spinner diameter="60"></mat-spinner>
      <p>Loading your academic profile...</p>
    </div>

    <div *ngIf="!isLoading && user" class="student-dashboard">

      <mat-card class="info-card profile-card" (click)="openDialog('profile')">
        <mat-card-header>
          <div mat-card-avatar class="avatar"><mat-icon>person</mat-icon></div>
          <mat-card-title>Personal Information</mat-card-title>
          <mat-card-subtitle>Index: {{ user.indexNumber }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Username:</strong> {{ user.username }}</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="primary"><mat-icon>edit</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="info-card program-card" (click)="openDialog('program')">
        <mat-card-header>
          <div mat-card-avatar class="avatar program"><mat-icon>school</mat-icon></div>
          <mat-card-title>Study Program</mat-card-title>
          <mat-card-subtitle *ngIf="studyProgram">{{ studyProgram.name }}</mat-card-subtitle>
          <mat-card-subtitle *ngIf="!studyProgram">Not assigned</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p *ngIf="studyProgram">You are enrolled in this program.</p>
          <p *ngIf="!studyProgram" class="warning">Contact administration</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="accent"><mat-icon>info</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="info-card courses-card" (click)="openDialog('courses')">
        <mat-card-header>
          <div mat-card-avatar class="avatar courses"><mat-icon>book</mat-icon></div>
          <mat-card-title>Current Courses</mat-card-title>
          <mat-card-subtitle>{{ currentCourses.length }} active course(s)</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>View syllabuses and course details</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="primary"><mat-icon>arrow_forward</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card 
        class="info-card exam-card" 
        (click)="activeTerm && openDialog('exam')"
        [class.disabled]="!activeTerm">
        <mat-card-header>
          <div mat-card-avatar class="avatar exam"><mat-icon>assignment_turned_in</mat-icon></div>
          <mat-card-title>Apply for Exam</mat-card-title>
          <mat-card-subtitle *ngIf="activeTerm">
            <strong>Active Term:</strong> {{ activeTerm.name }}
          </mat-card-subtitle>
          <mat-card-subtitle *ngIf="!activeTerm" class="no-term">
            No active term
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p *ngIf="activeTerm">
            Apply for exams in <strong>{{ activeTerm.name }}</strong>
          </p>
          <p *ngIf="!activeTerm" class="no-term-text">
            Exam applications are currently closed
          </p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab [color]="activeTerm ? 'warn' : 'default'" [disabled]="!activeTerm">
            <mat-icon>{{ activeTerm ? 'how_to_reg' : 'lock' }}</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="info-card history-card" (click)="openDialog('history')">
    <mat-card-header>
      <div mat-card-avatar class="avatar history"><mat-icon>history_edu</mat-icon></div>
      <mat-card-title>Study History</mat-card-title>
      <mat-card-subtitle>{{ gradedCount }} completed course(s)</mat-card-subtitle>
    </mat-card-header>
    <mat-card-content>
      <p><strong>{{ totalEctsPoints }}</strong> ECTS earned</p>
      <div class="ects-bar">
        <div class="ects-fill" [style.width.%]="ectsProgress"></div>
      </div>
      <small>{{ ectsProgress.toFixed(1) }}% toward degree</small>
    </mat-card-content>
    <mat-card-actions align="end">
      <button mat-mini-fab color="primary"><mat-icon>timeline</mat-icon></button>
    </mat-card-actions>
  </mat-card>

  <mat-card class="info-card enroll-card" (click)="openDialog('enroll')">
  <mat-card-header>
    <div mat-card-avatar class="avatar enroll"><mat-icon>add_circle</mat-icon></div>
    <mat-card-title>Enroll in New Courses</mat-card-title>
    <mat-card-subtitle>{{ availableCourses.length }} course(s) available</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p *ngIf="currentStudyYear && studyProgram">
      Year {{ currentStudyYear }} • {{ studyProgram.name }}
    </p>
    <p *ngIf="!currentStudyYear" class="warning">Study year not set</p>
    <p *ngIf="!studyProgram" class="warning">No program assigned</p>
  </mat-card-content>
  <mat-card-actions align="end">
    <button mat-mini-fab color="accent"><mat-icon>school</mat-icon></button>
  </mat-card-actions>
</mat-card>
    </div>

   <ng-template #profileDialog>
  <h2 mat-dialog-title><mat-icon>person</mat-icon> Edit Profile</h2>
  <mat-dialog-content>
    @if (user) {
      <form #profileForm="ngForm" (ngSubmit)="updateProfile()" class="form-grid">
        <mat-form-field appearance="fill">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="user!.email" name="email" required email>
          <mat-error>Email is required and must be valid</mat-error>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>First Name</mat-label>
          <input matInput [(ngModel)]="user!.firstName" name="firstName" required>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Last Name</mat-label>
          <input matInput [(ngModel)]="user!.lastName" name="lastName" required>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Index Number</mat-label>
          <input matInput [(ngModel)]="user!.indexNumber" name="indexNumber" required>
        </mat-form-field>
        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid">
            Save Changes
          </button>
          <button mat-button mat-dialog-close>Cancel</button>
        </div>
      </form>
    }
    </mat-dialog-content>
    </ng-template>

    <ng-template #programDialog>
      <h2 mat-dialog-title><mat-icon>school</mat-icon> Study Program</h2>
      <mat-dialog-content>
        <div *ngIf="studyProgram" class="program-info">
          <h3>{{ studyProgram.name }}</h3>
          <p><strong>ID:</strong> {{ studyProgram.id }}</p>
          <p *ngIf="studyProgram.description">{{ studyProgram.description }}</p>
        </div>
        <div *ngIf="!studyProgram" class="warning">
          <mat-icon>warning</mat-icon>
          <p>No study program assigned. Please contact the administration.</p>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button mat-dialog-close>Close</button>
      </mat-dialog-actions>
    </ng-template>

    <ng-template #coursesDialog>
      <h2 mat-dialog-title><mat-icon>book</mat-icon> Current Courses ({{ currentCourses.length }})</h2>
      <mat-dialog-content class="scrollable">
        <mat-table [dataSource]="currentCourses" *ngIf="currentCourses.length > 0">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
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
              <a *ngIf="syllabuses[c.id]" [href]="syllabuses[c.id].content" target="_blank" class="syllabus-link">
                <mat-icon>description</mat-icon> View
              </a>
              <span *ngIf="!syllabuses[c.id]" class="not-available">Not available</span>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="['name', 'code', 'ects', 'syllabus']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['name', 'code', 'ects', 'syllabus']"></mat-row>
        </mat-table>
        <p *ngIf="currentCourses.length === 0">No courses enrolled this semester.</p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button mat-dialog-close>Close</button>
      </mat-dialog-actions>
    </ng-template>

    <ng-template #examDialog>
      <h2 mat-dialog-title>Apply for Exam — {{ activeTerm?.name }}</h2>
      <mat-dialog-content>
        <form #examForm="ngForm" (ngSubmit)="applyForExam()" class="exam-form">
          <mat-form-field appearance="fill" class="full-width">
  <mat-label>Select Course (Scheduled in {{ activeTerm?.name }})</mat-label>
  <mat-select [(ngModel)]="selectedCourseId" name="courseId" required>
    <mat-option *ngFor="let c of getScheduledCourses()" [value]="c.id!">
      {{ c.name }} ({{ c.code }}) — {{ getCourseScheduleText(c.id!) }}
    </mat-option>
  </mat-select>
  <mat-hint *ngIf="getScheduledCourses().length === 0">
    No scheduled exams in active term
  </mat-hint>
</mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Exam Term</mat-label>
            <input matInput [value]="activeTerm?.name || 'No active term'" disabled>
            <mat-hint>Current active term</mat-hint>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="examForm.invalid || !activeTerm">
              Submit Application
            </button>
            <button mat-button mat-dialog-close>Cancel</button>
          </div>
        </form>
      </mat-dialog-content>
    </ng-template>

    <ng-template #historyDialog>
    <h2 mat-dialog-title><mat-icon>history_edu</mat-icon> Exam Applications & Results</h2>
    <mat-dialog-content class="scrollable">

      <h3>Completed Courses ({{ gradedHistory.length }})</h3>
      <mat-table [dataSource]="gradedHistory" *ngIf="gradedHistory.length > 0" class="graded-table">
        <ng-container matColumnDef="courseName">
          <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
          <mat-cell *matCellDef="let h">{{ h.courseName }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="term">
          <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
          <mat-cell *matCellDef="let h">{{ h.term }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="grade">
          <mat-header-cell *matHeaderCellDef>Grade</mat-header-cell>
          <mat-cell *matCellDef="let h"><strong>{{ h.grade }}</strong></mat-cell>
        </ng-container>
        <ng-container matColumnDef="status">
          <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
          <mat-cell *matCellDef="let h">
            <span class="status" [class.passed]="h.passed" [class.failed]="!h.passed">
              {{ h.passed ? 'Passed' : 'Failed' }}
            </span>
          </mat-cell>
        </ng-container>
        <mat-header-row *matHeaderRowDef="['courseName', 'term', 'grade', 'status']"></mat-header-row>
        <mat-row *matRowDef="let row; columns: ['courseName', 'term', 'grade', 'status']"></mat-row>
      </mat-table>
      <p *ngIf="gradedHistory.length === 0" class="empty">No graded courses yet.</p>


      <h3 style="margin-top: 40px;">Pending Applications ({{ pendingHistory.length }})</h3>
      <mat-table [dataSource]="pendingHistory" *ngIf="pendingHistory.length > 0" class="pending-table">
        <ng-container matColumnDef="courseName">
          <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
          <mat-cell *matCellDef="let h">{{ h.courseName }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="term">
          <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
          <mat-cell *matCellDef="let h">{{ h.term }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="status">
          <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
          <mat-cell *matCellDef="let h">
            <span class="status not-reviewed">Not Reviewed</span>
          </mat-cell>
        </ng-container>
        <mat-header-row *matHeaderRowDef="['courseName', 'term', 'status']"></mat-header-row>
        <mat-row *matRowDef="let row; columns: ['courseName', 'term', 'status']"></mat-row>
      </mat-table>
      <p *ngIf="pendingHistory.length === 0" class="empty">No pending applications.</p>

    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  </ng-template>

  <ng-template #enrollDialog>
  <h2 mat-dialog-title><mat-icon>add_circle</mat-icon> Enroll in Available Courses</h2>
  <mat-dialog-content class="scrollable">
    <div *ngIf="currentStudyYear && studyProgram; else noAccess">
      <p>You are in <strong>Year {{ currentStudyYear }}</strong> of <strong>{{ studyProgram.name }}</strong></p>
      <p>Select courses below to enroll:</p>

      <mat-table [dataSource]="availableCourses" *ngIf="availableCourses.length > 0">
        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
          <mat-cell *matCellDef="let c">
            <strong>{{ c.name }}</strong> <small>({{ c.code }})</small>
          </mat-cell>
        </ng-container>
        <ng-container matColumnDef="year">
          <mat-header-cell *matHeaderCellDef>Year</mat-header-cell>
          <mat-cell *matCellDef="let c">Year {{ c.studyYear }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="ects">
          <mat-header-cell *matHeaderCellDef>ECTS</mat-header-cell>
          <mat-cell *matCellDef="let c">{{ c.ectsPoints }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="action">
          <mat-header-cell *matHeaderCellDef>Action</mat-header-cell>
          <mat-cell *matCellDef="let c">
            <button mat-raised-button color="primary" 
        (click)="enrollInCourse(c.id!)"
        [disabled]="isAlreadyEnrolled(c.id!)">
  {{ isAlreadyEnrolled(c.id!) ? 'Enrolled' : 'Enroll' }}
</button>
          </mat-cell>
        </ng-container>
        <mat-header-row *matHeaderRowDef="['name', 'year', 'ects', 'action']"></mat-header-row>
        <mat-row *matRowDef="let row; columns: ['name', 'year', 'ects', 'action']"></mat-row>
      </mat-table>

      <p *ngIf="availableCourses.length === 0" class="empty">
        No courses available for your current year.
      </p>
    </div>

    <ng-template #noAccess>
      <div class="warning">
        <mat-icon>warning</mat-icon>
        <p>You must have a study program and current year assigned to enroll in courses.</p>
      </div>
    </ng-template>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>
  `,
  styles: [`

    .exam-card.disabled {
      opacity: 0.6;
      cursor: not-allowed !important;
      pointer-events: none;
    }
    .exam-card.disabled .avatar { background: #9e9e9e !important; }
    .no-term, .no-term-text { color: #d32f2f; font-weight: bold; }
    .not-reviewed { color: #9c27b0; font-style: italic; }
    .exam-form { display: flex; flex-direction: column; gap: 16px; }
    .full-width { width: 100%; }
    .dashboard-header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 0 0 20px 20px; }
    .dashboard-header h1 { margin: 0; font-size: 2.5rem; }
    .welcome-text { margin: 10px 0 0; font-size: 1.3rem; opacity: 0.95; }
    .loading-container { text-align: center; padding: 80px 20px; }
    .student-dashboard { padding: 30px 20px; max-width: 1400px; margin: 0 auto; }
    .info-card { cursor: pointer; transition: all 0.3s ease; height: 100%; position: relative; overflow: hidden; }
    .info-card:hover { transform: translateY(-10px); box-shadow: 0 15px 35px rgba(0,0,0,0.2) !important; }
    .avatar { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; }
    .profile-card .avatar { background: #1976d2; }
    .program-card .avatar { background: #388e3c; }
    .courses-card .avatar { background: #f57c00; }
    .exam-card .avatar { background: #d32f2f; }
    .history-card .avatar { background: #7b1fa2; }
    .ects-bar { height: 12px; background: #e0e0e0; border-radius: 6px; overflow: hidden; margin: 10px 0; }
    .ects-fill { height: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a); transition: width 1s ease; }
    .status { padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }
    .status.passed { background: #e8f5e8; color: #2e7d32; }
    .status.failed { background: #ffebee; color: #c62828; }
    @media (min-width: 768px) { .student-dashboard { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; } .info-card:nth-child(5) { grid-column: 1 / -1; } }
    @media (min-width: 1200px) { .student-dashboard { grid-template-columns: repeat(4, 1fr); gap: 28px; } .info-card:nth-child(5) { grid-column: unset; } }
    .graded-table { margin-bottom: 24px; }
    .pending-table { opacity: 0.9; }
    .status.not-reviewed {
      background: #9c27b0;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: bold;
    }
    .empty { color: #666; font-style: italic; padding: 20px 0; text-align: center; }
    :host ::ng-deep .error-snackbar {
  background-color: #d32f2f !important;
  color: white !important;
}

:host ::ng-deep .success-snackbar {
  background-color: #388e3c !important;
  color: white !important;
} 
  `]
})
export class StudentDashboardComponent implements OnInit {
  @ViewChild('profileDialog') profileDialog!: TemplateRef<any>;
  @ViewChild('programDialog') programDialog!: TemplateRef<any>;
  @ViewChild('coursesDialog') coursesDialog!: TemplateRef<any>;
  @ViewChild('examDialog') examDialog!: TemplateRef<any>;
  @ViewChild('historyDialog') historyDialog!: TemplateRef<any>;
  @ViewChild('enrollDialog') enrollDialog!: TemplateRef<any>;

  user: User | null = null;
  currentCourses: Course[] = [];
  studyHistory: StudyHistory[] = [];
  studyProgram: StudyProgram | null = null;
  syllabuses: { [key: number]: Syllabus } = {};
  totalEctsPoints: number = 0;
  courseColumns: string[] = ['name', 'code', 'ectsPoints', 'syllabus'];
  historyColumns: string[] = ['courseName', 'term', 'examsTaken', 'grade', 'ectsPoints', 'passed'];
  selectedCourseId: number | null = null;
  examTerm: string = '';
  isLoading: boolean = true;
  activeTerm: Term | null = null;
  gradedHistory: StudyHistory[] = [];
  pendingHistory: StudyHistory[] = [];
  // Add these to your class
  currentStudyYear: number | null = null;
  availableCourses: Course[] = [];
  allCourses: Course[] = []; // all courses from DB
  activeTermSchedules: TermSchedule[] = [];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.user = this.apiService.getCurrentUser();

    if (!this.user?.id) {
      this.snackBar.open('Please log in', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.loadAllData(this.user.id);
    this.loadActiveTerm();
  }

  private loadAllData(userId: number): void {
  forkJoin({
    courses: this.apiService.getStudentCourses(userId).pipe(catchError(() => of([]))),
    program: this.apiService.getStudentStudyProgram(userId).pipe(catchError(() => of(null))),
    history: this.apiService.getStudentHistory(userId).pipe(catchError(() => of([]))),
    allCourses: this.apiService.getCourses().pipe(catchError(() => of([]))),
    appliedYears: this.apiService.getAppliedYearsByUser(userId).pipe(catchError(() => of([]))),
    terms: this.apiService.getTerms().pipe(catchError(() => of([])))
  }).subscribe({
    next: ({ courses, program, history, allCourses, appliedYears, terms }) => {
      this.currentCourses = courses;
      this.studyProgram = program;
      this.studyHistory = history;
      this.allCourses = allCourses;
      this.activeTerm = terms.find(t => t.active) || null;


      if (appliedYears.length > 0) {
        this.currentStudyYear = Math.max(...appliedYears.map(y => y.year));
      }

      this.loadAvailableCourses();

      if (this.activeTerm) {
        this.apiService.getTermSchedulesByTerm(this.activeTerm.id!).subscribe(schedules => {
          this.activeTermSchedules = schedules;
        });
      }

      this.gradedHistory = history.filter(h => h.grade !== null);
      this.pendingHistory = history.filter(h => h.grade === null);

      this.totalEctsPoints = this.gradedHistory
        .filter(h => h.passed)
        .reduce((sum, h) => sum + h.ectsPoints, 0);

      this.loadSyllabuses();
      this.isLoading = false;
    }
  });
}

  private loadSyllabuses(): void {
  if (this.currentCourses.length === 0) {
    this.isLoading = false;
    return;
  }

  const requests = this.currentCourses.map(course => {
    const courseId = course.id;
    if (courseId === undefined) {
      return of({ courseId: null, syllabus: null });
    }
    return this.apiService.getSyllabus(courseId).pipe(
      map(s => ({ courseId, syllabus: s })),
      catchError(() => of({ courseId, syllabus: null }))
    );
  });

  forkJoin(requests).subscribe(results => {
    results.forEach(r => {
      if (r.courseId !== null && r.syllabus) {
        this.syllabuses[r.courseId] = r.syllabus;
      }
    });
    this.isLoading = false;
  });
}

  updateProfile(): void {
    if (!this.user?.id) return;

    this.apiService.updateProfile(this.user).subscribe({
      next: (updated) => {
        this.user = updated;
        this.snackBar.open('Profile updated!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Update failed: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  applyForExam(): void {
  if (!this.user?.id || this.selectedCourseId === null || !this.activeTerm) {
    this.snackBar.open('Please select a course and ensure an active term exists', 'Close', { duration: 5000 });
    return;
  }

  const userId = this.user.id;
  const selectedCourseId = this.selectedCourseId;
  const termValue = `${this.activeTerm.name} (ID: ${this.activeTerm.id})`;

  const selectedCourse = this.currentCourses.find(c => c.id === selectedCourseId);
  if (!selectedCourse) {
    this.snackBar.open('Selected course not found', 'Close', { duration: 5000 });
    return;
  }

  const courseName = selectedCourse.name;

  const existingApp = this.studyHistory.find(h => h.courseName === courseName);

  if (existingApp) {
    if (existingApp.grade === null) {
      this.snackBar.open(
        `You already applied for "${courseName}". Your application is still pending review.`,
        'Close',
        { duration: 8000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    if (existingApp.passed) {
      this.snackBar.open(
        `You have already passed "${courseName}". You cannot apply again.`,
        'Close',
        { duration: 8000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    if (existingApp.grade !== null && !existingApp.passed) {
      const confirm = window.confirm(
        `You failed "${courseName}" in ${existingApp.term}.\n\nDo you want to re-apply for the exam?`
      );
      if (!confirm) return;
    }
  }


  this.apiService.createExamApplication(userId, selectedCourseId, termValue).subscribe({
    next: () => {
      this.snackBar.open(
        `Successfully applied for "${courseName}" in ${this.activeTerm!.name}!`,
        'Close',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
      this.selectedCourseId = null;
      this.dialog.closeAll();
      this.loadAllData(userId);
    },
    error: (err) => {
      this.snackBar.open(
        'Application failed: ' + (err.error?.message || err.message || 'Unknown error'),
        'Close',
        { duration: 6000 }
      );
    }
  });
}

get ectsProgress(): number {
    return this.totalEctsPoints >= 240 ? 100 : (this.totalEctsPoints / 240) * 100;
  }

openDialog(section: 'profile' | 'program' | 'courses' | 'exam' | 'history' | 'enroll'): void {
    let template: TemplateRef<any>;
    switch (section) {
      case 'profile': template = this.profileDialog; break;
      case 'program': template = this.programDialog; break;
      case 'courses': template = this.coursesDialog; break;
      case 'exam': template = this.examDialog; break;
      case 'history': template = this.historyDialog; break;
      case 'enroll': template = this.enrollDialog; break;
      default: return;
    }

    this.dialog.open(template, {
      width: '90vw',
      maxWidth: '1000px',
      height: section === 'courses' || section === 'history' ? '80vh' : 'auto',
      panelClass: 'student-dialog'
    });
  }

  private loadActiveTerm(): void {
    this.apiService.getTerms().subscribe({
      next: (terms) => {
        this.activeTerm = terms.find(t => t.active) || null;
      },
      error: () => this.snackBar.open('Could not load current term', 'Close', { duration: 3000 })
    });
  }

  get gradedCount(): number {
    return this.gradedHistory.length;
  }

  loadAvailableCourses(): void {
  if (!this.studyProgram || this.currentStudyYear === null) {
    this.availableCourses = [];
    return;
  }

  this.availableCourses = this.allCourses.filter(course =>
    course.studyProgramId === this.studyProgram!.id &&
    (course.studyYear ?? 0) <= this.currentStudyYear!
  );
}

enrollInCourse(courseId: number): void {
  if (!this.user?.id) return;

  this.apiService.enrollStudentInCourse(this.user.id, courseId).subscribe({
    next: () => {
      this.snackBar.open('Successfully enrolled!', 'Close', { duration: 4000 });
      if (this.user?.id) {
        this.loadAllData(this.user.id);
}
    },
    error: () => this.snackBar.open('Enrollment failed', 'Error')
  });
}

getScheduledCourses(): Course[] {
  if (!this.activeTermSchedules.length || !this.currentCourses.length) return [];

  const scheduledCourseIds = this.activeTermSchedules
    .flatMap(s => s.courses?.map(c => c.id).filter(Boolean) || [])
    .filter((id): id is number => id !== undefined);

  const scheduledEnrolledCourses = this.currentCourses.filter(c =>
    c.id && scheduledCourseIds.includes(c.id)
  );

  return scheduledEnrolledCourses.filter(course => {
    const passedEntry = this.gradedHistory.find(h =>
      h.courseId === course.id && h.passed === true
    );
    return !passedEntry; 
  });
}

getCourseScheduleText(courseId: number): string {
  const schedules = this.activeTermSchedules.filter(s =>
    s.courses?.some(c => c.id === courseId)
  );
  if (schedules.length === 0) return '';
  const first = schedules[0];
  return `${first.date} ${first.startTime} @ ${first.location || 'TBA'}`;
}

isAlreadyEnrolled(courseId: number): boolean {
  return this.currentCourses.some(c => c.id === courseId);
}
}