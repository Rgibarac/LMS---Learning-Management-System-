import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';

export interface College {
  id?: number;
  name: string;
  universityName: string;
  address: string;
  deanId: number;
}

export interface StudyProgram {
  id?: number;
  name: string;
  description?: string;
  collegeId: number;
}

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-faculty-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 class="page-title">University Colleges</h2>

    <div class="colleges-grid" *ngIf="colleges.length > 0; else noColleges">
      <mat-card
        class="college-card"
        *ngFor="let college of colleges"
        (click)="openCollegeDetails(college)"
      >
        <mat-card-header>
          <div mat-card-avatar class="college-avatar">
            <mat-icon>apartment</mat-icon>
          </div>
          <mat-card-title>{{ college.name }}</mat-card-title>
          <mat-card-subtitle>{{ college.universityName }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Address:</strong> {{ college.address || '—' }}</p>
          <p><strong>Dean:</strong> {{ getDeanName(college.deanId) || 'Not assigned' }}</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="primary">
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>

    <ng-template #noColleges>
      <div class="empty-state">
        <mat-icon>info</mat-icon>
        <p>No colleges available at this time.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-title { text-align: center; margin: 32px 0; color: #3f51b5; font-size: 2rem; }
    .colleges-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; padding: 20px; }
    .college-card { cursor: pointer; transition: all 0.3s ease; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
    .college-card:hover { transform: translateY(-8px); box-shadow: 0 12px 20px rgba(0,0,0,0.15); }
    .college-avatar { background-color: #d81b60; color: white; display: flex; align-items: center; justify-content: center; }
    .empty-state { text-align: center; padding: 80px 20px; color: #666; font-size: 1.2rem; }
    .empty-state mat-icon { font-size: 72px; width: 72px; height: 72px; opacity: 0.5; margin-bottom: 16px; }
  `]
})
export class FacultyListComponent implements OnInit {
  colleges: College[] = [];
  teachers: User[] = []; 

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadColleges();
    this.loadTeachers();
  }

  private loadColleges(): void {
    this.apiService.getAllColleges().subscribe({
      next: (data) => this.colleges = data,
      error: (err) => console.error('Failed to load colleges:', err)
    });
  }

  private loadTeachers(): void {
    this.apiService.getAllTeachers().subscribe({
      next: (teachers) => this.teachers = teachers,
      error: (err) => console.error('Failed to load teachers:', err)
    });
  }

  getDeanName(deanId: number): string | null {
    const dean = this.teachers.find(t => t.id === deanId);
    return dean ? `${dean.firstName} ${dean.lastName}` : null;
  }

  openCollegeDetails(college: College): void {
    this.dialog.open(CollegeDetailsDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { college, teachers: this.teachers } 
    });
  }
}

@Component({
  selector: 'app-college-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>apartment</mat-icon>
      {{ data.college.name }}
    </h2>

    <mat-dialog-content class="details-content">
      <mat-card class="info-card">
        <mat-card-header>
          <mat-card-title>College Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p><strong>University:</strong> {{ data.college.universityName }}</p>
          <p><strong>Address:</strong> {{ data.college.address || 'Not specified' }}</p>
        </mat-card-content>
      </mat-card>

      <mat-card class="info-card">
        <mat-card-header>
          <mat-card-title>Dean</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <ng-container *ngIf="dean; else noDean">
            <p><strong>Name:</strong> {{ dean.firstName }} {{ dean.lastName }}</p>
            <p><strong>Username:</strong> {{ dean.username }}</p>
            <p><strong>Email:</strong> {{ dean.email }}</p>
            <p><strong>Role:</strong> {{ dean.role }}</p>
          </ng-container>

          <ng-template #noDean>
            <p style="color: #999; font-style: italic;">No dean assigned or not found</p>
          </ng-template>
        </mat-card-content>
      </mat-card>

      <h3 class="section-title">Study Programs</h3>

      <div class="loading-programs" *ngIf="loadingPrograms">
        <mat-spinner diameter="40"></mat-spinner>
        <span>Loading programs...</span>
      </div>

      <table mat-table [dataSource]="studyPrograms" *ngIf="!loadingPrograms && studyPrograms.length > 0">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let program">{{ program.name }}</td>
        </ng-container>
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Description</th>
          <td mat-cell *matCellDef="let program">{{ program.description || '—' }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="['name', 'description']"></tr>
        <tr mat-row *matRowDef="let row; columns: ['name', 'description']"></tr>
      </table>

      <p class="empty-programs" *ngIf="!loadingPrograms && studyPrograms.length === 0">
        No study programs assigned to this college yet.
      </p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .details-content { max-height: 70vh; overflow-y: auto; padding: 8px; }
    .info-card { margin-bottom: 24px; }
    .section-title { color: #3f51b5; margin: 32px 0 16px 0; border-bottom: 1px solid #eee; padding-bottom: 8px; }
    .loading-programs { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 32px; color: #666; }
    .empty-programs { text-align: center; color: #888; font-style: italic; margin: 32px 0; }
  `]
})
export class CollegeDetailsDialogComponent implements OnInit {
  dean: User | null = null;
  studyPrograms: StudyProgram[] = [];
  loadingPrograms = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { 
      college: College;
      teachers: User[]; 
    },
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.findDean();
    this.loadStudyPrograms();
  }

  private findDean(): void {
    if (!this.data.college.deanId) {
      this.dean = null;
      return;
    }

    this.dean = this.data.teachers.find(t => t.id === this.data.college.deanId) || null;
  }

  private loadStudyPrograms(): void {
    this.loadingPrograms = true;
    this.apiService.getAllStudyPrograms().subscribe({  
      next: (programs) => {
        this.studyPrograms = programs.filter(p => p.collegeId === this.data.college.id);
        this.loadingPrograms = false;
      },
      error: (err) => {
        console.error('Failed to load study programs:', err);
        this.studyPrograms = [];
        this.loadingPrograms = false;
      }
    });
  }
}