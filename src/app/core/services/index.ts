
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { environment } from '../../../environments/environment';
// import { ApiResponse, Session, CreateSessionRequest, Document, Task, LegalDeadline, Consultation, Notification, AuditLog, User, SearchResult, CaseStatusReport, RevenueReport, LawyerPerformance } from '../models';

// const API = environment.apiUrl;

// // ─── Sessions ─────────────────────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class SessionsService {
//   constructor(private http: HttpClient) {}
//   getAll(params?: any) { return this.http.get<ApiResponse<Session[]>>(`${API}/sessions`, { params }); }
//   getById(id: string) { return this.http.get<ApiResponse<Session>>(`${API}/sessions/${id}`); }
//   create(data: CreateSessionRequest) { return this.http.post<ApiResponse<Session>>(`${API}/sessions`, data); }
//   update(id: string, data: any) { return this.http.patch<ApiResponse<Session>>(`${API}/sessions/${id}`, data); }
//   reschedule(id: string, data: any) { return this.http.post<ApiResponse<Session>>(`${API}/sessions/${id}/reschedule`, data); }
//   delete(id: string) { return this.http.delete(`${API}/sessions/${id}`); }
// }

// // ─── Documents ────────────────────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class DocumentsService {
//   constructor(private http: HttpClient) {}
//   getAll(caseId?: string) {
//     const params: Record<string, string> = caseId ? { case: caseId } : {};
//     return this.http.get<ApiResponse<Document[]>>(`${API}/documents`, { params });
//   }
//   upload(formData: FormData) { return this.http.post<ApiResponse<Document>>(`${API}/documents`, formData); }
//   addVersion(id: string, formData: FormData) { return this.http.post<ApiResponse<Document>>(`${API}/documents/${id}/versions`, formData); }
//   deleteVersion(id: string, versionNumber: number) { return this.http.delete(`${API}/documents/${id}/versions/${versionNumber}`); }
//   delete(id: string) { return this.http.delete(`${API}/documents/${id}`); }
// }

// // ─── Tasks ────────────────────────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class TasksService {
//   constructor(private http: HttpClient) {}
//   getAll(params?: any) { return this.http.get<ApiResponse<Task[]>>(`${API}/tasks`, { params }); }
//   getById(id: string) { return this.http.get<ApiResponse<Task>>(`${API}/tasks/${id}`); }
//   create(data: Partial<Task>) { return this.http.post<ApiResponse<Task>>(`${API}/tasks`, data); }
//   update(id: string, data: Partial<Task>) { return this.http.patch<ApiResponse<Task>>(`${API}/tasks/${id}`, data); }
//   delete(id: string) { return this.http.delete(`${API}/tasks/${id}`); }
// }

// // ─── Deadlines ────────────────────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class DeadlinesService {
//   constructor(private http: HttpClient) {}
//   getAll(params?: any) { return this.http.get<ApiResponse<LegalDeadline[]>>(`${API}/deadlines`, { params }); }
//   create(data: Partial<LegalDeadline>) { return this.http.post<ApiResponse<LegalDeadline>>(`${API}/deadlines`, data); }
//   updateStatus(id: string, status: string) { return this.http.patch<ApiResponse<LegalDeadline>>(`${API}/deadlines/${id}/status`, { status }); }
//   delete(id: string) { return this.http.delete(`${API}/deadlines/${id}`); }
// }

// // ─── Consultations ────────────────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class ConsultationsService {
//   constructor(private http: HttpClient) {}
//   getAll(params?: any) { return this.http.get<ApiResponse<Consultation[]>>(`${API}/consultations`, { params }); }
//   getById(id: string) { return this.http.get<ApiResponse<Consultation>>(`${API}/consultations/${id}`); }
//   create(data: Partial<Consultation>) { return this.http.post<ApiResponse<Consultation>>(`${API}/consultations`, data); }
//   sendMessage(id: string, text: string) { return this.http.post<ApiResponse<Consultation>>(`${API}/consultations/${id}/messages`, { text }); }
//   assign(id: string, lawyerId: string) { return this.http.patch<ApiResponse<Consultation>>(`${API}/consultations/${id}/assign`, { lawyerId }); }
//   convertToCase(id: string) { return this.http.post<ApiResponse<any>>(`${API}/consultations/${id}/convert-to-case`, {}); }
// }

