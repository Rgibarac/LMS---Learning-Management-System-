import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Course } from '../../../core/models/course.model';
import { StudyHistory } from '../../../core/models/study-history.model';
import { User } from '../../../core/models/user.model';
import { Syllabus } from '../../../core/models/syllabus.model';
import { StudyProgram } from '../../../core/models/study-program.model';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Term } from '../../../core/models/term.model';
import { TermSchedule } from '../../../core/models/term-schedule.model';
import { MatCheckbox } from "@angular/material/checkbox";
import { MatTabsModule } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';
import { WeeklySchedule } from '../../../core/models/weekly-schedule.model';
import { ScheduleEntry } from '../../../core/models/schedule-entry.model';
import { CourseTask } from '../../../core/models/coures-task.model'; 

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatCheckbox,
    MatTabsModule,
    DatePipe
],
  template: `
    <div class="dashboard-header">
      <h1>Student Portal</h1>
      <p class="welcome-text" *ngIf="user">Welcome back, <strong>{{ user.firstName }} {{ user.lastName }}</strong></p>
    </div>

    <div *ngIf="isLoading" class="loading-container">
      <mat-spinner diameter="60"></mat-spinner>
      <p>Loading your academic profile...</p>
    </div>

    <div *ngIf="!isLoading && user" class="student-dashboard">

      <mat-card class="info-card profile-card" (click)="openDialog('profile')">
        <mat-card-header>
          <div mat-card-avatar class="avatar"><mat-icon>person</mat-icon></div>
          <mat-card-title>Personal Information</mat-card-title>
          <mat-card-subtitle>Index: {{ user.indexNumber }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Username:</strong> {{ user.username }}</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="primary"><mat-icon>edit</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="info-card program-card" (click)="openDialog('program')">
        <mat-card-header>
          <div mat-card-avatar class="avatar program"><mat-icon>school</mat-icon></div>
          <mat-card-title>Study Program</mat-card-title>
          <mat-card-subtitle *ngIf="studyProgram">{{ studyProgram.name }}</mat-card-subtitle>
          <mat-card-subtitle *ngIf="!studyProgram">Not assigned</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p *ngIf="studyProgram">You are enrolled in this program.</p>
          <p *ngIf="!studyProgram" class="warning">Contact administration</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="accent"><mat-icon>info</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="info-card courses-card" (click)="openDialog('courses')">
        <mat-card-header>
          <div mat-card-avatar class="avatar courses"><mat-icon>book</mat-icon></div>
          <mat-card-title>Current Courses</mat-card-title>
          <mat-card-subtitle>{{ currentCourses.length }} active course(s)</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>View syllabuses and course details</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="primary"><mat-icon>arrow_forward</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card 
        class="info-card exam-card" 
        (click)="activeTerm && openDialog('exam')"
        [class.disabled]="!activeTerm">
        <mat-card-header>
          <div mat-card-avatar class="avatar exam"><mat-icon>assignment_turned_in</mat-icon></div>
          <mat-card-title>Apply for Exam</mat-card-title>
          <mat-card-subtitle *ngIf="activeTerm">
            <strong>Active Term:</strong> {{ activeTerm.name }}
          </mat-card-subtitle>
          <mat-card-subtitle *ngIf="!activeTerm" class="no-term">
            No active term
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p *ngIf="activeTerm">
            Apply for exams in <strong>{{ activeTerm.name }}</strong>
          </p>
          <p *ngIf="!activeTerm" class="no-term-text">
            Exam applications are currently closed
          </p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab [color]="activeTerm ? 'warn' : 'default'" [disabled]="!activeTerm">
            <mat-icon>{{ activeTerm ? 'how_to_reg' : 'lock' }}</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="info-card history-card" (click)="openDialog('history')">
    <mat-card-header>
      <div mat-card-avatar class="avatar history"><mat-icon>history_edu</mat-icon></div>
      <mat-card-title>Study History</mat-card-title>
      <mat-card-subtitle>{{ gradedCount }} completed course(s)</mat-card-subtitle>
    </mat-card-header>
    <mat-card-content>
      <p><strong>{{ totalEctsPoints }}</strong> ECTS earned</p>
      <div class="ects-bar">
        <div class="ects-fill" [style.width.%]="ectsProgress"></div>
      </div>
      <small>{{ ectsProgress.toFixed(1) }}% toward degree</small>
    </mat-card-content>
    <mat-card-actions align="end">
      <button mat-mini-fab color="primary"><mat-icon>timeline</mat-icon></button>
    </mat-card-actions>
  </mat-card>

  <mat-card class="info-card enroll-card" (click)="openDialog('enroll')">
  <mat-card-header>
    <div mat-card-avatar class="avatar enroll"><mat-icon>add_circle</mat-icon></div>
    <mat-card-title>Enroll in New Courses</mat-card-title>
    <mat-card-subtitle>{{ availableCourses.length }} course(s) available</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p *ngIf="currentAcademicYear && studyProgram">
  Year {{ currentAcademicYear }} • {{ studyProgram.name }}
</p>
<p *ngIf="!currentAcademicYear" class="warning">Study year not set</p>
<p *ngIf="!studyProgram" class="warning">No program assigned</p>
  </mat-card-content>
  <mat-card-actions align="end">
    <button mat-mini-fab color="accent"><mat-icon>school</mat-icon></button>
  </mat-card-actions>
</mat-card>

<mat-card class="info-card schedule-card" (click)="openDialog('schedule')">
  <mat-card-header>
    <div mat-card-avatar class="avatar schedule"><mat-icon>event_note</mat-icon></div>
    <mat-card-title>Class Schedule</mat-card-title>
    <mat-card-subtitle *ngIf="studyProgram && currentAcademicYear">
      {{ studyProgram.name }} • Year {{ currentAcademicYear }}
    </mat-card-subtitle>
    <mat-card-subtitle *ngIf="!studyProgram || currentAcademicYear === null" class="warning">
      Program/Year not set
    </mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p>View your weekly timetable</p>
  </mat-card-content>
  <mat-card-actions align="end">
    <button mat-mini-fab color="primary"><mat-icon>schedule</mat-icon></button>
  </mat-card-actions>
</mat-card>
    </div>

   <ng-template #profileDialog>
  <h2 mat-dialog-title><mat-icon>person</mat-icon> Edit Profile</h2>
  <mat-dialog-content>
    @if (user) {
      <form #profileForm="ngForm" (ngSubmit)="updateProfile()" class="form-grid">
        <mat-form-field appearance="fill">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="user!.email" name="email" required email>
          <mat-error>Email is required and must be valid</mat-error>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>First Name</mat-label>
          <input matInput [(ngModel)]="user!.firstName" name="firstName" required>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>Last Name</mat-label>
          <input matInput [(ngModel)]="user!.lastName" name="lastName" required>
        </mat-form-field>
        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid">
            Save Changes
          </button>
          <button mat-button mat-dialog-close>Cancel</button>
        </div>
      </form>
    }
    </mat-dialog-content>
    </ng-template>

    <ng-template #programDialog>
  <h2 mat-dialog-title><mat-icon>school</mat-icon> Study Program</h2>
  <mat-dialog-content>
    <div *ngIf="studyProgram; else noProgram">
      <h3>{{ studyProgram.name }}</h3>
      <p><strong>Program ID:</strong> {{ studyProgram.id }}</p>

      <p *ngIf="currentAcademicYear">
        <strong>Current Academic Year:</strong> {{ currentAcademicYear }}
      </p>

      <p *ngIf="currentEnrollment">
        <strong>Enrolled in Year:</strong> {{ currentEnrollment.yearOfEnrollment }}
      </p>

      <p *ngIf="currentEnrollment">
        <strong>Enrollment Date:</strong> {{ currentEnrollment.dateOfEnrollment | date:'mediumDate' }}
      </p>

      <p *ngIf="studyProgram.description">{{ studyProgram.description }}</p>
    </div>

    <ng-template #noProgram>
      <div class="warning">
        <mat-icon>warning</mat-icon>
        <p>No active study program enrollment found.</p>
        <p>Please contact administration if this is incorrect.</p>
      </div>
    </ng-template>
  </mat-dialog-content>

  <mat-dialog-actions>
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>

    <ng-template #coursesDialog>
      <h2 mat-dialog-title><mat-icon>book</mat-icon> Current Courses ({{ currentCourses.length }})</h2>
      <mat-dialog-content class="scrollable">
        <mat-table [dataSource]="currentCourses" *ngIf="currentCourses.length > 0">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
            <mat-cell *matCellDef="let c">{{ c.name }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="code">
            <mat-header-cell *matHeaderCellDef>Code</mat-header-cell>
            <mat-cell *matCellDef="let c">{{ c.code }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="ects">
            <mat-header-cell *matHeaderCellDef>ECTS</mat-header-cell>
            <mat-cell *matCellDef="let c">{{ c.ectsPoints }}</mat-cell>
          </ng-container>
          
          <ng-container matColumnDef="tasks">
  <mat-header-cell *matHeaderCellDef>Tasks</mat-header-cell>
  <mat-cell *matCellDef="let c">
    <button mat-stroked-button color="accent" (click)="openStudentTasks(c); $event.stopPropagation()">
      <mat-icon>assignment</mat-icon> View Tasks
    </button>
  </mat-cell>
</ng-container>
          <mat-header-row *matHeaderRowDef="['name', 'code', 'ects',  'tasks']"></mat-header-row>
<mat-row *matRowDef="let row; columns: ['name', 'code', 'ects', 'tasks']"></mat-row>
        </mat-table>
        <p *ngIf="currentCourses.length === 0">No courses enrolled this semester.</p>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button mat-button mat-dialog-close>Close</button>
      </mat-dialog-actions>
    </ng-template>

    <ng-template #examDialog>
  <h2 mat-dialog-title>Apply for Exam</h2>
  <mat-dialog-content class="scrollable">
    <p *ngIf="getScheduledCourses().length === 0" class="empty">
      No scheduled exams available at this time.
    </p>

    <mat-table [dataSource]="getUniqueScheduledCourses()" *ngIf="getScheduledCourses().length > 0">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
        <mat-cell *matCellDef="let c">
          <strong>{{ c.name }}</strong> <small>({{ c.code }})</small>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="ects">
        <mat-header-cell *matHeaderCellDef>ECTS</mat-header-cell>
        <mat-cell *matCellDef="let c">{{ c.ectsPoints }}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="action">
        <mat-header-cell *matHeaderCellDef>Available Sessions</mat-header-cell>
        <mat-cell *matCellDef="let c">
          <button mat-raised-button color="primary"
                  (click)="openExamSessions(c)"
                  [disabled]="hasPassedCourse(c.id!)">
            {{ getAvailableSessionsCount(c.id!) }} session(s) → Apply
          </button>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="['name', 'ects', 'action']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['name', 'ects', 'action']"></mat-row>
    </mat-table>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>

    <ng-template #historyDialog>
  <h2 mat-dialog-title><mat-icon>history_edu</mat-icon> Study History</h2>
  <mat-dialog-content class="scrollable">

    <div class="ects-summary" style="text-align: center; margin-bottom: 24px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
      <h3 style="margin: 0; color: #388e3c;">Total ECTS Earned: <strong>{{ totalEctsPoints }}</strong></h3>
      <small>{{ ectsProgress.toFixed(1) }}% toward degree completion</small>
      <div class="ects-bar" style="margin-top: 8px;">
        <div class="ects-fill" [style.width.%]="ectsProgress"></div>
      </div>
    </div>

    <mat-tab-group animationDuration="300ms">
      
      <mat-tab label="Passed Exams ({{ uniquePassedCourses.length }})">
        <mat-table [dataSource]="uniquePassedCourses" *ngIf="uniquePassedCourses.length > 0" class="passed-table" style="margin-top: 20px;">
          <ng-container matColumnDef="courseName">
            <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
            <mat-cell *matCellDef="let h">{{ h.courseName }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="ects">
            <mat-header-cell *matHeaderCellDef>ECTS</mat-header-cell>
            <mat-cell *matCellDef="let h">{{ h.ectsPoints || 0 }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="grade">
            <mat-header-cell *matHeaderCellDef>Grade</mat-header-cell>
            <mat-cell *matCellDef="let h">
              <strong style="color: #2e7d32; font-size: 1.3em;">{{ h.grade }}</strong>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="['courseName', 'ects', 'grade']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['courseName', 'ects', 'grade']"></mat-row>
        </mat-table>
        <p *ngIf="uniquePassedCourses.length === 0" class="empty">No passed exams yet.</p>
      </mat-tab>

      <mat-tab label="Taken Exams ({{ gradedHistory.length }})">
        <mat-table [dataSource]="gradedHistory" *ngIf="gradedHistory.length > 0" class="graded-table" style="margin-top: 20px;">
          <ng-container matColumnDef="courseName">
            <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
            <mat-cell *matCellDef="let h">{{ h.courseName }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="ects">
            <mat-header-cell *matHeaderCellDef>ECTS</mat-header-cell>
            <mat-cell *matCellDef="let h">{{ h.ectsPoints || 0 }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="term">
            <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
            <mat-cell *matCellDef="let h">{{ h.term }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="grade">
            <mat-header-cell *matHeaderCellDef>Grade</mat-header-cell>
            <mat-cell *matCellDef="let h">
              <strong [style.color]="h.grade >= 6 ? '#2e7d32' : '#d32f2f'">{{ h.grade }}</strong>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
            <mat-cell *matCellDef="let h">
              <span class="status" [class.passed]="h.passed" [class.failed]="!h.passed">
                {{ h.passed ? 'Passed' : 'Failed' }}
              </span>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="['courseName', 'ects', 'term', 'grade', 'status']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['courseName', 'ects', 'term', 'grade', 'status']"></mat-row>
        </mat-table>
        <p *ngIf="gradedHistory.length === 0" class="empty">No completed exams.</p>
      </mat-tab>

      <mat-tab label="Pending Applications ({{ pendingHistory.length }})">
        <mat-table [dataSource]="pendingHistory" *ngIf="pendingHistory.length > 0" class="pending-table" style="margin-top: 20px;">
          <ng-container matColumnDef="courseName">
            <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
            <mat-cell *matCellDef="let h">{{ h.courseName }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="ects">
            <mat-header-cell *matHeaderCellDef>ECTS</mat-header-cell>
            <mat-cell *matCellDef="let h">{{ h.ectsPoints || 0 }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="term">
            <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
            <mat-cell *matCellDef="let h">{{ h.term }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef>Status</mat-header-cell>
            <mat-cell *matCellDef="let h">
              <span class="status not-reviewed">Pending Review</span>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="['courseName', 'ects', 'term', 'status']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['courseName', 'ects', 'term', 'status']"></mat-row>
        </mat-table>
        <p *ngIf="pendingHistory.length === 0" class="empty">No pending applications.</p>
      </mat-tab>

    </mat-tab-group>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>

  <ng-template #enrollDialog>
  <h2 mat-dialog-title><mat-icon>add_circle</mat-icon> Enroll in Available Courses</h2>
  <mat-dialog-content class="scrollable">
    <div *ngIf="currentAcademicYear && studyProgram; else noAccess">
  <p>You are in <strong>Year {{ currentAcademicYear }}</strong> of <strong>{{ studyProgram.name }}</strong></p>
  <p>Select courses to enroll:</p>

      <mat-table [dataSource]="availableCourses" *ngIf="availableCourses.length > 0">
        <ng-container matColumnDef="select">
          <mat-header-cell *matHeaderCellDef>
            <mat-checkbox (change)="selectAll($event.checked)" [checked]="allSelectedForEnrollment()">
            </mat-checkbox>
          </mat-header-cell>
          <mat-cell *matCellDef="let c">
            <mat-checkbox [(ngModel)]="selectedForEnrollment[c.id!]" (change)="updateSelection()">
            </mat-checkbox>
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
          <mat-cell *matCellDef="let c">
            <strong>{{ c.name }}</strong> <small>({{ c.code }})</small>
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="year">
          <mat-header-cell *matHeaderCellDef>Year</mat-header-cell>
          <mat-cell *matCellDef="let c">Year {{ c.studyYear }}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="ects">
          <mat-header-cell *matHeaderCellDef>ECTS</mat-header-cell>
          <mat-cell *matCellDef="let c">{{ c.ectsPoints }}</mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="['select', 'name', 'year', 'ects']"></mat-header-row>
        <mat-row *matRowDef="let row; columns: ['select', 'name', 'year', 'ects']"></mat-row>
      </mat-table>

      <p *ngIf="availableCourses.length === 0" class="empty">
    No courses available for your current year.
  </p>
</div>

    <ng-template #noAccess>
      <div class="warning">
        <mat-icon>warning</mat-icon>
        <p>You must have a study program and current year assigned to enroll in courses.</p>
      </div>
    </ng-template>
  </mat-dialog-content>

  <mat-dialog-actions>
    <button mat-button (click)="enrollSelectedCourses()" color="primary" [disabled]="!hasSelectedCourses()">
      Enroll Selected ({{ selectedCourseCount() }})
    </button>
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>

<ng-template #examDetailDialog>
  <h2 mat-dialog-title>Choose Exam Session – {{ selectedExamCourse?.name }}</h2>
  <mat-dialog-content class="scrollable">
    <p>Select one of the available exam sessions below:</p>

    <mat-table [dataSource]="getSessionsForCourse(selectedExamCourse?.id!)" *ngIf="getSessionsForCourse(selectedExamCourse?.id!).length > 0">
      <ng-container matColumnDef="term">
        <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
        <mat-cell *matCellDef="let s">{{ getTermName(s.termId) }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="date">
        <mat-header-cell *matHeaderCellDef>Date & Time</mat-header-cell>
        <mat-cell *matCellDef="let s">{{ s.date }} {{ s.startTime }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="location">
        <mat-header-cell *matHeaderCellDef>Location</mat-header-cell>
        <mat-cell *matCellDef="let s">{{ s.location || 'TBA' }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="action">
        <mat-header-cell *matHeaderCellDef>Action</mat-header-cell>
        <mat-cell *matCellDef="let s">
          <button mat-raised-button color="primary"
                  (click)="applyForSpecificSession(s)"
                  [disabled]="hasPassedCourse(selectedExamCourse?.id!) || hasPendingForSession(s)">
            Apply
          </button>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="['term', 'date', 'location', 'action']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['term', 'date', 'location', 'action']"></mat-row>
    </mat-table>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button (click)="backToExamList()">Back</button>
  </mat-dialog-actions>
</ng-template>

<ng-template #scheduleDialog>
  <h2 mat-dialog-title><mat-icon>event_note</mat-icon> My Weekly Schedule</h2>
  <mat-dialog-content class="scrollable">
    <div *ngIf="!studyProgram || currentAcademicYear === null" class="warning">
      <mat-icon>warning</mat-icon>
      <p>No study program or academic year assigned.</p>
    </div>

    <div *ngIf="studyProgram && currentAcademicYear && studentScheduleEntries.length === 0">
      <p class="empty">No schedule defined for your program/year yet.</p>
    </div>

    <div *ngIf="studentScheduleEntries.length > 0">
      <mat-table [dataSource]="studentScheduleEntries" class="professional-table">
        <ng-container matColumnDef="dayTime">
          <mat-header-cell *matHeaderCellDef><strong>Day & Time</strong></mat-header-cell>
          <mat-cell *matCellDef="let e">
            <strong>{{ days[e.dayOfWeek] }}</strong><br>
            {{ e.startTime }} – {{ e.endTime }}
            <small *ngIf="e.location"> @ {{ e.location }}</small>
          </mat-cell>
        </ng-container>
        <ng-container matColumnDef="course">
          <mat-header-cell *matHeaderCellDef><strong>Course</strong></mat-header-cell>
          <mat-cell *matCellDef="let e">
            <strong>{{ getCourseName(e.courseId) }}</strong>
          </mat-cell>
        </ng-container>
        <mat-header-row *matHeaderRowDef="['dayTime', 'course']"></mat-header-row>
        <mat-row *matRowDef="let row; columns: ['dayTime', 'course']"></mat-row>
      </mat-table>
    </div>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>

<ng-template #courseTasksDialog>
  <h2 mat-dialog-title><mat-icon>assignment</mat-icon> Tasks & Requirements – {{ selectedCourseForTasks?.name }}</h2>
  <mat-dialog-content class="scrollable">
    <div *ngIf="tasksForSelectedCourse.length === 0" class="empty">
      <mat-icon>assignment_late</mat-icon>
      <p>No tasks defined for this course yet.</p>
    </div>
    <div *ngIf="tasksForSelectedCourse.length > 0" class="task-list">
      <mat-card *ngFor="let task of tasksForSelectedCourse" class="task-card">
        <mat-card-header>
          <mat-card-title>{{ task.name }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>{{ task.description || 'No description provided' }}</p>
        </mat-card-content>
      </mat-card>
    </div>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
  <button mat-button mat-dialog-close>Close</button>
</mat-dialog-actions>
</ng-template>
  `,
  styles: [`

    .exam-card.disabled {
      opacity: 0.6;
      cursor: not-allowed !important;
      pointer-events: none;
    }
    .syllabus-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #d32f2f;
  font-weight: 500;
  text-decoration: none;
}
.syllabus-link:hover {
  text-decoration: underline;
}
.not-available {
  color: #9e9e9e;
  font-style: italic;
}
    .schedule-card .avatar { background: #ab47bc; }
    .exam-card.disabled .avatar { background: #9e9e9e !important; }
    .no-term, .no-term-text { color: #d32f2f; font-weight: bold; }
    .not-reviewed { color: #9c27b0; font-style: italic; }
    .exam-form { display: flex; flex-direction: column; gap: 16px; }
    .full-width { width: 100%; }
    .dashboard-header { text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 0 0 20px 20px; }
    .dashboard-header h1 { margin: 0; font-size: 2.5rem; }
    .welcome-text { margin: 10px 0 0; font-size: 1.3rem; opacity: 0.95; }
    .loading-container { text-align: center; padding: 80px 20px; }
    .student-dashboard { padding: 30px 20px; max-width: 1400px; margin: 0 auto; }
    .info-card { cursor: pointer; transition: all 0.3s ease; height: 100%; position: relative; overflow: hidden; }
    .info-card:hover { transform: translateY(-10px); box-shadow: 0 15px 35px rgba(0,0,0,0.2) !important; }
    .avatar { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; }
    .profile-card .avatar { background: #1976d2; }
    .program-card .avatar { background: #388e3c; }
    .courses-card .avatar { background: #f57c00; }
    .exam-card .avatar { background: #d32f2f; }
    .history-card .avatar { background: #7b1fa2; }
    .ects-bar { height: 12px; background: #e0e0e0; border-radius: 6px; overflow: hidden; margin: 10px 0; }
    .ects-fill { height: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a); transition: width 1s ease; }
    .status { padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }
    .status.passed { background: #e8f5e8; color: #2e7d32; }
    .status.failed { background: #ffebee; color: #c62828; }
    @media (min-width: 768px) { .student-dashboard { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; } .info-card:nth-child(5) { grid-column: 1 / -1; } }
    @media (min-width: 1200px) { .student-dashboard { grid-template-columns: repeat(4, 1fr); gap: 28px; } .info-card:nth-child(5) { grid-column: unset; } }
    .graded-table { margin-bottom: 24px; }
    .pending-table { opacity: 0.9; }
    .status.not-reviewed {
      background: #9c27b0;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: bold;
    }
    .empty { color: #666; font-style: italic; padding: 20px 0; text-align: center; }
    :host ::ng-deep .error-snackbar {
  background-color: #d32f2f !important;
  color: white !important;
}

:host ::ng-deep .success-snackbar {
  background-color: #388e3c !important;
  color: white !important;
} 
.failed-grade {
  color: #d32f2f !important;
  font-size: 1.1em;
}

.status.passed {
  background: #e8f5e8;
  color: #2e7d32;
}

.status.failed {
  background: #ffebee;
  color: #c62828;
  font-weight: bold;
}
.task-list .task-card { margin: 12px 0; }
.task-card mat-card-header { background: #f5f5f5; }
  `]
})
export class StudentDashboardComponent implements OnInit {
  @ViewChild('profileDialog') profileDialog!: TemplateRef<any>;
  @ViewChild('programDialog') programDialog!: TemplateRef<any>;
  @ViewChild('coursesDialog') coursesDialog!: TemplateRef<any>;
  @ViewChild('examDialog') examDialog!: TemplateRef<any>;
  @ViewChild('historyDialog') historyDialog!: TemplateRef<any>;
  @ViewChild('enrollDialog') enrollDialog!: TemplateRef<any>;
  @ViewChild('examDetailDialog') examDetailDialog!: TemplateRef<any>;
  @ViewChild('scheduleDialog') scheduleDialog!: TemplateRef<any>;
@ViewChild('courseTasksDialog') courseTasksDialog!: TemplateRef<any>; 

