import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CasesService } from '../../core/services/cases.service';
import {
  TasksService, DeadlinesService, SessionsService, DocumentsService,
  ConsultationsService, UsersService, ReportsService, AuditLogsService
} from '../../core/services/index';
import { AuthService } from '../../core/services/auth.service';
import { extractList, extractTotal } from '../../core/services/api-helper';

interface DonutSlice { label: string; color: string; value: number; dash: number; offset: number; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  isClient = false;
  isAdminLike = false;
  fullName = '';
  userEmail = '';
  userInitial = '';

  myCases: any[] = [];
  myConsultations: any[] = [];
  myDocuments: any[] = [];
  activeTab: 'documents' | 'consultations' | 'cases' = 'cases';
  get activeCasesCount() { return this.myCases.filter(c => c.status === 'active').length; }

  stats = { pendingTasks: 0, upcomingSessions: 0, totalClients: 0, totalLawyers: 0, activeCases: 0, totalCases: 0 };

  statusReport: { status: string; count: number }[] = [];
  donutSlices: DonutSlice[] = [];
  donutTotal = 0;
  barMax = 1;

  recentActivity: { text: string; date: string }[] = [];
  upcomingSessionsList: any[] = [];
  recentCases: any[] = [];

  loading = false;
  loadingActivity = true;
  loadingUpcoming = true;
  loadingCases = true;

  private clientLoadedCount = 0;

  private readonly STATUS_COLORS: Record<string, string> = {
    draft: '#7d87a3', under_review: '#5b7fd4', active: '#d4af37',
    court_session: '#c0772f', judgment_issued: '#1c2438', closed: '#e0524f'
  };

  constructor(
    private casesService: CasesService,
    private tasksService: TasksService,
    private deadlinesService: DeadlinesService,
    private sessionsService: SessionsService,
    private documentsService: DocumentsService,
    private consultationsService: ConsultationsService,
    private usersService: UsersService,
    private reportsService: ReportsService,
    private auditLogsService: AuditLogsService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.auth.currentUser();
    this.isClient = user?.role === 'client';
    this.isAdminLike = this.auth.hasRole('super_admin', 'branch_manager');
    this.fullName = this.auth.getUserName() || 'المستخدم';
    this.userEmail = user?.email || '';
    this.userInitial = this.fullName.charAt(0) || 'م';

    if (this.isClient) {
      this.loadClientDashboard();
    } else {
      this.loadAdminDashboard();
    }
  }

  setTab(tab: 'documents' | 'consultations' | 'cases') { this.activeTab = tab; }

  // ══════════════════════════════════════════════════════════
  // لوحة العميل
  // ══════════════════════════════════════════════════════════
  private loadClientDashboard() {
    this.loading = true;
    this.clientLoadedCount = 0;

    this.casesService.getAll(1, 50).subscribe({
      next: res => { this.myCases = extractList(res); this.checkClientLoaded(); },
      error: () => { this.myCases = []; this.checkClientLoaded(); }
    });

    this.consultationsService.getAll().subscribe({
      next: res => { this.myConsultations = extractList(res); this.checkClientLoaded(); },
      error: () => { this.myConsultations = []; this.checkClientLoaded(); }
    });

    this.documentsService.getAll().subscribe({
      next: res => { this.myDocuments = extractList(res); this.checkClientLoaded(); },
      error: () => { this.myDocuments = []; this.checkClientLoaded(); }
    });
  }

  private checkClientLoaded() {
    this.clientLoadedCount++;
    if (this.clientLoadedCount >= 3) {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ══════════════════════════════════════════════════════════
  // لوحة الإدارة
  // ══════════════════════════════════════════════════════════
  private loadAdminDashboard() {
    // ✅ نداء واحد فقط لكل endpoint (تم حذف التكرار الذي كان يسبب
    // سباق نتائج/طلبات مكررة في الـ Network tab)

    this.casesService.getAll(1, 5).subscribe({
      next: res => {
        this.recentCases = extractList(res);
        this.stats.totalCases = extractTotal(res) || this.recentCases.length;
        this.loadingCases = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCases = false;
        this.cdr.detectChanges();
      }
    });

    this.casesService.getAll(1, 1, 'active').subscribe({
      next: res => {
        this.stats.activeCases = extractTotal(res);
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.tasksService.getAll({ status: 'pending' }).subscribe({
      next: res => {
        this.stats.pendingTasks = extractTotal(res) || extractList(res).length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.sessionsService.getAll({ status: 'scheduled' }).subscribe({
      next: res => {
        const sessions = extractList(res);
        this.stats.upcomingSessions = extractTotal(res) || sessions.length;
        this.upcomingSessionsList = sessions.slice(0, 5);
        this.loadingUpcoming = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingUpcoming = false;
        this.cdr.detectChanges();
      }
    });

    if (this.isAdminLike) {
      this.usersService.getClients().subscribe({
        next: res => {
          this.stats.totalClients = extractTotal(res) || extractList(res).length;
          this.cdr.detectChanges();
        },
        error: () => {}
      });
      this.usersService.getLawyers().subscribe({
        next: res => {
          this.stats.totalLawyers = extractTotal(res) || extractList(res).length;
          this.cdr.detectChanges();
        },
        error: () => {}
      });
    }

    this.reportsService.getCaseStatus().subscribe({
      next: (res: any) => {
        const report = res?.data?.report || [];
        this.statusReport = report.map((r: any) => ({
          status: r._id,
          count: r.count
        }));
        this.buildDonut(this.statusReport);
        this.barMax = Math.max(1, ...this.statusReport.map((r: any) => r.count));
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    if (this.auth.hasRole('super_admin')) {
      this.auditLogsService.getAll({ limit: 8 }).subscribe({
        next: res => {
          this.recentActivity = extractList(res).map((l: any) => ({
            text: this.describeLog(l),
            date: l.createdAt
          }));
          this.loadingActivity = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingActivity = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loadingActivity = false;
    }
  }

  private buildDonut(report: { status: string; count: number }[]) {
    const total = report.reduce((sum, r) => sum + r.count, 0);
    this.donutTotal = total;
    if (total === 0) { this.donutSlices = []; return; }
    const circumference = 377;
    let offset = 0;
    this.donutSlices = report.filter(r => r.count > 0).map(r => {
      const dash = (r.count / total) * circumference;
      const slice: DonutSlice = {
        label: this.statusLabel(r.status),
        color: this.STATUS_COLORS[r.status] || '#7d87a3',
        value: r.count, dash, offset
      };
      offset += dash;
      return slice;
    });
  }

  private describeLog(log: any): string {
    const actor = this.getName(log.user);
    return `${actor ? actor + ': ' : ''}${log.action || ''} ${log.resource || ''}`.trim();
  }

  getName(u: any) { return u?.name || `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || '-'; }

  statusLabel(s: string) {
    const m: any = { draft: 'مسودة', under_review: 'قيد المراجعة', active: 'نشطة', court_session: 'جلسة', judgment_issued: 'صدر حكم', closed: 'مغلقة' };
    return m[s] || s;
  }

  consultationStatusLabel(s: string) {
    const m: any = { pending: 'قيد الانتظار', in_progress: 'جارية', answered: 'تم الرد', closed: 'مغلقة' };
    return m[s] || s;
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} د`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} س`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  }
}