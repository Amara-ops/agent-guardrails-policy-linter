// ESM web app for GitHub Pages. Uses Ajv (draft 2020-12) via esm.sh.
// No local copies of schema/samples; fetched from the canonical repo.

const RAW_BASE = 'https://raw.githubusercontent.com/Amara-ops/agent-guardrails-policy-linter/main/';

// Load Ajv2020 from an ESM CDN
let Ajv2020;
try {
  ({ default: Ajv2020 } = await import('https://esm.sh/ajv@8/dist/2020'));
} catch (e) {
  console.error('Failed to import Ajv via ESM:', e);
  // Surface a readable error later if validation is attempted
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
  const text = await res.text();
  return JSON.parse(text);
}

async function loadSchema() {
  return fetchJSON(RAW_BASE + 'schema.json');
}

function normalizeReport(errors) {
  if (!errors || errors.length === 0) {
    return { ok: true, errors: [], warnings: [], summary: 'No schema errors. Run CLI/Action for rule checks.' };
  }
  return {
    ok: false,
    errors: errors.map(e => ({ instancePath: e.instancePath, message: e.message })),
    warnings: [],
    summary: `${errors.length} schema issue(s) found.`
  };
}

async function validatePolicy(jsonText) {
  if (!Ajv2020) throw new Error('Ajv ESM failed to load');
  let policy;
  try { policy = JSON.parse(jsonText); }
  catch (e) { return { ok: false, parseError: String(e) }; }
  const schema = await loadSchema();
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  const validate = ajv.compile(schema);
  validate(policy);
  return normalizeReport(validate.errors);
}

async function loadSample(name) {
  return fetchJSON(RAW_BASE + 'samples/' + name);
}

function setSample(el, sample) { el.value = JSON.stringify(sample, null, 2); }

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function wireUI() {
  const policyInput = document.getElementById('policyInput');
  const reportPre = document.getElementById('report');
  const validateBtn = document.getElementById('validateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const sampleGoodBtn = document.getElementById('sampleGood');
  const sampleFullBtn = document.getElementById('sampleFull');

  sampleGoodBtn.addEventListener('click', async () => {
    reportPre.textContent = '';
    try { setSample(policyInput, await loadSample('policy.good.json')); }
    catch (e) { reportPre.textContent = 'Failed to load sample: policy.good.json — ' + String(e); }
  });

  sampleFullBtn.addEventListener('click', async () => {
    reportPre.textContent = '';
    try { setSample(policyInput, await loadSample('policy.full.preview.json')); }
    catch (e) { reportPre.textContent = 'Failed to load sample: policy.full.preview.json — ' + String(e); }
  });

  validateBtn.addEventListener('click', async () => {
    reportPre.textContent = 'Validating...';
    try {
      const res = await validatePolicy(policyInput.value);
      const out = JSON.stringify(res, null, 2);
      reportPre.textContent = out;
      downloadBtn.disabled = !out;
      downloadBtn.onclick = () => download('policy.report.json', out);
    } catch (e) {
      reportPre.textContent = 'Validation failed: ' + String(e);
      downloadBtn.disabled = true;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireUI);
} else {
  wireUI();
}
