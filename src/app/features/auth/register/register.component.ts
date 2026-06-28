import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">⚖️</div>
        <h1>إنشاء حساب عميل جديد</h1>

        <div class="error-msg" *ngIf="error">{{ error }}</div>
        <div class="success-msg" *ngIf="success">تم إنشاء الحساب بنجاح! <a routerLink="/auth/login">تسجيل الدخول</a></div>

        <div class="form-group">
          <label>الاسم الكامل</label>
          <input type="text" [(ngModel)]="name" placeholder="الاسم الكامل" />
        </div>
        <div class="form-group">
          <label>البريد الإلكتروني</label>
          <input type="email" [(ngModel)]="email" placeholder="email@example.com" />
        </div>
        <div class="form-group">
          <label>رقم الهاتف</label>
          <input type="tel" [(ngModel)]="phone" placeholder="01xxxxxxxxx" />
        </div>
        <div class="form-group">
          <label>كلمة المرور</label>
          <input type="password" [(ngModel)]="password" placeholder="8 أحرف على الأقل" />
        </div>

        <button class="btn-primary" (click)="register()" [disabled]="loading">
          {{ loading ? 'جاري الإنشاء...' : 'إنشاء الحساب' }}
        </button>
        <div class="auth-link"><a routerLink="/auth/login">لديك حساب بالفعل؟ تسجيل الدخول</a></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a2744 0%, #2d4a8a 100%); direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .auth-card { background: #fff; border-radius: 16px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; }
    .auth-logo { font-size: 48px; margin-bottom: 12px; }
    h1 { font-size: 18px; font-weight: 700; color: #1a2744; margin: 0 0 24px; }
    .error-msg { background: #fff5f5; color: #c53030; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .success-msg { background: #f0fff4; color: #276749; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; a { color: #276749; } }
    .form-group { margin-bottom: 14px; text-align: right; label { display: block; font-size: 13px; font-weight: 500; color: #4a5568; margin-bottom: 5px; } }
    input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; text-align: right; &:focus { border-color: #2d4a8a; } }
    .btn-primary { width: 100%; padding: 12px; background: #1a2744; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; &:hover:not(:disabled) { background: #2d4a8a; } &:disabled { opacity: 0.7; } }
    .auth-link { margin-top: 16px; a { font-size: 13px; color: #2d4a8a; text-decoration: none; } }
  `]
})
export class RegisterComponent {
  name = ''; email = ''; phone = ''; password = '';
  loading = false; error = ''; success = false;

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    if (!this.name || !this.email || !this.password) { this.error = 'يرجى تعبئة جميع الحقول المطلوبة'; return; }
    this.loading = true; this.error = '';
    this.auth.register({ name: this.name, email: this.email, phone: this.phone, password: this.password }).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: err => { this.error = err?.error?.message || 'خطأ في إنشاء الحساب'; this.loading = false; }
    });
  }
}
