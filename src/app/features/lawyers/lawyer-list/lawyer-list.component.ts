// import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { UsersService } from '../../../core/services/index';
// import { extractList } from '../../../core/services/api-helper';

// interface RoleTab {
//   value: string;
//   label: string;
// }

// @Component({
//   selector: 'app-lawyer-list',
//   standalone: true,
//   imports: [CommonModule, RouterModule, FormsModule],
//   templateUrl: './lawyer-list.component.html',
// })
// export class LawyerListComponent implements OnInit {

//   lawyers: any[] = [];
//   filtered: any[] = [];
//   loading = true;
//   search = '';
//   activeRole = 'all';

//   readonly roleTabs: RoleTab[] = [
//     { value: 'all', label: 'الكل' },
//     { value: 'lawyer', label: 'محامي' },
//     { value: 'senior_lawyer', label: 'محامي أول' },
//     { value: 'branch_manager', label: 'مدير فرع' },
//     { value: 'super_admin', label: 'مدير عام' },
//     { value: 'secretary', label: 'سكرتير' },
//   ];

//   private readonly ROLE_LABELS: Record<string, string> = {
//     lawyer: 'محامي',
//     senior_lawyer: 'محامي أول',
//     branch_manager: 'مدير فرع',
//     super_admin: 'مدير عام',
//     secretary: 'سكرتير',
//   };

//   private readonly ROLE_COLORS: Record<string, string> = {
//     lawyer: 'bg-blue-500/10 text-blue-400',
//     senior_lawyer: 'bg-[#d4af37]/10 text-[#d4af37]',
//     branch_manager: 'bg-purple-500/10 text-purple-400',
//     super_admin: 'bg-rose-500/10 text-rose-400',
//     secretary: 'bg-emerald-500/10 text-emerald-400',
//   };

//   constructor(
//     private svc: UsersService,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit() {
//     this.loading = true;
//     this.svc.getLawyers().subscribe({
//       next: res => {
//         // شكل الريسبونس الحقيقي: { success, message, data: { lawyers: [...] }, meta }
//         // الـ UsersService.getLawyers() متعرّف بـ return type بيقول data: any[]،
//         // لكن الريسبونس الفعلي بيرجّع data.lawyers (object فيه array)، فبنعمل cast صريح
//         // كـ any هنا عشان نقرا الشكل الحقيقي من غير ما نتصادم مع تعريف الـ type.
//         const raw = res as any;
//         let list = extractList(raw);
//         if (!Array.isArray(list) || list.length === 0) {
//           list = raw?.data?.lawyers || raw?.lawyers || [];
//         }
//         this.lawyers = list;
//         this.filtered = [...this.lawyers];
//         this.loading = false;
//         this.cdr.detectChanges();
//       },
//       error: () => {
//         this.lawyers = [];
//         this.filtered = [];
//         this.loading = false;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   setRole(role: string) {
//     this.activeRole = role;
//     this.filter();
//   }

//   filter() {
//     const q = this.search.trim().toLowerCase();
//     this.filtered = this.lawyers.filter(l => {
//       const matchesRole = this.activeRole === 'all' || this.getRole(l) === this.activeRole;
//       if (!matchesRole) return false;
//       if (!q) return true;
//       return (
//         this.getName(l).toLowerCase().includes(q) ||
//         this.getEmail(l).toLowerCase().includes(q) ||
//         this.getPhone(l).includes(q)
//       );
//     });
//   }

//   countByRole(role: string): number {
//     if (role === 'all') return this.lawyers.length;
//     return this.lawyers.filter(l => this.getRole(l) === role).length;
//   }

//   // البيانات الحقيقية للمحامي راجعة على شكل { user: { firstName, lastName, email, phone, role }, ... }
//   // الدوال دي بتغلّف الوصول لـ user عشان نتعامل مع أكتر من شكل ممكن يرجع من الـ API
//   private getUser(l: any): any {
//     return l?.user || l || {};
//   }

