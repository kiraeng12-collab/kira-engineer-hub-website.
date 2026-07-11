const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return full.endsWith('.tsx') || full.endsWith('.mdx') ? [full] : [];
  });
}

const bannedPublic = [
  /pre-launch draft/i,
  /operational draft/i,
  /backend can be connected later/i,
  /lorem ipsum/i
];

const publicFiles = fs.existsSync(path.join(root, 'app')) ? listFiles(path.join(root, 'app')) : [];
const hits = [];

for (const file of publicFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of bannedPublic) {
    if (pattern.test(content)) hits.push(`${path.relative(root, file)} :: ${pattern}`);
  }
}

if (hits.length) {
  console.error('Public-facing draft/internal language found:');
  console.error(hits.join('\n'));
  process.exit(1);
}

console.log('Legal/public-language validation passed.');
