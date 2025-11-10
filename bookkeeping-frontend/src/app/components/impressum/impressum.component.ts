import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <footer class="app-footer">
      <div class="footer-content">
        <p class="footer-text">
          © 2025 Mario Muja | BookKeeper Pro v1.0.0
        </p>
        <div class="footer-links">
          <a href="https://github.com/mariomuja/bookkeeping" target="_blank" rel="noopener noreferrer" class="footer-link">
            GitHub
          </a>
          <span class="footer-separator">|</span>
          <a href="javascript:void(0)" (click)="showImpressum = !showImpressum" class="footer-link impressum-link">
            Impressum
          </a>
          <span class="footer-separator">|</span>
          <span class="footer-info">
            🛡️ Keine Cookies • Keine Datenerfassung
          </span>
        </div>
      </div>
    </footer>

    <div *ngIf="showImpressum" class="impressum-modal" (click)="showImpressum = false">
      <div class="impressum-content" (click)="$event.stopPropagation()">
        <div class="impressum-header">
          <h2>Impressum</h2>
          <button class="close-button" (click)="showImpressum = false">×</button>
        </div>
        <div class="impressum-body">
          <h3>Angaben gemäß § 5 TMG</h3>
          <p>
            <strong>Mario Muja</strong><br>
            Hohe Liedt 45 F<br>
            22417 Hamburg<br>
            Deutschland
          </p>

          <h3>Kontakt</h3>
          <p>
            <strong>Telefon Deutschland:</strong> <a href="tel:+4915204641473">+49 1520 464 1473</a><br>
            <strong>Telefon Italien:</strong> <a href="tel:+393453450098">+39 345 345 0098</a><br>
            <strong>E-Mail:</strong> <a href="mailto:mario.muja@gmail.com">mario.muja@gmail.com</a>
          </p>

          <h3>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
          <p>
            Mario Muja<br>
            Hohe Liedt 45 F<br>
            22417 Hamburg
          </p>

          <h3>Haftungsausschluss</h3>
          <h4>Haftung für Inhalte</h4>
          <p>
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
            Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte 
            können wir jedoch keine Gewähr übernehmen.
          </p>

          <h4>Haftung für Links</h4>
          <p>
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren 
            Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden 
            Inhalte auch keine Gewähr übernehmen.
          </p>

          <h4>Urheberrecht</h4>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen 
            Seiten unterliegen dem deutschen Urheberrecht.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-footer {
      margin-top: 60px;
      padding: 24px 0;
      border-top: 2px solid #e5e7eb;
      background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
      width: 100%;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .footer-text {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }

    .footer-links {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
    }

    .footer-link {
      color: #667eea;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .footer-link:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    .footer-separator {
      color: #d1d5db;
    }

    .footer-info {
      color: #6b7280;
      font-size: 13px;
    }

    .impressum-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    }

    .impressum-content {
      background: white;
      border-radius: 0.5rem;
      max-width: 600px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .impressum-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .impressum-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 2rem;
      color: #9ca3af;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      transition: all 0.2s;
    }

    .close-button:hover {
      background: #f3f4f6;
      color: #1f2937;
    }

    .impressum-body {
      padding: 1.5rem;
    }

    .impressum-body h3 {
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
    }

    .impressum-body h3:first-child {
      margin-top: 0;
    }

    .impressum-body h4 {
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
    }

    .impressum-body p {
      margin: 0.5rem 0;
      line-height: 1.6;
      color: #6b7280;
    }

    .impressum-body a {
      color: #3b82f6;
      text-decoration: none;
    }

    .impressum-body a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        text-align: center;
      }

      .footer-links {
        flex-direction: column;
        gap: 8px;
      }

      .footer-separator {
        display: none;
      }

      .impressum-content {
        max-height: 90vh;
      }

      .impressum-header {
        padding: 1rem;
      }

      .impressum-body {
        padding: 1rem;
      }
    }
  `]
})
export class ImpressumComponent {
  showImpressum = false;
}

