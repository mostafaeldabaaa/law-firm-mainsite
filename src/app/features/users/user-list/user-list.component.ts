import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/index';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  branch: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  // extra fields for company clients
  type?: 'individual' | 'company';
  nationalId?: string;
  companyName?: string;
  casesCount?: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    users: Client[];
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6" dir="rtl">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="text-right">
          <h1 class="text-3xl font-bold text-gray-900">العملاء</h1>
          <p class="text-gray-500 text-sm mt-1">إدارة بيانات العملاء والشركات</p>
        </div>
        <button
          (click)="openAddForm()"
          class="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <span class="text-lg">+</span>
          إضافة عميل
        </button>
      </div>

      <!-- Add Client Modal -->
      <div
        *ngIf="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        (click)="onOverlayClick($event)"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-5">إضافة عميل جديد</h2>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-600">الاسم الأول *</label>
              <input
                type="text"
                [(ngModel)]="form.firstName"
                placeholder="أدخل الاسم الأول"
                class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-600">الاسم الأخير *</label>
              <input
                type="text"
                [(ngModel)]="form.lastName"
                placeholder="أدخل الاسم الأخير"
                class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-600">البريد الإلكتروني *</label>
              <input
                type="email"
                [(ngModel)]="form.email"
                placeholder="example@email.com"
                class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-600">رقم الهاتف</label>
              <input
                type="tel"
                [(ngModel)]="form.phone"
                placeholder="01xxxxxxxxx"
                class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-600">النوع</label>
              <select
                [(ngModel)]="form.type"
                class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white"
              >
                <option value="individual">فرد</option>
                <option value="company">شركة</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5" *ngIf="form.type === 'individual'">
              <label class="text-sm font-medium text-gray-600">الرقم القومي</label>
              <input
                type="text"
                [(ngModel)]="form.nationalId"
                placeholder="14 رقم"
                maxlength="14"
                class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
            <div class="flex flex-col gap-1.5 col-span-2" *ngIf="form.type === 'company'">
              <label class="text-sm font-medium text-gray-600">اسم الشركة</label>
              <input
                type="text"
                [(ngModel)]="form.companyName"
                placeholder="أدخل اسم الشركة"
                class="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>
          </div>

          <div
            *ngIf="formError"
            class="mt-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg"
          >
            {{ formError }}
          </div>

          <div class="flex gap-3 mt-5">
            <button
              (click)="addClient()"
              [disabled]="saving"
              class="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
            <button
              (click)="closeForm()"
              class="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <!-- Search Bar -->
        <div class="p-4 border-b border-gray-100 flex justify-end">
          <div class="relative w-72">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch($event)"
              placeholder="بحث بالاسم، رقم الهاتف..."
              class="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
            />
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="flex items-center justify-center py-20 text-gray-400">
          <div class="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin ml-2"></div>
          جاري التحميل...
        </div>

        <!-- Table -->
        <div *ngIf="!loading" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 text-right">
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500 font-medium">الاسم</th>
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500 font-medium">النوع</th>
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500 font-medium">الهاتف</th>
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500 font-medium">البريد الإلكتروني</th>
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500 font-medium">الرقم القومي</th>
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500 font-medium">عدد القضايا</th>
                <th class="px-5 py-3.5 text-sm font-semibold text-gray-500 font-medium"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let client of filteredClients" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-5 py-4 text-sm font-medium text-gray-900">
                  {{ client.firstName }} {{ client.lastName }}
                </td>
                <td class="px-5 py-4">
                  <span *ngIf="client.type === 'company'"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-400 text-white">
                    شركة
                  </span>
                  <span *ngIf="client.type !== 'company'"
                    class="text-sm text-gray-600">
                    فرد
                  </span>
                </td>
                <td class="px-5 py-4 text-sm text-gray-700 font-mono tracking-wide">{{ client.phone }}</td>
                <td class="px-5 py-4 text-sm text-gray-600 dir-ltr text-left">{{ client.email }}</td>
                <td class="px-5 py-4 text-sm text-gray-500 font-mono">
                  {{ client.nationalId || '-' }}
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700">
                    {{ client.casesCount ?? 0 }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <button
                    (click)="deleteClient(client)"
                    class="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                    title="حذف العميل"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredClients.length === 0">
                <td colspan="7" class="text-center py-16 text-gray-400">
                  <div class="flex flex-col items-center gap-2">
                    <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span class="text-sm">لا يوجد عملاء</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div
          *ngIf="!loading && meta.totalPages > 1"
          class="flex items-center justify-between px-5 py-3.5 border-t border-gray-100"
        >
          <span class="text-sm text-gray-500">
            إجمالي {{ meta.total }} عميل
          </span>
          <div class="flex gap-2">
            <button
              (click)="goToPage(meta.page - 1)"
              [disabled]="meta.page === 1"
              class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >السابق</button>
            <span class="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg">
              {{ meta.page }}
            </span>
            <button
              (click)="goToPage(meta.page + 1)"
              [disabled]="meta.page === meta.totalPages"
              class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >التالي</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class UserListComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  loading = false;
  searchQuery = '';

  showForm = false;
  saving = false;
  formError = '';

  form = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'individual' as 'individual' | 'company',
    nationalId: '',
    companyName: '',
  };

  meta = { total: 0, page: 1, limit: 20, totalPages: 1 };

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private usersService: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();

    // Debounce search input to avoid filtering on every keystroke
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.applySearch(query);
        this.cdr.markForCheck(); // tell OnPush to re-render
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(page = 1): void {
    this.loading = true;
    this.cdr.markForCheck();

    const params = {
      role: 'client',
      page: String(page),
      limit: String(this.meta.limit),
    };

    this.usersService
      .getAll(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.clients = res.data.users;
          this.meta = res.meta;
          this.applySearch(this.searchQuery);
          this.loading = false;
          this.cdr.markForCheck(); // OnPush: manually trigger change detection
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  private applySearch(query: string): void {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredClients = [...this.clients];
      return;
    }
    this.filteredClients = this.clients.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }

  openAddForm(): void {
    this.showForm = true;
    this.formError = '';
    this.form = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      type: 'individual',
      nationalId: '',
      companyName: '',
    };
    this.cdr.markForCheck();
  }

  closeForm(): void {
    this.showForm = false;
    this.cdr.markForCheck();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.closeForm();
    }
  }

  addClient(): void {
    if (!this.form.firstName || !this.form.email) {
      this.formError = 'يرجى تعبئة الحقول المطلوبة';
      this.cdr.markForCheck();
      return;
    }

    this.saving = true;
    this.formError = '';
    this.cdr.markForCheck();

    const payload = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      phone: this.form.phone,
      role: 'client',
      ...(this.form.type === 'individual' && { nationalId: this.form.nationalId }),
      ...(this.form.type === 'company' && { companyName: this.form.companyName }),
    };

    this.usersService
      .create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.showForm = false;
          this.load();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.formError = err?.error?.message || 'حدث خطأ، يرجى المحاولة مجدداً';
          this.saving = false;
          this.cdr.markForCheck();
        },
      });
  }

  deleteClient(client: Client): void {
    if (!confirm(`هل تريد حذف ${client.firstName} ${client.lastName}؟`)) return;

    this.usersService
      .delete(client._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.clients = this.clients.filter((c) => c._id !== client._id);
          this.applySearch(this.searchQuery);
          this.cdr.markForCheck();
        },
        error: () => {},
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.meta.totalPages) return;
    this.load(page);
  }
}