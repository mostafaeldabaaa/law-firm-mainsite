import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsersService } from '../../../core/services/index';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './client-form.component.html',
})
export class ClientFormComponent implements OnInit {
  isEdit = false;
  clientId: string | null = null;

  loading = false;
  saving = false;
  errorMsg = '';

  form: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    isActive: true,
    password: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: UsersService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.clientId;

    if (this.isEdit) {
      this.loading = true;
      this.svc.getById(this.clientId!).subscribe({
        next: (res: any) => {
          this.zone.run(() => {
            const u = res?.data?.user ?? res?.data ?? res ?? {};
            this.form = {
              firstName: u.firstName || '',
              lastName: u.lastName || '',
              email: u.email || '',
              phone: u.phone || '',
              nationalId: u.nationalId || '',
              isActive: u.isActive ?? true,
            };
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.errorMsg = 'تعذّر تحميل بيانات العميل';
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
      });
    }
  }

  submit() {
    if (!this.form.firstName || !this.form.lastName || !this.form.email) {
      this.errorMsg = 'يرجى إدخال الاسم الأول والأخير والبريد الإلكتروني';
      return;
    }
    if (!this.isEdit && !this.form.password) {
      this.errorMsg = 'يرجى إدخال كلمة مرور مبدئية للعميل';
      return;
    }

    this.errorMsg = '';
    this.saving = true;

    const payload: any = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      phone: this.form.phone || null,
      nationalId: this.form.nationalId || null,
      isActive: this.form.isActive,
    };

    // بنستخدم الميثودز الفعلية الموجودة في UsersService: create() و update()
    const request$ = this.isEdit
      ? this.svc.update(this.clientId!, payload)
      : this.svc.create({ ...payload, password: this.form.password, role: 'client' });

    request$.subscribe({
      next: () => {
        this.zone.run(() => {
          this.saving = false;
          this.router.navigate(this.isEdit ? ['/clients', this.clientId] : ['/clients']);
        });
      },
      error: (err: any) => {
        this.zone.run(() => {
          this.errorMsg = err?.error?.message || 'حدث خطأ أثناء الحفظ';
          this.saving = false;
          this.cdr.detectChanges();
        });
      },
    });
  }
}