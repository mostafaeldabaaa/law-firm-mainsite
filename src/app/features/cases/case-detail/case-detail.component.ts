// case-detail.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CasesService } from '../../../core/services/cases.service';
import { Case } from '../../../core/models';

type CaseStatus = 'draft' | 'under_review' | 'active' | 'court_session' | 'judgment_issued' | 'closed';

const STATUS_LABELS: Record<CaseStatus, string> = {
  draft: 'مسودة',
  under_review: 'قيد المراجعة',
  active: 'نشطة',
  court_session: 'جلسة',
  judgment_issued: 'صدر حكم',
  closed: 'مغلقة',
};

const STATUS_STYLES: Record<CaseStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
  under_review: { bg: 'bg-blue-50', text: 'text-blue-600' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  court_session: { bg: 'bg-amber-50', text: 'text-amber-600' },
  judgment_issued: { bg: 'bg-purple-50', text: 'text-purple-600' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

const TIMELINE_LABELS: Record<string, string> = {
  CASE_CREATED: 'تم إنشاء القضية',
  STATUS_CHANGED: 'تم تغيير الحالة',
  NOTE_ADDED: 'تمت إضافة ملاحظة',
};

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './case-detail.component.html',
})
export class CaseDetailComponent implements OnInit {
  case = signal<Case | null>(null);
  loading = signal(true);

  newStatus = '';
  statusNote = '';
  updating = signal(false);
  statusSuccess = signal(false);

  noteText = '';
  addingNote = signal(false);

  statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

  leadLawyerName = computed(() => {
    const lawyer: any = this.case()?.leadLawyer;
    if (!lawyer) return 'غير محدد';
    // الـ lawyer مفيهوش "name" مباشر — بس عنده بيانات كفاية للعرض بشكل مفيد
    return lawyer.fullName || lawyer.barNumber ? `محامٍ (${lawyer.barNumber})` : 'غير محدد';
  });

  constructor(private route: ActivatedRoute, private svc: CasesService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getById(id).subscribe({
      next: (res: any) => {
        const data: Case | null = res?.data?.case ?? null;
        this.case.set(data);
        this.newStatus = data?.status ?? '';
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  statusLabel(s: string): string {
    return STATUS_LABELS[s as CaseStatus] ?? s;
  }

  statusBg(s: string): string {
    return STATUS_STYLES[s as CaseStatus]?.bg ?? 'bg-gray-100';
  }

  statusText(s: string): string {
    return STATUS_STYLES[s as CaseStatus]?.text ?? 'text-gray-600';
  }

  timelineLabel(type: string): string {
    return TIMELINE_LABELS[type] ?? type;
  }

  updateStatus(): void {
    const current = this.case();
    if (!current) return;
    this.updating.set(true);
    this.svc.updateStatus(current._id, this.newStatus, this.statusNote).subscribe({
      next: (res: any) => {
        const updated: Case | null = res?.data?.case ?? null;
        if (updated) this.case.set(updated);
        this.updating.set(false);
        this.statusSuccess.set(true);
        this.statusNote = '';
        setTimeout(() => this.statusSuccess.set(false), 3000);
      },
      error: () => this.updating.set(false),
    });
  }

  addNote(): void {
    const current = this.case();
    if (!current || !this.noteText.trim()) return;
    this.addingNote.set(true);
    this.svc.addNote(current._id, this.noteText).subscribe({
      next: (res: any) => {
        const updated: Case | null = res?.data?.case ?? null;
        if (updated) this.case.set(updated);
        this.noteText = '';
        this.addingNote.set(false);
      },
      error: () => this.addingNote.set(false),
    });
  }
}