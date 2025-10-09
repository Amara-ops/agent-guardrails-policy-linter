// App script (classic, non-module). Requires Ajv UMD loaded first.
// Tries same-origin schema/samples first (works on GitHub Pages or when serving repo root),
// then falls back to raw.githubusercontent.com.

(function(){
  const RAW_BASE = 'https://raw.githubusercontent.com/Amara-ops/agent-guardrails-policy-linter/main/';

  function byId(id){ return document.getElementById(id); }

  async function fetchJSONFallback(paths){
    let lastErr;
    for (const path of paths){
      try {
        const res = await fetch(path, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + path);
        // Some servers mis-set MIME; still parse as JSON
        const text = await res.text();
        return JSON.parse(text);
      } catch (e){ lastErr = e; }
    }
    throw lastErr || new Error('Failed to fetch any JSON path');
  }

  function schemaPaths(){
    return [
      new URL('../schema.json', location.href).toString(),
      RAW_BASE + 'schema.json'
    ];
  }

  function samplePaths(name){
    return [
      new URL('../samples/' + name, location.href).toString(),
      RAW_BASE + 'samples/' + name
    ];
  }

  function normalizeReport(errors){
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

  async function validatePolicy(jsonText){
    let policy;
    try { policy = JSON.parse(jsonText); }
    catch (e) { return { ok: false, parseError: String(e) }; }
    const schema = await fetchJSONFallback(schemaPaths());
    const ajv = new Ajv({ strict: false, allErrors: true });
    const validate = ajv.compile(schema);
    validate(policy);
    return normalizeReport(validate.errors);
  }

  function setSample(el, sample){ el.value = JSON.stringify(sample, null, 2); }

  async function loadSample(name){
    return fetchJSONFallback(samplePaths(name));
  }

  function download(filename, text){
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  // Wire UI
  const policyInput = byId('policyInput');
  const reportPre = byId('report');
  const validateBtn = byId('validateBtn');
  const downloadBtn = byId('downloadBtn');
  const sampleGoodBtn = byId('sampleGood');
  const sampleFullBtn = byId('sampleFull');

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
