// src/app/components/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Notification } from '../../../core/models/notification.model';
import { Schedule } from '../../../core/models/schedule.model';
import { User } from '../../../core/models/user.model';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

interface University {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <!-- HERO SECTION -->
    <div class="hero">
      <div class="hero-content">
        <h1 *ngIf="university">{{ university.name }}</h1>
        <h2 *ngIf="!university">University Learning Management System</h2>
        <p class="subtitle" *ngIf="university">{{ university.description }}</p>
        <p class="subtitle" *ngIf="!university">
          Your gateway to academic excellence, courses, syllabuses, and real-time schedules.
        </p>

        <div class="hero-actions" *ngIf="!currentUser">
          <button mat-raised-button color="primary" size="large" routerLink="/login">
            <mat-icon>login</mat-icon> Sign In
          </button>
          <button mat-raised-button color="accent" size="large" routerLink="/register" class="register-btn">
            <mat-icon>person_add</mat-icon> Register as Student
          </button>
        </div>

        <div class="welcome-user" *ngIf="currentUser">
          <h2>Welcome back, <strong>{{ currentUser.firstName }} {{ currentUser.lastName }}</strong>!</h2>
          <p>Role: <strong>{{ currentUser.role | titlecase }}</strong></p>
          <button mat-stroked-button color="primary" routerLink="/{{ currentUser.role.toLowerCase() }}">
            Go to Dashboard
          </button>
        </div>
      </div>
      <div class="hero-wave"></div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="main-content">

      <!-- UNIVERSITY INFO CARD -->
      <mat-card class="info-card" *ngIf="university">
        <mat-card-header>
          <div mat-card-avatar class="icon-bg"><mat-icon>account_balance</mat-icon></div>
          <mat-card-title>About Our University</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>{{ university.description }}</p>
          <div class="quick-links">
            <a routerLink="/courses" mat-stroked-button><mat-icon>menu_book</mat-icon> View All Courses</a>
            <a routerLink="/study-programs" mat-stroked-button><mat-icon>school</mat-icon> Study Programs</a>
            <a routerLink="/syllabuses" mat-stroked-button><mat-icon>description</mat-icon> Syllabuses</a>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- SCHEDULES SECTION -->
      <mat-card class="schedules-card">
        <mat-card-header>
          <div mat-card-avatar class="icon-bg schedule"><mat-icon>event_note</mat-icon></div>
          <mat-card-title>Current Academic Schedules</mat-card-title>
          <mat-card-subtitle>Important dates and class/exam schedules</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="isLoadingSchedules" class="loading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <mat-list *ngIf="!isLoadingSchedules && schedules.length > 0">
            <mat-list-item *ngFor="let s of schedules; let i = index" class="schedule-item">
              <div class="schedule-content">
                <h3 matLine>{{ s.courseName }}</h3>
                <p matLine><strong>Year:</strong> {{ s.academicYear }} • {{ s.scheduleDetails }}</p>
              </div>
              <mat-icon matListItemIcon color="primary">schedule</mat-icon>
            </mat-list-item>
            <mat-divider *ngIf="schedules.length > 1"></mat-divider>
          </mat-list>

          <div class="empty-state" *ngIf="!isLoadingSchedules && schedules.length === 0">
            <mat-icon>info</mat-icon>
            <p>No schedules published yet. Check back soon!</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- PUBLIC LINKS FOR GUESTS -->
      <div class="public-links" *ngIf="!currentUser">
        <mat-card>
          <mat-card-header>
            <mat-card-title><mat-icon>explore</mat-icon> Explore the Platform</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="link-grid">
              <a routerLink="/courses" class="link-item">
                <mat-icon>library_books</mat-icon>
                <span>All Courses</span>
              </a>
              <a routerLink="/study-programs" class="link-item">
                <mat-icon>apartment</mat-icon>
                <span>Study Programs</span>
              </a>
              <a routerLink="/syllabuses" class="link-item">
                <mat-icon>file_copy</mat-icon>
                <span>Download Syllabuses</span>
              </a>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .hero {
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 100px 20px 140px;
      text-align: center;
      overflow: hidden;
    }

    .hero-content {
      max-width: 900px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }

    .hero h1 {
      font-size: 48px;
      font-weight: 700;
      margin: 0 0 16px;
      text-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    .hero h2 {
      font-size: 42px;
      margin: 0 0 20px;
    }

    .subtitle {
      font-size: 20px;
      opacity: 0.95;
      max-width: 700px;
      margin: 0 auto 32px;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .register-btn {
      background: white !important;
      color: #667eea !important;
    }

    .welcome-user {
      background: rgba(255,255,255,0.15);
      padding: 32px;
      border-radius: 16px;
      backdrop-filter: blur(10px);
      margin-top: 20px;
    }

    .hero-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 120px;
      background: white;
      border-radius: 100% 100% 0 0 / 50% 50% 0 0;
    }

    .main-content {
      max-width: 1200px;
      margin: -80px auto 40px;
      padding: 0 20px;
      position: relative;
      z-index: 3;
    }

    .info-card, .schedules-card {
      margin-bottom: 32px;
      border-radius: 16px !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important;
      overflow: hidden;
    }

    .icon-bg {
      background: #667eea;
      color: white;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }

    .icon-bg.schedule { background: #e91e63; }

    .quick-links {
      display: flex;
      gap: 16px;
      margin-top: 24px;
      flex-wrap: wrap;
    }

    .quick-links button {
      flex: 1;
      min-width: 180px;
    }

    .schedule-item {
      padding: 41px 0 !important;
    }

    .schedule-content h3 {
      margin: 0 0 8px;
      color: #333;
      font-size: 18px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.4;
    }

    .public-links .link-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .link-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      background: #f8f9fa;
      border-radius: 12px;
      text-decoration: none;
      color: #333;
      transition: all 0.3s;
    }

    .link-item:hover {
      background: #667eea;
      color: white;
      transform: translateY(-4px);
    }

    .link-item mat-icon {
      font-size: 42px;
      width: 42px;
      height: 42px;
      margin-bottom: 12px;
    }

    .loading {
      text-align: center;
      padding: 40px;
    }

    @media (max-width: 768px) {
      .hero h1 { font-size: 36px; }
      .hero-actions { flex-direction: column; align-items: center; }
      .hero-actions button { width: 280px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  university: University | null = null;
  currentUser: User | null = null;
  schedules: Schedule[] = [];
  isLoadingSchedules = true;

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.http.get<University>('http://localhost:8080/api/public/university').subscribe({
      next: (info) => this.university = info,
      error: (err) => console.warn('University info not available:', err)
    });

    this.currentUser = this.apiService.getCurrentUser();

    this.apiService.getSchedules().subscribe({
      next: (data) => {
        this.schedules = data;
        this.isLoadingSchedules = false;
      },
      error: () => {
        this.isLoadingSchedules = false;
      }
    });
  }
}