import Anthropic from '@anthropic-ai/sdk';
import { getCurrentUser } from '@/lib/auth';
import { body, fail, ok } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Reads a photo of a poster/banner and returns its layout as data the editor can rebuild.
// All positions are percentages of the image so they work at any size.
const nullable = (t) => ({ type: [t, 'null'] });
const LAYOUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['background', 'elements'],
  properties: {
    background: {
      type: 'object',
      additionalProperties: false,
      required: ['type', 'color1', 'color2', 'angle'],
      properties: {
        type: { type: 'string', enum: ['solid', 'gradient', 'radial'] },
        color1: { type: 'string', description: 'Hex colour, e.g. #FF7A00. For radial: the centre colour.' },
        color2: { type: 'string', description: 'Second hex colour (same as color1 for solid). For radial: the edge colour.' },
        angle: { type: 'number', description: 'Gradient angle in CSS degrees (180 = top to bottom).' },
      },
    },
    elements: {
      type: 'array',
      description: 'Everything on the poster, listed from the back (first) to the front (last).',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'x', 'y', 'w', 'h', 'rotation', 'text', 'color', 'fontSizePct', 'fontWeight', 'fontStyle', 'align', 'italic', 'uppercase', 'outlineColor', 'shadow', 'shape', 'fill', 'fill2', 'radiusPct', 'opacity', 'role', 'cutout', 'label'],
        properties: {
          kind: { type: 'string', enum: ['text', 'shape', 'image_region'] },
          x: { type: 'number', description: 'Left edge, % of image width (0-100).' },
          y: { type: 'number', description: 'Top edge, % of image height (0-100).' },
          w: { type: 'number', description: 'Width, % of image width.' },
          h: { type: 'number', description: 'Height, % of image height.' },
          rotation: { type: 'number', description: 'Degrees clockwise, usually 0.' },
          text: { ...nullable('string'), description: 'kind=text only: the exact words, in the original script (Devanagari stays Devanagari). Use \\n for line breaks inside one block.' },
          color: { ...nullable('string'), description: 'kind=text: text hex colour.' },
          fontSizePct: { ...nullable('number'), description: 'kind=text: cap-to-baseline line height as % of image height (roughly the height of one line of capital letters).' },
          fontWeight: { ...nullable('string'), enum: ['400', '500', '600', '700', '800', '900', null] },
          fontStyle: { ...nullable('string'), enum: ['sans', 'display', 'condensed', 'serif', 'script', 'handwritten', null], description: 'display = heavy rounded/bold poster type; condensed = tall narrow type.' },
          align: { ...nullable('string'), enum: ['left', 'center', 'right', null] },
          italic: nullable('boolean'),
          uppercase: nullable('boolean'),
          outlineColor: { ...nullable('string'), description: 'kind=text: hex colour of a visible outline/stroke around letters, else null.' },
          shadow: { ...nullable('boolean'), description: 'kind=text: true if the text has a visible drop shadow or glow.' },
          shape: { ...nullable('string'), enum: ['rect', 'rounded', 'circle', 'ellipse', 'ribbon', 'triangle', 'star', 'line', null] },
          fill: { ...nullable('string'), description: 'kind=shape: fill hex colour.' },
          fill2: { ...nullable('string'), description: 'kind=shape: second hex colour if the shape has a gradient, else null.' },
          radiusPct: { ...nullable('number'), description: 'kind=shape rounded: corner radius as % of the shape height.' },
          opacity: { type: 'number', description: '0-1.' },
          role: { ...nullable('string'), enum: ['person', 'photo', 'logo', 'symbol', 'illustration', null], description: 'kind=image_region: what the region contains.' },
          cutout: { ...nullable('boolean'), description: 'kind=image_region: true if it is a person/object cut out from its background and placed on the design (no rectangle around it).' },
          label: { type: 'string', description: 'Short plain-English name, e.g. "Main headline", "Candidate photo", "Green slogan band".' },
        },
      },
    },
  },
};

const PROMPT = `You are recreating a poster/banner design as editable layers. Study the image and return its layout.

Rules:
- List EVERY piece of text as a "text" element, with the exact words in the original script and spelling (Hindi in Devanagari, English as written). Keep each visually separate block separate (headline, slogans, names, phone numbers, small print). Lines that share one style and sit together can be one block with \\n.
- Text boxes must tightly fit the text. fontSizePct is the height of one line of text as % of the image height.
- Use "shape" elements for flat or gradient colour areas: bands, strips, panels, circles behind photos, ribbons/name plates, lines and borders.
- Use "image_region" for anything that cannot be drawn with text and simple shapes: photos of people (role "person"), other photographs, logos and party symbols ("logo"/"symbol"), and detailed illustrations ("illustration"). The box must cover the whole region tightly. Set cutout=true when a person/object is cut out from its own background.
- Order elements from back to front, exactly as they overlap in the image.
- Background: the main page colour or gradient behind everything (ignore elements on top).
- All positions and sizes are percentages of the image width (x, w) or height (y, h), 0-100.
- Use null for fields that do not apply to an element's kind.`;

const recent = new Map(); // simple per-user limit to protect the API bill

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return fail('Log in to copy a design from a photo.', 401);
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN)
    return fail('This feature needs an Anthropic API key. Add ANTHROPIC_API_KEY to .env.local and restart the server.', 503, { code: 'no_key' });

  const now = Date.now();
  const times = (recent.get(user.id) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (user.role !== 'admin' && times.length >= 20) return fail('You have copied 20 designs in the last hour. Please try again a little later.', 429);

  const { image, mediaType } = await body(req);
  if (typeof image !== 'string' || image.length < 100) return fail('Send a photo of the poster.', 400);
  if (image.length > 7_000_000) return fail('That photo is too large. Use one under 5 MB.', 413);
  const media = ['image/jpeg', 'image/png', 'image/webp'].includes(mediaType) ? mediaType : 'image/jpeg';
  recent.set(user.id, [...times, now]);

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: LAYOUT_SCHEMA } },
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: media, data: image } },
          { type: 'text', text: PROMPT },
        ],
      }],
    });
    if (response.stop_reason === 'refusal') return fail('This photo could not be analysed. Try a different image.', 422);
    if (response.stop_reason === 'max_tokens') return fail('This design is too detailed to copy in one go. Try a simpler or cropped photo.', 422);
    const textBlock = response.content.find((b) => b.type === 'text');
    let layout;
    try {
      layout = JSON.parse(textBlock?.text || '');
    } catch {
      return fail('Could not read the design. Please try again.', 502);
    }
    return ok({ layout, usage: { input: response.usage.input_tokens, output: response.usage.output_tokens } });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return fail('The Anthropic API key is not valid. Check ANTHROPIC_API_KEY in .env.local.', 503, { code: 'no_key' });
    if (e instanceof Anthropic.RateLimitError) return fail('The AI service is busy right now. Please try again in a minute.', 429);
    if (e instanceof Anthropic.BadRequestError) return fail(`The AI service rejected the request: ${e.message}`, 400);
    if (e instanceof Anthropic.APIError) return fail(`The AI service had a problem (${e.status}). Please try again.`, 502);
    throw e;
  }
}
