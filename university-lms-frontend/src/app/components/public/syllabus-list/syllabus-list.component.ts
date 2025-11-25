// src/app/components/syllabus/syllabus-list/syllabus-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { Syllabus } from '../../../core/models/syllabus.model';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-syllabus-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h1><mat-icon>description</mat-icon> Course Syllabuses</h1>
        <p>Download official syllabuses for all courses</p>
      </div>

      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div class="syllabus-grid" *ngIf="!isLoading">
        <mat-card class="syllabus-card" *ngFor="let syllabus of syllabuses">
          <mat-card-header>
            <div mat-card-avatar class="syllabus-avatar">
              <mat-icon>article</mat-icon>
            </div>
            <mat-card-title>{{ getCourseName(syllabus.courseId) }}</mat-card-title>
            <mat-card-subtitle>
              Academic Year: {{ syllabus.academicYear || 'Current' }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p><strong>PDF Syllabus Available</strong></p>
          </mat-card-content>
        </mat-card>

        <div *ngIf="syllabuses.length === 0" class="empty-state">
          <mat-icon>warning</mat-icon>
          <h3>No syllabuses uploaded yet</h3>
          <p>Staff will upload them soon.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 40px 20px; max-width: 1100px; margin: 0 auto; }
    .header h1 { font-size: 36px; color: #333; display: flex; align-items: center; justify-content: center; gap: 12px; }
    .header p { text-align: center; color: #666; font-size: 18px; margin-top: 8px; }
    .loading { text-align: center; padding: 80px; }
    .syllabus-grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
    .syllabus-card { height: 100%; }
    .syllabus-avatar { background: #d32f2f; color: white; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px; color: #999; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; opacity: 0.5; }
  `]
})
export class SyllabusListComponent implements OnInit {
  syllabuses: Syllabus[] = [];
  courses: Course[] = [];
  isLoading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getSyllabuses().subscribe({
      next: (syllabuses) => {
        this.syllabuses = syllabuses;
        this.apiService.getCourses().subscribe(courses => {
          this.courses = courses;
          this.isLoading = false;
        });
      },
      error: (err) => {
        console.error('Failed to load syllabuses:', err);
        this.isLoading = false;
      }
    });
  }

  getCourseName(courseId: number): string {
    return this.courses.find(c => c.id === courseId)?.name || `Course ${courseId}`;
  }
}