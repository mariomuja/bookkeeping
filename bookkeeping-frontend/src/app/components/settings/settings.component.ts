import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User, TwoFactorSetup } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        this.error = err.error?.error || 'Failed to setup 2FA';
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
        this.error = err.error?.error || 'Invalid verification code';
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
        this.error = err.error?.error || 'Failed to disable 2FA';
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
}

