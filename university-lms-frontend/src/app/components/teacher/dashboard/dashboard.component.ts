import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Course } from '../../../core/models/course.model';
import { Syllabus } from '../../../core/models/syllabus.model';
import { Notification } from '../../../core/models/notification.model';
import { User } from '../../../core/models/user.model';
import { StudyHistory } from '../../../core/models/study-history.model';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatList, MatListItem } from "@angular/material/list";
import { ExamApplication } from '../../../core/models/exam-application.model';
import { ExamGrade } from '../../../core/models/exam-grade.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ScheduleEntry } from '../../../core/models/schedule-entry.model';
import { ScheduleEntryDescription } from '../../../core/models/schedule-entry-description.model';
import { CourseTask } from '../../../core/models/coures-task.model';
import { WeeklySchedule } from '../../../core/models/weekly-schedule.model';
import { StudyProgram } from '../../../core/models/study-program.model';
import { TermSchedule } from '../../../core/models/term-schedule.model';
import { Term } from '../../../core/models/term.model';



@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatList,
    MatListItem
],
  template: `
    <div class="dashboard-header">
      <h1>Teacher Portal</h1>
      <p class="welcome">Welcome back, <strong>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</strong></p>
    </div>

    <div *ngIf="isLoading" class="loading">
      <mat-spinner diameter="60"></mat-spinner>
      <p>Loading your courses and data...</p>
    </div>

    <div *ngIf="!isLoading" class="dashboard-grid">

      <mat-card class="action-card" (click)="openDialog('courses')">
        <mat-card-header>
          <div mat-card-avatar class="icon courses"><mat-icon>book</mat-icon></div>
          <mat-card-title>My Courses</mat-card-title>
          <mat-card-subtitle>{{ courses.length }} active</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content><p>View syllabuses & exam applications</p></mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="primary"><mat-icon>arrow_forward</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="action-card" (click)="openDialog('syllabus')">
        <mat-card-header>
          <div mat-card-avatar class="icon syllabus"><mat-icon>description</mat-icon></div>
          <mat-card-title>Syllabus Management</mat-card-title>
          <mat-card-subtitle>{{ syllabusesCount }} uploaded</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content><p>Create or update course syllabuses</p></mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="accent"><mat-icon>edit</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="action-card" (click)="openDialog('grading')">
        <mat-card-header>
          <div mat-card-avatar class="icon grading"><mat-icon>grading</mat-icon></div>
          <mat-card-title>Grade Exams</mat-card-title>
          <mat-card-subtitle>Search & grade students</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content><p>Enter final grades and view history</p></mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="warn"><mat-icon>rate_review</mat-icon></button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="action-card" (click)="openDialog('notifications')">
        <mat-card-header>
          <div mat-card-avatar class="icon notify"><mat-icon>notifications</mat-icon></div>
          <mat-card-title>Notifications</mat-card-title>
          <mat-card-subtitle>{{ notifications.length }} unread</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content><p>System updates and announcements</p></mat-card-content>
        <mat-card-actions align="end">
          <button mat-mini-fab color="primary"><mat-icon>mark_email_read</mat-icon></button>
        </mat-card-actions>
      </mat-card>
    </div>

    <mat-card class="action-card" (click)="openSessionDetailsManagement()">
  <mat-card-header>
    <div mat-card-avatar class="icon session"><mat-icon>notes</mat-icon></div>
    <mat-card-title>Class Session Details</mat-card-title>
    <mat-card-subtitle>Add summary per class</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p>What to expect, topics, preparation</p>
  </mat-card-content>
  <mat-card-actions align="end">
    <button mat-mini-fab color="primary"><mat-icon>arrow_forward</mat-icon></button>
  </mat-card-actions>
</mat-card>

<mat-card class="action-card" (click)="openCourseTasksManagement()">
  <mat-card-header>
    <div mat-card-avatar class="icon tasks"><mat-icon>assignment</mat-icon></div>
    <mat-card-title>Course Tasks</mat-card-title>
    <mat-card-subtitle>Assignments & requirements</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p>Manage tasks per course</p>
  </mat-card-content>
  <mat-card-actions align="end">
    <button mat-mini-fab color="accent"><mat-icon>arrow_forward</mat-icon></button>
  </mat-card-actions>
</mat-card>

<mat-card class="action-card full-width-card" (click)="openAllStudentsOverview()">
  <mat-card-header>
    <div mat-card-avatar class="icon students"><mat-icon>people</mat-icon></div>
    <mat-card-title>All Students Overview</mat-card-title>
    <mat-card-subtitle>{{ allStudents.length }} total student{{ allStudents.length !== 1 ? 's' : '' }}</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <p>View all students, their programs, passed ECTS, courses, grades, and exam applications</p>
  </mat-card-content>
  <mat-card-actions align="end">
    <button mat-mini-fab color="primary"><mat-icon>arrow_forward</mat-icon></button>
  </mat-card-actions>
</mat-card>


<ng-template #sessionDetailsDialog>
  <h2 mat-dialog-title>
    <mat-icon>notes</mat-icon> Class Session Details
  </h2>
  <mat-dialog-content class="scrollable">

    <div *ngIf="!selectedWeeklySchedule">
      <h3>Your Weekly Schedules</h3>
      <p>Select a schedule to manage class summaries</p>

      @if (weeklySchedules.length === 0) {
        <div class="empty-state">
          <mat-icon>event_busy</mat-icon>
          <p>No weekly schedules assigned to your courses yet.</p>
        </div>
      } @else {
        <mat-table [dataSource]="weeklySchedules" class="professional-table">
          <ng-container matColumnDef="program">
            <mat-header-cell *matHeaderCellDef><strong>Program</strong></mat-header-cell>
            <mat-cell *matCellDef="let s">
              {{ getProgramName(s.studyProgramId) }}
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="year">
            <mat-header-cell *matHeaderCellDef><strong>Year</strong></mat-header-cell>
            <mat-cell *matCellDef="let s">Year {{ s.year }}</mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let s">
              <button mat-stroked-button color="primary" (click)="selectWeeklySchedule(s)">
                <mat-icon>notes</mat-icon> Manage Summaries
              </button>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="['program', 'year', 'actions']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['program', 'year', 'actions']"></mat-row>
        </mat-table>
      }
    </div>

    <div *ngIf="selectedWeeklySchedule && !selectedScheduleEntry">
      <div class="applications-header">
        <button mat-icon-button (click)="selectedWeeklySchedule = null; teacherScheduleEntries = []">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h3>
          Classes: {{ getProgramName(selectedWeeklySchedule.studyProgramId) }} - Year {{ selectedWeeklySchedule.year }}
        </h3>
      </div>

      @if (teacherScheduleEntries.length === 0) {
        <div class="empty-state">
          <mat-icon>event_note</mat-icon>
          <p>No classes defined in this schedule yet.</p>
        </div>
      } @else {
        <mat-table [dataSource]="teacherScheduleEntries" class="professional-table">
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
              <strong>{{ getCourseById(e.courseId)?.name }} ({{ getCourseById(e.courseId)?.code }})</strong>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let e">
              <button mat-stroked-button color="primary" (click)="selectEntryForDescription(e)">
                <mat-icon>notes</mat-icon> Manage Summary
              </button>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="['dayTime', 'course', 'actions']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['dayTime', 'course', 'actions']"></mat-row>
        </mat-table>
      }
    </div>

    <div *ngIf="selectedScheduleEntry">
      <div class="applications-header">
        <button mat-icon-button (click)="selectedScheduleEntry = null">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h3>
          Summary: {{ getCourseById(selectedScheduleEntry.courseId)?.name }}
        </h3>
      </div>

      <p>
        <strong>{{ days[selectedScheduleEntry.dayOfWeek] }}</strong> •
        {{ selectedScheduleEntry.startTime }} – {{ selectedScheduleEntry.endTime }}
        <small *ngIf="selectedScheduleEntry.location"> @ {{ selectedScheduleEntry.location }}</small>
      </p>

      @if (scheduleEntryDescriptions.length === 0) {
        <div class="empty-state">
          <mat-icon>note_add</mat-icon>
          <p>No summary added yet.</p>
          <button mat-raised-button color="primary" (click)="openDescriptionForm()">
            <mat-icon>add</mat-icon> Add Summary
          </button>
        </div>
      } @else {
        <div class="description-list">
          <mat-card *ngFor="let desc of scheduleEntryDescriptions" class="description-card">
            <mat-card-header>
              <mat-card-title>{{ desc.name }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ desc.description || 'No description' }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-icon-button (click)="editDescription(desc)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteDescription(desc.id!)">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <button mat-raised-button color="primary" (click)="openDescriptionForm()">
          <mat-icon>add</mat-icon> Add Another Summary
        </button>
      }
    </div>

    @if (showDescriptionForm) {
      <div class="overlay">
        <div class="grade-box">
          <h3>{{ editingDescription ? 'Edit' : 'Add' }} Summary</h3>
          <form (ngSubmit)="saveDescription()" #descForm="ngForm">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Title</mat-label>
              <input matInput [(ngModel)]="currentDescription.name" name="name" required>
            </mat-form-field>
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Description (optional)</mat-label>
              <textarea matInput [(ngModel)]="currentDescription.description" name="description" rows="4"></textarea>
            </mat-form-field>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="descForm.invalid">
                {{ editingDescription ? 'Update' : 'Save' }}
              </button>
              <button mat-button (click)="cancelDescriptionForm()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    }
  </mat-dialog-content>
</ng-template>

<ng-template #courseTasksDialog>
  <h2 mat-dialog-title>
    <mat-icon>assignment</mat-icon> Course Tasks & Requirements
  </h2>
  <mat-dialog-content class="scrollable">
    <div *ngIf="!selectedTaskCourse">
      <h3>Select a Course to Manage Tasks</h3>
      <mat-table [dataSource]="courses" class="professional-table">
        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef><strong>Course</strong></mat-header-cell>
          <mat-cell *matCellDef="let c">
            <strong>{{ c.name }}</strong> ({{ c.code }})
          </mat-cell>
        </ng-container>
        <ng-container matColumnDef="actions">
          <mat-header-cell *matHeaderCellDef></mat-header-cell>
          <mat-cell *matCellDef="let c">
            <button mat-stroked-button color="accent" (click)="selectCourseForTasks(c)">
              <mat-icon>task</mat-icon> Manage Tasks
            </button>
          </mat-cell>
        </ng-container>
        <mat-header-row *matHeaderRowDef="['name', 'actions']"></mat-header-row>
        <mat-row *matRowDef="let row; columns: ['name', 'actions']"></mat-row>
      </mat-table>
    </div>

    <div *ngIf="selectedTaskCourse">
      <div class="applications-header">
        <button mat-icon-button (click)="selectedTaskCourse = null; courseTasks = []">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h3>Tasks: {{ selectedTaskCourse.name }} ({{ selectedTaskCourse.code }})</h3>
      </div>

      <button mat-raised-button color="primary" (click)="openTaskForm()">
        <mat-icon>add</mat-icon> Add Task
      </button>

      @if (courseTasks.length === 0) {
        <div class="empty-state" style="margin-top: 40px;">
          <mat-icon>assignment_late</mat-icon>
          <p>No tasks defined yet.</p>
        </div>
      } @else {
        <div class="task-list" style="margin-top: 20px;">
          <mat-card *ngFor="let task of courseTasks" class="task-card">
            <mat-card-header>
              <mat-card-title>{{ task.name }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ task.description || 'No description' }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-icon-button (click)="editTask(task)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteTask(task.id!)">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      }
    </div>

    @if (showTaskForm) {
      <div class="overlay">
        <div class="grade-box">
          <h3>{{ editingTask ? 'Edit' : 'Add' }} Task</h3>
          <form (ngSubmit)="saveTask()" #taskForm="ngForm">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Task Name</mat-label>
              <input matInput [(ngModel)]="newTask.name" name="name" required>
            </mat-form-field>
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Description (optional)</mat-label>
              <textarea matInput [(ngModel)]="newTask.description" name="description" rows="4"></textarea>
            </mat-form-field>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="taskForm.invalid">
                {{ editingTask ? 'Update' : 'Save' }}
              </button>
              <button mat-button (click)="cancelTaskForm()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    }
  </mat-dialog-content>
</ng-template>

   <ng-template #coursesDialog>
  <h2 mat-dialog-title>
    <mat-icon>book</mat-icon> My Courses ({{ courses.length }})
  </h2>

  <mat-dialog-content class="scrollable">
    <div *ngIf="!selectedCourse">
      @if (courses.length > 0) {
        <mat-table [dataSource]="courses" class="professional-table">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef><strong>Course Name</strong></mat-header-cell>
            <mat-cell *matCellDef="let c">
              <div class="course-name-wrapper">
                <strong class="course-name">{{ c.name }}</strong>
                <div class="course-description" *ngIf="c.description; else noDesc">
                  {{ c.description }}
                </div>
                <ng-template #noDesc>
                  <div class="course-description text-muted">
                    <em>No description available</em>
                  </div>
                </ng-template>
              </div>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="code">
            <mat-header-cell *matHeaderCellDef><strong>Code</strong></mat-header-cell>
            <mat-cell *matCellDef="let c">
              <strong class="course-code">{{ c.code }}</strong>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="program">
            <mat-header-cell *matHeaderCellDef><strong>Study Program</strong></mat-header-cell>
            <mat-cell *matCellDef="let c">
              <div class="program-info">
                <strong>{{ getStudyProgramName(c.studyProgramId) || 'N/A' }}</strong>
                <br>
                <small class="text-muted" *ngIf="c.year">Year {{ c.year }}</small>
              </div>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="ects">
            <mat-header-cell *matHeaderCellDef><strong>ECTS</strong></mat-header-cell>
            <mat-cell *matCellDef="let c">
              <strong>{{ c.ectsPoints }}</strong>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="teacher">
            <mat-header-cell *matHeaderCellDef><strong>Teacher</strong></mat-header-cell>
            <mat-cell *matCellDef="let c">
              {{ currentUser?.firstName }} {{ currentUser?.lastName }}
              <em class="you-label">(You)</em>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef class="actions-header"><strong>Actions</strong></mat-header-cell>
            <mat-cell *matCellDef="let c" class="actions-cell">
              <button mat-stroked-button color="primary" (click)="viewCourseApplications(c.id!)">
                <mat-icon>how_to_reg</mat-icon>
                Exam Applications
                @if (getPendingApplicationsCount(c.id!) > 0) {
                  <span class="badge">{{ getPendingApplicationsCount(c.id!) }}</span>
                }
              </button>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="courseColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: courseColumns" class="course-row"></mat-row>
        </mat-table>
      } @else {
        <div class="empty-state">
          <mat-icon>info</mat-icon>
          <p>No courses are currently assigned to you.</p>
        </div>
      }
    </div>

    <div *ngIf="selectedCourse" class="applications-view">
      <div class="applications-header">
        <button mat-icon-button (click)="goBackToCourses()" class="back-btn" matTooltip="Back to Courses">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h3>
          <mat-icon>assignment_turned_in</mat-icon>
          Exam Applications: {{ selectedCourse.name }}
        </h3>
      </div>

      @if (examApplicationsForSelectedCourse.length === 0) {
        <div class="empty-state">
          <mat-icon>hourglass_empty</mat-icon>
          <p>No students have applied for the exam yet.</p>
        </div>
      } @else {
        <mat-table [dataSource]="examApplicationsForSelectedCourse" class="applications-table">
  <ng-container matColumnDef="student">
    <mat-header-cell *matHeaderCellDef><strong>Student</strong></mat-header-cell>
    <mat-cell *matCellDef="let app">
      <strong>{{ app.user.firstName }} {{ app.user.lastName }}</strong><br>
      <small class="text-muted">{{ app.user.indexNumber }}</small>
    </mat-cell>
  </ng-container>

  <ng-container matColumnDef="term">
    <mat-header-cell *matHeaderCellDef><strong>Term</strong></mat-header-cell>
    <mat-cell *matCellDef="let app">{{ app.term }}</mat-cell>
  </ng-container>

  <ng-container matColumnDef="status">
    <mat-header-cell *matHeaderCellDef><strong>Status</strong></mat-header-cell>
    <mat-cell *matCellDef="let app">
      @if (getGradeForApp(app)) {
        <span class="status-graded">
          <strong>Graded: {{ getGradeForApp(app)?.grade }}</strong>
          <small>(Attempts {{ getGradeForApp(app)?.numberOfTakenExams }})</small>
        </span>
      } @else {
        <span class="status-pending">Awaiting Grade</span>
      }
    </mat-cell>
  </ng-container>

  <mat-header-row *matHeaderRowDef="applicationColumns"></mat-header-row>
  <mat-row *matRowDef="let row; columns: applicationColumns"></mat-row>
</mat-table>
      }
    </div>
  </mat-dialog-content>

  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>
   <ng-template #syllabusDialog>
  <h2 mat-dialog-title>
    <mat-icon>description</mat-icon> Syllabus Management
  </h2>

  <mat-dialog-content class="scrollable">

    <div *ngIf="!selectedSyllabusCourse">
      <h3>Your Courses ({{ courses.length }})</h3>
      @if (courses.length > 0) {
        <mat-table [dataSource]="courses" class="professional-table">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef><strong>Course</strong></mat-header-cell>
            <mat-cell *matCellDef="let c">
              <strong>{{ c.name }}</strong><br>
              <small class="text-muted">({{ c.code }})</small>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="program">
            <mat-header-cell *matHeaderCellDef><strong>Program</strong></mat-header-cell>
            <mat-cell *matCellDef="let c">
              {{ getStudyProgramName(c.studyProgramId) || 'N/A' }}
              <small *ngIf="c.year" class="text-muted"> – Year {{ c.year }}</small>
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="status">
            <mat-header-cell *matHeaderCellDef><strong>Syllabus Status</strong></mat-header-cell>
            <mat-cell *matCellDef="let c">
              @if (syllabuses[c.id!]) {
                <span class="status-uploaded">
                  <mat-icon class="small-icon">check_circle</mat-icon> Uploaded
                </span>
              } @else {
                <span class="status-missing">
                  <mat-icon class="small-icon">error</mat-icon> Not uploaded
                </span>
              }
            </mat-cell>
          </ng-container>

          <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef class="actions-header"><strong>Actions</strong></mat-header-cell>
            <mat-cell *matCellDef="let c" class="actions-cell">
              <button mat-stroked-button color="accent" (click)="openSyllabusDetail(c)">
                <mat-icon>description</mat-icon>
                Manage Syllabus
              </button>
            </mat-cell>
          </ng-container>

          <mat-header-row *matHeaderRowDef="syllabusCourseColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: syllabusCourseColumns" class="course-row"></mat-row>
        </mat-table>
      } @else {
        <div class="empty-state">
          <mat-icon>info</mat-icon>
          <p>No courses assigned to you.</p>
        </div>
      }
    </div>

    <div *ngIf="selectedSyllabusCourse" class="syllabus-detail-view">
      <div class="applications-header">
        <button mat-icon-button (click)="selectedSyllabusCourse = null" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h3>
          <mat-icon>description</mat-icon>
          Syllabus: {{ selectedSyllabusCourse.name }} ({{ selectedSyllabusCourse.code }})
        </h3>
      </div>

      @if (currentSyllabus) {
        <div class="current-syllabus">
          <h4>Current Syllabus</h4>
          <div class="syllabus-info-box">
            <p><strong>Academic Year:</strong> {{ currentSyllabus.academicYear || 'Not specified' }}</p>
            <p><strong>Uploaded PDF:</strong></p>
            <a [href]="currentSyllabus.content" target="_blank" class="pdf-link">
              <mat-icon>picture_as_pdf</mat-icon> Open Syllabus PDF
            </a>
          </div>

          <div class="syllabus-actions">
            <button mat-raised-button color="primary" (click)="openSyllabusForm(selectedSyllabusCourse)">
              <mat-icon>edit</mat-icon> Replace Syllabus
            </button>
            <button mat-stroked-button color="warn" (click)="deleteCurrentSyllabus()">
              <mat-icon>delete</mat-icon> Delete Syllabus
            </button>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>description</mat-icon>
          <p>No syllabus uploaded for this course yet.</p>
          <button mat-raised-button color="primary" (click)="openSyllabusForm(selectedSyllabusCourse)">
            <mat-icon>add</mat-icon> Upload Syllabus
          </button>
        </div>
      }
    </div>

    @if (showSyllabusForm && selectedSyllabusCourse) {
      <div class="overlay">
        <div class="grade-box syllabus-form-box">
          <h3>{{ editingSyllabus ? 'Replace' : 'Upload' }} Syllabus</h3>
          <p><strong>Course:</strong> {{ selectedSyllabusCourse.name }} ({{ selectedSyllabusCourse.code }})</p>

          <form #syllabusForm="ngForm" (ngSubmit)="saveSyllabus()">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>PDF URL (direct link)</mat-label>
              <input matInput [(ngModel)]="newSyllabus.content" name="content" required placeholder="https://example.com/syllabus.pdf">
              <mat-hint>Enter a publicly accessible PDF link</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Academic Year (optional)</mat-label>
              <input matInput [(ngModel)]="newSyllabus.academicYear" name="year" placeholder="2024/2025">
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="syllabusForm.invalid">
                {{ editingSyllabus ? 'Update' : 'Upload' }}
              </button>
              <button mat-button (click)="cancelSyllabusForm()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    }
  </mat-dialog-content>
</ng-template>

    <ng-template #gradingDialog>
  <h2 mat-dialog-title><mat-icon>grading</mat-icon> Grade Exams</h2>
  <mat-dialog-content class="scrollable grading-content">

    @if (isLoadingGrading) {
      <div class="loading-state">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading exam applications for your courses...</p>
      </div>
    } @else {

      <div class="search-section">
        <mat-form-field appearance="fill" class="search-field">
          <mat-label>Search student by name or index number</mat-label>
          <input matInput 
                 [(ngModel)]="studentSearchTerm" 
                 (ngModelChange)="filterStudentsWithApps(studentSearchTerm)"
                 placeholder="e.g. John or 12345">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <small class="search-hint">
          {{ filteredStudentsWithApps.length }} of {{ studentsWithApps.length }} students
        </small>
      </div>

      @if (studentsWithApps.length === 0) {
        <div class="empty-state">
          <mat-icon>info</mat-icon>
          <p>No exam applications in your courses yet.</p>
        </div>
      } 
      @else if (filteredStudentsWithApps.length === 0) {
        <div class="empty-state">
          <mat-icon>search_off</mat-icon>
          <p>No students found matching "{{ studentSearchTerm }}"</p>
          <p class="text-muted">Try a different name or index number.</p>
        </div>
      } 

      @else {
        <h3>Students with Applications</h3>
        <mat-table [dataSource]="filteredStudentsWithApps" class="students-table">
          <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef><strong>Student</strong></mat-header-cell>
            <mat-cell *matCellDef="let s">
              <strong>{{ s.firstName }} {{ s.lastName }}</strong><br>
              <small class="text-muted">Index: {{ s.indexNumber }}</small>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="pending">
            <mat-header-cell *matHeaderCellDef><strong>Pending</strong></mat-header-cell>
            <mat-cell *matCellDef="let s">
              <span class="pending-badge">{{ getPendingCount(s.id!) }}</span>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="graded">
            <mat-header-cell *matHeaderCellDef><strong>Graded</strong></mat-header-cell>
            <mat-cell *matCellDef="let s">
              <span class="graded-badge">{{ getGradedCount(s.id!) }}</span>
            </mat-cell>
          </ng-container>
          <ng-container matColumnDef="action">
            <mat-header-cell *matHeaderCellDef></mat-header-cell>
            <mat-cell *matCellDef="let s">
              <button mat-stroked-button color="primary" (click)="selectStudentForGrading(s)">
                View & Grade
              </button>
            </mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="['name','pending','graded','action']"></mat-header-row>
          <mat-row *matRowDef="let row; columns: ['name','pending','graded','action']"></mat-row>
        </mat-table>
      }
    }


    @if (selectedGradingStudent) {
      <div class="student-detail">
        <div class="student-header">
          <button mat-icon-button (click)="selectedGradingStudent = null">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h3>
            {{ selectedGradingStudent.firstName }} {{ selectedGradingStudent.lastName }}
            <small class="text-muted">({{ selectedGradingStudent.indexNumber }})</small>
          </h3>
        </div>

        @if (pendingAppsForStudent.length > 0) {
          <div class="section">
            <h4 class="pending-title">Pending Grading</h4>
            <mat-table [dataSource]="pendingAppsForStudent">
  <ng-container matColumnDef="course">
    <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
    <mat-cell *matCellDef="let app">
      {{ app.course.name }} ({{ app.course.code }})
    </mat-cell>
  </ng-container>

  <ng-container matColumnDef="term">
    <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
    <mat-cell *matCellDef="let app">{{ app.term }}</mat-cell>
  </ng-container>

  <ng-container matColumnDef="examDate">
  <mat-header-cell *matHeaderCellDef>Exam Date</mat-header-cell>
  <mat-cell *matCellDef="let app">
    @if (getExamDateForCourseAndTerm(app.course.id, app.term); as date) {
      <strong>{{ date | date:'mediumDate' }}</strong>
    } @else {
      <span class="text-muted">
        Not scheduled<br>
        <small>(Course: {{ app.course.name }}, Term: {{ app.term }})</small>
      </span>
    }
  </mat-cell>
</ng-container>

  <ng-container matColumnDef="action">
    <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
    <mat-cell *matCellDef="let app">
      <button mat-raised-button color="primary" 
              (click)="openGradeFormForApp(app)"
              [disabled]="isGradingPeriodOver(app)">
        Grade Exam
      </button>
      <button mat-icon-button color="warn" 
              (click)="deleteExamApplication(app)"
              matTooltip="Delete Application">
        <mat-icon>delete</mat-icon>
      </button>
    </mat-cell>
  </ng-container>

  <mat-header-row *matHeaderRowDef="['course','term','examDate','action']"></mat-header-row>
  <mat-row *matRowDef="let row; columns: ['course','term','examDate','action']"></mat-row>
</mat-table>
          </div>
        }

        @if (gradedAppsForStudent.length > 0) {
          <div class="section">
            <h4 class="graded-title">Graded Exams</h4>
            <mat-table [dataSource]="gradedAppsForStudent">
              <ng-container matColumnDef="course">
                <mat-header-cell *matHeaderCellDef>Course</mat-header-cell>
                <mat-cell *matCellDef="let item">{{ item.app.course.name }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="term">
                <mat-header-cell *matHeaderCellDef>Term</mat-header-cell>
                <mat-cell *matCellDef="let item">{{ item.app.term }}</mat-cell>
              </ng-container>
              <ng-container matColumnDef="grade">
                <mat-header-cell *matHeaderCellDef>Grade</mat-header-cell>
                <mat-cell *matCellDef="let item">
                  <strong class="grade-success">{{ item.grade.grade }}</strong>
                  <small>(Attempt {{ item.grade.numberOfTakenExams }})</small>
                </mat-cell>
              </ng-container>
              <ng-container matColumnDef="action">
                <mat-header-cell *matHeaderCellDef></mat-header-cell>
                <mat-cell *matCellDef="let item">
                  <button mat-stroked-button color="warn" (click)="deleteExamGrade(item.grade.id)">
                    Delete Grade
                  </button>
                </mat-cell>
              </ng-container>
              <mat-header-row *matHeaderRowDef="['course','term','grade','action']"></mat-header-row>
              <mat-row *matRowDef="let row; columns: ['course','term','grade','action']"></mat-row>
            </mat-table>
          </div>
        }

        @if (pendingAppsForStudent.length === 0 && gradedAppsForStudent.length === 0) {
          <p class="text-muted">No applications found for this student.</p>
        }
      </div>
    }

    @if (showGradeForm && currentGradingApp) {
      <div class="overlay">
        <div class="grade-box">
          <h3>Assign Grade</h3>
          <p><strong>Course:</strong> {{ currentGradingApp.course.name }}</p>
          <p><strong>Term:</strong> {{ currentGradingApp.term }}</p>
          <p><strong>Student:</strong> {{ selectedGradingStudent?.firstName }} {{ selectedGradingStudent?.lastName }} ({{ selectedGradingStudent?.indexNumber }})</p>
          <form #gradeForm="ngForm" (ngSubmit)="submitGrade()">
            <mat-form-field appearance="fill">
              <mat-label>Grade (5–10)</mat-label>
              <input matInput type="number" [(ngModel)]="newGrade" name="grade" required min="5" max="10">
            </mat-form-field>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="gradeForm.invalid">
                Submit Grade
              </button>
              <button mat-button (click)="cancelGradeForm()">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    }
  </mat-dialog-content>
</ng-template> 
    <ng-template #notificationsDialog>
  <h2 mat-dialog-title>
    <mat-icon>notifications</mat-icon> Notifications
    <small *ngIf="notifications.length">({{ notifications.length }})</small>
  </h2>

  <mat-dialog-content class="notifications-content">

    <div *ngIf="!notifications.length" class="empty-state">
      <mat-icon>notifications_none</mat-icon>
      <p>No notifications at the moment</p>
    </div>

    <mat-table 
      *ngIf="notifications.length" 
      [dataSource]="notifications" 
      class="notifications-table">

      
      <ng-container matColumnDef="date">
        <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>
        <mat-cell *matCellDef="let n">
          {{ n.createdAt | date:'mediumDate' }} 
          <br>
          <small class="time">{{ n.createdAt | date:'shortTime' }}</small>
        </mat-cell>
      </ng-container>

      
      <ng-container matColumnDef="title">
        <mat-header-cell *matHeaderCellDef>Title</mat-header-cell>
        <mat-cell *matCellDef="let n">
          <strong>{{ n.title }}</strong>
        </mat-cell>
      </ng-container>

      
      <ng-container matColumnDef="message">
        <mat-header-cell *matHeaderCellDef>Message</mat-header-cell>
        <mat-cell *matCellDef="let n">
          {{ n.message }}
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="displayedNotificationColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedNotificationColumns;"></mat-row>

    </mat-table>

  </mat-dialog-content>

  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>



<ng-template #allStudentsDialog>
  <h2 mat-dialog-title>
    <mat-icon>people</mat-icon> All Students ({{ filteredAllStudents.length }})
  </h2>
  <mat-dialog-content class="scrollable">

    <mat-form-field appearance="fill" class="search-bar">
      <mat-label>Search students</mat-label>
      <input matInput 
             [(ngModel)]="studentSearchQuery" 
             (ngModelChange)="filterAllStudents()"
             placeholder="Name, index number, email">
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>

    <mat-table [dataSource]="filteredAllStudents" class="professional-table">

      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef><strong>Student</strong></mat-header-cell>
        <mat-cell *matCellDef="let s">
          <div>
            <strong>{{ s.firstName }} {{ s.lastName }}</strong><br>
            <small class="text-muted">Index: {{ s.indexNumber || '—' }}</small>
          </div>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="program">
        <mat-header-cell *matHeaderCellDef><strong>Program</strong></mat-header-cell>
        <mat-cell *matCellDef="let s">
          {{ getStudentProgramName(s.id!) || 'Not enrolled' }}
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="ects">
        <mat-header-cell *matHeaderCellDef><strong>Passed ECTS</strong></mat-header-cell>
        <mat-cell *matCellDef="let s">
          <strong class="ects-highlight">{{ getStudentPassedECTS(s.id!) }}</strong>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="actions">
  <mat-header-cell *matHeaderCellDef></mat-header-cell>
  <mat-cell *matCellDef="let s">
    <div class="student-actions">
      <button mat-stroked-button color="primary" 
              (click)="viewStudentCourses(s); $event.stopPropagation()"
              matTooltip="View enrolled courses">
        <mat-icon>book</mat-icon>
        Courses
      </button>

      <button mat-stroked-button color="accent" 
              (click)="viewStudentGrades(s); $event.stopPropagation()"
              matTooltip="View exam grades">
        <mat-icon>grade</mat-icon>
        Grades
      </button>

      <button mat-stroked-button color="warn" 
              (click)="viewStudentApplications(s); $event.stopPropagation()"
              matTooltip="View exam applications">
        <mat-icon>how_to_reg</mat-icon>
        Applications
      </button>
    </div>
  </mat-cell>
</ng-container>

      <mat-header-row *matHeaderRowDef="['name', 'program', 'ects', 'actions']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['name', 'program', 'ects', 'actions']">(click)="$event.stopPropagation()"></mat-row>
    </mat-table>

    @if (filteredAllStudents.length === 0) {
      <div class="empty-state">
        <mat-icon>search_off</mat-icon>
        <p>No students found matching your search.</p>
      </div>
    }
  </mat-dialog-content>

  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>Close</button>
  </mat-dialog-actions>
</ng-template>


<ng-template #studentCoursesDialog>
  <h2 mat-dialog-title>
    <button mat-icon-button (click)="closeStudentDetail()">
      <mat-icon>arrow_back</mat-icon>
    </button>
    Enrolled Courses - {{ selectedStudent?.firstName }} {{ selectedStudent?.lastName }}
  </h2>
  <mat-dialog-content>
    @if (studentCourseList.length === 0) {
      <div class="empty-state">
        <mat-icon>info</mat-icon>
        <p>No courses enrolled.</p>
      </div>
    } @else {
      <mat-list>
        <mat-list-item *ngFor="let course of studentCourseList">
          <strong matLine>{{ course }}</strong>
        </mat-list-item>
      </mat-list>
    }
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button (click)="closeStudentDetail()">Close</button>
  </mat-dialog-actions>
</ng-template>


<ng-template #studentGradesDialog>
  <h2 mat-dialog-title>
    <button mat-icon-button (click)="closeStudentDetail()">
      <mat-icon>arrow_back</mat-icon>
    </button>
    Exam Grades - {{ selectedStudent?.firstName }} {{ selectedStudent?.lastName }}
  </h2>
  <mat-dialog-content>
    @if (studentGradeList.length === 0) {
      <div class="empty-state">
        <mat-icon>info</mat-icon>
        <p>No graded exams.</p>
      </div>
    } @else {
      <mat-list>
        <mat-list-item *ngFor="let grade of studentGradeList">
          <span [innerHTML]="grade" matLine></span>
        </mat-list-item>
      </mat-list>
    }
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button (click)="closeStudentDetail()">Close</button>
  </mat-dialog-actions>
</ng-template>


<ng-template #studentApplicationsDialog>
  <h2 mat-dialog-title>
    <button mat-icon-button (click)="closeStudentDetail()">
      <mat-icon>arrow_back</mat-icon>
    </button>
    Exam Applications - {{ selectedStudent?.firstName }} {{ selectedStudent?.lastName }}
  </h2>
  <mat-dialog-content>
    @if (studentApplicationList.length === 0) {
      <div class="empty-state">
        <mat-icon>info</mat-icon>
        <p>No exam applications.</p>
      </div>
    } @else {
      <mat-list>
        <mat-list-item *ngFor="let app of studentApplicationList">
          <span [innerHTML]="app" matLine></span>
        </mat-list-item>
      </mat-list>
    }
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button (click)="closeStudentDetail()">Close</button>
  </mat-dialog-actions>
</ng-template>
  `,
  styles: [`

  .syllabus-detail-view { margin-top: 20px; }
.current-syllabus { background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; }
.syllabus-info-box { margin: 16px 0; }
.pdf-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #d32f2f;
  font-weight: 500;
  text-decoration: none;
}
.pdf-link:hover { text-decoration: underline; }
.syllabus-actions { margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap; }
.status-uploaded { color: #4caf50; font-weight: bold; display: flex; align-items: center; gap: 6px; }
.status-missing { color: #ff9800; font-weight: bold; display: flex; align-items: center; gap: 6px; }
.small-icon { font-size: 18px; width: 18px; height: 18px; }
.full-width { width: 100%; }
.syllabus-form-box { max-width: 500px; width: 100%; }
  .grading-content { padding: 20px; }
.loading-state { text-align: center; padding: 60px; }
.students-table { margin-bottom: 30px; }
.pending-badge { background: #ff9800; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; }
.graded-badge { background: #4caf50; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; }
.student-detail { margin-top: 30px; }
.student-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; }
.pending-title { color: #ff9800; }
.graded-title { color: #4caf50; }
.grade-success { color: #4caf50; font-size: 1.3rem; font-weight: bold; }
.status-graded { color: #4caf50; font-weight: bold; }
.status-pending { color: #ff9800; font-weight: bold; }
.student-actions.vertical {
  display: flex;
  flex-direction: column;      
  gap: 8px;                   
  align-items: stretch;       
  padding: 4px 0;
}

.student-actions button {
  justify-content: flex-start;  
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;     
  min-height: 36px;
  line-height: 1.4;
  padding: 0 12px;
}

.actions-cell {
  padding: 12px 8px !important;  
  vertical-align: middle;
}

.mat-column-actions {
  width: 140px;             
  min-width: 140px;
  max-width: 180px;
}

.mat-header-cell.mat-column-actions {
  text-align: center;
}
    .dashboard-header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 0 0 20px 20px; }
    .welcome { margin: 10px 0 0; font-size: 1.3rem; }
    .loading { text-align: center; padding: 100px; }
    .dashboard-grid { padding: 30px; display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); max-width: 1400px; margin: 0 auto; }
    .action-card { cursor: pointer; transition: all 0.3s; height: 100%; }
    .action-card:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.2) !important; }
    .icon { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; }
    .courses { background: #1976d2; }
    .syllabus { background: #7b1fa2; }
    .grading { background: #d32f2f; }
    .notify { background: #f57c00; }
    .scrollable { max-height: 75vh; overflow-y: auto; }
    .attempt-info {
  font-size: 0.8em;
  color: #666;
  margin-left: 4px;
  .professional-table {
  width: 100%;
  background: transparent;
}

.professional-table mat-header-cell {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.course-row:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

.course-title {
  margin-bottom: 6px;
}

.course-code {
  color: #1976d2;
  font-weight: 500;
}

.course-description {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
}

.program-name {
  font-weight: 500;
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
}

.small-icon {
  font-size: 18px;
  width: 18px;
  height: 18px;
  vertical-align: middle;
  margin-right: 6px;
  color: #666;
}

.actions-cell {
  text-align: right;
}

.actions-header {
  text-align: right;
}

.badge {
  background: #d32f2f;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}

.applications-section {
  margin-top: 40px;
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
}

.applications-title {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.close-btn {
  margin-left: auto;
}

.status-pending {
  color: #f57c00;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state mat-icon {
  font-size: 48px;
  width: 48px;
  height: 48px;
  opacity: 0.5;
  margin-bottom: 16px;
  display: block;
}
}
.course-code {
  color: #1976d2;
  font-weight: 600;
  font-size: 0.95rem;
  margin-top: 4px;
}

.course-title {
  margin-bottom: 4px;
}

.course-description {
  font-size: 0.9rem;
  color: #555;
  margin-top: 8px;
  line-height: 1.4;
}
.search-section {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.search-field {
  flex: 1;
  min-width: 300px;
}
.search-hint {
  color: #666;
  font-size: 0.9rem;
}
.session { background: #ab47bc; }
.tasks { background: #26a69a; }
.description-card { margin: 12px 0; }
.task-card { margin: 12px 0; }
.notifications-content {
  padding: 16px 0;
}

.notifications-table {
  width: 100%;
}

.notifications-table mat-header-cell {
  font-weight: 600;
  color: #333;
  background: #f5f5f5;
}

.notifications-table mat-cell {
  vertical-align: middle;
  padding: 12px 16px !important;
}

.notifications-table .mat-column-date {
  width: 140px;
  min-width: 140px;
}

.notifications-table .mat-column-title {
  width: 220px;
  min-width: 180px;
}

.notifications-table .time {
  color: #666;
  font-size: 0.82rem;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #757575;
}

.empty-state mat-icon {
  font-size: 64px;
  width: 64px;
  height: 64px;
  opacity: 0.4;
  margin-bottom: 16px;
}
  `]
})
export class TeacherDashboardComponent implements OnInit {

