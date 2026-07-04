// import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { SessionsService, UsersService } from '../../../core/services/index';
// import { CasesService } from '../../../core/services/cases.service';

// @Component({
//   selector: 'app-session-list',
//   standalone: true,
//   encapsulation: ViewEncapsulation.None,
//   imports: [CommonModule, RouterModule, FormsModule],
//   template: `
//     <div class="sl-page" dir="rtl">

//       <!-- Header -->
//       <div class="sl-header">
//         <h1 class="sl-title">📅 جلسات المحكمة</h1>
//         <button class="sl-btn-primary" (click)="showForm = !showForm">➕ إضافة جلسة</button>
//       </div>

//       <!-- Add Form -->
//       <div class="sl-card" *ngIf="showForm">
//         <h3 class="sl-card-title">إضافة جلسة جديدة</h3>
//         <div class="sl-form-grid">

//           <div class="sl-field sl-field--full">
//             <label class="sl-label">عنوان الجلسة *</label>
//             <input type="text" [(ngModel)]="form.title" placeholder="مثال: جلسة نظر الدعوى" class="sl-input" />
//           </div>

//           <div class="sl-field">
//             <label class="sl-label">القضية *</label>
//             <select [(ngModel)]="form.caseId" class="sl-input">
//               <option value="">اختر القضية</option>
//               <option *ngFor="let c of cases" [value]="c._id">{{ c.caseNumber }} - {{ c.title }}</option>
//             </select>
//           </div>

//           <div class="sl-field">
//             <label class="sl-label">المحامي *</label>
//             <select [(ngModel)]="form.lawyerId" class="sl-input">
//               <option value="">اختر المحامي</option>
//               <option *ngFor="let l of lawyers" [value]="l._id">{{ getLawyerName(l) }}</option>
//             </select>
//           </div>

//           <div class="sl-field">
//             <label class="sl-label">نوع الجلسة</label>
//             <select [(ngModel)]="form.type" class="sl-input">
//               <option value="court_hearing">جلسة محكمة</option>
//               <option value="client_meeting">اجتماع عميل</option>
//               <option value="internal_review">مراجعة داخلية</option>
//               <option value="mediation">وساطة</option>
//             </select>
//           </div>

//           <div class="sl-field">
//             <label class="sl-label">التاريخ *</label>
//             <input type="date" [(ngModel)]="form.date" class="sl-input" />
//           </div>

//           <div class="sl-field">
//             <label class="sl-label">وقت البداية *</label>
//             <input type="time" [(ngModel)]="form.startTime" class="sl-input" />
//           </div>

//           <div class="sl-field">
//             <label class="sl-label">وقت النهاية *</label>
//             <input type="time" [(ngModel)]="form.endTime" class="sl-input" />
//           </div>

//           <div class="sl-field sl-field--full">
//             <label class="sl-label">المكان</label>
//             <input type="text" [(ngModel)]="form.location" placeholder="المحكمة / القاعة" class="sl-input" />
//           </div>

//           <div class="sl-field sl-field--full">
//             <label class="sl-label">ملاحظات</label>
//             <textarea [(ngModel)]="form.notes" rows="2" placeholder="أي ملاحظات إضافية..." class="sl-input sl-textarea"></textarea>
//           </div>

//         </div>

//         <div class="sl-error" *ngIf="formError">{{ formError }}</div>

//         <div class="sl-form-actions">
//           <button class="sl-btn-primary" (click)="addSession()" [disabled]="saving">
//             {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
//           </button>
//           <button class="sl-btn-cancel" (click)="showForm = false">إلغاء</button>
//         </div>
//       </div>

//       <!-- Filters -->
//       <div class="sl-filters">
//         <select [(ngModel)]="statusFilter" (ngModelChange)="load()" class="sl-input">
//           <option value="">كل الحالات</option>
//           <option value="scheduled">مجدولة</option>
//           <option value="completed">مكتملة</option>
//           <option value="cancelled">ملغاة</option>
//           <option value="rescheduled">مؤجَّلة</option>
//         </select>
//         <select [(ngModel)]="typeFilter" (ngModelChange)="load()" class="sl-input">
//           <option value="">كل الأنواع</option>
//           <option value="court_hearing">جلسة محكمة</option>
//           <option value="client_meeting">اجتماع عميل</option>
//           <option value="internal_review">مراجعة داخلية</option>
//           <option value="mediation">وساطة</option>
//         </select>
//       </div>

//       <!-- Skeleton Loading -->
//       <div class="sl-table-wrap" *ngIf="loading">
//         <table class="sl-table">
//           <thead>
//             <tr>
//               <th>التاريخ والوقت</th>
//               <th>القضية</th>
//               <th>النوع</th>
//               <th>المكان</th>
//               <th>المحامي</th>
//               <th>الحالة</th>
//               <th>ملاحظات</th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr *ngFor="let i of skeletonRows">
//               <td><div class="sl-sk sl-sk-w80"></div><div class="sl-sk sl-sk-w50" style="margin-top:6px"></div></td>
//               <td><div class="sl-sk sl-sk-w120"></div><div class="sl-sk sl-sk-w70" style="margin-top:6px"></div></td>
//               <td><div class="sl-sk sl-sk-pill sl-sk-w60"></div></td>
//               <td><div class="sl-sk sl-sk-w90"></div></td>
//               <td><div class="sl-sk sl-sk-w80"></div></td>
//               <td><div class="sl-sk sl-sk-pill sl-sk-w50"></div></td>
//               <td><div class="sl-sk sl-sk-w100"></div></td>
//               <td></td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       <!-- Empty -->
//       <div class="sl-empty" *ngIf="!loading && sessions.length === 0">
//         <div class="sl-empty-icon">📅</div>
//         <p>لا توجد جلسات</p>
//       </div>

//       <!-- Table -->
//       <div class="sl-table-wrap" *ngIf="!loading && sessions.length > 0">
//         <table class="sl-table">
//           <thead>
//             <tr>
//               <th>التاريخ والوقت</th>
//               <th>القضية</th>
//               <th>النوع</th>
//               <th>المكان</th>
//               <th>المحامي</th>
//               <th>الحالة</th>
//               <th>ملاحظات</th>
//               <th></th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr *ngFor="let s of sessions" [id]="'session-row-' + s._id" [class.sl-highlight]="highlightedSessionId === s._id">
//               <td>
//                 <div class="sl-date-main">{{ s.startTime | date:'EEE، d MMM y' }}</div>
//                 <div class="sl-date-sub">{{ s.startTime | date:'HH:mm' }} - {{ s.endTime | date:'HH:mm' }}</div>
//               </td>
//               <td>
//                 <div class="sl-case-title">{{ s.case?.title }}</div>
//                 <div class="sl-case-num">{{ s.case?.caseNumber }}</div>
//               </td>
//               <td>
//                 <span class="sl-badge" [ngClass]="'sl-type-' + s.type">{{ typeLabel(s.type) }}</span>
//               </td>
//               <td class="sl-location">
//                 <span *ngIf="s.location">📍 {{ s.location }}</span>
//                 <span *ngIf="!s.location" class="sl-muted">-</span>
//               </td>
//               <td>{{ getLawyerName(s.lawyer) }}</td>
//               <td>
//                 <span class="sl-badge sl-rounded" [ngClass]="'sl-status-' + s.status">{{ statusLabel(s.status) }}</span>
//                 <div *ngIf="s.status === 'rescheduled' && rescheduledMap[s._id]" class="sl-linked">
//                   <a (click)="scrollToSession(rescheduledMap[s._id]._id)">➡ الجلسة الجديدة: {{ rescheduledMap[s._id].startTime | date:'d MMM, HH:mm' }}</a>
//                 </div>
//               </td>
//               <td class="sl-notes">{{ s.notes || '-' }}</td>
//               <td>
//                 <div class="sl-actions">
//                   <button class="sl-btn-view" (click)="openDetails(s)" title="تفاصيل">👁</button>
//                   <ng-container *ngIf="s.status === 'scheduled'">
//                     <button class="sl-btn-edit" (click)="openReschedule(s)" title="تأجيل">🔄</button>
//                     <button class="sl-btn-complete" (click)="openComplete(s)" title="إكمال">✅</button>
//                     <button class="sl-btn-delete" (click)="openCancel(s)" title="إلغاء">✖</button>
//                   </ng-container>
//                 </div>
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       <!-- Details Modal -->
//       <div class="sl-modal-backdrop" *ngIf="detailsModal" (click)="closeDetails()">
//         <div class="sl-modal" (click)="$event.stopPropagation()">
//           <div class="sl-modal-header">
//             <h3 class="sl-modal-title">👁 تفاصيل الجلسة</h3>
//             <button class="sl-modal-close" (click)="closeDetails()">✕</button>
//           </div>

