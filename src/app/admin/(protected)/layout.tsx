import AdminShell from '@/components/admin/AdminShell';
import { cookieName, requireAdmin } from '@/lib/firebase/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch {
    const cookieStore = await cookies();
    cookieStore.delete(cookieName);
    redirect('/admin/login');
  }

  return <AdminShell>{children}</AdminShell>;
}
