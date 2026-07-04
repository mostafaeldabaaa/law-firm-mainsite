// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { CasesService } from '../../../core/services/cases.service';
// import { UsersService, ClientsService } from '../../../core/services/index';

// @Component({
//   selector: 'app-case-form',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   template: `
//     <div class="page" dir="rtl">
//       <div class="back"><a routerLink="/cases">← العودة</a></div>
//       <div class="card">
//         <h1>{{ isEdit ? 'تعديل القضية' : 'إنشاء قضية جديدة' }}</h1>
//         <div class="error-msg" *ngIf="error">{{ error }}</div>

//         <div class="form-grid">
//           <div class="form-group full">
//             <label>عنوان القضية *</label>
//             <input type="text" [(ngModel)]="form.title" placeholder="أدخل عنوان القضية" />
//           </div>
//           <div class="form-group">
//             <label>العميل *</label>
//             <select [(ngModel)]="form.clientId">
//               <option value="">اختر العميل</option>
//               <option *ngFor="let c of clients" [value]="c._id">
//                 {{ c.type === 'company' && c.companyName ? c.companyName : c.fullName }}
//               </option>
//             </select>
//           </div>
//           <div class="form-group">
//             <label>المحامي المسؤول *</label>
//             <select [(ngModel)]="form.leadLawyerId">
//               <option value="">اختر المحامي</option>
//               <option *ngFor="let l of lawyers" [value]="l._id">
//                 {{ l.user?.firstName }} {{ l.user?.lastName }}
//               </option>
//             </select>
//           </div>
//           <div class="form-group full">
//             <label>وصف القضية</label>
//             <textarea [(ngModel)]="form.description" rows="4" placeholder="أدخل وصف القضية..."></textarea>
//           </div>
//         </div>

//         <div class="form-actions">
//           <button class="btn-primary" (click)="submit()" [disabled]="loading">
//             {{ loading ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'إنشاء القضية') }}
//           </button>
//           <a routerLink="/cases" class="btn-cancel">إلغاء</a>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
//     .back a { color: #3182ce; text-decoration: none; font-size: 14px; display: inline-block; margin-bottom: 16px; }
//     .card { background: #fff; border-radius: 12px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
//     h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0 0 20px; }
//     .error-msg { background: #fff5f5; color: #c53030; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
//     .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
//     .form-group { display: flex; flex-direction: column; gap: 6px; &.full { grid-column: 1 / -1; } label { font-size: 13px; font-weight: 500; color: #4a5568; } }
//     input, select, textarea { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; resize: vertical; &:focus { border-color: #2d4a8a; } }
//     .form-actions { display: flex; gap: 12px; margin-top: 20px; }
//     .btn-primary { padding: 11px 24px; background: #1a2744; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; &:disabled { opacity: 0.7; } }
//     .btn-cancel { padding: 11px 24px; border: 1px solid #e2e8f0; color: #4a5568; border-radius: 8px; text-decoration: none; font-size: 14px; }
//     @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
//   `]
// })
// export class CaseFormComponent implements OnInit {
//   form = { title: '', clientId: '', leadLawyerId: '', description: '' };
//   clients: any[] = [];
//   lawyers: any[] = [];
//   loading = false;
//   error = '';
//   isEdit = false;
//   caseId = '';

//   constructor(
//     private svc: CasesService,
//     private clientsSvc: ClientsService,
//     private usersSvc: UsersService,
//     private route: ActivatedRoute,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.caseId = this.route.snapshot.paramMap.get('id') || '';
//     this.isEdit = !!this.caseId;

//     this.clientsSvc.getAll().subscribe({
//       next: res => { this.clients = (res as any).data?.clients || (res as any).data || []; }
//     });

//     this.usersSvc.getLawyers().subscribe({
//       next: res => { this.lawyers = (res as any).data?.lawyers || []; }
//     });

//     if (this.isEdit) {
//       this.svc.getById(this.caseId).subscribe({
//         next: res => {
//           const c = (res as any).data || res;
//           this.form.title = c.title;
//           this.form.description = c.description || '';
//           this.form.clientId = c.client?._id || '';
//           this.form.leadLawyerId = c.leadLawyer?._id || '';
//         }
//       });
//     }
//   }