//           <div class="sl-details" *ngIf="detailsSession as s">
//             <div class="sl-details-row">
//               <span class="sl-details-label">العنوان</span>
//               <span class="sl-details-value">{{ s.title || '-' }}</span>
//             </div>
//             <div class="sl-details-row">
//               <span class="sl-details-label">القضية</span>
//               <span class="sl-details-value">{{ s.case?.title }} <span class="sl-muted" *ngIf="s.case?.caseNumber">({{ s.case?.caseNumber }})</span></span>
//             </div>
//             <div class="sl-details-row">
//               <span class="sl-details-label">المحامي</span>
//               <span class="sl-details-value">{{ getLawyerName(s.lawyer) }}</span>
//             </div>
//             <div class="sl-details-row">
//               <span class="sl-details-label">النوع</span>
//               <span class="sl-details-value">
//                 <span class="sl-badge" [ngClass]="'sl-type-' + s.type">{{ typeLabel(s.type) }}</span>
//               </span>
//             </div>
//             <div class="sl-details-row">
//               <span class="sl-details-label">الحالة</span>
//               <span class="sl-details-value">
//                 <span class="sl-badge sl-rounded" [ngClass]="'sl-status-' + s.status">{{ statusLabel(s.status) }}</span>
//               </span>
//             </div>
//             <div class="sl-details-row">
//               <span class="sl-details-label">التاريخ</span>
//               <span class="sl-details-value">{{ s.startTime | date:'EEE، d MMM y' }}</span>
//             </div>
//             <div class="sl-details-row">
//               <span class="sl-details-label">الوقت</span>
//               <span class="sl-details-value">{{ s.startTime | date:'HH:mm' }} - {{ s.endTime | date:'HH:mm' }}</span>
//             </div>
//             <div class="sl-details-row">
//               <span class="sl-details-label">المكان</span>
//               <span class="sl-details-value">{{ s.location || '-' }}</span>
//             </div>
//             <div class="sl-details-row" *ngIf="s.status === 'rescheduled' && rescheduledMap[s._id]">
//               <span class="sl-details-label">الجلسة الجديدة</span>
//               <span class="sl-details-value">
//                 <a (click)="closeDetails(); scrollToSession(rescheduledMap[s._id]._id)">➡ {{ rescheduledMap[s._id].startTime | date:'d MMM, HH:mm' }}</a>
//               </span>
//             </div>
//             <div class="sl-details-row" *ngIf="s.rescheduledFrom">
//               <span class="sl-details-label">مؤجَّلة من</span>
//               <span class="sl-details-value">{{ s.rescheduledFrom?.startTime ? (s.rescheduledFrom.startTime | date:'d MMM, HH:mm') : '-' }}</span>
//             </div>
//             <div class="sl-details-row sl-details-row--notes">
//               <span class="sl-details-label">ملاحظات</span>
//               <span class="sl-details-value">{{ s.notes || '-' }}</span>
//             </div>
//           </div>

//           <div class="sl-form-actions" style="margin-top:16px">
//             <button class="sl-btn-cancel" (click)="closeDetails()">إغلاق</button>
//           </div>
//         </div>
//       </div>

//       <!-- Reschedule Modal -->
//       <div class="sl-modal-backdrop" *ngIf="rescheduleModal" (click)="closeReschedule()">
//         <div class="sl-modal" (click)="$event.stopPropagation()">
//           <div class="sl-modal-header">
//             <h3 class="sl-modal-title">🔄 تأجيل الجلسة</h3>
//             <button class="sl-modal-close" (click)="closeReschedule()">✕</button>
//           </div>

//           <p class="sl-hint">
//             ⚠️ التأجيل هينشئ جلسة جديدة بنفس القضية والمحامي والعنوان في الميعاد الجديد،
//             وهتتحول الجلسة الحالية لحالة "مؤجَّلة" تلقائيًا.
//           </p>

//           <div class="sl-form-grid">
//             <div class="sl-field">
//               <label class="sl-label">التاريخ الجديد *</label>
//               <input type="date" [(ngModel)]="rescheduleForm.date" class="sl-input" />
//             </div>
//             <div class="sl-field">
//               <label class="sl-label">وقت البداية *</label>
//               <input type="time" [(ngModel)]="rescheduleForm.startTime" class="sl-input" />
//             </div>
//             <div class="sl-field">
//               <label class="sl-label">وقت النهاية *</label>
//               <input type="time" [(ngModel)]="rescheduleForm.endTime" class="sl-input" />
//             </div>
//             <div class="sl-field sl-field--full">
//               <label class="sl-label">المكان (اختياري)</label>
//               <input type="text" [(ngModel)]="rescheduleForm.location" class="sl-input" placeholder="اتركه فارغًا للإبقاء على نفس المكان" />
//             </div>
//           </div>

//           <div class="sl-error" *ngIf="rescheduleError">{{ rescheduleError }}</div>

//           <div class="sl-form-actions" style="margin-top:16px">
//             <button class="sl-btn-primary" (click)="submitReschedule()" [disabled]="rescheduleSaving">
//               {{ rescheduleSaving ? 'جاري التأجيل...' : 'تأكيد التأجيل' }}
//             </button>
//             <button class="sl-btn-cancel" (click)="closeReschedule()">إلغاء</button>
//           </div>
//         </div>
//       </div>

//       <!-- Complete Confirm Modal -->
//       <div class="sl-modal-backdrop" *ngIf="completeModal" (click)="closeComplete()">
//         <div class="sl-modal sl-modal--sm" (click)="$event.stopPropagation()">
//           <div class="sl-modal-header">
//             <h3 class="sl-modal-title">✅ إكمال الجلسة</h3>
//             <button class="sl-modal-close" (click)="closeComplete()">✕</button>
//           </div>

//           <p class="sl-hint">هل تريد تعليم هذه الجلسة كمكتملة؟</p>

//           <div class="sl-field">
//             <label class="sl-label">ملاحظات (اختياري)</label>
//             <textarea [(ngModel)]="completeNotes" rows="2" class="sl-input sl-textarea" placeholder="أي ملاحظات عن نتيجة الجلسة..."></textarea>
//           </div>

//           <div class="sl-error" *ngIf="completeError">{{ completeError }}</div>

//           <div class="sl-form-actions" style="margin-top:16px">
//             <button class="sl-btn-primary" (click)="submitComplete()" [disabled]="completeSaving">
//               {{ completeSaving ? 'جاري الحفظ...' : 'تأكيد الإكمال' }}
//             </button>
//             <button class="sl-btn-cancel" (click)="closeComplete()">تراجع</button>
//           </div>
//         </div>
//       </div>

//       <!-- Cancel Confirm Modal -->
//       <div class="sl-modal-backdrop" *ngIf="cancelModal" (click)="closeCancel()">
//         <div class="sl-modal sl-modal--sm" (click)="$event.stopPropagation()">
//           <div class="sl-modal-header">
//             <h3 class="sl-modal-title">✖ إلغاء الجلسة</h3>
//             <button class="sl-modal-close" (click)="closeCancel()">✕</button>
//           </div>

//           <p class="sl-hint">هل أنت متأكد من إلغاء هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.</p>

//           <div class="sl-error" *ngIf="cancelError">{{ cancelError }}</div>

//           <div class="sl-form-actions" style="margin-top:16px">
//             <button class="sl-btn-danger" (click)="submitCancel()" [disabled]="cancelSaving">
//               {{ cancelSaving ? 'جاري الإلغاء...' : 'تأكيد الإلغاء' }}
//             </button>
//             <button class="sl-btn-cancel" (click)="closeCancel()">تراجع</button>
//           </div>
//         </div>
//       </div>

//     </div>
//   `,
//   styles: [`
//     /* ===== Layout ===== */
//     .sl-page {
//       direction: rtl;
//       font-family: 'Segoe UI', Tahoma, sans-serif;
//       padding: 24px;
//       min-height: 100vh;
//       background: #f8fafc;
//     }

//     /* ===== Header ===== */
//     .sl-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       margin-bottom: 20px;
//     }
//     .sl-title {
//       font-size: 20px;
//       font-weight: 700;
//       color: #1e293b;
//       margin: 0;
//     }

//     /* ===== Buttons ===== */
//     .sl-btn-primary {
//       display: inline-flex;
//       align-items: center;
//       gap: 6px;
//       padding: 10px 20px;
//       background: #1e293b;
//       color: #fff;
//       border: none;
//       border-radius: 8px;
//       cursor: pointer;
//       font-size: 14px;
//       font-family: inherit;
//       transition: background 0.15s;
//     }
//     .sl-btn-primary:hover { background: #334155; }
//     .sl-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

//     .sl-btn-danger {
//       display: inline-flex;
//       align-items: center;
//       gap: 6px;
//       padding: 10px 20px;
//       background: #dc2626;
//       color: #fff;
//       border: none;
//       border-radius: 8px;
//       cursor: pointer;
//       font-size: 14px;
//       font-family: inherit;
//       transition: background 0.15s;
//     }
//     .sl-btn-danger:hover { background: #b91c1c; }
//     .sl-btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

