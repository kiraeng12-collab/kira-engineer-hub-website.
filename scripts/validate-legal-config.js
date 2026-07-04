const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "legal-config.js");
const text = fs.readFileSync(configPath, "utf8");
const checkoutEnabled = /checkoutEnabled:\s*true/.test(text);
const requiredWhenCheckoutEnabled = [
  "legalEntityName", "registrationNumber", "registrationCountry", "registeredAddress", "governingLaw",
  "supportEmail", "privacyContact", "cancellationDeadline", "refundRequestDeadline"
];
const missing = requiredWhenCheckoutEnabled.filter((key) => {
  const match = text.match(new RegExp(key + ':\\s*"([^"]*)"'));
  return !match || !match[1].trim();
});
const bannedPublic = [
  new RegExp(["Active", "Draft"].join(" "), "i"),
  new RegExp([["Pre", "launch"].join("-"), "Draft"].join(" "), "i"),
  new RegExp(["Operational", "draft"].join(" "), "i"),
  new RegExp(["legacy", "VIP"].join(" "), "i"),
  new RegExp(["backend", "can", "be", "connected", "later"].join(" "), "i"),
  new RegExp(["lorem", "ipsum"].join(" "), "i")
];
const publicFiles = fs.readdirSync(path.join(__dirname, ".."), { recursive: true })
  .filter((file) => String(file).endsWith(".html"));
const publicHits = [];
for (const file of publicFiles) {
  const content = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  for (const pattern of bannedPublic) if (pattern.test(content)) publicHits.push(file + " :: " + pattern);
}
if (checkoutEnabled && missing.length) {
  console.error("Checkout is enabled but required legal fields are missing: " + missing.join(", "));
  process.exit(1);
}
if (publicHits.length) {
  console.error("Public-facing draft/internal language found:");
  console.error(publicHits.join("\n"));
  process.exit(1);
}
console.log(checkoutEnabled ? "Checkout legal configuration validated." : "Checkout disabled: legal configuration gate is active.");
