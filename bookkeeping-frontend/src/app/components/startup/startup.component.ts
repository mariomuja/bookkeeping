import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BootstrapService, BootstrapState, BootstrapCheck } from '../../services/bootstrap.service';

@Component({
  selector: 'app-startup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './startup.component.html',
  styleUrls: ['./startup.component.css']
})
export class StartupComponent implements OnInit {
  bootstrapState: BootstrapState = {
    isReady: false,
    checks: [],
    overallStatus: 'initializing'
  };
  
  isRetrying = false;

  constructor(
    private bootstrapService: BootstrapService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to bootstrap state changes
    this.bootstrapService.bootstrapState$.subscribe(state => {
      this.bootstrapState = state;
      
      // If ready, proceed to the app
      if (state.isReady && state.overallStatus === 'ready') {
        setTimeout(() => {
          this.proceedToApp();
        }, 500);
      }
    });

    // Run bootstrap checks
    this.runChecks();
  }

  async runChecks(): Promise<void> {
    await this.bootstrapService.runBootstrapChecks();
  }

  async retry(): Promise<void> {
    this.isRetrying = true;
    this.bootstrapService.reset();
    await this.runChecks();
    this.isRetrying = false;
  }

  proceedToApp(): void {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'pending':
        return '...';
      default:
        return '?';
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  openBackendInstructions(): void {
    window.open('https://github.com/yourusername/bookkeeping/blob/main/SETUP.md', '_blank');
  }
}

