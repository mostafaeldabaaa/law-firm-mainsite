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
        <h1 class="sl-title">📅 جلسات المحكمة</h1>
        <button class="sl-btn-primary" (click)="showForm = !showForm">➕ إضافة جلسة</button>
      </div>

      <!-- Add Form -->
      <div class="sl-card" *ngIf="showForm">
        <h3 class="sl-card-title">إضافة جلسة جديدة</h3>
        <div class="sl-form-grid">

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
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()" class="sl-input">
          <option value="">كل الحالات</option>
          <option value="scheduled">مجدولة</option>
          <option value="completed">مكتملة</option>
          <option value="postponed">مؤجلة</option>
        </select>
        <select [(ngModel)]="typeFilter" (ngModelChange)="load()" class="sl-input">
          <option value="">كل الأنواع</option>
          <option value="court_hearing">جلسة محكمة</option>
          <option value="client_meeting">اجتماع عميل</option>
          <option value="internal_review">مراجعة داخلية</option>
        </select>
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
        <div class="sl-empty-icon">📅</div>
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
            <tr *ngFor="let s of sessions">
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
                <span *ngIf="s.location">📍 {{ s.location }}</span>
                <span *ngIf="!s.location" class="sl-muted">-</span>
              </td>
              <td>{{ getLawyerName(s.lawyer) }}</td>
              <td>
                <span class="sl-badge sl-rounded" [ngClass]="'sl-status-' + s.status">{{ statusLabel(s.status) }}</span>
              </td>
              <td class="sl-notes">{{ s.notes || '-' }}</td>
              <td>
                <div class="sl-actions">
                  <button class="sl-btn-edit" (click)="openEdit(s)" title="تعديل">✏️</button>
                  <button class="sl-btn-delete" (click)="deleteSession(s._id)" title="حذف">🗑</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Edit Modal -->
      <div class="sl-modal-backdrop" *ngIf="editModal" (click)="closeEdit()">
        <div class="sl-modal" (click)="$event.stopPropagation()">
          <div class="sl-modal-header">
            <h3 class="sl-modal-title">✏️ تعديل الجلسة</h3>
            <button class="sl-modal-close" (click)="closeEdit()">✕</button>
          </div>
          <div class="sl-form-grid">

            <div class="sl-field">
              <label class="sl-label">نوع الجلسة</label>
              <select [(ngModel)]="editForm.type" class="sl-input">
                <option value="court_hearing">جلسة محكمة</option>
                <option value="client_meeting">اجتماع عميل</option>
                <option value="internal_review">مراجعة داخلية</option>
              </select>
            </div>

            <div class="sl-field">
              <label class="sl-label">الحالة</label>
              <select [(ngModel)]="editForm.status" class="sl-input">
                <option value="scheduled">مجدولة</option>
                <option value="completed">مكتملة</option>
                <option value="postponed">مؤجلة</option>
              </select>
            </div>

            <div class="sl-field">
              <label class="sl-label">التاريخ</label>
              <input type="date" [(ngModel)]="editForm.date" class="sl-input" />
            </div>

            <div class="sl-field">
              <label class="sl-label">وقت البداية</label>
              <input type="time" [(ngModel)]="editForm.startTime" class="sl-input" />
            </div>

            <div class="sl-field">
              <label class="sl-label">وقت النهاية</label>
              <input type="time" [(ngModel)]="editForm.endTime" class="sl-input" />
            </div>

            <div class="sl-field">
              <label class="sl-label">المحامي</label>
              <select [(ngModel)]="editForm.lawyerId" class="sl-input">
                <option value="">اختر المحامي</option>
                <option *ngFor="let l of lawyers" [value]="l._id">{{ getLawyerName(l) }}</option>
              </select>
            </div>

            <div class="sl-field sl-field--full">
              <label class="sl-label">المكان</label>
              <input type="text" [(ngModel)]="editForm.location" class="sl-input" placeholder="المحكمة / القاعة" />
            </div>

            <div class="sl-field sl-field--full">
              <label class="sl-label">ملاحظات</label>
              <textarea [(ngModel)]="editForm.notes" rows="2" class="sl-input sl-textarea" placeholder="ملاحظات..."></textarea>
            </div>

          </div>

          <div class="sl-error" *ngIf="editError">{{ editError }}</div>

          <div class="sl-form-actions" style="margin-top:16px">
            <button class="sl-btn-primary" (click)="saveEdit()" [disabled]="editSaving">
              {{ editSaving ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
            </button>
            <button class="sl-btn-cancel" (click)="closeEdit()">إلغاء</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
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
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    /* ===== Buttons ===== */
    .sl-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      background: #1e293b;
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      transition: background 0.15s;
    }
    .sl-btn-primary:hover { background: #334155; }
    .sl-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .sl-btn-cancel {
      display: inline-flex;
      align-items: center;
      padding: 10px 20px;
      border: 1px solid #e2e8f0;
      background: #fff;
      color: #475569;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      transition: background 0.15s;
    }
    .sl-btn-cancel:hover { background: #f1f5f9; }

    .sl-btn-delete {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color: #cbd5e1;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.15s;
    }
    .sl-btn-delete:hover { color: #ef4444; }

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
      gap: 12px;
      margin-bottom: 16px;
    }
    .sl-filters .sl-input {
      width: auto;
    }

    /* ===== States ===== */
    .sl-empty {
      text-align: center;
      padding: 64px;
      color: #94a3b8;
    }
    .sl-empty-icon { font-size: 48px; margin-bottom: 12px; }

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
    .sl-notes     { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #94a3b8; }
    .sl-muted     { color: #cbd5e1; }

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
    .sl-rounded { border-radius: 20px; }

    /* Status */
    .sl-status-scheduled { background: #eff6ff; color: #1d4ed8; }
    .sl-status-completed  { background: #f0fdf4; color: #15803d; }
    .sl-status-postponed  { background: #fffbeb; color: #92400e; }

    /* Type */
    .sl-type-court_hearing   { background: #fef9c3; color: #854d0e; }
    .sl-type-client_meeting  { background: #f3e8ff; color: #6b21a8; }
    .sl-type-internal_review { background: #e0f2fe; color: #0c4a6e; }

    /* ===== Actions cell ===== */
    .sl-actions { display: flex; gap: 6px; align-items: center; }
    .sl-btn-edit {
      background: none; border: none; cursor: pointer;
      font-size: 15px; padding: 4px; border-radius: 4px;
      color: #94a3b8; transition: color 0.15s;
    }
    .sl-btn-edit:hover { color: #3b82f6; }

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
    @keyframes sl-slide-up { from { transform:translateY(16px); opacity:0 } to { transform:translateY(0); opacity:1 } }

    .sl-modal-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 20px;
    }
    .sl-modal-title { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0; }
    .sl-modal-close {
      background: none; border: none; cursor: pointer;
      font-size: 16px; color: #94a3b8; padding: 4px 8px;
      border-radius: 6px; transition: background 0.15s;
    }
    .sl-modal-close:hover { background: #f1f5f9; color: #475569; }

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
    }
  `]
})
export class SessionListComponent implements OnInit {
  sessions: any[] = [];
  cases: any[] = [];
  lawyers: any[] = [];
  loading = false;
  skeletonRows = Array(5);
  statusFilter = '';
  typeFilter = '';
  showForm = false;
  saving = false;
  formError = '';

  form = {
    caseId: '', lawyerId: '', type: 'court_hearing',
    date: '', startTime: '', endTime: '', location: '', notes: ''
  };

  // Edit modal
  editModal   = false;
  editId      = '';
  editSaving  = false;
  editError   = '';
  editForm = {
    type: 'court_hearing', status: 'scheduled',
    date: '', startTime: '', endTime: '',
    lawyerId: '', location: '', notes: ''
  };

  constructor(
    private svc: SessionsService,
    private usersSvc: UsersService,
    private casesSvc: CasesService,
    private cdr: ChangeDetectorRef   // ✅ أُضيف هنا
  ) {}

  ngOnInit() {
    this.casesSvc.getAll(1, 100).subscribe({
      next: (res: any) => {
        const root = res?.data ?? res;
        this.cases = root?.cases || root?.data || (Array.isArray(root) ? root : []);
        this.cdr.detectChanges(); // ✅
      },
      error: (err: any) => console.error('Cases ERROR:', err)
    });

    this.usersSvc.getLawyers().subscribe({
      next: (res: any) => {
        const root = res?.data ?? res;
        this.lawyers = root?.lawyers || root?.users || root?.data || (Array.isArray(root) ? root : []);
        this.cdr.detectChanges(); // ✅
      },
      error: (err: any) => console.error('Lawyers ERROR:', err)
    });

    this.load();
  }

  load() {
    this.loading = true;
    this.cdr.detectChanges(); // ✅ يُظهر الـ skeleton فوراً

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

        this.sessions = [...data]; // ✅ مصفوفة جديدة تجبر Angular على إعادة الرسم
        this.loading  = false;
        this.cdr.detectChanges(); // ✅ الأهم — يُحدّث الـ view بعد رجوع البيانات
      },
      error: (err: any) => {
        console.error('Sessions ERROR:', err);
        this.loading = false;
        this.cdr.detectChanges(); // ✅
      }
    });
  }

  addSession() {
    if (!this.form.caseId || !this.form.lawyerId || !this.form.date || !this.form.startTime || !this.form.endTime) {
      this.formError = 'يرجى تعبئة الحقول المطلوبة';
      return;
    }
    this.saving = true;
    this.formError = '';
    const payload = {
      caseId:    this.form.caseId,
      lawyerId:  this.form.lawyerId,
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
        this.form     = { caseId:'', lawyerId:'', type:'court_hearing', date:'', startTime:'', endTime:'', location:'', notes:'' };
        this.load();
      },
      error: err => {
        this.formError = err?.error?.message || 'خطأ في الحفظ';
        this.saving    = false;
        this.cdr.detectChanges();
      }
    });
  }

  openEdit(s: any) {
    this.editId    = s._id;
    this.editError = '';
    const start    = new Date(s.startTime);
    const end      = new Date(s.endTime);
    const pad      = (n: number) => n.toString().padStart(2, '0');
    this.editForm  = {
      type:      s.type      || 'court_hearing',
      status:    s.status    || 'scheduled',
      date:      `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`,
      startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
      endTime:   `${pad(end.getHours())}:${pad(end.getMinutes())}`,
      lawyerId:  s.lawyer?._id || s.lawyer?.id || '',
      location:  s.location || '',
      notes:     s.notes    || '',
    };
    this.editModal = true;
  }

  closeEdit() {
    this.editModal  = false;
    this.editError  = '';
    this.editSaving = false;
  }

  saveEdit() {
    if (!this.editForm.date || !this.editForm.startTime || !this.editForm.endTime) {
      this.editError = 'يرجى تعبئة التاريخ والوقت';
      return;
    }
    this.editSaving = true;
    this.editError  = '';
    const payload: any = {
      type:      this.editForm.type,
      status:    this.editForm.status,
      startTime: new Date(`${this.editForm.date}T${this.editForm.startTime}`).toISOString(),
      endTime:   new Date(`${this.editForm.date}T${this.editForm.endTime}`).toISOString(),
      location:  this.editForm.location,
      notes:     this.editForm.notes,
    };
    if (this.editForm.lawyerId) payload['lawyerId'] = this.editForm.lawyerId;

    this.svc.update(this.editId, payload).subscribe({
      next: () => {
        this.editSaving = false;
        this.closeEdit();
        this.load();
      },
      error: (err: any) => {
        this.editError  = err?.error?.message || 'حدث خطأ أثناء الحفظ';
        this.editSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteSession(id: string) {
    if (!confirm('هل تريد حذف هذه الجلسة؟')) return;
    this.svc.delete(id).subscribe({
      next: () => this.load(),
      error: (err: any) => console.error('Delete ERROR:', err)
    });
  }

  getLawyerName(l: any): string {
    if (!l) return '-';
    return l.name || l.user?.name || `${l.user?.firstName || ''} ${l.user?.lastName || ''}`.trim() || '-';
  }

  statusLabel(s: string): string {
    const m: any = { scheduled: 'مجدولة', completed: 'مكتملة', postponed: 'مؤجلة' };
    return m[s] || s;
  }

  typeLabel(t: string): string {
    const m: any = { court_hearing: 'جلسة محكمة', client_meeting: 'اجتماع عميل', internal_review: 'مراجعة داخلية' };
    return m[t] || t;
  }
}