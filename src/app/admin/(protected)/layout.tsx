import AdminShell from '@/components/admin/AdminShell';
import { requireAdmin } from '@/lib/firebase/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  try { await requireAdmin(); } catch { redirect('/admin/login'); }

  return <AdminShell>{children}</AdminShell>;
}
