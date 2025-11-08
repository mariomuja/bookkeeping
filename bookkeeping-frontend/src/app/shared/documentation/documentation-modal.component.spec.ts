import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedDocumentationModalComponent } from './documentation-modal.component';
import { SharedDocumentationService } from '../services/shared-documentation.service';
import { MarkdownService } from '../services/markdown.service';
import { of } from 'rxjs';

describe('SharedDocumentationModalComponent', () => {
  let component: SharedDocumentationModalComponent;
  let fixture: ComponentFixture<SharedDocumentationModalComponent>;
  let mockDocService: any;
  let mockMarkdownService: any;

  const mockDocs = [
    { filename: 'TEST1.md', title: 'Test 1', path: '/docs/TEST1.md', category: 'Cat A', order: 1 },
    { filename: 'TEST2.md', title: 'Test 2', path: '/docs/TEST2.md', category: 'Cat B', order: 2 }
  ];

  beforeEach(async () => {
    mockDocService = {
      getDocumentationIndex: jasmine.createSpy('getDocumentationIndex').and.returnValue(mockDocs),
      getDocumentationByCategory: jasmine.createSpy('getDocumentationByCategory').and.returnValue({
        'Cat A': [mockDocs[0]],
        'Cat B': [mockDocs[1]]
      }),
      getDocumentationContent: jasmine.createSpy('getDocumentationContent').and.returnValue(of('# Test Content')),
      searchDocumentation: jasmine.createSpy('searchDocumentation').and.returnValue(mockDocs)
    };

    mockMarkdownService = {
      renderToString: jasmine.createSpy('renderToString').and.returnValue('<h1>Test Content</h1>')
    };

    await TestBed.configureTestingModule({
      imports: [SharedDocumentationModalComponent, HttpClientTestingModule],
      providers: [
        { provide: SharedDocumentationService, useValue: mockDocService },
        { provide: MarkdownService, useValue: mockMarkdownService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SharedDocumentationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load documentation index on init', () => {
    expect(mockDocService.getDocumentationByCategory).toHaveBeenCalled();
    expect(component.categories.length).toBe(2);
  });

  it('should select document and load content', () => {
    component.selectDocument(mockDocs[0]);
    expect(component.selectedDocument).toBe(mockDocs[0]);
    expect(mockDocService.getDocumentationContent).toHaveBeenCalledWith('TEST1.md');
    expect(mockMarkdownService.renderToString).toHaveBeenCalled();
  });

  it('should go back to index', () => {
    component.selectedDocument = mockDocs[0];
    component.backToIndex();
    expect(component.selectedDocument).toBeNull();
    expect(component.documentContent).toBe('');
  });

  it('should emit close event', () => {
    spyOn(component.close, 'emit');
    component.closeModal();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should search documentation', () => {
    component.searchQuery = 'test';
    component.onSearch();
    expect(mockDocService.searchDocumentation).toHaveBeenCalledWith('test');
  });

  it('should reload all docs when search is cleared', () => {
    component.searchQuery = '';
    component.onSearch();
    expect(mockDocService.getDocumentationByCategory).toHaveBeenCalled();
  });

  it('should stop event propagation', () => {
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
    component.stopPropagation(event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});