  user: User | null = null;
  currentCourses: Course[] = [];
  studyHistory: StudyHistory[] = [];
  studyProgram: StudyProgram | null = null;
  syllabuses: { [key: number]: Syllabus } = {};
  totalEctsPoints: number = 0;
  historyColumns: string[] = ['courseName', 'term', 'examsTaken', 'grade', 'ectsPoints', 'passed'];
  selectedCourseId: number | null = null;
  examTerm: string = '';
  isLoading: boolean = true;
  activeTerm: Term | null = null;
  gradedHistory: StudyHistory[] = [];
  pendingHistory: StudyHistory[] = [];
  currentStudyYear: number | null = null;
  availableCourses: Course[] = [];
  allCourses: Course[] = []; 
  activeTermSchedules: TermSchedule[] = [];
  allTerms: Term[] = [];
  selectedTermForApplication: Term | null = null;
  selectedExamCourse: Course | null = null;
  selectedExamSchedule: TermSchedule | null = null;
  currentExamDialogRef: any = null; 
  selectedForEnrollment: { [courseId: number]: boolean } = {};
  currentAcademicYear: number | null = null;

  currentEnrollment: any | null = null;
  allStudyPrograms: StudyProgram[] = [];
  courseColumns: string[] = ['name', 'code', 'ectsPoints', 'tasks'];


weeklySchedules: WeeklySchedule[] = [];
studentScheduleEntries: ScheduleEntry[] = [];
selectedWeeklyScheduleForStudent: WeeklySchedule | null = null;

selectedCourseForTasks: Course | null = null;
tasksForSelectedCourse: CourseTask[] = [];
days: { [key: string]: string } = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday'
};
showStudentTasksOverlay = false;


  get uniquePassedCourses(): StudyHistory[] {
  const passed = this.gradedHistory.filter(h => h.passed && h.grade != null);

  const map = new Map<number, StudyHistory>();
  passed.forEach(h => {
    if (h.courseId == null) return;
    const existing = map.get(h.courseId);
    if (!existing || (h.grade ?? 0) > (existing.grade ?? 0)) {
      map.set(h.courseId, h);
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    (b.grade ?? 0) - (a.grade ?? 0)
  );
}



  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.user = this.apiService.getCurrentUser();

    if (!this.user?.id) {
      this.snackBar.open('Please log in', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.loadAllData(this.user.id);
    this.loadActiveTerm();
  }

  private loadAllData(userId: number): void {
  forkJoin({
    courses: this.apiService.getStudentCourses(userId).pipe(catchError(() => of([]))),
    history: this.apiService.getStudentHistory(userId).pipe(catchError(() => of([]))),
    allCourses: this.apiService.getCourses().pipe(catchError(() => of([]))),
    terms: this.apiService.getTerms().pipe(catchError(() => of([]))),
    allStudyPrograms: this.apiService.getStudyPrograms().pipe(catchError(() => of([])))
  }).subscribe({
    next: ({ courses, history, allCourses, terms, allStudyPrograms }) => {
      this.currentCourses = courses;
      this.studyHistory = history;
      this.allCourses = allCourses;
      this.allTerms = terms;
      this.activeTerm = terms.find(t => t.active) || null;
      this.allStudyPrograms = allStudyPrograms;

      this.loadTermSchedules();
      this.processStudyHistory();
      this.loadSyllabuses();

      if (!this.user?.indexNumber) {
        this.studyProgram = null;
        this.currentEnrollment = null;
        this.currentAcademicYear = null;
        this.loadAvailableCourses();
        this.isLoading = false;
        return;
      }

      this.apiService.getYearEnrollmentsByIndex(this.user.indexNumber).subscribe({
        next: (enrollments: any[]) => {
          if (!enrollments || enrollments.length === 0) {
            this.studyProgram = null;
            this.currentEnrollment = null;
            this.currentAcademicYear = null;
          } else {

            const latest = enrollments.reduce((a: any, b: any) =>
              new Date(b.dateOfEnrollment) > new Date(a.dateOfEnrollment) ? b : a
            );

            this.currentEnrollment = latest;

            const programId = latest.studyProgramId;
            this.studyProgram = allStudyPrograms.find(p => p.id === programId) || null;

            this.currentAcademicYear = latest.yearOfEnrollment;
          }

          this.loadAvailableCourses();

          this.isLoading = false;
        },
        error: () => {
          this.studyProgram = null;
          this.currentEnrollment = null;
          this.currentAcademicYear = null;
          this.loadAvailableCourses();
          this.isLoading = false;
        }
      });
    },
    error: () => {
      this.isLoading = false;
    }
  });
}

  private loadSyllabuses(): void {
  if (this.currentCourses.length === 0) {
    this.syllabuses = {};
    return;
  }

  const requests = this.currentCourses.map(course => {
    if (!course.id) return of(null);
    return this.apiService.getSyllabus(course.id).pipe(
      catchError(() => of(null))
    );
  });

  forkJoin(requests).subscribe(results => {
    this.syllabuses = {};
    results.forEach((syllabus, index) => {
      const courseId = this.currentCourses[index].id;
      if (courseId && syllabus) {
        this.syllabuses[courseId] = syllabus;
      }
    });
  });
}

  updateProfile(): void {
    if (!this.user?.id) return;

    this.apiService.updateProfile(this.user).subscribe({
      next: (updated) => {
        this.user = updated;
        this.snackBar.open('Profile updated!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Update failed: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  applyForExam(): void {
  if (!this.user?.id || this.selectedCourseId === null || !this.activeTerm) {
    this.snackBar.open('Please select a course and ensure an active term exists', 'Close', { duration: 5000 });
    return;
  }

  const userId = this.user.id;
  const selectedCourseId = this.selectedCourseId;
  const termValue = `${this.activeTerm.name} (ID: ${this.activeTerm.id})`;

  const selectedCourse = this.currentCourses.find(c => c.id === selectedCourseId);
  if (!selectedCourse) {
    this.snackBar.open('Selected course not found', 'Close', { duration: 5000 });
    return;
  }

  const courseName = selectedCourse.name;

  const existingApp = this.studyHistory.find(h => h.courseName === courseName);

  if (existingApp) {
    if (existingApp.grade === null) {
      this.snackBar.open(
        `You already applied for "${courseName}". Your application is still pending review.`,
        'Close',
        { duration: 8000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    if (existingApp.passed) {
      this.snackBar.open(
        `You have already passed "${courseName}". You cannot apply again.`,
        'Close',
        { duration: 8000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    if (existingApp.grade !== null && !existingApp.passed) {
      const confirm = window.confirm(
        `You failed "${courseName}" in ${existingApp.term}.\n\nDo you want to re-apply for the exam?`
      );
      if (!confirm) return;
    }
  }


  this.apiService.createExamApplication(userId, selectedCourseId, termValue).subscribe({
    next: () => {
      this.snackBar.open(
        `Successfully applied for "${courseName}" in ${this.activeTerm!.name}!`,
        'Close',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
      this.selectedCourseId = null;
      this.dialog.closeAll();
      this.loadAllData(userId);
    },
    error: (err) => {
      this.snackBar.open(
        'Application failed: ' + (err.error?.message || err.message || 'Unknown error'),
        'Close',
        { duration: 6000 }
      );
    }
  });
}

get ectsProgress(): number {
    return this.totalEctsPoints >= 240 ? 100 : (this.totalEctsPoints / 240) * 100;
  }
  openDialog(section: 'profile' | 'program' | 'courses' | 'exam' | 'history' | 'enroll'| 'schedule'): void {
  let template: TemplateRef<any>;
  switch (section) {
    case 'profile':
      template = this.profileDialog;
      break;
    case 'program':
      template = this.programDialog;
      break;
    case 'courses':
      template = this.coursesDialog;
      break;
    case 'exam':
      template = this.examDialog;
      break;
    case 'history':
      template = this.historyDialog;
      break;
    case 'enroll':
      template = this.enrollDialog;
      this.selectedForEnrollment = {}; 
      break;
    case 'schedule':
  template = this.scheduleDialog;
  this.loadStudentSchedule();  
  break;
    default:
      return;
  }

  this.dialog.open(template, {
    width: '90vw',
    maxWidth: '1000px',
    height: section === 'courses' || section === 'history' || section === 'exam' ? '80vh' : 'auto',
    panelClass: 'student-dialog'
  });
}

  private loadActiveTerm(): void {
    this.apiService.getTerms().subscribe({
      next: (terms) => {
        this.activeTerm = terms.find(t => t.active) || null;
      },
      error: () => this.snackBar.open('Could not load current term', 'Close', { duration: 3000 })
    });
  }

  get gradedCount(): number {
    return this.gradedHistory.length;
  }

  loadAvailableCourses(): void {
  if (!this.studyProgram || this.currentAcademicYear === null) {
    this.availableCourses = [];
    return;
  }

  const candidateCourses = this.allCourses.filter(course =>
    course.studyProgramId === this.studyProgram!.id &&
    (course.studyYear ?? 0) <= this.currentAcademicYear!
  );

  const currentCourseIds = new Set(this.currentCourses.map(c => c.id));

  this.availableCourses = candidateCourses.filter(course =>
    !currentCourseIds.has(course.id)
  );
}
enrollInCourse(courseId: number): void {
  if (!this.user?.id) {
    this.snackBar.open('User not authenticated', 'Close');
    return;
  }

  const userId = this.user.id;

  this.apiService.enrollStudentInCourse(userId, courseId).subscribe({
    next: () => {
      this.snackBar.open('Successfully enrolled!', 'Close', { duration: 4000 });
      this.loadAllData(userId);
    },
    error: () => this.snackBar.open('Enrollment failed', 'Error')
  });
}

getScheduledCourses(): Course[] {
  if (!this.activeTermSchedules.length || !this.currentCourses.length) return [];

  const scheduledCourseIds = this.activeTermSchedules
    .flatMap(s => s.courses?.map(c => c.id).filter(Boolean) || [])
    .filter((id): id is number => id !== undefined);

  const scheduledEnrolledCourses = this.currentCourses.filter(c =>
    c.id && scheduledCourseIds.includes(c.id)
  );

  return scheduledEnrolledCourses.filter(course => {
    const passedEntry = this.gradedHistory.find(h =>
      h.courseId === course.id && h.passed === true
    );
    return !passedEntry; 
  });
}

getCourseScheduleText(courseId: number): string {
  const schedules = this.activeTermSchedules.filter(s =>
    s.courses?.some(c => c.id === courseId)
  );
  if (schedules.length === 0) return '';
  const first = schedules[0];
  return `${first.date} ${first.startTime} @ ${first.location || 'TBA'}`;
}

isAlreadyEnrolled(courseId: number): boolean {
  return this.currentCourses.some(c => c.id === courseId);
}




backToExamList(): void {
  this.currentExamDialogRef?.close();
  this.dialog.open(this.examDialog, {
    width: '90vw',
    maxWidth: '1000px',
    height: '80vh'
  });
}

hasPassedCourse(courseId: number): boolean {
  return this.gradedHistory.some(h => h.courseId === courseId && h.passed);
}

hasPendingApplication(courseId: number): boolean {
  return this.pendingHistory.some(h => h.courseId === courseId);
}

hasFailedBefore(courseId: number): boolean {
  return this.gradedHistory.some(h => h.courseId === courseId && !h.passed);
}

hasAnyApplication(courseId: number): boolean {
  return this.studyHistory.some(h => h.courseId === courseId);
}

submitExamApplication(): void {
  if (!this.user?.id || !this.selectedExamCourse || !this.selectedTermForApplication) {
    this.snackBar.open('Please select a term', 'Close', { duration: 5000 });
    return;
  }

  const userId = this.user.id;
  const courseId = this.selectedExamCourse.id!;
  const termValue = `${this.selectedTermForApplication.name} (ID: ${this.selectedTermForApplication.id})`;

  this.apiService.createExamApplication(userId, courseId, termValue).subscribe({
    next: () => {
      this.snackBar.open(
        `Application submitted for "${this.selectedExamCourse?.name}" in ${this.selectedTermForApplication?.name}!`,
        'Close',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
      this.dialog.closeAll();
      this.loadAllData(userId);
    },
    error: (err) => {
      this.snackBar.open(
        'Application failed: ' + (err.error?.message || err.message),
        'Close',
        { duration: 6000 }
      );
    }
  });
}

selectAll(checked: boolean): void {
  this.availableCourses.forEach(c => {
    if (!this.isAlreadyEnrolled(c.id!)) {
      this.selectedForEnrollment[c.id!] = checked;
    }
  });
}

allSelectedForEnrollment(): boolean {
  return this.availableCourses
    .filter(c => !this.isAlreadyEnrolled(c.id!))
    .every(c => this.selectedForEnrollment[c.id!] === true);
}

updateSelection(): void {
}

hasSelectedCourses(): boolean {
  return Object.values(this.selectedForEnrollment).some(v => v);
}

selectedCourseCount(): number {
  return Object.values(this.selectedForEnrollment).filter(v => v).length;
}

enrollSelectedCourses(): void {
  if (!this.user?.id) {
    this.snackBar.open('User not logged in', 'Close', { duration: 5000 });
    return;
  }

  const userId = this.user.id;

  const selectedIds = Object.keys(this.selectedForEnrollment)
    .filter(key => this.selectedForEnrollment[+key])
    .map(Number);

  if (selectedIds.length === 0) {
    this.snackBar.open('No courses selected', 'Close', { duration: 3000 });
    return;
  }

  const requests = selectedIds.map(id =>
    this.apiService.enrollStudentInCourse(userId, id)
  );

  forkJoin(requests).subscribe({
    next: () => {
      this.snackBar.open(`Successfully enrolled in ${selectedIds.length} course(s)!`, 'Close', { duration: 5000 });
      this.selectedForEnrollment = {};
      this.loadAllData(userId); 
      this.dialog.closeAll();
    },
    error: () => this.snackBar.open('One or more enrollments failed', 'Close', { duration: 5000 })
  });
}


openExamDetail(course: Course): void {
  const schedule = this.activeTermSchedules.find(s =>
    s.courses?.some(c => c.id === course.id)
  ) || null;

  this.selectedExamCourse = course;
  this.selectedExamSchedule = schedule;
  this.selectedTermForApplication = this.activeTerm; 

  this.currentExamDialogRef = this.dialog.open(this.examDetailDialog, {
    width: '90vw',
    maxWidth: '600px'
  });
}


hasPendingApplicationInTerm(courseId: number, term: Term | null): boolean {
  if (!term || !courseId) return false;
  return this.pendingHistory.some(h =>
    h.courseId === courseId &&
    h.term?.includes(term.name)
  );
}

getUniqueScheduledCourses(): Course[] {
  const seen = new Set<number>();
  return this.getScheduledCourses().filter(c => {
    if (seen.has(c.id!)) return false;
    seen.add(c.id!);
    return true;
  });
}

getAvailableSessionsCount(courseId: number): number {
  return this.activeTermSchedules.filter(s => 
    s.courses?.some(c => c.id === courseId)
  ).length;
}

openExamSessions(course: Course): void {
  this.selectedExamCourse = course;
  this.currentExamDialogRef = this.dialog.open(this.examDetailDialog, {
    width: '90vw',
    maxWidth: '800px',
    height: '70vh'
  });
}

getSessionsForCourse(courseId: number | undefined): TermSchedule[] {
  if (!courseId) return [];
  return this.activeTermSchedules.filter(s => 
    s.courses?.some(c => c.id === courseId)
  );
}

getTermName(termId: number | undefined): string {
  if (!termId) return 'Unknown';
  const term = this.allTerms.find(t => t.id === termId);
  return term?.name || 'Unknown Term';
}

hasPendingForSession(schedule: TermSchedule): boolean {
  if (!this.selectedExamCourse || !schedule.termId) return false;
  const term = this.allTerms.find(t => t.id === schedule.termId);
  if (!term) return false;
  return this.pendingHistory.some(h =>
    h.courseId === this.selectedExamCourse!.id &&
    h.term?.includes(term.name)
  );
}

applyForSpecificSession(schedule: TermSchedule): void {
  if (!this.user?.id) {
    this.snackBar.open('You must be logged in to apply for an exam', 'Close', { duration: 5000 });
    return;
  }

  if (!this.selectedExamCourse?.id) {
    this.snackBar.open('No course selected', 'Close', { duration: 5000 });
    return;
  }

  if (!schedule.termId) {
    this.snackBar.open('Invalid exam session', 'Close', { duration: 5000 });
    return;
  }

  const userId = this.user.id; 
  const courseId = this.selectedExamCourse.id; 

  const term = this.allTerms.find(t => t.id === schedule.termId);
  if (!term) {
    this.snackBar.open('Term not found', 'Close', { duration: 5000 });
    return;
  }

  const termValue = `${term.name} (ID: ${term.id})`;

  this.apiService.createExamApplication(userId, courseId, termValue).subscribe({
    next: () => {
      this.snackBar.open(
        `Application submitted for "${this.selectedExamCourse?.name}" in ${term.name}!`,
        'Close',
        { duration: 5000, panelClass: ['success-snackbar'] }
      );
      this.dialog.closeAll();
      this.loadAllData(userId);
    },
    error: (err) => {
      this.snackBar.open(
        'Application failed: ' + (err.error?.message || err.message || 'Unknown error'),
        'Close',
        { duration: 6000 }
      );
    }
  });
}



private finishLoading(): void {
  this.loadAvailableCourses();
  this.isLoading = false;
}

private loadTermSchedules(): void {
  const activeTerms = this.allTerms.filter(t => t.active);
  if (activeTerms.length === 0) {
    this.activeTermSchedules = [];
    return;
  }

  const requests = activeTerms.map(term =>
    this.apiService.getTermSchedulesByTerm(term.id!).pipe(
      catchError(() => of([] as TermSchedule[])),
      map(schedules => schedules.map(s => ({
        ...s,
        termId: term.id as number,
        termName: term.name
      })))
    )
  );

  forkJoin(requests).subscribe(allSchedules => {
    this.activeTermSchedules = allSchedules.flat();
  });
}

private processStudyHistory(): void {
  this.pendingHistory = this.studyHistory.filter(h => h.grade == null);

  const graded = this.studyHistory
    .filter(h => h.grade != null)
    .map(h => ({
      ...h,
      grade: h.grade as number,
      passed: (h.grade as number) >= 6
    }));

  this.gradedHistory = graded.sort((a, b) => {
    if (a.passed && !b.passed) return -1;
    if (!a.passed && b.passed) return 1;
    return b.grade - a.grade;
  });

  this.totalEctsPoints = graded
    .filter(h => h.passed)
    .reduce((sum, h) => sum + (h.ectsPoints || 0), 0);
}

private completeLoading(): void {
  this.loadAvailableCourses(); 
  this.isLoading = false;
}

private loadStudentSchedule(): void {
  if (!this.studyProgram || this.currentAcademicYear === null) {
    this.studentScheduleEntries = [];
    return;
  }

  this.apiService.getWeeklySchedules().subscribe({
    next: (allSchedules) => {
      const matching = allSchedules.find(s =>
        s.studyProgramId === this.studyProgram!.id && s.year === this.currentAcademicYear
      );

      this.selectedWeeklyScheduleForStudent = matching || null;

      if (!matching) {
        this.studentScheduleEntries = [];
        return;
      }

      this.apiService.getScheduleEntriesBySchedule(matching.id!).subscribe({
        next: (entries) => this.studentScheduleEntries = entries,
        error: () => this.studentScheduleEntries = []
      });
    },
    error: () => this.studentScheduleEntries = []
  });
}

getCourseName(courseId: number | undefined): string {
  if (!courseId) return 'Unknown';
  const c = this.allCourses.find(co => co.id === courseId);
  return c ? `${c.name} (${c.code})` : 'Unknown Course';
}

openStudentTasks(course: Course): void {
  this.selectedCourseForTasks = course;
  this.apiService.getTasksByCourse(course.id!).subscribe({
    next: (tasks) => {
      this.tasksForSelectedCourse = tasks;
      this.dialog.open(this.courseTasksDialog, {
        width: '90vw',
        maxWidth: '800px'
      });
    },
    error: () => {
      this.tasksForSelectedCourse = [];
      this.snackBar.open('Failed to load tasks', 'Close', { duration: 4000 });
    }
  });
}
}