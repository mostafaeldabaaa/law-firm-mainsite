

// export type ConsultationStatus =
//   | 'pending'
//   | 'in_progress'
//   | 'answered'
//   | 'closed'
//   | 'converted_to_case';

// export interface ApiMeta {
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

// export interface ApiResponse<T> {
//   success: boolean;
//   message?: string;
//   data: T;
//   meta?: ApiMeta;
// }

// export interface ConsultationClient {
//   _id: string;
//   fullName: string;
//   companyName: string | null;
// }

// export interface LawyerPerformance {
//   casesClosed: number;
//   casesWon: number;
//   casesLost: number;
//   activeCases: number;
//   averageResolutionDays: number;
//   revenueGenerated: number;
//   attendanceRate: number;
//   lastCalculatedAt: string;
// }

// export interface ConsultationLawyer {
//   _id: string;
//   id?: string;
//   user: string;
//   barNumber: string;
//   specialties: string[];
//   yearsOfExperience: number;
//   hourlyRate: number;
//   bio: string;
//   isAvailable: boolean;
//   winRate: number;
//   performance?: LawyerPerformance;
// }

// export interface ConsultationMessage {
//   _id?: string;
//   id?: string;
//   text: string;
//   senderId: string;
//   senderName?: string;
//   // 'client' | 'lawyer' | 'staff' — أدق وسيلة لتحديد شكل الفقاعة، لأن
//   // senderId هو User._id بينما consultation.client._id هو Client._id
//   // (مساحتين مختلفتين تمامًا)، فمقارنتهم مباشرة كانت بتفشل غالبًا.
//   senderRole?: 'client' | 'lawyer' | 'staff';
//   createdAt: string;
// }

// export interface Consultation {
//   _id: string;
//   client: ConsultationClient;
//   requestedBy: string;
//   subject: string;
//   category: string;
//   description: string;
//   preferredLawyer: string | null;
//   assignedLawyer: ConsultationLawyer | null;
//   status: ConsultationStatus;
//   convertedToCase: string | null;
//   closedAt: string | null;
//   // آخر رسالة اتبعتت فعليًا فى الـ thread — الـ backend بيحدثها فى
//   // addMessage/createConsultation بس (مش فى assign أو status update)،
//   // عشان تفضل معبّرة عن رسالة حقيقية بس. دى الأساس اللى هنبنى عليه
//   // علامة "غير مقروء" فى القائمة (زى أى شات عادى).
//   lastMessageAt: string | null;
//   lastMessageBy: 'client' | 'lawyer' | 'staff' | null;
//   createdAt: string;
//   updatedAt: string;
//   // الرسائل غالبًا بترجع بس مع تفاصيل استشارة واحدة (getById) مش مع القائمة
//   messages?: ConsultationMessage[];
// }

// // شكل بيانات استجابة قائمة الاستشارات (data.consultations)
// export interface ConsultationsListData {
//   consultations: Consultation[];
// }

// // شكل بيانات إنشاء استشارة جديدة - عدّل الحقول دى لو الباك إند محتاج غيرها
// export interface CreateConsultationPayload {
//   subject: string;
//   description: string;
//   category?: string;
// }

// // خريطة عرض الحالة بالعربي ولونها
// export const STATUS_LABELS: Record<ConsultationStatus, string> = {
//   pending: 'قيد الانتظار',
//   in_progress: 'جارية',
//   answered: 'تم الرد',
//   closed: 'مغلقة',
//   converted_to_case: 'تم التحويل لقضية',
// };

// // بعض الـ endpoints بترجع الاستشارة معلفة فى { consultation: {...} }، والبعض بيرجعها مباشرة.
// // الدالة دى بتتعامل مع الحالتين بأمان فى مكان واحد بدل ما نكررها فى كل component.
// export function unwrapConsultation(payload: any): Consultation | null {
//   if (!payload) return null;
//   return (payload.consultation ?? payload) as Consultation;
// }
// consultation.model.ts
// نماذج البيانات الخاصة بوحدة الاستشارات القانونية (مطابقة لشكل استجابة الـ API الفعلي)

export type ConsultationStatus = 'pending' | 'in_progress' | 'answered' | 'closed';

export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: ApiMeta;
}

export interface ConsultationClient {
  _id: string;
  fullName: string;
  companyName: string | null;
}

export interface LawyerPerformance {
  casesClosed: number;
  casesWon: number;
  casesLost: number;
  activeCases: number;
  averageResolutionDays: number;
  revenueGenerated: number;
  attendanceRate: number;
  lastCalculatedAt: string;
}

export interface ConsultationLawyer {
  _id: string;
  id?: string;
  user: string;
  barNumber: string;
  specialties: string[];
  yearsOfExperience: number;
  hourlyRate: number;
  bio: string;
  isAvailable: boolean;
  winRate: number;
  performance?: LawyerPerformance;
}

export interface ConsultationMessage {
  _id?: string;
  id?: string;
  text: string;
  senderId: string;
  senderName?: string;
  // 'client' | 'lawyer' | 'staff' — أدق وسيلة لتحديد شكل الفقاعة، لأن
  // senderId هو User._id بينما consultation.client._id هو Client._id
  // (مساحتين مختلفتين تمامًا)، فمقارنتهم مباشرة كانت بتفشل غالبًا.
  senderRole?: 'client' | 'lawyer' | 'staff';
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  createdAt: string;
}

export interface Consultation {
  _id: string;
  client: ConsultationClient;
  requestedBy: string;
  subject: string;
  category: string;
  description: string;
  preferredLawyer: string | null;
  assignedLawyer: ConsultationLawyer | null;
  status: ConsultationStatus;
  convertedToCase: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // الرسائل غالبًا بترجع بس مع تفاصيل استشارة واحدة (getById) مش مع القائمة
  messages?: ConsultationMessage[];
}

// شكل بيانات استجابة قائمة الاستشارات (data.consultations)
export interface ConsultationsListData {
  consultations: Consultation[];
}

// شكل بيانات إنشاء استشارة جديدة - عدّل الحقول دى لو الباك إند محتاج غيرها
export interface CreateConsultationPayload {
  subject: string;
  description: string;
  category?: string;
}

// خريطة عرض الحالة بالعربي ولونها
export const STATUS_LABELS: Record<ConsultationStatus, string> = {
  pending: 'قيد الانتظار',
  in_progress: 'جارية',
  answered: 'تم الرد',
  closed: 'مغلقة',
};
// بعض الـ endpoints بترجع الاستشارة معلفة فى { consultation: {...} }، والبعض بيرجعها مباشرة.
// الدالة دى بتتعامل مع الحالتين بأمان فى مكان واحد بدل ما نكررها فى كل component.
export function unwrapConsultation(payload: any): Consultation | null {
  if (!payload) return null;
  return (payload.consultation ?? payload) as Consultation;
}