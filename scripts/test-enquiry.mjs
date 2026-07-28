#!/usr/bin/env node
/**
 * The only logic on this site with real branching is enquiry validation,
 * and it exists twice — TypeScript in the browser, PHP on the server.
 * This asserts the TS half behaves, and that both halves agree on the
 * cases that matter.
 *
 * Run: node scripts/test-enquiry.mjs
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateEnquiry, isValid } from '../src/lib/enquiry.ts';

const valid = {
  name: 'Nirav M',
  email: 'niravm@forestaindia.com',
  phone: '+91 98202 17090',
  organisation: 'PassionFox Technologies',
  segment: 'Municipal corporation / Smart City',
  city: 'Mumbai',
  scale: 'Liquid Tree — outdoor public space',
  timeline: 'This financial year',
  message: 'We are evaluating units for a metro forecourt in Andheri.',
};

let passed = 0;
const check = (label, fn) => {
  fn();
  passed++;
  console.log(`  ✓ ${label}`);
};

console.log('enquiry validation');

check('accepts a complete valid enquiry', () => {
  assert.ok(isValid(validateEnquiry(valid)));
});

check('rejects a missing name', () => {
  assert.ok(validateEnquiry({ ...valid, name: '' }).name);
});

check('rejects a one-character name', () => {
  assert.ok(validateEnquiry({ ...valid, name: 'A' }).name);
});

check('trims whitespace before length checks', () => {
  assert.ok(validateEnquiry({ ...valid, name: '   ' }).name);
});

check('rejects a malformed email', () => {
  for (const bad of ['nirav', 'nirav@', '@forestaindia.com', 'nirav@forestaindia', 'a b@c.com']) {
    assert.ok(validateEnquiry({ ...valid, email: bad }).email, `should reject ${bad}`);
  }
});

check('accepts ordinary email forms', () => {
  for (const good of ['a@b.co', 'nirav.m+leads@forestaindia.com', 'x_y@sub.domain.in']) {
    assert.ok(!validateEnquiry({ ...valid, email: good }).email, `should accept ${good}`);
  }
});

check('phone is optional but validated when present', () => {
  assert.ok(!validateEnquiry({ ...valid, phone: '' }).phone);
  assert.ok(!validateEnquiry({ ...valid, phone: '9820217090' }).phone);
  assert.ok(!validateEnquiry({ ...valid, phone: '+91 98202 17090' }).phone);
  assert.ok(!validateEnquiry({ ...valid, phone: '022-2345-6789' }).phone);
  assert.ok(validateEnquiry({ ...valid, phone: 'call me' }).phone);
  assert.ok(validateEnquiry({ ...valid, phone: '123' }).phone);
});

check('requires a segment', () => {
  assert.ok(validateEnquiry({ ...valid, segment: '' }).segment);
});

check('requires a message of at least 10 characters', () => {
  assert.ok(validateEnquiry({ ...valid, message: 'hi' }).message);
  assert.ok(!validateEnquiry({ ...valid, message: '0123456789' }).message);
});

check('rejects a message over the 2000 character cap', () => {
  assert.ok(validateEnquiry({ ...valid, message: 'x'.repeat(2001) }).message);
  assert.ok(!validateEnquiry({ ...valid, message: 'x'.repeat(2000) }).message);
});

check('reports every problem at once, not just the first', () => {
  const errors = validateEnquiry({ name: '', email: 'bad', segment: '', message: '' });
  assert.equal(Object.keys(errors).length, 4);
});

check('handles missing keys without throwing', () => {
  assert.ok(!isValid(validateEnquiry({})));
});

// ── Cross-check the PHP mirror ─────────────────────────────────────────
// The two implementations drift silently otherwise. This does not execute
// PHP; it asserts the shared constants and rules are still written the same.
console.log('\nPHP mirror (public/contact.php)');

const php = readFileSync(new URL('../public/contact.php', import.meta.url), 'utf8');
const ts = readFileSync(new URL('../src/lib/enquiry.ts', import.meta.url), 'utf8');

check('message cap matches on both sides', () => {
  assert.match(php, /\$MESSAGE_MAX = 2000;/);
  assert.match(ts, /MESSAGE_MAX = 2000/);
});

check('phone pattern matches on both sides', () => {
  const tsPattern = ts.match(/const PHONE = \/\^(.+)\$\/;/)?.[1];
  const phpPattern = php.match(/preg_match\('\/\^(.+)\$\/'/)?.[1];
  assert.ok(tsPattern, 'TS phone pattern not found');
  assert.equal(phpPattern, tsPattern);
});

check('server validates every field the client does', () => {
  for (const field of ['name', 'email', 'phone', 'segment', 'message']) {
    assert.ok(php.includes(`'${field}'`), `contact.php does not handle ${field}`);
  }
});

check('server keeps its bot traps', () => {
  assert.match(php, /company_website/);
  assert.match(php, /elapsed/);
});

console.log(`\n✓ ${passed} checks passed`);
