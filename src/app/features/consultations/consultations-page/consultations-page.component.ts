
// import { Component, OnInit, signal, computed, DestroyRef, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
// import { fromEvent, merge, of, switchMap, catchError, EMPTY, timer, map } from 'rxjs';
// import { ConsultationsService } from '../../../core/services/consultations.service';
// import { AuthService } from '../../../core/services/auth.service';
// import { UnreadTrackerService } from '../../../core/services/unread-tracker.service';
// import { Consultation, unwrapConsultation } from '../../../core/models/consultation.model';
// import { ConsultationsListComponent } from '../consultation-list/consultation-list.component';
// import { ConsultationChatComponent } from '../consultation-chat/consultation-chat.component';
// import { NewConsultationModalComponent } from '../new-consultation-modal/new-consultation-modal.component';

// const LIST_POLL_INTERVAL_MS = 15_000;
// const CHAT_POLL_INTERVAL_MS = 5_000;

// @Component({
//   selector: 'app-consultations-page',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ConsultationsListComponent,
//     ConsultationChatComponent,
//     NewConsultationModalComponent,
//   ],
//   templateUrl: './consultations-page.component.html',
// })
// export class ConsultationsPageComponent implements OnInit {
//   consultations = signal<Consultation[]>([]);
//   selectedId = signal<string | null>(null);
//   loading = signal(false);
//   errorMsg = signal<string | null>(null);
//   showNewModal = signal(false);

//   private destroyRef = inject(DestroyRef);
//   private unreadTracker = inject(UnreadTrackerService);

//   private selectedId$ = toObservable(this.selectedId);

//   // تيار "حالة الظهور" اللي بيبدأ بالحالة الحالية فورًا (of(document.visibilityState))
//   // وبعدين بيتحدث مع أي visibilitychange حقيقي. ده الفرق الجوهري عن الكود
//   // القديم اللي كان بيستني حدث visibilitychange عشان يبدأ أصلًا.
//   private visibility$ = merge(
//     of(document.visibilityState),
//     fromEvent(document, 'visibilitychange').pipe(map(() => document.visibilityState))
//   );

//   isClient = computed(() => this.auth.currentUser()?.role === 'client');

//   selected = computed(() => {
//     const list = this.consultations();
//     if (!Array.isArray(list)) return null;
//     return list.find((c) => c._id === this.selectedId()) ?? null;
//   });

//   constructor(private consultationsService: ConsultationsService, private auth: AuthService) {}

//   ngOnInit(): void {
//     this.loadConsultations();
//     this.startListPolling();
//     this.startChatPolling();
//   }

//   loadConsultations(): void {
//     this.loading.set(true);
//     this.errorMsg.set(null);
//     this.consultationsService.getAll().subscribe({
//       next: (res) => {
//         this.consultations.set(res.data?.consultations ?? []);
//         this.loading.set(false);
//       },
//       error: () => {
//         this.errorMsg.set('تعذر تحميل الاستشارات، حاول مرة أخرى');
//         this.loading.set(false);
//       },
//     });
//   }

//   /**
//    * تحديث القائمة كل 15 ثانية (status, lastMessageAt) — بيبدأ فورًا
//    * ويستمر تلقائيًا طول ما التاب ظاهر، من غير ما يستني أي حدث خارجي
//    * عشان "يشغّل نفسه".
//    */
//   private startListPolling(): void {
//     this.visibility$
//       .pipe(
//         switchMap((state) =>
//           state === 'visible' ? timer(0, LIST_POLL_INTERVAL_MS) : EMPTY
//         ),
//         switchMap(() => this.consultationsService.getAll().pipe(catchError(() => EMPTY))),
//         takeUntilDestroyed(this.destroyRef)
//       )
//       .subscribe((res) => {
//         const fresh = res.data?.consultations ?? [];
//         this.consultations.update((current) =>
//           fresh.map((freshItem) => {
//             const existing = current.find((c) => c._id === freshItem._id);
//             return existing?.messages ? { ...freshItem, messages: existing.messages } : freshItem;
//           })
//         );
//       });
//   }

//   /**
//    * تحديث رسائل الاستشارة المفتوحة كل 5 ثواني — بيبدأ فورًا لما تختار
//    * استشارة (من غير انتظار أول tick)، وبيوقف تلقائيًا لما تقفلها أو
//    * التاب يبقى في الخلفية.
//    */
//   private startChatPolling(): void {
//     merge(this.selectedId$, this.visibility$)
//       .pipe(
//         switchMap(() => {
//           const id = this.selectedId();
//           if (!id || document.visibilityState !== 'visible') return EMPTY;
//           return timer(0, CHAT_POLL_INTERVAL_MS);
//         }),
//         switchMap(() => {
//           const id = this.selectedId();
//           if (!id) return EMPTY;
//           return this.consultationsService.getById(id).pipe(catchError(() => EMPTY));
//         }),
//         takeUntilDestroyed(this.destroyRef)
//       )
//       .subscribe((res) => {
//         const detail = unwrapConsultation(res.data);
//         if (!detail) return;
//         this.consultations.update((list) =>
//           list.map((c) => (c._id === detail._id ? detail : c))
//         );
//         this.unreadTracker.markAsSeen(detail._id);
//       });
//   }

