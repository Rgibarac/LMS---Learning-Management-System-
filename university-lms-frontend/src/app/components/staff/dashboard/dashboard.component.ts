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

      <mat-card class="action-card" (click)="openDialog('terms')">
        <mat-card-header>
          <div mat-card-avatar class="icon terms"><mat-icon>date_range</mat-icon></div>
          <mat-card-title>Academic Terms</mat-card-title>
        </mat-card-header>
        <mat-card-content><p>Manage semesters</p></mat-card-content>
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
              <input [(ngModel)]="row.name" [name]="'name_' + i" required style="width: 100%; padding: 8px;">
            </td>
            <td style="padding: 8px;">
                <mat-select 
                  [(ngModel)]="row.selectedCourseIds" 
                  [name]="'courses_' + i"
                  multiple 
                  placeholder="Select courses"
                  style="width: 100%; min-height: 48px; border: 1px solid #ccc; border-radius: 4px; padding: 8px;">
                  <mat-option *ngFor="let course of courses" [value]="course.id">
                    {{ course.name }} ({{ course.code }})
                  </mat-option>
                </mat-select>
                <div style="font-size: 11px; color: #666; margin-top: 4px;">
                  Selected: {{ row.selectedCourseIds?.length || 0 }} course(s)
                </div>
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
        [disabled]="scheduleForm.invalid || termSchedules.length === 0">
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
              <div class="subtitle">{{ s.indexNumber || '—' }} • {{ s.email }}</div>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="program">
            <mat-header-cell *matHeaderCellDef>Program</mat-header-cell>
            <mat-cell *matCellDef="let s">
              <span class="chip" [class.chip-empty]="!s.studyProgram?.id">
                {{ s.studyProgram?.name || 'Not assigned' }}
              </span>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="year">
            <mat-header-cell *matHeaderCellDef>Current Year</mat-header-cell>
            <mat-cell *matCellDef="let s">
              <mat-form-field appearance="outline" class="year-select">
                <mat-select [value]="getHighestYear(s.id!)" (selectionChange)="setStudentYear(s, $event.value)">
                  <mat-option [value]="null">— None —</mat-option>
                  <mat-option [value]="1">Year 1</mat-option>
                  <mat-option [value]="2">Year 2</mat-option>
                  <mat-option [value]="3">Year 3</mat-option>
                  <mat-option [value]="4">Year 4</mat-option>
                </mat-select>
              </mat-form-field>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="courses">
            <mat-header-cell *matHeaderCellDef>Courses</mat-header-cell>
            <mat-cell *matCellDef="let s">
              <div class="course-list">
                <ng-container *ngIf="s.enrolledCourses?.length; else noCourses">
                  <div *ngFor="let c of s.enrolledCourses" class="course-item">
                    {{ c.name }} <small>({{ c.code }})</small>
                  </div>
                </ng-container>
                <ng-template #noCourses><i class="text-muted">No courses</i></ng-template>
              </div>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
            <mat-cell *matCellDef="let s">
              <button mat-stroked-button color="primary" (click)="openEnrollCourse(s); $event.stopPropagation()" class="small-btn">
                <mat-icon>school</mat-icon> Add Course
              </button>
              <button mat-stroked-button color="accent" (click)="openEnrollProgram(s); $event.stopPropagation()" class="small-btn">
                <mat-icon>assignment_ind</mat-icon> Program
              </button>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="['name','program','year','courses','actions']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['name','program','year','courses','actions']"></mat-row>
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
          <mat-form-field appearance="outline" class="role-select">
            <mat-select [value]="u.role" (selectionChange)="updateUserRole(u, $event.value)">
              <mat-option value="STUDENT">Student</mat-option>
              <mat-option value="TEACHER">Teacher</mat-option>
              <mat-option value="STAFF">Staff</mat-option>
              <mat-option value="ADMIN">Admin</mat-option>
            </mat-select>
          </mat-form-field>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="['name', 'currentRole', 'changeRole']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['name', 'currentRole', 'changeRole']"></mat-row>
    </mat-table>

    <div *ngIf="filteredAllUsers.length === 0" class="empty-state">
      <mat-icon>search_off</mat-icon>
      <p>No users found matching your search.</p>
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
  `]

  
})
export class StaffDashboardComponent implements OnInit {
  @ViewChild('enrollCourse') enrollCourse!: TemplateRef<any>;
  @ViewChild('enrollProgram') enrollProgram!: TemplateRef<any>;
  @ViewChild('notification') notification!: TemplateRef<any>;
  @ViewChild('schedule') schedule!: TemplateRef<any>;
  @ViewChild('content') content!: TemplateRef<any>;
  @ViewChild('studentManagementDialog') studentManagementDialog!: TemplateRef<any>;
  @ViewChild('termsDialog') termsDialog!: TemplateRef<any>;
  @ViewChild('userRoleManagementDialog') userRoleManagementDialog!: TemplateRef<any>;

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
    public dialog: MatDialog
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

  getCourseName(courseId: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown';
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
      content: this.content,
      terms: this.termsDialog
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
  const termData: Term = { ...this.termFormData };

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
  const validRows = this.termSchedules.filter(row =>
    row.name?.trim() &&
    row.date &&
    row.startTime &&
    row.selectedCourseIds?.length > 0
  );

  if (validRows.length === 0) {
    this.snackBar.open('Please fill Name, Date, Time and select at least one Course', 'Warning', { duration: 6000 });
    return;
  }

  const requests = validRows.map(row => {
    const payload = {
      name: row.name.trim(),
      termId: this.selectedTermId!,
      date: row.date,
      startTime: row.startTime,
      endTime: row.endTime || null,
      location: row.location || null,
      courses: row.selectedCourseIds.map((id: any) => ({ id })) 
    };

    console.log('SENDING TO BACKEND (WORKS 100%):', payload);

    return row.id
      ? this.apiService.updateTermSchedule(row.id, payload)
      : this.apiService.createTermSchedule(payload);
  });

  forkJoin(requests).subscribe({
    next: () => {
      this.snackBar.open('ALL SCHEDULES SAVED SUCCESSFULLY!', 'VICTORY', {
        duration: 8000,
        panelClass: ['success-snackbar']
      });
      this.onTermSelected(); 
    },
    error: (err) => {
      console.error('Save failed:', err);
      this.snackBar.open('Save failed — check console', 'Error', { duration: 10000 });
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
}