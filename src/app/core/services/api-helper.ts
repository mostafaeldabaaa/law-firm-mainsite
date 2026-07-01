/**
 * يستخرج الـ array من أي شكل response
 * يدعم: { data: [...] } أو { data: { cases/items/docs/... : [...] } } أو [...]
 */
export function extractList(res: any): any[] {
  if (!res) return [];

  // لو الريسبونس نفسه array مباشرة
  if (Array.isArray(res)) return res;

  const d = res.data ?? res;

  // لو d نفسها array
  if (Array.isArray(d)) return d;

  // لو object فيه array جوا - بنرتب المفاتيح الأدق أولاً، و 'data' في الآخر كاحتياطي
  for (const key of [
    'cases', 'sessions', 'documents', 'tasks', 'deadlines',
    'consultations', 'users', 'lawyers', 'clients',
    'notifications', 'logs', 'results', 'items', 'docs',
    'report', 'data'
  ]) {
    if (Array.isArray(d?.[key])) return d[key];
  }

  return [];
}

/** يستخرج total من الـ response */
export function extractTotal(res: any): number {
  // أول حاجة: meta.total (الشكل الجديد اللي السيرفر بيرجعه فعليًا)
  if (res?.meta?.total !== undefined) return res.meta.total;
  if (res?.meta?.totalCount !== undefined) return res.meta.totalCount;
  if (res?.meta?.count !== undefined) return res.meta.count;

  const d = res?.data ?? res;

  // 🛠️ إصلاح: لو d نفسها array، الـ total هو طولها (arrays مالهاش property total)
  if (Array.isArray(d)) return d.length;

  return d?.total ?? d?.totalCount ?? d?.count ?? 0;
}

/** يستخرج object واحد من الـ response */
export function extractOne(res: any): any {
  if (!res) return null;

  const d = res.data ?? res;

  if (d && typeof d === 'object' && !Array.isArray(d)) {
    for (const key of [
      'case', 'session', 'document', 'task', 'deadline',
      'consultation', 'user', 'lawyer', 'client', 'notification'
    ]) {
      if (d[key] && typeof d[key] === 'object') return d[key];
    }
    return d;
  }

  return d;
}