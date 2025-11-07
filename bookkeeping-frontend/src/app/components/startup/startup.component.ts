import { Component } from '@angular/core';
import { SharedStartupShellComponent, StartupConfig } from '@shared-components/startup';

@Component({
  selector: 'app-startup',
  standalone: true,
  imports: [SharedStartupShellComponent],
  template: `<shared-startup-shell 
    [config]="startupConfig" 
    [redirectAfterSuccess]="'/dashboard'"
    [redirectAfterError]="'/login'"
    [authTokenKey]="'authToken'">
  </shared-startup-shell>`
})
export class StartupComponent {
  startupConfig: StartupConfig = {
    appName: 'International Bookkeeping',
    logoSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>`,
    versionText: 'International Bookkeeping v1.0.0 | Mario Muja',
    retryLabel: 'Retry Connection',
    instructionsLabel: 'Setup Instructions',
    instructionsUrl: 'https://github.com/mariomuja/bookkeeping',
    initializingSubtitle: 'Starting application...',
    helpSteps: [
      'Ensure the backend server is running: <code>cd bookkeeping-backend && npm start</code>',
      'Check that the backend is accessible at: <code>http://localhost:3000</code>',
      'Verify no firewall is blocking the connection',
      'Check the browser console for additional error details'
    ]
  };
}