//     .sl-btn-cancel {
//       display: inline-flex;
//       align-items: center;
//       padding: 10px 20px;
//       border: 1px solid #e2e8f0;
//       background: #fff;
//       color: #475569;
//       border-radius: 8px;
//       cursor: pointer;
//       font-size: 14px;
//       font-family: inherit;
//       transition: background 0.15s;
//     }
//     .sl-btn-cancel:hover { background: #f1f5f9; }

//     .sl-btn-delete {
//       background: none;
//       border: none;
//       cursor: pointer;
//       font-size: 16px;
//       color: #cbd5e1;
//       padding: 4px;
//       border-radius: 4px;
//       transition: color 0.15s;
//     }
//     .sl-btn-delete:hover { color: #ef4444; }

//     .sl-btn-complete {
//       background: none;
//       border: none;
//       cursor: pointer;
//       font-size: 15px;
//       padding: 4px;
//       border-radius: 4px;
//       color: #94a3b8;
//       transition: color 0.15s;
//     }
//     .sl-btn-complete:hover { color: #16a34a; }

//     .sl-btn-view {
//       background: none;
//       border: none;
//       cursor: pointer;
//       font-size: 15px;
//       padding: 4px;
//       border-radius: 4px;
//       color: #94a3b8;
//       transition: color 0.15s;
//     }
//     .sl-btn-view:hover { color: #2563eb; }

//     /* ===== Card ===== */
//     .sl-card {
//       background: #fff;
//       border-radius: 12px;
//       padding: 20px;
//       box-shadow: 0 1px 6px rgba(0,0,0,0.06);
//       border: 1px solid #f1f5f9;
//       margin-bottom: 16px;
//     }
//     .sl-card-title {
//       font-size: 14px;
//       font-weight: 600;
//       color: #1e293b;
//       margin: 0 0 16px;
//     }

//     /* ===== Form ===== */
//     .sl-form-grid {
//       display: grid;
//       grid-template-columns: 1fr 1fr;
//       gap: 14px;
//     }
//     .sl-field {
//       display: flex;
//       flex-direction: column;
//       gap: 5px;
//     }
//     .sl-field--full {
//       grid-column: 1 / -1;
//     }
//     .sl-label {
//       font-size: 12px;
//       font-weight: 500;
//       color: #64748b;
//     }
//     .sl-input {
//       padding: 9px 12px;
//       border: 1px solid #e2e8f0;
//       border-radius: 8px;
//       font-size: 14px;
//       font-family: inherit;
//       outline: none;
//       color: #1e293b;
//       background: #fff;
//       width: 100%;
//       box-sizing: border-box;
//       transition: border-color 0.15s;
//     }
//     .sl-input:focus { border-color: #94a3b8; }
//     .sl-textarea { resize: none; }

//     .sl-hint {
//       font-size: 13px;
//       color: #64748b;
//       background: #f8fafc;
//       border: 1px solid #e2e8f0;
//       border-radius: 8px;
//       padding: 10px 12px;
//       margin-bottom: 16px;
//       line-height: 1.6;
//     }

//     .sl-error {
//       margin-top: 10px;
//       background: #fef2f2;
//       color: #b91c1c;
//       border: 1px solid #fee2e2;
//       padding: 8px 12px;
//       border-radius: 8px;
//       font-size: 13px;
//     }
//     .sl-form-actions {
//       display: flex;
//       gap: 10px;
//       margin-top: 16px;
//     }

//     /* ===== Filters ===== */
//     .sl-filters {
//       display: flex;
//       gap: 12px;
//       margin-bottom: 16px;
//     }
//     .sl-filters .sl-input {
//       width: auto;
//     }

//     /* ===== States ===== */
//     .sl-empty {
//       text-align: center;
//       padding: 64px;
//       color: #94a3b8;
//     }
//     .sl-empty-icon { font-size: 48px; margin-bottom: 12px; }

//     /* ===== Table ===== */
//     .sl-table-wrap {
//       background: #fff;
//       border-radius: 12px;
//       box-shadow: 0 1px 6px rgba(0,0,0,0.06);
//       border: 1px solid #f1f5f9;
//       overflow: hidden;
//     }
//     .sl-table {
//       width: 100%;
//       border-collapse: collapse;
//     }
//     .sl-table thead tr {
//       background: #f8fafc;
//       border-bottom: 1px solid #e2e8f0;
//     }
//     .sl-table th {
//       text-align: right;
//       padding: 12px 16px;
//       font-size: 12px;
//       font-weight: 600;
//       color: #64748b;
//       white-space: nowrap;
//     }
//     .sl-table tbody tr {
//       border-bottom: 1px solid #f1f5f9;
//       transition: background 0.12s;
//     }
//     .sl-table tbody tr:last-child { border-bottom: none; }
//     .sl-table tbody tr:hover { background: #f8fafc; }
//     .sl-table td {
//       padding: 12px 16px;
//       font-size: 13px;
//       color: #475569;
//       vertical-align: middle;
//     }

//     /* ===== Cell helpers ===== */
//     .sl-date-main { font-weight: 500; color: #1e293b; font-size: 13px; }
//     .sl-date-sub  { font-size: 11px; color: #94a3b8; margin-top: 2px; }
//     .sl-case-title { font-weight: 500; color: #1e293b; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
//     .sl-case-num  { font-size: 11px; color: #94a3b8; margin-top: 2px; }
//     .sl-location  { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
//     .sl-notes     { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #94a3b8; }
//     .sl-muted     { color: #cbd5e1; }

//     /* ===== Badges ===== */
//     .sl-badge {
//       display: inline-flex;
//       align-items: center;
//       padding: 3px 9px;
//       border-radius: 6px;
//       font-size: 12px;
//       font-weight: 500;
//       white-space: nowrap;
//     }
//     .sl-rounded { border-radius: 20px; }

//     .sl-linked {
//       margin-top: 4px;
//     }
//     .sl-linked a {
//       font-size: 11px;
//       color: #2563eb;
//       cursor: pointer;
//       text-decoration: underline;
//       white-space: nowrap;
//     }
//     .sl-linked a:hover { color: #1d4ed8; }

//     @keyframes sl-highlight-flash {
//       0%, 100% { background: transparent; }
//       25%, 75% { background: #dbeafe; }
//     }
//     .sl-highlight {
//       animation: sl-highlight-flash 1s ease-in-out 2;
//     }

//     /* Status */
//     .sl-status-scheduled   { background: #eff6ff; color: #1d4ed8; }
//     .sl-status-completed   { background: #f0fdf4; color: #15803d; }
//     .sl-status-cancelled   { background: #fef2f2; color: #b91c1c; }
//     .sl-status-rescheduled { background: #fffbeb; color: #92400e; }

//     /* Type */
//     .sl-type-court_hearing   { background: #fef9c3; color: #854d0e; }
//     .sl-type-client_meeting  { background: #f3e8ff; color: #6b21a8; }
//     .sl-type-internal_review { background: #e0f2fe; color: #0c4a6e; }
//     .sl-type-mediation       { background: #ecfdf5; color: #065f46; }

//     /* ===== Actions cell ===== */
//     .sl-actions { display: flex; gap: 6px; align-items: center; }

//     /* ===== Modal ===== */
//     .sl-modal-backdrop {
//       position: fixed; inset: 0;
//       background: rgba(15,23,42,0.45);
//       display: flex; align-items: center; justify-content: center;
//       z-index: 1000;
//       animation: sl-fade-in 0.15s ease;
//     }
//     @keyframes sl-fade-in { from { opacity:0 } to { opacity:1 } }

//     .sl-modal {
//       background: #fff;
//       border-radius: 14px;
//       padding: 24px;
//       width: 100%;
//       max-width: 600px;
//       max-height: 90vh;
//       overflow-y: auto;
//       box-shadow: 0 20px 60px rgba(0,0,0,0.15);
//       animation: sl-slide-up 0.2s ease;
//     }
//     .sl-modal--sm { max-width: 420px; }
//     @keyframes sl-slide-up { from { transform:translateY(16px); opacity:0 } to { transform:translateY(0); opacity:1 } }

//     .sl-modal-header {
//       display: flex; justify-content: space-between;
//       align-items: center; margin-bottom: 16px;
//     }
//     .sl-modal-title { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0; }
//     .sl-modal-close {
//       background: none; border: none; cursor: pointer;
//       font-size: 16px; color: #94a3b8; padding: 4px 8px;
//       border-radius: 6px; transition: background 0.15s;
//     }
//     .sl-modal-close:hover { background: #f1f5f9; color: #475569; }

//     /* ===== Details ===== */
//     .sl-details {
//       display: flex;
//       flex-direction: column;
//       gap: 12px;
//     }
//     .sl-details-row {
//       display: flex;
//       justify-content: space-between;
//       align-items: flex-start;
//       gap: 16px;
//       padding-bottom: 12px;
//       border-bottom: 1px solid #f1f5f9;
//     }
//     .sl-details-row:last-child { border-bottom: none; padding-bottom: 0; }
//     .sl-details-label {
//       font-size: 12px;
//       font-weight: 600;
//       color: #94a3b8;
//       white-space: nowrap;
//       min-width: 90px;
//     }
//     .sl-details-value {
//       font-size: 13px;
//       color: #1e293b;
//       text-align: left;
//       flex: 1;
//     }
//     .sl-details-row--notes .sl-details-value {
//       white-space: pre-wrap;
//       line-height: 1.6;
//     }
//     .sl-details a {
//       color: #2563eb;
//       cursor: pointer;
//       text-decoration: underline;
//     }

