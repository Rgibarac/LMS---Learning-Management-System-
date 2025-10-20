import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

interface Faculty {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class RdfService {
  private fusekiUrl = 'http://localhost:3030/lms';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getFaculties(): Observable<Faculty[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    const query = `
      PREFIX lms: <http://example.org/lms#>
      SELECT ?faculty ?name ?description
      WHERE {
        ?faculty a lms:Faculty .
        ?faculty lms:name ?name .
        ?faculty lms:description ?description .
      }
    `;
    return this.http.post<any[]>(`${this.fusekiUrl}/query`, { query }, {
      headers: { 'Content-Type': 'application/sparql-query' }
    });
  }
}