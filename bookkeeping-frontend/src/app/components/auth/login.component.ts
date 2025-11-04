import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  twoFactorCode = '';
  tempToken = '';
  
  loading = false;
  error = '';
  requiresTwoFactor = false;

  constructor(
    private authService: AuthService,
    private organizationService: OrganizationService,
    private router: Router
  ) {
    // If already authenticated, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onLogin() {
    if (!this.username || !this.password) {
      this.error = 'Please enter username and password';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.requiresTwoFactor) {
          this.requiresTwoFactor = true;
          this.tempToken = response.tempToken || '';
          this.loading = false;
        } else {
          // Login successful - set organization
          this.setOrganizationAndNavigate(response.user?.organizationId);
        }
      },
      error: (err) => {
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
      next: (response) => {
        this.setOrganizationAndNavigate(response.user?.organizationId);
      },
      error: (err) => {
        this.error = err.error?.error || '2FA verification failed';
        this.loading = false;
      }
    });
  }

  setOrganizationAndNavigate(orgId?: string): void {
    // Set the demo organization
    const demoOrg = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Demo Insurance Company',
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
    this.router.navigate(['/dashboard']);
  }

  cancelTwoFactor() {
    this.requiresTwoFactor = false;
    this.twoFactorCode = '';
    this.tempToken = '';
    this.error = '';
  }
}

