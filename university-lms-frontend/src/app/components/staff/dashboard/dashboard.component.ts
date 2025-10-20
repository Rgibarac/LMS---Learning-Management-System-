import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';
import { Course } from '../../../core/models/course.model';
import { StudyProgram } from '../../../core/models/study-program.model';
import { Syllabus } from '../../../core/models/syllabus.model';
import { Notification } from '../../../core/models/notification.model';
import { Schedule } from '../../../core/models/schedule.model';
import { CustomContent } from '../../../core/models/custom-content.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    FormsModule
  ],
  template: `
    @if (user) {
      <h2>Staff Dashboard</h2>

     
      <div>
        <h3>Enroll Student in Course</h3>
        <form (ngSubmit)="enrollInCourse()">
          <mat-form-field>
            <mat-label>Student</mat-label>
            <mat-select [(ngModel)]="enrollment.course.studentId" name="studentId" required>
              <mat-option *ngFor="let student of students" [value]="student.id">
                {{ student.firstName }} {{ student.lastName }} ({{ student.indexNumber }})
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Course</mat-label>
            <mat-select [(ngModel)]="enrollment.course.courseId" name="courseId" required>
              <mat-option *ngFor="let course of courses" [value]="course.id">
                {{ course.name }} ({{ course.code }})
              </mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">Enroll</button>
        </form>
      </div>

 
      <div>
        <h3>Enroll Student in Study Program</h3>
        <form (ngSubmit)="enrollInStudyProgram()">
          <mat-form-field>
            <mat-label>Student</mat-label>
            <mat-select [(ngModel)]="enrollment.studyProgram.studentId" name="studentId" required>
              <mat-option *ngFor="let student of students" [value]="student.id">
                {{ student.firstName }} {{ student.lastName }} ({{ student.indexNumber }})
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Study Program</mat-label>
            <mat-select [(ngModel)]="enrollment.studyProgram.studyProgramId" name="studyProgramId" required>
              <mat-option *ngFor="let program of studyPrograms" [value]="program.id">
                {{ program.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">Enroll</button>
        </form>
      </div>


      <div>
        <h3>Create Notification</h3>
        <form (ngSubmit)="createNotification()">
          <mat-form-field>
            <mat-label>Title</mat-label>
            <input matInput [(ngModel)]="newNotification.title" name="title" required>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Message</mat-label>
            <textarea matInput [(ngModel)]="newNotification.message" name="message" required></textarea>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Recipient Role</mat-label>
            <mat-select [(ngModel)]="newNotification.recipientRole" name="recipientRole" required>
              <mat-option value="ALL">All</mat-option>
              <mat-option value="STUDENT">Student</mat-option>
              <mat-option value="STAFF">Staff</mat-option>
              <mat-option value="TEACHER">Teacher</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">Create</button>
        </form>
      </div>

 
      <div>
        <h3>Syllabus Schedules</h3>
        <form (ngSubmit)="createSchedule()">
          <mat-form-field>
            <mat-label>Syllabus</mat-label>
            <mat-select [(ngModel)]="newSchedule.syllabusId" name="syllabusId" required>
              <mat-option *ngFor="let syllabus of syllabuses" [value]="syllabus.id">
                {{ getCourseName(syllabus.courseId) }} ({{ syllabus.academicYear }})
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Schedule Details</mat-label>
            <input matInput [(ngModel)]="newSchedule.scheduleDetails" name="scheduleDetails" required>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">Create</button>
        </form>
        <mat-table [dataSource]="schedules" *ngIf="schedules.length > 0">
          <ng-container matColumnDef="course">
            <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
            <mat-cell *matCellDef="let schedule">{{ schedule.courseName }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="academicYear">
            <mat-header-cell *matHeaderCellDef>Academic Year</mat-header-cell>
            <mat-cell *matCellDef="let schedule">{{ schedule.academicYear }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="scheduleDetails">
            <mat-header-cell *matHeaderCellDef>Schedule Details</mat-header-cell>
            <mat-cell *matCellDef="let schedule">{{ schedule.scheduleDetails }}</mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="scheduleColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: scheduleColumns"></mat-row>
        </mat-table>
        <p *ngIf="schedules.length === 0">No schedules available.</p>
      </div>


      <div>
        <h3>Custom Content</h3>
        <form (ngSubmit)="createCustomContent()">
          <mat-form-field>
            <mat-label>Title</mat-label>
            <input matInput [(ngModel)]="newCustomContent.title" name="title" required>
          </mat-form-field>
          <mat-form-field>
            <mat-label>Content</mat-label>
            <textarea matInput [(ngModel)]="newCustomContent.content" name="content" required></textarea>
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">Create</button>
        </form>
        <mat-table [dataSource]="customContent" *ngIf="customContent.length > 0">
          <ng-container matColumnDef="title">
            <mat-header-cell *matHeaderCellDef>Title</mat-header-cell>
            <mat-cell *matCellDef="let content">{{ content.title }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="content">
            <mat-header-cell *matHeaderCellDef>Content</mat-header-cell>
            <mat-cell *matCellDef="let content">{{ content.content | slice:0:50 }}...</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
            <mat-cell *matCellDef="let content">
              <button mat-raised-button color="warn" (click)="deleteCustomContent(content.id)">Delete</button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="customContentColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: customContentColumns"></mat-row>
        </mat-table>
        <p *ngIf="customContent.length === 0">No custom content available.</p>
      </div>


      <div>
        <h3>Students</h3>
        <mat-form-field>
          <mat-label>Search Query</mat-label>
          <input matInput [(ngModel)]="searchParams.query" name="query" (ngModelChange)="search()" placeholder="Search by name or index number">
        </mat-form-field>
        @if (students.length > 0) {
          <mat-table [dataSource]="students">
            <ng-container matColumnDef="name">
              <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
              <mat-cell *matCellDef="let student">{{ student.firstName }} {{ student.lastName }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="indexNumber">
              <mat-header-cell *matHeaderCellDef>Index Number</mat-header-cell>
              <mat-cell *matCellDef="let student">{{ student.indexNumber || 'N/A' }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="courses">
              <mat-header-cell *matHeaderCellDef>Enrolled Courses</mat-header-cell>
              <mat-cell *matCellDef="let student">{{ getEnrolledCourses(student) }}</mat-cell>
            </ng-container>
            <ng-container matColumnDef="studyProgram">
              <mat-header-cell *matHeaderCellDef>Study Program</mat-header-cell>
              <mat-cell *matCellDef="let student">{{ student.studyProgram?.name || 'None' }}</mat-cell>
            </ng-container>
            <mat-header-row *matHeaderRowDef="studentColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: studentColumns"></mat-row>
          </mat-table>
        } @else {
          <p>No students found</p>
        }
      </div>
    }
  `,
  styles: [`
    h2, h3 { margin-top: 20px; }
    form { display: flex; gap: 10px; margin-bottom: 20px; }
    mat-form-field { flex: 1; }
    button { margin: 5px; }
    mat-table { width: 100%; margin-bottom: 20px; }
    ul { list-style-type: none; padding: 0; }
    li { padding: 5px 0; }
  `]
})
export class StaffDashboardComponent implements OnInit {
  user: User | null = null;
  courses: Course[] = [];
  students: User[] = [];
  studyPrograms: StudyProgram[] = [];
  syllabuses: Syllabus[] = [];
  schedules: Schedule[] = [];
  customContent: CustomContent[] = [];
  searchParams = { query: '' };
  enrollment = {
    course: { studentId: 0, courseId: 0 },
    studyProgram: { studentId: 0, studyProgramId: 0 }
  };
  newNotification: Notification = { title: '', message: '', recipientRole: 'ALL' };
  newSchedule: Schedule = { syllabusId: 0, scheduleDetails: '' };
  newCustomContent: CustomContent = { title: '', content: '' };
  scheduleColumns: string[] = ['course', 'academicYear', 'scheduleDetails'];
  customContentColumns: string[] = ['title', 'content', 'actions'];
  studentColumns: string[] = ['name', 'indexNumber', 'courses', 'studyProgram'];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.user = this.apiService.getCurrentUser();
    this.loadData();
  }

  private loadData(): void {

    this.apiService.getStudentsByRole('STUDENT').subscribe({
      next: (students: User[]) => {
        this.students = students.filter(student => student.role === 'STUDENT');
        console.log('Filtered students loaded:', this.students);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading students:', error);
        this.snackBar.open('Failed to load students', 'Close', { duration: 3000 });
      }
    });


    this.apiService.getCourses().subscribe({
      next: (courses: Course[]) => {
        this.courses = courses;
        console.log('Courses loaded:', courses);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
        this.snackBar.open('Failed to load courses', 'Close', { duration: 3000 });
      }
    });

  
    this.apiService.getStudyPrograms().subscribe({
      next: (programs: StudyProgram[]) => {
        this.studyPrograms = programs;
        console.log('Study programs loaded:', programs);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading study programs:', error);
        this.snackBar.open('Failed to load study programs', 'Close', { duration: 3000 });
      }
    });


    this.apiService.getSyllabuses().subscribe({
      next: (syllabuses: Syllabus[]) => {
        this.syllabuses = syllabuses;
        console.log('Syllabuses loaded:', syllabuses);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading syllabuses:', error);
        this.snackBar.open('Failed to load syllabuses', 'Close', { duration: 3000 });
      }
    });


    this.apiService.getSchedules().subscribe({
      next: (schedules: Schedule[]) => {
        this.schedules = schedules;
        console.log('Schedules loaded:', schedules);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading schedules:', error);
        this.snackBar.open('Failed to load schedules', 'Close', { duration: 3000 });
      }
    });


    this.apiService.getCustomContent().subscribe({
      next: (content: CustomContent[]) => {
        this.customContent = content;
        console.log('Custom content loaded:', content);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading custom content:', error);
        this.snackBar.open('Failed to load custom content', 'Close', { duration: 3000 });
      }
    });
  }

  enrollInCourse(): void {
    if (this.enrollment.course.studentId && this.enrollment.course.courseId) {
      this.apiService.enrollStudentInCourse(this.enrollment.course.studentId, this.enrollment.course.courseId).subscribe({
        next: () => {
          this.snackBar.open('Student enrolled in course', 'Close', { duration: 3000 });
          this.enrollment.course = { studentId: 0, courseId: 0 };
          this.loadData(); 
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error enrolling student in course:', error);
          this.snackBar.open('Failed to enroll student in course', 'Close', { duration: 3000 });
        }
      });
    }
  }

  enrollInStudyProgram(): void {
    if (this.enrollment.studyProgram.studentId && this.enrollment.studyProgram.studyProgramId) {
      this.apiService.enrollStudentInStudyProgram(this.enrollment.studyProgram.studentId, this.enrollment.studyProgram.studyProgramId).subscribe({
        next: () => {
          this.snackBar.open('Student enrolled in study program', 'Close', { duration: 3000 });
          this.enrollment.studyProgram = { studentId: 0, studyProgramId: 0 };
          this.loadData(); 
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error enrolling student in study program:', error);
          this.snackBar.open('Failed to enroll student in study program', 'Close', { duration: 3000 });
        }
      });
    }
  }

  createNotification(): void {
    if (this.newNotification.title && this.newNotification.message && this.newNotification.recipientRole) {
      this.apiService.createNotification(this.newNotification).subscribe({
        next: () => {
          this.snackBar.open('Notification created', 'Close', { duration: 3000 });
          this.newNotification = { title: '', message: '', recipientRole: 'ALL' };
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error creating notification:', error);
          this.snackBar.open('Failed to create notification', 'Close', { duration: 3000 });
        }
      });
    }
  }

  createSchedule(): void {
    if (this.newSchedule.syllabusId && this.newSchedule.scheduleDetails) {
      this.apiService.createSchedule(this.newSchedule).subscribe({
        next: (schedule: Schedule) => {
          this.schedules.push(schedule);
          this.snackBar.open('Schedule created', 'Close', { duration: 3000 });
          this.newSchedule = { syllabusId: 0, scheduleDetails: '' };
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error creating schedule:', error);
          this.snackBar.open('Failed to create schedule', 'Close', { duration: 3000 });
        }
      });
    }
  }

  createCustomContent(): void {
    if (this.newCustomContent.title && this.newCustomContent.content) {
      this.apiService.createCustomContent(this.newCustomContent).subscribe({
        next: (content: CustomContent) => {
          this.customContent.push(content);
          this.snackBar.open('Custom content created', 'Close', { duration: 3000 });
          this.newCustomContent = { title: '', content: '' };
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error creating custom content:', error);
          this.snackBar.open('Failed to create custom content', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteCustomContent(id: number): void {
    this.apiService.deleteCustomContent(id).subscribe({
      next: () => {
        this.customContent = this.customContent.filter(content => content.id !== id);
        this.snackBar.open('Custom content deleted', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error deleting custom content:', error);
        this.snackBar.open('Failed to delete custom content', 'Close', { duration: 3000 });
      }
    });
  }

  getCourseName(courseId: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown';
  }

  getEnrolledCourses(student: User): string {
    return student.enrolledCourses?.length
      ? student.enrolledCourses.map(c => c.name).join(', ')
      : 'None';
  }

  search(): void {
    const query = this.searchParams.query.trim();
    this.apiService.getStudentsByQuery(query).subscribe({
      next: (students: User[]) => {
        this.students = students;
        console.log('Search results:', this.students);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error searching students:', error);
        this.snackBar.open('Failed to search students', 'Close', { duration: 3000 });
      }
    });
  }
}