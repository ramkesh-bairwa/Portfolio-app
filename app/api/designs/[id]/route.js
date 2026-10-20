import { renderDesign } from '@/lib/designs';

// Design library image: /api/designs/<1–2000>. Deterministic, so it can be cached forever.
export async function GET(_req, { params }) {
  const svg = renderDesign(String(params.id || '').replace(/\.svg$/, ''));
  if (!svg) return new Response('Not found', { status: 404 });
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=31536000, immutable' } });
}
