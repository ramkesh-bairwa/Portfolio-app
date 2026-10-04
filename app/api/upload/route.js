import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getCurrentUser } from '@/lib/auth';
import { fail, ok } from '@/lib/http';
import { getSettings } from '@/lib/settings';
import { uploadDir } from '@/lib/uploads';

const TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX = 5 * 1024 * 1024;

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    const s = await getSettings();
    if (s.allow_guest_uploads !== '1') return fail('Log in to upload images, or paste an image link instead.', 401);
  }
  const form = await req.formData();
  const files = form.getAll('files').filter((f) => typeof f === 'object');
  if (!files.length) return fail('Choose an image to upload.');
  if (files.length > 20) return fail('Upload up to 20 images at a time.');

  await fs.mkdir(uploadDir(), { recursive: true });
  const urls = [];
  for (const file of files) {
    const ext = TYPES[file.type];
    if (!ext) return fail(`"${file.name}" is not a PNG, JPG, WebP or GIF image.`);
    if (file.size > MAX) return fail(`"${file.name}" is larger than 5 MB.`);
    const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    await fs.writeFile(path.join(uploadDir(), name), Buffer.from(await file.arrayBuffer()));
    urls.push(`/api/uploads/${name}`);
  }
  return ok({ urls });
}
