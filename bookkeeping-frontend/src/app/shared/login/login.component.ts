import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginConfig } from './login-config.interface';

// Note: AuthService and OrganizationService should be provided by the consuming app
@Component({
  selector: 'shared-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class SharedLoginComponent implements OnInit {
  @Input() config!: LoginConfig;
  @Input() authService: any; // Will be injected by consuming app
  @Input() organizationService?: any; // Optional, for bookkeeping app
  @Output() loginSuccess = new EventEmitter<void>();
  
  username = '';
  password = '';
  twoFactorCode = '';
  tempToken = '';
  
  loading = false;
  error = '';
  requiresTwoFactor = false;
  showPassword = false;
  loginMode: 'demo' | 'production' = 'demo';
  
  get isReady(): boolean {
    return !!this.config && !!this.config.appTitle;
  }

  ngOnInit() {
    // If already authenticated, emit success (parent will handle navigation)
    if (this.authService?.isAuthenticated()) {
      this.loginSuccess.emit();
    }
    
    // Set default mode based on config
    if (this.config?.quickDemoMode) {
      this.loginMode = 'demo';
    } else if (this.config?.showProductionLogin) {
      this.loginMode = 'production';
    }
  }

  switchToProductionLogin() {
    this.loginMode = 'production';
    this.error = '';
  }

  switchToDemoLogin() {
    this.loginMode = 'demo';
    this.error = '';
  }

  quickDemoLogin() {
    if (!this.config?.demoCredentials) {
      this.error = 'Demo credentials not configured';
      return;
    }
    
    // Auto-fill demo credentials and login
    this.username = this.config.demoCredentials.username || '';
    this.password = this.config.demoCredentials.password || '';
    this.onLogin();
  }

  async onLogin() {
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        if (response.requiresTwoFactor) {
          this.requiresTwoFactor = true;
          this.tempToken = response.tempToken || '';
          this.loading = false;
        } else {
          // Login successful - set organization
          this.setOrganizationAndNavigate(response.user?.organizationId);
        }
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Login failed. Please check your credentials.';
        this.loading = false;
      }
    });
  }

  async onVerify2FA() {
    if (!this.twoFactorCode) {
      this.error = 'Please enter the 2FA code';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.verify2FA(this.tempToken, this.twoFactorCode).subscribe({
      next: (response: any) => {
        this.setOrganizationAndNavigate(response.user?.organizationId);
      },
      error: (err: any) => {
        this.error = err.error?.error || '2FA verification failed';
        this.loading = false;
      }
    });
  }

  setOrganizationAndNavigate(orgId?: string): void {
    // Set organization if organizationService is provided (bookkeeping app)
    if (this.organizationService) {
      const demoOrg = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Demo Company',
        countryCode: 'US',
        defaultCurrency: 'USD',
        defaultTimezone: 'America/New_York',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      this.organizationService.setCurrentOrganization(demoOrg);
    }
    
    // Emit success - parent component will handle navigation
    this.loginSuccess.emit();
  }

  cancelTwoFactor() {
    this.requiresTwoFactor = false;
    this.twoFactorCode = '';
    this.tempToken = '';
    this.error = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}

