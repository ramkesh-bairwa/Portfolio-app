import TemplatesAdmin from '@/components/admin/TemplatesAdmin';
import { getTemplateList } from '@/lib/templateStore';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  return <TemplatesAdmin initial={await getTemplateList({ includeInactive: true })} />;
}
