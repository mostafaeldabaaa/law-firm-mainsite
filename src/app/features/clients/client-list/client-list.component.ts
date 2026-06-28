import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/index';
import { extractList } from '../../../core/services/api-helper';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header"><h1>👥 العملاء</h1></div>
      <div class="filters">
        <input type="search" [(ngModel)]="search" placeholder="بحث..." (input)="filterList()" />
      </div>
      <div class="loading" *ngIf="loading">جاري التحميل...</div>
      <div class="empty-state" *ngIf="!loading && filtered.length === 0"><div class="empty-icon">👥</div><p>لا يوجد عملاء</p></div>
      <div class="grid" *ngIf="!loading && filtered.length > 0">
        <div class="client-card" *ngFor="let c of filtered" [routerLink]="['/clients', c._id]">
          <div class="avatar">{{ (getName(c)).charAt(0) }}</div>
          <div class="info">
            <div class="name">{{ getName(c) }}</div>
            <div class="email">{{ c.email }}</div>
            <div class="phone" *ngIf="c.phone">📞 {{ c.phone }}</div>
          </div>
          <span class="badge" [class.active]="c.isActive">{{ c.isActive ? 'نشط' : 'غير نشط' }}</span>
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
    .client-card { display: flex; align-items: center; gap: 14px; background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); cursor: pointer; transition: box-shadow 0.2s; &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); } }
    .avatar { width: 44px; height: 44px; border-radius: 50%; background: #1a2744; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; }
    .info { flex: 1; .name { font-size: 15px; font-weight: 600; color: #2d3748; } .email { font-size: 13px; color: #718096; margin-top: 2px; } .phone { font-size: 12px; color: #718096; margin-top: 2px; } }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; background: #fff5f5; color: #c53030; &.active { background: #f0fff4; color: #276749; } }
  `]
})
export class ClientListComponent implements OnInit {
  clients: any[] = []; filtered: any[] = [];
  loading = false; search = '';
  constructor(private svc: UsersService) {}
  ngOnInit() {
    this.loading = true;
    this.svc.getClients().subscribe({
      next: res => { this.clients = extractList(res); this.filtered = [...this.clients]; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
  filterList() {
    const q = this.search.toLowerCase();
    this.filtered = this.clients.filter(c => this.getName(c).toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
  }
  getName(u: any) { return u?.name || `${u?.firstName||''} ${u?.lastName||''}`.trim() || u?.email || '-'; }
}
