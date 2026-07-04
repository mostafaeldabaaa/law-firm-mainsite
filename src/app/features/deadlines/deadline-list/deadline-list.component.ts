import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeadlinesService, UsersService } from '../../../core/services/index';
import { CasesService } from '../../../core/services/cases.service';

@Component({
  selector: 'app-deadline-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './deadline-list.component.html',
})
export class DeadlineListComponent implements OnInit {
  deadlines: any[] = [];
  cases: any[] = [];
  lawyers: any[] = [];
  loading = false;
  statusFilter = '';

  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  saving = false;
  formError = '';
  form = { title: '', case: '', type: 'appeal', dueDate: '', responsibleLawyer: '', description: '' };

  selectedDeadline: any = null;

  constructor(
    private svc: DeadlinesService,
    private casesSvc: CasesService,
    private usersSvc: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.casesSvc.getAll(1, 100).subscribe({
      next: (res: any) => {
        const d = res?.data;
        this.cases = d?.cases || d?.docs || (Array.isArray(d) ? d : []);
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });

    this.usersSvc.getLawyers().subscribe({
      next: (res: any) => {
        this.lawyers = res?.data?.lawyers || (Array.isArray(res?.data) ? res.data : []);
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });

    this.load();
  }

  load() {
    this.loading = true;
    this.cdr.markForCheck();

    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;

    this.svc.getAll(params).subscribe({
      next: (res: any) => {
        if (res?.data?.deadlines && Array.isArray(res.data.deadlines)) {
          this.deadlines = res.data.deadlines;
        } else if (res?.data && Array.isArray(res.data)) {
          this.deadlines = res.data;
        } else if (Array.isArray(res)) {
          this.deadlines = res;
        } else {
          this.deadlines = [];
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ─── Form: Add / Edit ───
  openAddForm() {
    this.isEditing = false;
    this.editingId = null;
    this.form = { title: '', case: '', type: 'appeal', dueDate: '', responsibleLawyer: '', description: '' };
    this.formError = '';
    this.showForm = true;
  }

  openEditForm(d: any) {
    this.isEditing = true;
    this.editingId = d._id;
    this.form = {
      title: d.title || '',
      case: d.case?._id || d.case || '',
      type: d.type || 'appeal',
      // dueDate comes back as an ISO string; trim to yyyy-MM-dd for the date input
      dueDate: d.dueDate ? String(d.dueDate).slice(0, 10) : '',
      responsibleLawyer: d.responsibleLawyer?._id || d.responsibleLawyer || '',
      description: d.description || ''
    };
    this.formError = '';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
  }

  saveDeadline() {
    if (!this.form.title || !this.form.case || !this.form.dueDate || !this.form.responsibleLawyer) {
      this.formError = 'يرجى تعبئة الحقول المطلوبة';
      this.cdr.markForCheck();
      return;
    }
    this.saving = true;
    this.formError = '';
    this.cdr.markForCheck();

    const request$ = this.isEditing && this.editingId
      ? this.svc.update(this.editingId, this.form as any)
      : this.svc.create(this.form as any);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.load();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.formError = err?.error?.message || 'خطأ';
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ─── Details ───
  viewDetails(d: any) {
    this.selectedDeadline = d;
  }

  // ─── Delete ───
  deleteDeadline(d: any) {
    const confirmed = window.confirm(`هل أنت متأكد من حذف الموعد "${d.title}"؟`);
    if (!confirmed) return;

    this.svc.delete(d._id).subscribe({
      next: () => {
        this.load();
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });
  }

  updateStatus(d: any) {
    this.svc.updateStatus(d._id, d.status).subscribe({
      next: () => this.cdr.markForCheck(),
      error: () => this.cdr.markForCheck()
    });
  }

  isPast(date: string) {
    return new Date(date) < new Date();
  }

  // NOTE: the API currently returns `responsibleLawyer.user` as a raw ObjectId string
  // rather than a populated user object, so firstName/lastName aren't available yet.
  // This falls back gracefully until the backend populates that field.
  lawyerName(d: any): string {
    const lawyer = d?.responsibleLawyer;
    if (!lawyer) return '—';
    const first = lawyer.user?.firstName;
    const last = lawyer.user?.lastName;
    if (first || last) return `${first || ''} ${last || ''}`.trim();
    return lawyer.barNumber ? `محامي (${lawyer.barNumber})` : '—';
  }

  typeLabel(t: string) {
    const m: any = {
      appeal: 'استئناف',
      cassation: 'نقض',
      objection: 'اعتراض',
      response: 'رد',
      statute_of_limitations: 'تقادم',
      execution: 'تنفيذ',
      document_submission: 'تقديم مستندات',
      response_deadline: 'موعد رد'
    };
    return m[t] || t;
  }

  statusLabel(s: string) {
    const m: any = {
      pending: 'معلقة',
      completed: 'مكتملة',
      missed: 'فائتة',
      cancelled: 'ملغاة',
      due_soon: 'قريب الاستحقاق'
    };
    return m[s] || s;
  }
}