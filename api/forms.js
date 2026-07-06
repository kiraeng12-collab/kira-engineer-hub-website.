function json(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; if (data.length > 100000) reject(new Error('Payload too large')); });
    req.on('end', () => resolve(new URLSearchParams(data)));
    req.on('error', reject);
  });
}
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed' });
  try {
    const fields = await parseBody(req);
    if (fields.get('website')) return json(res, 200, { reference: 'KE-SPAM-FILTERED' });
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
    const requestedType = String(fields.get('form_type') || 'contact').trim().slice(0, 40);
    const formType = allowedTypes.has(requestedType) ? requestedType : 'contact';
    const email = String(fields.get('email') || fields.get('reply') || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { message: 'Please enter a valid email address.' });
    const message = String(fields.get('message') || fields.get('details') || fields.get('audience_description') || '').trim();
    if (!message || message.length < 8) return json(res, 400, { message: 'Please add a clear message before sending.' });
    const prefix = {
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
    }[formType] || 'REQ';
    const reference = `KE-${prefix}-${Date.now().toString(36).toUpperCase()}`;
    const submittedFields = Object.fromEntries(fields.entries());
    delete submittedFields.website;
    const payload = { reference, formType, submittedAt: new Date().toISOString(), to: 'KE@kiraengineerhub.com', fields: submittedFields };
    if (!process.env.FORM_WEBHOOK_URL) {
      return json(res, 503, { message: 'Form delivery is not configured yet. Please contact KE@kiraengineerhub.com directly.' });
    }
    const response = await fetch(process.env.FORM_WEBHOOK_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!response.ok) return json(res, 502, { message: 'Form delivery failed. Please contact KE@kiraengineerhub.com directly.' });
    return json(res, 200, { reference });
  } catch (error) {
    return json(res, 400, { message: 'The request could not be processed safely.' });
  }
};
