import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, firstValueFrom } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { BootstrapConfig, BootstrapCheck, BootstrapState } from './bootstrap-config.interface';

// Re-export types for convenience
export { BootstrapConfig, BootstrapCheck, BootstrapState } from './bootstrap-config.interface';

export const BOOTSTRAP_CONFIG = new InjectionToken<BootstrapConfig>('BOOTSTRAP_CONFIG');

@Injectable({
  providedIn: 'root'
})
export class BootstrapService {
  private readonly config: {
    apiUrl: string;
    timeoutMs: number;
    apiEndpoint: string;
    authTokenKey: string;
    criticalEndpoints?: string[];
    checkDatabase: boolean;
    validateSession: boolean;
    checkPerformance: boolean;
    performanceThresholdMs: number;
    externalIntegrations?: Array<{name: string; endpoint: string; method?: 'GET' | 'POST'}>;
    emailNotification?: {
      enabled: boolean;
      recipientEmail: string;
      appName: string;
      emailEndpoint: string;
    };
    errorMessages: {
      backendNotResponding: string;
      backendHealthFailed: string;
      apiEndpointsFailed: string;
      databaseOffline: string;
      sessionInvalid: string;
      performanceSlow: string;
      externalIntegrationFailed: string;
    };
    successMessages: {
      backendConnected: string;
      backendHealthy: string;
      apiEndpoints: string;
      authenticated: string;
      databaseConnected: string;
      sessionValid: string;
      performanceGood: string;
      externalIntegrationOk: string;
    };
  };
  private emailNotificationSent = false;
  private bootstrapStateSubject = new BehaviorSubject<BootstrapState>({
    isReady: false,
    checks: [],
    overallStatus: 'initializing'
  });
  
