import fs from 'node:fs';
import path from 'node:path';
import { checkRules } from '../rules.js';

test('good policy has no rule errors', () => {
  const p = path.resolve(process.cwd(), 'samples/policy.good.json');
  const doc = JSON.parse(fs.readFileSync(p, 'utf-8'));
  const res = checkRules(doc);
  expect(res.errors.length).toBe(0);
});

test('bad policy has rule errors', () => {
  const p = path.resolve(process.cwd(), 'samples/policy.bad.json');
  const doc = JSON.parse(fs.readFileSync(p, 'utf-8'));
  const res = checkRules(doc);
  expect(res.errors.length).toBeGreaterThan(0);
});