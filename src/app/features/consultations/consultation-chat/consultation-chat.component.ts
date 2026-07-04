
// import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, computed, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Consultation, ConsultationMessage } from '../../../core/models/consultation.model';
// import { AuthService } from '../../../core/services/auth.service';
// import { UsersService } from '../../../core/services/index';
// import { extractList } from '../../../core/services/api-helper';
// import { firestoreDb } from '../../../core/firebase.config';
// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   Unsubscribe,
// } from 'firebase/firestore';

// @Component({
//   selector: 'app-consultation-chat',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './consultation-chat.component.html',
// })
// export class ConsultationChatComponent implements OnInit, OnChanges, OnDestroy {
//   @Input({ required: true }) consultation!: Consultation;

//   @Output() sendMessage = new EventEmitter<{ id: string; text: string }>();
//   @Output() assignLawyer = new EventEmitter<{ id: string; lawyerId: string }>();
//   @Output() convertToCase = new EventEmitter<string>();

//   draft = signal('');
//   showAssignBox = signal(false);
//   lawyerIdDraft = signal('');
//   lawyers = signal<any[]>([]);

//   // الرسائل اللي فعليًا بتتعرض — بتتحدث لحظيًا من Firestore، مش من
//   // الـ @Input الثابت بس. بنبدأها بالرسائل الأولية الجاية من الـ HTTP.
//   liveMessages = signal<ConsultationMessage[]>([]);

//   private unsubscribeMessages: Unsubscribe | null = null;
//   private currentListenerId: string | null = null;

//   // إسناد محامٍ وتحويل الاستشارة لقضية إجراءات إدارية حساسة —
//   // بتظهر بس لـ super_admin أو branch_manager.
//   canManage = computed(() => {
//     const role = this.auth.currentUser()?.role;
//     return role === 'super_admin' || role === 'branch_manager';
//   });

//   constructor(private auth: AuthService, private usersService: UsersService) {}

//   ngOnInit(): void {
//     if (this.canManage()) {
//       this.usersService.getLawyers().subscribe({
//         next: (res) => this.lawyers.set(extractList(res)),
//         error: () => this.lawyers.set([]),
//       });
//     }
//     this.syncLiveMessages();
//   }

//   // الشات ده بيتعاد استخدامه لما تختار استشارة تانية من القائمة (نفس
//   // الكومبوننت بيتحدّث بس الـ @Input بيتغير) — لازم نبدّل الاشتراك
//   // على Firestore لنفس معرف الاستشارة الجديد.
//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['consultation']) {
//       // ندمج أي رسائل جاية من HTTP (سواء أول مرة أو تحديث لاحق بعد
//       // إرسال رسالة) — كده حتى لو Firestore اتأخر أو فشل، الرسالة
//       // الجديدة لسه هتظهر لأنها جاية أصلاً من رد الـ API.
//       this.mergeHttpMessages();
//       this.syncLiveMessages();
//     }
//   }

//   private mergeHttpMessages(): void {
//     (this.consultation.messages || []).forEach((m) => {
//       const key = m._id || m.id;
//       if (key) this.messageMap.set(key, m);
//     });
//     this.publishMergedMessages();
//   }

//   ngOnDestroy(): void {
//     this.unsubscribeMessages?.();
//   }

//   private messageMap = new Map<string, ConsultationMessage>();

//   private syncLiveMessages(): void {
//     if (!this.consultation?._id) return;
//     if (this.currentListenerId === this.consultation._id) return; // لسه نفس الاستشارة، مفيش داعي نعيد الاشتراك

//     this.unsubscribeMessages?.();
//     this.currentListenerId = this.consultation._id;

//     // نبدأ بالرسائل الجاية من MongoDB (عبر HTTP) — دي المصدر الأساسي
//     // ومتضمنة أي رسائل قديمة اتعملت قبل ما نفعّل مزامنة Firestore.
//     this.messageMap = new Map();
//     (this.consultation.messages || []).forEach((m) => {
//       const key = m._id || m.id;
//       if (key) this.messageMap.set(key, m);
//     });
//     this.publishMergedMessages();

//     const messagesRef = collection(firestoreDb, 'consultations', this.consultation._id, 'messages');
//     const q = query(messagesRef, orderBy('createdAt', 'asc'));

