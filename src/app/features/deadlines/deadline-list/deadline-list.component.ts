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
  template: `
    <div class="p-6 bg-gray-50 min-h-screen" dir="rtl">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-gray-900">⏰ المواعيد القانونية</h1>
        <button
          (click)="showForm = !showForm"
          class="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          ➕ موعد جديد
        </button>
      </div>

      <!-- Add Form -->
      <div *ngIf="showForm" class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <h3 class="text-sm font-semibold text-gray-900 mb-4">إضافة موعد قانوني</h3>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-600">القضية *</label>
            <select
              [(ngModel)]="form.case"
              class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition bg-white"
            >
              <option value="">اختر القضية</option>
              <option *ngFor="let c of cases" [value]="c._id">{{ c.caseNumber }} - {{ c.title }}</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-600">نوع الموعد *</label>
            <select
              [(ngModel)]="form.type"
              class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition bg-white"
            >
              <option value="appeal">استئناف</option>
              <option value="cassation">نقض</option>
              <option value="objection">اعتراض</option>
              <option value="response">رد</option>
              <option value="statute_of_limitations">تقادم</option>
              <option value="execution">تنفيذ</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-600">تاريخ الاستحقاق *</label>
            <input
              type="date"
              [(ngModel)]="form.dueDate"
              class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-gray-600">المحامي المسؤول *</label>
            <select
              [(ngModel)]="form.responsibleLawyer"
              class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition bg-white"
            >
              <option value="">اختر المحامي</option>
              <option *ngFor="let l of lawyers" [value]="l._id">
                {{ l.user?.firstName }} {{ l.user?.lastName }}
              </option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5 col-span-2">
            <label class="text-sm font-medium text-gray-600">ملاحظات</label>
            <textarea
              [(ngModel)]="form.notes"
              rows="2"
              class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition resize-none"
            ></textarea>
          </div>
        </div>

        <div *ngIf="formError" class="mt-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
          {{ formError }}
        </div>

        <div class="flex gap-3 mt-5">
          <button
            (click)="addDeadline()"
            [disabled]="saving"
            class="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
          <button
            (click)="showForm = false"
            class="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-4">
        <select
          [(ngModel)]="statusFilter"
          (ngModelChange)="load()"
          class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-gray-400 bg-white"
        >
          <option value="">كل الحالات</option>
          <option value="pending">معلقة</option>
          <option value="completed">مكتملة</option>
          <option value="missed">فائتة</option>
          <option value="cancelled">ملغاة</option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex items-center justify-center py-20 text-gray-400">
        <div class="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin ml-2"></div>
        جاري التحميل...
      </div>

      <!-- Table -->
      <div *ngIf="!loading" class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 text-right">
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500">النوع</th>
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500">القضية</th>
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500">المحامي</th>
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500">تاريخ الاستحقاق</th>
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500">الحالة</th>
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500">تحديث</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                *ngFor="let d of deadlines"
                [class.bg-red-50]="isPast(d.dueDate) && d.status === 'pending'"
                class="hover:bg-gray-50/50 transition-colors"
              >
                <td class="px-5 py-4 text-sm text-gray-700">{{ typeLabel(d.type) }}</td>
                <td class="px-5 py-4 text-sm">
                  <a [routerLink]="['/cases', d.case?._id]" class="text-blue-600 hover:underline">
                    {{ d.case?.caseNumber }}
                  </a>
                </td>
                <td class="px-5 py-4 text-sm text-gray-700">
                  {{ d.responsibleLawyer?.user?.firstName }} {{ d.responsibleLawyer?.user?.lastName }}
                </td>
                <td
                  class="px-5 py-4 text-sm"
                  [class.text-red-600]="isPast(d.dueDate)"
                  [class.font-medium]="isPast(d.dueDate)"
                  [class.text-gray-600]="!isPast(d.dueDate)"
                >
                  {{ d.dueDate | date:'dd/MM/yyyy' }}
                </td>
                <td class="px-5 py-4">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                    [ngClass]="{
                      'bg-amber-50 text-amber-700': d.status === 'pending',
                      'bg-blue-50 text-blue-700': d.status === 'due_soon',
                      'bg-green-50 text-green-700': d.status === 'completed',
                      'bg-red-50 text-red-700': d.status === 'missed',
                      'bg-gray-100 text-gray-600': d.status === 'cancelled'
                    }"
                  >
                    {{ statusLabel(d.status) }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <select
                    [(ngModel)]="d.status"
                    (ngModelChange)="updateStatus(d)"
                    class="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-gray-400 bg-white"
                  >
                    <option value="pending">معلقة</option>
                    <option value="completed">مكتملة</option>
                    <option value="cancelled">ملغاة</option>
                  </select>
                </td>
              </tr>

              <tr *ngIf="deadlines.length === 0">
                <td colspan="6" class="text-center py-16 text-gray-400 text-sm">لا توجد مواعيد</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class DeadlineListComponent implements OnInit {
  deadlines: any[] = [];
  cases: any[] = [];
  lawyers: any[] = [];
  loading = false;
  statusFilter = '';
  showForm = false;
  saving = false;
  formError = '';
  form = { case: '', type: 'appeal', dueDate: '', responsibleLawyer: '', notes: '' };

  constructor(
    private svc: DeadlinesService,
    private casesSvc: CasesService,
    private usersSvc: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.casesSvc.getAll(1, 100).subscribe({
      next: (res: any) => {
        console.log('Cases API Response:', res);
        // استخراج القضايا من res.data.cases أو res.data.docs أو res.data
        const d = res?.data;
        this.cases = d?.cases || d?.docs || (Array.isArray(d) ? d : []);
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck()
    });

    this.usersSvc.getLawyers().subscribe({
      next: (res: any) => {
        console.log('Lawyers API Response:', res);
        // استخراج المحامين من res.data.lawyers
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
        console.log('Deadlines API Response:', res);
        
        // استخراج المصفوفة بناءً على الهيكل الفعلي: res.data.deadlines
        if (res?.data?.deadlines && Array.isArray(res.data.deadlines)) {
          this.deadlines = res.data.deadlines;
        } else if (res?.data && Array.isArray(res.data)) {
          this.deadlines = res.data;
        } else if (Array.isArray(res)) {
          this.deadlines = res;
        } else {
          this.deadlines = [];
        }
        
        console.log('Processed Deadlines Array:', this.deadlines);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  addDeadline() {
    if (!this.form.case || !this.form.dueDate || !this.form.responsibleLawyer) {
      this.formError = 'يرجى تعبئة الحقول المطلوبة';
      this.cdr.markForCheck();
      return;
    }
    this.saving = true;
    this.formError = '';
    this.cdr.markForCheck();

    this.svc.create(this.form as any).subscribe({
      next: () => {
        this.saving = false;
        this.showForm = false;
        this.form = { case: '', type: 'appeal', dueDate: '', responsibleLawyer: '', notes: '' };
        this.load();
        this.cdr.markForCheck();
      },
      error: err => {
        this.formError = err?.error?.message || 'خطأ';
        this.saving = false;
        this.cdr.markForCheck();
      }
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