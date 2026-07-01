import { Routes } from '@angular/router';
import { authGuard, publicGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      { path: 'login',           loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register',        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: 'dashboard',         loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'cases',             loadComponent: () => import('./features/cases/case-list/case-list.component').then(m => m.CaseListComponent) },
      { path: 'cases/new',         loadComponent: () => import('./features/cases/case-form/case-form.component').then(m => m.CaseFormComponent) },
      { path: 'cases/:id',         loadComponent: () => import('./features/cases/case-detail/case-detail.component').then(m => m.CaseDetailComponent) },
      { path: 'cases/:id/edit',    loadComponent: () => import('./features/cases/case-form/case-form.component').then(m => m.CaseFormComponent) },
      { path: 'sessions',          loadComponent: () => import('./features/sessions/session-list/session-list.component').then(m => m.SessionListComponent) },
      { path: 'sessions/new',      loadComponent: () => import('./features/sessions/session-form/session-form.component').then(m => m.SessionFormComponent) },
      { path: 'clients',           loadComponent: () => import('./features/clients/client-list/client-list.component').then(m => m.ClientListComponent) },
      { path: 'clients/:id',       loadComponent: () => import('./features/clients/client-detail/client-detail.component').then(m => m.ClientDetailComponent) },
      { path: 'lawyers',           loadComponent: () => import('./features/lawyers/lawyer-list/lawyer-list.component').then(m => m.LawyerListComponent) },
      { path: 'lawyers/:id',       loadComponent: () => import('./features/lawyers/lawyer-detail/lawyer-detail.component').then(m => m.LawyerDetailComponent) },
      { path: 'documents',         loadComponent: () => import('./features/documents/document-list/document-list.component').then(m => m.DocumentListComponent) },
      { path: 'tasks',             loadComponent: () => import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent) },
      { path: 'deadlines',         loadComponent: () => import('./features/deadlines/deadline-list/deadline-list.component').then(m => m.DeadlineListComponent) },
{ path: 'consultations',     loadComponent: () => import('./features/consultations/consultations-page/consultations-page.component').then(m => m.ConsultationsPageComponent) },
{ path: 'consultations/:id', loadComponent: () => import('./features/consultations/consultation-detail/consultation-detail.component').then(m => m.ConsultationDetailComponent) },
      { path: 'reports',           loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'search',            loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
      { path: 'notifications',     loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'users',             canActivate: [adminGuard], loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent) },
      { path: 'audit-logs',        canActivate: [adminGuard], loadComponent: () => import('./features/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/auth/login' }
];
