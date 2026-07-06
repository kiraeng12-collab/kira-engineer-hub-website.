const crypto = require('crypto');
const { json, readRawBody, forwardOperationalEvent } = require('./_utils');

function parseStripeSignature(header) {
  return String(header || '').split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) acc[key] = value;
    return acc;
  }, {});
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  const parts = parseStripeSignature(signatureHeader);
  if (!parts.t || !parts.v1) return false;

  const signedPayload = `${parts.t}.${rawBody.toString('utf8')}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  const received = Buffer.from(parts.v1, 'hex');
  const calculated = Buffer.from(expected, 'hex');
  if (received.length !== calculated.length) return false;

  const toleranceSeconds = Number(process.env.STRIPE_WEBHOOK_TOLERANCE_SECONDS || 300);
  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - Number(parts.t));
  return ageSeconds <= toleranceSeconds && crypto.timingSafeEqual(received, calculated);
}

function eventSummary(event) {
  const object = event && event.data && event.data.object ? event.data.object : {};
  return {
    event: 'stripe.event.received',
    stripeEventId: event.id,
    stripeEventType: event.type,
    receivedAt: new Date().toISOString(),
    customer: object.customer || null,
    customerEmail: object.customer_email || object.customer_details?.email || null,
    subscription: object.subscription || object.id || null,
    paymentStatus: object.payment_status || object.status || null,
    metadata: object.metadata || {}
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed' });

  try {
    const rawBody = await readRawBody(req, 500000);
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret) {
      return json(res, 503, { message: 'Stripe webhook secret is not configured.' });
    }

    const isValid = verifyStripeSignature(rawBody, req.headers['stripe-signature'], secret);
    if (!isValid) return json(res, 400, { message: 'Invalid Stripe signature.' });

    const event = JSON.parse(rawBody.toString('utf8'));
    const importantTypes = new Set([
      'checkout.session.completed',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'customer.subscription.updated',
      'customer.subscription.deleted'
    ]);

    if (importantTypes.has(event.type)) {
      await forwardOperationalEvent(eventSummary(event));
    }

    return json(res, 200, { received: true });
  } catch (error) {
    return json(res, 400, { message: 'Webhook could not be processed safely.' });
  }
};
