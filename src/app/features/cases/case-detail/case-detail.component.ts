import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CasesService } from '../../../core/services/cases.service';
import { Case } from '../../../core/models';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="back"><a routerLink="/cases">← العودة للقضايا</a></div>

      <div *ngIf="loading" class="loading">جاري التحميل...</div>

      <div *ngIf="!loading && case">
        <div class="page-header">
          <div>
            <h1>{{ case.title }}</h1>
            <span class="case-num">رقم القضية: {{ case.caseNumber }}</span>
          </div>
          <div class="header-actions">
            <span class="badge status-{{case.status}} lg">{{ statusLabel(case.status) }}</span>
            <a [routerLink]="['/cases', case._id, 'edit']" class="btn-outline">✏️ تعديل</a>
          </div>
        </div>

        <div class="grid-2">
          <!-- Info Card -->
          <div class="card">
            <h2>معلومات القضية</h2>
            <div class="info-row"><span>العميل</span><strong>{{ case.client?.name }}</strong></div>
            <div class="info-row"><span>المحامي المسؤول</span><strong>{{ case.leadLawyer?.name }}</strong></div>
            <div class="info-row"><span>تاريخ الإنشاء</span><strong>{{ case.createdAt | date:'dd/MM/yyyy' }}</strong></div>
            <div class="info-row" *ngIf="case.description"><span>الوصف</span><span>{{ case.description }}</span></div>
          </div>

          <!-- Change Status -->
          <div class="card">
            <h2>تغيير الحالة</h2>
            <select [(ngModel)]="newStatus">
              <option value="draft">مسودة</option>
              <option value="under_review">قيد المراجعة</option>
              <option value="active">نشطة</option>
              <option value="court_session">جلسة</option>
              <option value="judgment_issued">صدر حكم</option>
              <option value="closed">مغلقة</option>
            </select>
            <textarea [(ngModel)]="statusNote" placeholder="ملاحظة (اختياري)" rows="2"></textarea>
            <button class="btn-primary" (click)="updateStatus()" [disabled]="updating">
              {{ updating ? 'جاري التحديث...' : 'تحديث الحالة' }}
            </button>
            <div class="success" *ngIf="statusSuccess">✅ تم التحديث</div>
          </div>
        </div>

        <!-- Add Note -->
        <div class="card">
          <h2>إضافة ملاحظة</h2>
          <div class="note-form">
            <textarea [(ngModel)]="noteText" placeholder="اكتب الملاحظة هنا..." rows="3"></textarea>
            <button class="btn-primary" (click)="addNote()" [disabled]="addingNote">
              {{ addingNote ? 'جاري الإضافة...' : 'إضافة' }}
            </button>
          </div>
        </div>

        <!-- Timeline -->
        <div class="card" *ngIf="case.timeline?.length">
          <h2>السجل الزمني</h2>
          <div class="timeline">
            <div class="timeline-item" *ngFor="let t of case.timeline">
              <div class="tl-dot"></div>
              <div class="tl-content">
                <div class="tl-action">{{ t.action }}</div>
                <div class="tl-note" *ngIf="t.note">{{ t.note }}</div>
                <div class="tl-meta">{{ t.by?.name }} — {{ t.at | date:'dd/MM/yyyy HH:mm' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .back a { color: #3182ce; text-decoration: none; font-size: 14px; display: inline-block; margin-bottom: 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; h1 { font-size: 22px; font-weight: 700; color: #1a2744; margin: 0 0 4px; } .case-num { color: #718096; font-size: 13px; } .header-actions { display: flex; align-items: center; gap: 10px; } }
    .btn-outline { padding: 8px 16px; border: 1px solid #1a2744; color: #1a2744; border-radius: 8px; text-decoration: none; font-size: 13px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    @media (max-width: 700px) { .grid-2 { grid-template-columns: 1fr; } }
    .card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; h2 { font-size: 15px; font-weight: 600; color: #2d3748; margin: 0 0 14px; } }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f7fafc; font-size: 14px; &:last-child { border-bottom: none; } span:first-child { color: #718096; } }
    select, textarea { width: 100%; padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; margin-bottom: 10px; outline: none; box-sizing: border-box; font-family: inherit; resize: vertical; }
    .btn-primary { padding: 10px 20px; background: #1a2744; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; &:disabled { opacity: 0.7; } }
    .success { color: #276749; font-size: 13px; margin-top: 8px; }
    .note-form { display: flex; gap: 10px; align-items: flex-end; textarea { flex: 1; margin-bottom: 0; } }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500; &.lg { font-size: 14px; padding: 6px 16px; } }
    .status-draft { background: #edf2f7; color: #4a5568; }
    .status-under_review { background: #ebf8ff; color: #2b6cb0; }
    .status-active { background: #f0fff4; color: #276749; }
    .status-court_session { background: #fffaf0; color: #c05621; }
    .status-judgment_issued { background: #faf5ff; color: #6b46c1; }
    .status-closed { background: #f7fafc; color: #718096; }
    .timeline { position: relative; padding-right: 20px; }
    .timeline-item { display: flex; gap: 12px; margin-bottom: 16px; &:last-child { margin-bottom: 0; } .tl-dot { width: 10px; height: 10px; border-radius: 50%; background: #1a2744; margin-top: 4px; flex-shrink: 0; } .tl-content { flex: 1; } .tl-action { font-size: 14px; font-weight: 500; color: #2d3748; } .tl-note { font-size: 13px; color: #4a5568; margin-top: 4px; } .tl-meta { font-size: 12px; color: #718096; margin-top: 4px; } }
    .loading { text-align: center; padding: 60px; color: #718096; }
  `]
})
export class CaseDetailComponent implements OnInit {
  case: Case | null = null;
  loading = true;
  newStatus = ''; statusNote = ''; updating = false; statusSuccess = false;
  noteText = ''; addingNote = false;

  constructor(private route: ActivatedRoute, private svc: CasesService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getById(id).subscribe({
      next: res => { this.case = (res as any).data || res; this.newStatus = this.case!.status; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  statusLabel(s: string) {
    const m: any = { draft: 'مسودة', under_review: 'قيد المراجعة', active: 'نشطة', court_session: 'جلسة', judgment_issued: 'صدر حكم', closed: 'مغلقة' };
    return m[s] || s;
  }

  updateStatus() {
    if (!this.case) return;
    this.updating = true;
    this.svc.updateStatus(this.case._id, this.newStatus, this.statusNote).subscribe({
      next: res => {
        this.case = (res as any).data || res;
        this.updating = false; this.statusSuccess = true;
        setTimeout(() => this.statusSuccess = false, 3000);
      },
      error: () => { this.updating = false; }
    });
  }

  addNote() {
    if (!this.case || !this.noteText.trim()) return;
    this.addingNote = true;
    this.svc.addNote(this.case._id, this.noteText).subscribe({
      next: res => { this.case = (res as any).data || res; this.noteText = ''; this.addingNote = false; },
      error: () => { this.addingNote = false; }
    });
  }
}