//     /* ===== Skeleton ===== */
//     @keyframes sl-shimmer {
//       0%   { background-position: -400px 0 }
//       100% { background-position: 400px 0 }
//     }
//     .sl-sk {
//       height: 13px;
//       border-radius: 6px;
//       background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
//       background-size: 800px 100%;
//       animation: sl-shimmer 1.4s infinite linear;
//     }
//     .sl-sk-pill  { height: 22px; border-radius: 20px; }
//     .sl-sk-w50   { width: 50px; }
//     .sl-sk-w60   { width: 60px; }
//     .sl-sk-w70   { width: 70px; }
//     .sl-sk-w80   { width: 80px; }
//     .sl-sk-w90   { width: 90px; }
//     .sl-sk-w100  { width: 100px; }
//     .sl-sk-w120  { width: 120px; }

//     /* ===== Responsive ===== */
//     @media (max-width: 768px) {
//       .sl-table-wrap { overflow-x: auto; }
//       .sl-form-grid  { grid-template-columns: 1fr; }
//       .sl-field--full { grid-column: 1; }
//       .sl-modal { margin: 16px; max-width: calc(100% - 32px); }
//       .sl-details-row { flex-direction: column; gap: 4px; }
//       .sl-details-value { text-align: right; }
//     }
//   `]
// })
// export class SessionListComponent implements OnInit {
//   sessions: any[] = [];
//   cases: any[] = [];
//   lawyers: any[] = [];
//   loading = false;
//   rescheduledMap: Record<string, any> = {};
//   highlightedSessionId: string | null = null;
//   skeletonRows = Array(5);
//   statusFilter = '';
//   typeFilter = '';
//   showForm = false;
//   saving = false;
//   formError = '';

//   form = {
//     caseId: '', lawyerId: '', title: '', type: 'court_hearing',
//     date: '', startTime: '', endTime: '', location: '', notes: ''
//   };

//   // ── Details ──────────────────────────────────────────────────
//   detailsModal = false;
//   detailsSession: any = null;

//   // ── Reschedule ──────────────────────────────────────────────
//   rescheduleModal = false;
//   rescheduleId = '';
//   rescheduleSaving = false;
//   rescheduleError = '';
//   rescheduleForm = { date: '', startTime: '', endTime: '', location: '' };

//   // ── Complete ─────────────────────────────────────────────────
//   completeModal = false;
//   completeId = '';
//   completeSaving = false;
//   completeError = '';
//   completeNotes = '';

//   // ── Cancel ───────────────────────────────────────────────────
//   cancelModal = false;
//   cancelId = '';
//   cancelSaving = false;
//   cancelError = '';

//   constructor(
//     private svc: SessionsService,
//     private usersSvc: UsersService,
//     private casesSvc: CasesService,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit() {
//     this.casesSvc.getAll(1, 100).subscribe({
//       next: (res: any) => {
//         const root = res?.data ?? res;
//         this.cases = root?.cases || root?.data || (Array.isArray(root) ? root : []);
//         this.cdr.detectChanges();
//       },
//       error: (err: any) => console.error('Cases ERROR:', err)
//     });

//     this.usersSvc.getLawyers().subscribe({
//       next: (res: any) => {
//         const root = res?.data ?? res;
//         this.lawyers = root?.lawyers || root?.users || root?.data || (Array.isArray(root) ? root : []);
//         this.cdr.detectChanges();
//       },
//       error: (err: any) => console.error('Lawyers ERROR:', err)
//     });

//     this.load();
//   }

//   load() {
//     this.loading = true;
//     this.cdr.detectChanges();

//     const params: any = {};
//     if (this.statusFilter) params.status = this.statusFilter;
//     if (this.typeFilter)   params.type   = this.typeFilter;

//     this.svc.getAll(params).subscribe({
//       next: (res: any) => {
//         const root = res?.data ?? res;
//         const data =
//           root?.sessions ??
//           root?.data ??
//           (Array.isArray(root) ? root : []);

//         this.sessions = [...data];
//         this.loading  = false;

//         // ربط كل جلسة مؤجَّلة بالجلسة الجديدة المنشأة منها (عبر rescheduledFrom)
//         this.rescheduledMap = {};
//         for (const s of this.sessions) {
//           const oldId = s.rescheduledFrom?._id || s.rescheduledFrom;
//           if (oldId) this.rescheduledMap[oldId] = s;
//         }

//         this.cdr.detectChanges();
//       },
//       error: (err: any) => {
//         console.error('Sessions ERROR:', err);
//         this.loading = false;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   scrollToSession(id: string) {
//     this.highlightedSessionId = id;
//     setTimeout(() => {
//       const el = document.getElementById('session-row-' + id);
//       el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }, 0);
//     setTimeout(() => {
//       this.highlightedSessionId = null;
//       this.cdr.detectChanges();
//     }, 2200);
//   }

//   addSession() {
//     if (!this.form.caseId || !this.form.lawyerId || !this.form.title || !this.form.date || !this.form.startTime || !this.form.endTime) {
//       this.formError = 'يرجى تعبئة الحقول المطلوبة';
//       return;
//     }
//     this.saving = true;
//     this.formError = '';
//     const payload = {
//       case:      this.form.caseId,
//       lawyer:    this.form.lawyerId,
//       title:     this.form.title,
//       type:      this.form.type,
//       startTime: new Date(`${this.form.date}T${this.form.startTime}`).toISOString(),
//       endTime:   new Date(`${this.form.date}T${this.form.endTime}`).toISOString(),
//       location:  this.form.location,
//       notes:     this.form.notes,
//     };
//     this.svc.create(payload as any).subscribe({
//       next: () => {
//         this.saving   = false;
//         this.showForm = false;
//         this.form     = { caseId:'', lawyerId:'', title:'', type:'court_hearing', date:'', startTime:'', endTime:'', location:'', notes:'' };
//         this.load();
//       },
//       error: err => {
//         this.formError = err?.error?.message || 'خطأ في الحفظ';
//         this.saving    = false;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   // ══════════════════════════════════════════════════════════
//   // Details
//   // ══════════════════════════════════════════════════════════

//   openDetails(s: any) {
//     this.detailsSession = s;
//     this.detailsModal = true;
//   }

//   closeDetails() {
//     this.detailsModal = false;
//     this.detailsSession = null;
//   }

//   // ══════════════════════════════════════════════════════════
//   // Reschedule
//   // ══════════════════════════════════════════════════════════

//   openReschedule(s: any) {
//     this.rescheduleId = s._id;
//     this.rescheduleError = '';
//     const start = new Date(s.startTime);
//     const end = new Date(s.endTime);
//     const pad = (n: number) => n.toString().padStart(2, '0');
//     this.rescheduleForm = {
//       date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
//       startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
//       endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
//       location: '',
//     };
//     this.rescheduleModal = true;
//   }

//   closeReschedule() {
//     this.rescheduleModal = false;
//     this.rescheduleError = '';
//     this.rescheduleSaving = false;
//   }

//   submitReschedule() {
//     if (!this.rescheduleForm.date || !this.rescheduleForm.startTime || !this.rescheduleForm.endTime) {
//       this.rescheduleError = 'يرجى تعبئة التاريخ والوقت';
//       return;
//     }
//     this.rescheduleSaving = true;
//     this.rescheduleError = '';

//     const payload: any = {
//       startTime: new Date(`${this.rescheduleForm.date}T${this.rescheduleForm.startTime}`).toISOString(),
//       endTime: new Date(`${this.rescheduleForm.date}T${this.rescheduleForm.endTime}`).toISOString(),
//     };
//     if (this.rescheduleForm.location) payload.location = this.rescheduleForm.location;

//     this.svc.reschedule(this.rescheduleId, payload).subscribe({
//       next: () => {
//         this.rescheduleSaving = false;
//         this.closeReschedule();
//         this.load();
//       },
//       error: (err: any) => {
//         this.rescheduleError = err?.error?.message || 'حدث خطأ أثناء التأجيل';
//         this.rescheduleSaving = false;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   // ══════════════════════════════════════════════════════════
//   // Complete
//   // ══════════════════════════════════════════════════════════

//   openComplete(s: any) {
//     this.completeId = s._id;
//     this.completeNotes = '';
//     this.completeError = '';
//     this.completeModal = true;
//   }

//   closeComplete() {
//     this.completeModal = false;
//     this.completeError = '';
//     this.completeSaving = false;
//   }

//   submitComplete() {
//     this.completeSaving = true;
//     this.completeError = '';
//     const payload: any = {};
//     if (this.completeNotes) payload.notes = this.completeNotes;

