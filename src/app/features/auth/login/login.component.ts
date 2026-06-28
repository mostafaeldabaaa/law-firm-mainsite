import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">⚖️</div>
        <h1>نظام إدارة مكتب المحاماة</h1>
        <p class="subtitle">تسجيل الدخول</p>

        <div class="error-msg" *ngIf="error">{{ error }}</div>

        <div class="form-group">
          <label>البريد الإلكتروني</label>
          <input type="email" [(ngModel)]="email" placeholder="email@example.com" />
        </div>
        <div class="form-group">
          <label>كلمة المرور</label>
          <input type="password" [(ngModel)]="password" (keyup.enter)="login()" placeholder="••••••••" />
        </div>

        <button class="btn-primary" (click)="login()" [disabled]="loading">
          {{ loading ? 'جاري الدخول...' : 'دخول' }}
        </button>

        <div class="auth-links">
          <a routerLink="/auth/forgot-password">نسيت كلمة المرور؟</a>
          <a routerLink="/auth/register">إنشاء حساب عميل</a>
        </div>

        <div class="demo-creds">
          <strong>بيانات تجريبية:</strong><br>
          admin&#64;lawfirm.com / Admin&#64;12345
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1a2744 0%, #2d4a8a 100%);
      font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl;
    }
    .auth-card {
      background: #fff; border-radius: 16px; padding: 40px;
      width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    .auth-logo { font-size: 48px; margin-bottom: 12px; }
    h1 { font-size: 18px; font-weight: 700; color: #1a2744; margin: 0 0 6px; }
    .subtitle { color: #718096; font-size: 14px; margin-bottom: 24px; }
    .error-msg { background: #fff5f5; color: #c53030; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .form-group { margin-bottom: 16px; text-align: right; }
    label { display: block; font-size: 13px; font-weight: 500; color: #4a5568; margin-bottom: 6px; }
    input {
      width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 14px; outline: none; box-sizing: border-box; text-align: right;
      &:focus { border-color: #2d4a8a; }
    }
    .btn-primary {
      width: 100%; padding: 12px; background: #1a2744; color: #fff; border: none;
      border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px;
      &:hover:not(:disabled) { background: #2d4a8a; }
      &:disabled { opacity: 0.7; cursor: not-allowed; }
    }
    .auth-links { display: flex; justify-content: space-between; margin-top: 16px; a { font-size: 13px; color: #2d4a8a; text-decoration: none; } }
    .demo-creds { margin-top: 20px; padding: 12px; background: #f7fafc; border-radius: 8px; font-size: 12px; color: #718096; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.email || !this.password) { this.error = 'يرجى إدخال البريد الإلكتروني وكلمة المرور'; return; }
    this.loading = true;
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => { this.error = err?.error?.message || 'خطأ في تسجيل الدخول'; this.loading = false; }
    });
  }
}
