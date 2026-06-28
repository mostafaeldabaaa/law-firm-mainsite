import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DocumentsService } from '../../../core/services/index';
import { CasesService } from '../../../core/services/cases.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header">
        <h1>📄 المستندات</h1>
        <button class="btn-primary" (click)="showUpload = !showUpload">➕ رفع مستند</button>
      </div>

      <!-- Upload Form -->
      <div class="upload-form card" *ngIf="showUpload">
        <h3>رفع مستند جديد</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>القضية *</label>
            <select [(ngModel)]="uploadForm.caseId">
              <option value="">اختر القضية</option>
              <option *ngFor="let c of cases" [value]="c._id">{{ c.caseNumber }} - {{ c.title }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>عنوان المستند *</label>
            <input type="text" [(ngModel)]="uploadForm.title" placeholder="عنوان المستند" />
          </div>
          <div class="form-group full">
            <label>الملف *</label>
            <input type="file" #fileInput (change)="onFileChange($event)" />
          </div>
        </div>
        <div class="error-msg" *ngIf="uploadError">{{ uploadError }}</div>
        <div class="form-actions">
          <button class="btn-primary" (click)="upload()" [disabled]="uploading">{{ uploading ? 'جاري الرفع...' : 'رفع' }}</button>
          <button class="btn-cancel" (click)="showUpload = false">إلغاء</button>
        </div>
      </div>

      <!-- Filter -->
      <div class="filters">
        <select [(ngModel)]="caseFilter" (ngModelChange)="load()">
          <option value="">كل القضايا</option>
          <option *ngFor="let c of cases" [value]="c._id">{{ c.caseNumber }}</option>
        </select>
      </div>

      <div class="loading" *ngIf="loading">جاري التحميل...</div>
      <div class="table-wrap" *ngIf="!loading">
        <table>
          <thead><tr><th>العنوان</th><th>القضية</th><th>رُفع بواسطة</th><th>التاريخ</th><th>تحميل</th></tr></thead>
          <tbody>
            <tr *ngFor="let d of docs">
              <td>{{ d.title }}</td>
              <td><a [routerLink]="['/cases', d.case?._id]" class="link">{{ d.case?.caseNumber }}</a></td>
              <td>{{ d.uploadedBy?.name }}</td>
              <td>{{ d.createdAt | date:'dd/MM/yyyy' }}</td>
              <td><a [href]="d.fileUrl" target="_blank" class="download-btn">⬇ تحميل</a></td>
            </tr>
            <tr *ngIf="docs.length === 0"><td colspan="5" class="empty">لا توجد مستندات</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; } }
    .btn-primary { padding: 10px 20px; background: #1a2744; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; h3 { font-size: 15px; font-weight: 600; color: #1a2744; margin: 0 0 14px; } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; &.full { grid-column: 1 / -1; } label { font-size: 13px; font-weight: 500; color: #4a5568; } }
    input[type=text], select, input[type=file] { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; }
    .error-msg { background: #fff5f5; color: #c53030; padding: 8px 12px; border-radius: 8px; font-size: 13px; margin-top: 8px; }
    .form-actions { display: flex; gap: 10px; margin-top: 14px; }
    .btn-cancel { padding: 10px 20px; border: 1px solid #e2e8f0; color: #4a5568; border-radius: 8px; cursor: pointer; background: #fff; font-size: 14px; }
    .filters { margin-bottom: 16px; select { padding: 9px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; } }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: auto; }
    table { width: 100%; border-collapse: collapse; th { background: #f7fafc; padding: 12px 16px; text-align: right; font-size: 13px; font-weight: 600; color: #4a5568; border-bottom: 1px solid #e2e8f0; } td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f7fafc; } tr:last-child td { border-bottom: none; } }
    .link { color: #2b6cb0; text-decoration: none; }
    .download-btn { color: #276749; text-decoration: none; font-size: 13px; }
    .empty { text-align: center; padding: 40px; color: #718096; }
  `]
})
export class DocumentListComponent implements OnInit {
  docs: any[] = []; cases: any[] = [];
  loading = false; caseFilter = '';
  showUpload = false; uploading = false; uploadError = '';
  uploadForm = { caseId: '', title: '' };
  selectedFile: File | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private svc: DocumentsService, private casesSvc: CasesService) {}

  ngOnInit() {
    this.casesSvc.getAll(1, 100).subscribe({ next: res => { const d = (res as any).data; this.cases = d?.data || d || []; } });
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.getAll(this.caseFilter || undefined).subscribe({
      next: res => { this.docs = (res as any).data || []; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFileChange(event: any) { this.selectedFile = event.target.files?.[0] || null; }

  upload() {
    if (!this.uploadForm.caseId || !this.uploadForm.title || !this.selectedFile) {
      this.uploadError = 'يرجى تعبئة جميع الحقول'; return;
    }
    const fd = new FormData();
    fd.append('caseId', this.uploadForm.caseId);
    fd.append('title', this.uploadForm.title);
    fd.append('file', this.selectedFile);
    this.uploading = true; this.uploadError = '';
    this.svc.upload(fd).subscribe({
      next: () => { this.uploading = false; this.showUpload = false; this.uploadForm = { caseId: '', title: '' }; this.selectedFile = null; this.load(); },
      error: err => { this.uploadError = err?.error?.message || 'خطأ في الرفع'; this.uploading = false; }
    });
  }
}