//   onSelect(id: string): void {
//     this.selectedId.set(id);
//     this.unreadTracker.markAsSeen(id);
//     // ملحوظة: مش محتاجين نداء getById يدوي هنا تاني — startChatPolling
//     // بقى بينفذ فورًا (timer(0, ...)) لما selectedId يتغير، فبيجيب
//     // التفاصيل بنفس السرعة من غير طلب مكرر يعمل race condition.
//   }

//   onMessageSent(payload: { id: string; text: string }): void {
//     this.consultationsService.sendMessage(payload.id, payload.text).subscribe({
//       next: (res) => {
//         const partial = res.data as
//           | { messages?: any[]; status?: string; lastMessageAt?: string; lastMessageBy?: string }
//           | undefined;
//         if (!partial) return;

//         this.unreadTracker.markAsSeen(payload.id);

//         this.consultations.update((list) =>
//           list.map((c) =>
//             c._id === payload.id
//               ? {
//                   ...c,
//                   messages: partial.messages ?? c.messages,
//                   status: (partial.status as any) ?? c.status,
//                   lastMessageAt: partial.lastMessageAt ?? c.lastMessageAt,
//                   lastMessageBy: (partial.lastMessageBy as any) ?? c.lastMessageBy,
//                 }
//               : c,
//           ),
//         );
//       },
//       error: (err) => console.error('فشل إرسال الرسالة:', err),
//     });
//   }

//   onAssign(payload: { id: string; lawyerId: string }): void {
//     this.consultationsService.assign(payload.id, payload.lawyerId).subscribe({
//       next: (res) => {
//         const detail = unwrapConsultation(res.data);
//         if (!detail) return;
//         this.consultations.update((list) =>
//           list.map((c) => (c._id === payload.id ? detail : c)),
//         );
//       },
//       error: (err) => console.error('فشل إسناد المحامي:', err),
//     });
//   }

//   onConvertToCase(id: string): void {
//     this.consultationsService.convertToCase(id).subscribe({
//       next: () => this.loadConsultations(),
//       error: (err) => console.error('فشل التحويل إلى قضية:', err),
//     });
//   }

//   openNewModal(): void {
//     this.showNewModal.set(true);
//   }

//   closeNewModal(): void {
//     this.showNewModal.set(false);
//   }

//   onCreate(payload: { clientId: string; title: string; initialMessage: string }): void {
//     const body: any = { subject: payload.title, description: payload.initialMessage };
//     if (payload.clientId) body.client = payload.clientId;

//     this.consultationsService.create(body).subscribe({
//       next: (res) => {
//         const detail = unwrapConsultation(res.data);
//         if (!detail) return;
//         this.consultations.update((list) => [detail, ...list]);
//         this.selectedId.set(detail._id);
//         this.unreadTracker.markAsSeen(detail._id);
//         this.closeNewModal();
//       },
//       error: (err) => console.error('فشل إنشاء الاستشارة:', err),
//     });
//   }
// }

// consultations-page.component.ts
// consultations-page.component.ts
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationsService } from '../../../core/services/consultations.service';
import { AuthService } from '../../../core/services/auth.service';
import { Consultation, unwrapConsultation } from '../../../core/models/consultation.model';
import { ConsultationsListComponent } from '../consultation-list/consultation-list.component';
import { ConsultationChatComponent } from '../consultation-chat/consultation-chat.component';
import { NewConsultationModalComponent } from '../new-consultation-modal/new-consultation-modal.component';

@Component({
  selector: 'app-consultations-page',
  standalone: true,
  imports: [
    CommonModule,
    ConsultationsListComponent,
    ConsultationChatComponent,
    NewConsultationModalComponent,
  ],
  templateUrl: './consultations-page.component.html',
})
export class ConsultationsPageComponent implements OnInit, OnDestroy {
  consultations = signal<Consultation[]>([]);
  selectedId = signal<string | null>(null);
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  showNewModal = signal(false);

  private readonly SEEN_KEY_PREFIX = 'consultation_last_seen_';
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  // زرار "استشارة جديدة" يظهر بس للعميل نفسه — طلب استشارة هو فعل
  // خاص بالعميل، الموظف/المحامي لا يطلبون استشارة لأنفسهم.
  isClient = computed(() => this.auth.currentUser()?.role === 'client');

