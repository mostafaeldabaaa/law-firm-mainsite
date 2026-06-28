import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogsService } from '../../core/services/index';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header"><h1>🔍 سجل التدقيق</h1></div>
      <div class="filters">
        <select [(ngModel)]="outcomeFilter" (ngModelChange)="load()">
          <option value="">كل النتائج</option>
          <option value="success">ناجح</option>
          <option value="failure">فاشل</option>
        </select>
      </div>
      <div class="loading" *ngIf="loading">جاري التحميل...</div>
      <div class="table-wrap" *ngIf="!loading">
        <table>
          <thead><tr><th>المستخدم</th><th>الإجراء</th><th>المورد</th><th>النتيجة</th><th>IP</th><th>التاريخ</th></tr></thead>
          <tbody>
            <tr *ngFor="let l of logs">
              <td>{{ l.user?.name }}</td>
              <td><code>{{ l.action }}</code></td>
              <td>{{ l.resource }}<span *ngIf="l.resourceId" class="id"> #{{ l.resourceId?.slice(-6) }}</span></td>
              <td><span class="badge" [class]="l.outcome === 'success' ? 'success' : 'fail'">{{ l.outcome === 'success' ? '✅ نجح' : '❌ فشل' }}</span></td>
              <td><code>{{ l.ip }}</code></td>
              <td>{{ l.createdAt | date:'dd/MM HH:mm' }}</td>
            </tr>
            <tr *ngIf="logs.length === 0"><td colspan="6" class="empty">لا توجد سجلات</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; } }
    .filters { margin-bottom: 16px; select { padding: 9px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; } }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 700px; th { background: #f7fafc; padding: 12px 16px; text-align: right; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 1px solid #e2e8f0; } td { padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #f7fafc; } tr:last-child td { border-bottom: none; } }
    code { background: #f7fafc; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #2d3748; }
    .id { color: #718096; }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; &.success { background: #f0fff4; color: #276749; } &.fail { background: #fff5f5; color: #c53030; } }
    .empty { text-align: center; padding: 40px; color: #718096; }
  `]
})
export class AuditLogsComponent implements OnInit {
  logs: any[] = []; loading = false; outcomeFilter = '';

  constructor(private svc: AuditLogsService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const params: any = {};
    if (this.outcomeFilter) params.outcome = this.outcomeFilter;
    this.svc.getAll(params).subscribe({
      next: res => { this.logs = (res as any).data || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
