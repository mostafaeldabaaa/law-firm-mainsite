import { Component, OnInit, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentsService } from '../../../core/services/index';
import { CasesService } from '../../../core/services/cases.service';

const CATEGORY_LABELS: Record<string, string> = {
  contract: 'عقد',
  judgment: 'حكم قضائي',
  memo: 'مذكرة',
  evidence: 'دليل/مستند إثبات',
  correspondence: 'مراسلات',
  other: 'أخرى',
};

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './document-list.component.html',
})
export class DocumentListComponent implements OnInit {
  // ✅ Signals بدل الحقول العادية — بتضمن تحديث الشاشة فورًا لحظة ما
  // البيانات توصل من الـ API، بدل ما تستنى تفاعل تاني من المستخدم
  // عشان Angular يعمل change detection (مشكلة شائعة مع التطبيقات
  // اللي فيها SDKs زي Firebase شغالة في مكان تاني من نفس التطبيق).
  docs = signal<any[]>([]);
  cases = signal<any[]>([]);
  loading = signal(false);
  caseFilter = signal('');
  showUpload = signal(false);
  uploading = signal(false);
  uploadError = signal('');
  uploadForm = signal({ caseId: '', title: '', category: '' });
  selectedFile = signal<File | null>(null);

  categoryLabels = CATEGORY_LABELS;
  categories = Object.keys(CATEGORY_LABELS);

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private svc: DocumentsService, private casesSvc: CasesService) {}

  ngOnInit() {
    this.loadCases();
    this.load();
  }

  private loadCases() {
    this.casesSvc.getAll(1, 100).subscribe({
      next: (res) => {
        const body: any = res;
        this.cases.set(body?.data?.cases || body?.data?.data || body?.data || []);
      },
      error: () => this.cases.set([]),
    });
  }

  load() {
    this.loading.set(true);
    this.svc.getAll(this.caseFilter() || undefined).subscribe({
      next: (res) => {
        const body: any = res;
        this.docs.set(body?.data?.documents || body?.data?.data || body?.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.docs.set([]);
        this.loading.set(false);
      },
    });
  }

  onCaseFilterChange(value: string): void {
    this.caseFilter.set(value);
    this.load();
  }

  caseName(c: any): string {
    return c.title || c.caseNumber || c.name || '-';
  }

  uploaderName(d: any): string {
    const u = d?.uploadedBy;
    if (!u) return '-';
    if (u.name) return u.name;
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || '-';
  }

  caseTitle(d: any): string {
    if (d?.case?.title) return d.case.title;
    const match = this.cases().find((c) => c._id === d?.case || c.id === d?.case);
    return match ? this.caseName(match) : '-';
  }

  fileUrl(d: any): string {
    const v = d?.versions?.[d.versions.length - 1];
    return v?.filePath || d?.fileUrl || '#';
  }

  categoryLabel(cat: string): string {
    return this.categoryLabels[cat] || cat || '-';
  }

  deleteDocument(d: any): void {
    const ok = confirm(`هل أنت متأكد من حذف المستند "${d.title}"؟ لا يمكن التراجع عن هذا الإجراء.`);
    if (!ok) return;

    this.svc.delete(d._id).subscribe({
      next: () => {
        // إزالة فورية من القائمة من غير ما نستنى إعادة تحميل كاملة
        this.docs.update((list) => list.filter((doc) => doc._id !== d._id));
      },
      error: (err) => {
        alert(err?.error?.message || 'حدث خطأ أثناء حذف المستند');
      },
    });
  }

  onFileChange(event: any) {
    this.selectedFile.set(event.target.files?.[0] || null);
  }

  openUpload(): void {
    this.uploadError.set('');
    this.uploadForm.set({ caseId: '', title: '', category: '' });
    this.selectedFile.set(null);
    this.showUpload.set(true);
  }

  updateUploadForm(field: 'caseId' | 'title' | 'category', value: string): void {
    this.uploadForm.update((f) => ({ ...f, [field]: value }));
  }

  upload() {
    const form = this.uploadForm();
    const file = this.selectedFile();
    if (!form.caseId || !form.title || !file) {
      this.uploadError.set('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    const fd = new FormData();
    fd.append('case', form.caseId);
    fd.append('title', form.title);
    if (form.category) fd.append('category', form.category);
    fd.append('file', file);

    this.uploading.set(true);
    this.uploadError.set('');
    this.svc.upload(fd).subscribe({
      next: () => {
        this.uploading.set(false);
        this.showUpload.set(false);
        this.load();
      },
      error: (err) => {
        this.uploadError.set(err?.error?.message || 'حدث خطأ أثناء الرفع');
        this.uploading.set(false);
      },
    });
  }
}