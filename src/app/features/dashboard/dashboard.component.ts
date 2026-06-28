import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CasesService } from '../../core/services/cases.service';
import { TasksService, DeadlinesService } from '../../core/services/index';
import { AuthService } from '../../core/services/auth.service';
import { extractList, extractTotal } from '../../core/services/api-helper';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>مرحباً، {{ userName }} 👋</h1>
        <p>{{ today }}</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card blue"><div class="stat-icon">📁</div><div class="stat-info"><div class="stat-number">{{ stats.activeCases }}</div><div class="stat-label">قضايا نشطة</div></div></div>
        <div class="stat-card green"><div class="stat-icon">📅</div><div class="stat-info"><div class="stat-number">{{ stats.upcomingSessions }}</div><div class="stat-label">جلسات قادمة</div></div></div>
        <div class="stat-card orange"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-number">{{ stats.pendingTasks }}</div><div class="stat-label">مهام معلقة</div></div></div>
        <div class="stat-card red"><div class="stat-icon">⏰</div><div class="stat-info"><div class="stat-number">{{ stats.missedDeadlines }}</div><div class="stat-label">مواعيد فائتة</div></div></div>
      </div>
      <div class="section">
        <h2>إجراءات سريعة</h2>
        <div class="quick-actions">
          <a routerLink="/cases/new" class="action-btn">➕ قضية جديدة</a>
          <a routerLink="/sessions/new" class="action-btn">📅 جلسة جديدة</a>
          <a routerLink="/consultations" class="action-btn">💬 الاستشارات</a>
          <a routerLink="/deadlines" class="action-btn">⏰ المواعيد القانونية</a>
          <a routerLink="/reports" class="action-btn">📊 التقارير</a>
          <a routerLink="/search" class="action-btn">🔍 بحث شامل</a>
        </div>
      </div>
      <div class="section">
        <div class="section-header"><h2>أحدث القضايا</h2><a routerLink="/cases">عرض الكل</a></div>
        <div class="loading" *ngIf="loadingCases">جاري التحميل...</div>
        <div class="table-wrap" *ngIf="!loadingCases">
          <table>
            <thead><tr><th>رقم القضية</th><th>العنوان</th><th>العميل</th><th>الحالة</th><th>التاريخ</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of recentCases" [routerLink]="['/cases', c._id]" style="cursor:pointer">
                <td>{{ c.caseNumber }}</td>
                <td>{{ c.title }}</td>
                <td>{{ getName(c.client) }}</td>
                <td><span class="badge status-{{ c.status }}">{{ statusLabel(c.status) }}</span></td>
                <td>{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
              </tr>
              <tr *ngIf="recentCases.length === 0"><td colspan="5" style="text-align:center;color:#718096;padding:30px">لا توجد قضايا</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { margin-bottom: 24px; h1 { font-size: 22px; font-weight: 700; color: #1a2744; margin: 0 0 4px; } p { color: #718096; font-size: 14px; margin: 0; } }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; border-radius: 12px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); .stat-icon { font-size: 32px; } .stat-number { font-size: 28px; font-weight: 700; } .stat-label { font-size: 13px; color: #718096; margin-top: 2px; } &.blue { border-right: 4px solid #3182ce; .stat-number { color: #3182ce; } } &.green { border-right: 4px solid #38a169; .stat-number { color: #38a169; } } &.orange { border-right: 4px solid #dd6b20; .stat-number { color: #dd6b20; } } &.red { border-right: 4px solid #e53e3e; .stat-number { color: #e53e3e; } } }
    .section { margin-bottom: 28px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; h2 { font-size: 16px; font-weight: 600; color: #2d3748; margin: 0; } a { font-size: 13px; color: #3182ce; text-decoration: none; } }
    h2 { font-size: 16px; font-weight: 600; color: #2d3748; margin: 0 0 12px; }
    .quick-actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .action-btn { padding: 10px 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #2d3748; font-size: 14px; font-weight: 500; transition: all 0.2s; &:hover { background: #1a2744; color: #fff; border-color: #1a2744; } }
    .table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; th { background: #f7fafc; padding: 12px 16px; text-align: right; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 1px solid #e2e8f0; } td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f7fafc; } tr:hover td { background: #f7fafc; } }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-draft { background: #edf2f7; color: #4a5568; } .status-under_review { background: #ebf8ff; color: #2b6cb0; } .status-active { background: #f0fff4; color: #276749; } .status-court_session { background: #fffaf0; color: #c05621; } .status-judgment_issued { background: #faf5ff; color: #6b46c1; } .status-closed { background: #f7fafc; color: #718096; }
    .loading { text-align: center; padding: 40px; color: #718096; }
  `]
})
export class DashboardComponent implements OnInit {
  recentCases: any[] = [];
  loadingCases = true;
  stats = { activeCases: 0, upcomingSessions: 0, pendingTasks: 0, missedDeadlines: 0 };

  constructor(private casesService: CasesService, private tasksService: TasksService, private deadlinesService: DeadlinesService, private auth: AuthService) {}

  get userName() { return this.auth.getUserName().split(' ')[0] || 'المستخدم'; }
  get today() { return new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }

  getName(u: any) { return u?.name || `${u?.firstName||''} ${u?.lastName||''}`.trim() || '-'; }
  statusLabel(s: string) {
    const m: any = { draft:'مسودة', under_review:'قيد المراجعة', active:'نشطة', court_session:'جلسة', judgment_issued:'صدر حكم', closed:'مغلقة' };
    return m[s] || s;
  }

  ngOnInit() {
    this.casesService.getAll(1, 5).subscribe({
      next: res => {
        this.recentCases = extractList(res);
        this.stats.activeCases = extractTotal(res) || this.recentCases.length;
        this.loadingCases = false;
      },
      error: () => { this.loadingCases = false; }
    });
    this.tasksService.getAll({ status: 'pending' }).subscribe({
      next: res => { this.stats.pendingTasks = extractTotal(res) || extractList(res).length; },
      error: () => {}
    });
    this.deadlinesService.getAll({ status: 'missed' }).subscribe({
      next: res => { this.stats.missedDeadlines = extractTotal(res) || extractList(res).length; },
      error: () => {}
    });
  }
}
