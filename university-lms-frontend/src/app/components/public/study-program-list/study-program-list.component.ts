
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { StudyProgram } from '../../../core/models/study-program.model';

@Component({
  selector: 'app-study-program-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h1><mat-icon>account_balance</mat-icon> Study Programs</h1>
        <p>Explore all academic programs offered</p>
      </div>

      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="50"></mat-spinner>
      </div>

      <div class="programs-grid" *ngIf="!isLoading">
        <mat-card class="program-card" *ngFor="let program of studyPrograms">
          <mat-card-header>
            <div mat-card-avatar class="program-avatar">
              <mat-icon>school</mat-icon>
            </div>
            <mat-card-title>{{ program.name }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p *ngIf="program.description">{{ program.description }}</p>
            <p class="no-desc" *ngIf="!program.description">No description provided.</p>
          </mat-card-content>
        </mat-card>

        <div *ngIf="studyPrograms.length === 0" class="empty-state">
          <mat-icon>info</mat-icon>
          <h3>No study programs found</h3>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 40px 20px; max-width: 1100px; margin: 0 auto; }
    .header h1 { font-size: 36px; color: #333; display: flex; align-items: center; justify-content: center; gap: 12px; }
    .header p { text-align: center; color: #666; font-size: 18px; margin-top: 8px; }
    .loading { text-align: center; padding: 80px; }
    .programs-grid { display: grid; gap: 28px; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); }
    .program-card { height: 100%; transition: all 0.3s; }
    .program-card:hover { transform: translateY(-6px); box-shadow: 0 10px 25px rgba(0,0,0,0.12) !important; }
    .program-avatar { background: #7b1fa2; color: white; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .no-desc { color: #999; font-style: italic; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px; color: #999; }
    .empty-state mat-icon { font-size: 60px; width: 60px; height: 60px; opacity: 0.4; }
  `]
})
export class StudyProgramListComponent implements OnInit {
  studyPrograms: StudyProgram[] = [];
  isLoading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getStudyPrograms().subscribe({
      next: (data) => {
        this.studyPrograms = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load programs:', err);
        this.isLoading = false;
      }
    });
  }
}