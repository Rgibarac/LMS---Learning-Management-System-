import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="header">
        <h1><mat-icon>menu_book</mat-icon> All Courses</h1>
        <p>Browse available courses in the university</p>
      </div>

      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading courses...</p>
      </div>

      <div class="courses-grid" *ngIf="!isLoading">
        <mat-card class="course-card" *ngFor="let course of courses" (click)="viewCourse(course)">
          <mat-card-header>
            <div mat-card-avatar class="course-avatar">
              <mat-icon>school</mat-icon>
            </div>
            <mat-card-title>{{ course.name }}</mat-card-title>
            <mat-card-subtitle>{{ course.code }} • {{ course.ectsPoints }} ECTS</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="description" *ngIf="course.description">
              {{ course.description.length > 120 ? (course.description | slice:0:120) + '...' : course.description }}
            </p>
            <p class="no-desc" *ngIf="!course.description">No description available</p>
          </mat-card-content>
        </mat-card>

        <div *ngIf="courses.length === 0" class="empty-state">
          <mat-icon>info</mat-icon>
          <h3>No courses available</h3>
          <p>Check back later or contact administration.</p>
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
    .courses-grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
    .course-card { cursor: pointer; transition: all 0.3s; height: 100%; }
    .course-card:hover { transform: translateY(-8px); box-shadow: 0 12px 30px rgba(0,0,0,0.15) !important; }
    .course-avatar { background: #667eea; color: white; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .description { color: #555; line-height: 1.6; }
    .no-desc { color: #999; font-style: italic; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px; color: #999; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; opacity: 0.5; }
    .empty-state h3 { margin: 20px 0 10px; color: #666; }
  `]
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  isLoading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
        this.isLoading = false;
      }
    });
  }

  viewCourse(course: Course) {
    console.log('View course:', course);
  }
}