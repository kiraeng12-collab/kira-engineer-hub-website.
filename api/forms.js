const {
  json,
  safeText,
  isEmail,
  createReference,
  parseRequestBody,
  forwardOperationalEvent
} = require('./_utils');

const allowedTypes = new Set([
  'contact',
  'support',
  'membership_interest',
  'academy_interest',
  'project_242_interest',
  'shop_interest',
  'partner',
  'early_bird',
  'privacy_request',
  'complaint'
]);

const prefixes = {
  contact: 'CNT',
  support: 'SUP',
  membership_interest: 'VIP',
  academy_interest: 'ACA',
  project_242_interest: 'P242',
  shop_interest: 'SHP',
  partner: 'PTR',
  early_bird: 'EB',
  privacy_request: 'PRV',
  complaint: 'CMP'
};

function cleanFields(fields) {
  const cleaned = {};
  for (const [key, value] of Object.entries(fields)) {
    if (key === 'website') continue;
    cleaned[safeText(key, 80)] = safeText(value, 4000);
  }
  return cleaned;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed' });

  try {
    const { fields } = await parseRequestBody(req);
    if (fields.website) return json(res, 200, { reference: 'KE-SPAM-FILTERED' });

    const requestedType = safeText(fields.form_type || 'contact', 40);
    const formType = allowedTypes.has(requestedType) ? requestedType : 'contact';
    const email = safeText(fields.email || fields.reply, 320);
    const message = safeText(fields.message || fields.details || fields.audience_description, 4000);

    if (!isEmail(email)) return json(res, 400, { message: 'Please enter a valid email address.' });
    if (!message || message.length < 8) return json(res, 400, { message: 'Please add a clear message before sending.' });

    const reference = createReference(prefixes[formType] || 'REQ');
    const payload = {
      event: 'form.submitted',
      reference,
      formType,
      submittedAt: new Date().toISOString(),
      to: 'KE@kiraengineerhub.com',
      fields: cleanFields(fields),
      source: {
        userAgent: safeText(req.headers['user-agent'], 300),
        ipHint: safeText(req.headers['x-forwarded-for'], 80)
      }
    };

    if (!process.env.FORM_WEBHOOK_URL && !process.env.ADMIN_WEBHOOK_URL) {
      return json(res, 503, {
        message: 'Form delivery is not configured yet. Please contact KE@kiraengineerhub.com directly.'
      });
    }

    let delivered = false;

    if (process.env.FORM_WEBHOOK_URL) {
      const response = await fetch(process.env.FORM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      delivered = response.ok;
    }

    if (!delivered) {
      const fallback = await forwardOperationalEvent(payload);
      delivered = Boolean(fallback.delivered);
    }

    if (!delivered) {
      return json(res, 502, {
        message: 'Form delivery failed. Please contact KE@kiraengineerhub.com directly.'
      });
    }

    return json(res, 200, { reference });
  } catch (error) {
    return json(res, 400, { message: 'The request could not be processed safely.' });
  }
};
