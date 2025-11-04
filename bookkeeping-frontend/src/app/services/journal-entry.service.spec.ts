import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JournalEntryService } from './journal-entry.service';
import { ApiService } from './api.service';

describe('JournalEntryService', () => {
  let service: JournalEntryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JournalEntryService, ApiService]
    });
    service = TestBed.inject(JournalEntryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch journal entries for organization', (done) => {
    const orgId = 'test-org-id';
    const mockEntries = [
      {
        id: '1',
        organizationId: orgId,
        entryNumber: 'JE-001',
        entryDate: new Date(),
        description: 'Test Entry',
        currency: 'USD',
        status: 'DRAFT'
      }
    ];

    service.getJournalEntries(orgId).subscribe(entries => {
      expect(entries).toEqual(mockEntries as any);
      expect(entries.length).toBe(1);
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes(`/organizations/${orgId}/journal-entries`));
    expect(req.request.method).toBe('GET');
    req.flush(mockEntries);
  });

  it('should create journal entry', (done) => {
    const orgId = 'test-org-id';
    const newEntry = {
      entryDate: '2024-01-15',
      description: 'Test Entry',
      currency: 'USD',
      lines: [
        { accountId: 'acc1', debitAmount: 100, creditAmount: 0 },
        { accountId: 'acc2', debitAmount: 0, creditAmount: 100 }
      ]
    };

    service.createJournalEntry(orgId, newEntry).subscribe(entry => {
      expect(entry).toBeTruthy();
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes(`/organizations/${orgId}/journal-entries`));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEntry);
    req.flush({ id: 'new-entry-id', ...newEntry });
  });

  it('should validate balance returns correct result', (done) => {
    const entryId = 'test-entry-id';
    const validation = {
      isBalanced: true,
      debitTotal: 1000,
      creditTotal: 1000
    };

    service.validateBalance(entryId).subscribe(result => {
      expect(result.isBalanced).toBe(true);
      expect(result.debitTotal).toBe(result.creditTotal);
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes(`/journal-entries/${entryId}/validate`));
    req.flush(validation);
  });

  it('should post journal entry', (done) => {
    const entryId = 'test-entry-id';
    const postedBy = 'Test User';

    service.postJournalEntry(entryId, postedBy).subscribe(entry => {
      expect(entry).toBeTruthy();
      done();
    });

    const req = httpMock.expectOne(req => req.url.includes(`/journal-entries/${entryId}/post`));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ postedBy });
    req.flush({ id: entryId, status: 'POSTED' });
  });
});

