// consultations-page.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationsService } from '../../../core/services/consultations.service';
import { Consultation, unwrapConsultation } from '../../../core/models/consultation.model';
import { ConsultationsListComponent } from '../consultation-list/consultation-list.component';
import { ConsultationChatComponent } from '../consultation-chat/consultation-chat.component';
import { NewConsultationModalComponent } from '../new-consultation-modal/new-consultation-modal.component';

@Component({
  selector: 'app-consultations-page',
  standalone: true,
  imports: [
    CommonModule,
    ConsultationsListComponent,
    ConsultationChatComponent,
    NewConsultationModalComponent,
  ],
  templateUrl: './consultations-page.component.html',
})
export class ConsultationsPageComponent implements OnInit {
  consultations = signal<Consultation[]>([]);
  selectedId = signal<string | null>(null);
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  showNewModal = signal(false);

  selected = computed(() => {
    const list = this.consultations();
    if (!Array.isArray(list)) return null;
    return list.find((c) => c._id === this.selectedId()) ?? null;
  });

  constructor(private consultationsService: ConsultationsService) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.consultationsService.getAll().subscribe({
      next: (res) => {
        this.consultations.set(res.data?.consultations ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('تعذر تحميل الاستشارات، حاول مرة أخرى');
        this.loading.set(false);
      },
    });
  }

  onSelect(id: string): void {
    this.selectedId.set(id);
    this.consultationsService.getById(id).subscribe({
      next: (res) => {
        const detail = unwrapConsultation(res.data);
        if (!detail) {
          console.error('شكل استجابة getById غير متوقع:', res);
          return;
        }
        this.consultations.update((list) =>
          list.map((c) => (c._id === id ? detail : c)),
        );
      },
      error: (err) => console.error('فشل تحميل تفاصيل الاستشارة:', err),
    });
  }

  onMessageSent(payload: { id: string; text: string }): void {
    this.consultationsService.sendMessage(payload.id, payload.text).subscribe({
      next: (res) => {
        const detail = unwrapConsultation(res.data);
        if (!detail) return;
        this.consultations.update((list) =>
          list.map((c) => (c._id === payload.id ? detail : c)),
        );
      },
      error: (err) => console.error('فشل إرسال الرسالة:', err),
    });
  }

  onAssign(payload: { id: string; lawyerId: string }): void {
    this.consultationsService.assign(payload.id, payload.lawyerId).subscribe({
      next: (res) => {
        const detail = unwrapConsultation(res.data);
        if (!detail) return;
        this.consultations.update((list) =>
          list.map((c) => (c._id === payload.id ? detail : c)),
        );
      },
      error: (err) => console.error('فشل إسناد المحامي:', err),
    });
  }

  onConvertToCase(id: string): void {
    this.consultationsService.convertToCase(id).subscribe({
      next: () => this.loadConsultations(),
      error: (err) => console.error('فشل التحويل إلى قضية:', err),
    });
  }

  openNewModal(): void {
    this.showNewModal.set(true);
  }

  closeNewModal(): void {
    this.showNewModal.set(false);
  }

  onCreate(payload: { title: string; initialMessage: string }): void {
    this.consultationsService
      .create({ subject: payload.title, description: payload.initialMessage })
      .subscribe({
        next: (res) => {
          const detail = unwrapConsultation(res.data);
          if (!detail) return;
          this.consultations.update((list) => [detail, ...list]);
          this.selectedId.set(detail._id);
          this.closeNewModal();
        },
        error: (err) => console.error('فشل إنشاء الاستشارة:', err),
      });
  }
}