  @ViewChild('coursesDialog') coursesDialog!: TemplateRef<any>;
  @ViewChild('syllabusDialog') syllabusDialog!: TemplateRef<any>;
  @ViewChild('gradingDialog') gradingDialog!: TemplateRef<any>;
  @ViewChild('notificationsDialog') notificationsDialog!: TemplateRef<any>;
  @ViewChild('sessionDetailsDialog') sessionDetailsDialog!: TemplateRef<any>;
@ViewChild('courseTasksDialog') courseTasksDialog!: TemplateRef<any>;
@ViewChild('allStudentsDialog') allStudentsDialog!: TemplateRef<any>;
@ViewChild('studentCoursesDialog') studentCoursesDialog!: TemplateRef<any>;
@ViewChild('studentGradesDialog') studentGradesDialog!: TemplateRef<any>;
@ViewChild('studentApplicationsDialog') studentApplicationsDialog!: TemplateRef<any>;

    currentUser = this.apiService.getCurrentUser();

  isLoading = true;
  courses: Course[] = [];
  syllabuses: { [key: number]: Syllabus } = {};
  notifications: Notification[] = [];

  filteredStudents: User[] = [];
  selectedStudent: User | null = null;
  studyHistory: StudyHistory[] = [];

  showSyllabusForm = false;
  editingSyllabus: Syllabus | null = null;
  newSyllabus: Syllabus = { courseId: 0, content: '', academicYear: '' };

