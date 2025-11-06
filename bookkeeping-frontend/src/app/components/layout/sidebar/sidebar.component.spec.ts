import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../../services/auth.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEventsSubject.asObservable(),
      url: '/dashboard'
    });
    
    mockAuthService = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [
        SidebarComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct menu items', () => {
    expect(component.menuItems.length).toBe(8);
    expect(component.menuItems[0].translationKey).toBe('nav.dashboard');
    expect(component.menuItems[0].route).toBe('/dashboard');
  });

  describe('Navigation', () => {
    it('should identify active route correctly', () => {
      Object.defineProperty(mockRouter, 'url', { value: '/dashboard', writable: true });
      expect(component.isActiveRoute('/dashboard')).toBe(true);
      expect(component.isActiveRoute('/accounts')).toBe(false);
    });

    it('should emit closeSidebar on navigation item click', () => {
      spyOn(component.closeSidebar, 'emit');
      component.onNavItemClick();
      expect(component.closeSidebar.emit).toHaveBeenCalled();
    });

    it('should close sidebar on navigation end event (mobile)', (done) => {
      spyOn(component.closeSidebar, 'emit');
      
      // Emit navigation end event
      routerEventsSubject.next(new NavigationEnd(1, '/accounts', '/accounts'));
      
      setTimeout(() => {
        expect(component.closeSidebar.emit).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('Logout Functionality', () => {
    it('should call authService.logout when onLogout is called', () => {
      component.onLogout();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should navigate to login page on logout', () => {
      component.onLogout();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should close sidebar on logout', () => {
      spyOn(component.closeSidebar, 'emit');
      component.onLogout();
      expect(component.closeSidebar.emit).toHaveBeenCalled();
    });
  });

  describe('Mobile Responsive Behavior', () => {
    it('should emit close event when navigation item is clicked (mobile hamburger menu)', () => {
      spyOn(component.closeSidebar, 'emit');
      const compiled = fixture.nativeElement;
      
      component.onNavItemClick();
      
      expect(component.closeSidebar.emit).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple navigation clicks', () => {
      spyOn(component.closeSidebar, 'emit');
      
      component.onNavItemClick();
      component.onNavItemClick();
      component.onNavItemClick();
      
      expect(component.closeSidebar.emit).toHaveBeenCalledTimes(3);
    });
  });

  describe('Translation Keys', () => {
    it('should have translation keys for all menu items', () => {
      component.menuItems.forEach(item => {
        expect(item.translationKey).toBeTruthy();
        expect(item.translationKey).toContain('nav.');
      });
    });

    it('should have logout translation key rendered in template', () => {
      const compiled = fixture.nativeElement;
      const logoutButton = compiled.querySelector('.logout-section button');
      expect(logoutButton).toBeTruthy();
    });
  });
});

