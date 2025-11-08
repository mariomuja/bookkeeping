import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DocumentationConfig, DocumentationFile } from './documentation-config.interface';

// Re-export types for convenience
export { DocumentationConfig, DocumentationFile } from './documentation-config.interface';

export const DOCUMENTATION_CONFIG = new InjectionToken<DocumentationConfig>('DOCUMENTATION_CONFIG');

@Injectable({
  providedIn: 'root'
})
export class SharedDocumentationService {
  private config: DocumentationConfig;

  constructor(
    private http: HttpClient,
    @Optional() @Inject(DOCUMENTATION_CONFIG) config?: DocumentationConfig
  ) {
    this.config = config || { files: [] };
  }

  /**
   * Configure documentation service with files list
   */
  configure(config: DocumentationConfig): void {
    this.config = config;
  }

  /**
   * Get list of all documentation files sorted by order
   */
  getDocumentationIndex(): DocumentationFile[] {
    return this.config.files.sort((a, b) => a.order - b.order);
  }

  /**
   * Get documentation files grouped by category
   */
  getDocumentationByCategory(): { [category: string]: DocumentationFile[] } {
    const grouped: { [category: string]: DocumentationFile[] } = {};
    
    this.config.files.forEach(doc => {
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
    const doc = this.config.files.find(d => d.filename === filename);
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
   * Get documentation content by path
   */
  getDocumentationContentByPath(path: string): Observable<string> {
    return this.http.get(path, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error('Error loading documentation:', error);
        return of('# Error Loading Documentation\n\nThe requested documentation could not be loaded. Please try again later.');
      })
    );
  }

  /**
   * Search documentation
   */
  searchDocumentation(query: string): DocumentationFile[] {
    if (!query || query.trim() === '') {
      return this.config.files;
    }

    const lowerQuery = query.toLowerCase();
    return this.config.files.filter(doc =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.category.toLowerCase().includes(lowerQuery) ||
      doc.filename.toLowerCase().includes(lowerQuery)
    );
  }
}

