import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TasksService, UsersService } from '../../../core/services/index';
import { CasesService } from '../../../core/services/cases.service';
import { extractList } from '../../../core/services/api-helper';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <div class="page-header">
        <h1>✅ المهام</h1>
        <button class="btn-primary" (click)="showForm = !showForm">➕ مهمة جديدة</button>
      </div>
      <div class="card" *ngIf="showForm">
        <h3>إضافة مهمة جديدة</h3>
        <div class="form-grid">
          <div class="form-group full"><label>العنوان *</label><input type="text" [(ngModel)]="form.title" /></div>
          <div class="form-group"><label>مسند إلى *</label>
            <select [(ngModel)]="form.assignedTo"><option value="">اختر</option><option *ngFor="let u of users" [value]="u._id">{{ getName(u) }}</option></select>
          </div>
          <div class="form-group"><label>الأولوية</label>
            <select [(ngModel)]="form.priority"><option value="low">منخفضة</option><option value="medium">متوسطة</option><option value="high">عالية</option></select>
          </div>
          <div class="form-group"><label>تاريخ الاستحقاق *</label><input type="date" [(ngModel)]="form.dueDate" /></div>
          <div class="form-group full"><label>الوصف</label><textarea [(ngModel)]="form.description" rows="2"></textarea></div>
        </div>
        <div class="error-msg" *ngIf="formError">{{ formError }}</div>
        <div class="form-actions">
          <button class="btn-primary" (click)="addTask()" [disabled]="saving">{{ saving ? 'جاري...' : 'حفظ' }}</button>
          <button class="btn-cancel" (click)="showForm = false">إلغاء</button>
        </div>
      </div>
      <div class="filters">
        <select [(ngModel)]="statusFilter" (ngModelChange)="load()">
          <option value="">كل الحالات</option>
          <option value="pending">معلقة</option><option value="in_progress">قيد التنفيذ</option><option value="completed">مكتملة</option><option value="overdue">متأخرة</option>
        </select>
        <select [(ngModel)]="priorityFilter" (ngModelChange)="load()">
          <option value="">كل الأولويات</option>
          <option value="high">عالية</option><option value="medium">متوسطة</option><option value="low">منخفضة</option>
        </select>
      </div>
      <div class="loading" *ngIf="loading">جاري التحميل...</div>
      <div class="empty-state" *ngIf="!loading && tasks.length === 0"><div class="empty-icon">✅</div><p>لا توجد مهام</p></div>
      <div class="tasks-list" *ngIf="!loading && tasks.length > 0">
        <div class="task-item" *ngFor="let t of tasks">
          <div class="task-priority" [class]="'p-' + t.priority"></div>
          <div class="task-body">
            <div class="task-title">{{ t.title }}</div>
            <div class="task-meta">
              <span>{{ getName(t.assignedTo) }}</span>
              <span *ngIf="t.case">• {{ t.case?.caseNumber }}</span>
              <span>• {{ t.dueDate | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
          <div class="task-actions">
            <span class="badge status-{{t.status}}">{{ statusLabel(t.status) }}</span>
            <select class="status-select" [(ngModel)]="t.status" (ngModelChange)="updateStatus(t)">
              <option value="pending">معلقة</option><option value="in_progress">قيد التنفيذ</option><option value="completed">مكتملة</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0; } }
    .btn-primary { padding: 10px 20px; background: #1a2744; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; &:disabled { opacity: 0.7; } }
    .card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; h3 { font-size: 15px; font-weight: 600; color: #1a2744; margin: 0 0 14px; } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; &.full { grid-column: 1/-1; } label { font-size: 13px; font-weight: 500; color: #4a5568; } }
    input, select, textarea { padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; }
    .error-msg { background: #fff5f5; color: #c53030; padding: 8px; border-radius: 8px; font-size: 13px; margin-top: 8px; }
    .form-actions { display: flex; gap: 10px; margin-top: 14px; }
    .btn-cancel { padding: 10px 20px; border: 1px solid #e2e8f0; color: #4a5568; border-radius: 8px; cursor: pointer; background: #fff; font-size: 14px; }
    .filters { display: flex; gap: 12px; margin-bottom: 16px; select { padding: 9px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; } }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .empty-state { text-align: center; padding: 60px; color: #a0aec0; .empty-icon { font-size: 48px; margin-bottom: 12px; } }
    .tasks-list { display: flex; flex-direction: column; gap: 10px; }
    .task-item { display: flex; align-items: center; gap: 14px; background: #fff; border-radius: 10px; padding: 14px 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
    .task-priority { width: 4px; height: 40px; border-radius: 2px; flex-shrink: 0; &.p-high { background: #e53e3e; } &.p-medium { background: #dd6b20; } &.p-low { background: #38a169; } }
    .task-body { flex: 1; .task-title { font-size: 15px; font-weight: 500; color: #2d3748; } .task-meta { font-size: 12px; color: #718096; margin-top: 4px; display: flex; gap: 8px; } }
    .task-actions { display: flex; align-items: center; gap: 10px; }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-pending { background: #fffaf0; color: #c05621; } .status-in_progress { background: #ebf8ff; color: #2b6cb0; } .status-completed { background: #f0fff4; color: #276749; } .status-overdue { background: #fff5f5; color: #c53030; }
    .status-select { padding: 5px 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; cursor: pointer; }
  `]
})
export class TaskListComponent implements OnInit {
  tasks: any[] = []; users: any[] = [];
  loading = false; statusFilter = ''; priorityFilter = '';
  showForm = false; saving = false; formError = '';
  form = { title: '', assignedTo: '', priority: 'medium', dueDate: '', description: '' };

  constructor(private svc: TasksService, private usersSvc: UsersService) {}
  ngOnInit() {
    this.usersSvc.getAll().subscribe({ next: res => { this.users = extractList(res); } });
    this.load();
  }
  load() {
    this.loading = true;
    const params: any = {};
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.priorityFilter) params.priority = this.priorityFilter;
    this.svc.getAll(params).subscribe({
      next: res => { this.tasks = extractList(res); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
  addTask() {
    if (!this.form.title || !this.form.assignedTo || !this.form.dueDate) { this.formError = 'يرجى تعبئة الحقول المطلوبة'; return; }
    this.saving = true; this.formError = '';
    this.svc.create(this.form as any).subscribe({
      next: () => { this.saving = false; this.showForm = false; this.form = { title:'', assignedTo:'', priority:'medium', dueDate:'', description:'' }; this.load(); },
      error: err => { this.formError = err?.error?.message || 'خطأ'; this.saving = false; }
    });
  }
  updateStatus(task: any) { this.svc.update(task._id, { status: task.status }).subscribe({ error: () => {} }); }
  getName(u: any) { return u?.name || `${u?.firstName||''} ${u?.lastName||''}`.trim() || '-'; }
  statusLabel(s: string) {
    const m: any = { pending:'معلقة', in_progress:'قيد التنفيذ', completed:'مكتملة', overdue:'متأخرة' };
    return m[s] || s;
  }
}