//   getName(l: any): string {
//     const u = this.getUser(l);
//     return u?.name || `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || '-';
//   }

//   getEmail(l: any): string {
//     return this.getUser(l)?.email || '';
//   }

//   getPhone(l: any): string {
//     return this.getUser(l)?.phone || '';
//   }

//   getRole(l: any): string {
//     return this.getUser(l)?.role || '';
//   }

//   isActive(l: any): boolean {
//     // لو isActive مش موجودة في الـ response، بنرجع لـ isAvailable كبديل منطقي
//     if (typeof l?.isActive === 'boolean') return l.isActive;
//     if (typeof l?.isAvailable === 'boolean') return l.isAvailable;
//     return false;
//   }

//   roleLabel(r: string): string {
//     return this.ROLE_LABELS[r] || r || '-';
//   }

//   roleColor(r: string): string {
//     return this.ROLE_COLORS[r] || 'bg-slate-400/10 text-slate-300';
//   }
// }


import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/index';
import { extractList } from '../../../core/services/api-helper';

interface RoleTab {
  value: string;
  label: string;
}

@Component({
  selector: 'app-lawyer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './lawyer-list.component.html',
})
export class LawyerListComponent implements OnInit {

  lawyers: any[] = [];
  filtered: any[] = [];
  loading = true;
  search = '';
  activeRole = 'all';

  // إدارة المودال (إضافة/تعديل)
  showModal = false;
  modalError = '';
  saving = false;
  isEditMode = false;
  editingId = '';
  availableUsers: any[] = [];
  loadingUsers = false;

  form = {
    userId: '',
    barNumber: '',
    specialtiesText: '', // نص مفصول بفواصل، بنحوله لـ array وقت الإرسال
    yearsOfExperience: 0,
    hourlyRate: 0,
    bio: '',
    isAvailable: true,
  };

  readonly roleTabs: RoleTab[] = [
    { value: 'all', label: 'الكل' },
    { value: 'lawyer', label: 'محامي' },
    { value: 'senior_lawyer', label: 'محامي أول' },
    { value: 'branch_manager', label: 'مدير فرع' },
    { value: 'super_admin', label: 'مدير عام' },
    { value: 'secretary', label: 'سكرتير' },
  ];

  private readonly ROLE_LABELS: Record<string, string> = {
    lawyer: 'محامي',
    senior_lawyer: 'محامي أول',
    branch_manager: 'مدير فرع',
    super_admin: 'مدير عام',
    secretary: 'سكرتير',
  };

