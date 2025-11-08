import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedLoginComponent } from './login.component';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('SharedLoginComponent', () => {
  let component: SharedLoginComponent;
  let fixture: ComponentFixture<SharedLoginComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      login: jasmine.createSpy('login').and.returnValue(of({ token: 'test-token', user: { username: 'test' } })),
      isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(false),
      verify2FA: jasmine.createSpy('verify2FA').and.returnValue(of({ token: 'test-token' }))
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [SharedLoginComponent],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SharedLoginComponent);
    component = fixture.componentInstance;
    component.authService = mockAuthService;
    component.config = {
      appTitle: 'Test App',
      githubRepoUrl: 'https://github.com/test',
      redirectAfterLogin: '/dashboard',
      quickDemoMode: true,
      demoCredentials: {
        username: 'demo',
        password: 'demopass'
      }
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect if already authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should perform quick demo login', () => {
    component.quickDemoLogin();
    expect(component.username).toBe('demo');
    expect(component.password).toBe('demopass');
    expect(mockAuthService.login).toHaveBeenCalled();
  });

  it('should handle login success', async () => {
    component.username = 'test';
    component.password = 'pass';
    await component.onLogin();
    expect(mockAuthService.login).toHaveBeenCalledWith('test', 'pass');
    expect(component.loading).toBe(false);
  });

  it('should handle login error', async () => {
    mockAuthService.login.and.returnValue(throwError(() => ({ error: { error: 'Invalid credentials' } })));
    component.username = 'test';
    component.password = 'wrong';
    await component.onLogin();
    expect(component.error).toBe('Invalid credentials');
  });

  it('should validate credentials before login', async () => {
    component.username = '';
    component.password = '';
    await component.onLogin();
    expect(component.error).toBe('Please enter username and password');
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should switch between demo and production modes', () => {
    component.loginMode = 'demo';
    component.switchToProductionLogin();
    expect(component.loginMode).toBe('production');
    expect(component.error).toBe('');

    component.switchToDemoLogin();
    expect(component.loginMode).toBe('demo');
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(false);
  });

  it('should handle 2FA flow', async () => {
    mockAuthService.login.and.returnValue(of({ requiresTwoFactor: true, tempToken: 'temp-token' }));
    component.username = 'test';
    component.password = 'pass';
    await component.onLogin();
    expect(component.requiresTwoFactor).toBe(true);
    expect(component.tempToken).toBe('temp-token');
  });

  it('should verify 2FA code', async () => {
    component.tempToken = 'temp-token';
    component.twoFactorCode = '123456';
    await component.onVerify2FA();
    expect(mockAuthService.verify2FA).toHaveBeenCalledWith('temp-token', '123456');
  });

  it('should cancel 2FA', () => {
    component.requiresTwoFactor = true;
    component.twoFactorCode = '123456';
    component.tempToken = 'temp';
    component.cancelTwoFactor();
    expect(component.requiresTwoFactor).toBe(false);
    expect(component.twoFactorCode).toBe('');
    expect(component.tempToken).toBe('');
  });
});




