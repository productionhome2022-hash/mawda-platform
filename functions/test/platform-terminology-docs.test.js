const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '../..');
const canonicalDocs = [
  'docs/MAWADDA_PRODUCT_CONSTITUTION.md',
  'docs/MAWADDA_COMPREHENSIVE_PRODUCT_VISION_2026.md',
  'docs/MAWADDA_APPROVED_DECISIONS_AND_TRACEABILITY.md',
  'docs/MAWADDA_BRAND_AND_PRODUCT_EXPERIENCE.md',
  'docs/SEVEN_PHASE_EXECUTION_PLAN.md',
  'docs/STRUCTURAL_GOVERNANCE_AND_BIOMETRIC_VERIFICATION_2026-11-19.md',
  'docs/MAWADDA_CANONICAL_ADMIN_TERMINOLOGY.md',
];
const legacyOwnerLabels = [/Super Admin Owner/i, /Super Admin/i, /السوبر أدمن/i, /سوبر أدمن/i, /السوبر اونر/i, /سوبر اونر/i];

test('canonical governance documents use one owner and supervisor terminology', () => {
  const contents = canonicalDocs.map((relativePath) => {
    const absolutePath = path.join(repoRoot, relativePath);
    assert.ok(fs.existsSync(absolutePath), `Missing canonical document: ${relativePath}`);
    return [relativePath, fs.readFileSync(absolutePath, 'utf8')];
  });

  for (const [relativePath, text] of contents) {
    for (const pattern of legacyOwnerLabels) {
      assert.doesNotMatch(text, pattern, `${relativePath} contains a deprecated owner label`);
    }
    assert.match(text, /Super Owner/, `${relativePath} must name the canonical platform owner`);
    assert.match(text, /Admin Media 1.?5|Admin Media/, `${relativePath} must preserve the Admin Media identity`);
    assert.match(text, /مشرف إنتاج عام/, `${relativePath} must preserve the general production supervisor identity`);
    assert.match(text, /مشرف إنتاج الفريق/, `${relativePath} must preserve the team production supervisor identity`);
  }
});

test('README links the canonical administrative terminology source', () => {
  const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  assert.match(readme, /docs\/MAWADDA_CANONICAL_ADMIN_TERMINOLOGY\.md/);
});
