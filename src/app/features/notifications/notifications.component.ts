// notifications.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../core/services/index';

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  channel: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  relatedResource?: {
    resourceType: string;
    resourceId: string;
  };
}

const TYPE_ICONS: Record<AppNotification['type'], string> = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
};

const TYPE_STYLES: Record<AppNotification['type'], { bg: string; text: string }> = {
  info: { bg: 'bg-blue-50', text: 'text-blue-600' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-600' },
  error: { bg: 'bg-red-50', text: 'text-red-600' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  notifications = signal<AppNotification[]>([]);
  loading = signal(false);
  markingAllRead = signal(false);

  unreadCount = computed(() => this.notifications().filter((n) => !n.isRead).length);
  hasUnread = computed(() => this.unreadCount() > 0);

  constructor(private svc: NotificationsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (res: any) => {
        this.notifications.set(res?.data?.notifications ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  markRead(n: AppNotification): void {
    if (n.isRead) return;
    // تحديث متفائل (optimistic) فورًا، ثم rollback لو الطلب فشل
    this.notifications.update((list) =>
      list.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
    );
    this.svc.markRead(n._id).subscribe({
      error: () => {
        this.notifications.update((list) =>
          list.map((item) => (item._id === n._id ? { ...item, isRead: false } : item))
        );
      },
    });
  }

  markAllRead(): void {
    if (!this.hasUnread() || this.markingAllRead()) return;
    this.markingAllRead.set(true);
    const previous = this.notifications();
    this.notifications.update((list) => list.map((item) => ({ ...item, isRead: true })));

    this.svc.markAllRead().subscribe({
      next: () => this.markingAllRead.set(false),
      error: () => {
        this.notifications.set(previous);
        this.markingAllRead.set(false);
      },
    });
  }

  typeIcon(type: string): string {
    return TYPE_ICONS[type as AppNotification['type']] ?? '🔔';
  }

  typeBg(type: string): string {
    return TYPE_STYLES[type as AppNotification['type']]?.bg ?? 'bg-gray-50';
  }

  typeText(type: string): string {
    return TYPE_STYLES[type as AppNotification['type']]?.text ?? 'text-gray-500';
  }

  trackById(_: number, item: AppNotification): string {
    return item._id;
  }
}