const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
if (!isProduction) {
  console.log("Local development: legal placeholder validation skipped.");
  process.exit(0);
}

const configPath = path.join(__dirname, "legal-config.js");
const text = fs.readFileSync(configPath, "utf8");
const banned = [/TODO/i, /PLACEHOLDER/i, /TBC/i, /\[INSERT/i, /example\.com/i];
const missing = banned.filter((pattern) => pattern.test(text));

if (missing.length) {
  console.error("Production legal configuration contains unresolved placeholders.");
  console.error("Fill scripts/legal-config.js and src/config/legal.ts before production deployment.");
  process.exit(1);
}

console.log("Production legal configuration validated.");
