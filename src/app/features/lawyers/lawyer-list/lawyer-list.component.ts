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

  private readonly ROLE_COLORS: Record<string, string> = {
    lawyer: 'bg-blue-500/10 text-blue-400',
    senior_lawyer: 'bg-[#d4af37]/10 text-[#d4af37]',
    branch_manager: 'bg-purple-500/10 text-purple-400',
    super_admin: 'bg-rose-500/10 text-rose-400',
    secretary: 'bg-emerald-500/10 text-emerald-400',
  };

  constructor(
    private svc: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loading = true;
    this.svc.getLawyers().subscribe({
      next: res => {
        // شكل الريسبونس الحقيقي: { success, message, data: { lawyers: [...] }, meta }
        // الـ UsersService.getLawyers() متعرّف بـ return type بيقول data: any[]،
        // لكن الريسبونس الفعلي بيرجّع data.lawyers (object فيه array)، فبنعمل cast صريح
        // كـ any هنا عشان نقرا الشكل الحقيقي من غير ما نتصادم مع تعريف الـ type.
        const raw = res as any;
        let list = extractList(raw);
        if (!Array.isArray(list) || list.length === 0) {
          list = raw?.data?.lawyers || raw?.lawyers || [];
        }
        this.lawyers = list;
        this.filtered = [...this.lawyers];
        this.loading = false;
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

  // البيانات الحقيقية للمحامي راجعة على شكل { user: { firstName, lastName, email, phone, role }, ... }
  // الدوال دي بتغلّف الوصول لـ user عشان نتعامل مع أكتر من شكل ممكن يرجع من الـ API
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
    // لو isActive مش موجودة في الـ response، بنرجع لـ isAvailable كبديل منطقي
    if (typeof l?.isActive === 'boolean') return l.isActive;
    if (typeof l?.isAvailable === 'boolean') return l.isAvailable;
    return false;
  }

  roleLabel(r: string): string {
    return this.ROLE_LABELS[r] || r || '-';
  }

  roleColor(r: string): string {
    return this.ROLE_COLORS[r] || 'bg-slate-400/10 text-slate-300';
  }
}