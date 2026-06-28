import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = `${environment.apiUrl}/auth`;
  currentUser = signal<User | null>(this.getStoredUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(body: LoginRequest) {
    return this.http.post<any>(`${this.BASE}/login`, body).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(body: RegisterRequest) {
    return this.http.post<any>(`${this.BASE}/register`, body);
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.BASE}/forgot-password`, { email });
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post(`${this.BASE}/verify-reset-otp`, { email, otp });
  }

  resetPassword(email: string, otp: string, password: string) {
    return this.http.post(`${this.BASE}/reset-password`, { email, otp, newPassword: password });
  }

  refreshToken() {
    const token = localStorage.getItem('refreshToken');
    return this.http.post<any>(`${this.BASE}/refresh-token`, { refreshToken: token }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout() {
    localStorage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken() { return localStorage.getItem('accessToken'); }
  isLoggedIn() { return !!this.getAccessToken(); }
  hasRole(...roles: string[]) { return roles.includes(this.currentUser()?.role ?? ''); }

  // اسم المستخدم الكامل (يدعم name أو firstName+lastName)
  getUserName(): string {
    const u = this.currentUser();
    if (!u) return '';
    if ((u as any).name) return (u as any).name;
    const first = (u as any).firstName || '';
    const last = (u as any).lastName || '';
    return `${first} ${last}`.trim();
  }

  private saveSession(res: any) {
    // يدعم: { data: { accessToken, refreshToken, user } } أو { accessToken, refreshToken, user }
    const data = res?.data || res;
    const accessToken = data?.accessToken;
    const refreshToken = data?.refreshToken;
    const rawUser = data?.user;

    if (!accessToken) return;

    // نوحّد شكل الـ user: نضيف name لو مش موجود
    const user = rawUser ? {
      ...rawUser,
      name: rawUser.name || `${rawUser.firstName || ''} ${rawUser.lastName || ''}`.trim()
    } : null;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken || '');
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getStoredUser(): User | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  }
}