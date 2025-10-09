import Ajv from 'https://cdn.jsdelivr.net/npm/ajv@8.12.0/dist/ajv2020.min.js';

// Inline fallbacks so the UI still works when opened via file:// (fetch() often fails under file URLs)
const inlineSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Agent Treasury Policy",
  "type": "object",
  "required": ["meta", "caps", "calls", "approvals", "controls"],
  "properties": {
    "meta": {
      "type": "object",
      "required": ["denomination", "logging"],
      "properties": {
        "denomination": { "type": "string", "enum": ["BASE_USDC", "ETH"] },
        "logging": { "type": "boolean" }
      }
    },
    "caps": {
      "type": "object",
      "required": ["max_outflow_h1", "max_outflow_d1", "call_rate_cap"],
      "properties": {
        "max_outflow_h1": { "type": "number", "exclusiveMinimum": 0 },
        "max_outflow_d1": { "type": "number", "exclusiveMinimum": 0 },
        "call_rate_cap": { "type": "string", "pattern": "^[0-9]+/hour$" },
        "anomaly_block": { "type": "object", "properties": { "enabled": { "type": "boolean" } } },
        "per_function": {
          "type": "object",
          "patternProperties": {
            "^0x[0-9a-fA-F]{8}$": { "type": "string", "pattern": "^[0-9]+/hour$" }
          },
          "additionalProperties": false
        },
        "per_target_d1": {
          "type": "object",
          "patternProperties": {
            "^0x[0-9a-fA-F]{40}$": { "type": "number", "exclusiveMinimum": 0 }
          },
          "additionalProperties": false
        }
      }
    },
    "calls": {
      "type": "object",
      "required": ["allowlist"],
      "properties": {
        "allowlist": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "array",
            "prefixItems": [
              { "type": "integer", "minimum": 1 },
              { "type": "string", "pattern": "^0x[0-9a-fA-F]{40}$" },
              { "type": "string", "pattern": "^0x[0-9a-fA-F]{8}$" }
            ],
            "items": false,
            "minItems": 3,
            "maxItems": 3
          }
        },
        "denylist": {
          "type": "array",
          "items": {
            "type": "array",
            "prefixItems": [
              { "type": "integer", "minimum": 1 },
              { "type": "string", "pattern": "^0x[0-9a-fA-F]{40}$" },
              { "type": "string", "pattern": "^0x[0-9a-fA-F]{8}$" }
            ],
            "items": false,
            "minItems": 3,
            "maxItems": 3
          }
        }
      }
    },
    "approvals": {
      "type": "object",
      "required": ["quorum"],
      "properties": {
        "quorum": { "type": "integer", "minimum": 2 },
        "timelock_hours": { "type": "integer", "minimum": 0 },
        "policy_edit_timelock_hours": { "type": "integer", "minimum": 0 }
      }
    },
    "controls": {
      "type": "object",
      "properties": {
        "pause": { "type": "object", "properties": { "enabled": { "type": "boolean" } } }
      }
    },
    "intent_filters": {
      "type": "object",
      "properties": {
        "max_slippage_bps": { "type": "integer", "minimum": 0, "maximum": 10000 },
        "max_price_dev_bps": { "type": "integer", "minimum": 0, "maximum": 10000 }
      }
    }
  }
};

const sampleGoodInline = {
  "meta": { "denomination": "BASE_USDC", "logging": true },
  "caps": { "max_outflow_h1": 100, "max_outflow_d1": 500, "call_rate_cap": "60/hour", "anomaly_block": { "enabled": true } },
  "calls": { "allowlist": [[8453, "0x0000000000000000000000000000000000000001", "0xa9059cbb"], [8453, "0x0000000000000000000000000000000000000002", "0x095ea7b3"]] },
  "approvals": { "quorum": 2, "timelock_hours": 24 },
  "controls": { "pause": { "enabled": true } }
};

async function loadSchema() {
  try {
    const res = await fetch('../schema.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('Falling back to inline schema (fetch failed):', e);
    return inlineSchema;
  }
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
  try {
    const res = await fetch(`../samples/${name}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('Sample fetch failed; using inline sample where possible:', e);
    if (name === 'policy.good.json') return sampleGoodInline;
    throw e;
  }
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
      reportPre.textContent = 'Failed to load sample.good: ' + String(e);
    }
  });

  sampleFullBtn.addEventListener('click', async () => {
    reportPre.textContent = '';
    try {
      const s = await loadSample('policy.full.preview.json');
      setSample(policyInput, s);
    } catch (e) {
      reportPre.textContent = 'Failed to load sample.full.preview: ' + String(e) + '\nTip: run a local server (e.g., `npx http-server docs/`) or enable GitHub Pages.';
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
      reportPre.textContent = 'Validation failed: ' + String(e) + '\nTip: open via a local server or GitHub Pages.';
      downloadBtn.disabled = true;
    }
  });
})();
