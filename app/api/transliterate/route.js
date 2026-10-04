import { fail, ok } from '@/lib/http';
import { hinglishToHindi } from '@/lib/translit';

export const dynamic = 'force-dynamic';

// Hinglish word → Hindi suggestions. Uses Google Input Tools; falls back to a simple built-in converter.
const cache = new Map();
const MAX_CACHE = 5000;

export async function GET(req) {
  const word = (new URL(req.url).searchParams.get('text') || '').trim();
  if (!/^[A-Za-z]{1,40}$/.test(word)) return fail('Send one word in English letters.', 400);
  const key = word.toLowerCase();
  if (cache.has(key)) return ok({ suggestions: cache.get(key), source: 'cache' });
  try {
    const r = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(key)}&itc=hi-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8`, { signal: AbortSignal.timeout(3000) });
    const j = await r.json();
    const list = j?.[0] === 'SUCCESS' ? j[1]?.[0]?.[1] : null;
    if (Array.isArray(list) && list.length) {
      if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
      cache.set(key, list.slice(0, 5));
      return ok({ suggestions: list.slice(0, 5), source: 'google' });
    }
  } catch {
    /* offline or blocked: use the built-in converter */
  }
  return ok({ suggestions: [hinglishToHindi(key)], source: 'basic' });
}
