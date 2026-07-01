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