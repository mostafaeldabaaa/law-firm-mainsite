import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogsService } from '../../core/services/index';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.component.html',
})
export class AuditLogsComponent implements OnInit {
  logs: any[] = [];
  loading = false;
  outcomeFilter = '';
  page = 1;
  totalPages = 1;

  constructor(private svc: AuditLogsService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    const params: any = { page: this.page };
    if (this.outcomeFilter) params.outcome = this.outcomeFilter;

    this.svc.getAll(params).subscribe({
      next: (res: any) => {
        // البيانات الفعلية جوه data.logs مش data مباشرة
        this.logs = res?.data?.logs || [];
        this.totalPages = res?.meta?.totalPages || 1;
        this.loading = false;
      },
      error: () => {
        this.logs = [];
        this.loading = false;
      },
    });
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.load();
  }

  // النجاح لو statusCode بين 200 و 299
  isSuccess(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }

  userName(log: any): string {
    if (!log.user) return 'نظام / غير مسجل';
    return `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim();
  }
}