import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../core/services/index';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  caseStatus: { status: string; count: number; totalValue: number }[] = [];
  revenue: { month: string; total: number; casesClosed: number }[] = [];
  loadingStatus = true;
  loadingRevenue = true;

  private readonly ARABIC_MONTHS = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];

  constructor(private svc: ReportsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.svc.getCaseStatus().subscribe({
      next: (res: any) => {
        try {
          const rows = res?.data?.report;
          this.caseStatus = Array.isArray(rows)
            ? rows.map((r: any) => ({
                status: r._id,
                count: r.count,
                totalValue: r.totalValue,
              }))
            : [];
        } catch (e) {
          console.error('Failed to parse case-status report:', e, res);
          this.caseStatus = [];
        } finally {
          this.loadingStatus = false;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('case-status request failed:', err);
        this.loadingStatus = false;
        this.cdr.markForCheck();
      }
    });

    this.svc.getRevenue().subscribe({
      next: (res: any) => {
        try {
          const rows = res?.data?.report;
          this.revenue = Array.isArray(rows)
            ? rows.map((r: any) => ({
                month: r._id,
                total: r.totalRevenue,
                casesClosed: r.casesClosed,
              }))
            : [];
        } catch (e) {
          console.error('Failed to parse revenue report:', e, res);
          this.revenue = [];
        } finally {
          this.loadingRevenue = false;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('revenue request failed:', err);
        this.loadingRevenue = false;
        this.cdr.markForCheck();
      }
    });
  }

  maxCount() {
    return Math.max(...this.caseStatus.map(i => i.count), 1);
  }
  barWidth(count: number) {
    return Math.round((count / this.maxCount()) * 100);
  }

  maxRevenue() {
    return Math.max(...this.revenue.map(r => r.total), 1);
  }
  revenueWidth(total: number) {
    return Math.round((total / this.maxRevenue()) * 100);
  }

  monthLabel(ym: string): string {
    if (!ym) return '—';
    const [year, month] = ym.split('-');
    const idx = Number(month) - 1;
    const name = this.ARABIC_MONTHS[idx] || month;
    return `${name} ${year}`;
  }

  statusLabel(s: string) {
    const m: any = {
      draft: 'مسودة',
      under_review: 'قيد المراجعة',
      active: 'نشطة',
      court_session: 'جلسة',
      judgment_issued: 'صدر حكم',
      closed: 'مغلقة',
    };
    return m[s] || s;
  }

  statusBarColor(s: string): string {
    const m: any = {
      draft: 'bg-gray-400',
      under_review: 'bg-blue-400',
      active: 'bg-green-400',
      court_session: 'bg-orange-400',
      judgment_issued: 'bg-purple-400',
      closed: 'bg-gray-300',
    };
    return m[s] || 'bg-gray-400';
  }
}