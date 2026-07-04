const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const files = [
  "index.html",
  "membership-terms/index.html",
  "early-bird/index.html",
  "scripts/pricing-config.js",
  "src/config/pricing.ts",
  "legal/membership-terms/index.html",
  "docs/stripe-pricing-checkout.md"
];

const required = [
  "USD 70 per month",
  "USD 189 every three months",
  "USD 210",
  "USD 21",
  "10%",
  "USD 63 per month",
  "USD 56 per month",
  "USD 151.20",
  "20%",
  "KIRA VIP Membership"
];

const forbidden = [
  "$50 <span>/ month</span>",
  "$135 <span>every 3 months</span>",
  "$40/month instead of $50",
  "$108 every 3 months instead of $135",
  "Kira VIP Monthly: USD 50, 5000 cents",
  "Kira VIP Three-Month: USD 135, 13500 cents",
  "monthlyMembershipPrice: 50",
  "threeMonthMembershipPrice: 135",
  [String.fromCharCode(36) + "70", "<span>/ month</span>"].join(" "),
  [String.fromCharCode(36) + "189", "<span>every 3 months</span>"].join(" "),
  [String.fromCharCode(36) + "56", "month"].join("/"),
  [String.fromCharCode(36) + "151.20", "every 3 months"].join(" "),
  ["legacy", "VIP"].join(" ")
];

let joined = "";
for (const file of files) {
  joined += fs.readFileSync(path.join(root, file), "utf8") + "\n";
}

for (const token of required) {
  if (!joined.includes(token)) {
    console.error(`Pricing validation failed: missing ${token}`);
    process.exit(1);
  }
}

for (const token of forbidden) {
  if (joined.includes(token)) {
    console.error(`Pricing validation failed: old price still present: ${token}`);
    process.exit(1);
  }
}

console.log("Pricing validation passed.");
