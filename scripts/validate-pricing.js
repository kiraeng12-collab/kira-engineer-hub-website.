const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const files = [
  "index.html",
  "membership-terms/index.html",
  "early-bird/index.html",
  "scripts/pricing-config.js",
  "src/config/pricing.ts"
];

const required = [
  "$50",
  "$135",
  "$150",
  "$21",
  "10%",
  "$45/month",
  "$40/month",
  "$108",
  "20%"
];

const forbidden = [
  "USD 50",
  "USD 135",
  "$50",
  "$135"
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
