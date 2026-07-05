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
    .page {
      direction: rtl;
      font-family: 'Segoe UI', Tahoma, sans-serif;
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
      box-sizing: border-box;
    }
    h1 { font-size: 20px; font-weight: 700; color: #1a2744; margin: 0 0 20px; }

    .search-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;

      input {
        flex: 1;
        min-width: 0;
        padding: 12px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 15px;
        outline: none;
        box-sizing: border-box;
        &:focus { border-color: #2d4a8a; }
      }
    }

    .btn-primary {
      padding: 12px 24px;
      background: #1a2744;
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      white-space: nowrap;
      flex-shrink: 0;
      &:disabled { opacity: 0.7; cursor: not-allowed; }
    }

    .loading { text-align: center; padding: 60px 20px; color: #718096; }
    .results-count { font-size: 14px; color: #718096; margin-bottom: 16px; }
    .results { display: flex; flex-direction: column; gap: 10px; }

    .result-item {
      display: flex;
      gap: 14px;
      background: #fff;
      border-radius: 10px;
      padding: 14px 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      box-sizing: border-box;
    }

    .result-type {
      font-size: 13px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 8px;
      background: #edf2f7;
      color: #4a5568;
      flex-shrink: 0;
      height: fit-content;
      white-space: nowrap;
    }

    .result-body {
      flex: 1;
      min-width: 0;

      .result-title {
        font-size: 15px;
        font-weight: 500;
        color: #2b6cb0;
        text-decoration: none;
        word-break: break-word;
        &:hover { text-decoration: underline; }
      }
      .result-meta {
        font-size: 13px;
        color: #718096;
        margin-top: 4px;
        word-break: break-word;
      }
    }

    .empty { text-align: center; padding: 40px 20px; color: #a0aec0; }

    /* ===== Tablet ===== */
    @media (max-width: 900px) {
      .page { padding: 20px; max-width: 100%; }
    }

    /* ===== Mobile ===== */
    @media (max-width: 640px) {
      .page { padding: 14px; }
      h1 { font-size: 18px; margin-bottom: 16px; }

      .search-bar {
        flex-direction: column;
        gap: 8px;
      }
      .btn-primary {
        width: 100%;
      }

      .result-item {
        flex-direction: column;
        gap: 8px;
        padding: 12px 14px;
      }
      .result-type {
        align-self: flex-start;
      }
    }
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