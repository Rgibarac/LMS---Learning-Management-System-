import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Notification } from '../../../core/models/notification.model';
import { Schedule } from '../../../core/models/schedule.model';

interface University {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule],
  template: `
    <mat-card *ngIf="university">
      <mat-card-title>Welcome to {{ university.name }}</mat-card-title>
      <mat-card-content>
        <p>{{ university.description }}</p>
        <p>Explore our faculties, study programs, courses, and syllabuses.</p>
      </mat-card-content>
    </mat-card>
    <div *ngIf="error">Failed to load university info: {{ error }}</div>

    <div>
      <h3>Schedules</h3>
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
  `,
  styles: [`
    mat-card { margin: 20px; }
    h3 { margin-top: 20px; }
    mat-table { width: 100%; margin-bottom: 20px; }
  `]
})
export class HomeComponent implements OnInit {
  university: University | null = null;
  error: string | null = null;
  notifications: Notification[] = [];
  schedules: Schedule[] = [];
  notificationColumns: string[] = ['title', 'message', 'recipientRole'];
  scheduleColumns: string[] = ['course', 'academicYear', 'scheduleDetails'];

  constructor(private http: HttpClient, private apiService: ApiService) {}

  ngOnInit(): void {
    this.http.get<University>('http://localhost:8080/api/public/university')
      .subscribe({
        next: (info) => (this.university = info),
        error: (err) => {
          this.error = err.message;
          console.error('Failed to load university info:', err);
        }
      });


    this.apiService.getSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        console.log('Schedules loaded:', schedules);
      },
      error: (err) => {
        console.error('Failed to load schedules:', err);
      }
    });
  }
}