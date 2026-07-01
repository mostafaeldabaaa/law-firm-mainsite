// consultation-chat.component.ts
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Consultation } from '../../../core/models/consultation.model';

@Component({
  selector: 'app-consultation-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultation-chat.component.html',
})
export class ConsultationChatComponent {
  @Input({ required: true }) consultation!: Consultation;

  @Output() sendMessage = new EventEmitter<{ id: string; text: string }>();
  @Output() assignLawyer = new EventEmitter<{ id: string; lawyerId: string }>();
  @Output() convertToCase = new EventEmitter<string>();

  draft = signal('');
  showAssignBox = signal(false);
  lawyerIdDraft = signal('');

  submitMessage(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.sendMessage.emit({ id: this.consultation._id, text });
    this.draft.set('');
  }

  submitAssign(): void {
    const lawyerId = this.lawyerIdDraft().trim();
    if (!lawyerId) return;
    this.assignLawyer.emit({ id: this.consultation._id, lawyerId });
    this.showAssignBox.set(false);
    this.lawyerIdDraft.set('');
  }

  onConvertToCase(): void {
    this.convertToCase.emit(this.consultation._id);
  }
}