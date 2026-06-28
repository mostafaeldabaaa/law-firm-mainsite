import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationsService } from '../../../core/services/index';
import { User } from '../../../core/models';
import { extractList } from '../../../core/services/api-helper'

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  sidebarCollapsed = false;
  userMenuOpen = false;
  unreadCount = 0;
  isRtl = true;
  user: User | null = null;

  constructor(
    private auth: AuthService,
    private notifService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.currentUser();
    this.loadNotifications();
  }

  get userInitial() { return this.user?.name?.charAt(0)?.toUpperCase() || '?'; }
  get isAdmin() { return this.auth.hasRole('super_admin', 'branch_manager'); }

  loadNotifications() {
    this.notifService.getAll().subscribe({
      next: res => {
        const notifications = extractList(res);
        this.unreadCount = notifications.filter((n: any) => !n.isRead).length;
      },
      error: () => {}
    });
  }

  onSearch(event: any) {
    const q = event.target.value.trim();
    if (q) this.router.navigate(['/search'], { queryParams: { q } });
  }

  logout() { this.auth.logout(); }
}