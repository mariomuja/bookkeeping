import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, User, TwoFactorSetup } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  currentUser: User | null = null;
  twoFactorSetup: TwoFactorSetup | null = null;
  verificationCode = '';
  disableCode = '';
  
  loading = false;
  error = '';
  success = '';
  showSetup2FA = false;
  showDisable2FA = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  initiate2FASetup(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService.setup2FA().subscribe({
      next: (setup) => {
        this.twoFactorSetup = setup;
        this.showSetup2FA = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('2FA Setup Error:', err);
        this.error = this.extractErrorMessage(err) || 'Failed to setup 2FA';
        this.loading = false;
      }
    });
  }

  enable2FA(): void {
    if (!this.verificationCode) {
      this.error = 'Please enter the verification code';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.enable2FA(this.verificationCode).subscribe({
      next: () => {
        this.success = '2FA enabled successfully!';
        this.showSetup2FA = false;
        this.twoFactorSetup = null;
        this.verificationCode = '';
        this.loading = false;
        
        // Reload user data
        this.authService.loadCurrentUser().subscribe();
      },
      error: (err) => {
        console.error('Enable 2FA Error:', err);
        this.error = this.extractErrorMessage(err) || 'Invalid verification code';
        this.loading = false;
      }
    });
  }

  openDisable2FA(): void {
    this.showDisable2FA = true;
    this.error = '';
    this.success = '';
  }

  disable2FA(): void {
    if (!this.disableCode) {
      this.error = 'Please enter your 2FA code to disable';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.disable2FA(this.disableCode).subscribe({
      next: () => {
        this.success = '2FA disabled successfully';
        this.showDisable2FA = false;
        this.disableCode = '';
        this.loading = false;
        
        // Reload user data
        this.authService.loadCurrentUser().subscribe();
      },
      error: (err) => {
        console.error('Disable 2FA Error:', err);
        this.error = this.extractErrorMessage(err) || 'Failed to disable 2FA';
        this.loading = false;
      }
    });
  }

  cancelSetup(): void {
    this.showSetup2FA = false;
    this.twoFactorSetup = null;
    this.verificationCode = '';
    this.error = '';
  }

  cancelDisable(): void {
    this.showDisable2FA = false;
    this.disableCode = '';
    this.error = '';
  }

  private extractErrorMessage(err: any): string {
    // Try multiple ways to extract error message
    if (typeof err === 'string') {
      return err;
    }
    if (err?.error?.error && typeof err.error.error === 'string') {
      return err.error.error;
    }
    if (err?.error?.message && typeof err.error.message === 'string') {
      return err.error.message;
    }
    if (err?.message && typeof err.message === 'string') {
      return err.message;
    }
    if (err?.statusText && typeof err.statusText === 'string') {
      return err.statusText;
    }
    // If we still have an object, convert to JSON string
    if (typeof err === 'object') {
      try {
        return JSON.stringify(err, null, 2);
      } catch {
        return 'An error occurred';
      }
    }
    return 'An unknown error occurred';
  }
}

