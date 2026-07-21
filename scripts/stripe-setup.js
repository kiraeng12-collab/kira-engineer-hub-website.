// Local-only Stripe setup: creates the KIRA VIP products, prices, coupon and
// webhook endpoint in whichever Stripe account STRIPE_SECRET_KEY belongs to.
//
//   node scripts/stripe-setup.js            # dry run - shows what it WOULD do
//   node scripts/stripe-setup.js --apply    # actually creates things
//
// Safety: refuses to run against the old "DAFFAR CRYPTO" account, and refuses
// live keys unless you also pass --allow-live.
//
// Secrets policy: price/coupon/webhook IDs are NOT secrets and are printed.
// The webhook SIGNING SECRET is written to stripe-setup-output.txt (gitignored)
// and never printed to the console.

require('dotenv/config');
const fs = require('node:fs');
const path = require('node:path');
const Stripe = require('stripe');

const APPLY = process.argv.includes('--apply');
const ALLOW_LIVE = process.argv.includes('--allow-live');

// Must match lib/config/pricing.ts
const PRICES = [
  { key: 'STRIPE_PRICE_KIRA_VIP_MONTHLY', nickname: 'KIRA VIP Monthly', cents: 7000, months: 1 },
  { key: 'STRIPE_PRICE_KIRA_VIP_QUARTERLY', nickname: 'KIRA VIP Quarterly', cents: 18900, months: 3 },
  { key: 'STRIPE_PRICE_KIRA_VIP_MONTHLY_FOUNDING', nickname: 'KIRA VIP Monthly (Founding)', cents: 5000, months: 1 },
  { key: 'STRIPE_PRICE_KIRA_VIP_QUARTERLY_FOUNDING', nickname: 'KIRA VIP Quarterly (Founding)', cents: 15000, months: 3 },
];

const WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
  'charge.refunded',
  'charge.dispute.created',
  'charge.dispute.closed',
];

const WEBHOOK_URL =
  process.env.STRIPE_WEBHOOK_URL || 'https://www.kiraengineerhub.com/api/stripe/webhook';

const PRODUCT_NAME = 'KIRA VIP Membership';

function line(msg) {
  console.log(msg);
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error('STRIPE_SECRET_KEY is not set in .env');
    process.exit(1);
  }

  const isLive = key.startsWith('sk_live_') || key.startsWith('rk_live_');
  if (isLive && !ALLOW_LIVE) {
    console.error('This is a LIVE key. Re-run with --allow-live if that is really what you want.');
    process.exit(1);
  }

  const stripe = new Stripe(key);
  const account = await stripe.accounts.retrieve();
  const name = account.settings?.dashboard?.display_name || account.business_profile?.name || '(unnamed)';

  line('Stripe account');
  line(`  id      : ${account.id}`);
  line(`  name    : ${name}`);
  line(`  country : ${account.country}`);
  line(`  mode    : ${isLive ? 'LIVE' : 'test'}`);
  line('');

  // Guard: never set up the old company account again.
  if (/daffar/i.test(name)) {
    console.error('REFUSING: this is the old DAFFAR CRYPTO account, not Kira Engineer Hub.');
    console.error('Switch to the Kira Engineer Hub account and use its key.');
    process.exit(1);
  }

  if (!APPLY) {
    line('DRY RUN - nothing will be created. Re-run with --apply to make these:');
    line(`  product : ${PRODUCT_NAME}`);
    for (const p of PRICES) {
      line(`  price   : ${p.nickname} - ${(p.cents / 100).toFixed(2)} USD every ${p.months} month(s)`);
    }
    line('  coupon  : 20% off, forever (Early Bird)');
    line(`  webhook : ${WEBHOOK_URL} (${WEBHOOK_EVENTS.length} events)`);
    return;
  }

  // --- Product (reuse if it already exists) ---
  const products = await stripe.products.list({ limit: 100, active: true });
  let product = products.data.find((p) => p.name === PRODUCT_NAME);
  if (product) {
    line(`Product exists: ${product.id}`);
  } else {
    product = await stripe.products.create({
      name: PRODUCT_NAME,
      description: 'Private educational trading membership delivered through Telegram.',
    });
    line(`Product created: ${product.id}`);
  }

  // --- Prices (reuse an exact match if present) ---
  const existingPrices = await stripe.prices.list({ product: product.id, limit: 100 });
  const envLines = [];
  for (const spec of PRICES) {
    const match = existingPrices.data.find(
      (p) =>
        p.active &&
        p.unit_amount === spec.cents &&
        p.currency === 'usd' &&
        p.recurring?.interval === 'month' &&
        p.recurring?.interval_count === spec.months
    );
    let price = match;
    if (price) {
      line(`Price exists : ${spec.nickname} -> ${price.id}`);
    } else {
      price = await stripe.prices.create({
        product: product.id,
        nickname: spec.nickname,
        currency: 'usd',
        unit_amount: spec.cents,
        recurring: { interval: 'month', interval_count: spec.months },
      });
      line(`Price created: ${spec.nickname} -> ${price.id}`);
    }
    envLines.push(`${spec.key}=${price.id}`);
  }

  // --- Early Bird coupon ---
  const coupons = await stripe.coupons.list({ limit: 100 });
  let coupon = coupons.data.find((c) => c.percent_off === 20 && c.duration === 'forever' && c.valid);
  if (coupon) {
    line(`Coupon exists: ${coupon.id}`);
  } else {
    coupon = await stripe.coupons.create({
      percent_off: 20,
      duration: 'forever',
      name: 'KIRA Early Bird',
    });
    line(`Coupon created: ${coupon.id}`);
  }
  envLines.push(`STRIPE_EARLY_BIRD_COUPON_ID=${coupon.id}`);

  // --- Webhook endpoint ---
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  let endpoint = endpoints.data.find((e) => e.url === WEBHOOK_URL && e.status === 'enabled');
  let signingSecret = null;
  if (endpoint) {
    line(`Webhook exists: ${endpoint.id} (signing secret unchanged - copy it from the Stripe dashboard)`);
    await stripe.webhookEndpoints.update(endpoint.id, { enabled_events: WEBHOOK_EVENTS });
    line('  events updated to the required set');
  } else {
    endpoint = await stripe.webhookEndpoints.create({
      url: WEBHOOK_URL,
      enabled_events: WEBHOOK_EVENTS,
      description: 'KIRA membership automation',
    });
    signingSecret = endpoint.secret; // only returned at creation
    line(`Webhook created: ${endpoint.id}`);
  }

  // --- Output ---
  const outPath = path.join(process.cwd(), 'stripe-setup-output.txt');
  const body = [
    `# Stripe setup for ${name} (${account.id}) - ${isLive ? 'LIVE' : 'test'} mode`,
    `# Paste these into Vercel -> Settings -> Environment Variables, then Redeploy.`,
    '',
    ...envLines,
    signingSecret
      ? `STRIPE_WEBHOOK_SECRET=${signingSecret}`
      : `# STRIPE_WEBHOOK_SECRET= (endpoint already existed - copy it from the Stripe dashboard)`,
    '',
  ].join('\n');
  fs.writeFileSync(outPath, body);

  line('');
  line('Non-secret IDs (safe to share):');
  for (const l of envLines) line('  ' + l);
  line('');
  line(`Full list INCLUDING the webhook signing secret written to:`);
  line(`  ${outPath}`);
  line('Open that file, copy the values into Vercel, then delete it.');
}

main().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
