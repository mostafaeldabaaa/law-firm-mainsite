import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../core/services/index';

@Component({
  selector: 'app-lawyer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page" dir="rtl">
      <div class="back"><a routerLink="/lawyers">← العودة للمحامين</a></div>
      <div *ngIf="loading" class="loading">جاري التحميل...</div>
      <div *ngIf="!loading && lawyer">
        <div class="profile-header">
          <div class="avatar">{{ lawyer.name?.charAt(0) }}</div>
          <div class="info">
            <h1>{{ lawyer.name }}</h1>
            <p class="role">{{ roleLabel(lawyer.role) }}</p>
            <p>{{ lawyer.email }}</p>
            <p *ngIf="lawyer.phone">📞 {{ lawyer.phone }}</p>
          </div>
          <span class="badge active">{{ lawyer.isActive ? 'نشط' : 'غير نشط' }}</span>
        </div>

        <div class="stats-grid" *ngIf="perf">
          <div class="stat-card"><div class="num">{{ perf.cases }}</div><div class="lbl">إجمالي القضايا</div></div>
          <div class="stat-card"><div class="num blue">{{ perf.activeCases }}</div><div class="lbl">قضايا نشطة</div></div>
          <div class="stat-card"><div class="num green">{{ perf.completedCases }}</div><div class="lbl">قضايا مغلقة</div></div>
          <div class="stat-card"><div class="num orange">{{ perf.successRate }}%</div><div class="lbl">نسبة النجاح</div></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      direction: rtl;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .back a { color: #3182ce; text-decoration: none; font-size: 14px; display: inline-block; margin-bottom: 16px; }
    .loading { text-align: center; padding: 60px 20px; color: #718096; }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      margin-bottom: 20px;
      box-sizing: border-box;
    }
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #2d4a8a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .info {
      flex: 1;
      min-width: 0;
      h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0 0 4px; word-break: break-word; }
      p { color: #718096; font-size: 14px; margin: 2px 0; word-break: break-word; }
      .role { color: #3182ce !important; font-weight: 500; }
    }
    .badge {
      padding: 5px 14px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;
      &.active { background: #f0fff4; color: #276749; }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      text-align: center;
      box-sizing: border-box;
      .num {
        font-size: 30px;
        font-weight: 700;
        color: #1a2744;
        &.blue { color: #3182ce; }
        &.green { color: #38a169; }
        &.orange { color: #dd6b20; }
      }
      .lbl { font-size: 13px; color: #718096; margin-top: 4px; }
    }

    /* ===== Tablet ===== */
    @media (max-width: 900px) {
      .page { padding: 20px; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    /* ===== Mobile ===== */
    @media (max-width: 640px) {
      .page { padding: 14px; }

      .profile-header {
        flex-direction: column;
        align-items: flex-start;
        text-align: right;
        padding: 20px;
      }
      .badge {
        align-self: flex-start;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .stat-card {
        padding: 16px;
        .num { font-size: 24px; }
      }
    }

    @media (max-width: 380px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LawyerDetailComponent implements OnInit {
  lawyer: any = null; perf: any = null; loading = true;

  constructor(private route: ActivatedRoute, private svc: UsersService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getById(id).subscribe({
      next: res => { this.lawyer = (res as any).data || res; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.svc.getPerformance(id).subscribe({ next: res => { this.perf = (res as any).data || res; }, error: () => {} });
  }

  roleLabel(r: string) {
    const m: any = { lawyer: 'محامي', senior_lawyer: 'محامي أول', branch_manager: 'مدير فرع', super_admin: 'مدير عام', secretary: 'سكرتير' };
    return m[r] || r;
  }
}