  showGradeForm = false;
  gradingHistory: StudyHistory | null = null;
  newGrade: number | null = null;
  numberOfTakenExams = 1;

  searchCategory: 'name' | 'indexNumber' = 'name';
  searchTerm = '';

  showCourseApplications = false;
  selectedCourse: Course | null = null;
  courseApplications: StudyHistory[] = [];
  filteredCourseApplications: any[] = [];
  appSearchCategory: 'name' | 'indexNumber' = 'name';
  appSearchTerm = '';

   courseColumns = ['name', 'code', 'program', 'ects', 'teacher', 'actions'];
  applicationColumns = ['student', 'term', 'status']; 
  teacherApplications: ExamApplication[] = [];
  allExamGrades: ExamGrade[] = [];
  studentsWithApps: User[] = [];
  selectedGradingStudent: User | null = null;
  pendingAppsForStudent: ExamApplication[] = [];
  gradedAppsForStudent: { app: ExamApplication; grade: ExamGrade }[] = [];
  currentGradingApp: ExamApplication | null = null;
  isLoadingGrading = false;

  studyPrograms: any[] = []; 
  studentColumns = ['name', 'index', 'action'];
  historyColumns = ['courseName', 'term', 'grade', 'action'];
  
  examApplicationsForSelectedCourse: ExamApplication[] = [];
  allExamApplications: ExamApplication[] = [];

