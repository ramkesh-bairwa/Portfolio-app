import { redirect } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  const admin = await requireAdmin();
  if (!admin) redirect('/login?next=/admin');
  return (
    <div className="min-h-screen lg:flex">
      <AdminNav name={admin.name || admin.email} />
      <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">{children}</main>
    </div>
  );
}
