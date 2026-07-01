// new-consultation-modal.component.ts
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-consultation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-consultation-modal.component.html',
})
export class NewConsultationModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{ title: string; initialMessage: string }>();

  title = signal('');
  initialMessage = signal('');
  submitted = signal(false);

  get isValid(): boolean {
    return this.title().trim().length > 0 && this.initialMessage().trim().length > 0;
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.isValid) return;
    this.create.emit({
      title: this.title().trim(),
      initialMessage: this.initialMessage().trim(),
    });
  }
}