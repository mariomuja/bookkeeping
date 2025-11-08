import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SharedDocumentationService, DOCUMENTATION_CONFIG } from './shared-documentation.service';
import { DocumentationConfig } from './documentation-config.interface';

describe('SharedDocumentationService', () => {
  let service: SharedDocumentationService;
  let httpMock: HttpTestingController;

  const mockConfig: DocumentationConfig = {
    docsBasePath: '/docs',
    files: [
      { filename: 'TEST1.md', title: 'Test Doc 1', path: '/docs/TEST1.md', category: 'Category A', order: 1 },
      { filename: 'TEST2.md', title: 'Test Doc 2', path: '/docs/TEST2.md', category: 'Category A', order: 2 },
      { filename: 'TEST3.md', title: 'Test Doc 3', path: '/docs/TEST3.md', category: 'Category B', order: 3 }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SharedDocumentationService,
        { provide: DOCUMENTATION_CONFIG, useValue: mockConfig }
      ]
    });
    service = TestBed.inject(SharedDocumentationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return documentation index sorted by order', () => {
    const index = service.getDocumentationIndex();
    expect(index.length).toBe(3);
    expect(index[0].order).toBe(1);
    expect(index[1].order).toBe(2);
    expect(index[2].order).toBe(3);
  });

  it('should group documentation by category', () => {
    const grouped = service.getDocumentationByCategory();
    expect(grouped['Category A'].length).toBe(2);
    expect(grouped['Category B'].length).toBe(1);
  });

  it('should fetch documentation content', () => {
    service.getDocumentationContent('TEST1.md').subscribe(content => {
      expect(content).toBe('# Test Content');
    });

    const req = httpMock.expectOne('/docs/TEST1.md');
    expect(req.request.method).toBe('GET');
    req.flush('# Test Content');
  });

  it('should return error message for non-existent file', (done) => {
    service.getDocumentationContent('NONEXISTENT.md').subscribe(content => {
      expect(content).toContain('Documentation Not Found');
      done();
    });
  });

  it('should search documentation', () => {
    const results = service.searchDocumentation('Test Doc 2');
    expect(results.length).toBe(1);
    expect(results[0].filename).toBe('TEST2.md');
  });

  it('should return all docs when search query is empty', () => {
    const results = service.searchDocumentation('');
    expect(results.length).toBe(3);
  });

  it('should search by category', () => {
    const results = service.searchDocumentation('Category B');
    expect(results.length).toBe(1);
    expect(results[0].category).toBe('Category B');
  });
});


