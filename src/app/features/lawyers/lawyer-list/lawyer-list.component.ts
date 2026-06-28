import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/index';
import { extractList } from '../../../core/services/api-helper';

@Component({
  selector: 'app-lawyer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header"><h1>👨‍⚖️ المحامون</h1></div>
      <div class="filters"><input type="search" [(ngModel)]="search" placeholder="بحث..." (input)="filter()" /></div>
      <div class="loading" *ngIf="loading">جاري التحميل...</div>
      <div class="empty-state" *ngIf="!loading && filtered.length === 0"><div class="empty-icon">👨‍⚖️</div><p>لا يوجد محامون</p></div>
      <div class="grid" *ngIf="!loading && filtered.length > 0">
        <div class="card" *ngFor="let l of filtered" [routerLink]="['/lawyers', l._id]">
          <div class="avatar">{{ getName(l).charAt(0) }}</div>
          <div class="info">
            <div class="name">{{ getName(l) }}</div>
            <div class="role">{{ roleLabel(l.role) }}</div>
            <div class="email">{{ l.email }}</div>
          </div>
          <span class="badge" [class.active]="l.isActive">{{ l.isActive ? 'نشط' : 'غير نشط' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; } }
    .filters { margin-bottom: 16px; input { padding: 9px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; min-width: 260px; } }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .empty-state { text-align: center; padding: 60px; color: #a0aec0; .empty-icon { font-size: 48px; margin-bottom: 12px; } }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
    .card { display: flex; align-items: center; gap: 14px; background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); cursor: pointer; transition: box-shadow 0.2s; &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); } }
    .avatar { width: 44px; height: 44px; border-radius: 50%; background: #2d4a8a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; }
    .info { flex: 1; .name { font-size: 15px; font-weight: 600; color: #2d3748; } .role { font-size: 12px; color: #3182ce; font-weight: 500; margin-top: 2px; } .email { font-size: 13px; color: #718096; margin-top: 2px; } }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; background: #fff5f5; color: #c53030; &.active { background: #f0fff4; color: #276749; } }
  `]
})
export class LawyerListComponent implements OnInit {
  lawyers: any[] = []; filtered: any[] = [];
  loading = false; search = '';
  constructor(private svc: UsersService) {}
  ngOnInit() {
    this.loading = true;
    this.svc.getLawyers().subscribe({
      next: res => { this.lawyers = extractList(res); this.filtered = [...this.lawyers]; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
  filter() {
    const q = this.search.toLowerCase();
    this.filtered = this.lawyers.filter(l => this.getName(l).toLowerCase().includes(q) || l.email?.toLowerCase().includes(q));
  }
  getName(u: any) { return u?.name || `${u?.firstName||''} ${u?.lastName||''}`.trim() || '-'; }
  roleLabel(r: string) {
    const m: any = { lawyer:'محامي', senior_lawyer:'محامي أول', branch_manager:'مدير فرع', super_admin:'مدير عام', secretary:'سكرتير' };
    return m[r] || r;
  }
}
