const crypto = require('crypto');

function json(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function safeText(value, maxLength = 2000) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function createReference(prefix) {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `KE-${prefix}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function readRawBody(req, maxBytes = 100000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function parseRequestBody(req) {
  const raw = await readRawBody(req);
  const contentType = String(req.headers['content-type'] || '');
  if (contentType.includes('application/json')) {
    return { raw, fields: JSON.parse(raw.toString('utf8') || '{}') };
  }
  const params = new URLSearchParams(raw.toString('utf8'));
  return { raw, fields: Object.fromEntries(params.entries()) };
}

async function forwardOperationalEvent(payload) {
  if (!process.env.ADMIN_WEBHOOK_URL) return { delivered: false, skipped: true };
  const response = await fetch(process.env.ADMIN_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return { delivered: response.ok, status: response.status };
}

module.exports = {
  json,
  safeText,
  isEmail,
  createReference,
  readRawBody,
  parseRequestBody,
  forwardOperationalEvent
};
