import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConsultationsService } from '../../../core/services/index';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header">
        <h1>💬 الاستشارات</h1>
        <button class="btn-primary" (click)="showForm = !showForm">➕ استشارة جديدة</button>
      </div>

      <!-- New Consultation -->
      <div class="card" *ngIf="showForm">
        <h3>طلب استشارة جديدة</h3>
        <div class="form-grid">
          <div class="form-group full"><label>الموضوع *</label><input type="text" [(ngModel)]="form.subject" placeholder="موضوع الاستشارة" /></div>
          <div class="form-group full"><label>الوصف *</label><textarea [(ngModel)]="form.description" rows="3" placeholder="وصف تفصيلي..."></textarea></div>
        </div>
        <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        <div class="form-actions">
          <button class="btn-primary" (click)="addConsultation()" [disabled]="saving">{{ saving ? 'جاري الإرسال...' : 'إرسال' }}</button>
          <button class="btn-cancel" (click)="showForm = false">إلغاء</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()">
          <option value="">كل الحالات</option>
          <option value="pending">معلقة</option>
          <option value="in_progress">قيد المعالجة</option>
          <option value="answered">تمت الإجابة</option>
          <option value="closed">مغلقة</option>
        </select>
      </div>

      <div class="loading" *ngIf="loading">جاري التحميل...</div>
      <div class="list" *ngIf="!loading">
        <div class="consult-card" *ngFor="let c of consultations" [routerLink]="['/consultations', c._id]">
          <div class="consult-header">
            <span class="subject">{{ c.subject }}</span>
            <span class="badge status-{{c.status}}">{{ statusLabel(c.status) }}</span>
          </div>
          <div class="consult-meta">
            <span>العميل: {{ c.client?.name }}</span>
            <span *ngIf="c.assignedLawyer">• المحامي: {{ c.assignedLawyer?.name }}</span>
            <span>• {{ c.createdAt | date:'dd/MM/yyyy' }}</span>
          </div>
          <p class="consult-desc">{{ c.description | slice:0:120 }}{{ c.description?.length > 120 ? '...' : '' }}</p>
        </div>
        <div class="empty" *ngIf="consultations.length === 0">لا توجد استشارات</div>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; } }
    .btn-primary { padding: 10px 20px; background: #1a2744; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; h3 { font-size: 15px; font-weight: 600; color: #1a2744; margin: 0 0 14px; } }
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; &.full { grid-column: 1 / -1; } label { font-size: 13px; font-weight: 500; color: #4a5568; } }
    input, select, textarea { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; resize: vertical; }
    .error-msg { background: #fff5f5; color: #c53030; padding: 8px; border-radius: 8px; font-size: 13px; margin-top: 8px; }
    .form-actions { display: flex; gap: 10px; margin-top: 14px; }
    .btn-cancel { padding: 10px 20px; border: 1px solid #e2e8f0; color: #4a5568; border-radius: 8px; cursor: pointer; background: #fff; font-size: 14px; }
    .filters { margin-bottom: 16px; select { padding: 9px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; } }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .list { display: flex; flex-direction: column; gap: 10px; }
    .consult-card { background: #fff; border-radius: 12px; padding: 16px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); cursor: pointer; transition: box-shadow 0.2s; &:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.1); } }
    .consult-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; .subject { font-size: 15px; font-weight: 600; color: #2d3748; } }
    .consult-meta { font-size: 13px; color: #718096; display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .consult-desc { font-size: 14px; color: #4a5568; margin: 0; }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-pending { background: #fffaf0; color: #c05621; }
    .status-in_progress { background: #ebf8ff; color: #2b6cb0; }
    .status-answered { background: #f0fff4; color: #276749; }
    .status-closed { background: #edf2f7; color: #4a5568; }
    .empty { text-align: center; padding: 40px; color: #718096; }
  `]
})
export class ConsultationListComponent implements OnInit {
  consultations: any[] = [];
  loading = false; statusFilter = '';
  showForm = false; saving = false; formError = '';
  form = { subject: '', description: '' };

  constructor(private svc: ConsultationsService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    this.svc.getAll(params).subscribe({
      next: res => { this.consultations = (res as any).data || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  addConsultation() {
    if (!this.form.subject || !this.form.description) { this.formError = 'يرجى تعبئة جميع الحقول'; return; }
    this.saving = true; this.formError = '';
    this.svc.create(this.form as any).subscribe({
      next: () => { this.saving = false; this.showForm = false; this.form = { subject: '', description: '' }; this.load(); },
      error: err => { this.formError = err?.error?.message || 'خطأ'; this.saving = false; }
    });
  }

  statusLabel(s: string) {
    const m: any = { pending: 'معلقة', in_progress: 'قيد المعالجة', answered: 'تمت الإجابة', closed: 'مغلقة' };
    return m[s] || s;
  }
}
