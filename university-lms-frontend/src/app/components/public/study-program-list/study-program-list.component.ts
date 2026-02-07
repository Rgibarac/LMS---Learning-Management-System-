import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { StudyProgram } from '../../../core/models/study-program.model';
import { Course } from '../../../core/models/course.model';
import { User } from '../../../core/models/user.model';

export interface College {
  id?: number;
  name: string;
  universityName: string;
}

@Component({
  selector: 'app-study-program-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="header">
        <h1><mat-icon>account_balance</mat-icon> Study Programs</h1>
        <p>Explore all academic programs offered by the university</p>
      </div>

      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading programs...</p>
      </div>

      <div class="programs-grid" *ngIf="!isLoading">
        <mat-card 
          class="program-card" 
          *ngFor="let program of studyPrograms"
          (click)="openProgramDetails(program)"
        >
          <mat-card-header>
            <div mat-card-avatar class="program-avatar">
              <mat-icon>school</mat-icon>
            </div>
            <mat-card-title>{{ program.name }}</mat-card-title>
            <mat-card-subtitle>
              {{ getCollegeName(program.collegeId) || 'Unknown College' }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="description" *ngIf="program.description">
              {{ program.description.length > 150 ? (program.description | slice:0:150) + '...' : program.description }}
            </p>
            <p class="no-desc" *ngIf="!program.description">
              No description provided.
            </p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-mini-fab color="primary">
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>

        <div *ngIf="studyPrograms.length === 0" class="empty-state">
          <mat-icon>info</mat-icon>
          <h3>No study programs found</h3>
          <p>Please check back later.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 40px 20px; max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { font-size: 36px; color: #333; display: flex; align-items: center; justify-content: center; gap: 12px; }
    .header p { color: #666; font-size: 18px; margin-top: 8px; }
    .loading { text-align: center; padding: 80px; }
    .programs-grid { display: grid; gap: 28px; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); }
    .program-card { cursor: pointer; transition: all 0.3s; height: 100%; display: flex; flex-direction: column; }
    .program-card:hover { transform: translateY(-8px); box-shadow: 0 12px 30px rgba(0,0,0,0.15); }
    .program-avatar { background: #7b1fa2; color: white; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .description { color: #555; line-height: 1.6; margin: 16px 0; }
    .no-desc { color: #999; font-style: italic; margin: 16px 0; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 80px; color: #999; }
    .empty-state mat-icon { font-size: 72px; width: 72px; height: 72px; opacity: 0.5; margin-bottom: 16px; }
  `]
})
export class StudyProgramListComponent implements OnInit {
  studyPrograms: StudyProgram[] = [];
  colleges: College[] = [];
  teachers: User[] = [];
  isLoading = true;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;

    this.apiService.getStudyPrograms().subscribe({
      next: (programs) => {
        this.studyPrograms = programs;

        this.apiService.getAllColleges().subscribe({
          next: (colleges) => this.colleges = colleges,
          error: (err) => console.error('Failed to load colleges:', err)
        });

        this.apiService.getAllTeachers().subscribe({
          next: (teachers) => this.teachers = teachers,
          error: (err) => console.error('Failed to load teachers:', err)
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load programs:', err);
        this.isLoading = false;
      }
    });
  }

  getCollegeName(collegeId: number): string | null {
    return this.colleges.find(c => c.id === collegeId)?.name || null;
  }

  getTeacherName(teacherId: number): string | null {
    const teacher = this.teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : null;
  }

  openProgramDetails(program: StudyProgram): void {
    this.dialog.open(StudyProgramDetailsDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        program,
        colleges: this.colleges,
        teachers: this.teachers
      }
    });
  }
}

@Component({
  selector: 'app-study-program-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>school</mat-icon>
      {{ data.program.name }}
    </h2>

    <mat-dialog-content class="details-content">
      <mat-card class="info-card">
        <mat-card-header>
          <mat-card-title>Program Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p><strong>College:</strong> {{ getCollegeName(data.program.collegeId) || 'Unknown' }}</p>
          <p class="description" *ngIf="data.program.description">
            {{ data.program.description }}
          </p>
          <p class="no-desc" *ngIf="!data.program.description">
            No description available.
          </p>
        </mat-card-content>
      </mat-card>

      <h3 class="section-title">Courses in this Program</h3>

      <div *ngIf="courses.length === 0" class="empty-courses">
        <mat-icon>info</mat-icon>
        <p>No courses assigned to this program yet.</p>
      </div>

      <table mat-table [dataSource]="courses" *ngIf="courses.length > 0">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Course Name</th>
          <td mat-cell *matCellDef="let course">{{ course.name }}</td>
        </ng-container>
        <ng-container matColumnDef="code">
          <th mat-header-cell *matHeaderCellDef>Code</th>
          <td mat-cell *matCellDef="let course">{{ course.code }}</td>
        </ng-container>
        <ng-container matColumnDef="ects">
          <th mat-header-cell *matHeaderCellDef>ECTS</th>
          <td mat-cell *matCellDef="let course">{{ course.ectsPoints }}</td>
        </ng-container>
        <ng-container matColumnDef="year">
          <th mat-header-cell *matHeaderCellDef>Year</th>
          <td mat-cell *matCellDef="let course">{{ course.studyYear || '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="teacher">
          <th mat-header-cell *matHeaderCellDef>Teacher</th>
          <td mat-cell *matCellDef="let course">
            {{ getTeacherName(course.teacherId) || 'Not assigned' }}
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .details-content { max-height: 70vh; overflow-y: auto; padding: 8px; }
    .info-card { margin-bottom: 32px; }
    .section-title { color: #3f51b5; margin: 32px 0 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .empty-courses { text-align: center; padding: 40px; color: #888; }
    .empty-courses mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.5; }
    table { width: 100%; }
    th { background: #f5f5f5; }
  `]
})
export class StudyProgramDetailsDialogComponent implements OnInit {
  courses: Course[] = [];
  displayedColumns = ['name', 'code', 'ects', 'year', 'teacher'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      program: StudyProgram;
      colleges: College[];
      teachers: User[];
    },
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  private loadCourses(): void {
    this.apiService.getAllCourses().subscribe({
      next: (allCourses) => {
        this.courses = allCourses.filter(c => c.studyProgramId === this.data.program.id);
      },
      error: (err) => console.error('Failed to load courses for program:', err)
    });
  }

  getCollegeName(collegeId: number): string | null {
    return this.data.colleges.find(c => c.id === collegeId)?.name || null;
  }

  getTeacherName(teacherId: number | null): string | null {
    if (!teacherId) return null;
    const teacher = this.data.teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : null;
  }
}