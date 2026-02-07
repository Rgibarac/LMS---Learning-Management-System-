// src/app/components/public/university-info/university-info.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';

export interface University {
  id?: number;
  name: string;
  description: string;
}

export interface UniversityDetails {
  id?: number;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  fullDescription?: string;
  rectorId?: number;
  rectorName?: string;
  rectorDescription?: string;
}

@Component({
  selector: 'app-university-info',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="university-page" *ngIf="!loading; else loadingTemplate">
      <h1 class="page-title">{{ university?.name || 'Our University' }}</h1>

      <div class="info-grid">
        <mat-card class="main-card">
          <mat-card-header>
            <div mat-card-avatar class="university-avatar">
              <mat-icon>account_balance</mat-icon>
            </div>
            <mat-card-title>About the University</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="description" *ngIf="university?.description as desc">
              {{ desc }}
            </p>

            <ng-container *ngIf="details?.fullDescription as fullDesc">
              <mat-divider class="section-divider"></mat-divider>
              <h3>More About Us</h3>
              <p class="full-desc">{{ fullDesc }}</p>
            </ng-container>
          </mat-card-content>
        </mat-card>

        <mat-card class="contact-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>contact_mail</mat-icon>
              Contact Information
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="contact-item" *ngIf="details?.contactEmail as email">
              <mat-icon>email</mat-icon>
              <a [href]="'mailto:' + email">{{ email }}</a>
            </div>

            <div class="contact-item" *ngIf="details?.contactPhone as phone">
              <mat-icon>phone</mat-icon>
              <a [href]="'tel:' + phone">{{ phone }}</a>
            </div>

            <div class="contact-item" *ngIf="details?.location as location">
              <mat-icon>location_on</mat-icon>
              <span>{{ location }}</span>
            </div>

            <div class="contact-item" *ngIf="!hasContactInfo()">
              <mat-icon>info</mat-icon>
              <span>No contact information available</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="rector-card" *ngIf="details?.rectorName as rectorName">
          <mat-card-header>
            <div mat-card-avatar class="rector-avatar">
              <mat-icon>person</mat-icon>
            </div>
            <mat-card-title>Rector</mat-card-title>
            <mat-card-subtitle>University Leadership</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <h3 class="rector-name">{{ rectorName }}</h3>
            <p class="rector-desc" *ngIf="details?.rectorDescription as rectorDesc; else defaultRectorDesc">
              {{ rectorDesc }}
            </p>
            <ng-template #defaultRectorDesc>
              <p class="rector-desc">
                Leading our institution with vision and dedication to academic excellence.
              </p>
            </ng-template>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="!university && !details">
        <mat-icon>info</mat-icon>
        <p>No university information available at this time.</p>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <div class="loading">
        <mat-spinner diameter="60"></mat-spinner>
        <p>Loading university information...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .university-page { padding: 40px 20px; max-width: 1200px; margin: 0 auto; }
    .page-title { text-align: center; color: #3f51b5; margin-bottom: 40px; font-size: 2.8rem; font-weight: 500; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 32px; }
    .main-card { grid-row: span 2; }
    .university-avatar, .rector-avatar {
      background-color: #6d4c41; color: white; font-size: 40px; width: 64px; height: 64px;
      display: flex; align-items: center; justify-content: center;
    }
    .description, .full-desc { font-size: 1.1rem; line-height: 1.8; color: #444; }
    .section-divider { margin: 24px 0; }
    .contact-item {
      display: flex; align-items: center; gap: 12px; margin: 16px 0; font-size: 1.1rem;
    }
    .contact-item a { color: #1976d2; text-decoration: none; }
    .contact-item a:hover { text-decoration: underline; }
    .contact-item mat-icon { color: #1976d2; }
    .rector-name { font-size: 1.8rem; font-weight: 600; color: #3f51b5; margin: 12px 0 8px; }
    .rector-desc { font-size: 1.1rem; line-height: 1.6; color: #555; }
    .empty-state, .loading { text-align: center; padding: 100px 20px; color: #666; }
    .loading { display: flex; flex-direction: column; align-items: center; gap: 20px; }
    @media (max-width: 960px) {
      .info-grid { grid-template-columns: 1fr; }
      .main-card { grid-row: span 1; }
      .page-title { font-size: 2.2rem; }
    }
  `]
})
export class UniversityInfoComponent implements OnInit {
  university: University | null = null;
  details: UniversityDetails | null = null;
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    this.apiService.getUniversityInfo().subscribe({
      next: (uni) => {
        this.university = uni;

        this.apiService.getAllUniversityDetails().subscribe({
          next: (detailsList) => {
            this.details = detailsList && detailsList.length > 0 ? detailsList[0] : null;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load university details:', err);
            this.details = null;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load university info:', err);
        this.university = null;
        this.details = null;
        this.loading = false;
      }
    });
  }

  hasContactInfo(): boolean {
    return !!(
      this.details?.contactEmail ||
      this.details?.contactPhone ||
      this.details?.location
    );
  }
}