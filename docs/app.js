import Ajv from 'https://cdn.jsdelivr.net/npm/ajv@8.12.0/dist/ajv2020.min.js';

// Fetch schema and samples from the canonical repo (no duplication inside docs/)
const RAW_BASE = 'https://raw.githubusercontent.com/Amara-ops/agent-guardrails-policy-linter/main/';

async function fetchJSON(path) {
  const res = await fetch(RAW_BASE + path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json();
}

async function loadSchema() {
  return fetchJSON('schema.json');
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
  let policy;
  try { policy = JSON.parse(jsonText); }
  catch (e) { return { ok: false, parseError: String(e) }; }
  const schema = await loadSchema();
  const ajv = new Ajv({ strict: false, allErrors: true });
  const validate = ajv.compile(schema);
  const ok = validate(policy); // eslint-disable-line @typescript-eslint/no-unused-vars
  return normalizeReport(validate.errors);
}

function setSample(el, sample) {
  el.value = JSON.stringify(sample, null, 2);
}

async function loadSample(name) {
  return fetchJSON('samples/' + name);
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

(function main(){
  const policyInput = document.getElementById('policyInput');
  const reportPre = document.getElementById('report');
  const validateBtn = document.getElementById('validateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const sampleGoodBtn = document.getElementById('sampleGood');
  const sampleFullBtn = document.getElementById('sampleFull');

  sampleGoodBtn.addEventListener('click', async () => {
    reportPre.textContent = '';
    try {
      const s = await loadSample('policy.good.json');
      setSample(policyInput, s);
    } catch (e) {
      reportPre.textContent = 'Failed to load sample: policy.good.json — ' + String(e);
    }
  });

  sampleFullBtn.addEventListener('click', async () => {
    reportPre.textContent = '';
    try {
      const s = await loadSample('policy.full.preview.json');
      setSample(policyInput, s);
    } catch (e) {
      reportPre.textContent = 'Failed to load sample: policy.full.preview.json — ' + String(e);
    }
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
})();
