import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConsultationsService, UsersService } from '../../../core/services/index';
import { firestoreDb } from '../../../core/firebase.config';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';

@Component({
  selector: 'app-consultation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="back"><a routerLink="/consultations">← العودة للاستشارات</a></div>
      <div *ngIf="loading" class="loading">جاري التحميل...</div>

      <div *ngIf="!loading && consult">
        <div class="page-header">
          <h1>{{ consult.subject }}</h1>
          <span class="badge status-{{consult.status}}">{{ statusLabel(consult.status) }}</span>
        </div>

        <div class="grid-2">
          <div class="card">
            <h2>تفاصيل الاستشارة</h2>
            <div class="info-row"><span>العميل</span><strong>{{ consult.client?.name }}</strong></div>
            <div class="info-row"><span>المحامي المسند</span><strong>{{ consult.assignedLawyer?.name || 'لم يُسند بعد' }}</strong></div>
            <div class="info-row"><span>التاريخ</span><strong>{{ consult.createdAt | date:'dd/MM/yyyy' }}</strong></div>
            <div class="desc">{{ consult.description }}</div>
          </div>

          <div class="card" *ngIf="isAdmin">
            <h2>إجراءات الإدارة</h2>
            <div class="form-group">
              <label>إسناد لمحامي</label>
              <select [(ngModel)]="selectedLawyer">
                <option value="">اختر المحامي</option>
                <option *ngFor="let l of lawyers" [value]="l._id">{{ l.name }}</option>
              </select>
              <button class="btn-sm" (click)="assign()">إسناد</button>
            </div>
            <button class="btn-convert" (click)="convertToCase()" *ngIf="!consult.convertedToCase">🔄 تحويل إلى قضية</button>
            <div class="converted" *ngIf="consult.convertedToCase">
              ✅ محولة إلى قضية: <a [routerLink]="['/cases', consult.convertedToCase?._id]">{{ consult.convertedToCase?.caseNumber }}</a>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div class="card messages-card">
          <h2>المحادثة</h2>
          <div class="messages">
            <div class="message" *ngFor="let m of consult.messages" [class.mine]="m.from?._id === currentUserId || m.senderId === currentUserId">
              <div class="msg-sender">{{ m.from?.name || m.senderName }}</div>
              <div class="msg-text">{{ m.text }}</div>
              <div class="msg-time">{{ (m.sentAt || m.createdAt) | date:'dd/MM HH:mm' }}</div>
            </div>
            <div class="no-msg" *ngIf="!consult.messages?.length">لا توجد رسائل بعد</div>
          </div>
          <div class="reply-form" *ngIf="consult.status !== 'closed'">
            <textarea [(ngModel)]="replyText" rows="2" placeholder="اكتب ردك هنا..."></textarea>
            <button class="btn-primary" (click)="sendReply()" [disabled]="sending">{{ sending ? '...' : 'إرسال' }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .back a { color: #3182ce; text-decoration: none; font-size: 14px; display: inline-block; margin-bottom: 16px; }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; flex: 1; } }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    @media (max-width: 700px) { .grid-2 { grid-template-columns: 1fr; } }
    .card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); h2 { font-size: 15px; font-weight: 600; color: #2d3748; margin: 0 0 14px; } }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f7fafc; font-size: 14px; &:last-of-type { border-bottom: none; } span { color: #718096; } }
    .desc { font-size: 14px; color: #4a5568; margin-top: 12px; line-height: 1.6; }
    .form-group { display: flex; flex-direction: column; gap: 8px; label { font-size: 13px; font-weight: 500; color: #4a5568; } select { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; } }
    .btn-sm { padding: 8px 16px; background: #1a2744; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; margin-top: 4px; }
    .btn-convert { margin-top: 16px; padding: 10px 16px; background: #276749; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; width: 100%; }
    .converted { margin-top: 12px; font-size: 14px; color: #276749; a { color: #276749; } }
    .messages-card { margin-bottom: 16px; }
    .messages { max-height: 350px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; padding: 4px; }
    .message { max-width: 70%; padding: 10px 14px; border-radius: 12px; background: #f7fafc; align-self: flex-start; &.mine { background: #ebf8ff; align-self: flex-end; } .msg-sender { font-size: 12px; font-weight: 600; color: #4a5568; margin-bottom: 4px; } .msg-text { font-size: 14px; color: #2d3748; } .msg-time { font-size: 11px; color: #a0aec0; margin-top: 4px; text-align: left; } }
    .no-msg { text-align: center; padding: 20px; color: #a0aec0; font-size: 14px; }
    .reply-form { display: flex; gap: 10px; align-items: flex-end; textarea { flex: 1; padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; resize: none; } }
    .btn-primary { padding: 10px 20px; background: #1a2744; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; &:disabled { opacity: 0.7; } }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500; flex-shrink: 0; }
    .status-pending { background: #fffaf0; color: #c05621; }
    .status-in_progress { background: #ebf8ff; color: #2b6cb0; }
    .status-answered { background: #f0fff4; color: #276749; }
    .status-closed { background: #edf2f7; color: #4a5568; }
  `]
})
export class ConsultationDetailComponent implements OnInit, OnDestroy {
  consult: any = null; lawyers: any[] = [];
  loading = true; replyText = ''; sending = false;
  selectedLawyer = ''; isAdmin = false; currentUserId = '';

  // بيوقف الاشتراك في Firestore لما نغادر الصفحة، عشان نمنع تسريب الذاكرة
  private unsubscribeMessages: Unsubscribe | null = null;

  constructor(private route: ActivatedRoute, private svc: ConsultationsService, private usersSvc: UsersService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); this.currentUserId = u._id; this.isAdmin = ['super_admin', 'branch_manager', 'senior_lawyer', 'lawyer'].includes(u.role); } catch {}

    this.svc.getById(id).subscribe({
      next: res => {
        this.consult = (res as any).data || res;
        this.loading = false;
        // بعد ما نجيب البيانات الأولية عن طريق HTTP، نبدأ الاستماع
        // اللحظي على Firestore عشان أي رسالة جديدة تظهر فورًا.
        this.listenToLiveMessages(id);
      },
      error: () => { this.loading = false; }
    });
    this.usersSvc.getLawyers().subscribe({ next: res => { this.lawyers = (res as any).data || []; } });
  }

  ngOnDestroy() {
    // مهم جدًا: نوقف الاشتراك لما نسيب الصفحة، وإلا هيفضل شغال في الخلفية
    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
    }
  }

  /**
   * بيفتح اشتراك لحظي (onSnapshot) على مسار
   * consultations/{id}/messages في Firestore.
   * أي رسالة جديدة تتضاف من أي طرف (عميل أو محامي) — سواء من نفس
   * المتصفح أو من جهاز تاني — هتوصل هنا فورًا من غير أي polling.
   */
  private listenToLiveMessages(consultationId: string) {
    const messagesRef = collection(firestoreDb, 'consultations', consultationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    this.unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const liveMessages = snapshot.docs.map(doc => {
        const data: any = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName || '',
          createdAt: data.createdAt,
        };
      });

      if (this.consult) {
        this.consult = { ...this.consult, messages: liveMessages };
      }
    }, (err) => {
      // لو Firestore فشل لأي سبب (اتصال، صلاحيات...)، منكسرش الصفحة —
      // المستخدم لسه شايف آخر نسخة جت من الـ HTTP request الأساسي.
      console.error('Firestore live messages error:', err);
    });
  }

  sendReply() {
    if (!this.replyText.trim()) return;
    this.sending = true;
    this.svc.sendMessage(this.consult._id, this.replyText).subscribe({
      // مش محتاجين نحدّث consult يدويًا من الـ response تاني —
      // الـ Firestore listener هيمسك الرسالة الجديدة أوتوماتيك أول
      // ما الباك إند يكتبها هناك بعد الحفظ في MongoDB.
      next: () => { this.replyText = ''; this.sending = false; },
      error: () => { this.sending = false; }
    });
  }

  assign() {
    if (!this.selectedLawyer) return;
    this.svc.assign(this.consult._id, this.selectedLawyer).subscribe({
      next: res => { this.consult = (res as any).data || res; },
      error: () => {}
    });
  }

  convertToCase() {
    this.svc.convertToCase(this.consult._id).subscribe({
      next: res => { const d = (res as any).data; if (d?.consultation) this.consult = d.consultation; },
      error: () => {}
    });
  }

  statusLabel(s: string) {
    const m: any = { pending: 'معلقة', in_progress: 'قيد المعالجة', answered: 'تمت الإجابة', closed: 'مغلقة' };
    return m[s] || s;
  }
}