import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../core/services/index';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page" dir="rtl">
      <h1>🔍 البحث الشامل</h1>
      <div class="search-bar">
        <input type="search" [(ngModel)]="query" (keyup.enter)="search()" placeholder="ابحث في القضايا والمستندات..." />
        <button class="btn-primary" (click)="search()" [disabled]="loading">{{ loading ? '...' : 'بحث' }}</button>
      </div>

      <div class="loading" *ngIf="loading">جاري البحث...</div>

      <div *ngIf="!loading && searched">
        <p class="results-count">{{ results.length }} نتيجة لـ "{{ lastQuery }}"</p>
        <div class="results">
          <div class="result-item" *ngFor="let r of results">
            <div class="result-type" [class]="'type-' + r.type">{{ r.type === 'case' ? '📁 قضية' : '📄 مستند' }}</div>
            <div class="result-body">
              <ng-container *ngIf="r.type === 'case'">
                <a [routerLink]="['/cases', r.item._id]" class="result-title">{{ r.item.title }}</a>
                <div class="result-meta">{{ r.item.caseNumber }} • {{ r.item.client?.name }}</div>
              </ng-container>
              <ng-container *ngIf="r.type === 'document'">
                <a [href]="r.item.fileUrl" target="_blank" class="result-title">{{ r.item.title }}</a>
                <div class="result-meta">{{ r.item.case?.caseNumber }}</div>
              </ng-container>
            </div>
          </div>
          <div class="empty" *ngIf="results.length === 0">لا توجد نتائج</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { direction: rtl; font-family: 'Segoe UI', Tahoma, sans-serif; }
    h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0 0 20px; }
    .search-bar { display: flex; gap: 10px; margin-bottom: 20px; input { flex: 1; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; outline: none; &:focus { border-color: #2d4a8a; } } }
    .btn-primary { padding: 12px 24px; background: #1a2744; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; &:disabled { opacity: 0.7; } }
    .loading { text-align: center; padding: 60px; color: #718096; }
    .results-count { font-size: 14px; color: #718096; margin-bottom: 16px; }
    .results { display: flex; flex-direction: column; gap: 10px; }
    .result-item { display: flex; gap: 14px; background: #fff; border-radius: 10px; padding: 14px 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
    .result-type { font-size: 13px; font-weight: 500; padding: 4px 10px; border-radius: 8px; background: #edf2f7; color: #4a5568; flex-shrink: 0; height: fit-content; }
    .result-body { flex: 1; .result-title { font-size: 15px; font-weight: 500; color: #2b6cb0; text-decoration: none; &:hover { text-decoration: underline; } } .result-meta { font-size: 13px; color: #718096; margin-top: 4px; } }
    .empty { text-align: center; padding: 40px; color: #a0aec0; }
  `]
})
export class SearchComponent implements OnInit {
  query = '';
  results: any[] = [];
  loading = false;
  searched = false;
  lastQuery = '';
  totalResults = 0;

  constructor(private svc: SearchService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['q']) {
        this.query = p['q'];
        this.search();
      }
    });
  }

  search() {
    if (!this.query.trim()) return;
    this.loading = true;
    this.searched = false;
    this.lastQuery = this.query;

    this.svc.search(this.query).subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        const cases = (data.cases || []).map((item: any) => ({ type: 'case', item }));
        const documents = (data.documents || []).map((item: any) => ({ type: 'document', item }));
        this.results = [...cases, ...documents];
        this.totalResults = data.totalResults ?? this.results.length;
        this.loading = false;
        this.searched = true;
      },
      error: () => {
        this.results = [];
        this.totalResults = 0;
        this.loading = false;
        this.searched = true;
      }
    });
  }
}