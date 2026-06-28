import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">🔐</div>
        <h1>استعادة كلمة المرور</h1>

        <!-- Step 1: Email -->
        <ng-container *ngIf="step === 1">
          <p class="hint">سنرسل لك رمز OTP على بريدك الإلكتروني</p>
          <div class="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" [(ngModel)]="email" placeholder="email@example.com" />
          </div>
          <button class="btn-primary" (click)="sendOtp()" [disabled]="loading">{{ loading ? 'إرسال...' : 'إرسال الرمز' }}</button>
        </ng-container>

        <!-- Step 2: OTP -->
        <ng-container *ngIf="step === 2">
          <p class="hint">أدخل الرمز المرسل إلى {{ email }}</p>
          <div class="form-group">
            <label>رمز OTP</label>
            <input type="text" [(ngModel)]="otp" placeholder="6 أرقام" maxlength="6" />
          </div>
          <button class="btn-primary" (click)="verifyOtp()" [disabled]="loading">{{ loading ? 'تحقق...' : 'تحقق من الرمز' }}</button>
        </ng-container>

        <!-- Step 3: New Password -->
        <ng-container *ngIf="step === 3">
          <div class="form-group">
            <label>كلمة المرور الجديدة</label>
            <input type="password" [(ngModel)]="newPassword" placeholder="8 أحرف على الأقل" />
          </div>
          <button class="btn-primary" (click)="resetPassword()" [disabled]="loading">{{ loading ? 'جاري التحديث...' : 'تحديث كلمة المرور' }}</button>
        </ng-container>

        <div class="error-msg" *ngIf="error">{{ error }}</div>
        <div class="success-msg" *ngIf="success">تم تحديث كلمة المرور! <a routerLink="/auth/login">تسجيل الدخول</a></div>

        <div class="auth-link"><a routerLink="/auth/login">← العودة لتسجيل الدخول</a></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a2744 0%, #2d4a8a 100%); direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .auth-card { background: #fff; border-radius: 16px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; }
    .auth-logo { font-size: 48px; margin-bottom: 12px; }
    h1 { font-size: 18px; font-weight: 700; color: #1a2744; margin: 0 0 8px; }
    .hint { color: #718096; font-size: 13px; margin-bottom: 20px; }
    .form-group { margin-bottom: 14px; text-align: right; label { display: block; font-size: 13px; font-weight: 500; color: #4a5568; margin-bottom: 5px; } }
    input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; text-align: right; &:focus { border-color: #2d4a8a; } }
    .btn-primary { width: 100%; padding: 12px; background: #1a2744; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; &:disabled { opacity: 0.7; } }
    .error-msg { background: #fff5f5; color: #c53030; padding: 10px; border-radius: 8px; font-size: 13px; margin-top: 12px; }
    .success-msg { background: #f0fff4; color: #276749; padding: 10px; border-radius: 8px; font-size: 13px; margin-top: 12px; a { color: #276749; } }
    .auth-link { margin-top: 16px; a { font-size: 13px; color: #2d4a8a; text-decoration: none; } }
  `]
})
export class ForgotPasswordComponent {
  step = 1;
  email = ''; otp = ''; newPassword = '';
  loading = false; error = ''; success = false;

  constructor(private auth: AuthService) {}

  sendOtp() {
    this.loading = true; this.error = '';
    this.auth.forgotPassword(this.email).subscribe({
      next: () => { this.step = 2; this.loading = false; },
      error: err => { this.error = err?.error?.message || 'خطأ'; this.loading = false; }
    });
  }

  verifyOtp() {
    this.loading = true; this.error = '';
    this.auth.verifyOtp(this.email, this.otp).subscribe({
      next: () => { this.step = 3; this.loading = false; },
      error: err => { this.error = 'الرمز غير صحيح'; this.loading = false; }
    });
  }

  resetPassword() {
    this.loading = true; this.error = '';
    this.auth.resetPassword(this.email, this.otp, this.newPassword).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: err => { this.error = err?.error?.message || 'خطأ'; this.loading = false; }
    });
  }
}
