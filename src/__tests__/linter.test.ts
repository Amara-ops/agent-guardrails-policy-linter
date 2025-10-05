import fs from 'node:fs';
import path from 'node:path';
import { checkRules } from '../rules.js';

function load(name: string) {
  const p = path.resolve(process.cwd(), `samples/${name}`);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

test('good policy has no rule errors', () => {
  const res = checkRules(load('policy.good.json'));
  expect(res.errors.length).toBe(0);
});

test('bad policy has rule errors', () => {
  const res = checkRules(load('policy.bad.json'));
  expect(res.errors.length).toBeGreaterThan(0);
});

test('full preview validates optional fields with warnings-first', () => {
  const res = checkRules(load('policy.full.preview.json'));
  // optional fields should not introduce hard errors by themselves
  expect(res.errors.find(e => e.code.startsWith('PER_') || e.code.startsWith('INTENT_'))).toBeUndefined();
});
