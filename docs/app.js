// Classic script; dynamically loads Ajv UMD from CDN (no modules). Target: GitHub Pages.
(function(){
  const RAW_BASE = 'https://raw.githubusercontent.com/Amara-ops/agent-guardrails-policy-linter/main/';
  const AJV_CDNS = [
    'https://cdn.jsdelivr.net/npm/ajv@8/dist/ajv.min.js',
    'https://unpkg.com/ajv@8/dist/ajv.min.js'
  ];
  let ajvLoadPromise = null;

  function byId(id){ return document.getElementById(id); }

  function loadScript(src){
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  async function ensureAjvLoaded(){
    if ((window.Ajv || window.ajv)) {
      window.Ajv = window.Ajv || window.ajv; // normalize
      return window.Ajv;
    }
    if (!ajvLoadPromise) {
      ajvLoadPromise = (async () => {
        let lastErr;
        for (const url of AJV_CDNS){
          try { await loadScript(url); } catch (e){ lastErr = e; continue; }
          const Ajv = window.Ajv || window.ajv;
          if (Ajv) { window.Ajv = Ajv; return Ajv; }
        }
        throw lastErr || new Error('Ajv UMD not available');
      })();
    }
    return ajvLoadPromise;
  }

  async function fetchJSON(path){
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + path);
    // Some static hosts set text/plain; parse manually
    const text = await res.text();
    return JSON.parse(text);
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
    const schema = await fetchJSON(RAW_BASE + 'schema.json');
    const AjvCtor = await ensureAjvLoaded();
    const ajv = new AjvCtor({ strict: false, allErrors: true });
    const validate = ajv.compile(schema);
    validate(policy);
    return normalizeReport(validate.errors);
  }

  async function loadSample(name){
    return fetchJSON(RAW_BASE + 'samples/' + name);
  }

  function setSample(el, sample){ el.value = JSON.stringify(sample, null, 2); }

  function download(filename, text){
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  document.addEventListener('DOMContentLoaded', function(){
    const policyInput = byId('policyInput');
    const reportPre = byId('report');
    const validateBtn = byId('validateBtn');
    const downloadBtn = byId('downloadBtn');
    const sampleGoodBtn = byId('sampleGood');
    const sampleFullBtn = byId('sampleFull');

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

    // Preload Ajv in the background to reduce first-validate latency
    ensureAjvLoaded().catch(() => {/* noop; will surface on validate */});
  });
})();
