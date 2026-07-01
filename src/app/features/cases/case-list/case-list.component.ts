import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CasesService } from '../../../core/services/cases.service';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './case-list.component.html',
})
export class CaseListComponent implements OnInit {

  cases:    any[] = [];
  loading   = false;
  skeletonRows = Array(6);

  // ─── Filters ──────────────────────────────────────────────────
  search       = '';
  statusFilter = '';
  typeFilter   = '';

  // ─── Pagination ───────────────────────────────────────────────
  page      = 1;
  pageSize  = 10;
  total     = 0;
  get totalPages() { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  constructor(
    private svc: CasesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.cdr.detectChanges();

    this.svc.getAll(
      this.page,
      this.pageSize,
      this.statusFilter || undefined,
      this.search || undefined
    ).subscribe({
      next: (res: any) => {
        const root      = res?.data ?? res;
        const data      = root?.cases ?? root?.data ?? (Array.isArray(root) ? root : []);
        this.cases      = [...data];
        this.total      = res?.meta?.total ?? res?.data?.total ?? data.length;
        this.loading    = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() { this.page = 1; this.load(); }
  prevPage() { if (this.page > 1)               { this.page--; this.load(); } }
  nextPage() { if (this.page < this.totalPages) { this.page++; this.load(); } }

  deleteCase(id: string) {
    if (!confirm('هل تريد حذف هذه القضية؟')) return;
    this.svc.delete(id).subscribe({ next: () => this.load() });
  }

  clientName(c: any): string {
    if (!c) return '-';
    return c.fullName || c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '-';
  }

  lawyerName(l: any): string {
    if (!l) return '-';
    // leadLawyer قد يكون object يحتوي على user أو name مباشرة
    return l.name || l.user?.name || l.user?.fullName ||
           `${l.user?.firstName || ''} ${l.user?.lastName || ''}`.trim() || l.barNumber || '-';
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      draft:            'مسودة',
      under_review:     'تحت المراجعة',
      active:           'نشطة',
      court_session:    'جلسة',
      judgment_issued:  'صدر حكم',
      closed:           'مغلقة',
    };
    return m[s] ?? s;
  }

  statusClasses(s: string): string {
    const m: Record<string, string> = {
      draft:           'bg-gray-100 text-gray-600',
      under_review:    'bg-blue-100 text-blue-700',
      active:          'bg-green-100 text-green-700',
      court_session:   'bg-orange-100 text-orange-700',
      judgment_issued: 'bg-purple-100 text-purple-700',
      closed:          'bg-slate-100 text-slate-500',
    };
    return m[s] ?? 'bg-gray-100 text-gray-600';
  }

  caseTypeLabel(t: string): string {
    return t || '-';
  }
}