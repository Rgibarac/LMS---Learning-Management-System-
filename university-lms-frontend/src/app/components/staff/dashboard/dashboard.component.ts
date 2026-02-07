import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule, MatTabGroup, MatTab } from '@angular/material/tabs';

import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';
import { Course } from '../../../core/models/course.model';
import { StudyProgram } from '../../../core/models/study-program.model';
import { Syllabus } from '../../../core/models/syllabus.model';
import { Notification } from '../../../core/models/notification.model';
import { Schedule } from '../../../core/models/schedule.model';
import { CustomContent } from '../../../core/models/custom-content.model';
import { Term } from '../../../core/models/term.model';
import { AppliedYear } from '../../../core/models/applied-year.model';
import { TermSchedule } from '../../../core/models/term-schedule.model';
import { TermScheduleEditable } from '../../../core/models/term-schedule-editable.model';
import { forkJoin } from 'rxjs';
import { WeeklySchedule } from '../../../core/models/weekly-schedule.model';
import { ScheduleEntry } from '../../../core/models/schedule-entry.model';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTableModule, MatCardModule, MatIconModule, MatDialogModule,
    MatProgressSpinnerModule, MatSnackBarModule, MatListModule, MatDividerModule, MatCheckboxModule,
    MatTabGroup,
    MatTab
],
  template: `
    <div class="dashboard-header">
      <h1>Staff Portal</h1>
      <p class="welcome">Welcome back, <strong>{{ user?.firstName }} {{ user?.lastName }}</strong></p>
    </div>

    <div *ngIf="isLoading" class="loading-spinner">
      <mat-spinner diameter="60"></mat-spinner>
      <p>Loading staff tools...</p>
    </div>

    <div *ngIf="!isLoading" class="dashboard-grid">

      <mat-card class="action-card full-width-card" (click)="openStudentManagement()">
        <mat-card-header>
          <div mat-card-avatar class="icon manage"><mat-icon>manage_accounts</mat-icon></div>
          <mat-card-title>Student Management</mat-card-title>
          <mat-card-subtitle>{{ students.length }} active students</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Search • View all courses • Assign program • Set current year (1–4)</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="primary"><mat-icon>arrow_forward</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="action-card" (click)="openDialog('notification')">
        <mat-card-header>
          <div mat-card-avatar class="icon notify"><mat-icon>notifications_active</mat-icon></div>
          <mat-card-title>Broadcast Message</mat-card-title>
        </mat-card-header>
        <mat-card-content><p>Send to all users</p></mat-card-content>
      </mat-card>

      <mat-card class="action-card" (click)="openDialog('schedule')">
        <mat-card-header>
          <div mat-card-avatar class="icon schedule"><mat-icon>event_note</mat-icon></div>
          <mat-card-title>Schedules</mat-card-title>
        </mat-card-header>
        <mat-card-content><p>Manage exam schedules</p></mat-card-content>
      </mat-card>

      <mat-card class="action-card" (click)="openDialog('content')">
        <mat-card-header>
          <div mat-card-avatar class="icon content"><mat-icon>article</mat-icon></div>
          <mat-card-title>Custom Content</mat-card-title>
        </mat-card-header>
        <mat-card-content><p>Tasks & Notes</p></mat-card-content>
      </mat-card>

      <mat-card class="action-card" (click)="openClassScheduleManagement()">
  <mat-card-header>
    <div mat-card-avatar class="icon class-schedule"><mat-icon>schedule</mat-icon></div>
    <mat-card-title>Class Schedules</mat-card-title>
    <mat-card-subtitle>Weekly timetables per program & year</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p>Create and manage weekly class schedules</p>
  </mat-card-content>
  <mat-card-actions align="end">
    <button mat-mini-fab color="accent"><mat-icon>arrow_forward</mat-icon></button>
  </mat-card-actions>
</mat-card>
      
      <mat-card class="action-card full-width-card" (click)="openUserRoleManagement()">
  <mat-card-header>
    <div mat-card-avatar class="icon roles"><mat-icon>admin_panel_settings</mat-icon></div>
    <mat-card-title>Manage User Roles</mat-card-title>
    <mat-card-subtitle>{{ allUsers.length }} total user(s)</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p>Search users • Change roles (Student → Teacher → Staff → Admin)</p>
  </mat-card-content>
  <mat-card-actions align="end">
    <button mat-mini-fab color="warn"><mat-icon>security</mat-icon></button>
  </mat-card-actions>
</mat-card>

    </div>

    <ng-template #enrollCourse>
      <h2 mat-dialog-title>Enroll Student in Course</h2>
      <mat-dialog-content>
        <form (ngSubmit)="enrollInCourse()" #f1="ngForm">
          <mat-form-field appearance="fill">
            <mat-label>Student</mat-label>
            <mat-select [(ngModel)]="enrollment.course.studentId" name="studentId" required>
              <mat-option *ngFor="let s of students" [value]="s.id">
                {{ s.firstName }} {{ s.lastName }} ({{ s.indexNumber }})
              </mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Course</mat-label>
            <mat-select [(ngModel)]="enrollment.course.courseId" name="courseId" required>
              <mat-option *ngFor="let c of courses" [value]="c.id">{{ c.name }} ({{ c.code }})</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="f1.invalid">Enroll</button>
            <button mat-button mat-dialog-close>Cancel</button>
          </div>
        </form>
      </mat-dialog-content>
    </ng-template>

    <ng-template #enrollProgram>
      <h2 mat-dialog-title>Enroll in Study Program</h2>
      <mat-dialog-content>
        <form (ngSubmit)="enrollInStudyProgram()" #f2="ngForm">
          <mat-form-field appearance="fill">
            <mat-label>Student</mat-label>
            <mat-select [(ngModel)]="enrollment.studyProgram.studentId" name="studentId" required>
              <mat-option *ngFor="let s of students" [value]="s.id">{{ s.firstName }} {{ s.lastName }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Study Program</mat-label>
            <mat-select [(ngModel)]="enrollment.studyProgram.studyProgramId" name="programId" required>
              <mat-option *ngFor="let p of studyPrograms" [value]="p.id">{{ p.name }}</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="f2.invalid">Enroll</button>
            <button mat-button mat-dialog-close>Cancel</button>
          </div>
        </form>
      </mat-dialog-content>
    </ng-template>

    <ng-template #notification>
      <h2 mat-dialog-title>Send Notification</h2>
      <mat-dialog-content>
        <form (ngSubmit)="createNotification()" #f3="ngForm">
          <mat-form-field appearance="fill"><input matInput [(ngModel)]="newNotification.title" name="title" placeholder="Title" required></mat-form-field>
          <mat-form-field appearance="fill"><textarea matInput [(ngModel)]="newNotification.message" name="message" rows="4" required></textarea></mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Recipient</mat-label>
            <mat-select [(ngModel)]="newNotification.recipientRole" name="role" required>
              <mat-option value="ALL">Everyone</mat-option>
              <mat-option value="STUDENT">Students</mat-option>
              <mat-option value="TEACHER">Teachers</mat-option>
              <mat-option value="STAFF">Staff</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="f3.invalid">Send</button>
            <button mat-button mat-dialog-close>Cancel</button>
          </div>
        </form>
      </mat-dialog-content>
    </ng-template>


<ng-template #schedule>
  <h2 mat-dialog-title>Academic Calendar & Schedules</h2>

  <mat-tab-group animationDuration="0ms" class="full-height-tabs">

    <mat-tab label="Academic Terms">
      <div class="tab-content">
        <button mat-raised-button color="primary" (click)="openTermForm()">+ Create New Term</button>

        <div *ngIf="showTermForm || editingTerm" class="form-box">
  <form (ngSubmit)="saveTerm()" #termForm="ngForm">
    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Term Name</mat-label>
      <input matInput [(ngModel)]="termFormData.name" name="name" required placeholder="e.g. Winter 2025/2026">
    </mat-form-field>

    <div class="date-row">
      <mat-form-field appearance="fill">
        <mat-label>Start Date</mat-label>
        <input matInput type="date" [(ngModel)]="termFormData.startDate" name="startDate" required>
      </mat-form-field>
      <mat-form-field appearance="fill">
        <mat-label>End Date</mat-label>
        <input matInput type="date" [(ngModel)]="termFormData.endDate" name="endDate" required>
      </mat-form-field>
    </div>

    <mat-form-field appearance="fill" class="full-width">
      <mat-label>Description</mat-label>
      <textarea matInput [(ngModel)]="termFormData.description" name="description" rows="2"></textarea>
    </mat-form-field>

    <mat-checkbox [(ngModel)]="termFormData.active" name="active">Set as Active Term</mat-checkbox>

    <div class="actions">
      <button mat-raised-button color="primary" type="submit" [disabled]="termForm.invalid">
        {{ editingTerm ? 'Update' : 'Create' }} Term
      </button>
      <button mat-button (click)="cancelTermForm()">Cancel</button>
    </div>
  </form>
</div>

        <mat-table [dataSource]="terms" class="mat-elevation-z4" style="margin-top: 24px;">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
            <mat-cell *matCellDef="let t">
              <strong>{{ t.name }}</strong>
              <span *ngIf="t.active" class="active-badge">ACTIVE</span>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="period">
            <mat-header-cell *matHeaderCellDef>Duration</mat-header-cell>
            <mat-cell *matCellDef="let t">{{ formatDate(t.startDate) }} – {{ formatDate(t.endDate) }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let t">
              <button mat-icon-button color="primary" (click)="editTerm(t)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteTerm(t.id!)" [disabled]="t.active"><mat-icon>delete</mat-icon></button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="['name','period','actions']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['name','period','actions']"></mat-row>
        </mat-table>
      </div>
    </mat-tab>

    <mat-tab label="Term Schedule Editor">
  <div class="tab-content" style="padding: 20px;">

    <mat-form-field appearance="fill" class="full-width" style="max-width: 400px;">
      <mat-label>Select Term</mat-label>
      <mat-select [(ngModel)]="selectedTermId" (selectionChange)="onTermSelected()">
        <mat-option [value]="null">-- Select Term --</mat-option>
        <mat-option *ngFor="let t of terms" [value]="t.id">
          {{ t.name }} {{ t.active ? '(ACTIVE)' : '' }}
        </mat-option>
      </mat-select>
    </mat-form-field>

   <div *ngIf="selectedTermId" style="margin-top: 20px;">
  <button mat-raised-button color="primary" (click)="addEmptyRow()">
    Add Schedule Row
  </button>

  <form #scheduleForm="ngForm" (ngSubmit)="saveAll()">
    <div style="margin-top: 20px; overflow-x: auto;">
      <table class="schedule-table" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 12px;">Name</th>
            <th style="padding: 12px;">Course</th>
            <th style="padding: 12px;">Date</th>
            <th style="padding: 12px;">Start</th>
            <th style="padding: 12px;">End</th>
            <th style="padding: 12px;">Location</th>
            <th style="padding: 12px;"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of termSchedules; let i = index" style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;">
              <input [(ngModel)]="row.name" [name]="'name_' + i" placeholder="Name" required style="width: 100%; padding: 8px;">
            </td>
           <td style="padding: 8px;">
  <mat-form-field appearance="outline" style="width: 100%;">
    <mat-label>Course</mat-label>
    <mat-select [(ngModel)]="row.courseId" [name]="'course_' + i" required>
      <mat-option *ngFor="let course of courses" [value]="course.id">
        {{ course.name }} ({{ course.code }})
      </mat-option>
    </mat-select>
  </mat-form-field>
</td>
            <td style="padding: 8px;">
              <input type="date" [(ngModel)]="row.date" [name]="'date_' + i" required style="padding: 8px;">
            </td>
            <td style="padding: 8px;">
              <input type="time" [(ngModel)]="row.startTime" [name]="'start_' + i" required style="padding: 8px;">
            </td>
            <td style="padding: 8px;">
              <input type="time" [(ngModel)]="row.endTime" [name]="'end_' + i" style="padding: 8px;">
            </td>
            <td style="padding: 8px;">
              <input [(ngModel)]="row.location" [name]="'loc_' + i" placeholder="Room" style="width: 100%; padding: 8px;">
            </td>
            <td style="padding: 8px;">
              <button type="button" mat-icon-button color="warn" (click)="removeRow(i)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top: 20px; text-align: right;">
      <button 
        mat-raised-button 
        color="primary" 
        type="submit"
        [disabled]="!selectedTermId || termSchedules.length === 0">
        Save All Changes
      </button>
    </div>
  </form>
</div>

    <div *ngIf="!selectedTermId" style="text-align: center; padding: 60px; color: #666;">
      Please select a term to manage its schedule.
    </div>
  </div>
</mat-tab>

<mat-tab label="View All Schedules">
  <div class="tab-content" style="padding: 20px;">

    <mat-form-field appearance="fill" style="max-width: 400px;">
      <mat-label>Select Term to View</mat-label>
      <mat-select [(ngModel)]="viewTermId" (selectionChange)="loadViewSchedules()">
        <mat-option [value]="null">-- Choose Term --</mat-option>
        <mat-option *ngFor="let t of terms" [value]="t.id">
          {{ t.name }} {{ t.active ? '(ACTIVE)' : '' }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <div *ngIf="viewTermId && viewSchedules.length === 0" style="text-align: center; padding: 60px; color: #888;">
      No schedules found for this term.
    </div>

    <div *ngIf="viewTermId && viewSchedules.length > 0" style="margin-top: 20px;">
      <h3>Schedules for Term: <strong>{{ getTermName(viewTermId) }}</strong></h3>

      <table mat-table [dataSource]="viewSchedules" class="mat-elevation-z8" style="width: 100%; margin-top: 16px;">

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef> Event Name </th>
          <td mat-cell *matCellDef="let s"> <strong>{{ s.name }}</strong> </td>
        </ng-container>

        <ng-container matColumnDef="courses">
          <th mat-header-cell *matHeaderCellDef> Courses </th>
          <td mat-cell *matCellDef="let s">
            <div *ngFor="let c of s.courses">
              <span class="course-chip">
                {{ c.name }} ({{ c.code }})
              </span>
            </div>
            <i *ngIf="!s.courses || s.courses.length === 0">No courses</i>
          </td>
        </ng-container>

        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef> Date </th>
          <td mat-cell *matCellDef="let s"> {{ formatDate(s.date) }} </td>
        </ng-container>

        <ng-container matColumnDef="time">
          <th mat-header-cell *matHeaderCellDef> Time </th>
          <td mat-cell *matCellDef="let s">
            {{ s.startTime }} – {{ s.endTime || '—' }}
            <small *ngIf="s.location"> @ {{ s.location }}</small>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Actions </th>
          <td mat-cell *matCellDef="let s">
            <button mat-icon-button color="warn" (click)="deleteScheduleFromView(s.id!)">
              <mat-icon>delete_forever</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="viewColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: viewColumns;"></tr>
      </table>
    </div>

    <div *ngIf="!viewTermId" style="text-align: center; padding: 80px; color: #999; font-size: 1.2rem;">
      Select a term above to view its full schedule
    </div>
  </div>
</mat-tab>
  </mat-tab-group>
</ng-template>
    <ng-template #content>
      <h2 mat-dialog-title>Custom Content</h2>
      <mat-dialog-content>
        <button mat-raised-button color="primary" (click)="showContentForm = true">+ Add Content</button>
        <div *ngIf="showContentForm" class="form-box">
          <form (ngSubmit)="createCustomContent(); showContentForm = false" #f5="ngForm">
            <mat-form-field appearance="fill"><input matInput [(ngModel)]="newCustomContent.title" name="title" placeholder="Title" required></mat-form-field>
            <mat-form-field appearance="fill"><textarea matInput [(ngModel)]="newCustomContent.content" name="content" rows="5" required></textarea></mat-form-field>
            <div class="actions">
              <button mat-raised-button color="primary" type="submit">Save</button>
              <button mat-button (click)="showContentForm = false">Cancel</button>
            </div>
          </form>
        </div>
        <mat-list *ngIf="customContent.length">
          <mat-list-item *ngFor="let c of customContent">
            <h3 matLine>{{ c.title }}</h3>
            <p matLine>{{ c.content }}</p>
            <button mat-icon-button color="warn" (click)="deleteCustomContent(c.id!)"><mat-icon>delete</mat-icon></button>
          </mat-list-item>
          <mat-divider></mat-divider>
        </mat-list>
      </mat-dialog-content>
    </ng-template>

    <ng-template #termsDialog>
      <h2 mat-dialog-title>Manage Academic Terms</h2>
      <mat-dialog-content class="dialog-content">
        <button mat-raised-button color="primary" (click)="openTermForm()">+ Create New Term</button>
        <div *ngIf="showTermForm || editingTerm" class="form-box">
          <form (ngSubmit)="saveTerm()" #termForm="ngForm">
            <mat-form-field appearance="fill"><input matInput [(ngModel)]="termFormData.name" name="name" required placeholder="e.g. Winter 2025/2026"></mat-form-field>
            <div class="date-row">
              <mat-form-field appearance="fill"><input matInput type="date" [(ngModel)]="termFormData.startDate" name="startDate" required></mat-form-field>
              <mat-form-field appearance="fill"><input matInput type="date" [(ngModel)]="termFormData.endDate" name="endDate" required></mat-form-field>
            </div>
            <div class="date-row">
              <mat-form-field appearance="fill"><input matInput type="date" [(ngModel)]="termFormData.enrollmentStart" name="enrollmentStart"></mat-form-field>
              <mat-form-field appearance="fill"><input matInput type="date" [(ngModel)]="termFormData.enrollmentEnd" name="enrollmentEnd"></mat-form-field>
            </div>
            <mat-form-field appearance="fill"><textarea matInput [(ngModel)]="termFormData.description" name="description" rows="2"></textarea></mat-form-field>
            <mat-checkbox [(ngModel)]="termFormData.active" name="active">Set as Active Term</mat-checkbox>
            <div class="actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="termForm.invalid">{{ editingTerm ? 'Update' : 'Create' }} Term</button>
              <button mat-button type="button" (click)="cancelTermForm()">Cancel</button>
            </div>
          </form>
        </div>
        <mat-table [dataSource]="terms" class="mat-elevation-z4" style="margin-top: 24px;">
          <ng-container matColumnDef="name"><mat-header-cell *matHeaderCellDef> Term </mat-header-cell><mat-cell *matCellDef="let t"><strong>{{ t.name }}</strong> <span *ngIf="t.active" class="active-badge">ACTIVE</span></mat-cell></ng-container>
          <ng-container matColumnDef="period"><mat-header-cell *matHeaderCellDef> Duration </mat-header-cell><mat-cell *matCellDef="let t"> {{ formatDate(t.startDate) }} to {{ formatDate(t.endDate) }} </mat-cell></ng-container>
          <ng-container matColumnDef="enrollment"><mat-header-cell *matHeaderCellDef> Enrollment Period </mat-header-cell><mat-cell *matCellDef="let t"><span *ngIf="t.enrollmentStart; else noEnrollment">{{ formatDate(t.enrollmentStart) }} to {{ formatDate(t.enrollmentEnd) }}</span><ng-template #noEnrollment>—</ng-template></mat-cell></ng-container>
          <ng-container matColumnDef="actions"><mat-header-cell *matHeaderCellDef> Actions </mat-header-cell><mat-cell *matCellDef="let t">
            <button mat-icon-button color="primary" (click)="editTerm(t); $event.stopPropagation()"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="deleteTerm(t.id!)" [disabled]="t.active"><mat-icon>delete</mat-icon></button>
          </mat-cell></ng-container>
          <mat-header-row *matHeaderRowDef="['name', 'period', 'enrollment', 'actions']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['name', 'period', 'enrollment', 'actions']"></mat-row>
        </mat-table>
      </mat-dialog-content>
    </ng-template>

<ng-template #studentManagementDialog>
  <h2 mat-dialog-title>Student Management</h2>
  <mat-dialog-content class="student-management">
    <mat-form-field appearance="fill" class="search-bar">
      <mat-label>Search students</mat-label>
      <input matInput [(ngModel)]="searchQuery" (input)="filterStudents()" placeholder="Name, index, email">
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>

    <mat-table [dataSource]="filteredStudents" class="mat-elevation-z8">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
        <mat-cell *matCellDef="let s">
          <strong>{{ s.firstName }} {{ s.lastName }}</strong>
          <div class="subtitle">{{ s.email }}</div>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="index">
        <mat-header-cell *matHeaderCellDef>Index Number</mat-header-cell>
        <mat-cell *matCellDef="let s">{{ s.indexNumber || '—' }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="currentYear">
  <mat-header-cell *matHeaderCellDef>Current Year</mat-header-cell>
  <mat-cell *matCellDef="let s">
    {{ getCurrentEnrollmentYear(s.id!) || '—' }}
  </mat-cell>
</ng-container>

<ng-container matColumnDef="program">
  <mat-header-cell *matHeaderCellDef>Program</mat-header-cell>
  <mat-cell *matCellDef="let s">
    {{ getCurrentProgramName(s.id!) || 'Not assigned' }}
  </mat-cell>
</ng-container>

      <ng-container matColumnDef="actions">
        <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
        <mat-cell *matCellDef="let s">
          <button 
      mat-raised-button 
      color="primary" 
      (click)="openEditStudent(s); $event.stopPropagation()"
      style="margin-right: 8px;">
      <mat-icon>edit</mat-icon> Edit
    </button>
    <button 
      mat-raised-button 
      color="accent" 
      (click)="exportStudentProfilePdf(s); $event.stopPropagation()">
      <mat-icon>picture_as_pdf</mat-icon> PDF
    </button>
    <button 
      mat-raised-button 
      color="warn" 
      (click)="exportStudentGradesPdf(s); $event.stopPropagation()">
      <mat-icon>grade</mat-icon> Grades PDF
    </button>
    <button 
      mat-raised-button 
      color="primary" 
      (click)="openXmlUploadDialog(s); $event.stopPropagation()">
      <mat-icon>upload_file</mat-icon> Upload Grades XML
    </button>
        </mat-cell>
      </ng-container>

<mat-header-row *matHeaderRowDef="['name', 'index', 'actions']"></mat-header-row>
<mat-row *matRowDef="let row; columns: ['name', 'index', 'actions']"></mat-row>
    </mat-table>
  </mat-dialog-content>
</ng-template>

    <ng-template #userRoleManagementDialog>
  <h2 mat-dialog-title>Manage User Roles</h2>
  <mat-dialog-content class="user-role-management">
    <mat-form-field appearance="fill" class="search-bar">
      <mat-label>Search users</mat-label>
      <input matInput [(ngModel)]="userSearchQuery" (input)="filterAllUsers()" placeholder="Name, email, index, username">
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>

    <mat-table [dataSource]="filteredAllUsers" class="mat-elevation-z8">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
        <mat-cell *matCellDef="let u">
          <strong>{{ u.firstName }} {{ u.lastName }}</strong>
          <div class="subtitle">{{ u.username }} • {{ u.email }}</div>
          <div class="subtitle" *ngIf="u.indexNumber">Index: {{ u.indexNumber }}</div>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="currentRole">
        <mat-header-cell *matHeaderCellDef>Current Role</mat-header-cell>
        <mat-cell *matCellDef="let u">
          <span class="role-chip" [ngClass]="'role-' + u.role.toLowerCase()">
            {{ u.role }}
          </span>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="changeRole">
  <mat-header-cell *matHeaderCellDef>Change Role</mat-header-cell>
  <mat-cell *matCellDef="let u">
    <span class="role-chip" [ngClass]="'role-' + u.role.toLowerCase()">{{ u.role }}</span>
    <button mat-icon-button color="accent" (click)="openRoleConfirmDialog(u)">
      <mat-icon>swap_horiz</mat-icon>
    </button>
  </mat-cell>
</ng-container>
<ng-template #roleConfirmDialog>
  <h2 mat-dialog-title>Change Role for {{ roleConfirmUser?.firstName }} {{ roleConfirmUser?.lastName }}</h2>
  <mat-dialog-content>
    <mat-form-field appearance="fill">
      <mat-label>New Role</mat-label>
      <mat-select [(ngModel)]="newRoleTemp">
        <mat-option value="STUDENT">Student</mat-option>
        <mat-option value="TEACHER">Teacher</mat-option>
        <mat-option value="STAFF">Staff</mat-option>

      </mat-select>
    </mat-form-field>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-raised-button color="primary" (click)="confirmRoleChange()">Confirm</button>
    <button mat-button mat-dialog-close>Cancel</button>
  </mat-dialog-actions>
</ng-template>

      <mat-header-row *matHeaderRowDef="['name', 'currentRole', 'changeRole']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['name', 'currentRole', 'changeRole']"></mat-row>
    </mat-table>

    <div *ngIf="filteredAllUsers.length === 0" class="empty-state">
      <mat-icon>search_off</mat-icon>
      <p>No users found matching your search.</p>
    </div>
  </mat-dialog-content>
</ng-template>

<ng-template #editStudentDialog>
  <h2 mat-dialog-title>Edit Student: {{ selectedEditStudent?.firstName }} {{ selectedEditStudent?.lastName }}</h2>
  <mat-dialog-content class="edit-student-dialog" *ngIf="selectedEditStudent">

    <div class="section">
      <h3>Index Number</h3>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Index Number</mat-label>
        <input matInput [(ngModel)]="selectedEditStudent.indexNumber" name="indexNumber">
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="saveIndexNumber()">
        Save Index Number
      </button>
    </div>

    <div class="section">
      <h3>Enroll in Academic Year</h3>
      <div class="form-grid">
        <mat-form-field appearance="fill">
          <mat-label>Academic Year</mat-label>
          <mat-select [(ngModel)]="yearEnrollment.yearOfEnrollment" name="year">
            <mat-option [value]="1">Year 1</mat-option>
            <mat-option [value]="2">Year 2</mat-option>
            <mat-option [value]="3">Year 3</mat-option>
            <mat-option [value]="4">Year 4</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Date of Enrollment</mat-label>
          <input matInput type="date" [ngModel]="yearEnrollment.dateOfEnrollment || today" (ngModelChange)="yearEnrollment.dateOfEnrollment = $event" name="date">
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Study Program</mat-label>
          <mat-select [(ngModel)]="yearEnrollment.studyProgramId" name="programId">
            <mat-option *ngFor="let p of studyPrograms" [value]="p.id">{{ p.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <button mat-raised-button color="primary" (click)="saveYearEnrollment()">
        Save Year Enrollment
      </button>
    </div>


    <div class="section">
      <h3>Enrolled Academic Years</h3>
      <div *ngIf="yearEnrollments.length === 0" class="empty">
        No year enrollments yet.
      </div>
      <mat-table *ngIf="yearEnrollments.length > 0" [dataSource]="yearEnrollments" class="mat-elevation-z4">
        <ng-container matColumnDef="year">
          <mat-header-cell *matHeaderCellDef>Year</mat-header-cell>
          <mat-cell *matCellDef="let e">Year {{ e.yearOfEnrollment }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="program">
          <mat-header-cell *matHeaderCellDef>Program</mat-header-cell>
          <mat-cell *matCellDef="let e">{{ getProgramName(e.studyProgramId) }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="date">
          <mat-header-cell *matHeaderCellDef>Date of Enrollment</mat-header-cell>
          <mat-cell *matCellDef="let e">{{ formatDate(e.dateOfEnrollment) }}</mat-cell>
        </ng-container>
        <ng-container matColumnDef="actions">
          <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
          <mat-cell *matCellDef="let e">
            <button mat-icon-button color="warn" (click)="deleteYearEnrollment(e.id!)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="['year', 'program', 'date', 'actions']"></mat-header-row>
        <mat-row *matRowDef="let row; columns: ['year', 'program', 'date', 'actions']"></mat-row>
      </mat-table>
    </div>

    <div class="section">
      <h3>Add Course</h3>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Select Course</mat-label>
        <mat-select [(ngModel)]="courseToAdd" name="courseAdd">
          <mat-option *ngFor="let c of courses" [value]="c.id">
            {{ c.name }} ({{ c.code }}) — {{ c.ectsPoints }} ECTS
          </mat-option>
        </mat-select>
      </mat-form-field>
      <button mat-raised-button color="accent" (click)="addCourseToStudent()" [disabled]="!courseToAdd">
        Add Course
      </button>
    </div>

    <div class="section">
      <h3>Currently Enrolled Courses</h3>
      <mat-list *ngIf="selectedEditStudent.enrolledCourses?.length; else noCourses">
        <mat-list-item *ngFor="let c of selectedEditStudent.enrolledCourses">
          <span matLine><strong>{{ c.name }}</strong> ({{ c.code }})</span>
          <small matLine>{{ c.ectsPoints }} ECTS</small>
          <button mat-icon-button color="warn" (click)="removeCourseFromStudent(c.id!)">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-list-item>
      </mat-list>
      <ng-template #noCourses>
        <p class="empty">No courses enrolled yet.</p>
      </ng-template>
    </div>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>

<ng-template #classScheduleManagementDialog>
  <h2 mat-dialog-title>Manage Class Schedules</h2>
  <mat-dialog-content>
    <div class="form-box">
      <h3>Create New Weekly Schedule</h3>
      <form (ngSubmit)="createWeeklySchedule()" #createForm="ngForm">
        <mat-form-field appearance="fill">
          <mat-label>Study Program</mat-label>
          <mat-select [(ngModel)]="newWeeklySchedule.studyProgramId" name="program" required>
            <mat-option *ngFor="let p of studyPrograms" [value]="p.id">
              {{ p.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Academic Year</mat-label>
          <mat-select [(ngModel)]="newWeeklySchedule.year" name="year" required>
            <mat-option [value]="1">Year 1</mat-option>
            <mat-option [value]="2">Year 2</mat-option>
            <mat-option [value]="3">Year 3</mat-option>
            <mat-option [value]="4">Year 4</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="actions">

          <button mat-raised-button color="primary" type="submit" [disabled]="createForm.invalid">
            Create Schedule
          </button>
          
        </div>
      </form>
    </div>

    <h3 style="margin-top: 32px;">Existing Schedules</h3>
    <mat-table [dataSource]="weeklySchedules" class="mat-elevation-z4">
      <ng-container matColumnDef="program">
        <mat-header-cell *matHeaderCellDef>Program</mat-header-cell>
        <mat-cell *matCellDef="let s">
          {{ getProgramName(s.studyProgramId) }}
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="year">
        <mat-header-cell *matHeaderCellDef>Year</mat-header-cell>
        <mat-cell *matCellDef="let s">Year {{ s.year }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="actions">
        <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
        <mat-cell *matCellDef="let s">
          <button mat-icon-button color="primary" (click)="openScheduleEditor(s)">
            <mat-icon>edit_calendar</mat-icon>
          </button>
          <button mat-icon-button color="accent" (click)="openScheduleViewer(s)">
  <mat-icon>visibility</mat-icon>
</button>
          <button mat-icon-button color="warn" (click)="deleteWeeklySchedule(s.id!)">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="['program', 'year', 'actions']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['program', 'year', 'actions']"></mat-row>
    </mat-table>
  </mat-dialog-content>
</ng-template>
<ng-template #xmlUploadDialog>
  <h2 mat-dialog-title>Upload Exam Grades XML for {{ selectedStudent?.firstName }} {{ selectedStudent?.lastName }}</h2>
  
  <mat-dialog-content>
    <div class="upload-container"
         (dragover)="onDragOver($event)"
         (dragleave)="onDragLeave($event)"
         (drop)="onDrop($event)"
         [class.drag-over]="isDragging">

      <mat-icon class="upload-icon">cloud_upload</mat-icon>
      <p>Drag & drop XML file here</p>
      <p>or</p>

      <button mat-raised-button color="primary" (click)="fileInput.click()">
        Select XML File
      </button>

      <input type="file" #fileInput accept=".xml" (change)="onFileSelected($event)" hidden />

      <div *ngIf="selectedFile" class="file-info">
        <p>Selected file: <strong>{{ selectedFile.name }}</strong></p>
        <p>Size: {{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
      </div>

      <div *ngIf="uploadError" class="error-message">
        {{ uploadError }}
      </div>
    </div>
  </mat-dialog-content>

  <mat-dialog-actions align="end">
    <button mat-button (click)="dialog.closeAll()">Back</button>
    <button mat-raised-button color="primary" 
            [disabled]="!selectedFile || isUploading"
            (click)="uploadXmlFile()">
      <mat-icon *ngIf="isUploading">hourglass_empty</mat-icon>
      {{ isUploading ? 'Uploading...' : 'Upload & Process' }}
    </button>
  </mat-dialog-actions>
</ng-template>

<ng-template #scheduleEntryEditorDialog>
  <h2 mat-dialog-title>
  <button mat-icon-button (click)="closeScheduleEditor()">
    <mat-icon>arrow_back</mat-icon>
  </button>
  Weekly Schedule Editor: {{ currentWeeklySchedule?.programName }} - Year {{ currentWeeklySchedule?.year }}
</h2>
  <mat-dialog-content>
    <button mat-raised-button color="primary" (click)="addScheduleEntryRow()">
      + Add Entry
    </button>

    <div style="margin-top: 20px; overflow-x: auto;">
      <table class="schedule-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Course</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Location</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let entry of scheduleEntries; let i = index">
            <td>
              <mat-select [(ngModel)]="entry.dayOfWeek" [name]="'day_' + i" required>
                <mat-option value="MONDAY">Monday</mat-option>
                <mat-option value="TUESDAY">Tuesday</mat-option>
                <mat-option value="WEDNESDAY">Wednesday</mat-option>
                <mat-option value="THURSDAY">Thursday</mat-option>
                <mat-option value="FRIDAY">Friday</mat-option>
              </mat-select>
            </td>
            <td style="min-width: 300px;">
              <mat-form-field appearance="outline" style="width: 100%;">
                <mat-label>Course</mat-label>
                <mat-select [(ngModel)]="entry.courseId" [name]="'course_' + i" required>
                  <mat-option *ngFor="let c of filteredCourses" [value]="c.id">
                    {{ c.name }} ({{ c.code }}) — {{ c.ectsPoints }} ECTS
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </td>
            <td style="min-width: 140px;">
              <input type="time" [(ngModel)]="entry.startTime" [name]="'start_' + i" required>
            </td>
            <td style="min-width: 140px;">
              <input type="time" [(ngModel)]="entry.endTime" [name]="'end_' + i" required>
            </td>
            <td><input [(ngModel)]="entry.location" [name]="'loc_' + i"></td>
            <td><input [(ngModel)]="entry.description" [name]="'desc_' + i"></td>
            <td>
              <button mat-icon-button color="warn" (click)="removeScheduleEntry(i)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="actions" style="margin-top: 20px;">
      <button mat-raised-button color="primary" (click)="saveScheduleEntries()">
        Save All Entries
      </button>
    </div>
  </mat-dialog-content>
</ng-template>

<ng-template #scheduleViewerDialog>
  <h2 mat-dialog-title>
    <button mat-icon-button (click)="closeScheduleViewer()">
      <mat-icon>arrow_back</mat-icon>
    </button>
    Full Weekly Schedule: {{ currentWeeklySchedule?.programName }} - Year {{ currentWeeklySchedule?.year }}
  </h2>
  <mat-dialog-content>
    <div *ngIf="scheduleEntries.length === 0" style="text-align: center; padding: 60px; color: #999;">
      No classes scheduled yet.
    </div>

    <div *ngIf="scheduleEntries.length > 0" style="overflow-x: auto;">
      <table class="timetable" style="width: 100%; border-collapse: collapse; min-width: 900px;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="width: 120px; text-align: left; padding: 12px;">Time</th>
            <th style="padding: 12px;">Monday</th>
            <th style="padding: 12px;">Tuesday</th>
            <th style="padding: 12px;">Wednesday</th>
            <th style="padding: 12px;">Thursday</th>
            <th style="padding: 12px;">Friday</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let slot of timeSlots">
            <td style="padding: 12px; font-weight: bold; background: #fafafa;">
              {{ slot.start }} – {{ slot.end }}
            </td>
            <td *ngFor="let day of days" style="padding: 8px; vertical-align: top; min-height: 80px; border: 1px solid #eee;">
              <div *ngFor="let entry of getEntriesForSlotAndDay(slot.start, day)" 
                   class="schedule-block"
                   [style.background-color]="getCourseColor(entry.courseId)">
                <strong>{{ getCourseName(entry.courseId) }}</strong><br>
                <small>{{ entry.startTime }} – {{ entry.endTime }}</small><br>
                <small *ngIf="entry.location">@ {{ entry.location }}</small>
              </div>
              <div *ngIf="!getEntriesForSlotAndDay(slot.start, day).length" class="empty-slot">
                —
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </mat-dialog-content>
</ng-template>
  `,
  styles: [`
    .dashboard-header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 0 0 20px 20px; }
    .welcome { margin: 10px 0 0; font-size: 1.3rem; }
    .loading-spinner { text-align: center; padding: 80px; }
    .dashboard-grid { padding: 30px; display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); max-width: 1400px; margin: 0 auto; }
    .action-card { cursor: pointer; transition: all 0.3s; height: 100%; }
    .action-card:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important; }
    .full-width-card { grid-column: 1 / -1; }
    .icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; }
    .manage { background: #1976d2; } .notify { background: #f57c00; } .schedule { background: #d32f2f; }
    .content { background: #388e3c; } .terms { background: #6d4c41; }

    .student-management { padding: 20px; }
    .search-bar { width: 100%; margin-bottom: 20px; }
    .year-select { width: 130px; }
    .chip { padding: 6px 12px; border-radius: 20px; font-weight: 500; font-size: 0.85rem; background: #e3f2fd; color: #1976d2; }
    .chip-empty { background: #ffebee; color: #c62828; }
    .course-list { max-height: 120px; overflow-y: auto; }
    .course-item { font-size: 0.85rem; padding: 2px 0; }
    .course-item small { color: #666; }
    .small-btn { margin: 4px; font-size: 0.8rem; line-height: 28px; }
    .subtitle { font-size: 0.8rem; color: #666; }
    .text-muted { color: #999; font-style: italic; }
    .actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    .form-box { background: #f9f9f9; padding: 24px; border-radius: 12px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .date-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .active-badge { background: #4caf50; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; margin-left: 8px; font-weight: bold; }

    .term-schedule-manager { padding: 20px; }
.term-selector { margin-bottom: 20px; }
.date-time-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.course-chip {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin: 2px 0;
  display: inline-block;
}
.full-width { width: 100%; }
.course-chip {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.8rem;
  display: inline-block;
  margin: 2px 4px 2px 0;
  font-weight: 500;
}
.class-schedule { background: #7b1fa2; }
.role-chip {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.8rem;
}
.role-student { background: #e3f2fd; color: #1976d2; }
.role-teacher { background: #e8f5e8; color: #388e3c; }
.role-staff   { background: #fff3e0; color: #f57c00; }
.role-admin   { background: #ffebee; color: #d32f2f; }

.role-select { width: 140px; }
.user-role-management { padding: 20px; }
.empty-state { text-align: center; padding: 60px; color: #999; }
.empty-state mat-icon { font-size: 60px; width: 60px; height: 60px; opacity: 0.3; }
.roles { background: #9c27b0; }

.edit-student-dialog {
  padding: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-grid .actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}
.full-width { width: 100%; }
.date-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

  .upload-container {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    min-height: 200px;
    transition: all 0.3s;
    margin: 20px 0;
  }
  .upload-container.drag-over {
    border-color: #1976d2;
    background: #e3f2fd;
  }
  .upload-icon {
    font-size: 64px;
    height: 64px;
    width: 64px;
    color: #757575;
    margin-bottom: 16px;
  }
  .file-info {
    margin-top: 20px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 4px;
  }
  .error-message {
    margin-top: 16px;
    color: #d32f2f;
    font-weight: 500;
  }
  `]

  
})
export class StaffDashboardComponent implements OnInit {
  @ViewChild('enrollCourse') enrollCourse!: TemplateRef<any>;
  @ViewChild('enrollProgram') enrollProgram!: TemplateRef<any>;
  @ViewChild('notification') notification!: TemplateRef<any>;
  @ViewChild('schedule') schedule!: TemplateRef<any>;
  @ViewChild('content') content!: TemplateRef<any>;
  @ViewChild('studentManagementDialog') studentManagementDialog!: TemplateRef<any>;
  @ViewChild('userRoleManagementDialog') userRoleManagementDialog!: TemplateRef<any>;
  @ViewChild('classScheduleManagementDialog') classScheduleManagementDialog!: TemplateRef<any>;
  @ViewChild('scheduleEntryEditorDialog') scheduleEntryEditorDialog!: TemplateRef<any>;
  @ViewChild('scheduleViewerDialog') scheduleViewerDialog!: TemplateRef<any>;

days: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
timeSlots: { start: string; end: string }[] = [];
courseColors: { [courseId: number]: string } = {};

