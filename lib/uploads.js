import path from 'node:path';

export const uploadDir = () => path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

export const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
export const SAFE_FILE = /^[\w-]+\.(png|jpe?g|webp|gif)$/i;
