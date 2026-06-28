import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../core/services/index';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header">
        <h1>🔔 الإشعارات</h1>
        <button class="btn-outline" (click)="markAllRead()">تحديد الكل كمقروء</button>
      </div>
      <div class="loading" *ngIf="loading">جاري التحميل...</div>
      <div class="list" *ngIf="!loading">
        <div class="notif-item" *ngFor="let n of notifications" [class.unread]="!n.isRead" (click)="markRead(n)">
          <div class="notif-icon" [class]="'type-' + n.type">{{ typeIcon(n.type) }}</div>
          <div class="notif-body">
            <div class="notif-title">{{ n.title }}</div>
            <div class="notif-msg">{{ n.message }}</div>
            <div class="notif-time">{{ n.createdAt | date:'dd/MM/yyyy HH:mm' }}</div>
          </div>
          <div class="unread-dot" *ngIf="!n.isRead"></div>
        </div>
        <div class="empty" *ngIf="notifications.length === 0">لا توجد إشعارات</div>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; } }
    .btn-outline { padding: 8px 16px; border: 1px solid #1a2744; color: #1a2744; background: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .list { display: flex; flex-direction: column; gap: 8px; }
    .notif-item { display: flex; align-items: flex-start; gap: 12px; background: #fff; border-radius: 10px; padding: 14px 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); cursor: pointer; position: relative; transition: box-shadow 0.2s; &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); } &.unread { border-right: 3px solid #3182ce; background: #f0f7ff; } }
    .notif-icon { font-size: 22px; flex-shrink: 0; }
    .notif-body { flex: 1; .notif-title { font-size: 14px; font-weight: 600; color: #2d3748; } .notif-msg { font-size: 13px; color: #4a5568; margin-top: 2px; } .notif-time { font-size: 12px; color: #a0aec0; margin-top: 4px; } }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #3182ce; flex-shrink: 0; margin-top: 4px; }
    .empty { text-align: center; padding: 60px; color: #a0aec0; font-size: 15px; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = []; loading = false;

  constructor(private svc: NotificationsService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: res => { this.notifications = (res as any).data || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  markRead(n: any) {
    if (n.isRead) return;
    this.svc.markRead(n._id).subscribe({ next: () => { n.isRead = true; }, error: () => {} });
  }

  markAllRead() {
    this.svc.markAllRead().subscribe({ next: () => { this.notifications.forEach(n => n.isRead = true); }, error: () => {} });
  }

  typeIcon(t: string) {
    const m: any = { info: 'ℹ️', warning: '⚠️', error: '❌', success: '✅' };
    return m[t] || '🔔';
  }
}
