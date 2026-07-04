import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ClientsService } from '../../../core/services/index';
import { CasesService } from '../../../core/services/cases.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-detail.component.html',
})
export class ClientDetailComponent implements OnInit {
  client: any = null;
  cases: any[] = [];

  loading = true;
  casesLoading = true;
  loadError = false;

  private id!: string;

  constructor(
    private route: ActivatedRoute,
    private clientsSvc: ClientsService, // كان UsersService غلط، القضية مربوطة بـ Client._id مش User._id
    private casesSvc: CasesService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load() {
    this.loading = true;
    this.loadError = false;
    this.casesLoading = true;

    // ملاحظة مهمة: Case.client بيعمل ref لـ 'Client' model (مش 'User').
    // فلازم نجيب بيانات العميل من GET /clients/:id عشان الـ _id يطابق
    // اللي متخزن فعليًا في القضايا. UsersService.getById كان بيضرب على
    // GET /users/:id وده بيرجع User._id، وده سبب المشكلة الأصلي.
    this.clientsSvc.getById(this.id).subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          // شكل الرد الفعلي: { success, message, data: { client: {...} } }
          this.client = res?.data?.client ?? res?.data ?? res ?? null;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.client = null;
          this.loading = false;
          this.loadError = true;
          this.cdr.detectChanges();
        });
      },
    });

    this.loadCases();
  }

  private loadCases() {
    // بنبعت client=this.id للباك اند. دلوقتي this.id فعلاً Client._id الصح،
    // فلو الباك اند بيدعم فلترة GET /cases?client=... هترجع القضايا صح من الأول.
    this.casesSvc.getAll(1, 50, undefined, undefined, this.id).subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          const all: any[] = res?.data?.cases
            ?? res?.data?.data
            ?? (Array.isArray(res?.data) ? res.data : null)
            ?? res?.cases
            ?? (Array.isArray(res) ? res : [])
            ?? [];

          // فلترة احتياطية: لو الباك اند لسه مش بيفلتر بـ client فعليًا
          // (يعني caseController.getAllCases متعملوش تعديل يقرا query.client)
          // السطر ده بيضمن إن الشاشة تعرض بس قضايا العميل ده.
          this.cases = this.filterByClient(all, this.id);

          if (!this.cases.length && all.length) {
            console.warn(
              '[ClientDetail] الباك اند شكله لسه بيتجاهل باراميتر client في GET /cases.',
              'راجع caseController.getAllCases وضيف: if (req.query.client) filter.client = req.query.client;',
            );
          }

          this.casesLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.cases = [];
          this.casesLoading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  private extractClientId(c: any): string | null {
    const clientId = c?.client?._id ?? c?.client?.id ?? c?.client;
    return clientId != null ? String(clientId).trim() : null;
  }

  private filterByClient(all: any[], targetId: string): any[] {
    const normalizedTarget = String(targetId).trim();
    return all.filter((c) => this.extractClientId(c) === normalizedTarget);
  }

  fullName(): string {
    if (!this.client) return '-';
    // Client model بيستخدم fullName / companyName، مش firstName/lastName
    // (دول حقول User مختلفة). بنسيب fallback للتوافق لو النوع اتغيّر.
    return (
      this.client.fullName ||
      this.client.companyName ||
      `${this.client.firstName || ''} ${this.client.lastName || ''}`.trim() ||
      this.client.email ||
      '-'
    );
  }

  initial(): string {
    return this.fullName().charAt(0).toUpperCase();
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
}