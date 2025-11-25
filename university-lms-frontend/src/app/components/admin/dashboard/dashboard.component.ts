import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../core/services/api.service';
import { PdfService } from '../../../core/services/pdf.service';
import { User } from '../../../core/models/user.model';
import { StudyProgram } from '../../../core/models/study-program.model';
import { Course } from '../../../core/models/course.model';
import { Syllabus } from '../../../core/models/syllabus.model';
import { AppliedYear } from '../../../core/models/applied-year.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <h2 class="page-title">Admin Dashboard</h2>


    <div class="debug" *ngIf="showDebug">
      <h3>Debug Information</h3>
      <p>Authenticated: {{ isAuthenticated }} | Role: {{ currentUser?.role }} | Admin: {{ isAdmin }}</p>
      <p>Users: {{ users.length }} | Programs: {{ studyPrograms.length }} | Courses: {{ courses.length }} | Syllabuses: {{ syllabuses.length }}</p>
    </div>


    <div *ngIf="!isAdmin" class="access-denied">
      <mat-icon>lock</mat-icon>
      <h3>Access Denied</h3>
      <p>You must be logged in as an <strong>ADMIN</strong> to access this dashboard.</p>
    </div>

    <div *ngIf="isAdmin" class="dashboard-container">

      <div class="dashboard-grid">
        <mat-card class="admin-card" (click)="openDialog('users')">
          <mat-card-header>
            <div mat-card-avatar class="card-icon users-icon"><mat-icon>people</mat-icon></div>
            <mat-card-title>Manage Users</mat-card-title>
            <mat-card-subtitle>{{ users.length }} user(s)</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Create, edit, and delete system users (Admin, Teacher, Student).</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-mini-fab color="primary"><mat-icon>arrow_forward</mat-icon></button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="admin-card" (click)="openDialog('programs')">
          <mat-card-header>
            <div mat-card-avatar class="card-icon programs-icon"><mat-icon>school</mat-icon></div>
            <mat-card-title>Study Programs</mat-card-title>
            <mat-card-subtitle>{{ studyPrograms.length }} program(s)</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Create and manage academic study programs.</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-mini-fab color="primary"><mat-icon>arrow_forward</mat-icon></button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="admin-card" (click)="openDialog('courses')">
          <mat-card-header>
            <div mat-card-avatar class="card-icon courses-icon"><mat-icon>book</mat-icon></div>
            <mat-card-title>Courses</mat-card-title>
            <mat-card-subtitle>{{ courses.length }} course(s)</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Manage courses and assign them to study programs.</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-mini-fab color="primary"><mat-icon>arrow_forward</mat-icon></button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="admin-card" (click)="openDialog('syllabuses')">
          <mat-card-header>
            <div mat-card-avatar class="card-icon syllabuses-icon"><mat-icon>description</mat-icon></div>
            <mat-card-title>Syllabuses</mat-card-title>
            <mat-card-subtitle>{{ syllabuses.length }} document(s)</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Upload and manage course syllabuses.</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-mini-fab color="primary"><mat-icon>arrow_forward</mat-icon></button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="export-section">
        <button mat-raised-button color="accent" (click)="exportUsersPdf()" class="export-btn">
          <mat-icon>picture_as_pdf</mat-icon>
          Export All Users to PDF
        </button>
      </div>
    </div>

    <ng-template #usersDialog>
      <h2 mat-dialog-title><mat-icon>people</mat-icon> Manage Users</h2>
      <mat-dialog-content class="dialog-content">
        <button mat-raised-button color="primary" (click)="openCreateUserForm()">Create New User</button>

        <form *ngIf="showCreateUserForm" (ngSubmit)="createUser()" #createForm="ngForm" class="form-grid">
          <mat-form-field appearance="fill">
            <mat-label>Username</mat-label>
            <input matInput [(ngModel)]="newUser.username" name="username" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Email</mat-label>
            <input matInput [(ngModel)]="newUser.email" name="email" type="email" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>First Name</mat-label>
            <input matInput [(ngModel)]="newUser.firstName" name="firstName" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Last Name</mat-label>
            <input matInput [(ngModel)]="newUser.lastName" name="lastName" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Index Number</mat-label>
            <input matInput [(ngModel)]="newUser.indexNumber" name="indexNumber" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Password</mat-label>
            <input matInput [(ngModel)]="newUser.password" name="password" type="password" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Role</mat-label>
            <mat-select [(ngModel)]="newUser.role" name="role" required>
              <mat-option value="ADMIN">Admin</mat-option>
              <mat-option value="TEACHER">Teacher</mat-option>
              <mat-option value="STUDENT">Student</mat-option>
              <mat-option value="STAFF">Staff</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="createForm.invalid">Save User</button>
            <button mat-raised-button color="warn" type="button" (click)="cancelCreateUser()">Cancel</button>
          </div>
        </form>

        <form *ngIf="editingUser" (ngSubmit)="updateUser()" class="form-grid">
          <mat-form-field appearance="fill">
            <mat-label>Username</mat-label>
            <input matInput [(ngModel)]="editingUser.username" name="e_username" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Email</mat-label>
            <input matInput [(ngModel)]="editingUser.email" name="e_email" type="email" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>First Name</mat-label>
            <input matInput [(ngModel)]="editingUser.firstName" name="e_firstName" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Last Name</mat-label>
            <input matInput [(ngModel)]="editingUser.lastName" name="e_lastName" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Index Number</mat-label>
            <input matInput [(ngModel)]="editingUser.indexNumber" name="e_indexNumber" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Role</mat-label>
            <mat-select [(ngModel)]="editingUser.role" name="e_role" required>
              <mat-option value="ADMIN">Admin</mat-option>
              <mat-option value="TEACHER">Teacher</mat-option>
              <mat-option value="STUDENT">Student</mat-option>
              <mat-option value="STAFF">Staff</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit">Update User</button>
            <button mat-raised-button color="warn" type="button" (click)="cancelEditUser()">Cancel</button>
          </div>
        </form>

        <mat-spinner *ngIf="loading.users"></mat-spinner>
        <mat-table [dataSource]="users" *ngIf="!loading.users && users.length > 0">
          <ng-container matColumnDef="username">
            <mat-header-cell *matHeaderCellDef>Username</mat-header-cell>
            <mat-cell *matCellDef="let user">{{ user.username }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="email">
            <mat-header-cell *matHeaderCellDef>Email</mat-header-cell>
            <mat-cell *matCellDef="let user">{{ user.email }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="firstName">
            <mat-header-cell *matHeaderCellDef>First Name</mat-header-cell>
            <mat-cell *matCellDef="let user">{{ user.firstName }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="lastName">
            <mat-header-cell *matHeaderCellDef>Last Name</mat-header-cell>
            <mat-cell *matCellDef="let user">{{ user.lastName }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="indexNumber">
            <mat-header-cell *matHeaderCellDef>Index</mat-header-cell>
            <mat-cell *matCellDef="let user">{{ user.indexNumber }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="role">
            <mat-header-cell *matHeaderCellDef>Role</mat-header-cell>
            <mat-cell *matCellDef="let user">{{ user.role }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
            <mat-cell *matCellDef="let user">
              <button mat-icon-button color="primary" (click)="editUser(user); $event.stopPropagation()">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteUser(user.id!); $event.stopPropagation()">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="userColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: userColumns"></mat-row>
        </mat-table>
        <p *ngIf="!loading.users && users.length === 0">No users found.</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Close</button>
      </mat-dialog-actions>
    </ng-template>

    <ng-template #programsDialog>
      <h2 mat-dialog-title><mat-icon>school</mat-icon> Manage Study Programs</h2>
      <mat-dialog-content class="dialog-content">
        <form (ngSubmit)="createStudyProgram()" class="form-grid">
          <mat-form-field appearance="fill">
            <mat-label>Program Name</mat-label>
            <input matInput [(ngModel)]="newStudyProgram.name" name="name" required>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Description</mat-label>
            <textarea matInput [(ngModel)]="newStudyProgram.description" name="description" rows="3"></textarea>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">Create Program</button>
        </form>

        <mat-table [dataSource]="studyPrograms">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
            <mat-cell *matCellDef="let p">{{ p.name }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="description">
            <mat-header-cell *matHeaderCellDef>Description</mat-header-cell>
            <mat-cell *matCellDef="let p">{{ p.description || '—' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let p">
              <button mat-icon-button color="warn" (click)="deleteStudyProgram(p.id!)">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="['name', 'description', 'actions']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['name', 'description', 'actions']"></mat-row>
        </mat-table>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Close</button>
      </mat-dialog-actions>
    </ng-template>

<ng-template #coursesDialog>
  <h2 mat-dialog-title><mat-icon>book</mat-icon> Manage Courses</h2>
  <mat-dialog-content class="dialog-content">

    <form (ngSubmit)="selectedCourse?.id ? updateCourse() : createCourse()" #courseForm="ngForm" class="form-grid">
      
      <mat-form-field appearance="fill">
        <mat-label>Course Name</mat-label>
        <input matInput [(ngModel)]="selectedCourse.name" name="name" required>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Course Code</mat-label>
        <input matInput [(ngModel)]="selectedCourse.code" name="code" required>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>ECTS Points</mat-label>
        <input matInput type="number" [(ngModel)]="selectedCourse.ectsPoints" name="ectsPoints" required min="1">
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Study Program</mat-label>
        <mat-select [(ngModel)]="selectedCourse.studyProgramId" name="studyProgramId" required>
          <mat-option *ngFor="let p of studyPrograms" [value]="p.id">{{ p.name }}</mat-option>
        </mat-select>
      </mat-form-field>


      <mat-form-field appearance="fill">
        <mat-label>Study Year</mat-label>
        <mat-select [(ngModel)]="selectedCourse.studyYear" name="studyYear" required>
          <mat-option [value]="null">— Not assigned —</mat-option>
          <mat-option [value]="1">Year 1</mat-option>
          <mat-option [value]="2">Year 2</mat-option>
          <mat-option [value]="3">Year 3</mat-option>
          <mat-option [value]="4">Year 4</mat-option>
        </mat-select>
        <mat-hint>Courses will be visible to students in this year</mat-hint>
      </mat-form-field>

      <mat-form-field appearance="fill" *ngIf="isAdmin">
        <mat-label>Assigned Teacher</mat-label>
        <mat-select [(ngModel)]="selectedCourse.teacherId" name="teacherId">
          <mat-option [value]="null">— Not assigned —</mat-option>
          <mat-option *ngFor="let t of teachers" [value]="t.id">
            {{ t.firstName }} {{ t.lastName }} ({{ t.username }})
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="fill">
        <mat-label>Description (optional)</mat-label>
        <textarea matInput [(ngModel)]="selectedCourse.description" name="description" rows="3"></textarea>
      </mat-form-field>

      <div class="form-actions">
        <button mat-raised-button color="primary" type="submit" [disabled]="courseForm.invalid">
          {{ selectedCourse?.id ? 'Update Course' : 'Create Course' }}
        </button>
        <button mat-raised-button color="warn" type="button" (click)="cancelCourseForm()">Cancel</button>
      </div>
    </form>

    <mat-table [dataSource]="courses" class="mat-elevation-z2" *ngIf="courses.length > 0">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
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
      <ng-container matColumnDef="program">
        <mat-header-cell *matHeaderCellDef>Program</mat-header-cell>
        <mat-cell *matCellDef="let c">{{ getStudyProgramName(c.studyProgramId) }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="year">
        <mat-header-cell *matHeaderCellDef>Year</mat-header-cell>
        <mat-cell *matCellDef="let c">
          {{ c.studyYear }}
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="teacher">
        <mat-header-cell *matHeaderCellDef>Teacher</mat-header-cell>
        <mat-cell *matCellDef="let c">
          {{ c.teacherId ? getTeacherName(c.teacherId) : '—' }}
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="actions">
        <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
        <mat-cell *matCellDef="let c">
          <button mat-icon-button color="primary" (click)="editCourse(c); $event.stopPropagation()">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="deleteCourse(c.id!); $event.stopPropagation()">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="['name','code','ects','program','year','teacher','actions']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['name','code','ects','program','year','teacher','actions']"></mat-row>
    </mat-table>

    <p *ngIf="courses.length === 0" class="empty">No courses found.</p>
  </mat-dialog-content>

  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>

    <ng-template #syllabusesDialog>
      <h2 mat-dialog-title><mat-icon>description</mat-icon> Manage Syllabuses</h2>
      <mat-dialog-content class="dialog-content">
        <form (ngSubmit)="createSyllabus()" class="form-grid">
          <mat-form-field appearance="fill">
            <mat-label>Course</mat-label>
            <mat-select [(ngModel)]="newSyllabus.courseId" name="courseId" required>
              <mat-option *ngFor="let c of courses" [value]="c.id">{{ c.name }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Academic Year</mat-label>
            <input matInput [(ngModel)]="newSyllabus.academicYear" name="year" required placeholder="e.g. 2025/2026">
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Content (PDF URL or text)</mat-label>
            <textarea matInput [(ngModel)]="newSyllabus.content" name="content" rows="4" required></textarea>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">Create Syllabus</button>
        </form>

        <mat-table [dataSource]="syllabuses">
          <ng-container matColumnDef="course">
            <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
            <mat-cell *matCellDef="let s">{{ getCourseName(s.courseId) }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="year">
            <mat-header-cell *matHeaderCellDef>Year</mat-header-cell>
            <mat-cell *matCellDef="let s">{{ s.academicYear }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let s">
              <button mat-icon-button color="warn" (click)="deleteSyllabus(s.id!)">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="['course', 'year', 'actions']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['course', 'year', 'actions']"></mat-row>
        </mat-table>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Close</button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .page-title { margin: 24px 0; text-align: center; color: #3f51b5; }
    .debug { background: #1e1e1e; color: #a0ffa0; padding: 16px; border-radius: 8px; font-family: monospace; margin: 16px 0; }
    .access-denied { text-align: center; padding: 60px; color: #d32f2f; }
    .access-denied mat-icon { font-size: 80px; width: 80px; height: 80px; }
    .dashboard-container { padding: 20px; }
    .dashboard-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
      gap: 24px; 
      margin-top: 20px;
    }
    .admin-card { 
      cursor: pointer; 
      transition: all 0.3s ease; 
      height: 100%;
    }
    .admin-card:hover { 
      transform: translateY(-8px); 
      box-shadow: 0 12px 30px rgba(0,0,0,0.2) !important; 
    }
    .card-icon { 
      width: 56px; height: 56px; border-radius: 50%; 
      display: flex; align-items: center; justify-content: center; color: white;
    }
    .users-icon { background: #1976d2; }
    .programs-icon { background: #388e3c; }
    .courses-icon { background: #f57c00; }
    .syllabuses-icon { background: #7b1fa2; }
    .export-section { text-align: center; margin: 40px 0; }
    .export-btn { padding: 12px 32px; font-size: 1.1rem; }
    .dialog-content { max-height: 75vh; overflow-y: auto; padding: 10px 0; }
    .form-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
      gap: 16px; 
      margin: 20px 0; 
    }
    .form-actions { 
      grid-column: 1 / -1; 
      display: flex; 
      gap: 12px; 
      justify-content: flex-end; 
    }
    mat-dialog-actions { padding: 16px 24px !important; background: #f5f5f5; }
  `]
})
export class AdminDashboardComponent implements OnInit {

  @ViewChild('usersDialog') usersDialog!: TemplateRef<any>;
  @ViewChild('programsDialog') programsDialog!: TemplateRef<any>;
  @ViewChild('coursesDialog') coursesDialog!: TemplateRef<any>;
  @ViewChild('syllabusesDialog') syllabusesDialog!: TemplateRef<any>;


  users: User[] = [];
  studyPrograms: StudyProgram[] = [];
  courses: Course[] = [];
  syllabuses: Syllabus[] = [];
  selectedCourse: Course = this.emptyCourse();
  appliedYears: AppliedYear[] = [];
  teachers: User[] = [] = [];

  newUser: User = { username: '', email: '', firstName: '', lastName: '', indexNumber: '', password: '', role: '' };
  editingUser: User | null = null;
  showCreateUserForm = false;
  newStudyProgram: StudyProgram = { name: '', description: '' };
  newCourse: Course = { name: '', description: '', code: '', ectsPoints: 6, studyProgramId: 0 };
  newSyllabus: Syllabus = { courseId: 0, content: '', academicYear: '' };

  userColumns = ['username', 'email', 'firstName', 'lastName', 'indexNumber', 'role', 'actions'];
  studyProgramColumns = ['name', 'description', 'actions'];
  courseColumns = ['name', 'code', 'studyProgram', 'actions'];
  syllabusColumns = ['course', 'academicYear', 'content', 'actions'];

  loading = { users: false, studyPrograms: false, courses: false, syllabuses: false };
  showDebug = false;

  isAuthenticated = false;
  isAdmin = false;
  currentUser: User | null = null;
  token: string | null = null;
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private pdfService: PdfService,
     public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadData();
  }

  private checkAuthStatus(): void {
    this.token = localStorage.getItem('token');
    this.currentUser = this.apiService.getCurrentUser();
    this.isAuthenticated = !!this.token && !!this.currentUser;
    this.isAdmin = this.currentUser?.role === 'ADMIN';

    if ((window as any).showAdminDebug) this.showDebug = true;

    console.log('Admin Auth:', { isAuthenticated: this.isAuthenticated, isAdmin: this.isAdmin, role: this.currentUser?.role });
    this.cdr.detectChanges();
  }

  private loadData(): void {
    this.loadStudyPrograms();
    this.loadCourses();
    this.loadSyllabuses();
    this.loadAppliedYearsAndTeachers()

    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  private loadUsers(): void {
    this.loading.users = true;
    this.apiService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading.users = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackBar.open('Failed to load users: ' + err.message, 'Close', { duration: 5000 });
        this.users = [];
        this.loading.users = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadStudyPrograms(): void {
    this.loading.studyPrograms = true;
    this.apiService.getAllStudyPrograms().subscribe({
      next: (data) => {
        this.studyPrograms = data;
        this.loading.studyPrograms = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackBar.open('Failed to load study programs: ' + err.message, 'Close', { duration: 5000 });
        this.studyPrograms = [];
        this.loading.studyPrograms = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadCourses(): void {
    this.loading.courses = true;
    this.apiService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.loading.courses = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackBar.open('Failed to load courses: ' + err.message, 'Close', { duration: 5000 });
        this.courses = [];
        this.loading.courses = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadSyllabuses(): void {
    this.loading.syllabuses = true;
    this.apiService.getAllSyllabuses().subscribe({
      next: (data) => {
        this.syllabuses = data;
        this.loading.syllabuses = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackBar.open('Failed to load syllabuses: ' + err.message, 'Close', { duration: 5000 });
        this.syllabuses = [];
        this.loading.syllabuses = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateUserForm(): void {
    if (!this.isAdmin) return;
    this.showCreateUserForm = true;
    this.editingUser = null;
    this.newUser = { username: '', email: '', firstName: '', lastName: '', indexNumber: '', password: '', role: '' };
  }

  cancelCreateUser(): void {
    this.showCreateUserForm = false;
    this.newUser = { username: '', email: '', firstName: '', lastName: '', indexNumber: '', password: '', role: '' };
  }

  editUser(user: User): void {
  this.editingUser = {
    id: user.id,
    username: user.username || '',
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    indexNumber: user.indexNumber || '',
    role: user.role || 'STUDENT',
    password: '' 
  };
  this.showCreateUserForm = false;
}


updateUser(): void {
  if (!this.editingUser) return;

  this.apiService.updateUser(this.editingUser).subscribe({
    next: (updatedUser) => {
      this.snackBar.open(
        `User "${updatedUser.username}" updated successfully!`,
        'Close',
        { duration: 5000 }
      );

      const index = this.users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        this.users[index] = updatedUser;
        this.users = [...this.users];
      }

      this.editingUser = null;
    },
    error: (err) => {
      this.snackBar.open(
        'Update failed: ' + (err.error || err.message),
        'Close',
        { duration: 8000 }
      );
    }
  });
}
  cancelEditUser(): void {
    this.editingUser = null;
  }

  deleteUser(id: number): void {
    if (confirm('Delete this user?')) {
      this.apiService.deleteUser(id).subscribe({
        next: () => {
          this.snackBar.open('User deleted', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => this.snackBar.open('Delete failed: ' + err.message, 'Close', { duration: 5000 })
      });
    }
  }

  exportUsersPdf(): void {
    this.pdfService.downloadUsers();
  }

  getStudyProgramName(id: number): string {
    return this.studyPrograms.find(p => p.id === id)?.name || 'Unknown';
  }

  getCourseName(id: number): string {
    return this.courses.find(c => c.id === id)?.name || 'Unknown';
  }

  createUser(): void {
    if (!this.newUser.username || !this.newUser.password || !this.newUser.email ||
        !this.newUser.firstName || !this.newUser.lastName || !this.newUser.indexNumber || !this.newUser.role) {
      return;
    }

    this.isLoading = true;

    this.apiService.register(this.newUser).subscribe({
      next: () => {
        this.snackBar.open('User creation successful!', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error: any) => {
        this.isLoading = false;
        const msg = error.error?.message || 'User creation failed. Try again.';
        this.snackBar.open(msg, 'Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }


  createStudyProgram(): void {
    if (!this.newStudyProgram.name) {
      this.snackBar.open('Study Program name is required', 'Close', { duration: 5000 });
      return;
    }
    this.apiService.createStudyProgram(this.newStudyProgram).subscribe({
      next: (program) => {
        console.log('Created study program:', program);
        if (!program.id) {
          console.error('Backend returned study program with id: 0 or undefined');
          this.snackBar.open('Warning: Study Program created but ID is missing', 'Close', { duration: 5000 });
        }
        this.snackBar.open('Study Program created successfully', 'Close', { duration: 5000 });
        this.newStudyProgram = { name: '', description: '' };
        this.loadStudyPrograms();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to create study program:', err);
        this.snackBar.open('Failed to create study program: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  deleteStudyProgram(id: number): void {
    if (!id) {
      this.snackBar.open('Study Program ID is missing', 'Close', { duration: 5000 });
      return;
    }
    console.log('Attempting to delete study program with id:', id);
    if (confirm('Are you sure you want to delete this study program?')) {
      this.apiService.deleteStudyProgram(id).subscribe({
        next: () => {
          console.log('Deleted study program with id:', id);
          this.snackBar.open('Study Program deleted successfully', 'Close', { duration: 5000 });
          this.loadStudyPrograms();
          this.loadCourses();
          this.loadSyllabuses();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to delete study program:', err);
          this.snackBar.open('Failed to delete study program: ' + err.message, 'Close', { duration: 5000 });
        }
      });
    }
  }



  deleteCourse(id: number): void {
    if (!id) {
      this.snackBar.open('Course ID is missing', 'Close', { duration: 5000 });
      return;
    }
    console.log('Attempting to delete course with id:', id);
    if (confirm('Are you sure you want to delete this course?')) {
      this.apiService.deleteCourse(id).subscribe({
        next: () => {
          console.log('Deleted course with id:', id);
          this.snackBar.open('Course deleted successfully', 'Close', { duration: 5000 });
          this.loadCourses();
          this.loadSyllabuses();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to delete course:', err);
          this.snackBar.open('Failed to delete course: ' + err.message, 'Close', { duration: 5000 });
        }
      });
    }
  }

  createSyllabus(): void {
    if (!this.newSyllabus.courseId || !this.newSyllabus.content || !this.newSyllabus.academicYear) {
      this.snackBar.open('Course, content, and academic year are required', 'Close', { duration: 5000 });
      return;
    }
    this.apiService.createSyllabus(this.newSyllabus).subscribe({
      next: (syllabus) => {
        console.log('Created syllabus:', syllabus);
        if (!syllabus.id) {
          console.error('Backend returned syllabus with id: 0 or undefined');
          this.snackBar.open('Warning: Syllabus created but ID is missing', 'Close', { duration: 5000 });
        }
        this.snackBar.open('Syllabus created successfully', 'Close', { duration: 5000 });
        this.newSyllabus = { courseId: 0, content: '', academicYear: '' };
        this.loadSyllabuses();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to create syllabus:', err);
        this.snackBar.open('Failed to create syllabus: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  deleteSyllabus(id: number): void {
    if (!id) {
      this.snackBar.open('Syllabus ID is missing', 'Close', { duration: 5000 });
      return;
    }
    console.log('Attempting to delete syllabus with id:', id);
    if (confirm('Are you sure you want to delete this syllabus?')) {
      this.apiService.deleteSyllabus(id).subscribe({
        next: () => {
          console.log('Deleted syllabus with id:', id);
          this.snackBar.open('Syllabus deleted successfully', 'Close', { duration: 5000 });
          this.loadSyllabuses();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to delete syllabus:', err);
          this.snackBar.open('Failed to delete syllabus: ' + err.message, 'Close', { duration: 5000 });
        }
      });
    }
  }

  openDialog(section: 'users' | 'programs' | 'courses' | 'syllabuses'): void {
    let template: TemplateRef<any>;
    switch (section) {
      case 'users': template = this.usersDialog; break;
      case 'programs': template = this.programsDialog; break;
      case 'courses': template = this.coursesDialog; break;
      case 'syllabuses': template = this.syllabusesDialog; break;
      default: return;
    }

    this.dialog.open(template, {
      width: '95vw',
      maxWidth: '1400px',
      height: '90vh',
      panelClass: 'admin-dialog-container'
    });
  }
  private emptyCourse(): Course {
  return { id: undefined, name: '', code: '', ectsPoints: 6, studyProgramId: 0, studyYear: undefined, teacherId: undefined, description: '' };
}




getTeacherName(id: number): string {
  const t = this.teachers.find(u => u.id === id);
  return t ? `${t.firstName} ${t.lastName}` : '—';
}

createCourse(): void {
  this.apiService.createCourse(this.selectedCourse).subscribe({
    next: (c) => {
      this.courses.push(c);
      this.courses = [...this.courses];
      this.selectedCourse = this.emptyCourse();
      this.snackBar.open('Course created!', 'Close', { duration: 4000 });
    },
    error: (err) => this.snackBar.open('Error: ' + err.message, 'Close', { duration: 6000 })
  });
}

updateCourse(): void {
  if (!this.selectedCourse.id) return;
  this.apiService.updateCourse(this.selectedCourse.id, this.selectedCourse).subscribe({
    next: (c) => {
      const idx = this.courses.findIndex(x => x.id === c.id);
      if (idx > -1) this.courses[idx] = c;
      this.courses = [...this.courses];
      this.selectedCourse = this.emptyCourse();
      this.snackBar.open('Course updated!', 'Close', { duration: 4000 });
    }
  });
}

editCourse(course: Course): void {
  this.selectedCourse = { ...course };
}

cancelCourseForm(): void {
  this.selectedCourse = this.emptyCourse();
}

loadAppliedYearsAndTeachers(): void {
  this.apiService.getAllAppliedYears().subscribe({
    next: (years) => this.appliedYears = years,
    error: () => this.snackBar.open('Failed to load study years', 'Close', { duration: 5000 })
  });
  this.apiService.getAllUsers().subscribe({
    next: (allUsers: User[]) => {
      this.teachers = allUsers.filter(user => user.role === 'TEACHER');
      console.log('Loaded teachers:', this.teachers.length);
    },
    error: (err) => {
      this.snackBar.open('Failed to load teachers', 'Close', { duration: 5000 });
      this.teachers = [];
    }
  });
  
}
}