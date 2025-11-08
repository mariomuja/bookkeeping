import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedLoginComponent, LoginConfig } from '@mariomuja/angular-shared-components';
import { AuthService } from '../../services/auth.service';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedLoginComponent],
  template: `<shared-login 
    [config]="loginConfig" 
    [authService]="authService" 
    [organizationService]="organizationService"
    (loginSuccess)="onLoginSuccess()"></shared-login>`
})
export class LoginComponent {
  loginConfig: LoginConfig = {
    appTitle: 'International Bookkeeping',
    redirectAfterLogin: '/dashboard',
    showDeveloperCard: true,
    photoUrl: 'mario-muja.jpg',
    githubRepoUrl: 'https://github.com/mariomuja/bookkeeping',
    quickDemoMode: true,
    showProductionLogin: false,
    authenticationMethods: ['credentials', 'activeDirectory', 'google', 'microsoft', 'saml'],
    demoCredentials: {
      username: 'demo',
      password: 'DemoUser2025!Secure'
    }
  };

  constructor(
    public authService: AuthService,
    public organizationService: OrganizationService,
    private router: Router
  ) {}

  onLoginSuccess() {
    this.router.navigate([this.loginConfig.redirectAfterLogin || '/dashboard']);
  }
}

