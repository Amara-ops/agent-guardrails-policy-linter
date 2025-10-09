import Ajv from 'https://cdn.jsdelivr.net/npm/ajv@8.12.0/dist/ajv2020.min.js';

async function loadSchema() {
  const res = await fetch('../schema.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load schema.json');
  return res.json();
}

function normalizeReport(errors) {
  if (!errors || errors.length === 0) {
    return { ok: true, errors: [], warnings: [], summary: 'No schema errors. Run CLI for rule checks.' };
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
  const ok = validate(policy);
  return normalizeReport(validate.errors);
}

function setSample(el, sample) {
  el.value = JSON.stringify(sample, null, 2);
}

async function loadSample(name) {
  const res = await fetch(`../samples/${name}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load sample');
  return res.json();
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

(async function main(){
  const policyInput = document.getElementById('policyInput');
  const reportPre = document.getElementById('report');
  const validateBtn = document.getElementById('validateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const sampleGoodBtn = document.getElementById('sampleGood');
  const sampleFullBtn = document.getElementById('sampleFull');

  sampleGoodBtn.addEventListener('click', async () => {
    const s = await loadSample('policy.good.json');
    setSample(policyInput, s);
    reportPre.textContent = '';
  });

  sampleFullBtn.addEventListener('click', async () => {
    const s = await loadSample('policy.full.preview.json');
    setSample(policyInput, s);
    reportPre.textContent = '';
  });

  validateBtn.addEventListener('click', async () => {
    reportPre.textContent = 'Validating...';
    const res = await validatePolicy(policyInput.value);
    const out = JSON.stringify(res, null, 2);
    reportPre.textContent = out;
    downloadBtn.disabled = !out;
    downloadBtn.onclick = () => download('policy.report.json', out);
  });
})();