  selectedSyllabusCourse: Course | null = null;
currentSyllabus: Syllabus | null = null;
syllabusCourseColumns = ['name', 'program', 'status', 'actions'];

studentSearchTerm = '';
filteredStudentsWithApps: User[] = [];
displayedNotificationColumns: string[] = ['date', 'title', 'message'];

weeklySchedules: WeeklySchedule[] = [];
selectedWeeklySchedule: WeeklySchedule | null = null;
teacherScheduleEntries: ScheduleEntry[] = [];
selectedScheduleEntry: ScheduleEntry | null = null;
scheduleEntryDescriptions: ScheduleEntryDescription[] = [];
currentDescription: ScheduleEntryDescription = { name: '', description: '', scheduleEntryId: 0 };
showDescriptionForm = false;
editingDescription: ScheduleEntryDescription | null = null;

days: { [key: string]: string } = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday'
};

selectedTaskCourse: Course | null = null;
courseTasks: CourseTask[] = [];
newTask: CourseTask = { name: '', description: '', courseId: 0 };
showTaskForm = false;
editingTask: CourseTask | null = null;

allStudents: User[] = [];
filteredAllStudents: User[] = [];
studentSearchQuery = '';

studentCourseList: string[] = [];
studentGradeList: string[] = [];
studentApplicationList: string[] = [];
currentDetailDialog: any = null;