//     this.unsubscribeMessages = onSnapshot(
//       q,
//       (snapshot) => {
//         // بندمج، مش بنستبدل — أي رسالة جديدة أو محدّثة من Firestore
//         // بتتضاف/تتحدث في نفس الـ map، والرسائل القديمة اللي مش
//         // موجودة في Firestore (اتعملت قبل تفعيل المزامنة) بتفضل ظاهرة.
//         snapshot.docs.forEach((doc) => {
//           const data: any = doc.data();
//           this.messageMap.set(doc.id, {
//             _id: doc.id,
//             text: data.text,
//             senderId: data.senderId,
//             senderName: data.senderName,
//             senderRole: data.senderRole,
//             createdAt: data.createdAt,
//           });
//         });
//         this.publishMergedMessages();
//       },
//       (err) => {
//         // لو Firestore فشل لأي سبب، منكسرش الشات — يفضل عارض آخر نسخة
//         // جت من HTTP بدل ما يقف تمامًا.
//         console.error('Firestore live messages error:', err);
//       }
//     );
//   }

//   private publishMergedMessages(): void {
//     const merged = Array.from(this.messageMap.values()).sort(
//       (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//     );
//     this.liveMessages.set(merged);
//   }

//   lawyerDisplayName(l: any): string {
//     const name = `${l.user?.firstName || ''} ${l.user?.lastName || ''}`.trim();
//     return name || l.barNumber || 'محامٍ';
//   }

//   submitMessage(): void {
//     const text = this.draft().trim();
//     if (!text) return;
//     this.sendMessage.emit({ id: this.consultation._id, text });
//     this.draft.set('');
//   }

//   submitAssign(): void {
//     const lawyerId = this.lawyerIdDraft().trim();
//     if (!lawyerId) return;
//     this.assignLawyer.emit({ id: this.consultation._id, lawyerId });
//     this.showAssignBox.set(false);
//     this.lawyerIdDraft.set('');
//   }

//   onConvertToCase(): void {
//     this.convertToCase.emit(this.consultation._id);
//   }

//   initials(name?: string): string {
//     if (!name) return '؟';
//     return name.trim().charAt(0);
//   }

//   roleLabel(role?: string): string {
//     // الموظف/الإدارة بيردوا نيابة عن المكتب، وبيظهروا للعميل باسم
//     // "المحامي" مش "الموظف" — ده تصنيف داخلي بس، مش المفروض يبان للعميل.
//     const map: Record<string, string> = { client: 'العميل', lawyer: 'المحامي', staff: 'المحامي' };
//     return role ? (map[role] || role) : '';
//   }
// }

// consultation-chat.component.ts
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Consultation, ConsultationMessage } from '../../../core/models/consultation.model';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/index';
import { extractList } from '../../../core/services/api-helper';
import { firestoreDb } from '../../../core/firebase.config';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';