//     this.svc.complete(this.completeId, payload).subscribe({
//       next: () => {
//         this.completeSaving = false;
//         this.closeComplete();
//         this.load();
//       },
//       error: (err: any) => {
//         this.completeError = err?.error?.message || 'حدث خطأ أثناء الإكمال';
//         this.completeSaving = false;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   // ══════════════════════════════════════════════════════════
//   // Cancel
//   // ══════════════════════════════════════════════════════════

//   openCancel(s: any) {
//     this.cancelId = s._id;
//     this.cancelError = '';
//     this.cancelModal = true;
//   }

//   closeCancel() {
//     this.cancelModal = false;
//     this.cancelError = '';
//     this.cancelSaving = false;
//   }

//   submitCancel() {
//     this.cancelSaving = true;
//     this.cancelError = '';

//     this.svc.cancel(this.cancelId).subscribe({
//       next: () => {
//         this.cancelSaving = false;
//         this.closeCancel();
//         this.load();
//       },
//       error: (err: any) => {
//         this.cancelError = err?.error?.message || 'حدث خطأ أثناء الإلغاء';
//         this.cancelSaving = false;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   getLawyerName(l: any): string {
//     if (!l) return '-';
//     return l.name || l.user?.name || `${l.user?.firstName || ''} ${l.user?.lastName || ''}`.trim() || '-';
//   }

//   statusLabel(s: string): string {
//     const m: any = { scheduled: 'مجدولة', completed: 'مكتملة', cancelled: 'ملغاة', rescheduled: 'مؤجَّلة' };
//     return m[s] || s;
//   }

//   typeLabel(t: string): string {
//     const m: any = {
//       court_hearing: 'جلسة محكمة',
//       client_meeting: 'اجتماع عميل',
//       internal_review: 'مراجعة داخلية',
//       mediation: 'وساطة',
//     };
//     return m[t] || t;
//   }
// }
import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionsService, UsersService } from '../../../core/services/index';
import { CasesService } from '../../../core/services/cases.service';

