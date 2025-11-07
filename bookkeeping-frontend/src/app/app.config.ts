import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { BootstrapConfig, BOOTSTRAP_CONFIG, DocumentationConfig, DOCUMENTATION_CONFIG } from '@shared-components/services';

import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    {
      provide: BOOTSTRAP_CONFIG,
      useValue: {
        apiUrl: environment.apiUrl || '/api',
        timeoutMs: 5000,
        apiEndpoint: '/organizations',
        authTokenKey: 'authToken',
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
    },
    {
      provide: DOCUMENTATION_CONFIG,
      useValue: {
        docsBasePath: '/docs',
        files: [
          { filename: 'QUICK_START.md', title: 'Quick Start Guide', path: '/docs/QUICK_START.md', category: 'Getting Started', order: 1 },
          { filename: 'SETUP.md', title: 'Setup Instructions', path: '/docs/SETUP.md', category: 'Getting Started', order: 2 },
          { filename: 'AUTHENTICATION_GUIDE.md', title: 'Authentication & Security', path: '/docs/AUTHENTICATION_GUIDE.md', category: 'Security', order: 3 },
          { filename: 'COMPLETE_SYSTEM_GUIDE.md', title: 'Complete System Guide', path: '/docs/COMPLETE_SYSTEM_GUIDE.md', category: 'User Guide', order: 4 },
          { filename: 'CUSTOM_FIELDS_GUIDE.md', title: 'Custom Fields Guide', path: '/docs/CUSTOM_FIELDS_GUIDE.md', category: 'Features', order: 5 },
          { filename: 'MULTI_CURRENCY_TIMEZONE_GUIDE.md', title: 'Multi-Currency & Timezone', path: '/docs/MULTI_CURRENCY_TIMEZONE_GUIDE.md', category: 'Features', order: 6 },
          { filename: 'FEATURES_SUMMARY.md', title: 'Features Summary', path: '/docs/FEATURES_SUMMARY.md', category: 'Reference', order: 7 },
          { filename: 'IMPLEMENTATION_COMPLETE.md', title: 'Implementation Details', path: '/docs/IMPLEMENTATION_COMPLETE.md', category: 'Technical', order: 8 },
          { filename: 'TEST_RESULTS.md', title: 'Test Results', path: '/docs/TEST_RESULTS.md', category: 'Technical', order: 9 },
          { filename: 'TROUBLESHOOTING.md', title: 'Troubleshooting', path: '/docs/TROUBLESHOOTING.md', category: 'Support', order: 10 }
        ]
      } as DocumentationConfig
    }
  ]
};
