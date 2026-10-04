import { getCurrentUser, publicUser } from '@/lib/auth';
import { ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  return ok({ user: publicUser(await getCurrentUser()) });
}
