import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RdfService } from '../../../core/services/rdf.service';

interface Faculty {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-faculty-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  template: `
    <h2>Faculties</h2>
    <table mat-table [dataSource]="faculties" *ngIf="faculties.length">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let faculty">{{ faculty.name }}</td>
      </ng-container>
      <ng-container matColumnDef="description">
        <th mat-header-cell *matHeaderCellDef>Description</th>
        <td mat-cell *matCellDef="let faculty">{{ faculty.description }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="['name', 'description']"></tr>
      <tr mat-row *matRowDef="let row; columns: ['name', 'description']"></tr>
    </table>
    <div *ngIf="!faculties.length">No faculties available</div>
  `
})
export class FacultyListComponent implements OnInit {
  faculties: Faculty[] = [];

  constructor(private rdfService: RdfService) {}

  ngOnInit(): void {
    this.rdfService.getFaculties().subscribe({
      next: (data) => (this.faculties = data),
      error: (err) => console.error('Failed to load faculties:', err)
    });
  }
}