@Component({
  selector: 'app-consultation-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultation-chat.component.html',
})
export class ConsultationChatComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) consultation!: Consultation;

  @Output() sendMessage = new EventEmitter<{ id: string; text: string }>();
  @Output() sendAttachment = new EventEmitter<{ id: string; file: File; text?: string }>();
  @Output() assignLawyer = new EventEmitter<{ id: string; lawyerId: string }>();
  @Output() convertToCase = new EventEmitter<string>();

  // حد أقصى 10MB ونفس أنواع الملفات المسموحة في الباك إند (upload.js)
  private readonly MAX_FILE_MB = 10;
  private readonly ALLOWED_TYPES = ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];

  uploadError = signal('');

  draft = signal('');
  showAssignBox = signal(false);
  lawyerIdDraft = signal('');
  lawyers = signal<any[]>([]);

  // الرسائل اللي فعليًا بتتعرض — بتتحدث لحظيًا من Firestore، مش من
  // الـ @Input الثابت بس. بنبدأها بالرسائل الأولية الجاية من الـ HTTP.
  liveMessages = signal<ConsultationMessage[]>([]);

  private unsubscribeMessages: Unsubscribe | null = null;
  private currentListenerId: string | null = null;

  // إسناد محامٍ وتحويل الاستشارة لقضية إجراءات إدارية حساسة —
  // بتظهر بس لـ super_admin أو branch_manager.
  canManage = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === 'super_admin' || role === 'branch_manager';
  });

  constructor(private auth: AuthService, private usersService: UsersService) {}

  ngOnInit(): void {
    if (this.canManage()) {
      this.usersService.getLawyers().subscribe({
        next: (res) => this.lawyers.set(extractList(res)),
        error: () => this.lawyers.set([]),
      });
    }
    this.syncLiveMessages();
  }

  // الشات ده بيتعاد استخدامه لما تختار استشارة تانية من القائمة (نفس
  // الكومبوننت بيتحدّث بس الـ @Input بيتغير) — لازم نبدّل الاشتراك
  // على Firestore لنفس معرف الاستشارة الجديد.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['consultation']) {
      // ندمج أي رسائل جاية من HTTP (سواء أول مرة أو تحديث لاحق بعد
      // إرسال رسالة) — كده حتى لو Firestore اتأخر أو فشل، الرسالة
      // الجديدة لسه هتظهر لأنها جاية أصلاً من رد الـ API.
      this.mergeHttpMessages();
      this.syncLiveMessages();
    }
  }

  private mergeHttpMessages(): void {
    (this.consultation.messages || []).forEach((m) => {
      const key = m._id || m.id;
      if (key) this.messageMap.set(key, m);
    });
    this.publishMergedMessages();
  }

  ngOnDestroy(): void {
    this.unsubscribeMessages?.();
  }

  private messageMap = new Map<string, ConsultationMessage>();

  private syncLiveMessages(): void {
    if (!this.consultation?._id) return;
    if (this.currentListenerId === this.consultation._id) return; // لسه نفس الاستشارة، مفيش داعي نعيد الاشتراك

    this.unsubscribeMessages?.();
    this.currentListenerId = this.consultation._id;

    // نبدأ بالرسائل الجاية من MongoDB (عبر HTTP) — دي المصدر الأساسي
    // ومتضمنة أي رسائل قديمة اتعملت قبل ما نفعّل مزامنة Firestore.
    this.messageMap = new Map();
    (this.consultation.messages || []).forEach((m) => {
      const key = m._id || m.id;
      if (key) this.messageMap.set(key, m);
    });
    this.publishMergedMessages();

    const messagesRef = collection(firestoreDb, 'consultations', this.consultation._id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    this.unsubscribeMessages = onSnapshot(
      q,
      (snapshot) => {
        // بندمج، مش بنستبدل — أي رسالة جديدة أو محدّثة من Firestore
        // بتتضاف/تتحدث في نفس الـ map، والرسائل القديمة اللي مش
        // موجودة في Firestore (اتعملت قبل تفعيل المزامنة) بتفضل ظاهرة.
        snapshot.docs.forEach((doc) => {
          const data: any = doc.data();
          this.messageMap.set(doc.id, {
            _id: doc.id,
            text: data.text,
            senderId: data.senderId,
            senderName: data.senderName,
            senderRole: data.senderRole,
            attachmentUrl: data.attachmentUrl || null,
            attachmentName: data.attachmentName || null,
            attachmentType: data.attachmentType || null,
            createdAt: data.createdAt,
          });
        });
        this.publishMergedMessages();
      },
      (err) => {
        // لو Firestore فشل لأي سبب، منكسرش الشات — يفضل عارض آخر نسخة
        // جت من HTTP بدل ما يقف تمامًا.
        console.error('Firestore live messages error:', err);
      }
    );
  }

  private publishMergedMessages(): void {
    const merged = Array.from(this.messageMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    this.liveMessages.set(merged);
  }

  lawyerDisplayName(l: any): string {
    const name = `${l.user?.firstName || ''} ${l.user?.lastName || ''}`.trim();
    return name || l.barNumber || 'محامٍ';
  }

  submitMessage(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.sendMessage.emit({ id: this.consultation._id, text });
    this.draft.set('');
  }

  onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // يسمح باختيار نفس الملف تاني لو احتاج
    if (!file) return;

    this.uploadError.set('');

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.uploadError.set('نوع الملف غير مدعوم (PDF, Word, أو صورة بس)');
      return;
    }
    if (file.size > this.MAX_FILE_MB * 1024 * 1024) {
      this.uploadError.set(`حجم الملف أكبر من ${this.MAX_FILE_MB} ميجا`);
      return;
    }

    this.sendAttachment.emit({ id: this.consultation._id, file, text: this.draft().trim() || undefined });
    this.draft.set('');
  }

  submitAssign(): void {
    const lawyerId = this.lawyerIdDraft().trim();
    if (!lawyerId) return;
    this.assignLawyer.emit({ id: this.consultation._id, lawyerId });
    this.showAssignBox.set(false);
    this.lawyerIdDraft.set('');
  }

  onConvertToCase(): void {
    this.convertToCase.emit(this.consultation._id);
  }

  initials(name?: string): string {
    if (!name) return '؟';
    return name.trim().charAt(0);
  }

  roleLabel(role?: string): string {
    // الموظف/الإدارة بيردوا نيابة عن المكتب، وبيظهروا للعميل باسم
    // "المحامي" مش "الموظف" — ده تصنيف داخلي بس، مش المفروض يبان للعميل.
    const map: Record<string, string> = { client: 'العميل', lawyer: 'المحامي', staff: 'المحامي' };
    return role ? (map[role] || role) : '';
  }
}