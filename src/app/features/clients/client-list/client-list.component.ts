// import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { UsersService } from '../../../core/services/index';

// @Component({
//   selector: 'app-client-list',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule],
//   templateUrl: './client-list.component.html',
// })
// export class ClientListComponent implements OnInit {
//   clients: any[] = [];
//   filtered: any[] = [];
//   paged: any[] = [];

//   loading = false;
//   loadError = false;

//   search = '';
//   statusFilter = '';

//   page = 1;
//   pageSize = 10;
//   totalPages = 1;

//   deletingId: string | null = null;

//   constructor(
//     private svc: UsersService,
//     private zone: NgZone,
//     private cdr: ChangeDetectorRef,
//   ) {}

//   ngOnInit() {
//     this.load();
//   }

//   load() {
//     this.loading = true;
//     this.loadError = false;
//     this.svc.getClients().subscribe({
//       next: (res: any) => {
//         // بنلف التحديث جوه zone.run + بنجبر change detection يدوي.
//         // ده بيثبّت المشكلة اللي كانت بتخلي الشاشة متتحدثش إلا لما المستخدم يعمل
//         // أي تفاعل تاني (فتح القايمة المنسدلة مثلاً) — علامة إن الـ response
//         // كان بيوصل بره Angular zone (غالبًا لو الـ service بيستخدم fetch()
//         // مباشرة بدل HttpClient، أو Observable جوه socket/worker خارجي).
//         this.zone.run(() => {
//           this.clients = res?.data?.users
//             ?? res?.data?.clients
//             ?? (Array.isArray(res?.data) ? res.data : null)
//             ?? res?.users
//             ?? (Array.isArray(res) ? res : [])
//             ?? [];

//           this.applyFilters();
//           this.loading = false;
//           this.cdr.detectChanges();
//         });
//       },
//       error: () => {
//         this.zone.run(() => {
//           this.clients = [];
//           this.applyFilters();
//           this.loadError = true;
//           this.loading = false;
//           this.cdr.detectChanges();
//         });
//       },
//     });
//   }

//   onSearch() {
//     this.page = 1;
//     this.applyFilters();
//   }

//   private applyFilters() {
//     const q = this.search.trim().toLowerCase();

//     this.filtered = this.clients.filter((c) => {
//       const matchesSearch =
//         !q ||
//         this.fullName(c).toLowerCase().includes(q) ||
//         (c.email || '').toLowerCase().includes(q) ||
//         (c.phone || '').toLowerCase().includes(q);

//       const matchesStatus =
//         !this.statusFilter ||
//         (this.statusFilter === 'active' && c.isActive) ||
//         (this.statusFilter === 'inactive' && !c.isActive);

//       return matchesSearch && matchesStatus;
//     });

//     this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
//     this.page = Math.min(this.page, this.totalPages);
//     this.updatePage();
//   }

//   private updatePage() {
//     const start = (this.page - 1) * this.pageSize;
//     this.paged = this.filtered.slice(start, start + this.pageSize);
//   }

//   prevPage() {
//     if (this.page > 1) {
//       this.page--;
//       this.updatePage();
//     }
//   }

//   nextPage() {
//     if (this.page < this.totalPages) {
//       this.page++;
//       this.updatePage();
//     }
//   }

//   confirmDelete(client: any) {
//     const name = this.fullName(client);
//     if (!confirm(`متأكد إنك عايز تحذف "${name}"؟ الإجراء ده مش قابل للتراجع.`)) return;

//     this.deletingId = client._id;
//     this.svc.delete(client._id).subscribe({
//       next: () => {
//         this.zone.run(() => {
//           this.clients = this.clients.filter((c) => c._id !== client._id);
//           this.deletingId = null;
//           this.applyFilters();
//           this.cdr.detectChanges();
//         });
//       },
//       error: (err: any) => {
//         this.zone.run(() => {
//           this.deletingId = null;
//           this.cdr.detectChanges();
//           alert(err?.error?.message || 'تعذّر حذف العميل');
//         });
//       },
//     });
//   }

//   fullName(u: any): string {
//     return u?.name || `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || u?.email || '-';
//   }

//   initial(u: any): string {
//     return this.fullName(u).charAt(0).toUpperCase();
//   }
// }
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientsService } from '../../../core/services/index';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './client-list.component.html',
})
export class ClientListComponent implements OnInit {
  clients: any[] = [];
  filtered: any[] = [];
  paged: any[] = [];

  loading = false;
  loadError = false;

  search = '';
  statusFilter = '';

  page = 1;
  pageSize = 10;
  totalPages = 1;

  deletingId: string | null = null;

  constructor(
    private svc: ClientsService, // كان UsersService غلط: بيرجع User._id
    // مش Client._id، وده كان بيكسر رابط /clients/:id مع القضايا
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.loadError = false;
    // ClientsService.getAll() -> GET /clients (Client model، مش /users?role=client)
    this.svc.getAll({ page: 1, limit: 100 }).subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          this.clients = res?.data?.clients
            ?? res?.data?.data
            ?? (Array.isArray(res?.data) ? res.data : null)
            ?? res?.clients
            ?? (Array.isArray(res) ? res : [])
            ?? [];

          this.applyFilters();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.clients = [];
          this.applyFilters();
          this.loadError = true;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  onSearch() {
    this.page = 1;
    this.applyFilters();
  }

  private applyFilters() {
    const q = this.search.trim().toLowerCase();

    this.filtered = this.clients.filter((c) => {
      const matchesSearch =
        !q ||
        this.fullName(c).toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q);

      const matchesStatus =
        !this.statusFilter ||
        (this.statusFilter === 'active' && c.isActive) ||
        (this.statusFilter === 'inactive' && !c.isActive);

      return matchesSearch && matchesStatus;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    this.page = Math.min(this.page, this.totalPages);
    this.updatePage();
  }

  private updatePage() {
    const start = (this.page - 1) * this.pageSize;
    this.paged = this.filtered.slice(start, start + this.pageSize);
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.updatePage();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.updatePage();
    }
  }

  confirmDelete(client: any) {
    const name = this.fullName(client);
    if (!confirm(`متأكد إنك عايز تحذف "${name}"؟ الإجراء ده مش قابل للتراجع.`)) return;

    this.deletingId = client._id;
    // ملاحظة: ClientsService الحالي عنده getAll/getById بس (زي ما ظاهر في الكود
    // اللي بعتّه). لو مفيش delete() فيه، لازم تضيفه في الـ service الأول:
    // delete(id: string) { return this.http.delete(`${API}/clients/${id}`); }
    (this.svc as any).delete(client._id).subscribe({
      next: () => {
        this.zone.run(() => {
          this.clients = this.clients.filter((c) => c._id !== client._id);
          this.deletingId = null;
          this.applyFilters();
          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          this.deletingId = null;
          this.cdr.detectChanges();
          alert(err?.error?.message || 'تعذّر حذف العميل');
        });
      },
    });
  }

  fullName(c: any): string {
    // Client model بيستخدم fullName/companyName، مش firstName/lastName
    return c?.fullName || c?.companyName || c?.email || '-';
  }

  initial(c: any): string {
    return this.fullName(c).charAt(0).toUpperCase();
  }
}