private today = new Date();

terms: Term[] = [];
termSchedules: TermSchedule[] = [];
private studentPrograms = new Map<number, StudyProgram | null>();
private studentPassedECTS = new Map<number, number>();
private studentSearchTerm$ = new Subject<string>();
onStudentSearch(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  this.studentSearchTerm$.next(value);
}

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const user = this.apiService.getCurrentUser();
    if (!user || user.role !== 'TEACHER') {
      this.snackBar.open('Unauthorized access', 'Close', { duration: 3003 });
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.studentSearchTerm$.pipe(
    debounceTime(300),
    distinctUntilChanged()
  ).subscribe(term => {
    this.filterStudentsWithApps(term);
  });
    Promise.all([
      this.loadCourses(),
      this.loadSyllabuses(),
      this.loadNotifications(),
      this.loadStudyPrograms(),
      this.loadTermSchedules(),
      this.loadTerms(),
      this.loadAllTermSchedules()
    ]).finally(() => {
      this.isLoading = false;
      this.loadAllStudents();
    });
  }

  private loadCourses(): Promise<void> {
  return new Promise((resolve) => {
    const currentTeacherId = this.apiService.getCurrentUser()?.id;

    if (!currentTeacherId) {
      this.snackBar.open('Teacher not logged in', 'Error', { duration: 5000 });
      this.courses = [];
      resolve();
      return;
    }

    this.apiService.getAllCourses().subscribe({
      next: (allCourses: Course[]) => {
        
        this.courses = allCourses.filter(course => 
          course.teacherId === currentTeacherId
        );

        if (this.courses.length === 0) {
          this.snackBar.open('No courses assigned to you yet', 'Info', { duration: 5000 });
        } else {
          this.snackBar.open(`Loaded ${this.courses.length} your course(s)`, 'Success', { duration: 3000 });
        }
        resolve();
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
        this.snackBar.open('Failed to load your courses', 'Error', { duration: 5000 });
        this.courses = [];
        resolve();
      }
    });
  });
}

  private loadSyllabuses(): Promise<void> {
    return new Promise((resolve) => {
      this.apiService.getSyllabuses().subscribe({
        next: (syllabuses: Syllabus[]) => {
          this.syllabuses = syllabuses.reduce((acc, syllabus) => {
            if (syllabus.courseId) {
              acc[syllabus.courseId] = syllabus;
            }
            return acc;
          }, {} as { [key: number]: Syllabus });
          console.log('Syllabuses loaded:', this.syllabuses);
          resolve();
        },
        error: (err: any) => {
          console.error('Failed to load syllabuses:', err);
          this.snackBar.open('Failed to load syllabuses: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
          resolve();
        }
      });
    });
  }

  private loadNotifications(): Promise<void> {
    return new Promise((resolve) => {
      this.apiService.getNotifications().subscribe({
        next: (notifications: Notification[]) => {
          this.notifications = notifications.filter(n => n.recipientRole === 'TEACHER');
          if (this.notifications.length === 0) {
            this.snackBar.open('No notifications available', 'Close', { duration: 3003 });
          }
          resolve();
        },
        error: (err: any) => {
          console.error('Failed to load notifications:', err);
          this.snackBar.open('Failed to load notifications: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
          resolve();
        }
      });
    });
  }

  deleteSyllabus(): void {
    if (this.editingSyllabus && this.editingSyllabus.id) {
      this.apiService.deleteSyllabus(this.editingSyllabus.id).subscribe({
        next: () => {
          delete this.syllabuses[this.editingSyllabus!.courseId];
          this.showSyllabusForm = false;
          this.newSyllabus = { courseId: 0, content: '' };
          this.snackBar.open('Syllabus deleted successfully', 'Close', { duration: 3003 });
        },
        error: (err: any) => {
          console.error('Failed to delete syllabus:', err);
          this.snackBar.open('Failed to delete syllabus: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
        }
      });
    }
  }

  cancelSyllabusForm(): void {
    this.showSyllabusForm = false;
    this.newSyllabus = { courseId: 0, content: '' };
    this.editingSyllabus = null;
  }

 

  private loadCourseApplications(courseId: number): void {
    this.apiService.getStudentsByQuery('').subscribe({
      next: (students: User[]) => {
        const studentIds = students
          .filter(s => s.role === 'STUDENT' && s.enrolledCourses?.some(c => c.id === courseId))
          .map(s => s.id!);
        if (studentIds.length === 0) {
          this.courseApplications = [];
          this.filteredCourseApplications = [];
          this.snackBar.open('No students enrolled in this course', 'Close', { duration: 3003 });
          return;
        }
        const historyRequests = studentIds.map(id =>
          this.apiService.getStudentHistory(id).pipe(
            catchError(() => of([] as StudyHistory[]))
          )
        );
        forkJoin(historyRequests).subscribe({
          next: (histories: StudyHistory[][]) => {
            this.courseApplications = histories.flat().filter(h => h.courseId === courseId);
            this.filteredCourseApplications = this.courseApplications.map(h => ({
              ...h,
              student: students.find(s => {
                let found = false;
                this.apiService.getExamApplicationsByUserId(s.id!).pipe(
                  catchError(() => of([] as ExamApplication[]))
                ).subscribe(apps => {
                  found = apps.some(a => a.course.id === h.courseId && a.term === h.term);
                });
                return found;
              })
            }));
            if (this.courseApplications.length === 0) {
              this.snackBar.open('No exam applications for this course', 'Close', { duration: 3003 });
            }
          },
          error: (err: any) => {
            console.error('Failed to load course applications:', err);
            this.snackBar.open('Failed to load course applications: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
            this.courseApplications = [];
            this.filteredCourseApplications = [];
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to load students:', err);
        this.snackBar.open('Failed to load students: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
        this.courseApplications = [];
        this.filteredCourseApplications = [];
      }
    });
  }

  searchCourseApplications(): void {
    if (!this.appSearchTerm.trim()) {
      this.filteredCourseApplications = this.courseApplications.map(h => ({
        ...h,
        student: this.filteredStudents.find(s => {
          let found = false;
          this.apiService.getExamApplicationsByUserId(s.id!).pipe(
            catchError(() => of([] as ExamApplication[]))
          ).subscribe(apps => {
            found = apps.some(a => a.course.id === h.courseId && a.term === h.term);
          });
          return found;
        })
      }));
      return;
    }
    this.filteredCourseApplications = this.courseApplications
      .map(h => ({
        ...h,
        student: this.filteredStudents.find(s => {
          let found = false;
          this.apiService.getExamApplicationsByUserId(s.id!).pipe(
            catchError(() => of([] as ExamApplication[]))
          ).subscribe(apps => {
            found = apps.some(a => a.course.id === h.courseId && a.term === h.term);
          });
          return found;
        })
      }))
      .filter(app => {
        if (!app.student) return false;
        if (this.appSearchCategory === 'name') {
          const fullName = `${app.student.firstName} ${app.student.lastName}`.toLowerCase();
          return fullName.includes(this.appSearchTerm.toLowerCase());
        } else {
          return app.student.indexNumber?.toLowerCase().includes(this.appSearchTerm.toLowerCase());
        }
      });
    if (this.filteredCourseApplications.length === 0) {
      this.snackBar.open('No applications match the search criteria', 'Close', { duration: 3003 });
    }
  }

  clearCourseApplications(): void {
    this.showCourseApplications = false;
    this.selectedCourse = null;
    this.courseApplications = [];
    this.filteredCourseApplications = [];
    this.appSearchTerm = '';
    this.appSearchCategory = 'name';
  }

  searchStudents(): void {
  if (!this.searchTerm.trim()) {
    this.filteredStudents = [];
    this.selectedStudent = null;
    this.studyHistory = [];
    return;
  }

  const term = this.searchTerm.trim().toLowerCase();


  if (this.allExamApplications.length === 0) {
    this.apiService.getAllExamApplications().subscribe({
      next: (apps: ExamApplication[]) => {
        this.allExamApplications = apps;

        this.filterStudentsFromApplications(term);
      },
      error: () => {
        this.snackBar.open('Failed to load exam applications', 'Error', { duration: 5000 });
        this.filteredStudents = [];
      }
    });
  } else {
    this.filterStudentsFromApplications(term);
  }
}

private filterStudentsFromApplications(term: string): void {
  const uniqueStudents = new Map<number, User>();

  this.allExamApplications.forEach(app => {
    const user = app.user;
    if (user && user.role === 'STUDENT' && !uniqueStudents.has(user.id!)) {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const indexMatch = user.indexNumber?.toLowerCase().includes(term);

      if (fullName.includes(term) || indexMatch) {
        uniqueStudents.set(user.id!, user);
      }
    }
  });

  this.filteredStudents = Array.from(uniqueStudents.values());

  if (this.filteredStudents.length === 0) {
    this.snackBar.open('No students found with exam applications', 'Info', { duration: 4000 });
  } else {
    this.snackBar.open(`Found ${this.filteredStudents.length} student(s)`, 'Success', { duration: 3000 });
  }

  this.selectedStudent = null;
  this.studyHistory = [];
}

  viewStudentDetails(userId: number): void {
    const student = this.filteredStudents.find(s => s.id === userId);
    if (!student) {
      this.snackBar.open('Student not found in search results', 'Close', { duration: 3003 });
      return;
    }
    if (student.role !== 'STUDENT') {
      this.snackBar.open('Selected user is not a student', 'Close', { duration: 3003 });
      return;
    }
    this.selectedStudent = student;
    this.loadStudentHistory(userId);

    
  }

  private loadStudentHistory(userId: number): void {
    this.apiService.getStudentHistory(userId).subscribe({
      next: (history: StudyHistory[]) => {
        this.studyHistory = history;
        if (history.length === 0) {
          this.snackBar.open('No study history for this student', 'Close', { duration: 3003 });
        }
      },
      error: (err: any) => {
        console.error('Failed to load student history:', err);
        this.snackBar.open('Failed to load student history: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
        this.studyHistory = [];
      }
    });
  }

  openGradeForm(history: StudyHistory): void {
    this.showGradeForm = true;
    this.gradingHistory = history;
    this.newGrade = null;
    this.numberOfTakenExams = history.examsTaken + 1;
  }



private submitGradeAfterLoad(): void {
  const apps = this.allExamApplications.filter(app => 
    app.user.id === this.selectedStudent!.id &&
    app.course.id === this.gradingHistory!.courseId &&
    app.term === this.gradingHistory!.term
  );

  if (apps.length === 0) {
    this.snackBar.open('No application found for this course/term', 'Error');
    return;
  }

  const latestApp = apps[apps.length - 1];
  const attempts = this.getExamAttemptsCount(this.selectedStudent!.id!, this.gradingHistory!.courseId);

  this.apiService.gradeExam(latestApp.id, this.newGrade!, attempts).subscribe({
    next: () => {
      this.snackBar.open(`Grade ${this.newGrade} saved! (Attempt ${attempts})`, 'Success', { duration: 5000 });
      this.showGradeForm = false;
      this.gradingHistory = null;
      this.newGrade = null;
      this.loadStudentHistory(this.selectedStudent!.id!);
    },
    error: (err) => {
      console.error('Grade failed:', err);
      this.snackBar.open('Failed to save grade', 'Error');
    }
  });
}

  deleteCourseApplication(history: StudyHistory & { student?: User }): void {
    if (!history.student?.id) {
      this.snackBar.open('Student information missing', 'Close', { duration: 3003 });
      return;
    }
    this.apiService.getExamApplicationsByUserId(history.student.id).subscribe({
      next: (applications: ExamApplication[]) => {
        const application = applications.find(app => 
          app.course.id === history.courseId && 
          app.term === history.term
        );
        if (!application) {
          this.snackBar.open('Exam application not found', 'Close', { duration: 3003 });
          return;
        }
        this.apiService.deleteExamApplication(application.id).subscribe({
          next: () => {
            this.snackBar.open('Exam application deleted successfully', 'Close', { duration: 3003 });
            this.loadCourseApplications(this.selectedCourse!.id!);
          },
          error: (err: any) => {
            console.error('Failed to delete exam application:', err);
            this.snackBar.open('Failed to delete exam application: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to fetch exam applications:', err);
        this.snackBar.open('Failed to fetch exam applications: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
      }
    });
  }

  deleteStudentApplication(history: StudyHistory): void {
    this.apiService.getExamApplicationsByUserId(this.selectedStudent!.id!).subscribe({
      next: (applications: ExamApplication[]) => {
        const application = applications.find(app => 
          app.course.id === history.courseId && 
          app.term === history.term
        );
        if (!application) {
          this.snackBar.open('Exam application not found', 'Close', { duration: 3003 });
          return;
        }
        this.apiService.deleteExamApplication(application.id).subscribe({
          next: () => {
            this.snackBar.open('Exam application deleted successfully', 'Close', { duration: 3003 });
            this.loadStudentHistory(this.selectedStudent!.id!);
          },
          error: (err: any) => {
            console.error('Failed to delete exam application:', err);
            this.snackBar.open('Failed to delete exam application: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to fetch exam applications:', err);
        this.snackBar.open('Failed to fetch exam applications: ' + (err.message || 'Unknown error'), 'Close', { duration: 3003 });
      }
    });
  }

  cancelGradeForm(): void {
    this.showGradeForm = false;
    this.gradingHistory = null;
    this.newGrade = null;
    this.numberOfTakenExams = 1;
  }

  openDialog(type: 'courses' | 'syllabus' | 'grading' | 'notifications'): void {
  const templates: { [key: string]: TemplateRef<any> } = {
    courses: this.coursesDialog,
    syllabus: this.syllabusDialog,
    grading: this.gradingDialog,
    notifications: this.notificationsDialog
  };

  if (type === 'grading') {
    this.loadTeacherExamData(); 
  }

  this.dialog.open(templates[type], {
    width: '95vw',
    maxWidth: '1200px',
    height: type === 'grading' ? '90vh' : 'auto'
  });
}

  get syllabusesCount(): number {
    return Object.keys(this.syllabuses).length;
  }

  getCourseName(courseId: number): string {
  return this.courses.find(c => c.id === courseId)?.name || 'Unknown Course';
}

getExamAttemptsCount(studentId: number | undefined, courseId: number): number {
  if (!studentId || !courseId || this.allExamApplications.length === 0) {
    return 0;
  }

  return this.allExamApplications.filter(app => {
    return app.user?.id === studentId && app.course?.id === courseId;
  }).length;
}


getStudyProgramName(programId: number | null): string {
  if (!programId) return 'N/A';
  const program = this.studyPrograms.find(p => p.id === programId);
  return program?.name || 'Unknown Program';
}


viewCourseApplications(courseId: number): void {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return;

    this.selectedCourse = course;

    this.apiService.getAllExamApplications().subscribe({
      next: (apps) => {
        this.examApplicationsForSelectedCourse = apps.filter(a => a.course.id === courseId);

        if (this.allExamGrades.length === 0) {
          this.apiService.getAllExamGrades().subscribe(grades => this.allExamGrades = grades);
        }
      }
    });
  }

  getGradeForApp(app: ExamApplication): ExamGrade | null {
    return this.allExamGrades.find(g => g.examApplication.id === app.id) || null;
  }

  getPendingApplicationsCount(courseId: number): number {
    const apps = this.teacherApplications.filter(a => a.course.id === courseId);
    return apps.filter(a => !this.getGradeForApp(a)).length;
  }

  private loadTeacherExamData(): void {
  this.isLoadingGrading = true;

  forkJoin({
    applications: this.apiService.getAllExamApplications(),
    grades: this.apiService.getAllExamGrades()
  }).subscribe({
    next: ({ applications, grades }) => {
      const teacherCourseIds = new Set(this.courses.map(c => c.id));

      this.teacherApplications = applications.filter(a => teacherCourseIds.has(a.course.id));
      this.allExamGrades = grades;

      const studentMap = new Map<number, User>();
      this.teacherApplications.forEach(app => {
        if (app.user?.id) {
          studentMap.set(app.user.id, app.user);
        }
      });

      this.studentsWithApps = Array.from(studentMap.values());
      this.filteredStudentsWithApps = [...this.studentsWithApps]; 

      this.isLoadingGrading = false;
    },
    error: () => {
      this.snackBar.open('Failed to load exam data', 'Error');
      this.isLoadingGrading = false;
    }
  });
}

  selectStudentForGrading(student: User): void {
    this.selectedGradingStudent = student;

    const studentApps = this.teacherApplications.filter(a => a.user.id === student.id);

    this.pendingAppsForStudent = studentApps.filter(a => !this.getGradeForApp(a));

    this.gradedAppsForStudent = this.allExamGrades
      .filter(g => g.examApplication.user.id === student.id)
      .map(g => ({ app: g.examApplication, grade: g }));
  }

  openGradeFormForApp(app: ExamApplication): void {
    this.currentGradingApp = app;
    this.showGradeForm = true;
    this.newGrade = null;
  }

  submitGrade(): void {
  if (!this.currentGradingApp || this.newGrade == null || this.newGrade < 5 || this.newGrade > 10) {
    this.snackBar.open('Invalid grade', 'Error');
    return;
  }

  const courseId = this.currentGradingApp.course.id;
  if (!courseId) {
    this.snackBar.open('Course ID missing', 'Error');
    return;
  }

  const termName = this.currentGradingApp.term;

  const examDate = this.getExamDateForCourseAndTerm(courseId, termName);

  if (!examDate) {
    this.snackBar.open(
      'Exam date not found in schedule. Grading is only allowed within 15 days after the exam.',
      'Cannot Grade',
      { duration: 8000 }
    );
    this.showGradeForm = false;
    return;
  }

  const deadline = new Date(examDate);
  deadline.setDate(deadline.getDate() + 15);

  if (new Date() > deadline) {
    this.snackBar.open(
      `Grading period ended on ${deadline.toLocaleDateString('en-GB')}. Exam was on ${examDate.toLocaleDateString('en-GB')}.`,
      'Too Late',
      { duration: 10000 }
    );
    this.showGradeForm = false;
    return;
  }

  const attempts = this.teacherApplications.filter(
    a => a.user.id === this.selectedGradingStudent?.id && a.course.id === courseId
  ).length;

  this.apiService.createExamGrade({
    examApplicationId: this.currentGradingApp.id,
    grade: this.newGrade,
    numberOfTakenExams: attempts
  }).subscribe({
    next: (newGrade) => {
      this.allExamGrades.push(newGrade);

      this.snackBar.open(
        `Grade ${this.newGrade} submitted! (Attempt ${attempts})`,
        'Success',
        { duration: 4000 }
      );

      this.selectStudentForGrading(this.selectedGradingStudent!);

      this.showGradeForm = false;
      this.currentGradingApp = null;
      this.newGrade = null;
    },
    error: (err) => {
      console.error('Grade submission failed:', err);
      this.snackBar.open('Failed to submit grade', 'Error', { duration: 6000 });
    }
  });
}

  deleteExamGrade(gradeId: number): void {
    if (!confirm('Delete this grade?')) return;

    this.apiService.deleteExamGrade(gradeId).subscribe({
      next: () => {
        this.allExamGrades = this.allExamGrades.filter(g => g.id !== gradeId);
        this.snackBar.open('Grade deleted', 'Success');
        this.selectStudentForGrading(this.selectedGradingStudent!);
      },
      error: () => this.snackBar.open('Failed to delete grade', 'Error')
    });
  }

  getPendingCount(studentId: number): number {
    return this.teacherApplications.filter(a => a.user.id === studentId && !this.getGradeForApp(a)).length;
  }

  getGradedCount(studentId: number): number {
    return this.allExamGrades.filter(g => g.examApplication.user.id === studentId).length;
  }

  goBackToCourses(): void {
    this.selectedCourse = null;
    this.examApplicationsForSelectedCourse = [];
  }

  private loadStudyPrograms(): Promise<void> {
  return new Promise((resolve) => {
    this.apiService.getStudyPrograms().subscribe({
      next: (programs) => {
        this.studyPrograms = programs;
        resolve();
      },
      error: () => {
        console.error('Failed to load study programs');
        this.studyPrograms = [];
        resolve();
      }
    });
  });
}





openSyllabusDetail(course: Course): void {
  this.selectedSyllabusCourse = course;
  this.currentSyllabus = this.syllabuses[course.id!] || null;
}

openSyllabusForm(course: Course | null): void {
  if (!course) return;

  this.showSyllabusForm = true;
  this.selectedSyllabusCourse = course;

  if (this.syllabuses[course.id!]) {
    this.editingSyllabus = { ...this.syllabuses[course.id!] };
    this.newSyllabus = { ...this.syllabuses[course.id!] };
  } else {
    this.editingSyllabus = null;
    this.newSyllabus = {
      courseId: course.id!,
      content: '',
      academicYear: ''
    };
  }
}

saveSyllabus(): void {
  if (!this.newSyllabus.content.trim()) {
    this.snackBar.open('Please provide a valid PDF URL', 'Error');
    return;
  }

  if (this.editingSyllabus?.id) {
    this.apiService.updateSyllabus(this.editingSyllabus.id, this.newSyllabus).subscribe({
      next: (updated) => {
        this.syllabuses[updated.courseId] = updated;
        this.currentSyllabus = updated;
        this.closeSyllabusForm();
        this.snackBar.open('Syllabus updated successfully', 'Success', { duration: 4000 });
      },
      error: () => this.snackBar.open('Failed to update syllabus', 'Error')
    });
  } else {
    this.apiService.createSyllabus(this.newSyllabus).subscribe({
      next: (created) => {
        this.syllabuses[created.courseId] = created;
        this.currentSyllabus = created;
        this.closeSyllabusForm();
        this.snackBar.open('Syllabus uploaded successfully', 'Success', { duration: 4000 });
      },
      error: () => this.snackBar.open('Failed to upload syllabus', 'Error')
    });
  }
}

deleteCurrentSyllabus(): void {
  if (!this.currentSyllabus?.id || !confirm('Delete this syllabus? This cannot be undone.')) return;

  this.apiService.deleteSyllabus(this.currentSyllabus.id).subscribe({
    next: () => {
      delete this.syllabuses[this.selectedSyllabusCourse!.id!];
      this.currentSyllabus = null;
      this.snackBar.open('Syllabus deleted', 'Success', { duration: 4000 });
    },
    error: () => this.snackBar.open('Failed to delete syllabus', 'Error')
  });
}

closeSyllabusForm(): void {
  this.showSyllabusForm = false;
  this.editingSyllabus = null;
  this.newSyllabus = { courseId: 0, content: '', academicYear: '' };
}
 filterStudentsWithApps(term: string): void {
  if (!term.trim()) {
    this.filteredStudentsWithApps = [...this.studentsWithApps];
    return;
  }

  const lowerTerm = term.toLowerCase();
  this.filteredStudentsWithApps = this.studentsWithApps.filter(student =>
    student.firstName.toLowerCase().includes(lowerTerm) ||
    student.lastName.toLowerCase().includes(lowerTerm) ||
    student.indexNumber.toLowerCase().includes(lowerTerm)
  );
}



selectWeeklySchedule(schedule: WeeklySchedule): void {
  this.selectedWeeklySchedule = schedule;
  this.apiService.getScheduleEntriesBySchedule(schedule.id!).subscribe({
    next: (entries) => {
      this.teacherScheduleEntries = entries;
    }
  });
}


selectEntryForDescription(entry: ScheduleEntry): void {
  this.selectedScheduleEntry = entry;
  this.apiService.getDescriptionsByScheduleEntry(entry.id!).subscribe({
    next: (descs) => this.scheduleEntryDescriptions = descs
  });
}

openDescriptionForm(): void {
  this.showDescriptionForm = true;
  this.editingDescription = null;
  this.currentDescription = {
    name: '',
    description: '',
    scheduleEntryId: this.selectedScheduleEntry!.id!
  };
}

editDescription(desc: ScheduleEntryDescription): void {
  this.editingDescription = desc;
  this.currentDescription = { ...desc };
  this.showDescriptionForm = true;
}

saveDescription(): void {
  if (!this.currentDescription.name.trim()) return;

  const request = this.editingDescription?.id
    ? this.apiService.updateScheduleEntryDescription(this.editingDescription.id, this.currentDescription)
    : this.apiService.createScheduleEntryDescription(this.currentDescription);

  request.subscribe({
    next: (result) => {
      if (this.editingDescription?.id) {
        const idx = this.scheduleEntryDescriptions.findIndex(d => d.id === result.id);
        if (idx > -1) this.scheduleEntryDescriptions[idx] = result;
      } else {
        this.scheduleEntryDescriptions.push(result);
      }
      this.cancelDescriptionForm();
      this.snackBar.open('Summary saved', 'OK', { duration: 3000 });
    }
  });
}

deleteDescription(id: number): void {
  if (!confirm('Delete this summary?')) return;
  this.apiService.deleteScheduleEntryDescription(id).subscribe({
    next: () => {
      this.scheduleEntryDescriptions = this.scheduleEntryDescriptions.filter(d => d.id !== id);
      this.snackBar.open('Summary deleted', 'OK');
    }
  });
}

cancelDescriptionForm(): void {
  this.showDescriptionForm = false;
  this.editingDescription = null;
}

getCourseById(courseId: number): Course | undefined {
  return this.courses.find(c => c.id === courseId);
}

getProgramName(programId: number): string {
  return this.studyPrograms.find(p => p.id === programId)?.name || 'Unknown';
}

openCourseTasksManagement(): void {
  this.selectedTaskCourse = null;
  this.courseTasks = [];
  this.dialog.open(this.courseTasksDialog, { width: '95vw', maxWidth: '1000px', height: '85vh' });
}

selectCourseForTasks(course: Course): void {
  this.selectedTaskCourse = course;
  this.apiService.getTasksByCourse(course.id!).subscribe({
    next: (tasks) => this.courseTasks = tasks,
    error: () => this.snackBar.open('Failed to load tasks', 'Error')
  });
}

openTaskForm(): void {
  this.showTaskForm = true;
  this.editingTask = null;
  this.newTask = {
    name: '',
    description: '',
    courseId: this.selectedTaskCourse!.id!
  };
}

editTask(task: CourseTask): void {
  this.editingTask = task;
  this.newTask = { ...task };
  this.showTaskForm = true;
}

saveTask(): void {
  if (!this.newTask.name.trim()) {
    this.snackBar.open('Task name is required', 'Error');
    return;
  }

  if (this.editingTask?.id) {
    this.apiService.updateCourseTask(this.editingTask.id, this.newTask).subscribe({
      next: (updated) => {
        const idx = this.courseTasks.findIndex(t => t.id === updated.id);
        if (idx > -1) this.courseTasks[idx] = updated;
        this.cancelTaskForm();
        this.snackBar.open('Task updated', 'OK');
      },
      error: () => this.snackBar.open('Failed to update task', 'Error')
    });
  } else {
    this.apiService.createCourseTask(this.newTask).subscribe({
      next: (created) => {
        this.courseTasks.push(created);
        this.cancelTaskForm();
        this.snackBar.open('Task created', 'OK');
      },
      error: () => this.snackBar.open('Failed to create task', 'Error')
    });
  }
}

deleteTask(id: number): void {
  if (!confirm('Delete this task?')) return;
  this.apiService.deleteCourseTask(id).subscribe({
    next: () => {
      this.courseTasks = this.courseTasks.filter(t => t.id !== id);
      this.snackBar.open('Task deleted', 'OK');
    },
    error: () => this.snackBar.open('Failed to delete task', 'Error')
  });
}

cancelTaskForm(): void {
  this.showTaskForm = false;
  this.editingTask = null;
}

openSessionDetailsManagement(): void {
  this.selectedWeeklySchedule = null;
  this.teacherScheduleEntries = [];
  this.selectedScheduleEntry = null;
  this.scheduleEntryDescriptions = [];

  this.apiService.getWeeklySchedules().subscribe({
    next: (schedules) => {
      const teacherCourseIds = new Set(this.courses.map(c => c.id));
      this.weeklySchedules = schedules.filter(s =>
        this.courses.some(c =>
          c.studyProgramId === s.studyProgramId &&
          (c.studyYear === s.year || c.studyYear == null)
        )
      );
    },
    error: () => this.snackBar.open('Failed to load schedules', 'Error')
  });

  this.dialog.open(this.sessionDetailsDialog, { width: '95vw', maxWidth: '1200px', height: '85vh' });
}


openAllStudentsOverview(): void {
  this.dialog.open(this.allStudentsDialog, {
    width: '95vw',
    maxWidth: '1400px',
    height: '85vh'
  });
}

private loadAllStudents(): void {
  this.apiService.getStudentsByRole('STUDENT').subscribe({
    next: (students) => {
      this.allStudents = students;
      this.filteredAllStudents = [...students];
      this.precomputeStudentData();
      this.cdr.detectChanges();
    },
    error: () => this.snackBar.open('Failed to load students', 'Error', { duration: 5000 })
  });
}

private precomputeStudentData(): void {
  const requests = this.allStudents.map(student =>
    forkJoin({
      program: this.apiService.getStudentStudyProgram(student.id!),
      applications: this.apiService.getExamApplicationsByUserId(student.id!),
      grades: this.apiService.getAllExamGrades()
    }).pipe(
      map(({ program, applications, grades }) => {
        this.studentPrograms.set(student.id!, program);

        const passedCourses = new Set<number>(); 
        let totalECTS = 0;

        applications.forEach(app => {
          const courseId = app.course.id;
          if (!courseId || passedCourses.has(courseId)) return; 

          const relevantGrades = grades.filter(g => g.examApplication.id === app.id);
          if (relevantGrades.length === 0) return;

          const bestGrade = Math.max(...relevantGrades.map(g => g.grade).filter(g => g !== null));

          if (bestGrade >= 5) {
            passedCourses.add(courseId);
            totalECTS += app.course.ectsPoints || 0;
          }
        });

        this.studentPassedECTS.set(student.id!, totalECTS);
      })
    )
  );

  forkJoin(requests).subscribe({
    error: (err) => {
      console.error('Error loading student details:', err);
      this.snackBar.open('Some student data failed to load', 'Close', { duration: 5000 });
    }
  });
}

filterAllStudents(): void {
  const q = this.studentSearchQuery.toLowerCase().trim();
  if (!q) {
    this.filteredAllStudents = [...this.allStudents];
    return;
  }
  this.filteredAllStudents = this.allStudents.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
    (s.indexNumber?.toLowerCase().includes(q)) ||
    s.email.toLowerCase().includes(q)
  );
}

getStudentProgramName(userId: number): string {
  return this.studentPrograms.get(userId)?.name || 'Not enrolled';
}

getStudentPassedECTS(userId: number): number {
  return this.studentPassedECTS.get(userId) || 0;
}

viewStudentCourses(student: User): void {
  this.selectedStudent = student;
  this.apiService.getStudentCourses(student.id!).subscribe({
    next: (courses) => {
      this.studentCourseList = courses.length === 0
        ? ['No courses enrolled.']
        : courses.map(c => `${c.name} (${c.code}) – ${c.ectsPoints} ECTS`);
      
      this.currentDetailDialog = this.dialog.open(this.studentCoursesDialog, {
        width: '600px',
        maxWidth: '90vw'
      });
    }
  });
}

viewStudentGrades(student: User): void {
  this.selectedStudent = student;
  forkJoin({
    apps: this.apiService.getExamApplicationsByUserId(student.id!),
    grades: this.apiService.getAllExamGrades()
  }).subscribe({
    next: ({ apps, grades }) => {
      const studentGrades = grades.filter(g => apps.some(a => a.id === g.examApplication.id));
      this.studentGradeList = studentGrades.length === 0
        ? ['No graded exams.']
        : studentGrades.map(g => {
            const app = apps.find(a => a.id === g.examApplication.id);
            const status = g.grade !== null && g.grade > 5 ? 'PASSED' : 'FAILED';
            return `<strong>${app?.course.name || 'Unknown'}</strong> – Grade: ${g.grade ?? '—'} (${status})${g.numberOfTakenExams > 1 ? ` (Attempt ${g.numberOfTakenExams})` : ''}`;
          });

      this.currentDetailDialog = this.dialog.open(this.studentGradesDialog, {
        width: '700px',
        maxWidth: '90vw'
      });
    }
  });
}

viewStudentApplications(student: User): void {
  this.selectedStudent = student;
  this.apiService.getExamApplicationsByUserId(student.id!).subscribe({
    next: (apps) => {
      this.studentApplicationList = apps.length === 0
        ? ['No exam applications.']
        : apps.map(a => `<strong>${a.course.name} (${a.course.code})</strong> – Term: ${a.term}`);

      this.currentDetailDialog = this.dialog.open(this.studentApplicationsDialog, {
        width: '600px',
        maxWidth: '90vw'
      });
    }
  });
}

closeStudentDetail(): void {
  if (this.currentDetailDialog) {
    this.currentDetailDialog.close();
    this.currentDetailDialog = null;
  }
}

private loadTermSchedules(): Promise<void> {
  return new Promise((resolve) => {
    this.apiService.getTerms().subscribe({
      next: (terms) => {
        const requests = terms.map(term =>
          this.apiService.getTermSchedulesByTerm(term.id!)
        );
        forkJoin(requests).subscribe({
          next: (allSchedules: TermSchedule[][]) => {
            this.termSchedules = allSchedules.flat();
            resolve();
          },
          error: () => {
            this.termSchedules = [];
            resolve();
          }
        });
      },
      error: () => resolve()
    });
  });
}

public getExamDateForCourseAndTerm(courseId: number | undefined, termName: string): Date | null {
  if (!courseId || !termName) return null;

  const cleanTermName = termName.replace(/\s*\(ID:.*\)$/, '').trim();

  console.log(`Searching for course ${courseId} in term "${cleanTermName}" (original: "${termName}")`);

  const matchingSchedule = this.termSchedules.find(schedule => {
    const term = this.terms.find(t => t.id === schedule.termId);
    if (!term) return false;

    const termNameMatch = term.name.trim() === cleanTermName;
    if (!termNameMatch) return false;

    const hasCourse = 
      schedule.courses?.some(c => c.id === courseId) ||
      schedule.courseIds?.includes(courseId);

    return hasCourse;
  });

  if (matchingSchedule) {
    const examDate = new Date(matchingSchedule.date);
    console.log(`✅ Found exam date: ${examDate.toISOString().split('T')[0]}`);
    return examDate;
  }

  console.warn(`❌ No schedule found for course ${courseId} in term "${cleanTermName}"`);
  return null;
}

private loadAllTermSchedules(): Promise<void> {
  return new Promise((resolve) => {
    this.apiService.getTerms().subscribe({
      next: (terms) => {
        if (terms.length === 0) {
          this.termSchedules = [];
          resolve();
          return;
        }

        const requests = terms.map(term =>
          this.apiService.getTermSchedulesByTerm(term.id!).pipe(
            catchError(() => of([] as TermSchedule[]))
          )
        );

        forkJoin(requests).subscribe({
          next: (results: TermSchedule[][]) => {
            this.termSchedules = results.flat();
            resolve();
          },
          error: () => {
            this.termSchedules = [];
            resolve();
          }
        });
      },
      error: () => {
        this.termSchedules = [];
        resolve();
      }
    });
  });
}

public isGradingPeriodOver(app: ExamApplication): boolean {
  const examDate = this.getExamDateForCourseAndTerm(app.course.id, app.term);
  if (!examDate) return false; 

  const deadline = new Date(examDate);
  deadline.setDate(deadline.getDate() + 15);

  const now = new Date();
  const isOver = now > deadline;

  if (isOver) {
    console.log(`Grading blocked: Exam was ${examDate.toDateString()}, deadline was ${deadline.toDateString()}`);
  }

  return isOver;
}

deleteExamApplication(app: ExamApplication): void {
  if (!confirm('Delete this exam application? This cannot be undone.')) return;

  this.apiService.deleteExamApplication(app.id!).subscribe({
    next: () => {
      this.snackBar.open('Exam application deleted', 'Success', { duration: 4000 });
      this.selectStudentForGrading(this.selectedGradingStudent!); 
    },
    error: () => this.snackBar.open('Failed to delete application', 'Error')
  });
}

private loadTerms(): Promise<void> {
  return new Promise((resolve) => {
    this.apiService.getTerms().subscribe({
      next: (terms) => {
        this.terms = terms;
        resolve();
      },
      error: () => {
        console.error('Failed to load terms');
        this.terms = [];
        resolve();
      }
    });
  });
}

private addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
}