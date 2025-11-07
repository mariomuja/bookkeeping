import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <!-- Developer Card -->
      <div class="developer-card">
        <div class="developer-photo">
          <img src="mario-muja.jpg" alt="Mario Muja" />
        </div>
        <h2>Welcome to International Bookkeeping</h2>
        <p class="developer-description">
          A professional double-entry bookkeeping system built by <strong>Mario Muja</strong>. 
          This application supports multi-currency accounting, journal entries, financial reports, 
          and comprehensive audit trails for complete financial management.
        </p>
        <div class="features-list">
          <div class="feature-item">📚 Chart of Accounts</div>
          <div class="feature-item">📝 Journal Entries</div>
          <div class="feature-item">📊 Financial Reports</div>
          <div class="feature-item">💱 Multi-Currency</div>
        </div>
        <a href="https://github.com/mariomuja/bookkeeping" target="_blank" class="github-link">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          View Source Code on GitHub
        </a>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <h1>International Bookkeeping</h1>
        <p class="subtitle">Professional Financial Management</p>
        
        <div class="demo-notice">
          <p>👋 <strong>Quick Demo Mode</strong></p>
          <p>Click "Login" to instantly access the application without credentials</p>
        </div>
        
        <button class="login-btn" (click)="quickDemoLogin()" [disabled]="loading">
          {{loading ? 'Loading...' : '🚀 Login to Demo'}}
        </button>
        
        <p class="error-message" *ngIf="error">{{error}}</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 30px;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }
    .developer-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      max-width: 450px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .developer-photo {
      width: 120px;
      height: 120px;
      margin: 0 auto 20px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid #667eea;
    }
    .developer-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .developer-card h2 {
      text-align: center;
      color: #333;
      margin: 0 0 20px 0;
      font-size: 24px;
    }
    .developer-description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 25px;
      text-align: center;
    }
    .developer-description strong {
      color: #667eea;
    }
    .features-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 25px;
    }
    .feature-item {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      text-align: center;
      color: #555;
    }
    .github-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      background: #24292e;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s;
    }
    .github-link:hover {
      background: #1a1f23;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .login-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      max-width: 450px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 28px;
      text-align: center;
    }
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
    }
    .demo-notice {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin-bottom: 25px;
      border-radius: 4px;
    }
    .demo-notice p {
      margin: 5px 0;
      color: #1976d2;
    }
    .login-btn {
      width: 100%;
      padding: 14px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    .login-btn:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .login-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .error-message {
      color: #d32f2f;
      text-align: center;
      margin-top: 15px;
    }
    @media (max-width: 968px) {
      .login-container {
        flex-direction: column;
      }
    }
  `]
})
export class LoginSimpleComponent {
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  quickDemoLogin() {
    this.loading = true;
    this.error = '';
    
    // Simulate quick login
    setTimeout(() => {
      const token = 'demo-token-' + Date.now();
      localStorage.setItem('authToken', token);
      this.loading = false;
      this.router.navigate(['/dashboard']);
    }, 500);
  }
}

