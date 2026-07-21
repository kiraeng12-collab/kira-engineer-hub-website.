// Local-only launch readiness check.
//
//   node scripts/check-launch-setup.js
//
// Reads the same environment the app uses and reports, in plain English, what
// is configured and what is missing. It NEVER prints a secret - only whether a
// value exists and, for keys, which Stripe mode it belongs to.
//
// Safe to run as often as you like: it only reads.

require('dotenv/config');
const Stripe = require('stripe');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('../lib/generated/prisma');

const ok = (m) => console.log('  ✓ ' + m);
const bad = (m) => console.log('  ✗ ' + m);
const warn = (m) => console.log('  ! ' + m);

let problems = 0;
const fail = (m) => {
  problems += 1;
  bad(m);
};

// Expected prices, mirroring lib/config/pricing.ts (amounts in cents).
const EXPECTED_PRICES = [
  { env: 'STRIPE_PRICE_KIRA_VIP_MONTHLY', label: 'Monthly', cents: 7000, months: 1, required: true },
  { env: 'STRIPE_PRICE_KIRA_VIP_QUARTERLY', label: 'Quarterly', cents: 18900, months: 3, required: false },
  { env: 'STRIPE_PRICE_KIRA_VIP_MONTHLY_FOUNDING', label: 'Founding monthly', cents: 5000, months: 1, required: false },
  { env: 'STRIPE_PRICE_KIRA_VIP_QUARTERLY_FOUNDING', label: 'Founding quarterly', cents: 15000, months: 3, required: false },
];

function keyMode(value) {
  if (!value) return null;
  if (value.startsWith('sk_live_') || value.startsWith('rk_live_')) return 'LIVE';
  if (value.startsWith('sk_test_') || value.startsWith('rk_test_')) return 'test';
  return 'unrecognised';
}

function checkEnv() {
  console.log('\nEnvironment');
  const required = [
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_BOT_USERNAME',
    'TELEGRAM_GROUP_CHAT_ID',
    'TELEGRAM_BOT_VERIFY_SECRET',
  ];
  for (const name of required) {
    if (process.env[name]) ok(`${name} is set`);
    else fail(`${name} is MISSING`);
  }

  const mode = keyMode(process.env.STRIPE_SECRET_KEY);
  if (mode === 'LIVE') warn('STRIPE_SECRET_KEY is a LIVE key - real cards will be charged');
  else if (mode === 'test') ok('STRIPE_SECRET_KEY is a test key (safe for the dry run)');
  else if (mode) fail('STRIPE_SECRET_KEY does not look like a Stripe secret key');

  const secret = process.env.TELEGRAM_BOT_VERIFY_SECRET || '';
  if (secret && secret.length < 24) {
    warn('TELEGRAM_BOT_VERIFY_SECRET is quite short - use 32+ random characters');
  }
}

function checkSwitches() {
  console.log('\nSafety switches');
  const checkout = process.env.CHECKOUT_ENABLED === 'true';
  const automation = process.env.PAYMENT_AUTOMATION_ENABLED === 'true';
  console.log(`  CHECKOUT_ENABLED           = ${process.env.CHECKOUT_ENABLED ?? '(unset)'}  -> checkout ${checkout ? 'ON' : 'OFF'}`);
  console.log(`  PAYMENT_AUTOMATION_ENABLED = ${process.env.PAYMENT_AUTOMATION_ENABLED ?? '(unset)'}  -> access keys ${automation ? 'ON' : 'OFF'}`);
  if (checkout && keyMode(process.env.STRIPE_SECRET_KEY) === 'LIVE') {
    warn('Checkout is ON with a LIVE key: customers can be charged right now.');
  }
  if (!checkout) ok('Checkout is disabled (nobody can be charged)');
}

