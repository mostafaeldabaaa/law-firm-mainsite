import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionsService } from '../../../core/services/index';
import { extractList } from '../../../core/services/api-helper';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header">
        <h1>📅 الجلسات</h1>
        <a routerLink="/sessions/new" class="btn-primary">➕ جلسة جديدة</a>
      </div>
      <div class="filters">
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()">
          <option value="">كل الحالات</option>
          <option value="scheduled">مجدولة</option>
          <option value="completed">مكتملة</option>
          <option value="cancelled">ملغاة</option>
          <option value="rescheduled">معاد جدولتها</option>
        </select>
      </div>
      <div class="loading" *ngIf="loading">جاري التحميل...</div>
      <div class="empty-state" *ngIf="!loading && sessions.length === 0"><div class="empty-icon">📅</div><p>لا توجد جلسات</p></div>
      <div class="table-wrap" *ngIf="!loading && sessions.length > 0">
        <table>
          <thead><tr><th>القضية</th><th>المحامي</th><th>التاريخ</th><th>الوقت</th><th>المكان</th><th>الحالة</th></tr></thead>
          <tbody>
            <tr *ngFor="let s of sessions">
              <td><a [routerLink]="['/cases', s.case?._id]" class="link">{{ s.case?.caseNumber || '-' }}</a></td>
              <td>{{ getName(s.lawyer) }}</td>
              <td>{{ s.date | date:'dd/MM/yyyy' }}</td>
              <td>{{ s.startTime }} - {{ s.endTime }}</td>
              <td>{{ s.location || '-' }}</td>
              <td><span class="badge status-{{s.status}}">{{ statusLabel(s.status) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; } }
    .btn-primary { padding: 10px 20px; background: #1a2744; color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .filters { margin-bottom: 16px; select { padding: 9px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; } }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .empty-state { text-align: center; padding: 60px; color: #a0aec0; .empty-icon { font-size: 48px; margin-bottom: 12px; } }
    .table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: auto; }
    table { width: 100%; border-collapse: collapse; th { background: #f7fafc; padding: 12px 16px; text-align: right; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 1px solid #e2e8f0; } td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f7fafc; } }
    .link { color: #2b6cb0; text-decoration: none; }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-scheduled { background: #ebf8ff; color: #2b6cb0; } .status-completed { background: #f0fff4; color: #276749; } .status-cancelled { background: #fff5f5; color: #c53030; } .status-rescheduled { background: #fffaf0; color: #c05621; }
  `]
})
export class SessionListComponent implements OnInit {
  sessions: any[] = []; loading = false; statusFilter = '';
  constructor(private svc: SessionsService) {}
  ngOnInit() { this.load(); }
  load() {
    this.loading = true;
    const params = this.statusFilter ? { status: this.statusFilter } : {};
    this.svc.getAll(params).subscribe({
      next: res => { this.sessions = extractList(res); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
  getName(u: any) { return u?.name || `${u?.firstName||''} ${u?.lastName||''}`.trim() || '-'; }
  statusLabel(s: string) {
    const m: any = { scheduled:'مجدولة', completed:'مكتملة', cancelled:'ملغاة', rescheduled:'معاد جدولتها' };
    return m[s] || s;
  }
}
