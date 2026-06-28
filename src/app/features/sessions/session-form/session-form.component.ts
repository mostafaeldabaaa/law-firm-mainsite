import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SessionsService, UsersService } from '../../../core/services/index';
import { CasesService } from '../../../core/services/cases.service';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page" dir="rtl">
      <div class="back"><a routerLink="/sessions">← العودة</a></div>
      <div class="card">
        <h1>إضافة جلسة جديدة</h1>
        <div class="error-msg" *ngIf="error">{{ error }}</div>
        <div class="form-grid">
          <div class="form-group">
            <label>القضية *</label>
            <select [(ngModel)]="form.caseId">
              <option value="">اختر القضية</option>
              <option *ngFor="let c of cases" [value]="c._id">{{ c.caseNumber }} - {{ c.title }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>المحامي *</label>
            <select [(ngModel)]="form.lawyerId">
              <option value="">اختر المحامي</option>
              <option *ngFor="let l of lawyers" [value]="l._id">{{ l.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>التاريخ *</label>
            <input type="date" [(ngModel)]="form.date" />
          </div>
          <div class="form-group">
            <label>وقت البداية *</label>
            <input type="time" [(ngModel)]="form.startTime" />
          </div>
          <div class="form-group">
            <label>وقت النهاية *</label>
            <input type="time" [(ngModel)]="form.endTime" />
          </div>
          <div class="form-group">
            <label>المكان</label>
            <input type="text" [(ngModel)]="form.location" placeholder="المحكمة / القاعة" />
          </div>
          <div class="form-group full">
            <label>ملاحظات</label>
            <textarea [(ngModel)]="form.notes" rows="3" placeholder="أي ملاحظات إضافية..."></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn-primary" (click)="submit()" [disabled]="loading">{{ loading ? 'جاري الحفظ...' : 'حفظ الجلسة' }}</button>
          <a routerLink="/sessions" class="btn-cancel">إلغاء</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .back a { color: #3182ce; text-decoration: none; font-size: 14px; display: inline-block; margin-bottom: 16px; }
    .card { background: #fff; border-radius: 12px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0 0 20px; }
    .error-msg { background: #fff5f5; color: #c53030; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; &.full { grid-column: 1 / -1; } label { font-size: 13px; font-weight: 500; color: #4a5568; } }
    input, select, textarea { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; &:focus { border-color: #2d4a8a; } }
    .form-actions { display: flex; gap: 12px; margin-top: 20px; }
    .btn-primary { padding: 11px 24px; background: #1a2744; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; &:disabled { opacity: 0.7; } }
    .btn-cancel { padding: 11px 24px; border: 1px solid #e2e8f0; color: #4a5568; border-radius: 8px; text-decoration: none; font-size: 14px; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class SessionFormComponent implements OnInit {
  form = { caseId: '', lawyerId: '', date: '', startTime: '', endTime: '', location: '', notes: '' };
  cases: any[] = []; lawyers: any[] = [];
  loading = false; error = '';

  constructor(private svc: SessionsService, private usersSvc: UsersService, private casesSvc: CasesService, private router: Router) {}

  ngOnInit() {
    this.casesSvc.getAll(1, 100, 'active').subscribe({ next: (res: any) => { const d = (res as any).data; this.cases = d?.data || d || []; } });
    this.usersSvc.getLawyers().subscribe({ next: res => { this.lawyers = (res as any).data || []; } });
  }

  submit() {
    if (!this.form.caseId || !this.form.lawyerId || !this.form.date || !this.form.startTime || !this.form.endTime) {
      this.error = 'يرجى تعبئة الحقول المطلوبة'; return;
    }
    this.loading = true; this.error = '';
    this.svc.create(this.form).subscribe({
      next: () => this.router.navigate(['/sessions']),
      error: err => { this.error = err?.error?.message || 'خطأ في الحفظ'; this.loading = false; }
    });
  }
}
