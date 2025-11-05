import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentationService, DocumentationFile } from '../../services/documentation.service';

@Component({
  selector: 'app-documentation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './documentation-modal.component.html',
  styleUrls: ['./documentation-modal.component.css']
})
export class DocumentationModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  documentationByCategory: { [category: string]: DocumentationFile[] } = {};
  categories: string[] = [];
  selectedDocument: DocumentationFile | null = null;
  documentContent: string = '';
  isLoading = false;
  searchQuery = '';
  filteredDocumentation: DocumentationFile[] = [];

  constructor(private documentationService: DocumentationService) {}

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
    
    this.documentationService.getDocumentationContent(doc.filename).subscribe(
      content => {
        this.documentContent = this.convertMarkdownToHtml(content);
        this.isLoading = false;
      },
      error => {
        console.error('Error loading documentation:', error);
        this.documentContent = '<p class="error">Failed to load documentation content.</p>';
        this.isLoading = false;
      }
    );
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

  /**
   * Simple markdown to HTML converter
   * Handles basic markdown syntax for display
   */
  private convertMarkdownToHtml(markdown: string): string {
    let html = markdown;

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'plaintext'}">${this.escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Numbered lists
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraphs
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');

    return html;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}

