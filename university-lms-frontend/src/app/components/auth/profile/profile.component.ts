import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    @if (user) {
      <div class="profile-container">
        <mat-card class="profile-card">
          <mat-card-header>
            <mat-card-title>User Profile</mat-card-title>
            <mat-card-subtitle>Edit your personal information</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form (ngSubmit)="updateProfile()" class="profile-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput [(ngModel)]="user.email" name="email" type="email" required>
              </mat-form-field>

              <div class="name-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>First Name</mat-label>
                  <input matInput [(ngModel)]="user.firstName" name="firstName">
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Last Name</mat-label>
                  <input matInput [(ngModel)]="user.lastName" name="lastName">
                </mat-form-field>
              </div>

              <mat-divider class="divider"></mat-divider>

              <div class="actions">
                <button mat-raised-button color="primary" type="submit">Save Changes</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .profile-container {
      display: flex;
      justify-content: center;
      padding: 32px 16px;
      min-height: calc(100vh - 64px); 
    }

    .profile-card {
      max-width: 600px;
      width: 100%;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .name-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    @media (max-width: 600px) {
      .name-row {
        flex-direction: column;
        gap: 0;
      }
    }

    .divider {
      margin: 24px 0;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const current = this.apiService.getCurrentUser();
    if (current) {
      this.user = {
        username: current.username,
        email: current.email || '',
        firstName: current.firstName || '',
        lastName: current.lastName || '',
        indexNumber: current.indexNumber || ''
      } as User;
    }
  }

  updateProfile(): void {
    if (this.user) {
      this.apiService.updateProfile(this.user).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
          const role = updatedUser.role.toLowerCase();
          this.router.navigate([`/${role}`]);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.snackBar.open('Update failed: ' + (error.message || 'Unknown error'), 'Close', { duration: 5000 });
        }
      });
    }
  }
}