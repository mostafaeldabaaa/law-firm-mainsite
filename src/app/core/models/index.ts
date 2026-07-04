// ─── Auth ───────────────────────────────────────────────────────────────────
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}export interface AuthResponse { accessToken: string; refreshToken: string; user: User; }

// ─── User ────────────────────────────────────────────────────────────────────
export type Role = 'super_admin' | 'branch_manager' | 'senior_lawyer' | 'lawyer' | 'secretary' | 'client';
export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Case ────────────────────────────────────────────────────────────────────
export type CaseStatus = 'draft' | 'under_review' | 'active' | 'court_session' | 'judgment_issued' | 'closed';
export interface Case {
  _id: string;
  title: string;
  caseNumber: string;
  status: CaseStatus;
  client: User;
  leadLawyer: User;
  lawyers?: User[];
  description?: string;
   caseType?: string; 
  outcome?: { result: 'won' | 'lost' | 'settled' | 'dismissed'; summary?: string; date?: string };
  timeline?: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}
export interface TimelineEntry { action: string; note?: string; by: User; at: string; }
export interface CreateCaseRequest { title: string; description?: string; clientId: string; leadLawyerId: string; lawyerIds?: string[]; }

// ─── Session ─────────────────────────────────────────────────────────────────
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
export interface Session {
  _id: string;
  case: Case;
  lawyer: User;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
  status: SessionStatus;
  createdAt: string;
}
export interface CreateSessionRequest { caseId: string; lawyerId: string; date: string; startTime: string; endTime: string; location?: string; notes?: string; }

// ─── Document ────────────────────────────────────────────────────────────────
export interface Document {
  _id: string;
  case: Case;
  title: string;
  fileUrl: string;
  uploadedBy: User;
  versions?: DocumentVersion[];
  createdAt: string;
}
export interface DocumentVersion { versionNumber: number; fileUrl: string; uploadedAt: string; }

// ─── Task ────────────────────────────────────────────────────────────────────
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export interface Task {
  _id: string;
  title: string;
  description?: string;
  case?: Case;
  assignedTo: User;
  dueDate: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

// ─── Legal Deadline ──────────────────────────────────────────────────────────
export type DeadlineType = 'appeal' | 'cassation' | 'objection' | 'response' | 'statute_of_limitations' | 'execution';
export type DeadlineStatus = 'pending' | 'completed' | 'missed' | 'cancelled';
export interface LegalDeadline {
  _id: string;
  case: Case;
  type: DeadlineType;
  dueDate: string;
  responsibleLawyer: User;
  status: DeadlineStatus;
  reminderLeadDays?: number[];
  notes?: string;
  createdAt: string;
}

// ─── Consultation ────────────────────────────────────────────────────────────
export type ConsultationStatus = 'pending' | 'in_progress' | 'answered' | 'closed';
export interface Consultation {
  _id: string;
  client: User;
  preferredLawyer?: User;
  assignedLawyer?: User;
  subject: string;
  description: string;
  status: ConsultationStatus;
  messages?: ConsultationMessage[];
  convertedToCase?: Case;
  createdAt: string;
}
export interface ConsultationMessage { from: User; text: string; sentAt: string; }

// ─── Notification ────────────────────────────────────────────────────────────
export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────
export interface AuditLog {
  _id: string;
  user: User;
  action: string;
  resource: string;
  resourceId?: string;
  ip: string;
  userAgent: string;
  outcome: 'success' | 'failure';
  createdAt: string;
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export interface CaseStatusReport { status: CaseStatus; count: number; }
export interface RevenueReport { month: string; total: number; }
export interface LawyerPerformance { cases: number; activeCases: number; completedCases: number; successRate: number; }

// ─── Shared ──────────────────────────────────────────────────────────────────
export interface ApiResponse<T> { success: boolean; message?: string; data: T; }
export interface PaginatedResponse<T> { data: T[]; total: number; page: number; limit: number; }
export interface SearchResult { type: 'case' | 'document'; item: Case | Document; }
