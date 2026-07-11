const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const requiredFiles = [
  'app/api/forms/route.ts',
  'app/api/stripe/create-checkout-session/route.ts',
  'app/api/stripe/create-customer-portal/route.ts',
  'app/api/stripe/webhook/route.ts',
  'app/api/membership/status/route.ts',
  'lib/api-utils.ts',
  'lib/config/legal.ts',
  'lib/config/pricing.ts',
  'lib/config/checkout-readiness.ts',
  'lib/db/prisma.ts',
  'lib/rate-limit.ts',
  'lib/email/send.ts',
  'lib/auth/config.ts',
  'lib/auth/tokens.ts',
  'lib/stripe/client.ts',
  'lib/stripe/status.ts',
  'lib/telegram/client.ts',
  'lib/telegram/membership-sync.ts',
  'app/api/telegram/link/route.ts',
  'app/api/telegram/webhook/route.ts',
  'lib/early-bird/status.ts',
  'scripts/early-bird-review.js',
  'docs/early-bird-admin-workflow.md',
  'middleware.ts',
  'prisma/schema.prisma',
  'docs/backend-phase-1.md',
  'docs/backend-phase-6.md',
  'docs/backend-phase-7.md',
  'docs/backend-phase-8.md',
  'docs/backend-phase-12.md'
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
const envExamplePath = fs.existsSync(path.join(root, '.env.example'))
  ? path.join(root, '.env.example')
  : path.join(root, 'env.example');

if (!fs.existsSync(envExamplePath)) missing.push('env.example');

if (missing.length) {
  console.error(`Missing backend files: ${missing.join(', ')}`);
  process.exit(1);
}

const envExample = fs.readFileSync(envExamplePath, 'utf8');
const requiredEnv = [
  'CHECKOUT_ENABLED',
  'FORM_WEBHOOK_URL',
  'ADMIN_WEBHOOK_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_KIRA_VIP_MONTHLY',
  'STRIPE_PRICE_KIRA_VIP_QUARTERLY',
  'STRIPE_PRICE_KIRA_VIP_MONTHLY_FOUNDING',
  'STRIPE_PRICE_KIRA_VIP_QUARTERLY_FOUNDING',
  'STRIPE_EARLY_BIRD_COUPON_ID',
  'STRIPE_SUCCESS_URL',
  'STRIPE_CANCEL_URL',
  'STRIPE_WEBHOOK_SECRET',
  'DATABASE_URL',
  'RESEND_API_KEY',
  'ADMIN_NOTIFICATION_EMAIL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_BOT_USERNAME',
  'TELEGRAM_GROUP_CHAT_ID',
  'TELEGRAM_WEBHOOK_SECRET'
];

const missingEnv = requiredEnv.filter((name) => !envExample.includes(`${name}=`));

if (missingEnv.length) {
  console.error(`Missing environment examples: ${missingEnv.join(', ')}`);
  process.exit(1);
}

console.log('Backend validation passed.');