  user: User | null = null;
  isLoading = true;
  students: User[] = [];
  courses: Course[] = [];
  studyPrograms: StudyProgram[] = [];
  syllabuses: Syllabus[] = [];
  schedules: Schedule[] = [];
  customContent: CustomContent[] = [];


  showScheduleForm = false;
  showContentForm = false;

  enrollment = { course: { studentId: 0, courseId: 0 }, studyProgram: { studentId: 0, studyProgramId: 0 } };
  newNotification: Notification = { title: '', message: '', recipientRole: 'ALL' };
  newSchedule: Schedule = { syllabusId: 0, scheduleDetails: '' };
  newCustomContent: CustomContent = { title: '', content: '' };
  searchParams = { query: '' };

  terms: Term[] = [];
  editingTerm: Term | null = null;
  showTermForm = false;
  termFormData: Term = {
    name: '',
    startDate: '',
    endDate: '',
    enrollmentStart: '',
    enrollmentEnd: '',
    active: false,
    description: ''
  };

  selectedEditStudent: User | null = null;
  yearEnrollment = {
  indexNumber: '',
  yearOfEnrollment: 1,
  dateOfEnrollment: '',
  studyProgramId: 0 as number
};
courseToAdd: number | null = null;

@ViewChild('editStudentDialog') editStudentDialog!: TemplateRef<any>;

roleConfirmUser: User | null = null;
newRoleTemp: string = '';
@ViewChild('roleConfirmDialog') roleConfirmDialog!: TemplateRef<any>;
  
weeklySchedules: WeeklySchedule[] = [];
newWeeklySchedule = { studyProgramId: 0 as number, year: 1 };

currentWeeklySchedule: { id?: number; programName?: string; year?: number } = {};
scheduleEntries: ScheduleEntry[] = [];
filteredCourses: Course[] = [];
yearEnrollments: any[] = []; 
today: string = new Date().toISOString().split('T')[0]; 
  customContentColumns: string[] = ['title', 'content', 'actions'];
  studentColumns: string[] = ['name', 'indexNumber', 'courses', 'studyProgram'];

