import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SharedAuthenticationService, AUTHENTICATION_CONFIG, AuthenticationConfig } from './authentication.service';

describe('SharedAuthenticationService', () => {
  let service: SharedAuthenticationService;
  let httpMock: HttpTestingController;

  const mockConfig: AuthenticationConfig = {
    apiUrl: '/api',
    providers: [
      { method: 'credentials', name: 'Username/Password', icon: '🔑', enabled: true },
      { method: 'google', name: 'Google', icon: 'G', enabled: true },
      { method: 'activeDirectory', name: 'Active Directory', icon: '🏢', enabled: true }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SharedAuthenticationService,
        { provide: AUTHENTICATION_CONFIG, useValue: mockConfig }
      ]
    });
    service = TestBed.inject(SharedAuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return available providers', () => {
    const providers = service.getAvailableProviders();
    expect(providers.length).toBe(3);
    expect(providers[0].method).toBe('credentials');
  });

  it('should login with credentials', () => {
    service.loginWithCredentials('testuser', 'testpass').subscribe(response => {
      expect(response.success).toBe(true);
    });

    const req = httpMock.expectOne('/api/auth/login/credentials');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'testuser', password: 'testpass' });
    req.flush({ success: true, token: 'test-token' });
  });

  it('should login with Active Directory', () => {
    service.loginWithActiveDirectory('testuser', 'testpass', 'DOMAIN').subscribe(response => {
      expect(response.success).toBe(true);
    });

    const req = httpMock.expectOne('/api/auth/login/ad');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'testuser', password: 'testpass', domain: 'DOMAIN' });
    req.flush({ success: true, token: 'test-token' });
  });

  it('should create new user', () => {
    const newUser = {
      username: 'newuser',
      email: 'new@example.com',
      displayName: 'New User',
      authMethod: 'credentials' as const,
      roles: ['user']
    };

    service.createUser(newUser).subscribe(response => {
      expect(response.id).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/admin/users');
    expect(req.request.method).toBe('POST');
    req.flush({ ...newUser, id: '123', createdAt: new Date() });
  });

  it('should get all users', () => {
    service.getUsers().subscribe(users => {
      expect(users.length).toBe(2);
    });

    const req = httpMock.expectOne('/api/admin/users');
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: '1', username: 'user1', email: 'user1@example.com' },
      { id: '2', username: 'user2', email: 'user2@example.com' }
    ]);
  });

  it('should delete user', () => {
    service.deleteUser('123').subscribe();

    const req = httpMock.expectOne('/api/admin/users/123');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should sync Active Directory users', () => {
    service.syncActiveDirectoryUsers().subscribe(result => {
      expect(result.synced).toBe(5);
    });

    const req = httpMock.expectOne('/api/admin/users/sync-ad');
    expect(req.request.method).toBe('POST');
    req.flush({ synced: 5, users: [] });
  });
});


