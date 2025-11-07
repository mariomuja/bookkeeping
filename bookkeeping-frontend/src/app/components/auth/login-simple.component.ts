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
      <div class="login-card">
        <h1>International Bookkeeping</h1>
        <p class="subtitle">Welcome to the demo</p>
        
        <div class="demo-notice">
          <p>👋 <strong>Quick Demo Mode</strong></p>
          <p>Click "Login" to instantly access the application without credentials</p>
        </div>
        
        <button class="login-btn" (click)="quickDemoLogin()" [disabled]="loading">
          {{loading ? 'Loading...' : '🚀 Login to Demo'}}
        </button>
        
        <p class="error-message" *ngIf="error">{{error}}</p>
        
        <div class="developer-info">
          <p>Developed by Mario Muja</p>
          <a href="https://github.com/mariomuja/bookkeeping" target="_blank">View on GitHub</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
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
    .developer-info {
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .developer-info a {
      color: #667eea;
      text-decoration: none;
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

