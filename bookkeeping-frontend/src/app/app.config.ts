import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations()
    // TODO: Re-add shared component providers once NG0203 is resolved
    /*{
      provide: BOOTSTRAP_CONFIG,
      useValue: {
        apiUrl: environment.apiUrl || '/api',
        timeoutMs: 5000,
        apiEndpoint: '/organizations',
        authTokenKey: 'authToken',
        emailNotification: {
          enabled: true,
          recipientEmail: 'mario.muja@gmail.com',
          appName: 'International Bookkeeping',
          emailEndpoint: '/notify/bootstrap-error'
        },
        checkDatabase: true,
        validateSession: true,
        checkPerformance: true,
        performanceThresholdMs: 1000,
        criticalEndpoints: [
          '/organizations',
          '/organizations/550e8400-e29b-41d4-a716-446655440000/accounts',
          '/organizations/550e8400-e29b-41d4-a716-446655440000/dashboard'
        ],
        externalIntegrations: [
          {
            name: 'KPI Dashboard Integration',
            endpoint: 'https://international-kpi-dashboard.vercel.app/api/health',
            method: 'GET'
          }
        ],
        errorMessages: {
          backendNotResponding: 'Backend server is not responding',
          backendHealthFailed: 'Backend health check failed',
          apiEndpointsFailed: 'Failed to reach critical API endpoints',
          databaseOffline: 'Neon database connection failed',
          sessionInvalid: 'Session expired or invalid',
          performanceSlow: 'API response time is slow',
          externalIntegrationFailed: 'External integrations unavailable'
        },
        successMessages: {
          backendConnected: 'Vercel Serverless Functions online',
          backendHealthy: 'Backend healthy',
          apiEndpoints: 'All serverless functions responding',
          authenticated: 'User authenticated',
          databaseConnected: 'Neon PostgreSQL connected',
          sessionValid: 'Session valid',
          performanceGood: 'Performance optimal',
          externalIntegrationOk: 'Cross-app integrations available'
        }
      } as BootstrapConfig
    } */
  ]
};
