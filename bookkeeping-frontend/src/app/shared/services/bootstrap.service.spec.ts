import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BootstrapService, BOOTSTRAP_CONFIG, BootstrapConfig } from './bootstrap.service';

describe('BootstrapService', () => {
  let service: BootstrapService;
  let httpMock: HttpTestingController;

  const mockConfig: BootstrapConfig = {
    apiUrl: '/api',
    timeoutMs: 5000,
    apiEndpoint: '/test-endpoint',
    authTokenKey: 'testToken',
    checkDatabase: false,
    validateSession: false,
    checkPerformance: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BootstrapService,
        { provide: BOOTSTRAP_CONFIG, useValue: mockConfig }
      ]
    });
    service = TestBed.inject(BootstrapService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should run bootstrap checks and return success', async () => {
    const promise = service.runBootstrapChecks();

    // Mock backend connectivity check
    const req1 = httpMock.expectOne('/api/health');
    req1.flush({ status: 'ok' });

    // Mock backend health check
    const req2 = httpMock.expectOne('/api/health');
    req2.flush({ status: 'ok', version: '1.0' });

    // Mock API endpoint check
    const req3 = httpMock.expectOne('/api/test-endpoint');
    req3.flush({ data: 'test' });

    const result = await promise;
    expect(result).toBe(true);
  });

  it('should detect backend connectivity failure', async () => {
    const promise = service.runBootstrapChecks();

    const req = httpMock.expectOne('/api/health');
    req.error(new ErrorEvent('Network error'));

    const result = await promise;
    expect(result).toBe(false);
  });

  it('should expose bootstrap state as observable', (done) => {
    service.bootstrapState$.subscribe(state => {
      expect(state).toBeDefined();
      expect(state.overallStatus).toBeDefined();
      done();
    });
  });

  it('should reset bootstrap state', () => {
    service.reset();
    const state = service.getBootstrapState();
    expect(state.isReady).toBe(false);
    expect(state.checks.length).toBe(0);
    expect(state.overallStatus).toBe('initializing');
  });

  it('should send email notification on failure when configured', async () => {
    const configWithEmail: BootstrapConfig = {
      ...mockConfig,
      emailNotification: {
        enabled: true,
        recipientEmail: 'test@example.com',
        appName: 'Test App',
        emailEndpoint: '/notify/bootstrap-error'
      }
    };

    const serviceWithEmail = new BootstrapService(
      TestBed.inject(HttpClientTestingModule) as any,
      configWithEmail
    );

    const promise = serviceWithEmail.runBootstrapChecks();

    // Fail the backend check
    const req1 = httpMock.expectOne('/api/health');
    req1.error(new ErrorEvent('Network error'));

    await promise;

    // Expect email notification
    const emailReq = httpMock.expectOne('/api/notify/bootstrap-error');
    expect(emailReq.request.method).toBe('POST');
    expect(emailReq.request.body.to).toBe('test@example.com');
    emailReq.flush({ sent: true });
  });
});


