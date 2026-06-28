/**
 * يستخرج الـ array من أي شكل response
 * يدعم: { data: [...] } أو { data: { cases/items/docs/data: [...] } } أو [...]
 */
export function extractList(res: any): any[] {
  if (!res) return [];
  // لو array مباشرة
  if (Array.isArray(res)) return res;
  const d = res.data ?? res;
  if (Array.isArray(d)) return d;
  // لو object فيه array جوا
  for (const key of ['cases', 'sessions', 'documents', 'tasks', 'deadlines',
                      'consultations', 'users', 'lawyers', 'clients',
                      'notifications', 'logs', 'results', 'items', 'docs', 'data']) {
    if (Array.isArray(d?.[key])) return d[key];
  }
  return [];
}

/** يستخرج total من الـ response */
export function extractTotal(res: any): number {
  const d = res?.data ?? res;
  return d?.total ?? d?.totalCount ?? d?.count ?? 0;
}

/** يستخرج object واحد من الـ response */
export function extractOne(res: any): any {
  if (!res) return null;
  const d = res.data ?? res;
  // لو object وليس array
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    // لو فيه key زي case, session, user...
    for (const key of ['case', 'session', 'document', 'task', 'deadline',
                        'consultation', 'user', 'lawyer', 'client', 'notification']) {
      if (d[key] && typeof d[key] === 'object') return d[key];
    }
    return d;
  }
  return d;
}