  selected = computed(() => {
    const list = this.consultations();
    if (!Array.isArray(list)) return null;
    return list.find((c) => c._id === this.selectedId()) ?? null;
  });

  constructor(private consultationsService: ConsultationsService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadConsultations();

    // تحديث خفيف كل 20 ثانية عشان علامة "رسالة جديدة" تظهر للاستشارات
    // التانية اللي مش مفتوحة دلوقتي، من غير ما المستخدم يحتاج يعمل
    // refresh يدوي بنفسه.
    this.pollTimer = setInterval(() => this.loadConsultations(), 20000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  loadConsultations(): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.consultationsService.getAll().subscribe({
      next: (res) => {
        this.consultations.set(res.data?.consultations ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('تعذر تحميل الاستشارات، حاول مرة أخرى');
        this.loading.set(false);
      },
    });
  }

  onSelect(id: string): void {
    this.selectedId.set(id);
    // تسجيل إن الاستشارة دي "اتشافت دلوقتي" — عشان علامة "رسالة جديدة"
    // تختفي عنها فورًا لحد ما يجيلها تحديث تاني بعد الوقت ده.
    localStorage.setItem(this.SEEN_KEY_PREFIX + id, String(Date.now()));

    this.consultationsService.getById(id).subscribe({
      next: (res) => {
        const detail = unwrapConsultation(res.data);
        if (!detail) {
          console.error('شكل استجابة getById غير متوقع:', res);
          return;
        }
        this.consultations.update((list) =>
          list.map((c) => (c._id === id ? detail : c)),
        );
      },
      error: (err) => console.error('فشل تحميل تفاصيل الاستشارة:', err),
    });
  }

  onMessageSent(payload: { id: string; text: string }): void {
    this.consultationsService.sendMessage(payload.id, payload.text).subscribe({
      next: (res) => this.mergePartialMessages(payload.id, res.data),
      error: (err) => console.error('فشل إرسال الرسالة:', err),
    });
  }

  onAttachmentSent(payload: { id: string; file: File; text?: string }): void {
    this.consultationsService.sendMessageWithAttachment(payload.id, payload.file, payload.text).subscribe({
      next: (res) => this.mergePartialMessages(payload.id, res.data),
      error: (err) => console.error('فشل رفع المرفق:', err),
    });
  }

  // ملحوظة: الباك إند هنا بيرجع بس { messages, status }، مش الاستشارة
  // كاملة زي باقي العمليات (assign/convertToCase). لو استبدلنا الاستشارة
  // بالكامل بالـ response الناقص ده، بتفقد _id وباقي حقولها، وبالتالي
  // `selected()` مبيلاقيهاش تاني في القائمة والشات يقفل فجأة. الحل: ندمج
  // بس الحقول اللي رجعت.
  private mergePartialMessages(id: string, data: any): void {
    const partial = data as { messages?: any[]; status?: string } | undefined;
    if (!partial) return;
    this.consultations.update((list) =>
      list.map((c) =>
        c._id === id
          ? { ...c, messages: partial.messages ?? c.messages, status: (partial.status as any) ?? c.status }
          : c,
      ),
    );
  }

  onAssign(payload: { id: string; lawyerId: string }): void {
    this.consultationsService.assign(payload.id, payload.lawyerId).subscribe({
      next: (res) => {
        const detail = unwrapConsultation(res.data);
        if (!detail) return;
        this.consultations.update((list) =>
          list.map((c) => (c._id === payload.id ? detail : c)),
        );
      },
      error: (err) => console.error('فشل إسناد المحامي:', err),
    });
  }

  onConvertToCase(id: string): void {
    this.consultationsService.convertToCase(id).subscribe({
      next: () => this.loadConsultations(),
      error: (err) => console.error('فشل التحويل إلى قضية:', err),
    });
  }

  openNewModal(): void {
    this.showNewModal.set(true);
  }

  closeNewModal(): void {
    this.showNewModal.set(false);
  }

  onCreate(payload: { clientId: string; title: string; initialMessage: string }): void {
    const body: any = { subject: payload.title, description: payload.initialMessage };
    // client بيتبعت بس لو فعلاً متحدد (يعني موظف/إدارة بيسجل نيابة عن عميل).
    // في حالة العميل نفسه، الحقل ده هيفضل مش موجود والباك إند هيحدده تلقائيًا.
    if (payload.clientId) body.client = payload.clientId;

    this.consultationsService.create(body).subscribe({
        next: (res) => {
          const detail = unwrapConsultation(res.data);
          if (!detail) return;
          this.consultations.update((list) => [detail, ...list]);
          this.selectedId.set(detail._id);
          this.closeNewModal();
        },
        error: (err) => console.error('فشل إنشاء الاستشارة:', err),
      });
  }
}