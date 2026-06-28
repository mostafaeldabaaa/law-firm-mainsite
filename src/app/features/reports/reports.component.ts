// ─── Reports ─────────────────────────────────────────────────────────────────
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../core/services/index';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header"><h1>📊 التقارير</h1></div>

      <div class="grid-2">
        <!-- Case Status -->
        <div class="card">
          <h2>توزيع القضايا حسب الحالة</h2>
          <div class="loading" *ngIf="loadingStatus">جاري التحميل...</div>
          <div class="bar-chart" *ngIf="!loadingStatus">
            <div class="bar-item" *ngFor="let item of caseStatus">
              <div class="bar-label">{{ statusLabel(item.status) }}</div>
              <div class="bar-wrap">
                <div class="bar" [style.width]="barWidth(item.count) + '%'" [class]="'bar-' + item.status"></div>
              </div>
              <div class="bar-count">{{ item.count }}</div>
            </div>
            <div class="empty" *ngIf="caseStatus.length === 0">لا توجد بيانات</div>
          </div>
        </div>

        <!-- Revenue -->
        <div class="card">
          <h2>الإيرادات الشهرية</h2>
          <div class="loading" *ngIf="loadingRevenue">جاري التحميل...</div>
          <div class="revenue-list" *ngIf="!loadingRevenue">
            <div class="rev-item" *ngFor="let r of revenue">
              <span class="month">{{ r.month }}</span>
              <div class="rev-bar-wrap">
                <div class="rev-bar" [style.width]="revenueWidth(r.total) + '%'"></div>
              </div>
              <span class="amount">{{ r.total | number }} ج.م</span>
            </div>
            <div class="empty" *ngIf="revenue.length === 0">لا توجد بيانات</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; } }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 700px) { .grid-2 { grid-template-columns: 1fr; } }
    .card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); h2 { font-size: 15px; font-weight: 600; color: #2d3748; margin: 0 0 16px; } }
    .loading { text-align: center; padding: 20px; color: #718096; font-size: 14px; }
    .empty { text-align: center; padding: 20px; color: #a0aec0; }
    .bar-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; .bar-label { width: 90px; font-size: 13px; color: #4a5568; flex-shrink: 0; } .bar-wrap { flex: 1; background: #f7fafc; border-radius: 4px; height: 20px; overflow: hidden; } .bar { height: 100%; border-radius: 4px; transition: width 0.4s; } .bar-count { width: 30px; text-align: left; font-size: 13px; font-weight: 600; color: #2d3748; } }
    .bar-draft { background: #a0aec0; }
    .bar-under_review { background: #63b3ed; }
    .bar-active { background: #68d391; }
    .bar-court_session { background: #f6ad55; }
    .bar-judgment_issued { background: #b794f4; }
    .bar-closed { background: #e2e8f0; }
    .rev-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; .month { width: 60px; font-size: 13px; color: #4a5568; } .rev-bar-wrap { flex: 1; background: #f7fafc; border-radius: 4px; height: 20px; overflow: hidden; } .rev-bar { height: 100%; background: #63b3ed; border-radius: 4px; } .amount { font-size: 13px; font-weight: 600; color: #2d3748; white-space: nowrap; } }
  `]
})
export class ReportsComponent implements OnInit {
  caseStatus: any[] = []; revenue: any[] = [];
  loadingStatus = true; loadingRevenue = true;

  constructor(private svc: ReportsService) {}

  ngOnInit() {
    this.svc.getCaseStatus().subscribe({
      next: res => { this.caseStatus = (res as any).data || []; this.loadingStatus = false; },
      error: () => { this.loadingStatus = false; }
    });
    this.svc.getRevenue().subscribe({
      next: res => { this.revenue = (res as any).data || []; this.loadingRevenue = false; },
      error: () => { this.loadingRevenue = false; }
    });
  }

  maxCount() { return Math.max(...this.caseStatus.map(i => i.count), 1); }
  barWidth(count: number) { return Math.round((count / this.maxCount()) * 100); }
  maxRevenue() { return Math.max(...this.revenue.map(r => r.total), 1); }
  revenueWidth(total: number) { return Math.round((total / this.maxRevenue()) * 100); }

  statusLabel(s: string) {
    const m: any = { draft: 'مسودة', under_review: 'قيد المراجعة', active: 'نشطة', court_session: 'جلسة', judgment_issued: 'صدر حكم', closed: 'مغلقة' };
    return m[s] || s;
  }
}
