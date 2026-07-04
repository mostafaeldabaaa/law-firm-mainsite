// import {
//   Component,
//   OnInit,
//   OnDestroy,
//   ChangeDetectionStrategy,
//   ChangeDetectorRef,
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { UsersService } from '../../../core/services/index';
// import {  CasesService } from '../../../core/services/cases.service';



// import { Subject } from 'rxjs';
// import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// interface Client {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   role: string;
//   branch: string | null;
//   isActive: boolean;
//   lastLoginAt: string | null;
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
//   // extra fields for company clients
//   type?: 'individual' | 'company';
//   nationalId?: string;
//   companyName?: string;
//   casesCount?: number;
// }

// interface ApiResponse {
//   success: boolean;
//   message: string;
//   data: {
//     users: Client[];
//   };
//   meta: {
//     total: number;
//     page: number;
//     limit: number;
//     totalPages: number;
//   };
// }

// @Component({
//   selector: 'app-user-list',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   templateUrl: './user-list.component.html',
// })
// export class UserListComponent implements OnInit, OnDestroy {
//   clients: Client[] = [];
//   filteredClients: Client[] = [];
//   loading = false;
//   searchQuery = '';

//   showForm = false;
//   isEditing = false;
//   editingId: string | null = null;
//   saving = false;
//   formError = '';

//   selectedClient: Client | null = null;

//   form = {
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     type: 'individual' as 'individual' | 'company',
//     nationalId: '',
//     companyName: '',
//   };

//   meta = { total: 0, page: 1, limit: 20, totalPages: 1 };

//   private destroy$ = new Subject<void>();
//   private searchSubject = new Subject<string>();

//   constructor(
//     private usersService: UsersService,
//     private casesService: CasesService,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {
//     this.load();

