// new-consultation-modal.component.ts
import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientsService } from '../../../core/services/index';
import { AuthService } from '../../../core/services/auth.service';
import { extractList } from '../../../core/services/api-helper';

@Component({
  selector: 'app-new-consultation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-consultation-modal.component.html',
})
export class NewConsultationModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  // clientId هيبقى فاضي في حالة العميل نفسه — الباك إند هو اللي هيحدده تلقائيًا
  @Output() create = new EventEmitter<{ clientId: string; title: string; initialMessage: string }>();

  title = signal('');
  initialMessage = signal('');
  clientId = signal('');
  submitted = signal(false);

  clients = signal<any[]>([]);
  loadingClients = signal(false);

  // لو المستخدم الحالي عميل، مايشوفش dropdown خالص، ومنعملش أي طلب لـ
  // /clients أصلاً — العميل ممنوع عليه (403) يشوف قائمة عملاء تانيين.
  isSelfClient = signal(false);

  constructor(private clientsService: ClientsService, private auth: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.auth.currentUser();
    const isClientRole = currentUser?.role === 'client';
    this.isSelfClient.set(isClientRole);

    // العميل نفسه: مش هيتبعت أي طلب لـ /clients خالص. الباك إند هيحدد
    // الـ Client بتاعه تلقائيًا وقت إنشاء الاستشارة.
    if (isClientRole) return;

    this.loadingClients.set(true);
    this.clientsService.getAll().subscribe({
      next: (res) => {
        this.clients.set(extractList(res));
        this.loadingClients.set(false);
      },
      error: () => this.loadingClients.set(false),
    });
  }

  clientDisplayName(c: any): string {
    return c.companyName ? `${c.fullName} (${c.companyName})` : c.fullName;
  }

  get isValid(): boolean {
    // في حالة العميل نفسه، مش مطلوب اختيار client — الباك إند هيحدده
    if (!this.isSelfClient() && this.clientId().trim().length === 0) return false;
    return this.title().trim().length > 0 && this.initialMessage().trim().length > 0;
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.isValid) return;
    this.create.emit({
      clientId: this.clientId(), // هتفضل فاضية في حالة العميل نفسه، ومش هتتبعت للباك إند
      title: this.title().trim(),
      initialMessage: this.initialMessage().trim(),
    });
  }
}