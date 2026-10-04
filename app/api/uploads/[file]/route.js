import fs from 'node:fs/promises';
import path from 'node:path';
import { MIME, SAFE_FILE, uploadDir } from '@/lib/uploads';

export async function GET(_req, { params }) {
  const file = String(params.file || '');
  if (!SAFE_FILE.test(file)) return new Response('Not found', { status: 404 });
  try {
    const buf = await fs.readFile(path.join(uploadDir(), file));
    const ext = file.split('.').pop().toLowerCase();
    return new Response(buf, { headers: { 'Content-Type': MIME[ext], 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
