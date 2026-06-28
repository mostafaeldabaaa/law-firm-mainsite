import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeadlinesService, UsersService } from '../../../core/services/index';
import { CasesService } from '../../../core/services/cases.service';

@Component({
  selector: 'app-deadline-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header">
        <h1>⏰ المواعيد القانونية</h1>
        <button class="btn-primary" (click)="showForm = !showForm">➕ موعد جديد</button>
      </div>

      <!-- Add Form -->
      <div class="card" *ngIf="showForm">
        <h3>إضافة موعد قانوني</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>القضية *</label>
            <select [(ngModel)]="form.case">
              <option value="">اختر القضية</option>
              <option *ngFor="let c of cases" [value]="c._id">{{ c.caseNumber }} - {{ c.title }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>نوع الموعد *</label>
            <select [(ngModel)]="form.type">
              <option value="appeal">استئناف</option>
              <option value="cassation">نقض</option>
              <option value="objection">اعتراض</option>
              <option value="response">رد</option>
              <option value="statute_of_limitations">تقادم</option>
              <option value="execution">تنفيذ</option>
            </select>
          </div>
          <div class="form-group">
            <label>تاريخ الاستحقاق *</label>
            <input type="date" [(ngModel)]="form.dueDate" />
          </div>
          <div class="form-group">
            <label>المحامي المسؤول *</label>
            <select [(ngModel)]="form.responsibleLawyer">
              <option value="">اختر المحامي</option>
              <option *ngFor="let l of lawyers" [value]="l._id">{{ l.name }}</option>
            </select>
          </div>
          <div class="form-group full">
            <label>ملاحظات</label>
            <textarea [(ngModel)]="form.notes" rows="2"></textarea>
          </div>
        </div>
        <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        <div class="form-actions">
          <button class="btn-primary" (click)="addDeadline()" [disabled]="saving">{{ saving ? 'جاري الحفظ...' : 'حفظ' }}</button>
          <button class="btn-cancel" (click)="showForm = false">إلغاء</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()">
          <option value="">كل الحالات</option>
          <option value="pending">معلقة</option>
          <option value="completed">مكتملة</option>
          <option value="missed">فائتة</option>
          <option value="cancelled">ملغاة</option>
        </select>
      </div>

      <div class="loading" *ngIf="loading">جاري التحميل...</div>
      <div class="table-wrap" *ngIf="!loading">
        <table>
          <thead><tr><th>النوع</th><th>القضية</th><th>المحامي</th><th>تاريخ الاستحقاق</th><th>الحالة</th><th>تحديث</th></tr></thead>
          <tbody>
            <tr *ngFor="let d of deadlines" [class.overdue]="isPast(d.dueDate) && d.status === 'pending'">
              <td>{{ typeLabel(d.type) }}</td>
              <td><a [routerLink]="['/cases', d.case?._id]" class="link">{{ d.case?.caseNumber }}</a></td>
              <td>{{ d.responsibleLawyer?.name }}</td>
              <td [class.red]="isPast(d.dueDate)">{{ d.dueDate | date:'dd/MM/yyyy' }}</td>
              <td><span class="badge status-{{d.status}}">{{ statusLabel(d.status) }}</span></td>
              <td>
                <select [(ngModel)]="d.status" (ngModelChange)="updateStatus(d)" class="status-select">
                  <option value="pending">معلقة</option>
                  <option value="completed">مكتملة</option>
                  <option value="cancelled">ملغاة</option>
                </select>
              </td>
            </tr>
            <tr *ngIf="deadlines.length === 0"><td colspan="6" class="empty">لا توجد مواعيد</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; } }
    .btn-primary { padding: 10px 20px; background: #1a2744; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; h3 { font-size: 15px; font-weight: 600; color: #1a2744; margin: 0 0 14px; } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; &.full { grid-column: 1 / -1; } label { font-size: 13px; font-weight: 500; color: #4a5568; } }
    input, select, textarea { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; }
    .error-msg { background: #fff5f5; color: #c53030; padding: 8px; border-radius: 8px; font-size: 13px; margin-top: 8px; }
    .form-actions { display: flex; gap: 10px; margin-top: 14px; }
    .btn-cancel { padding: 10px 20px; border: 1px solid #e2e8f0; color: #4a5568; border-radius: 8px; cursor: pointer; background: #fff; font-size: 14px; }
    .filters { margin-bottom: 16px; select { padding: 9px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; } }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: auto; }
    table { width: 100%; border-collapse: collapse; th { background: #f7fafc; padding: 12px 16px; text-align: right; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 1px solid #e2e8f0; } td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f7fafc; } tr.overdue { background: #fff5f5; } .red { color: #e53e3e; font-weight: 500; } }
    .link { color: #2b6cb0; text-decoration: none; }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-pending { background: #fffaf0; color: #c05621; }
    .status-completed { background: #f0fff4; color: #276749; }
    .status-missed { background: #fff5f5; color: #c53030; }
    .status-cancelled { background: #edf2f7; color: #4a5568; }
    .status-select { padding: 5px 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; }
    .empty { text-align: center; padding: 40px; color: #718096; }
  `]
})
export class DeadlineListComponent implements OnInit {
  deadlines: any[] = []; cases: any[] = []; lawyers: any[] = [];
  loading = false; statusFilter = '';
  showForm = false; saving = false; formError = '';
  form = { case: '', type: 'appeal', dueDate: '', responsibleLawyer: '', notes: '' };

  constructor(private svc: DeadlinesService, private casesSvc: CasesService, private usersSvc: UsersService) {}

  ngOnInit() {
    this.casesSvc.getAll(1, 100).subscribe({ next: res => { const d = (res as any).data; this.cases = d?.data || d || []; } });
    this.usersSvc.getLawyers().subscribe({ next: res => { this.lawyers = (res as any).data || []; } });
    this.load();
  }

  load() {
    this.loading = true;
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    this.svc.getAll(params).subscribe({
      next: res => { this.deadlines = (res as any).data || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  addDeadline() {
    if (!this.form.case || !this.form.dueDate || !this.form.responsibleLawyer) { this.formError = 'يرجى تعبئة الحقول المطلوبة'; return; }
    this.saving = true; this.formError = '';
    this.svc.create(this.form as any).subscribe({
      next: () => { this.saving = false; this.showForm = false; this.form = { case: '', type: 'appeal', dueDate: '', responsibleLawyer: '', notes: '' }; this.load(); },
      error: err => { this.formError = err?.error?.message || 'خطأ'; this.saving = false; }
    });
  }

  updateStatus(d: any) { this.svc.updateStatus(d._id, d.status).subscribe({ error: () => {} }); }
  isPast(date: string) { return new Date(date) < new Date(); }

  typeLabel(t: string) {
    const m: any = { appeal: 'استئناف', cassation: 'نقض', objection: 'اعتراض', response: 'رد', statute_of_limitations: 'تقادم', execution: 'تنفيذ' };
    return m[t] || t;
  }
  statusLabel(s: string) {
    const m: any = { pending: 'معلقة', completed: 'مكتملة', missed: 'فائتة', cancelled: 'ملغاة' };
    return m[s] || s;
  }
}
