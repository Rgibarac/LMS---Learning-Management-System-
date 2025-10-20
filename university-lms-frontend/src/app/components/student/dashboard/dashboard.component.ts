import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Course } from '../../../core/models/course.model';
import { StudyHistory } from '../../../core/models/study-history.model';
import { User } from '../../../core/models/user.model';
import { ExamApplication } from '../../../core/models/exam-application.model';
import { Syllabus } from '../../../core/models/syllabus.model';
import { StudyProgram } from '../../../core/models/study-program.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-student-dashboard',
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
    MatSelectModule
  ],
  template: `
    <h2>Student Dashboard</h2>
    @if (isLoading) {
      <mat-spinner></mat-spinner>
      <p>Loading user data...</p>
    } @else if (user && user.id !== undefined) {
      <h3>Welcome, {{ user.username }}</h3>

      
      <form #profileForm="ngForm" (ngSubmit)="updateProfile()">
        <mat-form-field>
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="user.email" name="email" required email>
          <mat-error *ngIf="profileForm.controls['email']?.errors?.['required']">Email is required</mat-error>
          <mat-error *ngIf="profileForm.controls['email']?.errors?.['email']">Invalid email format</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>First Name</mat-label>
          <input matInput [(ngModel)]="user.firstName" name="firstName" required>
          <mat-error *ngIf="profileForm.controls['firstName']?.errors?.['required']">First name is required</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Last Name</mat-label>
          <input matInput [(ngModel)]="user.lastName" name="lastName" required>
          <mat-error *ngIf="profileForm.controls['lastName']?.errors?.['required']">Last name is required</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Index Number</mat-label>
          <input matInput [(ngModel)]="user.indexNumber" name="indexNumber" required>
          <mat-error *ngIf="profileForm.controls['indexNumber']?.errors?.['required']">Index number is required</mat-error>
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid">Update Profile</button>
      </form>

      <h4>Study Program</h4>
      @if (studyProgram) {
        <p>{{ studyProgram.name }} (ID: {{ studyProgram.id }})</p>
      } @else {
        <p>No study program assigned</p>
      }

      <h4>Current Courses</h4>
      @if (currentCourses.length > 0) {
        <mat-table [dataSource]="currentCourses">
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
              <a *ngIf="syllabuses[course.id]" [href]="syllabuses[course.id].content" target="_blank">View Syllabus</a>
              <span *ngIf="!syllabuses[course.id]">Not available</span>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="courseColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: courseColumns"></mat-row>
        </mat-table>
      } @else {
        <p>No current courses</p>
      }

      <h4>Study History</h4>
      @if (studyHistory.length > 0) {
        <mat-table [dataSource]="studyHistory">
          <ng-container matColumnDef="courseName">
            <mat-header-cell *matHeaderCellDef>Course Name</mat-header-cell>
            <mat-cell *matCellDef="let record">{{ record.courseName }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="term">
            <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
            <mat-cell *matCellDef="let record">{{ record.term }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="examsTaken">
            <mat-header-cell *matHeaderCellDef>Exams Taken</mat-header-cell>
            <mat-cell *matCellDef="let record">{{ record.examsTaken }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="grade">
            <mat-header-cell *matHeaderCellDef>Grade</mat-header-cell>
            <mat-cell *matCellDef="let record">{{ record.grade != null ? record.grade : 'N/A' }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="ectsPoints">
            <mat-header-cell *matHeaderCellDef>ECTS Points</mat-header-cell>
            <mat-cell *matCellDef="let record">{{ record.ectsPoints }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="passed">
            <mat-header-cell *matHeaderCellDef>Passed</mat-header-cell>
            <mat-cell *matCellDef="let record">{{ record.passed ? 'Yes' : 'No' }}</mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="historyColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: historyColumns"></mat-row>
        </mat-table>
        <p>Total ECTS Points: {{ totalEctsPoints }}</p>
      } @else {
        <p>No study history available</p>
      }

      <h4>Apply for Exam</h4>
      <form #examForm="ngForm" (ngSubmit)="applyForExam()">
        <mat-form-field>
          <mat-label>Course</mat-label>
          <mat-select [(ngModel)]="selectedCourseId" name="courseId" required>
            <mat-option *ngFor="let course of currentCourses" [value]="course.id">{{ course.name }}</mat-option>
          </mat-select>
          <mat-error *ngIf="examForm.controls['courseId']?.errors?.['required']">Course is required</mat-error>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Term</mat-label>
          <input matInput [(ngModel)]="examTerm" name="term" required>
          <mat-error *ngIf="examForm.controls['term']?.errors?.['required']">Term is required</mat-error>
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" [disabled]="examForm.invalid">Apply</button>
      </form>
    } @else {
      <p>User not authenticated. Redirecting to login...</p>
    }
  `,
  styles: [`
    mat-table {
      margin-bottom: 20px;
    }
    h3, h4 {
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
      margin: 10px 0;
    }
    mat-spinner {
      margin: 20px auto;
    }
    a {
      color: #3f51b5;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
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

  constructor(private apiService: ApiService, private snackBar: MatSnackBar, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.user = this.apiService.getCurrentUser();
    if (this.user && this.user.id !== undefined) {
      console.log('User loaded:', this.user);
      Promise.all([
        this.loadStudentCourses(this.user.id),
        this.loadSyllabuses(),
        this.loadStudyHistory(this.user.id),
        this.loadStudyProgram(this.user.id)
      ]).finally(() => {
        this.isLoading = false;
      });
    } else {
      console.warn('No user found, redirecting to login');
      this.snackBar.open('Please log in to view your dashboard', 'Close', { duration: 3000 });
      setTimeout(() => this.router.navigate(['/login']), 1000);
    }
  }

  private loadStudentCourses(userId: number): Promise<void> {
    return new Promise((resolve) => {
      console.log(`Fetching courses for user ${userId}...`);
      this.apiService.getStudentCourses(userId).subscribe({
        next: (courses: Course[]) => {
          console.log('Current courses received:', courses);
          this.currentCourses = courses;
          if (courses.length === 0) {
            this.snackBar.open('No current courses found', 'Close', { duration: 3000 });
          }
          resolve();
        },
        error: (err: any) => {
          console.error('Failed to load courses:', err);
          this.snackBar.open('Failed to load courses: ' + (err.message || 'Unknown error'), 'Close', { duration: 3000 });
          resolve();
        }
      });
    });
  }

  private loadSyllabuses(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Fetching syllabuses for courses:', this.currentCourses.map(c => c.id));
      if (this.currentCourses.length === 0) {
        resolve();
        return;
      }
      const validCourses = this.currentCourses.filter((course): course is Course & { id: number } => course.id !== undefined);
      if (validCourses.length === 0) {
        resolve();
        return;
      }
      const syllabusRequests = validCourses.map(course =>
        this.apiService.getSyllabus(course.id).pipe(
          map(syllabus => ({ courseId: course.id, syllabus })),
          catchError(() => of({ courseId: course.id, syllabus: { courseId: course.id, content: 'Not available', academicYear: 'N/A' } }))
        )
      );
      forkJoin(syllabusRequests).subscribe({
        next: (results: { courseId: number; syllabus: Syllabus }[]) => {
          results.forEach(result => {
            this.syllabuses[result.courseId] = result.syllabus;
          });
          console.log('Syllabuses loaded:', this.syllabuses);
          resolve();
        },
        error: (err: any) => {
          console.error('Failed to load syllabuses:', err);
          this.snackBar.open('Failed to load syllabuses: ' + (err.message || 'Unknown error'), 'Close', { duration: 3000 });
          resolve();
        }
      });
    });
  }

  private loadStudyProgram(userId: number): Promise<void> {
    return new Promise((resolve) => {
      console.log(`Fetching study program for user ${userId}...`);
      this.apiService.getStudentStudyProgram(userId).subscribe({
        next: (program: StudyProgram | null) => {
          console.log('Study program received:', program);
          this.studyProgram = program;
          if (!program) {
            this.snackBar.open('No study program assigned', 'Close', { duration: 3000 });
          }
          resolve();
        },
        error: (err: any) => {
          console.error('Failed to load study program:', err);
          this.snackBar.open('Failed to load study program: ' + (err.message || 'Unknown error'), 'Close', { duration: 3000 });
          resolve();
        }
      });
    });
  }

  private loadStudyHistory(userId: number): Promise<void> {
    return new Promise((resolve) => {
      console.log(`Fetching study history for user ${userId}...`);
      this.apiService.getStudentHistory(userId).subscribe({
        next: (history: StudyHistory[]) => {
          console.log('Study history received:', history);
          this.studyHistory = history;
          this.totalEctsPoints = history.reduce((sum, record) => sum + (record.passed ? record.ectsPoints : 0), 0);
          if (history.length === 0) {
            this.snackBar.open('No study history found', 'Close', { duration: 3000 });
          }
          resolve();
        },
        error: (err: any) => {
          console.error('Failed to load study history:', err);
          this.snackBar.open('Failed to load study history: ' + (err.message || 'Unknown error'), 'Close', { duration: 3000 });
          resolve();
        }
      });
    });
  }

  updateProfile(): void {
    // if (this.user && this.user.id !== undefined) {
    //   console.log('Updating profile:', this.user);
    //   this.apiService.updateProfile(this.user).subscribe({
    //     next: (updatedUser: User) => {
    //       console.log('Profile updated:', updatedUser);
    //       this.user = updatedUser;
         
    //       this.loadStudentCourses(this.user.id).then(() => {
    //         this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
    //         this.router.navigate(['/student']);
    //       });
    //     },
    //     error: (error: any) => {
    //       console.error('Error updating profile:', error);
    //       this.snackBar.open('Update failed: ' + (error.message || 'Unknown error'), 'Close', { duration: 3000 });
    //     }
    //   });
    // } else {
    //   console.warn('Cannot update profile: User not found');
    //   this.snackBar.open('Cannot update profile: User not found', 'Close', { duration: 3000 });
    //   setTimeout(() => this.router.navigate(['/login']), 1000);
    // }
  }

  applyForExam(): void {
    if (this.user && this.user.id !== undefined && this.selectedCourseId !== null) {
      console.log(`Applying for exam: user ${this.user.id}, course ${this.selectedCourseId}, term ${this.examTerm}`);
      const userId = this.user.id;
      this.apiService.createExamApplication(userId, this.selectedCourseId, this.examTerm).subscribe({
        next: (examApplication: ExamApplication) => {
          console.log('Exam application created:', examApplication);
          this.snackBar.open('Successfully applied for exam!', 'Close', { duration: 3000 });
          this.selectedCourseId = null;
          this.examTerm = '';
          this.loadStudyHistory(userId);
        },
        error: (err: any) => {
          console.error('Failed to apply for exam:', err);
          this.snackBar.open('Failed to apply for exam: ' + (err.message || 'Unknown error'), 'Close', { duration: 3000 });
        }
      });
    } else {
      console.warn('Cannot apply for exam: Invalid user or course');
      this.snackBar.open('Cannot apply for exam: Please select a course and term', 'Close', { duration: 3000 });
    }
  }
}