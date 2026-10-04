import Anthropic from '@anthropic-ai/sdk';
import { getCurrentUser } from '@/lib/auth';
import { body, fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';

// AI writer (slogans, captions, wishes, headlines) and translation for poster text
const KINDS = {
  slogan: 'short, punchy slogans (2-7 words) for a poster',
  headline: 'eye-catching poster headlines (2-8 words)',
  wish: 'warm wishes / greeting lines (1-2 short sentences) for a greeting poster',
  caption: 'social media captions (1-2 sentences, may end with 2-3 relevant hashtags)',
  offer: 'sales/offer lines for a shop poster (short, with the offer clearly stated)',
  invite: 'invitation lines for an event poster (who, what, a warm call to attend)',
};
const LANG = { hi: 'in Hindi (Devanagari script)', en: 'in English', hinglish: 'in Hinglish (Hindi words written in English letters)' };

const recent = new Map();

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to use the AI tools.', 401);
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN)
    return fail('The AI tools need an Anthropic API key. Add ANTHROPIC_API_KEY to .env.local and restart the server.', 503, { code: 'no_key' });
  const now = Date.now();
  const times = (recent.get(user.id) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (user.role !== 'admin' && times.length >= 60) return fail('You have used the AI tools 60 times in the last hour. Please try again later.', 429);
  recent.set(user.id, [...times, now]);

  const b = await body(req);
  let prompt;
  let schema;
  if (b.action === 'translate') {
    const texts = (Array.isArray(b.texts) ? b.texts : []).map((t) => String(t).slice(0, 600)).slice(0, 40);
    if (!texts.length) return fail('Nothing to translate.', 400);
    const to = b.to === 'en' ? 'English' : 'Hindi (Devanagari script)';
    prompt = `Translate each poster text below into ${to}. Keep it short and natural for a poster, keep names, numbers, phone numbers, prices, dates and emoji as they are, and keep line breaks. If a text is already in ${to}, return it unchanged.\n\n${JSON.stringify(texts)}`;
    schema = { type: 'object', additionalProperties: false, required: ['translations'], properties: { translations: { type: 'array', items: { type: 'string' }, description: 'Same order and count as the input.' } } };
  } else {
    const kind = KINDS[b.kind] ? b.kind : 'slogan';
    const topic = String(b.topic || '').slice(0, 300).trim();
    if (!topic) return fail('Write what the poster is about.', 400);
    prompt = `Write 6 different ${KINDS[kind]} ${LANG[b.language] || LANG.hi}. Poster topic: "${topic}". Tone: ${String(b.tone || 'warm').slice(0, 40)}. Make each one distinct, natural for Indian audiences, and ready to print as is (no quotes around them, no numbering).`;
    schema = { type: 'object', additionalProperties: false, required: ['options'], properties: { options: { type: 'array', items: { type: 'string' } } } };
  }

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema } },
      messages: [{ role: 'user', content: prompt }],
    });
    if (response.stop_reason === 'refusal') return fail('The AI could not help with this text. Try different wording.', 422);
    const text = response.content.find((x) => x.type === 'text')?.text || '';
    const data = JSON.parse(text);
    return ok(data);
  } catch (e) {
    if (e instanceof SyntaxError) return fail('The AI reply could not be read. Please try again.', 502);
    if (e instanceof Anthropic.AuthenticationError) return fail('The Anthropic API key is not valid. Check ANTHROPIC_API_KEY in .env.local.', 503, { code: 'no_key' });
    if (e instanceof Anthropic.RateLimitError) return fail('The AI service is busy right now. Please try again in a minute.', 429);
    if (e instanceof Anthropic.APIError) return fail(`The AI service had a problem (${e.status}). Please try again.`, 502);
    throw e;
  }
}