  constructor(
    private svc: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.getLawyers().subscribe({
      next: res => {
        this.lawyers = extractList(res);
        this.filtered = [...this.lawyers];
        this.loading = false;
        this.filter();
        this.cdr.detectChanges();
      },
      error: () => {
        this.lawyers = [];
        this.filtered = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setRole(role: string) {
    this.activeRole = role;
    this.filter();
  }

  filter() {
    const q = this.search.trim().toLowerCase();
    this.filtered = this.lawyers.filter(l => {
      const matchesRole = this.activeRole === 'all' || this.getRole(l) === this.activeRole;
      if (!matchesRole) return false;
      if (!q) return true;
      return (
        this.getName(l).toLowerCase().includes(q) ||
        this.getEmail(l).toLowerCase().includes(q) ||
        this.getPhone(l).includes(q)
      );
    });
  }

  countByRole(role: string): number {
    if (role === 'all') return this.lawyers.length;
    return this.lawyers.filter(l => this.getRole(l) === role).length;
  }

  private getUser(l: any): any {
    return l?.user || l || {};
  }

  getName(l: any): string {
    const u = this.getUser(l);
    return u?.name || `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || '-';
  }

  getEmail(l: any): string {
    return this.getUser(l)?.email || '';
  }

  getPhone(l: any): string {
    return this.getUser(l)?.phone || '';
  }

  getRole(l: any): string {
    return this.getUser(l)?.role || '';
  }

  isActive(l: any): boolean {
    if (typeof l?.isActive === 'boolean') return l.isActive;
    if (typeof l?.isAvailable === 'boolean') return l.isAvailable;
    return false;
  }

  roleLabel(r: string): string {
    return this.ROLE_LABELS[r] || r || '-';
  }

  // ══════════════════════════════════════════════════════════
  // إضافة / تعديل / حذف
  // ══════════════════════════════════════════════════════════

  openAddModal(): void {
    this.isEditMode = false;
    this.editingId = '';
    this.modalError = '';
    this.form = { userId: '', barNumber: '', specialtiesText: '', yearsOfExperience: 0, hourlyRate: 0, bio: '', isAvailable: true };
    this.showModal = true;

    // بنجيب كل المستخدمين ونستبعد العملاء بدل ما نعتمد على فلتر أدوار
    // متعددة (role=a,b,c) ممكن الباك إند مايدعمهوش أصلاً.
    this.loadingUsers = true;
    this.svc.getAll().subscribe({
      next: (res) => {
        this.availableUsers = extractList(res).filter((u) => u.role !== 'client');
        this.loadingUsers = false;
      },
      error: () => { this.loadingUsers = false; },
    });
  }

  openEditModal(l: any, event: Event): void {
    event.stopPropagation(); // منع فتح صفحة التفاصيل عند الضغط على تعديل
    this.isEditMode = true;
    this.editingId = l._id;
    this.modalError = '';
    this.form = {
      userId: this.getUser(l)?._id || '',
      barNumber: l.barNumber || '',
      specialtiesText: (l.specialties || []).join('، '),
      yearsOfExperience: l.yearsOfExperience || 0,
      hourlyRate: l.hourlyRate || 0,
      bio: l.bio || '',
      isAvailable: l.isAvailable ?? true,
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveLawyer(): void {
    this.modalError = '';

    if (!this.isEditMode && !this.form.userId) {
      this.modalError = 'يرجى اختيار المستخدم';
      return;
    }
    if (!this.form.barNumber.trim()) {
      this.modalError = 'رقم القيد بنقابة المحامين مطلوب';
      return;
    }

    const specialties = this.form.specialtiesText
      .split(/[،,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    this.saving = true;

    if (this.isEditMode) {
      const payload = {
        specialties,
        yearsOfExperience: this.form.yearsOfExperience,
        hourlyRate: this.form.hourlyRate,
        bio: this.form.bio,
        isAvailable: this.form.isAvailable,
      };
      this.svc.updateLawyer(this.editingId, payload).subscribe({
        next: () => { this.saving = false; this.showModal = false; this.load(); },
        error: (err) => { this.modalError = err?.error?.message || 'حدث خطأ أثناء الحفظ'; this.saving = false; },
      });
    } else {
      const payload = {
        user: this.form.userId,
        barNumber: this.form.barNumber,
        specialties,
        yearsOfExperience: this.form.yearsOfExperience,
        hourlyRate: this.form.hourlyRate,
        bio: this.form.bio,
      };
      this.svc.createLawyer(payload).subscribe({
        next: () => { this.saving = false; this.showModal = false; this.load(); },
        error: (err) => { this.modalError = err?.error?.message || 'حدث خطأ أثناء الإنشاء'; this.saving = false; },
      });
    }
  }

  deleteLawyer(l: any, event: Event): void {
    event.stopPropagation();
    const ok = confirm(`هل أنت متأكد من حذف ملف المحامي "${this.getName(l)}"؟`);
    if (!ok) return;

    this.svc.deleteLawyer(l._id).subscribe({
      next: () => { this.lawyers = this.lawyers.filter((x) => x._id !== l._id); this.filter(); },
      error: (err) => alert(err?.error?.message || 'حدث خطأ أثناء الحذف'),
    });
  }
}