import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="impressum-link">
      <button (click)="showImpressum = !showImpressum" class="impressum-button">
        Impressum
      </button>
    </div>

    <div *ngIf="showImpressum" class="impressum-modal" (click)="showImpressum = false">
      <div class="impressum-content" (click)="$event.stopPropagation()">
        <div class="impressum-header">
          <h2>Impressum</h2>
          <button class="close-button" (click)="showImpressum = false">×</button>
        </div>
        <div class="impressum-body">
          <h3>Angaben gemäß § 5 TMG</h3>
          <p>
            Mario Muja<br>
            Hohe Liedt 45 F<br>
            22417 Hamburg<br>
            Deutschland
          </p>

          <h3>Kontakt</h3>
          <p>
            E-Mail: <a href="mailto:mario.muja&#64;gmail.com">mario.muja&#64;gmail.com</a>
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
    .impressum-link {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999;
    }

    .impressum-button {
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .impressum-button:hover {
      background: #e5e7eb;
      color: #1f2937;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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

    @media (max-width: 640px) {
      .impressum-link {
        bottom: 10px;
        right: 10px;
      }

      .impressum-button {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
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

