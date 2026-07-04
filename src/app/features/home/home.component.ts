// home.component.ts
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  menuOpen = false;

  private revealObserver?: IntersectionObserver;

  // ملحوظة: الألقاب هنا افتراضية عمومًا (محامٍ) ما عدا محسن عبدالله
  // (الشريك المؤسس). لو عندك تخصص/لقب دقيق لكل شخص، ابعتهملي وأظبطهم.
  team = [
    { name: 'محسن عبدالله', title: 'الشريك المؤسس', role: 'رئيس المؤسسة' },
    { name: 'أحمد السيد', title: 'الأستاذ', role: 'محامٍ' },
    { name: 'منى فاروق', title: 'الأستاذة', role: 'محامية' },
    { name: 'كريم حسني', title: 'الأستاذ', role: 'محامٍ' },
    { name: 'ياسمين جمال', title: 'الأستاذة', role: 'محامية' },
    { name: 'هبة مصطفى', title: 'الأستاذة', role: 'محامية' },
  ];

  whyUs = [
    'فريق من المحامين والمستشارين المتخصصين في مختلف فروع القانون.',
    'متابعة شخصية ومستمرة لكل قضية من أول استشارة وحتى إغلاق الملف.',
    'التزام كامل بأعلى معايير النزاهة والسرية في التعامل مع عملائنا.',
    'رد سريع على استفسارات العملاء وشفافية كاملة في كل خطوة.',
    'خبرة تراكمية في تمثيل الأفراد والشركات أمام مختلف الجهات القضائية.',
  ];

  services = [
    'صياغة ومراجعة العقود التجارية والمدنية بمختلف أنواعها.',
    'تأسيس الشركات ومتابعة إجراءاتها القانونية من الألف إلى الياء.',
    'الدفاع الجنائي الشامل من التحقيق الابتدائي وحتى المرافعة.',
    'قضايا الأحوال الشخصية: طلاق، نفقة، حضانة، وميراث.',
    'تمثيل الأفراد والشركات في المنازعات والتحكيم التجاري.',
    'الاستشارات القانونية المستمرة لدعم الأنشطة التجارية والاستثمارية.',
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    private host: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    // لو المستخدم داخل حسابه بالفعل، مفيش داعي يشوف الصفحة التسويقية —
    // نوديه على طول للوحة التحكم بتاعته.
    if (this.auth.currentUser()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  ngAfterViewInit(): void {
    // تفعيل حركة الظهور التدريجي للأقسام لما تدخل الشاشة أثناء التمرير.
    // لو المتصفح مايدعمش IntersectionObserver، الأقسام تفضل ظاهرة عادي (fallback آمن).
    if (typeof IntersectionObserver === 'undefined') return;

    const sections = this.host.nativeElement.querySelectorAll<HTMLElement>('.reveal');
    if (!sections.length) return;

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    sections.forEach((section) => this.revealObserver?.observe(section));
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}