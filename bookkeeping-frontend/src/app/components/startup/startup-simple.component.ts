import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BootstrapService, BootstrapState } from '@mariomuja/angular-shared-components';

@Component({
  selector: 'app-startup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="startup-container">
      <div class="startup-card">
        <div class="app-header">
          <div class="app-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <h1>International Bookkeeping</h1>
          <p class="subtitle">Starting application...</p>
        </div>

        <div class="checks-container" *ngIf="bootstrapState.checks.length > 0">
          <div class="overall-status" [class.success]="bootstrapState.overallStatus === 'ready'" 
               [class.error]="bootstrapState.overallStatus === 'error'">
            {{getOverallStatusIcon()}}
          </div>

          <div class="checks-list">
            <div *ngFor="let check of bootstrapState.checks" 
                 class="check-item"
                 [class.success]="check.status === 'success'"
                 [class.error]="check.status === 'error'"
                 [class.warning]="check.status === 'warning'">
              <div class="check-icon">{{getStatusIcon(check.status)}}</div>
              <div class="check-details">
                <div class="check-name">{{check.name}}</div>
                <div class="check-message">{{check.message}}</div>
                <div *ngIf="check.details" class="check-extra">{{check.details}}</div>
              </div>
            </div>
          </div>

          <div *ngIf="bootstrapState.overallStatus === 'error'" class="error-container">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
              <h3>Startup Failed</h3>
              <p>Some bootstrap checks failed</p>
              <p *ngIf="emailNotified" class="email-notice">
                ✅ <strong>Developer Notified:</strong> The developer has been automatically notified about this issue via email and will investigate.
              </p>
            </div>
            <div class="error-actions">
              <button (click)="retry()" [disabled]="isRetrying" class="retry-btn">
                {{isRetrying ? '⏳ Retrying...' : '🔄 Retry Connection'}}
              </button>
            </div>
          </div>
        </div>

        <div class="version-footer">International Bookkeeping v1.0.0 | Mario Muja</div>
      </div>
    </div>
  `,
  styles: [`
    .startup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .startup-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 700px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .app-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .app-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 15px;
    }
    .app-icon svg {
      stroke: #667eea;
    }
    h1 {
      margin: 10px 0;
      color: #333;
      font-size: 32px;
    }
    .subtitle {
      color: #666;
      margin: 5px 0;
    }
    .overall-status {
      text-align: center;
      font-size: 48px;
      margin: 20px 0;
    }
    .overall-status.success { color: #4caf50; }
    .overall-status.error { color: #f44336; }
    .checks-list {
      margin: 20px 0;
    }
    .check-item {
      display: flex;
      gap: 15px;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      background: #f5f5f5;
      transition: all 0.3s;
    }
    .check-item.success {
      background: #e8f5e9;
      border-left: 4px solid #4caf50;
    }
    .check-item.error {
      background: #ffebee;
      border-left: 4px solid #f44336;
    }
    .check-item.warning {
      background: #fff3e0;
      border-left: 4px solid #ff9800;
    }
    .check-icon {
      font-size: 24px;
      line-height: 1;
    }
    .check-details {
      flex: 1;
    }
    .check-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }
    .check-message {
      color: #666;
      font-size: 14px;
    }
    .check-extra {
      color: #999;
      font-size: 12px;
      margin-top: 4px;
      font-family: monospace;
    }
    .error-container {
      margin-top: 25px;
      padding: 20px;
      background: #fff3e0;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
    }
    .error-icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 10px;
    }
    .error-content {
      text-align: center;
    }
    .error-content h3 {
      margin: 10px 0;
      color: #333;
    }
    .error-content p {
      margin: 8px 0;
      color: #666;
    }
    .email-notice {
      margin-top: 15px !important;
      padding: 12px;
      background: #e8f5e9;
      border-radius: 6px;
      color: #2e7d32 !important;
    }
    .error-actions {
      margin-top: 20px;
      text-align: center;
    }
    .retry-btn {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .retry-btn:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }
    .retry-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .version-footer {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class StartupSimpleComponent implements OnInit, OnDestroy {
  bootstrapState: BootstrapState = {
    isReady: false,
    checks: [],
    overallStatus: 'initializing'
  };
  
  isRetrying = false;
  emailNotified = false;
  private subscription?: Subscription;

  constructor(
    @Optional() private bootstrapService: BootstrapService,
    private router: Router
  ) {
    // If BootstrapService is not available, redirect immediately
    if (!this.bootstrapService) {
      console.warn('BootstrapService not available, redirecting to login');
      setTimeout(() => this.router.navigate(['/login']), 0);
    }
  }

  ngOnInit(): void {
    if (!this.bootstrapService) {
      return; // Already redirecting in constructor
    }
    
    this.subscription = this.bootstrapService.bootstrapState$.subscribe(state => {
      this.bootstrapState = state;
      this.emailNotified = (this.bootstrapService as any).emailNotificationSent || false;
      
      if (state.isReady && state.overallStatus === 'ready') {
        setTimeout(() => {
          this.proceedToApp();
        }, 1000);
      }
    });

    this.runChecks();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  async runChecks(): Promise<void> {
    if (this.bootstrapService) {
      await this.bootstrapService.runBootstrapChecks();
    }
  }

  async retry(): Promise<void> {
    if (!this.bootstrapService) return;
    
    this.isRetrying = true;
    this.bootstrapService.reset();
    await this.runChecks();
    this.isRetrying = false;
  }

  proceedToApp(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'pending': return '...';
      default: return '?';
    }
  }

  getOverallStatusIcon(): string {
    switch (this.bootstrapState.overallStatus) {
      case 'ready': return '✓';
      case 'error': return '✗';
      case 'initializing': return '...';
      default: return '?';
    }
  }
}

