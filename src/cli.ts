#!/usr/bin/env node
import type { AjvError } from './schema.js';
import fs from 'node:fs';
import path from 'node:path';
import { validator } from './schema.js';
import { checkRules } from './rules.js';
import { buildSarif } from './sarif.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts: any = { strict: false, report: null, sarif: null, artifact: null, files: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--strict') opts.strict = true;
    else if (a === '--report') { opts.report = args[++i]; }
    else if (a === '--sarif') { opts.sarif = args[++i]; }
    else if (a === '--artifact') { opts.artifact = args[++i]; }
    else if (a === '--no-color') { /* ignored for now */ }
    else if (!a.startsWith('-')) opts.files.push(a);
  }
  return opts;
}

function main() {
  const opts = parseArgs();
  if (opts.files.length === 0) {
    console.error('Usage: policy-linter [--strict] [--report out.json] [--sarif out.sarif] [--artifact policy.json] policy.json');
    process.exit(2);
  }

  const file = path.resolve(process.cwd(), opts.files[0]);
  const raw = fs.readFileSync(file, 'utf-8');
  const doc = JSON.parse(raw);

  const okSchema = validator(doc);
  const schemaErrors = okSchema ? [] : (validator.errors || []).map((e: AjvError) => ({ code: 'SCHEMA', msg: `${e.instancePath ?? ''} ${e.message}` }));

  const ruleFindings = checkRules(doc);
  const errors = [...schemaErrors, ...ruleFindings.errors];
  const warnings = ruleFindings.warnings;
  const suggestions = ruleFindings.suggestions;

  const pass = errors.length === 0 && (!opts.strict || warnings.length === 0);

  const report = { ok: pass, errors, warnings, suggestions };

  if (opts.report) {
    fs.writeFileSync(path.resolve(process.cwd(), opts.report), JSON.stringify(report, null, 2));
  }
  if (opts.sarif) {
    const sarif = buildSarif(report, opts.artifact || opts.files[0]);
    fs.writeFileSync(path.resolve(process.cwd(), opts.sarif), JSON.stringify(sarif, null, 2));
  }

  const toLines = (arr: any[], tag: string) => arr.map(x => `${tag} ${x.code}: ${x.msg}`).join('\n');
  if (!pass) {
    console.error(toLines(errors, 'ERROR'));
    if (warnings.length) console.error(toLines(warnings, 'WARN '));
  } else {
    console.log('OK');
    if (warnings.length) console.log(toLines(warnings, 'WARN '));
  }

  process.exit(pass ? 0 : 1);
}

main();
