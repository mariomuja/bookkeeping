import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BootstrapService, BootstrapCheck } from './bootstrap.service';
import { environment } from '../../environments/environment';

describe('BootstrapService', () => {
  let service: BootstrapService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BootstrapService]
    });
    service = TestBed.inject(BootstrapService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with bootstrap state not ready', () => {
    const state = service.getBootstrapState();
    expect(state.isReady).toBe(false);
    expect(state.overallStatus).toBe('initializing');
    expect(state.checks).toEqual([]);
  });

  it('should run all bootstrap checks successfully when backend is healthy', async () => {
    const promise = service.runBootstrapChecks();

    // Wait for the first async call
    await new Promise(resolve => setTimeout(resolve, 10));

    // Backend connectivity check
    let requests = httpMock.match(`${apiUrl}/health`);
    if (requests.length > 0) {
      expect(requests[0].request.method).toBe('GET');
      requests[0].flush({
        status: 'ok',
        version: '1.0.0',
        environment: 'development',
        dataStatus: { organizations: 1, accounts: 10, journalEntries: 4, accountTypes: 10 }
      });
    }

    // Wait for the second async call
    await new Promise(resolve => setTimeout(resolve, 10));

    // Backend health check
    requests = httpMock.match(`${apiUrl}/health`);
    if (requests.length > 0) {
      requests[0].flush({
        status: 'ok',
        version: '1.0.0',
        environment: 'development',
        dataStatus: { organizations: 1, accounts: 10, journalEntries: 4, accountTypes: 10 }
      });
    }

    // Wait for the third async call
    await new Promise(resolve => setTimeout(resolve, 10));

    // API endpoints check
    const orgsReqs = httpMock.match(`${apiUrl}/organizations`);
    if (orgsReqs.length > 0) {
      orgsReqs[0].flush([{ id: '123', name: 'Demo Company' }]);
    }

    const result = await promise;

    expect(result).toBe(true);
    const state = service.getBootstrapState();
    expect(state.isReady).toBe(true);
    expect(state.overallStatus).toBe('ready');
    expect(state.checks.length).toBe(4);
    expect(state.checks[0].name).toBe('Backend Connectivity');
    expect(state.checks[0].status).toBe('success');
    expect(state.checks[1].name).toBe('Backend Health');
    expect(state.checks[1].status).toBe('success');
    expect(state.checks[2].name).toBe('API Endpoints');
    expect(state.checks[2].status).toBe('success');
  });

  it('should fail when backend is not reachable', async () => {
    const promise = service.runBootstrapChecks();

    // Backend connectivity check fails
    const healthReq = httpMock.expectOne(`${apiUrl}/health`);
    healthReq.error(new ProgressEvent('error'), { status: 0 });

    const result = await promise;

    expect(result).toBe(false);
    const state = service.getBootstrapState();
    expect(state.isReady).toBe(false);
    expect(state.overallStatus).toBe('error');
    expect(state.checks[0].status).toBe('error');
    expect(state.checks[0].message).toContain('not running or not reachable');
  });

  it('should handle backend error response', async () => {
    const promise = service.runBootstrapChecks();

    const healthReq = httpMock.expectOne(`${apiUrl}/health`);
    healthReq.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

    const result = await promise;

    expect(result).toBe(false);
    const state = service.getBootstrapState();
    expect(state.overallStatus).toBe('error');
    expect(state.checks[0].status).toBe('error');
  });

  it('should check authentication status correctly when token exists', async () => {
    localStorage.setItem('authToken', 'test-token');

    const promise = service.runBootstrapChecks();

    // Wait for async operations to start
    await new Promise(resolve => setTimeout(resolve, 10));

    // Backend connectivity check
    let requests = httpMock.match(`${apiUrl}/health`);
    if (requests.length > 0) {
      requests[0].flush({ status: 'ok', version: '1.0.0', dataStatus: { journalEntries: 4 } });
    }

    // Backend health check
    await new Promise(resolve => setTimeout(resolve, 10));
    requests = httpMock.match(`${apiUrl}/health`);
    if (requests.length > 0) {
      requests[0].flush({ status: 'ok', version: '1.0.0', dataStatus: { journalEntries: 4 } });
    }

    // API endpoints check
    await new Promise(resolve => setTimeout(resolve, 10));
    const orgsReqs = httpMock.match(`${apiUrl}/organizations`);
    if (orgsReqs.length > 0) {
      orgsReqs[0].flush([{ id: '123' }]);
    }

    await promise;

    const state = service.getBootstrapState();
    const authCheck = state.checks.find(c => c.name === 'Authentication');
    expect(authCheck?.status).toBe('success');
    expect(authCheck?.message).toContain('authenticated');
    
    localStorage.removeItem('authToken');
  });

  it('should show warning when no auth token', async () => {
    localStorage.removeItem('authToken');

    const promise = service.runBootstrapChecks();

    await new Promise(resolve => setTimeout(resolve, 10));

    let requests = httpMock.match(`${apiUrl}/health`);
    if (requests.length > 0) {
      requests[0].flush({ status: 'ok', version: '1.0.0', dataStatus: { journalEntries: 4 } });
    }

    await new Promise(resolve => setTimeout(resolve, 10));
    requests = httpMock.match(`${apiUrl}/health`);
    if (requests.length > 0) {
      requests[0].flush({ status: 'ok', version: '1.0.0', dataStatus: { journalEntries: 4 } });
    }

    await new Promise(resolve => setTimeout(resolve, 10));
    const orgsReqs = httpMock.match(`${apiUrl}/organizations`);
    if (orgsReqs.length > 0) {
      orgsReqs[0].flush([{ id: '123' }]);
    }

    await promise;

    const state = service.getBootstrapState();
    const authCheck = state.checks.find(c => c.name === 'Authentication');
    expect(authCheck?.status).toBe('warning');
    expect(authCheck?.message).toContain('No authentication token');
  });

  it('should reset bootstrap state', () => {
    service.reset();
    const state = service.getBootstrapState();
    expect(state.isReady).toBe(false);
    expect(state.checks).toEqual([]);
    expect(state.overallStatus).toBe('initializing');
  });

  it('should provide observable stream of bootstrap state', (done) => {
    service.bootstrapState$.subscribe(state => {
      expect(state).toBeDefined();
      expect(state.overallStatus).toBeDefined();
      done();
    });
  });

  it('should handle API endpoint failure gracefully', async () => {
    const promise = service.runBootstrapChecks();

    await new Promise(resolve => setTimeout(resolve, 10));

    let requests = httpMock.match(`${apiUrl}/health`);
    if (requests.length > 0) {
      requests[0].flush({ status: 'ok', version: '1.0.0', dataStatus: { journalEntries: 4 } });
    }

    await new Promise(resolve => setTimeout(resolve, 10));
    requests = httpMock.match(`${apiUrl}/health`);
    if (requests.length > 0) {
      requests[0].flush({ status: 'ok', version: '1.0.0', dataStatus: { journalEntries: 4 } });
    }

    await new Promise(resolve => setTimeout(resolve, 10));
    const orgsReqs = httpMock.match(`${apiUrl}/organizations`);
    if (orgsReqs.length > 0) {
      orgsReqs[0].flush([], { status: 200, statusText: 'OK' });
    }

    await promise;

    const state = service.getBootstrapState();
    const apiCheck = state.checks.find(c => c.name === 'API Endpoints');
    expect(apiCheck?.status).toBe('warning');
    expect(apiCheck?.message).toContain('no organizations found');
  });
});