//     // Debounce search input to avoid filtering on every keystroke
//     this.searchSubject
//       .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
//       .subscribe((query) => {
//         this.applySearch(query);
//         this.cdr.markForCheck(); // tell OnPush to re-render
//       });
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   load(page = 1): void {
//     this.loading = true;
//     this.cdr.markForCheck();

//     const params = {
//       role: 'client',
//       page: String(page),
//       limit: String(this.meta.limit),
//     };

//     this.usersService
//       .getAll(params)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (res: any) => {
//           this.clients = res.data.users;
//           this.meta = res.meta;
//           this.applySearch(this.searchQuery);
//           this.loadCasesCounts();
//           this.loading = false;
//           this.cdr.markForCheck(); // OnPush: manually trigger change detection
//         },
//         error: () => {
//           this.loading = false;
//           this.cdr.markForCheck();
//         },
//       });
//   }

//   // يحسب عدد القضايا الحقيقي لكل عميل، بيلف على كل صفحات /cases
//   // لأن /users مش بيرجع casesCount أصلاً
//   private loadCasesCounts(): void {
//     const countMap = new Map<string, number>();
//     const pageLimit = 100; // حجم كل صفحة أثناء الجلب

//     const fetchPage = (page: number) => {
//       this.casesService
//         .getAll(page, pageLimit)
//         .pipe(takeUntil(this.destroy$))
//         .subscribe({
//           next: (res: any) => {
//             const cases = res?.data?.cases || [];
//             const totalPages = res?.meta?.totalPages || 1;

//             for (const c of cases) {
//               const clientId = c.client?._id;
//               if (!clientId) continue;
//               countMap.set(clientId, (countMap.get(clientId) || 0) + 1);
//             }

//             if (page < totalPages) {
//               fetchPage(page + 1);
//             } else {
//               this.applyCasesCounts(countMap);
//             }
//           },
//           error: () => {
//             this.applyCasesCounts(countMap);
//           },
//         });
//     };

//     fetchPage(1);
//   }

//   private applyCasesCounts(countMap: Map<string, number>): void {
//     this.clients = this.clients.map((client) => ({
//       ...client,
//       casesCount: countMap.get(client._id) || 0,
//     }));
//     this.applySearch(this.searchQuery);
//     this.cdr.markForCheck();
//   }

//   onSearch(query: string): void {
//     this.searchSubject.next(query);
//   }

//   private applySearch(query: string): void {
//     const q = query.trim().toLowerCase();
//     if (!q) {
//       this.filteredClients = [...this.clients];
//       return;
//     }
//     this.filteredClients = this.clients.filter(
//       (c) =>
//         `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
//         c.phone?.includes(q) ||
//         c.email?.toLowerCase().includes(q)
//     );
//   }

//   // ─── Form: Add / Edit ───
//   openAddForm(): void {
//     this.isEditing = false;
//     this.editingId = null;
//     this.showForm = true;
//     this.formError = '';
//     this.form = {
//       firstName: '',
//       lastName: '',
//       email: '',
//       phone: '',
//       type: 'individual',
//       nationalId: '',
//       companyName: '',
//     };
//     this.cdr.markForCheck();
//   }

//   openEditForm(client: Client): void {
//     this.isEditing = true;
//     this.editingId = client._id;
//     this.form = {
//       firstName: client.firstName || '',
//       lastName: client.lastName || '',
//       email: client.email || '',
//       phone: client.phone || '',
//       type: client.type === 'company' ? 'company' : 'individual',
//       nationalId: client.nationalId || '',
//       companyName: client.companyName || '',
//     };
//     this.formError = '';
//     this.showForm = true;
//     this.cdr.markForCheck();
//   }

//   closeForm(): void {
//     this.showForm = false;
//     this.isEditing = false;
//     this.editingId = null;
//     this.cdr.markForCheck();
//   }

//   onOverlayClick(event: MouseEvent): void {
//     if ((event.target as HTMLElement).classList.contains('fixed')) {
//       this.closeForm();
//     }
//   }

//   saveClient(): void {
//     if (!this.form.firstName || !this.form.email) {
//       this.formError = 'يرجى تعبئة الحقول المطلوبة';
//       this.cdr.markForCheck();
//       return;
//     }

//     this.saving = true;
//     this.formError = '';
//     this.cdr.markForCheck();

//     const payload = {
//       firstName: this.form.firstName,
//       lastName: this.form.lastName,
//       email: this.form.email,
//       phone: this.form.phone,
//       role: 'client',
//       ...(this.form.type === 'individual' && { nationalId: this.form.nationalId }),
//       ...(this.form.type === 'company' && { companyName: this.form.companyName }),
//     };

//     // NOTE: assumes UsersService has an `update(id, data)` method.
//     // If your service uses a different method name, adjust this call accordingly.
//     const request$ = this.isEditing && this.editingId
//       ? this.usersService.update(this.editingId, payload)
//       : this.usersService.create(payload);

//     request$.pipe(takeUntil(this.destroy$)).subscribe({
//       next: () => {
//         this.saving = false;
//         this.closeForm();
//         this.load(this.meta.page);
//         this.cdr.markForCheck();
//       },
//       error: (err: any) => {
//         this.formError = err?.error?.message || 'حدث خطأ، يرجى المحاولة مجدداً';
//         this.saving = false;
//         this.cdr.markForCheck();
//       },
//     });
//   }

//   // ─── Details ───
//   viewDetails(client: Client): void {
//     this.selectedClient = client;
//     this.cdr.markForCheck();
//   }

//   // ─── Delete ───
//   deleteClient(client: Client): void {
//     if (!confirm(`هل تريد حذف ${client.firstName} ${client.lastName}؟`)) return;

//     this.usersService
//       .delete(client._id)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: () => {
//           this.clients = this.clients.filter((c) => c._id !== client._id);
//           this.applySearch(this.searchQuery);
//           this.cdr.markForCheck();
//         },
//         error: () => {},
//       });
//   }

//   goToPage(page: number): void {
//     if (page < 1 || page > this.meta.totalPages) return;
//     this.load(page);
//   }
// }

import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, ClientsService } from '../../../core/services/index';
import { CasesService } from '../../../core/services/cases.service';

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
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  loading = false;
  searchQuery = '';

  showForm = false;
  isEditing = false;
  editingId: string | null = null;
  saving = false;
  formError = '';

  selectedClient: Client | null = null;

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
    private clientsService: ClientsService, // محتاجينه بس عشان نربط User._id بـ Client._id
    private casesService: CasesService,
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
          this.loadCasesCounts();
          this.loading = false;
          this.cdr.markForCheck(); // OnPush: manually trigger change detection
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  // يحسب عدد القضايا الحقيقي لكل عميل.
  //
  // مهم: الجدول ده بيعرض سجلات User (role=client)، لكن Case.client بيربط
  // على Client._id (موديل مختلف تمامًا وله _id مستقل). الحقل الوحيد اللي
  // بيربط بينهم هو Client.user (اختياري). فلازم نعمل خطوتين:
  //   1) نجيب كل الـ Clients ونبني map: userId -> clientId
  //   2) نجيب كل الـ Cases ونعمل map: clientId -> count
  //   3) نجمعهم: لكل User، ندوّر على clientId المقابل له، وبعدين على العدّاد بتاعه
  private loadCasesCounts(): void {
    this.clientsService
      .getAll({ page: 1, limit: 1000 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clientsRes: any) => {
          const clientDocs: any[] =
            clientsRes?.data?.clients ??
            clientsRes?.data?.data ??
            (Array.isArray(clientsRes?.data) ? clientsRes.data : []) ??
            [];

          // userId (User._id) -> clientId (Client._id)
          const userIdToClientId = new Map<string, string>();
          for (const cl of clientDocs) {
            const userId = cl?.user?._id ?? cl?.user; // populated أو raw ObjectId
            if (userId) userIdToClientId.set(String(userId), String(cl._id));
          }

          this.fetchCasesAndCount(userIdToClientId);
        },
        error: () => {
          // لو فشل جلب الـ clients، مفيش طريقة نربط بيها، فنسيب العداد صفر
          // بدل ما نوقف الصفحة كلها.
          this.applyCasesCounts(new Map());
        },
      });
  }

  private fetchCasesAndCount(userIdToClientId: Map<string, string>): void {
    // clientId (Client._id) -> عدد القضايا
    const countByClientId = new Map<string, number>();
    const pageLimit = 100;

    const fetchPage = (page: number) => {
      this.casesService
        .getAll(page, pageLimit)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            const cases = res?.data?.cases || [];
            const totalPages = res?.meta?.totalPages || 1;

            for (const c of cases) {
              const clientId = c.client?._id ?? c.client;
              if (!clientId) continue;
              const key = String(clientId);
              countByClientId.set(key, (countByClientId.get(key) || 0) + 1);
            }

            if (page < totalPages) {
              fetchPage(page + 1);
            } else {
              // نحوّل من clientId -> userId عشان نطبّقهم على صفوف الجدول (اللي مفتاحها User._id)
              const countByUserId = new Map<string, number>();
              for (const [userId, clientId] of userIdToClientId.entries()) {
                countByUserId.set(userId, countByClientId.get(clientId) || 0);
              }
              this.applyCasesCounts(countByUserId);
            }
          },
          error: () => {
            this.applyCasesCounts(new Map());
          },
        });
    };

    fetchPage(1);
  }

  private applyCasesCounts(countMap: Map<string, number>): void {
    this.clients = this.clients.map((client) => ({
      ...client,
      casesCount: countMap.get(client._id) || 0,
    }));
    this.applySearch(this.searchQuery);
    this.cdr.markForCheck();
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

  // ─── Form: Add / Edit ───
  openAddForm(): void {
    this.isEditing = false;
    this.editingId = null;
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

  openEditForm(client: Client): void {
    this.isEditing = true;
    this.editingId = client._id;
    this.form = {
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      phone: client.phone || '',
      type: client.type === 'company' ? 'company' : 'individual',
      nationalId: client.nationalId || '',
      companyName: client.companyName || '',
    };
    this.formError = '';
    this.showForm = true;
    this.cdr.markForCheck();
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.cdr.markForCheck();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.closeForm();
    }
  }

  saveClient(): void {
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

    // NOTE: assumes UsersService has an `update(id, data)` method.
    // If your service uses a different method name, adjust this call accordingly.
    const request$ = this.isEditing && this.editingId
      ? this.usersService.update(this.editingId, payload)
      : this.usersService.create(payload);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.load(this.meta.page);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.formError = err?.error?.message || 'حدث خطأ، يرجى المحاولة مجدداً';
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ─── Details ───
  viewDetails(client: Client): void {
    this.selectedClient = client;
    this.cdr.markForCheck();
  }

  // ─── Delete ───
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