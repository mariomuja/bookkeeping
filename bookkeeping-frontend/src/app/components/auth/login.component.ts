import { Component } from '@angular/core';
import { SharedLoginComponent, LoginConfig } from '@shared-components/login';
import { AuthService } from '../../services/auth.service';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedLoginComponent],
  template: `<shared-login [config]="loginConfig" [authService]="authService" [organizationService]="organizationService"></shared-login>`
})
export class LoginComponent {
  loginConfig: LoginConfig = {
    appTitle: 'International Bookkeeping',
    redirectAfterLogin: '/dashboard',
    showDeveloperCard: true,
    photoUrl: 'mario-muja.jpg',
    githubRepoUrl: 'https://github.com/mariomuja/bookkeeping',
    demoCredentials: {
      username: 'demo',
      password: 'DemoUser2025!Secure'
    }
  };

  constructor(
    public authService: AuthService,
    public organizationService: OrganizationService
  ) {}
}

