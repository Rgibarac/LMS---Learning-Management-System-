import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Syllabus } from '../../../core/models/syllabus.model';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-syllabus-list',
  standalone: true,
  imports: [CommonModule, MatListModule],
  template: `
    <h2>Syllabuses</h2>
    @if (syllabuses.length > 0) {
      <mat-list>
        @for (syllabus of syllabuses; track syllabus.id) {
          <mat-list-item>Syllabus for Course {{ syllabus.courseId }}</mat-list-item>
        }
      </mat-list>
    } @else {
      <p>No syllabuses available</p>
    }
  `
})
export class SyllabusListComponent implements OnInit {
  syllabuses: Syllabus[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getSyllabuses().subscribe({
      next: (data: Syllabus[]) => (this.syllabuses = data),
      error: (err: any) => console.error('Failed to load syllabuses:', err)
    });
  }
}