// // ─── Users / Lawyers / Clients ────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class UsersService {
//   constructor(private http: HttpClient) {}
//   getAll(params?: any) { return this.http.get<ApiResponse<User[]>>(`${API}/users`, { params }); }
// getLawyers() { 
//   return this.http.get<ApiResponse<any[]>>(`${API}/lawyers`); 
// }  getClients() { return this.http.get<ApiResponse<User[]>>(`${API}/users`, { params: { role: 'client' } }); }
//   getById(id: string) { return this.http.get<ApiResponse<User>>(`${API}/users/${id}`); }
//   create(data: any) { return this.http.post<ApiResponse<User>>(`${API}/users`, data); }
//   update(id: string, data: any) { return this.http.patch<ApiResponse<User>>(`${API}/users/${id}`, data); }
//   delete(id: string) { return this.http.delete(`${API}/users/${id}`); }
//   getPerformance(id: string) { return this.http.get<ApiResponse<LawyerPerformance>>(`${API}/lawyers/${id}/performance`); }
//   registerFcmToken(token: string) { return this.http.post(`${API}/users/me/fcm-token`, { token }); }
// }

// // ─── Clients (Client model — منفصل عن User، بيحتوي fullName/companyName) ──────
// @Injectable({ providedIn: 'root' })
// export class ClientsService {
//   constructor(private http: HttpClient) {}
//   getAll(params?: any) { return this.http.get<ApiResponse<any[]>>(`${API}/clients`, { params }); }
//   getById(id: string) { return this.http.get<ApiResponse<any>>(`${API}/clients/${id}`); }
// }

// // ─── Notifications ────────────────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class NotificationsService {
//   constructor(private http: HttpClient) {}
//   getAll() { return this.http.get<ApiResponse<Notification[]>>(`${API}/notifications`); }
//   markRead(id: string) { return this.http.patch(`${API}/notifications/${id}/read`, {}); }
//   markAllRead() { return this.http.patch(`${API}/notifications/read-all`, {}); }
// }

// // ─── Audit Logs ───────────────────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class AuditLogsService {
//   constructor(private http: HttpClient) {}
//   getAll(params?: any) { return this.http.get<ApiResponse<AuditLog[]>>(`${API}/audit-logs`, { params }); }
// }

// // ─── Reports ─────────────────────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class ReportsService {
//   constructor(private http: HttpClient) {}
// getCaseStatus() { return this.http.get<any>(`${API}/reports/case-status`); }
//   getRevenue() { return this.http.get<ApiResponse<RevenueReport[]>>(`${API}/reports/revenue`); }
// }

// // ─── Search ───────────────────────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class SearchService {
//   constructor(private http: HttpClient) {}
//   search(q: string) { return this.http.get<ApiResponse<SearchResult[]>>(`${API}/search`, { params: { q } }); }
// }

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, Session, CreateSessionRequest, Document, Task, LegalDeadline, Consultation, Notification, AuditLog, User, SearchResult, CaseStatusReport, RevenueReport, LawyerPerformance } from '../models';

const API = environment.apiUrl;

// ─── Sessions ─────────────────────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class SessionsService {
//   constructor(private http: HttpClient) {}
//   getAll(params?: any) { return this.http.get<ApiResponse<Session[]>>(`${API}/sessions`, { params }); }
//   getById(id: string) { return this.http.get<ApiResponse<Session>>(`${API}/sessions/${id}`); }
//   create(data: CreateSessionRequest) { return this.http.post<ApiResponse<Session>>(`${API}/sessions`, data); }
//   update(id: string, data: any) { return this.http.patch<ApiResponse<Session>>(`${API}/sessions/${id}`, data); }
//   reschedule(id: string, data: any) { return this.http.post<ApiResponse<Session>>(`${API}/sessions/${id}/reschedule`, data); }
//   delete(id: string) { return this.http.delete(`${API}/sessions/${id}`); }
// }
// ─── Sessions ─────────────────────────────────────────────────────────────────
// ⚠️ استبدل كلاس SessionsService في core/services/index.ts بده
// التعديل الوحيد: update() بيستخدم PUT بدل PATCH (سبب الـ 404)
// لو ده مش حل المشكلة، ابعتلي ملف الـ routes بتاع sessions في الباك إند
// عشان نتأكد من الـ method والـ path الصح بالظبط.


