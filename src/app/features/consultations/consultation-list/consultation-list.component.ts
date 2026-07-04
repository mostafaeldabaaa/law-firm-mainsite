
// import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Consultation, STATUS_LABELS } from '../../../core/models/consultation.model';
// import { UnreadTrackerService } from '../../../core/services/unread-tracker.service';

// @Component({
//   selector: 'app-consultations-list',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './consultation-list.component.html',
// })
// export class ConsultationsListComponent {
//   @Input({ required: true }) consultations: Consultation[] = [];
//   @Input() selectedId: string | null = null;
//   @Input() loading = false;
//   @Output() select = new EventEmitter<string>();

//   private unreadTracker = inject(UnreadTrackerService);

//   statusLabels = STATUS_LABELS;

//   trackById(_: number, item: Consultation): string {
//     return item._id;
//   }

//   /** true لو الاستشارة دى فيها رسالة جديدة ملحظتهاش لسه */
//   isUnread(item: Consultation): boolean {
//     // الاستشارة المفتوحة حالياً تعتبر دايمًا مقروءة
//     if (item._id === this.selectedId) return false;
//     return this.unreadTracker.isUnread(item._id, item.lastMessageAt);
//   }

//   /** بيتنادى عند الضغط على أى عنصر فى القائمة */
//   onSelect(item: Consultation): void {
//     this.unreadTracker.markAsSeen(item._id);
//     this.select.emit(item._id);
//   }
// }
// consultation-list.component.ts
// consultation-list.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Consultation, STATUS_LABELS } from '../../../core/models/consultation.model';

@Component({
  selector: 'app-consultations-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultation-list.component.html',
})
export class ConsultationsListComponent {
  @Input({ required: true }) consultations: Consultation[] = [];
  @Input() selectedId: string | null = null;
  @Input() loading = false;
  @Output() select = new EventEmitter<string>();

  statusLabels = STATUS_LABELS;

  private readonly SEEN_KEY_PREFIX = 'consultation_last_seen_';

  get pendingCount(): number {
    return this.consultations.filter(c => c.status === 'pending').length;
  }

  /**
   * علامة "رسالة جديدة": بنقارن آخر تحديث للاستشارة (updatedAt) بآخر
   * وقت فتحها فيه نفس المستخدم (متخزن في localStorage). لو الاستشارة
   * اتحدثت بعد آخر مرة فتحتها، يبقى فيها نشاط جديد ماشفتوش لسه.
   * الاستشارة المفتوحة حاليًا مستثناة دايمًا (عادي، انت شايفها بالفعل).
   */
  hasUnread(item: Consultation): boolean {
    if (item._id === this.selectedId) return false;
    if (!item.updatedAt) return false;

    const lastSeen = localStorage.getItem(this.SEEN_KEY_PREFIX + item._id);
    if (!lastSeen) return true; // ماتفتحتش قبل كده خالص

    return new Date(item.updatedAt).getTime() > Number(lastSeen);
  }

  trackById(_: number, item: Consultation): string {
    return item._id;
  }
}