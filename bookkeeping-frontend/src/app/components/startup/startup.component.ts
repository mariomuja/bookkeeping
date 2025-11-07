import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-startup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="startup-container">
      <h1>Loading...</h1>
      <p>Redirecting to login...</p>
    </div>
  `,
  styles: [`
    .startup-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
  `]
})
export class StartupComponent {
  // This component is bypassed - users go directly to login
}