  public bootstrapState$ = this.bootstrapStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Optional() @Inject(BOOTSTRAP_CONFIG) config?: BootstrapConfig
  ) {
    // Use provided config or defaults
    this.config = {
      apiUrl: config?.apiUrl || '/api',
      timeoutMs: config?.timeoutMs || 5000,
      apiEndpoint: config?.apiEndpoint || '/health',
      authTokenKey: config?.authTokenKey || 'authToken',
      criticalEndpoints: config?.criticalEndpoints,
      checkDatabase: config?.checkDatabase ?? false,
      validateSession: config?.validateSession ?? false,
      checkPerformance: config?.checkPerformance ?? false,
      performanceThresholdMs: config?.performanceThresholdMs || 1000,
      externalIntegrations: config?.externalIntegrations,
      emailNotification: config?.emailNotification ? {
        enabled: config.emailNotification.enabled,
        recipientEmail: config.emailNotification.recipientEmail,
        appName: config.emailNotification.appName,
        emailEndpoint: config.emailNotification.emailEndpoint || '/notify/bootstrap-error'
      } : undefined,
      errorMessages: {
        backendNotResponding: config?.errorMessages?.backendNotResponding ?? 'Backend server is not responding',
        backendHealthFailed: config?.errorMessages?.backendHealthFailed ?? 'Backend health check failed',
        apiEndpointsFailed: config?.errorMessages?.apiEndpointsFailed ?? 'Failed to reach API endpoints',
        databaseOffline: config?.errorMessages?.databaseOffline ?? 'Database connection failed',
        sessionInvalid: config?.errorMessages?.sessionInvalid ?? 'Session validation failed',
        performanceSlow: config?.errorMessages?.performanceSlow ?? 'API performance is degraded',
        externalIntegrationFailed: config?.errorMessages?.externalIntegrationFailed ?? 'External integration check failed'
      },
      successMessages: {
        backendConnected: config?.successMessages?.backendConnected ?? 'Connected to backend',
        backendHealthy: config?.successMessages?.backendHealthy ?? 'Backend healthy',
        apiEndpoints: config?.successMessages?.apiEndpoints ?? 'API endpoints available',
        authenticated: config?.successMessages?.authenticated ?? 'User authenticated',
        databaseConnected: config?.successMessages?.databaseConnected ?? 'Database connected',
        sessionValid: config?.successMessages?.sessionValid ?? 'Session valid',
        performanceGood: config?.successMessages?.performanceGood ?? 'Performance optimal',
        externalIntegrationOk: config?.successMessages?.externalIntegrationOk ?? 'External integrations available'
      }
    };
  }

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
        error: this.config.errorMessages.backendNotResponding
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
        error: this.config.errorMessages.backendHealthFailed
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

    // Check 4: Database Connectivity (if enabled)
    if (this.config.checkDatabase) {
      const dbCheck = await this.checkDatabase();
      checks.push(dbCheck);
      this.updateState({
        isReady: false,
        checks: [...checks],
        overallStatus: 'initializing'
      });
    }

    // Check 5: Critical Endpoints (if configured)
    if (this.config.criticalEndpoints && this.config.criticalEndpoints.length > 0) {
      const criticalCheck = await this.checkCriticalEndpoints();
      checks.push(criticalCheck);
      this.updateState({
        isReady: false,
        checks: [...checks],
        overallStatus: 'initializing'
      });
    }

    // Check 6: Session Validation (if enabled and session exists)
    if (this.config.validateSession && localStorage.getItem(this.config.authTokenKey)) {
      const sessionCheck = await this.checkSessionValidity();
      checks.push(sessionCheck);
      this.updateState({
        isReady: false,
        checks: [...checks],
        overallStatus: 'initializing'
      });
    }

    // Check 7: External Integrations (if configured)
    if (this.config.externalIntegrations && this.config.externalIntegrations.length > 0) {
      const integrationCheck = await this.checkExternalIntegrations();
      checks.push(integrationCheck);
      this.updateState({
        isReady: false,
        checks: [...checks],
        overallStatus: 'initializing'
      });
    }

    // Check 8: Performance Metrics (if enabled)
    if (this.config.checkPerformance) {
      const perfCheck = await this.checkPerformance();
      checks.push(perfCheck);
      this.updateState({
        isReady: false,
        checks: [...checks],
        overallStatus: 'initializing'
      });
    }

    // Check 9: Authentication Status
    const authCheck = this.checkAuthStatus();
    checks.push(authCheck);
    
    const allSuccessful = checks.every(c => c.status === 'success' || c.status === 'warning');
    
    // Send email notification if there are errors and email is configured
    if (!allSuccessful && this.config.emailNotification?.enabled && !this.emailNotificationSent) {
      this.sendEmailNotification(checks);
      this.emailNotificationSent = true;
    }
    
    this.updateState({
      isReady: allSuccessful,
      checks,
      overallStatus: allSuccessful ? 'ready' : 'error',
      error: allSuccessful ? undefined : 'Some bootstrap checks failed',
      developerNotified: !allSuccessful && this.config.emailNotification?.enabled ? true : false
    });

    return allSuccessful;
  }

  /**
   * Check if backend server is reachable
   */
  private async checkBackendConnectivity(): Promise<BootstrapCheck> {
    try {
      await firstValueFrom(
        this.http.get(`${this.config.apiUrl}/health`)
          .pipe(
            timeout(this.config.timeoutMs),
            catchError((error: HttpErrorResponse) => {
              throw error;
            })
          )
      );
      
      return {
        name: 'Backend Connectivity',
        status: 'success',
        message: `${this.config.successMessages.backendConnected} at ${this.config.apiUrl}`,
        timestamp: new Date()
      };
    } catch (error: any) {
      let errorMessage = this.config.errorMessages.backendNotResponding;
      
      if (error.name === 'TimeoutError') {
        errorMessage = `Backend connection timeout after ${this.config.timeoutMs}ms`;
      } else if (error.status === 0) {
        errorMessage = 'Backend server is not running or not reachable';
      } else if (error.status) {
        errorMessage = `Backend returned error: ${error.status} ${error.statusText || ''}`;
      }
      
      const finalMessage = errorMessage || this.config.errorMessages.backendNotResponding;
      return {
        name: 'Backend Connectivity',
        status: 'error',
        message: finalMessage,
        timestamp: new Date(),
        details: {
          url: this.config.apiUrl,
          error: error?.message || 'Unknown error'
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
        this.http.get(`${this.config.apiUrl}/health`)
          .pipe(timeout(this.config.timeoutMs))
      );
      
      const status = health.status?.toLowerCase() || '';
      if (status && status !== 'ok') {
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
        message: health.message || this.config.successMessages.backendHealthy,
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
      const data: any = await firstValueFrom(
        this.http.get(`${this.config.apiUrl}${this.config.apiEndpoint}`)
          .pipe(
            timeout(this.config.timeoutMs),
            catchError(() => of(null))
          )
      );
      
      if (!data) {
        return {
          name: 'API Endpoints',
          status: 'warning',
          message: 'API reachable but endpoint returned no data',
          timestamp: new Date()
        };
      }
      
      return {
        name: 'API Endpoints',
        status: 'success',
        message: this.config.successMessages.apiEndpoints,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        name: 'API Endpoints',
        status: 'error',
        message: this.config.errorMessages.apiEndpointsFailed,
        timestamp: new Date(),
        details: error.message
      };
    }
  }

  /**
   * Check authentication status
   */
  private checkAuthStatus(): BootstrapCheck {
    const token = localStorage.getItem(this.config.authTokenKey);
    
    if (token) {
      return {
        name: 'Authentication',
        status: 'success',
        message: this.config.successMessages.authenticated,
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
    this.emailNotificationSent = false; // Allow re-sending on retry
    this.updateState({
      isReady: false,
      checks: [],
      overallStatus: 'initializing'
    });
  }

  /**
   * Send email notification about bootstrap errors
   */
  private sendEmailNotification(checks: BootstrapCheck[]): void {
    if (!this.config.emailNotification) return;

    const failedChecks = checks.filter(c => c.status === 'error');
    const warningChecks = checks.filter(c => c.status === 'warning');

    const emailData = {
      to: this.config.emailNotification.recipientEmail,
      subject: `⚠️ ${this.config.emailNotification.appName} - Bootstrap Error Detected`,
      appName: this.config.emailNotification.appName,
      timestamp: new Date().toISOString(),
      failedChecks: failedChecks.map(c => ({
        name: c.name,
        message: c.message,
        details: c.details
      })),
      warningChecks: warningChecks.map(c => ({
        name: c.name,
        message: c.message
      })),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Send asynchronously, don't wait for response
    this.http.post(`${this.config.apiUrl}${this.config.emailNotification.emailEndpoint}`, emailData)
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: () => console.log('[Bootstrap] Email notification sent to developer'),
        error: (err) => console.error('[Bootstrap] Failed to send email notification:', err)
      });
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<BootstrapCheck> {
    try {
      const startTime = Date.now();
      const health: any = await firstValueFrom(
        this.http.get(`${this.config.apiUrl}/health/database`)
          .pipe(
            timeout(this.config.timeoutMs),
            catchError(() => of(null))
          )
      );
      const responseTime = Date.now() - startTime;

      if (!health || !health.connected) {
        return {
          name: 'Database',
          status: 'error',
          message: this.config.errorMessages.databaseOffline,
          timestamp: new Date(),
          details: health
        };
      }

      return {
        name: 'Database',
        status: 'success',
        message: `${this.config.successMessages.databaseConnected} (${responseTime}ms) - ${health.database || 'Neon PostgreSQL'}`,
        timestamp: new Date(),
        details: health
      };
    } catch (error: any) {
      return {
        name: 'Database',
        status: 'warning',
        message: 'Database health endpoint not available (using fallback)',
        timestamp: new Date(),
        details: error?.message || 'Unknown error'
      };
    }
  }

  /**
   * Check critical API endpoints
   */
  private async checkCriticalEndpoints(): Promise<BootstrapCheck> {
    try {
      const results = await Promise.all(
        this.config.criticalEndpoints!.map(endpoint =>
          firstValueFrom(
            this.http.get(`${this.config.apiUrl}${endpoint}`)
              .pipe(
                timeout(this.config.timeoutMs),
                catchError(() => of(null))
              )
          ).catch(() => null)
        )
      );

      const failedEndpoints = this.config.criticalEndpoints!.filter((_, i) => results[i] === null);

      if (failedEndpoints.length > 0) {
        return {
          name: 'Critical Endpoints',
          status: 'warning',
          message: `${failedEndpoints.length}/${this.config.criticalEndpoints!.length} endpoints failed`,
          timestamp: new Date(),
          details: { failed: failedEndpoints }
        };
      }

      return {
        name: 'Critical Endpoints',
        status: 'success',
        message: `All ${this.config.criticalEndpoints!.length} critical endpoints responding`,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        name: 'Critical Endpoints',
        status: 'error',
        message: 'Failed to validate critical endpoints',
        timestamp: new Date(),
        details: error?.message || 'Unknown error'
      };
    }
  }

  /**
   * Validate existing session token
   */
  private async checkSessionValidity(): Promise<BootstrapCheck> {
    try {
      const token = localStorage.getItem(this.config.authTokenKey);
      const headers: any = {};
      
      if (this.config.authTokenKey === 'sessionId') {
        headers['x-session-id'] = token;
      } else {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const validation: any = await firstValueFrom(
        this.http.post(`${this.config.apiUrl}/auth/validate`, {}, { headers })
          .pipe(
            timeout(this.config.timeoutMs),
            catchError(() => of({ valid: false }))
          )
      );

      if (validation.valid) {
        return {
          name: 'Session Validation',
          status: 'success',
          message: this.config.successMessages.sessionValid,
          timestamp: new Date()
        };
      } else {
        // Clear invalid session
        localStorage.removeItem(this.config.authTokenKey);
        return {
          name: 'Session Validation',
          status: 'warning',
          message: 'Session expired (cleared)',
          timestamp: new Date()
        };
      }
    } catch (error: any) {
      return {
        name: 'Session Validation',
        status: 'warning',
        message: 'Session validation not available',
        timestamp: new Date()
      };
    }
  }

  /**
   * Check external integrations
   */
  private async checkExternalIntegrations(): Promise<BootstrapCheck> {
    try {
      const results = await Promise.all(
        this.config.externalIntegrations!.map(integration =>
          firstValueFrom(
            (integration.method === 'POST'
              ? this.http.post(integration.endpoint, {})
              : this.http.get(integration.endpoint)
            ).pipe(
              timeout(this.config.timeoutMs),
              catchError(() => of(null))
            )
          ).catch(() => null)
        )
      );

      const failedIntegrations = this.config.externalIntegrations!.filter((_, i) => results[i] === null);

      if (failedIntegrations.length > 0) {
        return {
          name: 'External Integrations',
          status: 'warning',
          message: `${failedIntegrations.length}/${this.config.externalIntegrations!.length} integrations unavailable`,
          timestamp: new Date(),
          details: { failed: failedIntegrations.map(i => i.name) }
        };
      }

      return {
        name: 'External Integrations',
        status: 'success',
        message: `${this.config.externalIntegrations!.length} integration(s) available`,
        timestamp: new Date()
      };
    } catch (error: any) {
      return {
        name: 'External Integrations',
        status: 'warning',
        message: this.config.errorMessages.externalIntegrationFailed,
        timestamp: new Date(),
        details: error?.message || 'Unknown error'
      };
    }
  }

  /**
   * Check API performance
   */
  private async checkPerformance(): Promise<BootstrapCheck> {
    try {
      const startTime = Date.now();
      await firstValueFrom(
        this.http.get(`${this.config.apiUrl}/health`)
          .pipe(timeout(this.config.timeoutMs))
      );
      const responseTime = Date.now() - startTime;

      if (responseTime > this.config.performanceThresholdMs) {
        return {
          name: 'Performance',
          status: 'warning',
          message: `${this.config.errorMessages.performanceSlow} (${responseTime}ms)`,
          timestamp: new Date(),
          details: { responseTime, threshold: this.config.performanceThresholdMs }
        };
      }

      return {
        name: 'Performance',
        status: 'success',
        message: `${this.config.successMessages.performanceGood} (${responseTime}ms)`,
        timestamp: new Date(),
        details: { responseTime }
      };
    } catch (error: any) {
      return {
        name: 'Performance',
        status: 'warning',
        message: 'Performance check failed',
        timestamp: new Date()
      };
    }
  }
}