//   submit() {
//     if (!this.form.title || !this.form.clientId || !this.form.leadLawyerId) {
//       this.error = 'يرجى تعبئة الحقول المطلوبة'; return;
//     }
//     this.loading = true; this.error = '';
//     const obs = this.isEdit
//       ? this.svc.update(this.caseId, this.form)
//       : this.svc.create(this.form);
//     obs.subscribe({
//       next: res => {
//         const id = (res as any)?.data?._id || this.caseId;
//         this.router.navigate(['/cases', id]);
//       },
//       error: err => { this.error = err?.error?.message || 'خطأ في الحفظ'; this.loading = false; }
//     });
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CasesService } from '../../../core/services/cases.service';
import { UsersService, ClientsService } from '../../../core/services/index';
import { extractList } from '../../../core/services/api-helper';

// أنواع القضايا (نص حر في الباك إند، لكن هنعرضها كـ select لتوحيد الإدخال)
const CASE_TYPES = ['مدني', 'تجاري', 'جنائي', 'أحوال شخصية', 'عمل', 'عقارات', 'إداري', 'أخرى'];

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './case-form.component.html',
})
export class CaseFormComponent implements OnInit {
  form = { title: '', clientId: '', leadLawyerId: '', caseType: '', description: '' };
  caseTypes = CASE_TYPES;
  clients: any[] = [];
  lawyers: any[] = [];
  loadingClients = true;
  loadingLawyers = true;
  loading = false;
  error = '';
  isEdit = false;
  caseId = '';

  constructor(
    private svc: CasesService,
    private usersSvc: UsersService,
    private clientsSvc: ClientsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.caseId = this.route.snapshot.paramMap.get('id') || '';
    this.isEdit = !!this.caseId;

    // ملحوظة: القضية بتتربط بـ Client document (فيه fullName)، مش
    // User account — عشان كده بنستخدم /clients هنا، مش /users?role=client.
    this.clientsSvc.getAll().subscribe({
      next: (res) => { this.clients = extractList(res); this.loadingClients = false; },
      error: () => { this.loadingClients = false; }
    });

    // /lawyers بيرجع Lawyer documents فعلاً (مش User)، فده صح زي ما هو.
    this.usersSvc.getLawyers().subscribe({
      next: (res) => { this.lawyers = extractList(res); this.loadingLawyers = false; },
      error: () => { this.loadingLawyers = false; }
    });

    if (this.isEdit) {
      this.svc.getById(this.caseId).subscribe({
        next: res => {
          const c = (res as any).data?.case || (res as any).data || res;
          this.form.title = c.title;
          this.form.description = c.description || '';
          this.form.caseType = c.caseType || '';
          this.form.clientId = c.client?._id || '';
          this.form.leadLawyerId = c.leadLawyer?._id || '';
        }
      });
    }
  }

  clientName(c: any): string {
    return c.companyName ? `${c.fullName} (${c.companyName})` : c.fullName;
  }

  lawyerName(l: any): string {
    const name = `${l.user?.firstName || ''} ${l.user?.lastName || ''}`.trim();
    return name || l.barNumber || 'محامٍ';
  }

  submit() {
    if (!this.form.title || !this.form.clientId || !this.form.leadLawyerId || !this.form.caseType) {
      this.error = 'يرجى تعبئة الحقول المطلوبة'; return;
    }
    this.loading = true; this.error = '';

    // أسماء الحقول هنا لازم تطابق اللي الباك إند مستنيها بالظبط:
    // client / leadLawyer / caseType — مش clientId / leadLawyerId.
    const payload = {
      title: this.form.title,
      description: this.form.description,
      caseType: this.form.caseType,
      client: this.form.clientId,
      leadLawyer: this.form.leadLawyerId,
    };

    const obs = this.isEdit
      ? this.svc.update(this.caseId, payload)
      : this.svc.create(payload);

    obs.subscribe({
      next: res => {
        const id = (res as any)?.data?.case?._id || (res as any)?.data?._id || this.caseId;
        this.router.navigate(['/cases', id]);
      },
      error: err => { this.error = err?.error?.message || 'خطأ في الحفظ'; this.loading = false; }
    });
  }
}