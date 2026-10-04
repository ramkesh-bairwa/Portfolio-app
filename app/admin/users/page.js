import UsersTable from '@/components/admin/UsersTable';

export default function UsersPage({ searchParams }) {
  return <UsersTable initialFilter={searchParams?.filter || 'all'} />;
}
