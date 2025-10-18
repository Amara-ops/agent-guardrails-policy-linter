export type Finding = { code: string; msg: string; path?: string };

export function checkRules(doc: any): { errors: Finding[]; warnings: Finding[]; suggestions: Finding[] } {
  const errors: Finding[] = [];
  const warnings: Finding[] = [];
  const suggestions: Finding[] = [];

  // Basic shape checks aligned to runtime v0.3.x
  if (!Array.isArray(doc?.allowlist) || doc.allowlist.length === 0) {
    errors.push({ code: 'ALLOWLIST_EMPTY', msg: 'allowlist must include at least one entry', path: 'allowlist' });
  } else {
    for (let i = 0; i < doc.allowlist.length; i++) {
      const e = doc.allowlist[i];
      const bad = !(e && Number.isInteger(e.chainId) && typeof e.to === 'string' && /^0x[0-9a-f]{40}$/.test(e.to) && typeof e.selector === 'string' && /^0x[0-9a-f]{8}$/.test(e.selector));
      if (bad) errors.push({ code: 'ALLOWLIST_ENTRY_INVALID', msg: `allowlist[${i}] must have chainId:int, to:0x40 lowercase, selector:0x8 lowercase`, path: `allowlist[${i}]` });
    }
  }

  // Caps sanity
  const h1 = doc?.caps?.max_outflow_h1;
  const d1 = doc?.caps?.max_outflow_d1;
  const perFn = doc?.caps?.max_per_function_h1;
  const toStr = (v: any) => typeof v === 'string' ? v : undefined;
  function capMin(v: any): bigint | undefined {
    if (typeof v === 'string') return BigInt(v);
    if (v && typeof v === 'object') {
      let min: bigint | undefined;
      for (const k in v) { const x = BigInt(v[k]); min = min === undefined ? x : (x < min ? x : min); }
      return min;
    }
    return undefined;
  }
  const h1min = capMin(h1);
  const d1min = capMin(d1);
  if (h1min === undefined) warnings.push({ code: 'H1_CAP_MISSING', msg: 'caps.max_outflow_h1 not set (no global rate limit)', path: 'caps.max_outflow_h1' });
  if (d1min === undefined) warnings.push({ code: 'D1_CAP_MISSING', msg: 'caps.max_outflow_d1 not set (no daily limit)', path: 'caps.max_outflow_d1' });
  if (h1min !== undefined && d1min !== undefined && h1min > d1min) {
    warnings.push({ code: 'H1_GT_D1', msg: 'Hourly outflow > daily outflow; consider tightening', path: 'caps' });
  }
  if (perFn !== undefined && (!(Number.isInteger(perFn)) || perFn <= 0)) {
    errors.push({ code: 'PER_FN_CAP_INVALID', msg: 'caps.max_per_function_h1 must be a positive integer if set', path: 'caps.max_per_function_h1' });
  }

  // Per-target caps keys
  for (const scope of ['h1','d1'] as const) {
    const pt = doc?.caps?.per_target?.[scope];
    if (pt && typeof pt === 'object') {
      for (const raw in pt) {
        if (!/^0x[0-9a-f]{40}(\|0x[0-9a-f]{8})?$/.test(raw)) {
          errors.push({ code: 'PER_TARGET_KEY_INVALID', msg: `caps.per_target.${scope} key must be 0x40 or 0x40|0x8`, path: `caps.per_target.${scope}.${raw}` });
        }
      }
    }
  }

  // Meta sanity
  const defaultDenom = doc?.meta?.defaultDenomination;
  const denoms = doc?.meta?.denominations;
  if (defaultDenom && !(denoms && typeof denoms[defaultDenom] === 'object')) {
    errors.push({ code: 'DEFAULT_DENOM_UNKNOWN', msg: 'meta.defaultDenomination must exist in meta.denominations', path: 'meta.defaultDenomination' });
  }
  if (denoms && typeof denoms === 'object') {
    const d = denoms[defaultDenom || 'BASE_USDC'];
    if (d && d.address && !/^0x[0-9a-f]{40}$/.test(d.address)) warnings.push({ code: 'DENOM_ADDRESS_FORMAT', msg: 'meta.denominations[...].address should be lowercase 0x40', path: 'meta.denominations.*.address' });
  }

  // Intent filters
  const slip = doc?.meta?.slippage_max_bps;
  if (slip !== undefined && (!Number.isInteger(slip) || slip < 0 || slip > 10000)) {
    errors.push({ code: 'SLIPPAGE_MAX_BPS_INVALID', msg: 'meta.slippage_max_bps must be 0..10000', path: 'meta.slippage_max_bps' });
  }
  const gap = doc?.meta?.nonce_max_gap;
  if (gap !== undefined && (!Number.isInteger(gap) || gap < 0)) {
    errors.push({ code: 'NONCE_MAX_GAP_INVALID', msg: 'meta.nonce_max_gap must be >= 0 integer', path: 'meta.nonce_max_gap' });
  }

  // Suggestions
  if (!doc?.meta?.denominations?.BASE_USDC) {
    suggestions.push({ code: 'SUGGEST_ADD_BASE_USDC', msg: 'Consider defining BASE_USDC in meta.denominations for clarity on decimals/address', path: 'meta.denominations' });
  }

  return { errors, warnings, suggestions };
}
