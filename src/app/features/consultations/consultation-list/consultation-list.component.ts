// consultation-list.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Consultation, STATUS_LABELS } from '../../../core/models/consultation.model';

@Component({
  selector: 'app-consultations-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultation-list.component.html',
})
export class ConsultationsListComponent {
  @Input({ required: true }) consultations: Consultation[] = [];
  @Input() selectedId: string | null = null;
  @Input() loading = false;
  @Output() select = new EventEmitter<string>();

  statusLabels = STATUS_LABELS;

  trackById(_: number, item: Consultation): string {
    return item._id;
  }
}