import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/index';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header">
        <h1>🔧 إدارة المستخدمين</h1>
        <button class="btn-primary" (click)="showForm = !showForm">➕ مستخدم جديد</button>
      </div>

      <!-- Add User Form -->
      <div class="card" *ngIf="showForm">
        <h3>إضافة مستخدم جديد</h3>
        <div class="form-grid">
          <div class="form-group"><label>الاسم *</label><input type="text" [(ngModel)]="form.name" /></div>
          <div class="form-group"><label>البريد الإلكتروني *</label><input type="email" [(ngModel)]="form.email" /></div>
          <div class="form-group"><label>كلمة المرور *</label><input type="password" [(ngModel)]="form.password" /></div>
          <div class="form-group"><label>الدور *</label>
            <select [(ngModel)]="form.role">
              <option value="lawyer">محامي</option>
              <option value="senior_lawyer">محامي أول</option>
              <option value="secretary">سكرتير</option>
              <option value="branch_manager">مدير فرع</option>
              <option value="client">عميل</option>
            </select>
          </div>
          <div class="form-group"><label>رقم الهاتف</label><input type="tel" [(ngModel)]="form.phone" /></div>
        </div>
        <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        <div class="form-actions">
          <button class="btn-primary" (click)="addUser()" [disabled]="saving">{{ saving ? 'جاري الحفظ...' : 'حفظ' }}</button>
          <button class="btn-cancel" (click)="showForm = false">إلغاء</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <select [(ngModel)]="roleFilter" (ngModelChange)="load()">
          <option value="">كل الأدوار</option>
          <option value="super_admin">مدير عام</option>
          <option value="branch_manager">مدير فرع</option>
          <option value="senior_lawyer">محامي أول</option>
          <option value="lawyer">محامي</option>
          <option value="secretary">سكرتير</option>
          <option value="client">عميل</option>
        </select>
      </div>

      <div class="loading" *ngIf="loading">جاري التحميل...</div>
      <div class="table-wrap" *ngIf="!loading">
        <table>
          <thead><tr><th>الاسم</th><th>البريد الإلكتروني</th><th>الدور</th><th>الحالة</th><th>تاريخ الإنشاء</th><th>إجراءات</th></tr></thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td><span class="role-badge">{{ roleLabel(u.role) }}</span></td>
              <td><span class="badge" [class.active]="u.isActive">{{ u.isActive ? 'نشط' : 'غير نشط' }}</span></td>
              <td>{{ u.createdAt | date:'dd/MM/yyyy' }}</td>
              <td>
                <button class="icon-btn" (click)="toggleStatus(u)" [title]="u.isActive ? 'تعطيل' : 'تفعيل'">{{ u.isActive ? '🔴' : '🟢' }}</button>
              </td>
            </tr>
            <tr *ngIf="users.length === 0"><td colspan="6" class="empty">لا يوجد مستخدمون</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; } }
    .btn-primary { padding: 10px 20px; background: #1a2744; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; h3 { font-size: 15px; font-weight: 600; color: #1a2744; margin: 0 0 14px; } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; label { font-size: 13px; font-weight: 500; color: #4a5568; } }
    input, select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; }
    .error-msg { background: #fff5f5; color: #c53030; padding: 8px; border-radius: 8px; font-size: 13px; margin-top: 8px; }
    .form-actions { display: flex; gap: 10px; margin-top: 14px; }
    .btn-cancel { padding: 10px 20px; border: 1px solid #e2e8f0; color: #4a5568; border-radius: 8px; cursor: pointer; background: #fff; font-size: 14px; }
    .filters { margin-bottom: 16px; select { padding: 9px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; } }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: auto; }
    table { width: 100%; border-collapse: collapse; th { background: #f7fafc; padding: 12px 16px; text-align: right; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 1px solid #e2e8f0; } td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f7fafc; } tr:last-child td { border-bottom: none; } }
    .role-badge { padding: 2px 10px; background: #ebf8ff; color: #2b6cb0; border-radius: 10px; font-size: 12px; font-weight: 500; }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; background: #fff5f5; color: #c53030; &.active { background: #f0fff4; color: #276749; } }
    .icon-btn { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; }
    .empty { text-align: center; padding: 40px; color: #718096; }
  `]
})
export class UserListComponent implements OnInit {
  users: any[] = []; loading = false; roleFilter = '';
  showForm = false; saving = false; formError = '';
  form = { name: '', email: '', password: '', role: 'lawyer', phone: '' };

  constructor(private svc: UsersService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const params: any = {};
    if (this.roleFilter) params.role = this.roleFilter;
    this.svc.getAll(params).subscribe({
      next: res => { this.users = (res as any).data || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  addUser() {
    if (!this.form.name || !this.form.email || !this.form.password) { this.formError = 'يرجى تعبئة الحقول المطلوبة'; return; }
    this.saving = true; this.formError = '';
    this.svc.create(this.form).subscribe({
      next: () => { this.saving = false; this.showForm = false; this.form = { name: '', email: '', password: '', role: 'lawyer', phone: '' }; this.load(); },
      error: err => { this.formError = err?.error?.message || 'خطأ'; this.saving = false; }
    });
  }

  toggleStatus(u: any) {
    this.svc.update(u._id, { isActive: !u.isActive }).subscribe({
      next: () => { u.isActive = !u.isActive; },
      error: () => {}
    });
  }

  roleLabel(r: string) {
    const m: any = { super_admin: 'مدير عام', branch_manager: 'مدير فرع', senior_lawyer: 'محامي أول', lawyer: 'محامي', secretary: 'سكرتير', client: 'عميل' };
    return m[r] || r;
  }
}
