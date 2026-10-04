export function normalizePhone(raw) {
  let digits = String(raw || '').replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.length === 10) digits = (process.env.DEFAULT_COUNTRY_CODE || '91') + digits;
  digits = digits.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  return '+' + digits;
}

export function whatsappConfigured() {
  return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID);
}

export async function sendWhatsAppOtp(phone, code) {
  if (!whatsappConfigured()) {
    console.log(`[folio] DEV OTP for ${phone}: ${code}`);
    return { dev: true };
  }
  const components = [{ type: 'body', parameters: [{ type: 'text', text: code }] }];
  if ((process.env.WHATSAPP_TEMPLATE_HAS_BUTTON || 'true') === 'true') {
    components.push({ type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] });
  }
  const res = await fetch(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone.replace('+', ''),
      type: 'template',
      template: {
        name: process.env.WHATSAPP_TEMPLATE || 'otp_login',
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
        components,
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[folio] WhatsApp send failed', res.status, text);
    throw new Error('WhatsApp could not deliver the code. Check the number and try again.');
  }
  return { dev: false };
}
