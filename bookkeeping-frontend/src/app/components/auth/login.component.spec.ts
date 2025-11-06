import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { OrganizationService } from '../../services/organization.service';

describe('LoginComponent - Shared Component Integration', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockOrganizationService: jasmine.SpyObj<OrganizationService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'isAuthenticated']);
    mockOrganizationService = jasmine.createSpyObj('OrganizationService', ['setCurrentOrganization', 'getCurrentOrganization']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    mockAuthService.isAuthenticated.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: OrganizationService, useValue: mockOrganizationService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Configuration', () => {
    it('should have correct app title configuration', () => {
      expect(component.loginConfig.appTitle).toBe('International Bookkeeping');
    });

    it('should have correct redirect URL', () => {
      expect(component.loginConfig.redirectAfterLogin).toBe('/dashboard');
    });

    it('should show developer card by default', () => {
      expect(component.loginConfig.showDeveloperCard).toBe(true);
    });

    it('should have Mario Muja photo configured', () => {
      expect(component.loginConfig.photoUrl).toBe('mario-muja.jpg');
    });

    it('should have GitHub repository URL configured', () => {
      expect(component.loginConfig.githubRepoUrl).toBe('https://github.com/mariomuja/bookkeeping');
    });

    it('should have demo credentials configured', () => {
      expect(component.loginConfig.demoCredentials).toBeDefined();
      expect(component.loginConfig.demoCredentials?.username).toBe('demo');
      expect(component.loginConfig.demoCredentials?.password).toBe('DemoUser2025!Secure');
    });
  });

  describe('Service Integration', () => {
    it('should pass AuthService to shared component', () => {
      expect(component.authService).toBe(mockAuthService);
    });

    it('should pass OrganizationService to shared component', () => {
      expect(component.organizationService).toBe(mockOrganizationService);
    });
  });

  describe('Shared Component Usage', () => {
    it('should use inline template with shared-login selector', () => {
      const metadata = (component.constructor as any)['ɵcmp'];
      expect(metadata.template).toContain('shared-login');
    });
  });

  describe('Security', () => {
    it('should use secure password (not demo123)', () => {
      const password = component.loginConfig.demoCredentials?.password || '';
      expect(password).not.toBe('demo123');
      expect(password.length).toBeGreaterThan(8);
      expect(password).toMatch(/[A-Z]/); // Has uppercase
      expect(password).toMatch(/[a-z]/); // Has lowercase
      expect(password).toMatch(/[0-9]/); // Has number
      expect(password).toMatch(/[!@#$%^&*]/); // Has special char
    });
  });
});

