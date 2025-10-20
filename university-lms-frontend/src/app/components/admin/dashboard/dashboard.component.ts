import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PdfService } from '../../../core/services/pdf.service';
import { User } from '../../../core/models/user.model';
import { StudyProgram } from '../../../core/models/study-program.model';
import { Course } from '../../../core/models/course.model';
import { Syllabus } from '../../../core/models/syllabus.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  template: `
    <h2>Admin Dashboard</h2>
    
    <!-- Debug Output -->
    <div class="debug">
      <h3>Debug Info</h3>
      <p>Logged in: {{ isLoggedIn ? 'Yes' : 'No' }}</p>
      <p>Users: {{ users.length }} items</p>
      <p>Study Programs: {{ studyPrograms.length }} items</p>
      <p>Courses: {{ courses.length }} items</p>
      <p>Syllabuses: {{ syllabuses.length }} items</p>
    </div>

    <!-- Users -->
    <h3>Manage Users</h3>
    <div *ngIf="!isLoggedIn" class="login-warning">
      <p>Please log in with admin credentials to view and manage users.</p>
    </div>
    <button mat-raised-button color="primary" (click)="openCreateUserForm()" *ngIf="isLoggedIn">Create User</button>
    <button mat-raised-button color="accent" (click)="exportUsersPdf()" *ngIf="isLoggedIn">Export Users PDF</button>
    <mat-spinner *ngIf="loading.users"></mat-spinner>
    <form *ngIf="showCreateUserForm && isLoggedIn" (ngSubmit)="createUser()">
      <mat-form-field>
        <mat-label>Username</mat-label>
        <input matInput [(ngModel)]="newUser.username" name="username" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input matInput [(ngModel)]="newUser.email" name="email" type="email" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>First Name</mat-label>
        <input matInput [(ngModel)]="newUser.firstName" name="firstName" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Last Name</mat-label>
        <input matInput [(ngModel)]="newUser.lastName" name="lastName" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Index Number</mat-label>
        <input matInput [(ngModel)]="newUser.indexNumber" name="indexNumber" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Password</mat-label>
        <input matInput [(ngModel)]="newUser.password" name="password" type="password" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Role</mat-label>
        <mat-select [(ngModel)]="newUser.role" name="role" required>
          <mat-option value="ADMIN">Admin</mat-option>
          <mat-option value="TEACHER">Teacher</mat-option>
          <mat-option value="STUDENT">Student</mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Save</button>
      <button mat-raised-button color="warn" (click)="cancelCreateUser()">Cancel</button>
    </form>
    <form *ngIf="editingUser && isLoggedIn" (ngSubmit)="updateUser()">
      <mat-form-field>
        <mat-label>Username</mat-label>
        <input matInput [(ngModel)]="editingUser.username" name="username" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Email</mat-label>
        <input matInput [(ngModel)]="editingUser.email" name="email" type="email" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>First Name</mat-label>
        <input matInput [(ngModel)]="editingUser.firstName" name="firstName" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Last Name</mat-label>
        <input matInput [(ngModel)]="editingUser.lastName" name="lastName" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Index Number</mat-label>
        <input matInput [(ngModel)]="editingUser.indexNumber" name="indexNumber" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Role</mat-label>
        <mat-select [(ngModel)]="editingUser.role" name="role" required>
          <mat-option value="ADMIN">Admin</mat-option>
          <mat-option value="TEACHER">Teacher</mat-option>
          <mat-option value="STUDENT">Student</mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Update</button>
      <button mat-raised-button color="warn" (click)="cancelEditUser()">Cancel</button>
    </form>
    <mat-table [dataSource]="users" *ngIf="isLoggedIn && !loading.users">
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
        <mat-header-cell *matHeaderCellDef>Index Number</mat-header-cell>
        <mat-cell *matCellDef="let user">{{ user.indexNumber }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="role">
        <mat-header-cell *matHeaderCellDef>Role</mat-header-cell>
        <mat-cell *matCellDef="let user">{{ user.role }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="actions">
        <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
        <mat-cell *matCellDef="let user">
          <button mat-raised-button color="primary" (click)="editUser(user)">Edit</button>
          <button mat-raised-button color="warn" (click)="deleteUser(user.id)">Delete</button>
        </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="userColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: userColumns"></mat-row>
    </mat-table>
    <p *ngIf="isLoggedIn && !loading.users && users.length === 0">No users available.</p>

    <!-- Study Programs -->
    <h3>Manage Study Programs</h3>
    <mat-spinner *ngIf="loading.studyPrograms"></mat-spinner>
    <form (ngSubmit)="createStudyProgram()">
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="newStudyProgram.name" name="name" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Description</mat-label>
        <textarea matInput [(ngModel)]="newStudyProgram.description" name="description"></textarea>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Create</button>
    </form>
    <mat-table [dataSource]="studyPrograms" *ngIf="!loading.studyPrograms">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
        <mat-cell *matCellDef="let program">{{ program.name }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="description">
        <mat-header-cell *matHeaderCellDef>Description</mat-header-cell>
        <mat-cell *matCellDef="let program">{{ program.description }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="actions">
        <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
        <mat-cell *matCellDef="let program">
          <button mat-raised-button color="warn" (click)="deleteStudyProgram(program.id)">Delete</button>
        </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="studyProgramColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: studyProgramColumns"></mat-row>
    </mat-table>
    <p *ngIf="!loading.studyPrograms && studyPrograms.length === 0">No study programs available.</p>

    <!-- Courses -->
    <h3>Manage Courses</h3>
    <mat-spinner *ngIf="loading.courses"></mat-spinner>
    <form (ngSubmit)="createCourse()">
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput [(ngModel)]="newCourse.name" name="name" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Description</mat-label>
        <textarea matInput [(ngModel)]="newCourse.description" name="description"></textarea>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Code</mat-label>
        <input matInput [(ngModel)]="newCourse.code" name="code" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>ECTS Points</mat-label>
        <input matInput type="number" [(ngModel)]="newCourse.ectsPoints" name="ectsPoints" required>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Study Program</mat-label>
        <mat-select [(ngModel)]="newCourse.studyProgramId" name="studyProgramId" required>
          <mat-option *ngFor="let program of studyPrograms" [value]="program.id">{{ program.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Create</button>
    </form>
    <mat-table [dataSource]="courses" *ngIf="!loading.courses">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
        <mat-cell *matCellDef="let course">{{ course.name }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="code">
        <mat-header-cell *matHeaderCellDef>Code</mat-header-cell>
        <mat-cell *matCellDef="let course">{{ course.code }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="studyProgram">
        <mat-header-cell *matHeaderCellDef>Study Program</mat-header-cell>
        <mat-cell *matCellDef="let course">{{ getStudyProgramName(course.studyProgramId) }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="actions">
        <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
        <mat-cell *matCellDef="let course">
          <button mat-raised-button color="warn" (click)="deleteCourse(course.id)">Delete</button>
        </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="courseColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: courseColumns"></mat-row>
    </mat-table>
    <p *ngIf="!loading.courses && courses.length === 0">No courses available.</p>

    <!-- Syllabuses -->
    <h3>Manage Syllabuses</h3>
    <mat-spinner *ngIf="loading.syllabuses"></mat-spinner>
    <form (ngSubmit)="createSyllabus()">
      <mat-form-field>
        <mat-label>Course</mat-label>
        <mat-select [(ngModel)]="newSyllabus.courseId" name="courseId" required>
          <mat-option *ngFor="let course of courses" [value]="course.id">{{ course.name }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Content</mat-label>
        <textarea matInput [(ngModel)]="newSyllabus.content" name="content" required></textarea>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Academic Year</mat-label>
        <input matInput [(ngModel)]="newSyllabus.academicYear" name="academicYear" required>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit">Create</button>
    </form>
    <mat-table [dataSource]="syllabuses" *ngIf="!loading.syllabuses">
      <ng-container matColumnDef="course">
        <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
        <mat-cell *matCellDef="let syllabus">{{ getCourseName(syllabus.courseId) }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="academicYear">
        <mat-header-cell *matHeaderCellDef>Academic Year</mat-header-cell>
        <mat-cell *matCellDef="let syllabus">{{ syllabus.academicYear }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="content">
        <mat-header-cell *matHeaderCellDef>Content</mat-header-cell>
        <mat-cell *matCellDef="let syllabus">{{ syllabus.content | slice:0:50 }}...</mat-cell>
      </ng-container>
      <ng-container matColumnDef="actions">
        <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
        <mat-cell *matCellDef="let syllabus">
          <button mat-raised-button color="warn" (click)="deleteSyllabus(syllabus.id)">Delete</button>
        </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderCellDef="syllabusColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: syllabusColumns"></mat-row>
    </mat-table>
    <p *ngIf="!loading.syllabuses && syllabuses.length === 0">No syllabuses available.</p>
  `,
  styles: [`
    mat-table { width: 100%; margin-bottom: 20px; }
    h3 { margin-top: 20px; }
    form { display: flex; gap: 10px; margin-bottom: 20px; }
    mat-form-field { flex: 1; }
    button { margin: 5px; }
    .login-warning { color: red; margin-bottom: 20px; }
    .debug { border: 1px solid #ccc; padding: 10px; margin-bottom: 20px; }
    mat-spinner { margin: 20px auto; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  studyPrograms: StudyProgram[] = [];
  courses: Course[] = [];
  syllabuses: Syllabus[] = [];
  newStudyProgram: StudyProgram = { name: '', description: '' };
  newCourse: Course = { name: '', description: '', code: '', ectsPoints: 6, studyProgramId: 0 };
  newSyllabus: Syllabus = { courseId: 0, content: '', academicYear: '' };
  newUser: User = { username: '', email: '', role: '', firstName: '', lastName: '', indexNumber: '', password: '' };
  editingUser: User | null = null;
  showCreateUserForm: boolean = false;
  userColumns: string[] = ['username', 'email', 'firstName', 'lastName', 'indexNumber', 'role', 'actions'];
  studyProgramColumns: string[] = ['name', 'description', 'actions'];
  courseColumns: string[] = ['name', 'code', 'studyProgram', 'actions'];
  syllabusColumns: string[] = ['course', 'academicYear', 'content', 'actions'];
  isLoggedIn: boolean = false;
  loading = {
    users: false,
    studyPrograms: false,
    courses: false,
    syllabuses: false
  };

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    console.log('AdminDashboardComponent initialized');
    this.checkLoginStatus();
    this.loadData();
  }

  private checkLoginStatus(): void {
    const credentials = localStorage.getItem('credentials');
    this.isLoggedIn = !!credentials;
    console.log('Login status:', this.isLoggedIn ? 'Logged in' : 'Not logged in');
    console.log('Credentials:', credentials);
    this.cdr.detectChanges();
  }

  private loadData(): void {
    console.log('Starting loadData');
    this.loading.users = this.isLoggedIn;
    this.loading.studyPrograms = true;
    this.loading.courses = true;
    this.loading.syllabuses = true;
    this.cdr.detectChanges();

    if (this.isLoggedIn) {
      this.loadUsers();
    }
    this.loadStudyPrograms();
    this.loadCourses();
    this.loadSyllabuses();
  }

  private loadUsers(): void {
    this.loading.users = true;
    this.apiService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        console.log('Loaded users:', data);
        this.loading.users = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load users:', err);
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
      next: (data: StudyProgram[]) => {
        this.studyPrograms = data;
        console.log('Loaded study programs:', data);
        this.loading.studyPrograms = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load study programs:', err);
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
      next: (data: Course[]) => {
        this.courses = data;
        console.log('Loaded courses:', data);
        this.loading.courses = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load courses:', err);
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
      next: (data: Syllabus[]) => {
        this.syllabuses = data;
        console.log('Loaded syllabuses:', data);
        this.loading.syllabuses = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load syllabuses:', err);
        this.snackBar.open('Failed to load syllabuses: ' + err.message, 'Close', { duration: 5000 });
        this.syllabuses = [];
        this.loading.syllabuses = false;
        this.cdr.detectChanges();
      }
    });
  }


  openCreateUserForm(): void {
    this.showCreateUserForm = true;
    this.editingUser = null;
    this.newUser = { username: '', email: '', role: '', firstName: '', lastName: '', indexNumber: '', password: '' };
    this.cdr.detectChanges();
  }

  cancelCreateUser(): void {
    this.showCreateUserForm = false;
    this.newUser = { username: '', email: '', role: '', firstName: '', lastName: '', indexNumber: '', password: '' };
    this.cdr.detectChanges();
  }

  editUser(user: User): void {
    this.editingUser = { ...user, password: '' };
    this.showCreateUserForm = false;
    this.cdr.detectChanges();
  }

  updateUser(): void {
    if (!this.editingUser || !this.editingUser.id || !this.editingUser.username || !this.editingUser.email || !this.editingUser.firstName || !this.editingUser.lastName || !this.editingUser.indexNumber || !this.editingUser.role) {
      this.snackBar.open('All user fields are required', 'Close', { duration: 5000 });
      return;
    }
    this.apiService.updateUser(this.editingUser.id, this.editingUser).subscribe({
      next: (user) => {
        console.log('Updated user:', user);
        if (!user.id) {
          console.error('Backend returned user with id: 0 or undefined');
        }
        this.snackBar.open('User updated successfully', 'Close', { duration: 5000 });
        this.editingUser = null;
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update user:', err);
        this.snackBar.open('Failed to update user: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  cancelEditUser(): void {
    this.editingUser = null;
    this.cdr.detectChanges();
  }

  deleteUser(id: number): void {
    if (!id) {
      this.snackBar.open('User ID is missing', 'Close', { duration: 5000 });
      return;
    }
    console.log('Attempting to delete user with id:', id);
    if (confirm('Are you sure you want to delete this user?')) {
      this.apiService.deleteUser(id).subscribe({
        next: () => {
          console.log('Deleted user with id:', id);
          this.snackBar.open('User deleted successfully', 'Close', { duration: 5000 });
          this.loadUsers();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to delete user:', err);
          this.snackBar.open('Failed to delete user: ' + err.message, 'Close', { duration: 5000 });
        }
      });
    }
  }

  exportUsersPdf(): void {
    this.pdfService.downloadUsers();
    this.snackBar.open('Users PDF export started', 'Close', { duration: 5000 });
  }



  getStudyProgramName(studyProgramId: number): string {
    const program = this.studyPrograms.find(p => p.id === studyProgramId);
    return program ? program.name : 'Unknown';
  }

  getCourseName(courseId: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown';
  }



  createUser(): void {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.firstName || !this.newUser.lastName || !this.newUser.indexNumber || !this.newUser.password || !this.newUser.role) {
      this.snackBar.open('All user fields are required', 'Close', { duration: 5000 });
      return;
    }
    this.apiService.createUser(this.newUser).subscribe({
      next: (user) => {
        console.log('Created user:', user);
        if (!user.id) {
          console.error('Backend returned user with id: 0 or undefined');
        }
        this.snackBar.open('User created successfully', 'Close', { duration: 5000 });
        this.newUser = { username: '', email: '', role: '', firstName: '', lastName: '', indexNumber: '', password: '' };
        this.showCreateUserForm = false;
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to create user:', err);
        this.snackBar.open('Failed to create user: ' + err.message, 'Close', { duration: 5000 });
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

  createCourse(): void {
    if (!this.newCourse.name || !this.newCourse.code || !this.newCourse.studyProgramId) {
      this.snackBar.open('Course name, code, and study program are required', 'Close', { duration: 5000 });
      return;
    }
    this.apiService.createCourse(this.newCourse).subscribe({
      next: (course) => {
        console.log('Created course:', course);
        if (!course.id) {
          console.error('Backend returned course with id: 0 or undefined');
          this.snackBar.open('Warning: Course created but ID is missing', 'Close', { duration: 5000 });
        }
        this.snackBar.open('Course created successfully', 'Close', { duration: 5000 });
        this.newCourse = { name: '', description: '', code: '', ectsPoints: 0, studyProgramId: 0 };
        this.loadCourses();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to create course:', err);
        this.snackBar.open('Failed to create course: ' + err.message, 'Close', { duration: 5000 });
      }
    });
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
}