import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedDocumentationService, DocumentationFile, MarkdownService } from '../services';

@Component({
  selector: 'shared-documentation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documentation-modal.component.html',
  styleUrls: ['./documentation-modal.component.css']
})
export class SharedDocumentationModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  documentationByCategory: { [category: string]: DocumentationFile[] } = {};
  categories: string[] = [];
  selectedDocument: DocumentationFile | null = null;
  documentContent: string = '';
  isLoading = false;
  searchQuery = '';
  filteredDocumentation: DocumentationFile[] = [];

  constructor(
    private documentationService: SharedDocumentationService,
    private markdownService: MarkdownService
  ) {}

  ngOnInit(): void {
    this.loadDocumentationIndex();
  }

  loadDocumentationIndex(): void {
    this.documentationByCategory = this.documentationService.getDocumentationByCategory();
    this.categories = Object.keys(this.documentationByCategory);
    this.filteredDocumentation = this.documentationService.getDocumentationIndex();
  }

  selectDocument(doc: DocumentationFile): void {
    this.selectedDocument = doc;
    this.isLoading = true;
    this.documentContent = '';
    
    this.documentationService.getDocumentationContent(doc.filename).subscribe({
      next: (content) => {
        this.documentContent = this.markdownService.renderToString(content);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documentation:', error);
        this.documentContent = '<p class="error">Failed to load documentation content.</p>';
        this.isLoading = false;
      }
    });
  }

  backToIndex(): void {
    this.selectedDocument = null;
    this.documentContent = '';
  }

  closeModal(): void {
    this.close.emit();
  }

  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.loadDocumentationIndex();
    } else {
      this.filteredDocumentation = this.documentationService.searchDocumentation(this.searchQuery);
      // Rebuild category structure with filtered results
      this.documentationByCategory = {};
      this.filteredDocumentation.forEach(doc => {
        if (!this.documentationByCategory[doc.category]) {
          this.documentationByCategory[doc.category] = [];
        }
        this.documentationByCategory[doc.category].push(doc);
      });
      this.categories = Object.keys(this.documentationByCategory);
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}


