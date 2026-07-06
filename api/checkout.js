const { json, safeText, isEmail, parseRequestBody } = require('./_utils');

const plans = {
  monthly: {
    label: 'KIRA VIP Monthly',
    priceEnv: 'STRIPE_PRICE_KIRA_VIP_MONTHLY'
  },
  quarterly: {
    label: 'KIRA VIP Quarterly',
    priceEnv: 'STRIPE_PRICE_KIRA_VIP_QUARTERLY'
  }
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function createStripeCheckoutSession({ plan, email, earlyBird }) {
  const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');
  const successUrl = process.env.STRIPE_SUCCESS_URL || 'https://www.kiraengineerhub.com/membership?checkout=success';
  const cancelUrl = process.env.STRIPE_CANCEL_URL || 'https://www.kiraengineerhub.com/membership?checkout=cancelled';
  const selected = plans[plan];
  const priceId = requireEnv(selected.priceEnv);

  const body = new URLSearchParams();
  body.set('mode', 'subscription');
  body.set('success_url', successUrl);
  body.set('cancel_url', cancelUrl);
  body.set('customer_email', email);
  body.set('line_items[0][price]', priceId);
  body.set('line_items[0][quantity]', '1');
  body.set('metadata[brand]', 'Kira Engineer Hub');
  body.set('metadata[product]', selected.label);
  body.set('metadata[plan]', plan);

  if (earlyBird && process.env.STRIPE_EARLY_BIRD_COUPON_ID) {
    body.set('discounts[0][coupon]', process.env.STRIPE_EARLY_BIRD_COUPON_ID);
    body.set('metadata[early_bird_requested]', 'true');
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error && data.error.message ? data.error.message : 'Stripe checkout failed');
  }

  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed' });

  if (process.env.CHECKOUT_ENABLED !== 'true') {
    return json(res, 503, {
      message: 'Online checkout is being prepared. Please request membership access through Telegram or email.'
    });
  }

  try {
    const { fields } = await parseRequestBody(req);
    const plan = safeText(fields.plan, 20);
    const email = safeText(fields.email, 320);
    const earlyBird = safeText(fields.early_bird, 10) === 'true';

    if (!plans[plan]) return json(res, 400, { message: 'Please choose a valid membership plan.' });
    if (!isEmail(email)) return json(res, 400, { message: 'Please enter a valid email address.' });

    const session = await createStripeCheckoutSession({ plan, email, earlyBird });
    return json(res, 200, { url: session.url, id: session.id });
  } catch (error) {
    return json(res, 500, {
      message: 'Checkout could not be started safely. Please contact KE@kiraengineerhub.com.'
    });
  }
};
