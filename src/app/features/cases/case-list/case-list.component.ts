import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CasesService } from '../../../core/services/cases.service';
import { extractList, extractTotal } from '../../../core/services/api-helper';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header">
        <h1>📁 القضايا</h1>
        <a routerLink="/cases/new" class="btn-primary">➕ قضية جديدة</a>
      </div>
      <div class="filters">
        <input type="search" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="بحث بالعنوان أو رقم القضية..." />
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()">
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="under_review">قيد المراجعة</option>
          <option value="active">نشطة</option>
          <option value="court_session">جلسة</option>
          <option value="judgment_issued">صدر حكم</option>
          <option value="closed">مغلقة</option>
        </select>
      </div>
      <div class="loading" *ngIf="loading">جاري التحميل...</div>
      <div class="empty-state" *ngIf="!loading && cases.length === 0">
        <div class="empty-icon">📁</div>
        <p>لا توجد قضايا</p>
      </div>
      <div class="table-wrap" *ngIf="!loading && cases.length > 0">
        <table>
          <thead>
            <tr><th>رقم القضية</th><th>العنوان</th><th>العميل</th><th>المحامي المسؤول</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of cases">
              <td>{{ c.caseNumber }}</td>
              <td><a [routerLink]="['/cases', c._id]" class="link">{{ c.title }}</a></td>
              <td>{{ clientName(c.client) }}</td>
              <td>{{ lawyerName(c.leadLawyer) }}</td>
              <td><span class="badge status-{{c.status}}">{{ statusLabel(c.status) }}</span></td>
              <td>{{ c.createdAt | date:'dd/MM/yyyy' }}</td>
              <td>
                <a [routerLink]="['/cases', c._id]" class="icon-link" title="تفاصيل">👁</a>
                <a [routerLink]="['/cases', c._id, 'edit']" class="icon-link" title="تعديل">✏️</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination" *ngIf="total > pageSize">
        <button (click)="prevPage()" [disabled]="page === 1">السابق</button>
        <span>صفحة {{ page }} من {{ totalPages }}</span>
        <button (click)="nextPage()" [disabled]="page >= totalPages">التالي</button>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; } }
    .btn-primary { padding: 10px 20px; background: #1a2744; color: #fff; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; input { flex: 1; padding: 9px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; } select { padding: 9px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; } }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .empty-state { text-align: center; padding: 60px; color: #a0aec0; .empty-icon { font-size: 48px; margin-bottom: 12px; } p { font-size: 16px; } }
    .table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 700px; th { background: #f7fafc; padding: 12px 16px; text-align: right; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 1px solid #e2e8f0; } td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f7fafc; } tr:hover td { background: #f7fafc; } }
    .link { color: #2b6cb0; text-decoration: none; &:hover { text-decoration: underline; } }
    .icon-link { font-size: 16px; margin-left: 8px; cursor: pointer; text-decoration: none; }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-draft { background: #edf2f7; color: #4a5568; } .status-under_review { background: #ebf8ff; color: #2b6cb0; } .status-active { background: #f0fff4; color: #276749; } .status-court_session { background: #fffaf0; color: #c05621; } .status-judgment_issued { background: #faf5ff; color: #6b46c1; } .status-closed { background: #f7fafc; color: #718096; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 16px; button { padding: 8px 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; &:disabled { opacity: 0.5; } } span { font-size: 14px; color: #718096; } }
  `]
})
export class CaseListComponent implements OnInit {
  cases: any[] = [];
  loading = false;
  search = ''; statusFilter = '';
  page = 1; pageSize = 10; total = 0;
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  constructor(private svc: CasesService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getAll(this.page, this.pageSize, this.statusFilter || undefined, this.search || undefined).subscribe({
      next: res => {
        this.cases = extractList(res);
        this.total = extractTotal(res) || this.cases.length;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch() { this.page = 1; this.load(); }
  prevPage() { if (this.page > 1) { this.page--; this.load(); } }
  nextPage() { if (this.page < this.totalPages) { this.page++; this.load(); } }

  clientName(c: any) { if (!c) return '-'; return c.name || `${c.firstName||''} ${c.lastName||''}`.trim() || '-'; }
  lawyerName(l: any) { if (!l) return '-'; return l.name || `${l.firstName||''} ${l.lastName||''}`.trim() || '-'; }

  statusLabel(s: string) {
    const m: any = { draft:'مسودة', under_review:'قيد المراجعة', active:'نشطة', court_session:'جلسة', judgment_issued:'صدر حكم', closed:'مغلقة' };
    return m[s] || s;
  }
}