@Injectable({ providedIn: 'root' })
export class SessionsService {
  constructor(private http: HttpClient) {}
  getAll(params?: any) { return this.http.get<ApiResponse<Session[]>>(`${API}/sessions`, { params }); }
  getById(id: string) { return this.http.get<ApiResponse<Session>>(`${API}/sessions/${id}`); }
  create(data: CreateSessionRequest) { return this.http.post<ApiResponse<Session>>(`${API}/sessions`, data); }
  reschedule(id: string, data: any) { return this.http.post<ApiResponse<Session>>(`${API}/sessions/${id}/reschedule`, data); }
  complete(id: string, data?: any) { return this.http.patch<ApiResponse<Session>>(`${API}/sessions/${id}/complete`, data || {}); }
  cancel(id: string) { return this.http.patch<ApiResponse<Session>>(`${API}/sessions/${id}/cancel`, {}); }
}

// ─── Documents ────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class DocumentsService {
  constructor(private http: HttpClient) {}
  getAll(caseId?: string) {
    const params: Record<string, string> = caseId ? { case: caseId } : {};
    return this.http.get<ApiResponse<Document[]>>(`${API}/documents`, { params });
  }
  upload(formData: FormData) { return this.http.post<ApiResponse<Document>>(`${API}/documents`, formData); }
  addVersion(id: string, formData: FormData) { return this.http.post<ApiResponse<Document>>(`${API}/documents/${id}/versions`, formData); }
  deleteVersion(id: string, versionNumber: number) { return this.http.delete(`${API}/documents/${id}/versions/${versionNumber}`); }
  delete(id: string) { return this.http.delete(`${API}/documents/${id}`); }
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(private http: HttpClient) {}
  getAll(params?: any) { return this.http.get<ApiResponse<Task[]>>(`${API}/tasks`, { params }); }
  getById(id: string) { return this.http.get<ApiResponse<Task>>(`${API}/tasks/${id}`); }
  create(data: Partial<Task>) { return this.http.post<ApiResponse<Task>>(`${API}/tasks`, data); }
  update(id: string, data: Partial<Task>) { return this.http.patch<ApiResponse<Task>>(`${API}/tasks/${id}`, data); }
  delete(id: string) { return this.http.delete(`${API}/tasks/${id}`); }
}

// ─── Deadlines ────────────────────────────────────────────────────────────────
// @Injectable({ providedIn: 'root' })
// export class DeadlinesService {
//   constructor(private http: HttpClient) {}
//   getAll(params?: any) { return this.http.get<ApiResponse<LegalDeadline[]>>(`${API}/deadlines`, { params }); }
//   create(data: Partial<LegalDeadline>) { return this.http.post<ApiResponse<LegalDeadline>>(`${API}/deadlines`, data); }
//   updateStatus(id: string, status: string) { return this.http.patch<ApiResponse<LegalDeadline>>(`${API}/deadlines/${id}/status`, { status }); }
//   delete(id: string) { return this.http.delete(`${API}/deadlines/${id}`); }
// }
@Injectable({ providedIn: 'root' })
export class DeadlinesService {
  constructor(private http: HttpClient) {}
  getAll(params?: any) { return this.http.get<ApiResponse<LegalDeadline[]>>(`${API}/deadlines`, { params }); }
  create(data: Partial<LegalDeadline>) { return this.http.post<ApiResponse<LegalDeadline>>(`${API}/deadlines`, data); }
  update(id: string, data: Partial<LegalDeadline>) { return this.http.put<ApiResponse<LegalDeadline>>(`${API}/deadlines/${id}`, data); }
  updateStatus(id: string, status: string) { return this.http.patch<ApiResponse<LegalDeadline>>(`${API}/deadlines/${id}/status`, { status }); }
  delete(id: string) { return this.http.delete(`${API}/deadlines/${id}`); }
}