  filteredStudents: User[] = [];
  searchQuery = '';
  highestYearMap: { [userId: number]: number } = {};
  selectedStudent: User | null = null;

 
newTermSchedule: TermSchedule = {
  name: '',
  termId: 0,
  date: '',
  startTime: '',
  location: '',
  courseIds: []
};
showTermScheduleForm = false;


termSchedules: any[] = [];
selectedTermId: number | null = null;
scheduleColumns: string[] = ['name', 'course', 'date', 'startTime', 'endTime', 'location', 'actions'];

viewTermId: number | null = null;
viewSchedules: TermSchedule[] = [];
viewColumns: string[] = ['name', 'courses', 'date', 'time', 'actions'];

allUsers: User[] = [];
filteredAllUsers: User[] = [];
userSearchQuery = '';

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
  this.user = this.apiService.getCurrentUser();
  if (!this.user || this.user.role !== 'STAFF') {
    this.snackBar.open('Access denied', 'Close', { duration: 3000 });
    return;
  }

  this.loadData();
  this.loadAllUsers();
  this.loadHighestYears();
}

  private loadData(): void {

    this.apiService.getStudentsByRole('STUDENT').subscribe({
      next: (students: User[]) => {
        this.students = students.filter(student => student.role === 'STUDENT');
        console.log('Filtered students loaded:', this.students);
        this.loadHighestYears();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading students:', error);
        this.snackBar.open('Failed to load students', 'Close', { duration: 3000 });
      }
      
    });


    this.apiService.getCourses().subscribe({
      next: (courses: Course[]) => {
        this.courses = courses;
        console.log('Courses loaded:', courses);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
        this.snackBar.open('Failed to load courses', 'Close', { duration: 3000 });
      }
    });

  
    this.apiService.getStudyPrograms().subscribe({
      next: (programs: StudyProgram[]) => {
        this.studyPrograms = programs;
        console.log('Study programs loaded:', programs);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading study programs:', error);
        this.snackBar.open('Failed to load study programs', 'Close', { duration: 3000 });
      }
    });


    this.apiService.getSyllabuses().subscribe({
      next: (syllabuses: Syllabus[]) => {
        this.syllabuses = syllabuses;
        console.log('Syllabuses loaded:', syllabuses);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading syllabuses:', error);
        this.snackBar.open('Failed to load syllabuses', 'Close', { duration: 3000 });
      }
    });


    this.apiService.getSchedules().subscribe({
      next: (schedules: Schedule[]) => {
        this.schedules = schedules;
        console.log('Schedules loaded:', schedules);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading schedules:', error);
        this.snackBar.open('Failed to load schedules', 'Close', { duration: 3000 });
      }
    });


    this.apiService.getCustomContent().subscribe({
      next: (content: CustomContent[]) => {
        this.customContent = content;
        console.log('Custom content loaded:', content);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading custom content:', error);
        this.snackBar.open('Failed to load custom content', 'Close', { duration: 3000 });
      }
    });

    this.apiService.getTerms().subscribe({
      next: (terms) => {
        this.terms = terms;
        this.cdr.detectChanges();
      },
      error: () => this.snackBar.open('Failed to load terms', 'Close', { duration: 4000 })
    });
    this.filteredStudents = [...this.students];
    this.isLoading = false;
  }

  enrollInCourse(): void {
    if (this.enrollment.course.studentId && this.enrollment.course.courseId) {
      this.apiService.enrollStudentInCourse(this.enrollment.course.studentId, this.enrollment.course.courseId).subscribe({
        next: () => {
          this.snackBar.open('Student enrolled in course', 'Close', { duration: 3000 });
          this.enrollment.course = { studentId: 0, courseId: 0 };
          this.loadData(); 
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error enrolling student in course:', error);
          this.snackBar.open('Failed to enroll student in course', 'Close', { duration: 3000 });
        }
      });
    }
  }

  enrollInStudyProgram(): void {
    if (this.enrollment.studyProgram.studentId && this.enrollment.studyProgram.studyProgramId) {
      this.apiService.enrollStudentInStudyProgram(this.enrollment.studyProgram.studentId, this.enrollment.studyProgram.studyProgramId).subscribe({
        next: () => {
          this.snackBar.open('Student enrolled in study program', 'Close', { duration: 3000 });
          this.enrollment.studyProgram = { studentId: 0, studyProgramId: 0 };
          this.loadData(); 
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error enrolling student in study program:', error);
          this.snackBar.open('Failed to enroll student in study program', 'Close', { duration: 3000 });
        }
      });
    }
  }

  createNotification(): void {
    if (this.newNotification.title && this.newNotification.message && this.newNotification.recipientRole) {
      this.apiService.createNotification(this.newNotification).subscribe({
        next: () => {
          this.snackBar.open('Notification created', 'Close', { duration: 3000 });
          this.newNotification = { title: '', message: '', recipientRole: 'ALL' };
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error creating notification:', error);
          this.snackBar.open('Failed to create notification', 'Close', { duration: 3000 });
        }
      });
    }
  }

  createSchedule(): void {
    if (this.newSchedule.syllabusId && this.newSchedule.scheduleDetails) {
      this.apiService.createSchedule(this.newSchedule).subscribe({
        next: (schedule: Schedule) => {
          this.schedules.push(schedule);
          this.snackBar.open('Schedule created', 'Close', { duration: 3000 });
          this.newSchedule = { syllabusId: 0, scheduleDetails: '' };
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error creating schedule:', error);
          this.snackBar.open('Failed to create schedule', 'Close', { duration: 3000 });
        }
      });
    }
  }

  createCustomContent(): void {
    if (this.newCustomContent.title && this.newCustomContent.content) {
      this.apiService.createCustomContent(this.newCustomContent).subscribe({
        next: (content: CustomContent) => {
          this.customContent.push(content);
          this.snackBar.open('Custom content created', 'Close', { duration: 3000 });
          this.newCustomContent = { title: '', content: '' };
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error creating custom content:', error);
          this.snackBar.open('Failed to create custom content', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteCustomContent(id: number): void {
    this.apiService.deleteCustomContent(id).subscribe({
      next: () => {
        this.customContent = this.customContent.filter(content => content.id !== id);
        this.snackBar.open('Custom content deleted', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error deleting custom content:', error);
        this.snackBar.open('Failed to delete custom content', 'Close', { duration: 3000 });
      }
    });
  }


  getEnrolledCourses(student: User): string {
    return student.enrolledCourses?.length
      ? student.enrolledCourses.map(c => c.name).join(', ')
      : 'None';
  }

  search(): void {
    const query = this.searchParams.query.trim();
    this.apiService.getStudentsByQuery(query).subscribe({
      next: (students: User[]) => {
        this.students = students;
        console.log('Search results:', this.students);
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error searching students:', error);
        this.snackBar.open('Failed to search students', 'Close', { duration: 3000 });
      }
    });
  }
  openDialog(type: string): void {
    const templates: Record<string, TemplateRef<any>> = {
      enrollCourse: this.enrollCourse,
      enrollProgram: this.enrollProgram,
      notification: this.notification,
      schedule: this.schedule,
      content: this.content
    };
    this.dialog.open(templates[type], { width: '90vw', maxWidth: '1000px', maxHeight: '90vh' });
  }

  openTermForm(): void {
    this.editingTerm = null;
    this.termFormData = { name: '', startDate: '', endDate: '', active: false };
    this.showTermForm = true;
  }

  editTerm(term: Term): void {
    this.editingTerm = term;
    this.termFormData = { ...term };
    this.showTermForm = true;
  }

  saveTerm(): void {
  if (!this.termFormData.name || !this.termFormData.startDate || !this.termFormData.endDate) {
    this.snackBar.open('Please fill Term Name, Start Date and End Date', 'Error', { duration: 5000 });
    return;
  }

  const start = new Date(this.termFormData.startDate);
  const end = new Date(this.termFormData.endDate);

  if (start >= end) {
    this.snackBar.open('Start date must be before end date', 'Error', { duration: 5000 });
    return;
  }

  const year = start.getFullYear();
  if (year < 2020 || year > 2050) {
    this.snackBar.open('Year must be between 2020 and 2050', 'Error', { duration: 5000 });
    return;
  }

  const enrollmentStart = new Date(start);
  enrollmentStart.setDate(start.getDate() - 5);

  const enrollmentEnd = new Date(end);
  enrollmentEnd.setDate(end.getDate() - 5);

  const termData: Term = {
    ...this.termFormData,
    enrollmentStart: enrollmentStart.toISOString().split('T')[0],
    enrollmentEnd: enrollmentEnd.toISOString().split('T')[0]
  };

  if (this.editingTerm) {
    this.apiService.updateTerm(this.editingTerm.id!, termData).subscribe({
      next: () => {
        this.snackBar.open('Term updated successfully!', 'Close', { duration: 3000 });
        this.loadTerms();
        this.cancelTermForm();
      },
      error: () => this.snackBar.open('Update failed', 'Close', { duration: 5000 })
    });
  } else {
    this.apiService.createTerm(termData).subscribe({
      next: () => {
        this.snackBar.open('Term created successfully!', 'Close', { duration: 3000 });
        this.loadTerms();
        this.cancelTermForm();
      },
      error: () => this.snackBar.open('Create failed', 'Close', { duration: 5000 })
    });
  }
}

  deleteTerm(id: number): void {
    if (confirm('Delete this term? This cannot be undone.')) {
      this.apiService.deleteTerm(id).subscribe({
        next: () => {
          this.snackBar.open('Term deleted', 'Close', { duration: 3000 });
          this.loadTerms();
        }
      });
    }
  }

  cancelTermForm(): void {
    this.showTermForm = false;
    this.editingTerm = null;
    this.termFormData = { name: '', startDate: '', endDate: '', active: false };
  }

  loadTerms(): void {
    this.apiService.getTerms().subscribe({
      next: (terms) => this.terms = terms,
      error: () => this.snackBar.open('Failed to load terms', 'Close')
    });
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB');
  }

  openStudentManagement(): void {
    this.dialog.open(this.studentManagementDialog, { width: '95vw', maxWidth: '1500px', height: '85vh' });
  }

  openEnrollCourse(student: User): void {
    this.selectedStudent = student;
    this.enrollment.course.studentId = student.id!;
    this.dialog.open(this.enrollCourse, { width: '600px' });
  }

  openEnrollProgram(student: User): void {
    this.selectedStudent = student;
    this.enrollment.studyProgram.studentId = student.id!;
    this.dialog.open(this.enrollProgram, { width: '600px' });
  }

  filterStudents(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredStudents = [...this.students];
      return;
    }
    this.filteredStudents = this.students.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      (s.indexNumber?.toLowerCase().includes(q)) ||
      s.email.toLowerCase().includes(q)
    );
  }

  getHighestYear(userId: number): number | null {
    return this.highestYearMap[userId] || null;
  }

  private loadHighestYears(): void {
    this.students.forEach(student => {
      this.apiService.getAppliedYearsByUser(student.id!).subscribe({
        next: (years) => {
          if (years.length > 0) {
            this.highestYearMap[student.id!] = Math.max(...years.map(y => y.year));
          }
        },
        error: () => this.highestYearMap[student.id!] = 0
      });
    });
  }

  setStudentYear(student: User, year: number | null): void {
    if (!student.studyProgram?.id) {
      this.snackBar.open('Assign a program first', 'Error', { duration: 5000 });
      return;
    }

    if (year === null) {
      this.apiService.getAppliedYearsByUser(student.id!).subscribe(years => {
        years.forEach(ay => this.apiService.deleteAppliedYear(ay.id!).subscribe());
        delete this.highestYearMap[student.id!];
        this.snackBar.open('Year removed', 'OK');
      });
      return;
    }

    const appliedYear: AppliedYear = {
      year: year,
      requiredEcts: 60,
      studyProgramId: student.studyProgram!.id!,
      userId: student.id!
    };

    this.apiService.createAppliedYear(appliedYear).subscribe({
      next: () => {
        this.highestYearMap[student.id!] = year;
        this.snackBar.open(`Now in Year ${year}`, 'Success');
      }
    });
  }

  loadTermSchedules(): void {
  if (!this.selectedTermId) {
    this.termSchedules = [];
    return;
  }
  this.apiService.getTermSchedulesByTerm(this.selectedTermId).subscribe({
    next: (schedules) => {
      this.termSchedules = schedules;
      this.cdr.detectChanges();
    },
    error: () => this.snackBar.open('Failed to load term schedules', 'Close')
  });
}

createTermSchedule(): void {
  if (!this.newTermSchedule.name || !this.newTermSchedule.date || !this.newTermSchedule.startTime) return;

  this.apiService.createTermSchedule(this.newTermSchedule).subscribe({
    next: (created) => {
      this.termSchedules.push(created);
      this.snackBar.open('Schedule entry created!', 'Close', { duration: 3000 });
      this.newTermSchedule = {
        name: '',
        termId: this.selectedTermId!,
        date: '',
        startTime: '',
        location: '',
        courseIds: []
      };
      this.cdr.detectChanges();
    },
    error: () => this.snackBar.open('Failed to create schedule', 'Close')
  });
}

deleteTermSchedule(id: number): void {
  if (confirm('Delete this schedule entry?')) {
    this.apiService.deleteTermSchedule(id).subscribe({
      next: () => {
        this.termSchedules = this.termSchedules.filter(s => s.id !== id);
        this.snackBar.open('Schedule deleted', 'Close');
      }
    });
  }
}

onTermSelected(): void {
  if (!this.selectedTermId) {
    this.termSchedules = [];
    return;
  }

  this.apiService.getTermSchedulesByTerm(this.selectedTermId!).subscribe({
    next: (schedules) => {
      this.termSchedules = schedules.map(s => ({
        id: s.id,
        name: s.name || '',
        courseId: s.courses?.[0]?.id || null,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime || '',
        location: s.location || ''
      }));
    },
    error: () => this.snackBar.open('Failed to load schedules', 'Close')
  });
}

addEmptyRow(): void {
  this.termSchedules.push({
    id: null,
    name: 'New Lecture',
    courseId: null,
    date: '',
    startTime: '',
    endTime: '',
    location: ''
  });
  this.cdr.detectChanges();
}

removeRow(index: number): void {
  this.termSchedules.splice(index, 1);
}

saveAll(): void {
  if (!this.selectedTermId) {
    this.snackBar.open('Please select a term first', 'Warning', { duration: 6000 });
    return;
  }

  const selectedTerm = this.terms.find(t => t.id === this.selectedTermId);
  if (!selectedTerm || !selectedTerm.startDate || !selectedTerm.endDate) {
    this.snackBar.open('Selected term has invalid dates', 'Error', { duration: 6000 });
    return;
  }

  const termStart = new Date(selectedTerm.startDate);
  const termEnd = new Date(selectedTerm.endDate);
  termEnd.setHours(23, 59, 59); 

  const invalidRows: string[] = [];

  const validRows = this.termSchedules.filter((row, index) => {
    let valid = true;
    let errorMsg = `Row ${index + 1}: `;

    if (!row.name?.trim()) {
      valid = false;
      errorMsg += 'Name required. ';
    }
    if (!row.courseId) {
      valid = false;
      errorMsg += 'Course required. ';
    }
    if (!row.date) {
      valid = false;
      errorMsg += 'Date required. ';
    }
    if (!row.startTime) {
      valid = false;
      errorMsg += 'Start time required. ';
    }

    if (row.date) {
      const scheduleDate = new Date(row.date);
      if (scheduleDate < termStart || scheduleDate > termEnd) {
        valid = false;
        errorMsg += `Date must be between ${this.formatDate(selectedTerm.startDate)} and ${this.formatDate(selectedTerm.endDate)}. `;
      }
    }

    if (row.startTime && row.endTime) {
      if (row.startTime >= row.endTime) {
        valid = false;
        errorMsg += 'Start time must be before End time. ';
      }
    }

    if (!valid) {
      invalidRows.push(errorMsg);
    }

    return valid;
  });

  if (invalidRows.length > 0) {
    this.snackBar.open('Please fix the following errors:', 'Error', { duration: 10000 });
    setTimeout(() => {
      invalidRows.forEach(msg => this.snackBar.open(msg, 'Close', { duration: 8000 }));
    }, 1000);
    return;
  }

  if (validRows.length === 0) {
    this.snackBar.open('No valid schedule rows to save', 'Warning', { duration: 6000 });
    return;
  }

  const requests = validRows.map(row => {
    const payload: any = {
      name: row.name.trim(),
      termId: this.selectedTermId!,
      date: row.date,
      startTime: row.startTime,
      endTime: row.endTime || null,
      location: row.location?.trim() || null,
      courses: [{ id: row.courseId }]
    };

    return row.id
      ? this.apiService.updateTermSchedule(row.id, payload)
      : this.apiService.createTermSchedule(payload);
  });

  forkJoin(requests).subscribe({
    next: () => {
      this.snackBar.open(`${validRows.length} schedule(s) saved successfully!`, 'Success', { duration: 6000 });
      this.onTermSelected(); 
    },
    error: (err) => {
      console.error('Save failed:', err);
      this.snackBar.open('Failed to save schedules – check console', 'Error', { duration: 10000 });
    }
  });
}

addNewScheduleRow(): void {
  const newRow: TermScheduleEditable = {
    id: undefined,
    name: '',
    termId: this.selectedTermId!,
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    courseIds: [],
    courses: [],
    courseId: null 
  };

  this.termSchedules.push(newRow);
  this.cdr.detectChanges();
}

removeScheduleRow(index: number): void {
  const schedule = this.termSchedules[index];
  if (schedule.id) {
    this.apiService.deleteTermSchedule(schedule.id).subscribe(() => {
      this.termSchedules.splice(index, 1);
      this.cdr.detectChanges();
    });
  } else {
    this.termSchedules.splice(index, 1);
    this.cdr.detectChanges();
  }
}

saveAllSchedules(): void {
  if (!this.selectedTermId) return;

 
  const validSchedules = this.termSchedules.filter(s =>
    s.courseId &&          
    s.date &&               
    s.startTime &&         
    (s.name?.trim() || true) 
  );

  if (validSchedules.length === 0) {
    this.snackBar.open('Please fill in at least one complete row (Course + Date + Time)', 'OK', { duration: 6000 });
    return;
  }

  const requests = validSchedules.map(schedule => {
    const payload: TermSchedule = {
      id: schedule.id,
      name: schedule.name?.trim() || `Lecture - ${this.courses.find(c => c.id === schedule.courseId)?.name || 'Course'} (${schedule.date})`,
      termId: this.selectedTermId!,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime || undefined,
      location: schedule.location?.trim() || undefined,
      courseIds: [schedule.courseId!]  
    };

    return schedule.id
      ? this.apiService.updateTermSchedule(schedule.id, payload)
      : this.apiService.createTermSchedule(payload);
  });

  forkJoin(requests).subscribe({
    next: () => {
      this.snackBar.open(`${validSchedules.length} schedule(s) saved successfully!`, 'Success', { duration: 5000 });
      this.onTermSelected(); 
    },
    error: (err) => {
      console.error('Save error:', err);
      this.snackBar.open('Save failed — check console', 'Error', { duration: 8000 });
    }
  });
}

onCourseChange(row: any, courseId: number): void {
  row.courseId = courseId;
  console.log('Course selected:', courseId, 'Row now:', row);
}


trackByIndex(index: number): number {
  return index;
}

loadViewSchedules(): void {
  if (!this.viewTermId) {
    this.viewSchedules = [];
    return;
  }

  this.apiService.getTermSchedulesByTerm(this.viewTermId).subscribe({
    next: (schedules) => {
      this.viewSchedules = schedules;
      this.cdr.detectChanges();
    },
    error: () => {
      this.snackBar.open('Failed to load schedules', 'Close', { duration: 5000 });
    }
  });
}

getTermName(termId: number): string {
  return this.terms.find(t => t.id === termId)?.name || 'Unknown Term';
}

deleteScheduleFromView(id: number): void {
  if (!confirm('Delete this schedule permanently?')) return;

  this.apiService.deleteTermSchedule(id).subscribe({
    next: () => {
      this.viewSchedules = this.viewSchedules.filter(s => s.id !== id);
      this.snackBar.open('Schedule deleted', 'OK', { duration: 4000 });

      if (this.selectedTermId === this.viewTermId) {
        this.onTermSelected();
      }
    },
    error: () => this.snackBar.open('Delete failed', 'Error')
  });
}

loadAllUsers(): void {
  this.apiService.getAllUsers().subscribe({
    next: (users) => {
      this.allUsers = users;
      this.filteredAllUsers = [...users];
      this.cdr.detectChanges();
    },
    error: () => this.snackBar.open('Failed to load users', 'Close')
  });
}

filterAllUsers(): void {
  const q = this.userSearchQuery.toLowerCase().trim();
  if (!q) {
    this.filteredAllUsers = [...this.allUsers];
    return;
  }
  this.filteredAllUsers = this.allUsers.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.username.toLowerCase().includes(q) ||
    (u.indexNumber?.toLowerCase().includes(q))
  );
}

updateUserRole(user: User, newRole: string): void {
  if (user.role === newRole) return;

  const originalRole = user.role;

  user.role = newRole;

  this.apiService.updateUser({ ...user, role: newRole }).subscribe({
    next: () => {
      this.snackBar.open(
        `${user.firstName} ${user.lastName} is now ${newRole}!`,
        'Success',
        { duration: 4000, panelClass: ['success-snackbar'] }
      );

      const idx = this.allUsers.findIndex(u => u.id === user.id);
      if (idx > -1) this.allUsers[idx] = { ...user };
    },
    error: (err) => {

      user.role = originalRole;
      this.snackBar.open(
        'Failed to update role: ' + (err.error?.message || err.message),
        'Error',
        { duration: 8000, panelClass: ['error-snackbar'] }
      );
      this.cdr.detectChanges();
    }
  });
}

openUserRoleManagement(): void {
  this.dialog.open(this.userRoleManagementDialog, {
    width: '95vw',
    maxWidth: '1200px',
    height: '85vh'
  });
}


addCourseToStudent(): void {
  if (!this.selectedEditStudent || !this.courseToAdd) return;

  this.apiService.enrollStudentInCourse(this.selectedEditStudent.id!, this.courseToAdd).subscribe({
    next: () => {
      this.snackBar.open('Course added!', 'Success');
      this.courseToAdd = null;

    },
    error: () => this.snackBar.open('Failed to add course', 'Error')
  });
}

saveIndexNumber(): void {
  if (!this.selectedEditStudent) return;

  this.apiService.updateUser(this.selectedEditStudent).subscribe({
    next: () => {
      this.snackBar.open('Index number updated!', 'Success');
    },
    error: () => this.snackBar.open('Update failed', 'Error')
  });
}

openRoleConfirmDialog(user: User): void {
  this.roleConfirmUser = user;
  this.newRoleTemp = user.role;
  this.dialog.open(this.roleConfirmDialog);
}

confirmRoleChange(): void {
  if (!this.roleConfirmUser || this.newRoleTemp === this.roleConfirmUser.role) {
    this.dialog.closeAll();
    return;
  }
  this.updateUserRole(this.roleConfirmUser, this.newRoleTemp);
  this.dialog.closeAll();
}


getCurrentEnrollmentYear(userId: number): number | null {
  return this.highestYearMap[userId] || null;
}

getCurrentProgramName(userId: number): string {
  const student = this.students.find(s => s.id === userId);
  return student?.studyProgram?.name || '';
}

removeCourseFromStudent(courseId: number): void {
  if (!this.selectedEditStudent) return;

  this.apiService.removeCourseEnrollment(this.selectedEditStudent.id!, courseId).subscribe({
    next: () => {
      this.selectedEditStudent!.enrolledCourses = this.selectedEditStudent!.enrolledCourses?.filter(c => c.id !== courseId);
      this.snackBar.open('Course removed', 'OK', { duration: 3000 });
    },
    error: () => this.snackBar.open('Failed to remove course', 'Error')
  });
}

openEditStudent(student: User): void {
  this.selectedEditStudent = { ...student };
  this.yearEnrollment = {
    indexNumber: student.indexNumber || '',
    yearOfEnrollment: 1,
    dateOfEnrollment: this.today, 
    studyProgramId: student.studyProgram?.id || 0
  };
  this.courseToAdd = null;

  this.loadYearEnrollments(student.indexNumber || '');

  this.dialog.open(this.editStudentDialog, { width: '900px' });
}

loadYearEnrollments(indexNumber: string): void {
  if (!indexNumber) {
    this.yearEnrollments = [];
    return;
  }
  this.apiService.getYearEnrollmentsByIndex(indexNumber).subscribe({
    next: (enrollments) => {
      this.yearEnrollments = enrollments;
      this.cdr.detectChanges();
    },
    error: () => {
      this.snackBar.open('Failed to load year enrollments', 'Close', { duration: 4000 });
      this.yearEnrollments = [];
    }
  });
}

getProgramName(programId: number): string {
  const program = this.studyPrograms.find(p => p.id === programId);
  return program ? program.name : 'Unknown';
}

saveYearEnrollment(): void {
  if (!this.selectedEditStudent || !this.yearEnrollment.studyProgramId || !this.yearEnrollment.dateOfEnrollment) {
    this.snackBar.open('Please fill all fields', 'Error', { duration: 4000 });
    return;
  }

  const payload = {
    indexNumber: this.selectedEditStudent.indexNumber || '',
    yearOfEnrollment: this.yearEnrollment.yearOfEnrollment,
    dateOfEnrollment: this.yearEnrollment.dateOfEnrollment,
    studyProgramId: this.yearEnrollment.studyProgramId
  };

  this.apiService.createYearEnrollment(payload).subscribe({
    next: (created) => {
      this.snackBar.open('Year enrollment saved!', 'Success', { duration: 4000 });
      this.loadYearEnrollments(payload.indexNumber); 
      this.yearEnrollment.yearOfEnrollment = 1;
      this.yearEnrollment.dateOfEnrollment = this.today;
      this.yearEnrollment.studyProgramId = 0;
    },
    error: () => this.snackBar.open('Failed to save year enrollment', 'Error', { duration: 5000 })
  });
}

deleteYearEnrollment(id: number): void {
  if (!confirm('Delete this year enrollment?')) return;

  this.apiService.deleteYearEnrollment(id).subscribe({
    next: () => {
      this.yearEnrollments = this.yearEnrollments.filter(e => e.id !== id);
      this.snackBar.open('Year enrollment deleted', 'OK', { duration: 3000 });
    },
    error: () => this.snackBar.open('Failed to delete', 'Error')
  });
}

openClassScheduleManagement(): void {
  this.loadWeeklySchedules();
  this.dialog.open(this.classScheduleManagementDialog, {
  width: '90vw',
  maxWidth: '1000px',
  height: '80vh',
  id: 'class-schedule-management'
});
}

loadWeeklySchedules(): void {
  this.apiService.getWeeklySchedules().subscribe({
    next: (schedules) => this.weeklySchedules = schedules,
    error: () => this.snackBar.open('Failed to load schedules', 'Close')
  });
}

createWeeklySchedule(): void {
  if (!this.newWeeklySchedule.studyProgramId) return;

  this.apiService.createWeeklySchedule(this.newWeeklySchedule).subscribe({
    next: (created) => {
      this.weeklySchedules.push(created);
      this.snackBar.open('Weekly schedule created!', 'Success', { duration: 4000 });
      this.newWeeklySchedule = { studyProgramId: 0, year: 1 };
    },
    error: () => this.snackBar.open('Failed to create schedule', 'Error')
  });
}

deleteWeeklySchedule(id: number): void {
  if (!confirm('Delete this weekly schedule and all its entries?')) return;
  this.apiService.deleteWeeklySchedule(id).subscribe({
    next: () => {
      this.weeklySchedules = this.weeklySchedules.filter(s => s.id !== id);
      this.snackBar.open('Schedule deleted', 'OK');
    }
  });
}

openScheduleEditor(schedule: WeeklySchedule): void {
  if (!schedule.id) {
    this.snackBar.open('Invalid schedule', 'Error');
    return;
  }

  const program = this.studyPrograms.find(p => p.id === schedule.studyProgramId);
  this.currentWeeklySchedule = {
    id: schedule.id,
    programName: program?.name || 'Unknown',
    year: schedule.year
  };


  this.filteredCourses = this.courses.filter(c =>
    c.studyProgramId === schedule.studyProgramId &&
    (c.studyYear === schedule.year || c.studyYear == null)
  );

  this.apiService.getScheduleEntriesBySchedule(schedule.id).subscribe({
    next: (entries) => {
      this.scheduleEntries = entries.map(e => ({
        ...e,
        dayOfWeek: e.dayOfWeek as any
      }));
      this.dialog.open(this.scheduleEntryEditorDialog, {
  width: '95vw',
  maxWidth: '1200px',
  height: '85vh',
  id: 'schedule-entry-editor'
});
    },
    error: () => this.snackBar.open('Failed to load entries', 'Error')
  });
}

addScheduleEntryRow(): void {
  this.scheduleEntries.push({
    courseId: 0,
    dayOfWeek: 'MONDAY',
    startTime: '',
    endTime: '',
    location: '',
    description: ''
  });
}

removeScheduleEntry(index: number): void {
  const entry = this.scheduleEntries[index];
  if (entry.id) {
    this.apiService.deleteScheduleEntry(entry.id).subscribe();
  }
  this.scheduleEntries.splice(index, 1);
}

saveScheduleEntries(): void {
  if (!this.currentWeeklySchedule.id) {
    this.snackBar.open('No schedule selected', 'Error', { duration: 6000 });
    return;
  }

  const valid = this.scheduleEntries.filter(e =>
    e.courseId &&
    e.dayOfWeek &&
    e.startTime &&
    e.endTime &&
    e.startTime < e.endTime
  );

  if (valid.length === 0) {
    this.snackBar.open('No valid entries to save', 'Warning', { duration: 6000 });
    return;
  }

  const requests = valid.map(entry => {
    const payload: any = {
      id: entry.id,
      courseId: entry.courseId,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      location: entry.location || null,
      description: entry.description || null,
      weeklySchedule: { id: this.currentWeeklySchedule.id! }
    };

    return entry.id
      ? this.apiService.updateScheduleEntry(entry.id, payload)
      : this.apiService.createScheduleEntry(payload);
  });

  forkJoin(requests).subscribe({
    next: () => {
      this.snackBar.open(`${valid.length} schedule entr${valid.length === 1 ? 'y' : 'ies'} saved!`, 'Success', { duration: 6000 });
      this.apiService.getScheduleEntriesBySchedule(this.currentWeeklySchedule.id!).subscribe({
        next: (entries) => this.scheduleEntries = entries
      });
    },
    error: () => this.snackBar.open('Save failed', 'Error', { duration: 8000 })
  });
}

private loadScheduleEntries(): void {
  if (this.currentWeeklySchedule.id) {
    this.apiService.getScheduleEntriesBySchedule(this.currentWeeklySchedule.id).subscribe({
      next: (entries) => this.scheduleEntries = entries
    });
  }
}
openScheduleViewer(schedule: WeeklySchedule): void {
  if (!schedule.id) return;

  const program = this.studyPrograms.find(p => p.id === schedule.studyProgramId);
  this.currentWeeklySchedule = {
    id: schedule.id,
    programName: program?.name || 'Unknown',
    year: schedule.year
  };

  this.apiService.getScheduleEntriesBySchedule(schedule.id).subscribe({
    next: (entries) => {
      this.scheduleEntries = entries;
      this.generateTimeSlots();
      this.assignCourseColors();
      this.dialog.open(this.scheduleViewerDialog, {
  width: '95vw',
  maxWidth: '1400px',
  height: '90vh',
  id: 'schedule-viewer' 
});
    }
  });
}

generateTimeSlots(): void {
  const slots = new Set<string>();
  this.scheduleEntries.forEach(e => {
    slots.add(e.startTime);
    slots.add(e.endTime);
  });

  const times = Array.from(slots).sort();
  this.timeSlots = [];

  for (let i = 0; i < times.length - 1; i++) {
    this.timeSlots.push({ start: times[i], end: times[i + 1] });
  }
  if (this.timeSlots.length === 0) {
    this.timeSlots = [
      { start: '08:00', end: '09:30' },
      { start: '09:45', end: '11:15' },
      { start: '11:30', end: '13:00' },
      { start: '13:15', end: '14:45' },
      { start: '15:00', end: '16:30' }
    ];
  }
}

getEntriesForSlotAndDay(startTime: string, day: string): ScheduleEntry[] {
  return this.scheduleEntries.filter(e =>
    e.dayOfWeek === day &&
    e.startTime === startTime
  );
}

assignCourseColors(): void {
  const colors = ['#e3f2fd', '#e8f5e8', '#fff3e0', '#fce4ec', '#f3e5f5', '#e0f7fa'];
  let colorIndex = 0;
  const usedIds = new Set<number>();

  this.scheduleEntries.forEach(entry => {
    if (!usedIds.has(entry.courseId)) {
      this.courseColors[entry.courseId] = colors[colorIndex % colors.length];
      colorIndex++;
      usedIds.add(entry.courseId);
    }
  });
}

getCourseColor(courseId: number): string {
  return this.courseColors[courseId] || '#f5f5f5';
}

getCourseName(courseId: number): string {
  const course = this.courses.find(c => c.id === courseId);
  return course ? `${course.name} (${course.code})` : 'Unknown Course';
}

closeScheduleEditor(): void {
  this.dialog.getDialogById('schedule-entry-editor')?.close();
}

closeScheduleViewer(): void {
  this.dialog.getDialogById('schedule-viewer')?.close();
}

exportStudentProfilePdf(student: User): void {
  if (!student?.id) {
    this.snackBar.open('Cannot export: Student ID missing', 'Close', { duration: 4000 });
    return;
  }

  this.apiService.downloadStudentProfilePdf(student.id).subscribe({
    next: (blob: Blob) => {

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${student.firstName}_${student.lastName}_Profile.pdf`;
      link.click();

      window.URL.revokeObjectURL(url);

      this.snackBar.open('Student profile PDF downloaded!', 'Close', { duration: 3000 });
    },
    error: (err) => {
      console.error('PDF download failed:', err);
      this.snackBar.open('Failed to download PDF', 'Close', { duration: 5000 });
    }
  });
}
exportStudentGradesPdf(student: User): void {
  if (!student?.id) {
    this.snackBar.open('Cannot export: Student ID missing', 'Close', { duration: 4000 });
    return;
  }

  const apiBaseUrl = 'http://localhost:8080';  // Use environment.apiUrl in prod
  const url = `${apiBaseUrl}/api/public/users/${student.id}/grades/pdf`;
  const fileName = `${student.firstName || 'Student'}_${student.lastName || 'Unknown'}_Exam_Grades.pdf`;

  fetch(url, {
    method: 'GET',
    credentials: 'same-origin'  // Adjust if needed
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    return response.blob();
  })
  .then(blob => {
    if (blob.size === 0) {
      this.snackBar.open('Empty PDF – no grades?', 'Close', { duration: 6000 });
      return;
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    this.snackBar.open('Grades PDF downloaded!', 'Close', { duration: 4000 });
  })
  .catch(error => {
    console.error('Download failed:', error);
    this.snackBar.open(`Failed: ${error.message || 'Network error'}`, 'Close', { duration: 6000 });
  });
}

// Add these class properties
selectedStudentForUpload: User | null = null;
selectedFile: File | null = null;
isDragging = false;
isUploading = false;
uploadError: string | null = null;

@ViewChild('xmlUploadDialog') xmlUploadDialog!: TemplateRef<any>;

// New method to open dialog
openXmlUploadDialog(student: User): void {
  this.selectedStudentForUpload = student;
  this.selectedFile = null;
  this.uploadError = null;
  this.isUploading = false;
  this.dialog.open(this.xmlUploadDialog, {
    width: '600px',
    disableClose: true
  });
}

// Drag & drop handlers
onDragOver(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  this.isDragging = true;
}

onDragLeave(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  this.isDragging = false;
}

onDrop(event: DragEvent): void {
  event.preventDefault();
  event.stopPropagation();
  this.isDragging = false;

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    this.handleFile(files[0]);
  }
}

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.handleFile(input.files[0]);
  }
}

private handleFile(file: File): void {
  if (!file.name.endsWith('.xml')) {
    this.uploadError = 'Please select an XML file';
    this.selectedFile = null;
    return;
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    this.uploadError = 'File too large (max 5MB)';
    this.selectedFile = null;
    return;
  }

  this.selectedFile = file;
  this.uploadError = null;
}

uploadXmlFile(): void {
  if (!this.selectedFile || !this.selectedStudentForUpload?.id) {
    this.snackBar.open('No file or student selected', 'Close', { duration: 4000 });
    return;
  }

  this.isUploading = true;
  this.uploadError = null;

  const formData = new FormData();
  formData.append('file', this.selectedFile);
  formData.append('studentId', this.selectedStudentForUpload.id.toString());

  // Get JWT token from localStorage
  const token = localStorage.getItem('token');

  const backendUrl = 'http://localhost:8080';
  const uploadUrl = `${backendUrl}/api/staff/exam-grades/upload-xml`;

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  fetch(uploadUrl, {
    method: 'POST',
    body: formData,
    headers: headers,              // ← add Authorization header here
    credentials: 'same-origin'     // optional – only if needed
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`Server error ${response.status}: ${text || response.statusText}`);
      });
    }
    return response.text();
  })
  .then(resultText => {
    this.isUploading = false;
    this.snackBar.open('Upload successful! ' + resultText, 'OK', { duration: 8000 });
    this.dialog.closeAll();
    this.selectedFile = null;
    // Optional: refresh data
  })
  .catch(error => {
    this.isUploading = false;
    console.error('XML upload failed:', error);
    this.uploadError = error.message || 'Upload failed – check console';
    this.snackBar.open('upload failed', 'Close', { duration: 6000 });
  });
}
}