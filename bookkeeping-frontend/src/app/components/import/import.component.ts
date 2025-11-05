import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})
export class ImportComponent {
  importType: 'accounts' | 'journal-entries' = 'journal-entries';
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;
  uploadComplete = false;
  uploadError: string | null = null;

  importHistory = [
    {
      id: '1',
      fileName: 'Q4-2023-transactions.csv',
      type: 'Journal Entries',
      date: new Date('2023-12-15'),
      status: 'Completed',
      records: 245,
      errors: 0
    },
    {
      id: '2',
      fileName: 'chart-of-accounts.xlsx',
      type: 'Accounts',
      date: new Date('2023-12-01'),
      status: 'Completed',
      records: 89,
      errors: 0
    },
    {
      id: '3',
      fileName: 'november-transactions.csv',
      type: 'Journal Entries',
      date: new Date('2023-11-30'),
      status: 'Failed',
      records: 0,
      errors: 15
    }
  ];

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadError = null;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.uploadComplete = false;
    this.uploadError = null;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadError = null;

    // Simulate file upload with progress
    const interval = setInterval(() => {
      this.uploadProgress += 10;
      
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;
        this.uploadComplete = true;
        
        // Simulate adding to history
        this.importHistory.unshift({
          id: Date.now().toString(),
          fileName: this.selectedFile!.name,
          type: this.importType === 'accounts' ? 'Accounts' : 'Journal Entries',
          date: new Date(),
          status: 'Completed',
          records: Math.floor(Math.random() * 200) + 50,
          errors: 0
        });
      }
    }, 300);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Completed': 'green',
      'Failed': 'red',
      'Processing': 'blue'
    };
    return colors[status] || 'gray';
  }

  downloadTemplate(): void {
    // In a real app, this would download an actual template file
    alert('Template download would be triggered here');
  }
}