// ─── Consultations ────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ConsultationsService {
  constructor(private http: HttpClient) {}
  getAll(params?: any) { return this.http.get<ApiResponse<Consultation[]>>(`${API}/consultations`, { params }); }
  getById(id: string) { return this.http.get<ApiResponse<Consultation>>(`${API}/consultations/${id}`); }
  create(data: Partial<Consultation>) { return this.http.post<ApiResponse<Consultation>>(`${API}/consultations`, data); }
  sendMessage(id: string, text: string) { return this.http.post<ApiResponse<Consultation>>(`${API}/consultations/${id}/messages`, { text }); }
  assign(id: string, lawyerId: string) { return this.http.patch<ApiResponse<Consultation>>(`${API}/consultations/${id}/assign`, { lawyerId }); }
  convertToCase(id: string) { return this.http.post<ApiResponse<any>>(`${API}/consultations/${id}/convert-to-case`, {}); }
}

// ─── Users / Lawyers / Clients ────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}
  getAll(params?: any) { return this.http.get<ApiResponse<User[]>>(`${API}/users`, { params }); }
getLawyers() { 
  return this.http.get<ApiResponse<any[]>>(`${API}/lawyers`); 
}
  createLawyer(data: any) { return this.http.post<ApiResponse<any>>(`${API}/lawyers`, data); }
  updateLawyer(id: string, data: any) { return this.http.patch<ApiResponse<any>>(`${API}/lawyers/${id}`, data); }
  deleteLawyer(id: string) { return this.http.delete(`${API}/lawyers/${id}`); }
  getClients() { return this.http.get<ApiResponse<User[]>>(`${API}/users`, { params: { role: 'client' } }); }
  getById(id: string) { return this.http.get<ApiResponse<User>>(`${API}/users/${id}`); }
  create(data: any) { return this.http.post<ApiResponse<User>>(`${API}/users`, data); }
  update(id: string, data: any) { return this.http.patch<ApiResponse<User>>(`${API}/users/${id}`, data); }
  delete(id: string) { return this.http.delete(`${API}/users/${id}`); }
  getPerformance(id: string) { return this.http.get<ApiResponse<LawyerPerformance>>(`${API}/lawyers/${id}/performance`); }
  registerFcmToken(token: string) { return this.http.post(`${API}/users/me/fcm-token`, { token }); }
}

// ─── Clients (Client model — منفصل عن User، بيحتوي fullName/companyName) ──────
@Injectable({ providedIn: 'root' })
export class ClientsService {
  constructor(private http: HttpClient) {}
  getAll(params?: any) { return this.http.get<ApiResponse<any[]>>(`${API}/clients`, { params }); }
  getById(id: string) { return this.http.get<ApiResponse<any>>(`${API}/clients/${id}`); }
}

// ─── Notifications ────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  constructor(private http: HttpClient) {}
  getAll() { return this.http.get<ApiResponse<Notification[]>>(`${API}/notifications`); }
  markRead(id: string) { return this.http.patch(`${API}/notifications/${id}/read`, {}); }
  markAllRead() { return this.http.patch(`${API}/notifications/read-all`, {}); }
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AuditLogsService {
  constructor(private http: HttpClient) {}
  getAll(params?: any) { return this.http.get<ApiResponse<AuditLog[]>>(`${API}/audit-logs`, { params }); }
}

// ─── Reports ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private http: HttpClient) {}
getCaseStatus() { return this.http.get<any>(`${API}/reports/case-status`); }
  getRevenue() { return this.http.get<ApiResponse<RevenueReport[]>>(`${API}/reports/revenue`); }
}

// ─── Search ───────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class SearchService {
  constructor(private http: HttpClient) {}
  search(q: string) { return this.http.get<ApiResponse<SearchResult[]>>(`${API}/search`, { params: { q } }); }
}