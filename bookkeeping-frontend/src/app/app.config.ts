import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { BootstrapConfig, BOOTSTRAP_CONFIG } from '@shared-components/services';

import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    importProvidersFrom(
      TranslateModule.forRoot()
    ),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    }),
    {
      provide: BOOTSTRAP_CONFIG,
      useValue: {
        apiUrl: environment.apiUrl || '/api',
        timeoutMs: 5000,
        apiEndpoint: '/organizations',
        authTokenKey: 'authToken',
        errorMessages: {
          backendNotResponding: 'Backend server is not responding. Please ensure the backend is running.',
          backendHealthFailed: 'Backend health check failed',
          apiEndpointsFailed: 'Failed to reach API endpoints'
        },
        successMessages: {
          backendConnected: 'Connected to backend',
          backendHealthy: 'Backend healthy',
          apiEndpoints: 'API endpoints available',
          authenticated: 'User authenticated'
        }
      } as BootstrapConfig
    }
  ]
};
