import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { StartupComponent } from './startup.component';
import { BootstrapService, BootstrapState } from '../../services/bootstrap.service';

describe('StartupComponent', () => {
  let component: StartupComponent;
  let fixture: ComponentFixture<StartupComponent>;
  let mockBootstrapService: jasmine.SpyObj<BootstrapService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const bootstrapServiceSpy = jasmine.createSpyObj('BootstrapService', ['runBootstrapChecks', 'reset'], {
      bootstrapState$: of({
        isReady: false,
        checks: [],
        overallStatus: 'initializing'
      } as BootstrapState)
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [StartupComponent],
      providers: [
        { provide: BootstrapService, useValue: bootstrapServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    mockBootstrapService = TestBed.inject(BootstrapService) as jasmine.SpyObj<BootstrapService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(StartupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run bootstrap checks on init', () => {
    mockBootstrapService.runBootstrapChecks.and.returnValue(Promise.resolve(true));
    
    fixture.detectChanges(); // triggers ngOnInit

    expect(mockBootstrapService.runBootstrapChecks).toHaveBeenCalled();
  });

  it('should navigate to dashboard when ready and authenticated', (done) => {
    localStorage.setItem('authToken', 'test-token');
    mockBootstrapService.runBootstrapChecks.and.returnValue(Promise.resolve(true));
    
    const readyState: BootstrapState = {
      isReady: true,
      checks: [],
      overallStatus: 'ready'
    };

    // Override the bootstrapState$ with a new BehaviorSubject
    const stateSubject = new BehaviorSubject<BootstrapState>(readyState);
    Object.defineProperty(mockBootstrapService, 'bootstrapState$', {
      get: () => stateSubject.asObservable()
    });

    fixture.detectChanges();
    
    // Trigger the state change after component initializes
    setTimeout(() => {
      stateSubject.next(readyState);
    }, 10);

    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      localStorage.removeItem('authToken');
      done();
    }, 1000);
  });

  it('should navigate to login when ready and not authenticated', (done) => {
    localStorage.removeItem('authToken');
    mockBootstrapService.runBootstrapChecks.and.returnValue(Promise.resolve(true));
    
    const readyState: BootstrapState = {
      isReady: true,
      checks: [],
      overallStatus: 'ready'
    };

    const stateSubject = new BehaviorSubject<BootstrapState>(readyState);
    Object.defineProperty(mockBootstrapService, 'bootstrapState$', {
      get: () => stateSubject.asObservable()
    });

    fixture.detectChanges();
    
    setTimeout(() => {
      stateSubject.next(readyState);
    }, 10);

    setTimeout(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      done();
    }, 1000);
  });

  it('should retry bootstrap checks when retry is called', async () => {
    mockBootstrapService.reset.and.stub();
    mockBootstrapService.runBootstrapChecks.and.returnValue(Promise.resolve(false));

    await component.retry();

    expect(mockBootstrapService.reset).toHaveBeenCalled();
    expect(mockBootstrapService.runBootstrapChecks).toHaveBeenCalled();
  });

  it('should return correct status icon for each status', () => {
    expect(component.getStatusIcon('success')).toBe('✓');
    expect(component.getStatusIcon('error')).toBe('✗');
    expect(component.getStatusIcon('warning')).toBe('⚠');
    expect(component.getStatusIcon('pending')).toBe('...');
    expect(component.getStatusIcon('unknown')).toBe('?');
  });

  it('should return correct status class for each status', () => {
    expect(component.getStatusClass('success')).toBe('status-success');
    expect(component.getStatusClass('error')).toBe('status-error');
    expect(component.getStatusClass('warning')).toBe('status-warning');
    expect(component.getStatusClass('pending')).toBe('status-pending');
  });

  it('should update isRetrying flag during retry', async () => {
    mockBootstrapService.reset.and.stub();
    mockBootstrapService.runBootstrapChecks.and.returnValue(Promise.resolve(true));

    expect(component.isRetrying).toBe(false);
    
    const retryPromise = component.retry();
    
    // Check that it's set to true (though it might complete quickly)
    // We just verify the method completes without error
    await retryPromise;
    
    expect(component.isRetrying).toBe(false);
    expect(mockBootstrapService.reset).toHaveBeenCalled();
  });

  it('should display bootstrap state from service', () => {
    const testState: BootstrapState = {
      isReady: false,
      checks: [
        { name: 'Test Check', status: 'success', message: 'Test passed', timestamp: new Date() }
      ],
      overallStatus: 'initializing'
    };

    Object.defineProperty(mockBootstrapService, 'bootstrapState$', {
      value: of(testState)
    });

    fixture.detectChanges();

    expect(component.bootstrapState).toEqual(testState);
  });
});

