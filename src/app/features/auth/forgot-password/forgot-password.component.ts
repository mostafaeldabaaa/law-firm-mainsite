import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div dir="rtl" class="auth-page relative min-h-screen flex items-center justify-center bg-[#0f1d33] px-5 py-12 overflow-hidden">

      <!-- زخرفة خلفية هادية، بنفس روح صفحة الدخول -->
      <div class="absolute -top-16 -right-16 w-72 h-72 bg-amber-400/10 rounded-full blur-2xl blob-float"></div>
      <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-400/10 rounded-full blur-2xl blob-float" style="--delay:1.4s"></div>

      <div class="auth-card relative w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-black/30 px-8 py-10 text-center">

        <img src="/assets/images/logo.png" alt="محسن عبدالله للمحاماة"
             class="auth-item h-14 w-14 object-contain mx-auto mb-4" style="--d:0s" />

        <p class="auth-item text-amber-600 text-[11px] font-semibold tracking-[0.18em] mb-2" style="--d:.08s">
          MOHSEN ABDULLAH LAW FIRM
        </p>

        <h1 class="auth-item text-base font-bold text-[#0f1d33] mb-1" style="--d:.14s">استعادة كلمة المرور</h1>

        <!-- مؤشر الخطوات -->
        <div class="auth-item flex items-center justify-center gap-2 mb-7" style="--d:.2s">
          <div class="step-dot" [class.active]="step() >= 1" [class.done]="step() > 1"></div>
          <div class="step-line" [class.active]="step() > 1"></div>
          <div class="step-dot" [class.active]="step() >= 2" [class.done]="step() > 2"></div>
          <div class="step-line" [class.active]="step() > 2"></div>
          <div class="step-dot" [class.active]="step() >= 3"></div>
        </div>

        <!-- Step 1: Email -->
        <ng-container *ngIf="step() === 1 && !success()">
          <p class="auth-item text-gray-400 text-xs mb-6" style="--d:.26s">أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق (OTP)</p>
          <div class="auth-item text-right mb-6" style="--d:.32s">
            <label class="block text-xs font-medium text-gray-500 mb-1.5">البريد الإلكتروني</label>
            <input type="email" dir="ltr" name="email" [(ngModel)]="email" placeholder="email@example.com"
                   class="w-full px-3.5 py-2.5 text-sm text-left border border-gray-200 rounded-xl outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15" />
          </div>
          <button (click)="sendOtp()" [disabled]="loading()"
                  class="auth-item btn-glow w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed text-[#0f1d33] font-semibold text-sm py-3 rounded-full transition-colors"
                  style="--d:.38s">
            {{ loading() ? 'جاري الإرسال...' : 'إرسال الرمز' }}
          </button>
        </ng-container>

        <!-- Step 2: OTP -->
        <ng-container *ngIf="step() === 2 && !success()">
          <p class="auth-item text-gray-400 text-xs mb-6" style="--d:.26s">
            أدخل الرمز المرسل إلى<br />
            <span dir="ltr" class="font-medium text-[#0f1d33] inline-block mt-0.5">{{ email }}</span>
          </p>
          <div class="auth-item text-right mb-6" style="--d:.32s">
            <label class="block text-xs font-medium text-gray-500 mb-1.5">رمز التحقق</label>
            <input type="text" inputmode="numeric" dir="ltr" name="otp" [(ngModel)]="otp" placeholder="000000" maxlength="6"
                   class="w-full px-3.5 py-2.5 text-center tracking-[0.5em] text-lg font-semibold border border-gray-200 rounded-xl outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15" />
          </div>
          <button (click)="verifyOtp()" [disabled]="loading()"
                  class="auth-item btn-glow w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed text-[#0f1d33] font-semibold text-sm py-3 rounded-full transition-colors"
                  style="--d:.38s">
            {{ loading() ? 'جاري التحقق...' : 'تحقق من الرمز' }}
          </button>
          <button (click)="backToEmail()" type="button"
                  class="auth-item mt-4 text-xs text-gray-400 hover:text-amber-600 transition-colors" style="--d:.44s">
            تغيير البريد الإلكتروني
          </button>
        </ng-container>

        <!-- Step 3: New Password -->
        <ng-container *ngIf="step() === 3 && !success()">
          <p class="auth-item text-gray-400 text-xs mb-6" style="--d:.26s">اختر كلمة مرور جديدة وقوية لحسابك</p>
          <div class="auth-item text-right mb-6" style="--d:.32s">
            <label class="block text-xs font-medium text-gray-500 mb-1.5">كلمة المرور الجديدة</label>
            <input type="password" dir="ltr" name="newPassword" [(ngModel)]="newPassword" (keyup.enter)="resetPassword()" placeholder="8 أحرف على الأقل"
                   class="w-full px-3.5 py-2.5 text-sm text-left border border-gray-200 rounded-xl outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15" />
          </div>
          <button (click)="resetPassword()" [disabled]="loading()"
                  class="auth-item btn-glow w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed text-[#0f1d33] font-semibold text-sm py-3 rounded-full transition-colors"
                  style="--d:.38s">
            {{ loading() ? 'جاري التحديث...' : 'تحديث كلمة المرور' }}
          </button>
        </ng-container>

        <!-- Error -->
        @if (error()) {
          <div class="error-msg bg-red-50 text-red-600 text-xs rounded-xl px-4 py-2.5 mt-5 text-right">
            {{ error() }}
          </div>
        }

        <!-- Success -->
        @if (success()) {
          <div class="auth-item" style="--d:.1s">
            <div class="success-icon mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <p class="text-sm font-semibold text-[#0f1d33] mb-1">تم تحديث كلمة المرور بنجاح</p>
            <p class="text-xs text-gray-400 mb-6">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
            <a routerLink="/auth/login"
               class="btn-glow inline-block w-full bg-amber-400 hover:bg-amber-300 text-[#0f1d33] font-semibold text-sm py-3 rounded-full transition-colors no-underline">
              تسجيل الدخول
            </a>
          </div>
        }

        @if (!success()) {
          <div class="auth-item mt-6 text-xs" style="--d:.5s">
            <a routerLink="/auth/login" class="text-gray-400 hover:text-amber-600 transition-colors">→ العودة لتسجيل الدخول</a>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;600;700;800&display=swap');

    :host {
      font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif;
    }

    .auth-item {
      opacity: 0;
      animation: fadeUp .7s cubic-bezier(.16, 1, .3, 1) both;
      animation-delay: var(--d, 0s);
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .auth-card {
      opacity: 0;
      animation: cardIn .5s cubic-bezier(.16, 1, .3, 1) both;
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(10px) scale(.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .error-msg {
      animation: fadeUp .35s cubic-bezier(.16, 1, .3, 1) both;
    }

    .btn-glow {
      transition: transform .25s ease, box-shadow .35s ease, background-color .25s ease;
    }
    .btn-glow:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px -8px rgba(251, 191, 36, .55);
    }
    .btn-glow:active:not(:disabled) {
      transform: translateY(0);
    }

    .blob-float {
      animation: floaty 7s ease-in-out infinite;
      animation-delay: var(--delay, 0s);
    }
    @keyframes floaty {
      0%, 100% { transform: translate(0, 0); }
      50%      { transform: translate(6px, -10px); }
    }

    /* مؤشر الخطوات */
    .step-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #e5e7eb;
      transition: background-color .3s ease, transform .3s ease;
    }
    .step-dot.active {
      background: #fbbf24;
      transform: scale(1.25);
    }
    .step-dot.done {
      background: #fbbf24;
      transform: scale(1);
    }
    .step-line {
      width: 24px;
      height: 2px;
      background: #e5e7eb;
      transition: background-color .3s ease;
    }
    .step-line.active {
      background: #fbbf24;
    }

    /* أيقونة النجاح */
    .success-icon {
      width: 52px;
      height: 52px;
      border-radius: 999px;
      background: #f0fdf4;
      color: #16a34a;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: successPop .45s cubic-bezier(.16, 1, .3, 1) both;
    }
    @keyframes successPop {
      from { opacity: 0; transform: scale(.6); }
      to   { opacity: 1; transform: scale(1); }
    }

    @media (prefers-reduced-motion: reduce) {
      .auth-item, .auth-card, .error-msg, .blob-float, .success-icon {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
      .btn-glow { transition: none !important; }
    }
  `]
})
export class ForgotPasswordComponent {
  // متغيرات عادية للفورم (مربوطة بـ ngModel)
  email = '';
  otp = '';
  newPassword = '';

  // Signals للحالة اللي بتتغير من جوه استجابة الـ HTTP async
  // (بتضمن تحديث الواجهة فورًا حتى لو المشروع شغال بنظام zoneless change detection)
  step = signal(1);
  loading = signal(false);
  error = signal('');
  success = signal(false);

  constructor(private auth: AuthService) {}

  backToEmail() {
    this.step.set(1);
    this.error.set('');
  }

  sendOtp() {
    if (!this.email) { this.error.set('يرجى إدخال البريد الإلكتروني'); return; }
    this.loading.set(true);
    this.error.set('');
    this.auth.forgotPassword(this.email)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.step.set(2),
        error: err => this.error.set(this.extractError(err))
      });
  }

  verifyOtp() {
    if (!this.otp || this.otp.length < 6) { this.error.set('يرجى إدخال رمز مكوّن من 6 أرقام'); return; }
    this.loading.set(true);
    this.error.set('');
    this.auth.verifyOtp(this.email, this.otp)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.step.set(3),
        error: err => this.error.set(err?.status ? 'الرمز غير صحيح، حاول مرة أخرى' : this.extractError(err))
      });
  }

  resetPassword() {
    if (!this.newPassword || this.newPassword.length < 8) { this.error.set('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return; }
    this.loading.set(true);
    this.error.set('');
    this.auth.resetPassword(this.email, this.otp, this.newPassword)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.success.set(true),
        error: err => this.error.set(this.extractError(err))
      });
  }

  private extractError(err: any): string {
    if (err?.status === 0) return 'تعذر الاتصال بالخادم، تأكد من اتصالك بالإنترنت أو حاول لاحقًا';
    return err?.error?.message || 'حدث خطأ، حاول مرة أخرى';
  }
}