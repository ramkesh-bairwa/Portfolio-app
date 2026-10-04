// QR codes for posters: link, phone, WhatsApp, UPI payment or email, drawn as SVG.
import qrcode from 'qrcode-generator';

export const QR_KINDS = [
  ['link', 'Website / link'], ['upi', 'UPI payment'], ['whatsapp', 'WhatsApp chat'], ['phone', 'Phone call'], ['email', 'Email'], ['text', 'Plain text'],
];

const digits = (s) => String(s || '').replace(/\D/g, '');

// The text the QR code holds, from the fields the user filled in
export function qrData(q = {}) {
  switch (q.kind) {
    case 'upi': {
      // UPI apps expect the @ in the ID as is
      const params = [`pa=${encodeURIComponent((q.upi || '').trim()).replace(/%40/g, '@')}`, q.name && `pn=${encodeURIComponent(q.name)}`, q.amount && `am=${encodeURIComponent(q.amount)}`, 'cu=INR', q.note && `tn=${encodeURIComponent(q.note)}`].filter(Boolean);
      return `upi://pay?${params.join('&')}`;
    }
    case 'whatsapp': {
      const n = digits(q.phone);
      const full = n.length === 10 ? `91${n}` : n;
      return `https://wa.me/${full}${q.message ? `?text=${encodeURIComponent(q.message)}` : ''}`;
    }
    case 'phone': return `tel:${q.phone || ''}`;
    case 'email': return `mailto:${q.email || ''}${q.subject ? `?subject=${encodeURIComponent(q.subject)}` : ''}`;
    case 'text': return q.text || '';
    default: return q.url || 'https://example.com';
  }
}

export function qrSvg(el) {
  const data = qrData(el.qr) || ' ';
  let code;
  try {
    code = qrcode(0, 'M');
    code.addData(unescape(encodeURIComponent(data))); // UTF-8 for Hindi text
    code.make();
  } catch {
    code = qrcode(0, 'L');
    code.addData(' ');
    code.make();
  }
  const n = code.getModuleCount();
  const margin = el.margin ?? 2;
  const size = n + margin * 2;
  const style = el.dots || 'square';
  let body = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!code.isDark(r, c)) continue;
      const x = c + margin;
      const y = r + margin;
      // keep the three big finder squares solid so phones read the code easily
      const finder = (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
      if (style === 'dots' && !finder) body += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.45"/>`;
      else if (style === 'rounded' && !finder) body += `<rect x="${x + 0.05}" y="${y + 0.05}" width="0.9" height="0.9" rx="0.3"/>`;
      else body += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" shape-rendering="${style === 'square' ? 'crispEdges' : 'auto'}" style="display:block"><rect width="${size}" height="${size}" rx="${el.rounded ? size * 0.06 : 0}" fill="${el.bg || '#FFFFFF'}"/><g fill="${el.fg || '#111111'}">${body}</g></svg>`;
}
