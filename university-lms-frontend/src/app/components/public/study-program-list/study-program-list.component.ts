import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { StudyProgram } from '../../../core/models/study-program.model';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-study-program-list',
  standalone: true,
  imports: [CommonModule, MatListModule],
  template: `
    <h2>Study Programs</h2>
    @if (studyPrograms.length > 0) {
      <mat-list>
        @for (program of studyPrograms; track program.id) {
          <mat-list-item>{{ program.name }}</mat-list-item>
        }
      </mat-list>
    } @else {
      <p>No study programs available</p>
    }
  `
})
export class StudyProgramListComponent implements OnInit {
  studyPrograms: StudyProgram[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getStudyPrograms().subscribe({
      next: (data: StudyProgram[]) => (this.studyPrograms = data),
      error: (err: any) => console.error('Failed to load study programs:', err)
    });
  }
}