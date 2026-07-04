import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService, UsersService } from '../../../core/services/index';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.component.html',
  
})
export class TaskListComponent implements OnInit {

  // ─── State ───────────────────────────────────────────────────
  tasks:    any[] = [];
  users:    any[] = [];
  loading   = false;
  skeletonRows = Array(4);

  // ─── Filters ──────────────────────────────────────────────────
  statusFilter   = '';
  priorityFilter = '';

  // ─── Add Form ─────────────────────────────────────────────────
  showForm  = false;
  saving    = false;
  formError = '';
  form = {
    title:      '',
    assignedTo: '',
    priority:   'medium',
    dueDate:    '',
    description: ''
  };

  // ─── Computed ─────────────────────────────────────────────────
  get pendingCount(): number {
    return this.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  }

  constructor(
    private svc:      TasksService,
    private usersSvc: UsersService,
    private cdr:      ChangeDetectorRef  // ✅ أُضيف
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────────
  ngOnInit() {
    this.usersSvc.getAll().subscribe({
      next: (res: any) => {
        const root = res?.data ?? res;
        this.users = root?.users ?? root?.data ?? (Array.isArray(root) ? root : []);
        this.cdr.detectChanges(); // ✅
      },
      error: () => {}
    });
    this.load();
  }

  // ─── Load Tasks ───────────────────────────────────────────────
  load() {
    this.loading = true;
    this.cdr.detectChanges(); // ✅ يُظهر الـ skeleton فوراً

    const params: any = {};
    if (this.statusFilter)   params['status']   = this.statusFilter;
    if (this.priorityFilter) params['priority'] = this.priorityFilter;

    this.svc.getAll(params).subscribe({
      next: (res: any) => {
        const root = res?.data ?? res;
        const data =
          root?.tasks ??
          root?.data  ??
          (Array.isArray(root) ? root : []);

        this.tasks   = [...data]; // ✅ مصفوفة جديدة تجبر Angular على إعادة الرسم
        this.loading = false;
        this.cdr.detectChanges(); // ✅ الأهم
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges(); // ✅
      }
    });
  }

  // ─── Add Task ─────────────────────────────────────────────────
  addTask() {
    if (!this.form.title || !this.form.assignedTo || !this.form.dueDate) {
      this.formError = 'يرجى تعبئة الحقول المطلوبة';
      return;
    }
    this.saving    = true;
    this.formError = '';

    this.svc.create(this.form as any).subscribe({
      next: () => {
        this.saving   = false;
        this.showForm = false;
        this.form     = { title: '', assignedTo: '', priority: 'medium', dueDate: '', description: '' };
        this.load();
      },
      error: (err: any) => {
        this.formError = err?.error?.message || 'حدث خطأ أثناء الحفظ';
        this.saving    = false;
        this.cdr.detectChanges(); // ✅
      }
    });
  }

  // ─── Update Status (inline) ───────────────────────────────────
  updateStatus(task: any) {
    this.svc.update(task._id, { status: task.status }).subscribe({
      error: () => {}
    });
  }

  // ─── Delete ───────────────────────────────────────────────────
  deleteTask(id: string) {
    if (!confirm('هل تريد حذف هذه المهمة؟')) return;
    this.svc.delete(id).subscribe({ next: () => this.load() });
  }

  // ─── Helpers ──────────────────────────────────────────────────
  getName(u: any): string {
    if (!u) return '-';
    return u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || '-';
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      pending:     'معلقة',
      in_progress: 'قيد التنفيذ',
      completed:   'مكتملة',
      overdue:     'متأخرة'
    };
    return map[s] ?? s;
  }

  isOverdue(task: any): boolean {
    if (task.status === 'completed') return false;
    return task.dueDate ? new Date(task.dueDate) < new Date() : false;
  }
}