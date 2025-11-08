import { Component, Output, EventEmitter } from '@angular/core';
import { SharedDocumentationModalComponent } from '../../shared/documentation';

@Component({
  selector: 'app-documentation-modal',
  standalone: true,
  imports: [SharedDocumentationModalComponent],
  template: `<shared-documentation-modal (close)="onClose()"></shared-documentation-modal>`
})
export class DocumentationModalComponent {
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}

