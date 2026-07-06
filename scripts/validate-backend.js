const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const requiredFiles = [
  'api/_utils.js',
  'api/forms.js',
  'api/checkout.js',
  'api/stripe-webhook.js',
  '.env.example',
  'docs/backend-phase-1.md'
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length) {
  console.error(`Missing backend files: ${missing.join(', ')}`);
  process.exit(1);
}

const envExample = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
const requiredEnv = [
  'CHECKOUT_ENABLED',
  'FORM_WEBHOOK_URL',
  'ADMIN_WEBHOOK_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_PRICE_KIRA_VIP_MONTHLY',
  'STRIPE_PRICE_KIRA_VIP_QUARTERLY',
  'STRIPE_EARLY_BIRD_COUPON_ID',
  'STRIPE_SUCCESS_URL',
  'STRIPE_CANCEL_URL',
  'STRIPE_WEBHOOK_SECRET'
];

const missingEnv = requiredEnv.filter((name) => !envExample.includes(`${name}=`));

if (missingEnv.length) {
  console.error(`Missing environment examples: ${missingEnv.join(', ')}`);
  process.exit(1);
}

console.log('Backend validation passed.');
