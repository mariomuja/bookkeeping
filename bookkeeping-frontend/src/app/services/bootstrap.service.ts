import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, firstValueFrom } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface BootstrapCheck {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  timestamp?: Date;
  details?: any;
}

export interface BootstrapState {
  isReady: boolean;
  checks: BootstrapCheck[];
  overallStatus: 'initializing' | 'ready' | 'error';
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BootstrapService {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  private readonly TIMEOUT_MS = 5000;
  
  private bootstrapStateSubject = new BehaviorSubject<BootstrapState>({
    isReady: false,
    checks: [],
    overallStatus: 'initializing'
  });
  
  public bootstrapState$ = this.bootstrapStateSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Run all bootstrap checks
   */
  async runBootstrapChecks(): Promise<boolean> {
    const checks: BootstrapCheck[] = [];
    
    this.updateState({
      isReady: false,
      checks: [],
      overallStatus: 'initializing'
    });

    // Check 1: Backend Connectivity
    const backendCheck = await this.checkBackendConnectivity();
    checks.push(backendCheck);
    this.updateState({
      isReady: false,
      checks: [...checks],
      overallStatus: 'initializing'
    });

    if (backendCheck.status === 'error') {
      this.updateState({
        isReady: false,
        checks,
        overallStatus: 'error',
        error: 'Backend server is not responding. Please ensure the backend is running on ' + this.apiUrl
      });
      return false;
    }

    // Check 2: Backend Health
    const healthCheck = await this.checkBackendHealth();
    checks.push(healthCheck);
    this.updateState({
      isReady: false,
      checks: [...checks],
      overallStatus: 'initializing'
    });

    if (healthCheck.status === 'error') {
      this.updateState({
        isReady: false,
        checks,
        overallStatus: 'error',
        error: 'Backend health check failed'
      });
      return false;
    }

    // Check 3: API Endpoints
    const apiCheck = await this.checkApiEndpoints();
    checks.push(apiCheck);
    this.updateState({
      isReady: false,
      checks: [...checks],
      overallStatus: 'initializing'
    });

    // Check 4: Authentication Status
    const authCheck = this.checkAuthStatus();
    checks.push(authCheck);
    
    const allSuccessful = checks.every(c => c.status === 'success' || c.status === 'warning');
    
    this.updateState({
      isReady: allSuccessful,
      checks,
      overallStatus: allSuccessful ? 'ready' : 'error',
      error: allSuccessful ? undefined : 'Some bootstrap checks failed'
    });

    return allSuccessful;
  }

  /**
   * Check if backend server is reachable
   */
  private async checkBackendConnectivity(): Promise<BootstrapCheck> {
    try {
      await firstValueFrom(
        this.http.get(`${this.apiUrl}/health`)
          .pipe(
            timeout(this.TIMEOUT_MS),
            catchError((error: HttpErrorResponse) => {
              throw error;
            })
          )
      );
      
      return {
        name: 'Backend Connectivity',
        status: 'success',
        message: `Connected to backend at ${this.apiUrl}`,
        timestamp: new Date()
      };
    } catch (error: any) {
      let errorMessage = 'Cannot connect to backend server';
      
      if (error.name === 'TimeoutError') {
        errorMessage = `Backend connection timeout after ${this.TIMEOUT_MS}ms`;
      } else if (error.status === 0) {
        errorMessage = 'Backend server is not running or not reachable';
      } else if (error.status) {
        errorMessage = `Backend returned error: ${error.status} ${error.statusText}`;
      }
      
      return {
        name: 'Backend Connectivity',
        status: 'error',
        message: errorMessage,
        timestamp: new Date(),
        details: {
          url: this.apiUrl,
          error: error.message
        }
      };
    }
  }

  /**
   * Check backend health endpoint
   */
  private async checkBackendHealth(): Promise<BootstrapCheck> {
    try {
      const health: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/health`)
          .pipe(timeout(this.TIMEOUT_MS))
      );
      
      if (health.status && health.status.toLowerCase() !== 'ok') {
        return {
          name: 'Backend Health',
          status: 'warning',
          message: 'Backend health check returned non-OK status',
          timestamp: new Date(),
          details: health
        };
      }
      
      return {
        name: 'Backend Health',
        status: 'success',
        message: health.message || `Backend healthy - ${health.version ? 'v' + health.version : 'API running'}`,
        timestamp: new Date(),
        details: health
      };
    } catch (error: any) {
      return {
        name: 'Backend Health',
        status: 'error',
        message: 'Backend health check failed: ' + error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check if critical API endpoints are available
   */
  private async checkApiEndpoints(): Promise<BootstrapCheck> {
    try {
      const orgs: any = await firstValueFrom(
        this.http.get(`${this.apiUrl}/organizations`)
          .pipe(
            timeout(this.TIMEOUT_MS),
            catchError(() => of(null))
          )
      );
      
      if (!orgs || orgs.length === 0) {
        return {
          name: 'API Endpoints',
          status: 'warning',
          message: 'API reachable but no organizations found',
          timestamp: new Date()
        };
      }
      
      return {
        name: 'API Endpoints',
        status: 'success',
        message: `API endpoints available (${orgs.length} organization${orgs.length > 1 ? 's' : ''})`,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        name: 'API Endpoints',
        status: 'error',
        message: 'Failed to reach API endpoints',
        timestamp: new Date(),
        details: error.message
      };
    }
  }

  /**
   * Check authentication status
   */
  private checkAuthStatus(): BootstrapCheck {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      return {
        name: 'Authentication',
        status: 'success',
        message: 'User authenticated',
        timestamp: new Date()
      };
    }
    
    return {
      name: 'Authentication',
      status: 'warning',
      message: 'No authentication token found (will redirect to login)',
      timestamp: new Date()
    };
  }

  /**
   * Get current bootstrap state
   */
  getBootstrapState(): BootstrapState {
    return this.bootstrapStateSubject.value;
  }

  /**
   * Update bootstrap state
   */
  private updateState(state: BootstrapState): void {
    this.bootstrapStateSubject.next(state);
  }

  /**
   * Reset bootstrap state
   */
  reset(): void {
    this.updateState({
      isReady: false,
      checks: [],
      overallStatus: 'initializing'
    });
  }
}