async function checkStripe() {
  console.log('\nStripe');
  if (!process.env.STRIPE_SECRET_KEY) {
    fail('No Stripe key - skipping Stripe checks');
    return;
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const account = await stripe.accounts.retrieve();
    const name =
      account.settings?.dashboard?.display_name || account.business_profile?.name || '';
    ok(`Connected to Stripe account: ${name || account.id} (${account.country})`);

    // Identity guard. KIRA once had a second, older company account
    // ("DAFFAR CRYPTO", GB) whose key was configured by mistake — payouts and
    // customer receipts would have shown the wrong legal entity.
    if (/daffar/i.test(name)) {
      fail('WRONG ACCOUNT: this is the old DAFFAR CRYPTO account, not Kira Engineer Hub.');
    } else if (!/kira/i.test(name)) {
      warn(`Account name "${name}" does not mention Kira - double-check this is the right company.`);
    }
    if (account.country !== 'US') {
      warn(`Account country is ${account.country}, but the legal entity is a Delaware (US) LLC.`);
    }
    if (account.charges_enabled === false) warn('This account cannot accept charges yet');
  } catch (e) {
    fail(`Could not reach Stripe: ${e.message}`);
    return;
  }

  for (const spec of EXPECTED_PRICES) {
    const id = process.env[spec.env];
    if (!id) {
      if (spec.required) fail(`${spec.label}: ${spec.env} is MISSING`);
      else warn(`${spec.label}: ${spec.env} not set (optional for launch)`);
      continue;
    }
    try {
      const price = await stripe.prices.retrieve(id);
      const amount = price.unit_amount;
      const months =
        price.recurring?.interval === 'month' ? price.recurring.interval_count : null;
      const amountOk = amount === spec.cents;
      const cadenceOk = months === spec.months;
      const money = `${(amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`;
      if (amountOk && cadenceOk) {
        ok(`${spec.label}: ${money} every ${months} month(s)`);
      } else {
        fail(
          `${spec.label}: expected ${(spec.cents / 100).toFixed(2)} every ${spec.months} month(s), found ${money} every ${months ?? '?'} month(s)`
        );
      }
      if (!price.active) fail(`${spec.label}: this price is ARCHIVED in Stripe`);
    } catch (e) {
      fail(`${spec.label}: price id not found in this Stripe mode (${e.message.split('\n')[0]})`);
    }
  }

  const coupon = process.env.STRIPE_EARLY_BIRD_COUPON_ID;
  if (!coupon) {
    warn('STRIPE_EARLY_BIRD_COUPON_ID not set - Early Bird members will pay standard price');
  } else {
    try {
      const c = await stripe.coupons.retrieve(coupon);
      if (c.percent_off === 20) ok(`Early Bird coupon: ${c.percent_off}% off`);
      else fail(`Early Bird coupon is ${c.percent_off ?? '?'}% off, expected 20%`);
    } catch (e) {
      fail(`Early Bird coupon not found: ${e.message.split('\n')[0]}`);
    }
  }

  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 10 });
    if (endpoints.data.length === 0) {
      fail('No webhook endpoint configured - payments will never activate access');
    } else {
      for (const ep of endpoints.data) {
        const hasCheckout = ep.enabled_events.includes('checkout.session.completed') ||
          ep.enabled_events.includes('*');
        console.log(`  ${hasCheckout ? '✓' : '✗'} webhook: ${ep.url} (${ep.status})`);
        if (!hasCheckout) problems += 1;
      }
    }
  } catch {
    warn('Could not list webhook endpoints (restricted key?)');
  }
}

async function checkTelegram() {
  console.log('\nTelegram');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    fail('No bot token - skipping Telegram checks');
    return;
  }
  let botId;
  try {
    const me = await (await fetch(`https://api.telegram.org/bot${token}/getMe`)).json();
    if (!me.ok) {
      fail(`Bot token rejected by Telegram: ${me.description}`);
      return;
    }
    botId = me.result.id;
    ok(`Bot token valid: @${me.result.username}`);
    const configured = (process.env.TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
    if (configured && configured !== me.result.username) {
      fail(`TELEGRAM_BOT_USERNAME is "${configured}" but the token belongs to "@${me.result.username}"`);
    }
  } catch (e) {
    fail(`Could not reach Telegram: ${e.message}`);
    return;
  }

  const groupId = process.env.TELEGRAM_GROUP_CHAT_ID;
  if (!groupId) {
    fail('TELEGRAM_GROUP_CHAT_ID missing - invite links cannot be created');
    return;
  }

  // A membership covers the VIP group AND the VIP channel. Being "reachable"
  // is not enough: without can_invite_users the invite silently fails at
  // redemption, and without can_restrict_members a lapsed member cannot be
  // removed. Check both rights on both chats.
  const chats = [{ label: 'VIP group', id: groupId, required: true }];
  if (process.env.TELEGRAM_CHANNEL_CHAT_ID) {
    chats.push({ label: 'VIP channel', id: process.env.TELEGRAM_CHANNEL_CHAT_ID, required: true });
  } else {
    warn('TELEGRAM_CHANNEL_CHAT_ID not set - members will only be invited to the group');
  }

  for (const chat of chats) {
    try {
      const res = await (
        await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(chat.id)}`)
      ).json();
      if (!res.ok) {
        fail(`Cannot see the ${chat.label} (${res.description}) - is the bot a member/admin?`);
        continue;
      }
      ok(`${chat.label} reachable: ${res.result.title || res.result.id}`);

      const mem = await (
        await fetch(
          `https://api.telegram.org/bot${token}/getChatMember?chat_id=${encodeURIComponent(chat.id)}&user_id=${botId}`
        )
      ).json();
      if (!mem.ok) {
        fail(`Could not read the bot's rights in the ${chat.label}: ${mem.description}`);
        continue;
      }
      if (mem.result.status !== 'administrator') {
        fail(`Bot is "${mem.result.status}" in the ${chat.label}, not an administrator`);
        continue;
      }
      if (mem.result.can_invite_users) ok(`${chat.label}: can invite via link`);
      else fail(`${chat.label}: bot lacks "Invite Users via Link" - invites will fail`);
      if (mem.result.can_restrict_members) ok(`${chat.label}: can remove lapsed members`);
      else fail(`${chat.label}: bot lacks "Ban Users" - lapsed members cannot be removed`);
    } catch (e) {
      fail(`Could not check the ${chat.label}: ${e.message}`);
    }
  }
}

