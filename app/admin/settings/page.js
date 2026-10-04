import SettingsForm from '@/components/admin/SettingsForm';
import { getSettings } from '@/lib/settings';
import { whatsappConfigured } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  return <SettingsForm initial={await getSettings()} whatsapp={whatsappConfigured()} />;
}
