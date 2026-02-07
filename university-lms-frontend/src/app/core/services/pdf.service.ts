import { Injectable } from '@angular/core';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor(private apiService: ApiService) {}

  downloadUsers(): void {
    this.apiService.exportUsersPdf('pdf').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'users.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('PDF download failed:', err)
    });
  }
  
}