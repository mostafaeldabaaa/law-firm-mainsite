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
    <div dir="rtl" class="auth-page relative min-h-screen flex items-center justify-center font-sans bg-[#0f1d33] px-5 py-12 overflow-hidden">

      <!-- زخرفة خلفية هادية، بنفس روح صفحة الهوم -->
      <div class="absolute -top-16 -right-16 w-72 h-72 bg-amber-400/10 rounded-full blur-2xl blob-float"></div>
      <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-400/10 rounded-full blur-2xl blob-float" style="--delay:1.4s"></div>

      <div class="auth-card relative w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-black/30 px-8 py-10 text-center">

        <img src="/assets/images/logo.png" alt="محسن عبدالله للمحاماة"
             class="auth-item h-14 w-14 object-contain mx-auto mb-4" style="--d:0s" />

        <p class="auth-item text-amber-600 text-[11px] font-semibold tracking-[0.18em] mb-2" style="--d:.08s">
          MOHSEN ABDULLAH LAW FIRM
        </p>
        <p class="auth-item text-gray-400 text-xs mb-7" style="--d:.2s">سجّل الدخول للمتابعة إلى لوحة التحكم</p>

        @if (error) {
          <div class="error-msg bg-red-50 text-red-600 text-xs rounded-xl px-4 py-2.5 mb-5 text-right">
            {{ error }}
          </div>
        }

        <div class="auth-item text-right mb-4" style="--d:.26s">
          <label class="block text-xs font-medium text-gray-500 mb-1.5">البريد الإلكتروني</label>
          <input type="email" [(ngModel)]="email" placeholder="email@example.com"
                 class="w-full px-3.5 py-2.5 text-sm text-right border border-gray-200 rounded-xl outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15" />
        </div>

        <div class="auth-item text-right mb-6" style="--d:.32s">
          <label class="block text-xs font-medium text-gray-500 mb-1.5">كلمة المرور</label>
          <input type="password" [(ngModel)]="password" (keyup.enter)="login()" placeholder="••••••••"
                 class="w-full px-3.5 py-2.5 text-sm text-right border border-gray-200 rounded-xl outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15" />
        </div>

        <button (click)="login()" [disabled]="loading"
                class="auth-item btn-glow w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed text-[#0f1d33] font-semibold text-sm py-3 rounded-full transition-colors"
                style="--d:.38s">
          {{ loading ? 'جاري الدخول...' : 'دخول' }}
        </button>

        <div class="auth-item flex items-center justify-between mt-5 text-xs" style="--d:.44s">
          <a routerLink="/auth/forgot-password" class="text-amber-600 hover:text-amber-700 transition-colors">نسيت كلمة المرور؟</a>
        </div>

        <div class="auth-item mt-6 bg-gray-50 rounded-xl px-4 py-3 text-[11px] leading-relaxed text-gray-400" style="--d:.5s">
          
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-item {
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

    @media (prefers-reduced-motion: reduce) {
      .auth-item, .auth-card, .error-msg, .blob-float {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
      .btn-glow { transition: none !important; }
    }
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