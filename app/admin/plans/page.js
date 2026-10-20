import PlansAdmin from '@/components/admin/PlansAdmin';
import { getInrRate, listPlans } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export default async function PlansPage() {
  return <PlansAdmin initial={await listPlans({ includeInactive: true })} initialRate={await getInrRate()} />;
}
