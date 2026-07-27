/*
 * Registers (or resets) the Telegram bot's menu button so tapping it opens the
 * KIRA Lot Sizing Calculator Mini App.
 *
 *   node scripts/set-lotsize-menu-button.js         # set the Mini App button
 *   node scripts/set-lotsize-menu-button.js --reset # restore the default menu
 *   node scripts/set-lotsize-menu-button.js --show   # print the current button
 *
 * Uses TELEGRAM_BOT_TOKEN from the environment. The Mini App URL defaults to
 * the production page and can be overridden with LOTSIZE_MINIAPP_URL. Sets the
 * bot-wide default menu button for all private chats (no chat_id).
 *
 * Requires an HTTPS, publicly reachable URL — Telegram will not open a Mini App
 * from localhost. Run this after the site is deployed.
 */

require('dotenv/config');

const TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
const URL =
  (process.env.LOTSIZE_MINIAPP_URL || '').trim() ||
  'https://www.kiraengineerhub.com/tools/lot-sizing-calculator/telegram';
const BUTTON_TEXT = '📊 Lot Size Calculator';

async function api(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method}: ${data.description || res.status}`);
  return data.result;
}

async function main() {
  if (!TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set. Add it to your environment and retry.');
    process.exit(1);
  }

  const arg = process.argv[2];

  if (arg === '--show') {
    const result = await api('getChatMenuButton', {});
    console.log('Current menu button:', JSON.stringify(result, null, 2));
    return;
  }

  if (arg === '--reset') {
    await api('setChatMenuButton', { menu_button: { type: 'default' } });
    console.log('✓ Menu button reset to the default (commands) menu.');
    return;
  }

  if (!URL.startsWith('https://')) {
    console.error(`Mini App URL must be HTTPS. Got: ${URL}`);
    process.exit(1);
  }

  await api('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: BUTTON_TEXT,
      web_app: { url: URL },
    },
  });
  console.log(`✓ Menu button now opens the Lot Sizing Calculator:\n  ${BUTTON_TEXT} -> ${URL}`);
  console.log('\nOpen a private chat with the bot and tap the menu button to test.');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
