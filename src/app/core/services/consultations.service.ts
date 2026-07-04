// // consultations.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';
// import {
//   ApiResponse,
//   Consultation,
//   ConsultationsListData,
//   CreateConsultationPayload,
// } from '../models/consultation.model';

// const API = environment.apiUrl;

// @Injectable({ providedIn: 'root' })
// export class ConsultationsService {
//   constructor(private http: HttpClient) {}

//   /** جلب كل الاستشارات - الاستجابة: { data: { consultations: [...] }, meta: {...} } */
//   getAll(params?: Record<string, any>): Observable<ApiResponse<ConsultationsListData>> {
//     let httpParams = new HttpParams();
//     if (params) {
//       Object.keys(params).forEach((key) => {
//         if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
//           httpParams = httpParams.set(key, params[key]);
//         }
//       });
//     }
//     return this.http.get<ApiResponse<ConsultationsListData>>(`${API}/consultations`, {
//       params: httpParams,
//     });
//   }

//   getById(id: string): Observable<ApiResponse<Consultation>> {
//     return this.http.get<ApiResponse<Consultation>>(`${API}/consultations/${id}`);
//   }

//   create(data: Partial<CreateConsultationPayload>): Observable<ApiResponse<Consultation>> {
//     return this.http.post<ApiResponse<Consultation>>(`${API}/consultations`, data);
//   }

//   sendMessage(id: string, text: string): Observable<ApiResponse<Consultation>> {
//     return this.http.post<ApiResponse<Consultation>>(`${API}/consultations/${id}/messages`, {
//       text,
//     });
//   }

//   assign(id: string, lawyerId: string): Observable<ApiResponse<Consultation>> {
//     return this.http.patch<ApiResponse<Consultation>>(`${API}/consultations/${id}/assign`, {
//       assignedLawyer: lawyerId,
//     });
//   }

//   convertToCase(id: string, leadLawyer?: string): Observable<ApiResponse<any>> {
//     return this.http.post<ApiResponse<any>>(`${API}/consultations/${id}/convert-to-case`, {
//       leadLawyer,
//     });
//   }
// }

// consultations.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Consultation,
  ConsultationsListData,
  CreateConsultationPayload,
} from '../models/consultation.model';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ConsultationsService {
  constructor(private http: HttpClient) {}

  /** جلب كل الاستشارات - الاستجابة: { data: { consultations: [...] }, meta: {...} } */
  getAll(params?: Record<string, any>): Observable<ApiResponse<ConsultationsListData>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<ApiResponse<ConsultationsListData>>(`${API}/consultations`, {
      params: httpParams,
    });
  }

  getById(id: string): Observable<ApiResponse<Consultation>> {
    return this.http.get<ApiResponse<Consultation>>(`${API}/consultations/${id}`);
  }

  create(data: Partial<CreateConsultationPayload>): Observable<ApiResponse<Consultation>> {
    return this.http.post<ApiResponse<Consultation>>(`${API}/consultations`, data);
  }

  sendMessage(id: string, text: string): Observable<ApiResponse<Consultation>> {
    return this.http.post<ApiResponse<Consultation>>(`${API}/consultations/${id}/messages`, {
      text,
    });
  }

  /**
   * زي sendMessage تمامًا بس بتدعم إرفاق ملف (صورة/PDF/Word). بنبعت
   * FormData بدل JSON عشان الملف الخام. النص اختياري — ممكن تبعت
   * مرفق لوحده من غير نص مصاحب.
   */
  sendMessageWithAttachment(id: string, file: File, text?: string): Observable<ApiResponse<Consultation>> {
    const formData = new FormData();
    if (text) formData.append('text', text);
    formData.append('attachment', file);
    return this.http.post<ApiResponse<Consultation>>(`${API}/consultations/${id}/messages`, formData);
  }

  assign(id: string, lawyerId: string): Observable<ApiResponse<Consultation>> {
    return this.http.patch<ApiResponse<Consultation>>(`${API}/consultations/${id}/assign`, {
      assignedLawyer: lawyerId,
    });
  }

  convertToCase(id: string, leadLawyer?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API}/consultations/${id}/convert-to-case`, {
      leadLawyer,
    });
  }
}