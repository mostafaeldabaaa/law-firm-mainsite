import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CasesService {
  private readonly BASE = `${environment.apiUrl}/cases`;
  constructor(private http: HttpClient) {}

  getAll(page = 1, limit = 10, status?: string, search?: string) {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (status) params = params.set('status', status);
    if (search) params = params.set('q', search);
    return this.http.get<any>(this.BASE, { params });
  }

  getById(id: string) { return this.http.get<any>(`${this.BASE}/${id}`); }
  create(data: any) { return this.http.post<any>(this.BASE, data); }
  update(id: string, data: any) { return this.http.patch<any>(`${this.BASE}/${id}`, data); }
  updateStatus(id: string, status: string, note?: string) {
    return this.http.patch<any>(`${this.BASE}/${id}/status`, { status, note });
  }
  addNote(id: string, note: string) {
    return this.http.post<any>(`${this.BASE}/${id}/notes`, { note });
  }
  delete(id: string) { return this.http.delete<any>(`${this.BASE}/${id}`); }
}
