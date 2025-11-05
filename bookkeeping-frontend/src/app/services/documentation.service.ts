import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface DocumentationFile {
  filename: string;
  title: string;
  path: string;
  category: string;
  order: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentationService {
  private readonly docsPath = '/docs';
  
  // Documentation index
  private readonly documentationFiles: DocumentationFile[] = [
    { filename: 'QUICK_START.md', title: 'Quick Start Guide', path: '/docs/QUICK_START.md', category: 'Getting Started', order: 1 },
    { filename: 'SETUP.md', title: 'Setup Instructions', path: '/docs/SETUP.md', category: 'Getting Started', order: 2 },
    { filename: 'AUTHENTICATION_GUIDE.md', title: 'Authentication & Security', path: '/docs/AUTHENTICATION_GUIDE.md', category: 'Security', order: 3 },
    { filename: 'COMPLETE_SYSTEM_GUIDE.md', title: 'Complete System Guide', path: '/docs/COMPLETE_SYSTEM_GUIDE.md', category: 'User Guide', order: 4 },
    { filename: 'CUSTOM_FIELDS_GUIDE.md', title: 'Custom Fields Guide', path: '/docs/CUSTOM_FIELDS_GUIDE.md', category: 'Features', order: 5 },
    { filename: 'MULTI_CURRENCY_TIMEZONE_GUIDE.md', title: 'Multi-Currency & Timezone', path: '/docs/MULTI_CURRENCY_TIMEZONE_GUIDE.md', category: 'Features', order: 6 },
    { filename: 'FEATURES_SUMMARY.md', title: 'Features Summary', path: '/docs/FEATURES_SUMMARY.md', category: 'Reference', order: 7 },
    { filename: 'IMPLEMENTATION_COMPLETE.md', title: 'Implementation Details', path: '/docs/IMPLEMENTATION_COMPLETE.md', category: 'Technical', order: 8 },
    { filename: 'TEST_RESULTS.md', title: 'Test Results', path: '/docs/TEST_RESULTS.md', category: 'Technical', order: 9 },
    { filename: 'TROUBLESHOOTING.md', title: 'Troubleshooting', path: '/docs/TROUBLESHOOTING.md', category: 'Support', order: 10 }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get list of all documentation files
   */
  getDocumentationIndex(): DocumentationFile[] {
    return this.documentationFiles.sort((a, b) => a.order - b.order);
  }

  /**
   * Get documentation files grouped by category
   */
  getDocumentationByCategory(): { [category: string]: DocumentationFile[] } {
    const grouped: { [category: string]: DocumentationFile[] } = {};
    
    this.documentationFiles.forEach(doc => {
      if (!grouped[doc.category]) {
        grouped[doc.category] = [];
      }
      grouped[doc.category].push(doc);
    });
    
    // Sort each category by order
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.order - b.order);
    });
    
    return grouped;
  }

  /**
   * Fetch documentation file content
   */
  getDocumentationContent(filename: string): Observable<string> {
    const doc = this.documentationFiles.find(d => d.filename === filename);
    if (!doc) {
      return of('# Documentation Not Found\n\nThe requested documentation file could not be found.');
    }

    return this.http.get(doc.path, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error(`Failed to load documentation: ${filename}`, error);
        return of(`# Error Loading Documentation\n\nFailed to load: ${filename}\n\nPlease check that the file exists in the docs folder.`);
      })
    );
  }

  /**
   * Search documentation
   */
  searchDocumentation(query: string): DocumentationFile[] {
    if (!query || query.trim() === '') {
      return this.documentationFiles;
    }

    const lowerQuery = query.toLowerCase();
    return this.documentationFiles.filter(doc =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.category.toLowerCase().includes(lowerQuery) ||
      doc.filename.toLowerCase().includes(lowerQuery)
    );
  }
}

