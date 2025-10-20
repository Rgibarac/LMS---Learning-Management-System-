import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Course } from '../../../core/models/course.model';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, MatListModule],
  template: `
    <h2>Courses</h2>
    @if (courses.length > 0) {
      <mat-list>
        @for (course of courses; track course.id) {
          <mat-list-item>{{ course.name }} ({{ course.code }})</mat-list-item>
        }
      </mat-list>
    } @else {
      <p>No courses available</p>
    }
  `
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getCourses().subscribe({
      next: (data: Course[]) => (this.courses = data),
      error: (err: any) => console.error('Failed to load courses:', err)
    });
  }
}