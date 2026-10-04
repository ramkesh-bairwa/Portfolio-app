import PortfoliosTable from '@/components/admin/PortfoliosTable';

export default function PortfoliosPage({ searchParams }) {
  return <PortfoliosTable initialFilter={searchParams?.filter || 'all'} />;
}