@Component({
  selector: 'app-session-list',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="sl-page" dir="rtl">

      <!-- Header -->
      <div class="sl-header">
        <h1 class="sl-title">
          <svg viewBox="0 0 24 24" class="sl-icon sl-icon-title"><rect x="3" y="5" width="18" height="16" rx="3"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          جلسات المحكمة
        </h1>
        <button class="sl-btn-primary" (click)="showForm = !showForm">
          <svg viewBox="0 0 24 24" class="sl-icon"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          إضافة جلسة
        </button>
      </div>

      <!-- Add Form -->
      <div class="sl-card" *ngIf="showForm">
        <h3 class="sl-card-title">إضافة جلسة جديدة</h3>
        <div class="sl-form-grid">

          <div class="sl-field sl-field--full">
            <label class="sl-label">عنوان الجلسة *</label>
            <input type="text" [(ngModel)]="form.title" placeholder="مثال: جلسة نظر الدعوى" class="sl-input" />
          </div>

          <div class="sl-field">
            <label class="sl-label">القضية *</label>
            <select [(ngModel)]="form.caseId" class="sl-input">
              <option value="">اختر القضية</option>
              <option *ngFor="let c of cases" [value]="c._id">{{ c.caseNumber }} - {{ c.title }}</option>
            </select>
          </div>

          <div class="sl-field">
            <label class="sl-label">المحامي *</label>
            <select [(ngModel)]="form.lawyerId" class="sl-input">
              <option value="">اختر المحامي</option>
              <option *ngFor="let l of lawyers" [value]="l._id">{{ getLawyerName(l) }}</option>
            </select>
          </div>

          <div class="sl-field">
            <label class="sl-label">نوع الجلسة</label>
            <select [(ngModel)]="form.type" class="sl-input">
              <option value="court_hearing">جلسة محكمة</option>
              <option value="client_meeting">اجتماع عميل</option>
              <option value="internal_review">مراجعة داخلية</option>
              <option value="mediation">وساطة</option>
            </select>
          </div>

          <div class="sl-field">
            <label class="sl-label">التاريخ *</label>
            <input type="date" [(ngModel)]="form.date" class="sl-input" />
          </div>

          <div class="sl-field">
            <label class="sl-label">وقت البداية *</label>
            <input type="time" [(ngModel)]="form.startTime" class="sl-input" />
          </div>

          <div class="sl-field">
            <label class="sl-label">وقت النهاية *</label>
            <input type="time" [(ngModel)]="form.endTime" class="sl-input" />
          </div>

          <div class="sl-field sl-field--full">
            <label class="sl-label">المكان</label>
            <input type="text" [(ngModel)]="form.location" placeholder="المحكمة / القاعة" class="sl-input" />
          </div>

          <div class="sl-field sl-field--full">
            <label class="sl-label">ملاحظات</label>
            <textarea [(ngModel)]="form.notes" rows="2" placeholder="أي ملاحظات إضافية..." class="sl-input sl-textarea"></textarea>
          </div>

        </div>

        <div class="sl-error" *ngIf="formError">{{ formError }}</div>

        <div class="sl-form-actions">
          <button class="sl-btn-primary" (click)="addSession()" [disabled]="saving">
            {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
          <button class="sl-btn-cancel" (click)="showForm = false">إلغاء</button>
        </div>
      </div>

      <!-- Filters -->
      <div class="sl-filters">
        <div class="sl-select-wrap">
          <select [(ngModel)]="statusFilter" (ngModelChange)="load()" class="sl-input sl-input--pill">
            <option value="">كل الحالات</option>
            <option value="scheduled">مجدولة</option>
            <option value="completed">مكتملة</option>
            <option value="cancelled">ملغاة</option>
            <option value="rescheduled">مؤجَّلة</option>
          </select>
          <svg viewBox="0 0 24 24" class="sl-icon sl-select-chevron"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="sl-select-wrap">
          <select [(ngModel)]="typeFilter" (ngModelChange)="load()" class="sl-input sl-input--pill">
            <option value="">كل الأنواع</option>
            <option value="court_hearing">جلسة محكمة</option>
            <option value="client_meeting">اجتماع عميل</option>
            <option value="internal_review">مراجعة داخلية</option>
            <option value="mediation">وساطة</option>
          </select>
          <svg viewBox="0 0 24 24" class="sl-icon sl-select-chevron"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <!-- Skeleton Loading -->
      <div class="sl-table-wrap" *ngIf="loading">
        <table class="sl-table">
          <thead>
            <tr>
              <th>التاريخ والوقت</th>
              <th>القضية</th>
              <th>النوع</th>
              <th>المكان</th>
              <th>المحامي</th>
              <th>الحالة</th>
              <th>ملاحظات</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of skeletonRows">
              <td><div class="sl-sk sl-sk-w80"></div><div class="sl-sk sl-sk-w50" style="margin-top:6px"></div></td>
              <td><div class="sl-sk sl-sk-w120"></div><div class="sl-sk sl-sk-w70" style="margin-top:6px"></div></td>
              <td><div class="sl-sk sl-sk-pill sl-sk-w60"></div></td>
              <td><div class="sl-sk sl-sk-w90"></div></td>
              <td><div class="sl-sk sl-sk-w80"></div></td>
              <td><div class="sl-sk sl-sk-pill sl-sk-w50"></div></td>
              <td><div class="sl-sk sl-sk-w100"></div></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <div class="sl-empty" *ngIf="!loading && sessions.length === 0">
        <svg viewBox="0 0 24 24" class="sl-icon sl-empty-icon"><rect x="3" y="5" width="18" height="16" rx="3"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <p>لا توجد جلسات</p>
      </div>

      <!-- Table -->
      <div class="sl-table-wrap" *ngIf="!loading && sessions.length > 0">
        <table class="sl-table">
          <thead>
            <tr>
              <th>التاريخ والوقت</th>
              <th>القضية</th>
              <th>النوع</th>
              <th>المكان</th>
              <th>المحامي</th>
              <th>الحالة</th>
              <th>ملاحظات</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of sessions" [id]="'session-row-' + s._id" [class.sl-highlight]="highlightedSessionId === s._id">
              <td>
                <div class="sl-date-main">{{ s.startTime | date:'EEE، d MMM y' }}</div>
                <div class="sl-date-sub">{{ s.startTime | date:'HH:mm' }} - {{ s.endTime | date:'HH:mm' }}</div>
              </td>
              <td>
                <div class="sl-case-title">{{ s.case?.title }}</div>
                <div class="sl-case-num">{{ s.case?.caseNumber }}</div>
              </td>
              <td>
                <span class="sl-badge" [ngClass]="'sl-type-' + s.type">{{ typeLabel(s.type) }}</span>
              </td>
              <td class="sl-location">
                <span *ngIf="s.location" class="sl-location-value">
                  <svg viewBox="0 0 24 24" class="sl-icon sl-icon-sm"><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.3"/></svg>
                  {{ s.location }}
                </span>
                <span *ngIf="!s.location" class="sl-muted">-</span>
              </td>
              <td>
                <div class="sl-lawyer">
                  <span class="sl-avatar">{{ getLawyerName(s.lawyer).charAt(0) }}</span>
                  {{ getLawyerName(s.lawyer) }}
                </div>
              </td>
              <td>
                <span class="sl-badge sl-rounded sl-status" [ngClass]="'sl-status-' + s.status">{{ statusLabel(s.status) }}</span>
                <div *ngIf="s.status === 'rescheduled' && rescheduledMap[s._id]" class="sl-linked">
                  <a (click)="scrollToSession(rescheduledMap[s._id]._id)">
                    <svg viewBox="0 0 24 24" class="sl-icon sl-icon-sm"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    الجلسة الجديدة: {{ rescheduledMap[s._id].startTime | date:'d MMM, HH:mm' }}
                  </a>
                </div>
              </td>
              <td class="sl-notes">{{ s.notes || '-' }}</td>
              <td>
                <div class="sl-actions">
                  <button class="sl-icon-btn sl-icon-btn--view" (click)="openDetails(s)" title="تفاصيل">
                    <svg viewBox="0 0 24 24" class="sl-icon"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <ng-container *ngIf="s.status === 'scheduled'">
                    <button class="sl-icon-btn sl-icon-btn--edit" (click)="openReschedule(s)" title="تأجيل">
                      <svg viewBox="0 0 24 24" class="sl-icon"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><polyline points="21 3 21 9 15 9"/></svg>
                    </button>
                    <button class="sl-icon-btn sl-icon-btn--complete" (click)="openComplete(s)" title="إكمال">
                      <svg viewBox="0 0 24 24" class="sl-icon"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button class="sl-icon-btn sl-icon-btn--delete" (click)="openCancel(s)" title="إلغاء">
                      <svg viewBox="0 0 24 24" class="sl-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </ng-container>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Details Modal -->
      <div class="sl-modal-backdrop" *ngIf="detailsModal" (click)="closeDetails()">
        <div class="sl-modal" (click)="$event.stopPropagation()">
          <div class="sl-modal-header">
            <h3 class="sl-modal-title">
              <svg viewBox="0 0 24 24" class="sl-icon"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
              تفاصيل الجلسة
            </h3>
            <button class="sl-modal-close" (click)="closeDetails()">
              <svg viewBox="0 0 24 24" class="sl-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="sl-details" *ngIf="detailsSession as s">
            <div class="sl-details-row">
              <span class="sl-details-label">العنوان</span>
              <span class="sl-details-value">{{ s.title || '-' }}</span>
            </div>
            <div class="sl-details-row">
              <span class="sl-details-label">القضية</span>
              <span class="sl-details-value">{{ s.case?.title }} <span class="sl-muted" *ngIf="s.case?.caseNumber">({{ s.case?.caseNumber }})</span></span>
            </div>
            <div class="sl-details-row">
              <span class="sl-details-label">المحامي</span>
              <span class="sl-details-value">{{ getLawyerName(s.lawyer) }}</span>
            </div>
            <div class="sl-details-row">
              <span class="sl-details-label">النوع</span>
              <span class="sl-details-value">
                <span class="sl-badge" [ngClass]="'sl-type-' + s.type">{{ typeLabel(s.type) }}</span>
              </span>
            </div>
            <div class="sl-details-row">
              <span class="sl-details-label">الحالة</span>
              <span class="sl-details-value">
                <span class="sl-badge sl-rounded sl-status" [ngClass]="'sl-status-' + s.status">{{ statusLabel(s.status) }}</span>
              </span>
            </div>
            <div class="sl-details-row">
              <span class="sl-details-label">التاريخ</span>
              <span class="sl-details-value">{{ s.startTime | date:'EEE، d MMM y' }}</span>
            </div>
            <div class="sl-details-row">
              <span class="sl-details-label">الوقت</span>
              <span class="sl-details-value">{{ s.startTime | date:'HH:mm' }} - {{ s.endTime | date:'HH:mm' }}</span>
            </div>
            <div class="sl-details-row">
              <span class="sl-details-label">المكان</span>
              <span class="sl-details-value">{{ s.location || '-' }}</span>
            </div>
            <div class="sl-details-row" *ngIf="s.status === 'rescheduled' && rescheduledMap[s._id]">
              <span class="sl-details-label">الجلسة الجديدة</span>
              <span class="sl-details-value">
                <a (click)="closeDetails(); scrollToSession(rescheduledMap[s._id]._id)">{{ rescheduledMap[s._id].startTime | date:'d MMM, HH:mm' }}</a>
              </span>
            </div>
            <div class="sl-details-row" *ngIf="s.rescheduledFrom">
              <span class="sl-details-label">مؤجَّلة من</span>
              <span class="sl-details-value">{{ s.rescheduledFrom?.startTime ? (s.rescheduledFrom.startTime | date:'d MMM, HH:mm') : '-' }}</span>
            </div>
            <div class="sl-details-row sl-details-row--notes">
              <span class="sl-details-label">ملاحظات</span>
              <span class="sl-details-value">{{ s.notes || '-' }}</span>
            </div>
          </div>

          <div class="sl-form-actions" style="margin-top:16px">
            <button class="sl-btn-cancel" (click)="closeDetails()">إغلاق</button>
          </div>
        </div>
      </div>

      <!-- Reschedule Modal -->
      <div class="sl-modal-backdrop" *ngIf="rescheduleModal" (click)="closeReschedule()">
        <div class="sl-modal" (click)="$event.stopPropagation()">
          <div class="sl-modal-header">
            <h3 class="sl-modal-title">
              <svg viewBox="0 0 24 24" class="sl-icon"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><polyline points="21 3 21 9 15 9"/></svg>
              تأجيل الجلسة
            </h3>
            <button class="sl-modal-close" (click)="closeReschedule()">
              <svg viewBox="0 0 24 24" class="sl-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <p class="sl-hint">
            <svg viewBox="0 0 24 24" class="sl-icon sl-icon-sm"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            التأجيل هينشئ جلسة جديدة بنفس القضية والمحامي والعنوان في الميعاد الجديد،
            وهتتحول الجلسة الحالية لحالة "مؤجَّلة" تلقائيًا.
          </p>

          <div class="sl-form-grid">
            <div class="sl-field">
              <label class="sl-label">التاريخ الجديد *</label>
              <input type="date" [(ngModel)]="rescheduleForm.date" class="sl-input" />
            </div>
            <div class="sl-field">
              <label class="sl-label">وقت البداية *</label>
              <input type="time" [(ngModel)]="rescheduleForm.startTime" class="sl-input" />
            </div>
            <div class="sl-field">
              <label class="sl-label">وقت النهاية *</label>
              <input type="time" [(ngModel)]="rescheduleForm.endTime" class="sl-input" />
            </div>
            <div class="sl-field sl-field--full">
              <label class="sl-label">المكان (اختياري)</label>
              <input type="text" [(ngModel)]="rescheduleForm.location" class="sl-input" placeholder="اتركه فارغًا للإبقاء على نفس المكان" />
            </div>
          </div>

          <div class="sl-error" *ngIf="rescheduleError">{{ rescheduleError }}</div>

          <div class="sl-form-actions" style="margin-top:16px">
            <button class="sl-btn-primary" (click)="submitReschedule()" [disabled]="rescheduleSaving">
              {{ rescheduleSaving ? 'جاري التأجيل...' : 'تأكيد التأجيل' }}
            </button>
            <button class="sl-btn-cancel" (click)="closeReschedule()">إلغاء</button>
          </div>
        </div>
      </div>

      <!-- Complete Confirm Modal -->
      <div class="sl-modal-backdrop" *ngIf="completeModal" (click)="closeComplete()">
        <div class="sl-modal sl-modal--sm" (click)="$event.stopPropagation()">
          <div class="sl-modal-header">
            <h3 class="sl-modal-title">
              <svg viewBox="0 0 24 24" class="sl-icon"><polyline points="20 6 9 17 4 12"/></svg>
              إكمال الجلسة
            </h3>
            <button class="sl-modal-close" (click)="closeComplete()">
              <svg viewBox="0 0 24 24" class="sl-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <p class="sl-hint sl-hint--plain">هل تريد تعليم هذه الجلسة كمكتملة؟</p>

          <div class="sl-field">
            <label class="sl-label">ملاحظات (اختياري)</label>
            <textarea [(ngModel)]="completeNotes" rows="2" class="sl-input sl-textarea" placeholder="أي ملاحظات عن نتيجة الجلسة..."></textarea>
          </div>

          <div class="sl-error" *ngIf="completeError">{{ completeError }}</div>

          <div class="sl-form-actions" style="margin-top:16px">
            <button class="sl-btn-primary" (click)="submitComplete()" [disabled]="completeSaving">
              {{ completeSaving ? 'جاري الحفظ...' : 'تأكيد الإكمال' }}
            </button>
            <button class="sl-btn-cancel" (click)="closeComplete()">تراجع</button>
          </div>
        </div>
      </div>

      <!-- Cancel Confirm Modal -->
      <div class="sl-modal-backdrop" *ngIf="cancelModal" (click)="closeCancel()">
        <div class="sl-modal sl-modal--sm" (click)="$event.stopPropagation()">
          <div class="sl-modal-header">
            <h3 class="sl-modal-title">
              <svg viewBox="0 0 24 24" class="sl-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              إلغاء الجلسة
            </h3>
            <button class="sl-modal-close" (click)="closeCancel()">
              <svg viewBox="0 0 24 24" class="sl-icon"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <p class="sl-hint sl-hint--plain">هل أنت متأكد من إلغاء هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.</p>

          <div class="sl-error" *ngIf="cancelError">{{ cancelError }}</div>

          <div class="sl-form-actions" style="margin-top:16px">
            <button class="sl-btn-danger" (click)="submitCancel()" [disabled]="cancelSaving">
              {{ cancelSaving ? 'جاري الإلغاء...' : 'تأكيد الإلغاء' }}
            </button>
            <button class="sl-btn-cancel" (click)="closeCancel()">تراجع</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    /* ===== Icon base ===== */
    .sl-icon {
      width: 17px;
      height: 17px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex-shrink: 0;
    }
    .sl-icon-sm { width: 14px; height: 14px; }
    .sl-icon-title { width: 20px; height: 20px; color: #1e293b; }

    /* ===== Layout ===== */
    .sl-page {
      direction: rtl;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      padding: 24px;
      min-height: 100vh;
      background: #f8fafc;
    }

    /* ===== Header ===== */
    .sl-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .sl-title {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    /* ===== Buttons ===== */
    .sl-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 10px 18px;
      background: #1e293b;
      color: #fff;
      border: none;
      border-radius: 9px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      transition: background 0.15s;
    }
    .sl-btn-primary:hover { background: #334155; }
    .sl-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .sl-btn-danger {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      background: #dc2626;
      color: #fff;
      border: none;
      border-radius: 9px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      transition: background 0.15s;
    }
    .sl-btn-danger:hover { background: #b91c1c; }
    .sl-btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

    .sl-btn-cancel {
      display: inline-flex;
      align-items: center;
      padding: 10px 20px;
      border: 1px solid #e2e8f0;
      background: #fff;
      color: #475569;
      border-radius: 9px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      transition: background 0.15s;
    }
    .sl-btn-cancel:hover { background: #f1f5f9; }

    /* Uniform icon-action buttons, matching the icon-first style used across the app */
    .sl-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .sl-icon-btn--view:hover     { background: #eff6ff; color: #2563eb; }
    .sl-icon-btn--edit:hover     { background: #fffbeb; color: #b45309; }
    .sl-icon-btn--complete:hover { background: #f0fdf4; color: #16a34a; }
    .sl-icon-btn--delete:hover   { background: #fef2f2; color: #dc2626; }

    /* ===== Card ===== */
    .sl-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 6px rgba(0,0,0,0.06);
      border: 1px solid #f1f5f9;
      margin-bottom: 16px;
    }
    .sl-card-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 16px;
    }

    /* ===== Form ===== */
    .sl-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .sl-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .sl-field--full {
      grid-column: 1 / -1;
    }
    .sl-label {
      font-size: 12px;
      font-weight: 500;
      color: #64748b;
    }
    .sl-input {
      padding: 9px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      color: #1e293b;
      background: #fff;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .sl-input:focus { border-color: #94a3b8; }
    .sl-textarea { resize: none; }

    .sl-hint {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 13px;
      color: #64748b;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 16px;
      line-height: 1.6;
    }
    .sl-hint .sl-icon { color: #94a3b8; margin-top: 2px; }
    .sl-hint--plain { display: block; }

    .sl-error {
      margin-top: 10px;
      background: #fef2f2;
      color: #b91c1c;
      border: 1px solid #fee2e2;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
    }
    .sl-form-actions {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }

    /* ===== Filters ===== */
    .sl-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }
    .sl-select-wrap {
      position: relative;
      display: inline-flex;
    }
    .sl-input--pill {
      appearance: none;
      -webkit-appearance: none;
      width: auto;
      padding: 8px 34px 8px 14px;
      border-radius: 999px;
      border: 1px solid #e2e8f0;
      background: #fff;
      font-size: 13px;
      color: #334155;
      cursor: pointer;
    }
    .sl-select-chevron {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 14px;
      height: 14px;
      color: #94a3b8;
      pointer-events: none;
    }

    /* ===== States ===== */
    .sl-empty {
      text-align: center;
      padding: 64px;
      color: #94a3b8;
    }
    .sl-empty-icon { width: 46px; height: 46px; margin-bottom: 12px; color: #cbd5e1; }

    /* ===== Table ===== */
    .sl-table-wrap {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 6px rgba(0,0,0,0.06);
      border: 1px solid #f1f5f9;
      overflow: hidden;
    }
    .sl-table {
      width: 100%;
      border-collapse: collapse;
    }
    .sl-table thead tr {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .sl-table th {
      text-align: right;
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      white-space: nowrap;
    }
    .sl-table tbody tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.12s;
    }
    .sl-table tbody tr:last-child { border-bottom: none; }
    .sl-table tbody tr:hover { background: #f8fafc; }
    .sl-table td {
      padding: 12px 16px;
      font-size: 13px;
      color: #475569;
      vertical-align: middle;
    }

    /* ===== Cell helpers ===== */
    .sl-date-main { font-weight: 500; color: #1e293b; font-size: 13px; }
    .sl-date-sub  { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .sl-case-title { font-weight: 500; color: #1e293b; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sl-case-num  { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .sl-location  { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sl-location-value { display: inline-flex; align-items: center; gap: 5px; }
    .sl-location-value .sl-icon { color: #94a3b8; }
    .sl-notes     { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #94a3b8; }
    .sl-muted     { color: #cbd5e1; }

    /* Lawyer with avatar, matching the initial-circle style used elsewhere */
    .sl-lawyer {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sl-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #1e293b;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      flex-shrink: 0;
    }

    /* ===== Badges ===== */
    .sl-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 9px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
    .sl-rounded { border-radius: 999px; }
    .sl-status {
      gap: 6px;
      padding: 4px 12px 4px 10px;
      border: 1px solid transparent;
    }
    .sl-status::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }

    .sl-linked {
      margin-top: 4px;
    }
    .sl-linked a {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      color: #2563eb;
      cursor: pointer;
      text-decoration: underline;
      white-space: nowrap;
    }
    .sl-linked a:hover { color: #1d4ed8; }
    .sl-linked a .sl-icon { color: #2563eb; }

    @keyframes sl-highlight-flash {
      0%, 100% { background: transparent; }
      25%, 75% { background: #dbeafe; }
    }
    .sl-highlight {
      animation: sl-highlight-flash 1s ease-in-out 2;
    }

    /* Status — soft tint pills consistent with the "نشط" style */
    .sl-status-scheduled   { background: #eff6ff; color: #1d4ed8; }
    .sl-status-completed   { background: #f0fdf4; color: #15803d; }
    .sl-status-cancelled   { background: #fef2f2; color: #b91c1c; }
    .sl-status-rescheduled { background: #fffbeb; color: #92400e; }

    /* Type */
    .sl-type-court_hearing   { background: #fef9c3; color: #854d0e; }
    .sl-type-client_meeting  { background: #f3e8ff; color: #6b21a8; }
    .sl-type-internal_review { background: #e0f2fe; color: #0c4a6e; }
    .sl-type-mediation       { background: #ecfdf5; color: #065f46; }

    /* ===== Actions cell ===== */
    .sl-actions { display: flex; gap: 4px; align-items: center; }

    /* ===== Modal ===== */
    .sl-modal-backdrop {
      position: fixed; inset: 0;
      background: rgba(15,23,42,0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
      animation: sl-fade-in 0.15s ease;
    }
    @keyframes sl-fade-in { from { opacity:0 } to { opacity:1 } }

    .sl-modal {
      background: #fff;
      border-radius: 14px;
      padding: 24px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      animation: sl-slide-up 0.2s ease;
    }
    .sl-modal--sm { max-width: 420px; }
    @keyframes sl-slide-up { from { transform:translateY(16px); opacity:0 } to { transform:translateY(0); opacity:1 } }

    .sl-modal-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 16px;
    }
    .sl-modal-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    .sl-modal-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: none; border: none; cursor: pointer;
      color: #94a3b8;
      border-radius: 7px; transition: background 0.15s;
    }
    .sl-modal-close:hover { background: #f1f5f9; color: #475569; }
    .sl-modal-close .sl-icon { width: 15px; height: 15px; }

    /* ===== Details ===== */
    .sl-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .sl-details-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    .sl-details-row:last-child { border-bottom: none; padding-bottom: 0; }
    .sl-details-label {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      white-space: nowrap;
      min-width: 90px;
    }
    .sl-details-value {
      font-size: 13px;
      color: #1e293b;
      text-align: left;
      flex: 1;
    }
    .sl-details-row--notes .sl-details-value {
      white-space: pre-wrap;
      line-height: 1.6;
    }
    .sl-details a {
      color: #2563eb;
      cursor: pointer;
      text-decoration: underline;
    }

    /* ===== Skeleton ===== */
    @keyframes sl-shimmer {
      0%   { background-position: -400px 0 }
      100% { background-position: 400px 0 }
    }
    .sl-sk {
      height: 13px;
      border-radius: 6px;
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 800px 100%;
      animation: sl-shimmer 1.4s infinite linear;
    }
    .sl-sk-pill  { height: 22px; border-radius: 20px; }
    .sl-sk-w50   { width: 50px; }
    .sl-sk-w60   { width: 60px; }
    .sl-sk-w70   { width: 70px; }
    .sl-sk-w80   { width: 80px; }
    .sl-sk-w90   { width: 90px; }
    .sl-sk-w100  { width: 100px; }
    .sl-sk-w120  { width: 120px; }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .sl-table-wrap { overflow-x: auto; }
      .sl-form-grid  { grid-template-columns: 1fr; }
      .sl-field--full { grid-column: 1; }
      .sl-modal { margin: 16px; max-width: calc(100% - 32px); }
      .sl-details-row { flex-direction: column; gap: 4px; }
      .sl-details-value { text-align: right; }
    }
  `]
})
export class SessionListComponent implements OnInit {
  sessions: any[] = [];
  cases: any[] = [];
  lawyers: any[] = [];
  loading = false;
  rescheduledMap: Record<string, any> = {};
  highlightedSessionId: string | null = null;
  skeletonRows = Array(5);
  statusFilter = '';
  typeFilter = '';
  showForm = false;
  saving = false;
  formError = '';

  form = {
    caseId: '', lawyerId: '', title: '', type: 'court_hearing',
    date: '', startTime: '', endTime: '', location: '', notes: ''
  };

  // ── Details ──────────────────────────────────────────────────
  detailsModal = false;
  detailsSession: any = null;

  // ── Reschedule ──────────────────────────────────────────────
  rescheduleModal = false;
  rescheduleId = '';
  rescheduleSaving = false;
  rescheduleError = '';
  rescheduleForm = { date: '', startTime: '', endTime: '', location: '' };

  // ── Complete ─────────────────────────────────────────────────
  completeModal = false;
  completeId = '';
  completeSaving = false;
  completeError = '';
  completeNotes = '';

  // ── Cancel ───────────────────────────────────────────────────
  cancelModal = false;
  cancelId = '';
  cancelSaving = false;
  cancelError = '';

  constructor(
    private svc: SessionsService,
    private usersSvc: UsersService,
    private casesSvc: CasesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.casesSvc.getAll(1, 100).subscribe({
      next: (res: any) => {
        const root = res?.data ?? res;
        this.cases = root?.cases || root?.data || (Array.isArray(root) ? root : []);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Cases ERROR:', err)
    });

    this.usersSvc.getLawyers().subscribe({
      next: (res: any) => {
        const root = res?.data ?? res;
        this.lawyers = root?.lawyers || root?.users || root?.data || (Array.isArray(root) ? root : []);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Lawyers ERROR:', err)
    });

    this.load();
  }

  load() {
    this.loading = true;
    this.cdr.detectChanges();

    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.typeFilter)   params.type   = this.typeFilter;

    this.svc.getAll(params).subscribe({
      next: (res: any) => {
        const root = res?.data ?? res;
        const data =
          root?.sessions ??
          root?.data ??
          (Array.isArray(root) ? root : []);

        this.sessions = [...data];
        this.loading  = false;

        // ربط كل جلسة مؤجَّلة بالجلسة الجديدة المنشأة منها (عبر rescheduledFrom)
        this.rescheduledMap = {};
        for (const s of this.sessions) {
          const oldId = s.rescheduledFrom?._id || s.rescheduledFrom;
          if (oldId) this.rescheduledMap[oldId] = s;
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Sessions ERROR:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  scrollToSession(id: string) {
    this.highlightedSessionId = id;
    setTimeout(() => {
      const el = document.getElementById('session-row-' + id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
    setTimeout(() => {
      this.highlightedSessionId = null;
      this.cdr.detectChanges();
    }, 2200);
  }

  addSession() {
    if (!this.form.caseId || !this.form.lawyerId || !this.form.title || !this.form.date || !this.form.startTime || !this.form.endTime) {
      this.formError = 'يرجى تعبئة الحقول المطلوبة';
      return;
    }
    this.saving = true;
    this.formError = '';
    const payload = {
      case:      this.form.caseId,
      lawyer:    this.form.lawyerId,
      title:     this.form.title,
      type:      this.form.type,
      startTime: new Date(`${this.form.date}T${this.form.startTime}`).toISOString(),
      endTime:   new Date(`${this.form.date}T${this.form.endTime}`).toISOString(),
      location:  this.form.location,
      notes:     this.form.notes,
    };
    this.svc.create(payload as any).subscribe({
      next: () => {
        this.saving   = false;
        this.showForm = false;
        this.form     = { caseId:'', lawyerId:'', title:'', type:'court_hearing', date:'', startTime:'', endTime:'', location:'', notes:'' };
        this.load();
      },
      error: err => {
        this.formError = err?.error?.message || 'خطأ في الحفظ';
        this.saving    = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // Details
  // ══════════════════════════════════════════════════════════

  openDetails(s: any) {
    this.detailsSession = s;
    this.detailsModal = true;
  }

  closeDetails() {
    this.detailsModal = false;
    this.detailsSession = null;
  }

  // ══════════════════════════════════════════════════════════
  // Reschedule
  // ══════════════════════════════════════════════════════════

  openReschedule(s: any) {
    this.rescheduleId = s._id;
    this.rescheduleError = '';
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.rescheduleForm = {
      date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
      startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
      location: '',
    };
    this.rescheduleModal = true;
  }

  closeReschedule() {
    this.rescheduleModal = false;
    this.rescheduleError = '';
    this.rescheduleSaving = false;
  }

  submitReschedule() {
    if (!this.rescheduleForm.date || !this.rescheduleForm.startTime || !this.rescheduleForm.endTime) {
      this.rescheduleError = 'يرجى تعبئة التاريخ والوقت';
      return;
    }
    this.rescheduleSaving = true;
    this.rescheduleError = '';

    const payload: any = {
      startTime: new Date(`${this.rescheduleForm.date}T${this.rescheduleForm.startTime}`).toISOString(),
      endTime: new Date(`${this.rescheduleForm.date}T${this.rescheduleForm.endTime}`).toISOString(),
    };
    if (this.rescheduleForm.location) payload.location = this.rescheduleForm.location;

    this.svc.reschedule(this.rescheduleId, payload).subscribe({
      next: () => {
        this.rescheduleSaving = false;
        this.closeReschedule();
        this.load();
      },
      error: (err: any) => {
        this.rescheduleError = err?.error?.message || 'حدث خطأ أثناء التأجيل';
        this.rescheduleSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // Complete
  // ══════════════════════════════════════════════════════════

  openComplete(s: any) {
    this.completeId = s._id;
    this.completeNotes = '';
    this.completeError = '';
    this.completeModal = true;
  }

  closeComplete() {
    this.completeModal = false;
    this.completeError = '';
    this.completeSaving = false;
  }

  submitComplete() {
    this.completeSaving = true;
    this.completeError = '';
    const payload: any = {};
    if (this.completeNotes) payload.notes = this.completeNotes;

    this.svc.complete(this.completeId, payload).subscribe({
      next: () => {
        this.completeSaving = false;
        this.closeComplete();
        this.load();
      },
      error: (err: any) => {
        this.completeError = err?.error?.message || 'حدث خطأ أثناء الإكمال';
        this.completeSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ══════════════════════════════════════════════════════════
  // Cancel
  // ══════════════════════════════════════════════════════════

  openCancel(s: any) {
    this.cancelId = s._id;
    this.cancelError = '';
    this.cancelModal = true;
  }

  closeCancel() {
    this.cancelModal = false;
    this.cancelError = '';
    this.cancelSaving = false;
  }

  submitCancel() {
    this.cancelSaving = true;
    this.cancelError = '';

    this.svc.cancel(this.cancelId).subscribe({
      next: () => {
        this.cancelSaving = false;
        this.closeCancel();
        this.load();
      },
      error: (err: any) => {
        this.cancelError = err?.error?.message || 'حدث خطأ أثناء الإلغاء';
        this.cancelSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  getLawyerName(l: any): string {
    if (!l) return '-';
    return l.name || l.user?.name || `${l.user?.firstName || ''} ${l.user?.lastName || ''}`.trim() || '-';
  }

  statusLabel(s: string): string {
    const m: any = { scheduled: 'مجدولة', completed: 'مكتملة', cancelled: 'ملغاة', rescheduled: 'مؤجَّلة' };
    return m[s] || s;
  }

  typeLabel(t: string): string {
    const m: any = {
      court_hearing: 'جلسة محكمة',
      client_meeting: 'اجتماع عميل',
      internal_review: 'مراجعة داخلية',
      mediation: 'وساطة',
    };
    return m[t] || t;
  }
}