/**
 * End-to-end proof that the shared secret matches what the deployed site
 * expects. The verify endpoint answers differently depending on the secret,
 * so a deliberately invalid request tells us everything without side effects:
 *   401 -> secret mismatch
 *   503 -> secret fine, automation still switched off
 *   400/200 -> secret fine, automation live
 */
async function checkSharedSecret() {
  console.log('\nWebsite <-> bot secret');
  const secret = process.env.TELEGRAM_BOT_VERIFY_SECRET;
  const base =
    process.env.SITE_URL ||
    (process.env.STRIPE_SUCCESS_URL || '').replace(/\/checkout\/success.*$/, '') ||
    'https://www.kiraengineerhub.com';

  if (!secret) {
    fail('TELEGRAM_BOT_VERIFY_SECRET not set locally - cannot test the handshake');
    return;
  }

  const url = `${base}/api/telegram/verify`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-kira-bot-secret': secret },
      // Deliberately incomplete: we only care how the endpoint reacts.
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      fail(`Secret MISMATCH: ${url} rejected this value. The deployed site has a different TELEGRAM_BOT_VERIFY_SECRET.`);
    } else if (response.status === 503 && data.reason === 'automation_disabled') {
      ok('Secret matches the deployed site (automation is still switched off, as expected before launch)');
    } else if (response.status === 503) {
      warn(`Secret accepted, but the site reports it is not fully configured (${data.reason || 'not_configured'})`);
    } else if (response.status === 400) {
      ok('Secret matches the deployed site and automation is ON');
    } else if (response.status === 404) {
      fail(
        `${url} returned 404 - the payment code is NOT deployed yet. ` +
          'Merge/deploy the feat/payments-automation branch, then re-run this check.'
      );
    } else {
      warn(`Unexpected response ${response.status} from ${url}`);
    }
  } catch (e) {
    warn(`Could not reach ${url} (${e.message}). Is the site deployed?`);
  }
}

async function checkDatabase() {
  console.log('\nDatabase');
  if (!process.env.DATABASE_URL) {
    fail('DATABASE_URL missing');
    return;
  }
  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) });
  try {
    const [legacy, claimed, entitlements, consents] = await Promise.all([
      prisma.legacyMember.count(),
      prisma.legacyMember.count({ where: { NOT: { claimedByUserId: null } } }),
      prisma.entitlement.count(),
      prisma.consentRecord.count(),
    ]);
    ok('All payment tables are present and queryable');
    console.log(`    loyalty registry : ${legacy} members (${claimed} claimed)`);
    console.log(`    entitlements     : ${entitlements}`);
    console.log(`    signed consents  : ${consents}`);
  } catch (e) {
    fail(`Database check failed - have you run the migrations? (${e.message.split('\n')[0]})`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('KIRA launch readiness check');
  console.log('(reads only - no secrets are printed)');
  checkEnv();
  checkSwitches();
  await checkStripe();
  await checkTelegram();
  await checkSharedSecret();
  await checkDatabase();

  console.log('\n' + '-'.repeat(50));
  if (problems === 0) {
    console.log('No blocking problems found.');
  } else {
    console.log(`${problems} problem(s) need attention (marked with x above).`);
  }
  console.log('Runbook: docs/launch-dry-run.md');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
