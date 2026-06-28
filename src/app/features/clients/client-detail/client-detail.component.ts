import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { UsersService } from '../../../core/services/index';
import { CasesService } from '../../../core/services/cases.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page" dir="rtl">
      <div class="back"><a routerLink="/clients">← العودة للعملاء</a></div>
      <div *ngIf="loading" class="loading">جاري التحميل...</div>
      <div *ngIf="!loading && client">
        <div class="profile-header">
          <div class="avatar">{{ client.name?.charAt(0) }}</div>
          <div class="info">
            <h1>{{ client.name }}</h1>
            <p>{{ client.email }}</p>
            <p *ngIf="client.phone">📞 {{ client.phone }}</p>
          </div>
          <span class="badge" [class.active]="client.isActive">{{ client.isActive ? 'نشط' : 'غير نشط' }}</span>
        </div>

        <div class="section">
          <div class="section-header"><h2>قضايا العميل</h2></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>رقم القضية</th><th>العنوان</th><th>الحالة</th><th>التاريخ</th></tr></thead>
              <tbody>
                <tr *ngFor="let c of cases" [routerLink]="['/cases', c._id]" style="cursor:pointer">
                  <td>{{ c.caseNumber }}</td>
                  <td>{{ c.title }}</td>
                  <td><span class="cbadge status-{{c.status}}">{{ statusLabel(c.status) }}</span></td>
                  <td>{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
                </tr>
                <tr *ngIf="cases.length === 0"><td colspan="4" class="empty">لا توجد قضايا</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .back a { color: #3182ce; text-decoration: none; font-size: 14px; display: inline-block; margin-bottom: 16px; }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .profile-header { display: flex; align-items: center; gap: 16px; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 20px; }
    .avatar { width: 64px; height: 64px; border-radius: 50%; background: #1a2744; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; flex-shrink: 0; }
    .info { flex: 1; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0 0 4px; } p { color: #718096; font-size: 14px; margin: 2px 0; } }
    .badge { padding: 5px 14px; border-radius: 12px; font-size: 13px; font-weight: 500; &.active { background: #f0fff4; color: #276749; } }
    .section-header { display: flex; justify-content: space-between; margin-bottom: 12px; h2 { font-size: 16px; font-weight: 600; color: #2d3748; margin: 0; } }
    .table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: auto; }
    table { width: 100%; border-collapse: collapse; th { background: #f7fafc; padding: 12px 16px; text-align: right; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 1px solid #e2e8f0; } td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f7fafc; } tr:last-child td { border-bottom: none; } tr:hover td { background: #f7fafc; } }
    .cbadge { padding: 3px 10px; border-radius: 12px; font-size: 12px; }
    .status-active { background: #f0fff4; color: #276749; }
    .status-closed { background: #f7fafc; color: #718096; }
    .status-draft { background: #edf2f7; color: #4a5568; }
    .status-under_review { background: #ebf8ff; color: #2b6cb0; }
    .status-court_session { background: #fffaf0; color: #c05621; }
    .status-judgment_issued { background: #faf5ff; color: #6b46c1; }
    .empty { text-align: center; padding: 30px; color: #718096; }
  `]
})
export class ClientDetailComponent implements OnInit {
  client: any = null; cases: any[] = []; loading = true;

  constructor(private route: ActivatedRoute, private usersSvc: UsersService, private casesSvc: CasesService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.usersSvc.getById(id).subscribe({
      next: res => { this.client = (res as any).data || res; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.casesSvc.getAll(1, 50).subscribe({
      next: res => {
        const d = (res as any).data;
        const all = d?.data || d || [];
        this.cases = all.filter((c: any) => c.client?._id === id || c.client === id);
      }
    });
  }

  statusLabel(s: string) {
    const m: any = { draft: 'مسودة', under_review: 'قيد المراجعة', active: 'نشطة', court_session: 'جلسة', judgment_issued: 'صدر حكم', closed: 'مغلقة' };
    return m[s] || s;
  }
}
