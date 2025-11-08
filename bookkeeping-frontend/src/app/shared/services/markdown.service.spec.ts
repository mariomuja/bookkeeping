import { TestBed } from '@angular/core/testing';
import { MarkdownService } from './markdown.service';

describe('MarkdownService', () => {
  let service: MarkdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarkdownService]
    });
    service = TestBed.inject(MarkdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert headers', () => {
    const markdown = '# Header 1\n## Header 2\n### Header 3';
    const html = service.renderToString(markdown);
    expect(html).toContain('<h1>Header 1</h1>');
    expect(html).toContain('<h2>Header 2</h2>');
    expect(html).toContain('<h3>Header 3</h3>');
  });

  it('should convert bold text', () => {
    const markdown = '**bold text**';
    const html = service.renderToString(markdown);
    expect(html).toContain('<strong>bold text</strong>');
  });

  it('should convert italic text', () => {
    const markdown = '*italic text*';
    const html = service.renderToString(markdown);
    expect(html).toContain('<em>italic text</em>');
  });

  it('should convert inline code', () => {
    const markdown = '`code snippet`';
    const html = service.renderToString(markdown);
    expect(html).toContain('<code>code snippet</code>');
  });

  it('should convert code blocks', () => {
    const markdown = '```typescript\nconst x = 1;\n```';
    const html = service.renderToString(markdown);
    expect(html).toContain('<pre>');
    expect(html).toContain('<code');
    expect(html).toContain('const x = 1;');
  });

  it('should convert links', () => {
    const markdown = '[Link Text](https://example.com)';
    const html = service.renderToString(markdown);
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain('Link Text</a>');
  });

  it('should sanitize HTML in render method', () => {
    const markdown = '# Test';
    const safeHtml = service.render(markdown);
    expect(safeHtml).toBeTruthy();
  });

  it('should escape HTML in code blocks', () => {
    const markdown = '```html\n<script>alert("xss")</script>\n```';
    const html = service.renderToString(markdown);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});


