export function checkRules(doc) {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    // meta
    if (doc?.meta?.logging !== true) {
        errors.push({ code: 'LOGGING_DISABLED', msg: 'meta.logging must be true', path: 'meta.logging' });
    }
    const denom = doc?.meta?.denomination;
    if (denom !== 'BASE_USDC' && denom !== 'ETH') {
        errors.push({ code: 'DENOMINATION_INVALID', msg: 'meta.denomination must be BASE_USDC or ETH', path: 'meta.denomination' });
    }
    // caps
    const h1 = doc?.caps?.max_outflow_h1;
    const d1 = doc?.caps?.max_outflow_d1;
    if (!(typeof h1 === 'number') || h1 <= 0) {
        errors.push({ code: 'CAPS_H1_NONPOSITIVE', msg: 'caps.max_outflow_h1 must be > 0', path: 'caps.max_outflow_h1' });
    }
    if (!(typeof d1 === 'number') || d1 <= 0) {
        errors.push({ code: 'CAPS_D1_NONPOSITIVE', msg: 'caps.max_outflow_d1 must be > 0', path: 'caps.max_outflow_d1' });
    }
    if (typeof h1 === 'number' && typeof d1 === 'number' && h1 > d1) {
        errors.push({ code: 'CAPS_H1_GT_D1', msg: 'caps.max_outflow_h1 must be <= caps.max_outflow_d1', path: 'caps.max_outflow_h1' });
    }
    const rate = doc?.caps?.call_rate_cap;
    if (typeof rate !== 'string' || !/^\d+\/hour$/.test(rate)) {
        errors.push({ code: 'RATE_CAP_FORMAT', msg: 'caps.call_rate_cap must be "N/hour"', path: 'caps.call_rate_cap' });
    }
    else {
        const n = parseInt(rate.split('/')[0], 10);
        if (n > 1000)
            warnings.push({ code: 'RATE_CAP_HIGH', msg: 'call rate >1000/hour may be excessive', path: 'caps.call_rate_cap' });
    }
    if (doc?.caps?.anomaly_block?.enabled !== true) {
        warnings.push({ code: 'ANOMALY_BLOCK_DISABLED', msg: 'Enable caps.anomaly_block.enabled', path: 'caps.anomaly_block.enabled' });
    }
    // caps.per_function overrides
    if (doc?.caps?.per_function) {
        const pf = doc.caps.per_function;
        for (const sel in pf) {
            const val = pf[sel];
            if (!/^0x[0-9a-fA-F]{8}$/.test(sel) || typeof val !== 'string' || !/^\d+\/hour$/.test(val)) {
                warnings.push({ code: 'PER_FUNCTION_RATE_CAP_INVALID', msg: `caps.per_function[${sel}] should be selector=>"N/hour"`, path: `caps.per_function.${sel}` });
            }
        }
    }
    // caps.per_target_d1 overrides
    if (doc?.caps?.per_target_d1) {
        const pt = doc.caps.per_target_d1;
        for (const addr in pt) {
            const val = pt[addr];
            if (!/^0x[0-9a-fA-F]{40}$/.test(addr) || typeof val !== 'number' || val <= 0) {
                warnings.push({ code: 'PER_TARGET_CAP_INVALID', msg: `caps.per_target_d1[${addr}] should be >0 number`, path: `caps.per_target_d1.${addr}` });
            }
        }
    }
    // calls.allowlist triples
    const al = doc?.calls?.allowlist;
    if (!Array.isArray(al) || al.length === 0) {
        errors.push({ code: 'ALLOWLIST_EMPTY', msg: 'calls.allowlist must include at least one [chainId, addr, selector] triple', path: 'calls.allowlist' });
    }
    else {
        for (let i = 0; i < al.length; i++) {
            const t = al[i];
            const bad = !Array.isArray(t) || t.length !== 3 || typeof t[0] !== 'number' || !/^0x[0-9a-fA-F]{40}$/.test(t[1]) || !/^0x[0-9a-fA-F]{8}$/.test(t[2]);
            if (bad) {
                errors.push({ code: 'BAD_TRIPLE', msg: `allowlist[${i}] must be [chainId:int, addr:0x40, selector:0x8]`, path: `calls.allowlist[${i}]` });
            }
            // generic execute/multicall patterns
            if (t[2]?.toLowerCase() === '0x5ae401dc' || t[2]?.toLowerCase() === '0x1f931c1c') {
                warnings.push({ code: 'GENERIC_EXECUTE_SELECTOR', msg: `selector ${t[2]} may allow arbitrary calls`, path: `calls.allowlist[${i}][2]` });
            }
        }
    }
    // calls.denylist conflicts
    if (Array.isArray(doc?.calls?.denylist)) {
        const dl = doc.calls.denylist;
        for (let i = 0; i < dl.length; i++) {
            const t = dl[i];
            const bad = !Array.isArray(t) || t.length !== 3 || typeof t[0] !== 'number' || !/^0x[0-9a-fA-F]{40}$/.test(t[1]) || !/^0x[0-9a-fA-F]{8}$/.test(t[2]);
            if (bad)
                warnings.push({ code: 'DENY_TRIPLE_INVALID', msg: `denylist[${i}] should be [chainId, addr, selector]`, path: `calls.denylist[${i}]` });
            // conflict check
            if (Array.isArray(al)) {
                const conflict = al.some(([c, a, s]) => c === t[0] && a === t[1] && s === t[2]);
                if (conflict)
                    warnings.push({ code: 'DENYLIST_CONFLICT', msg: `denylist entry also present in allowlist`, path: `calls.denylist[${i}]` });
            }
        }
    }
    // approvals
    const quorum = doc?.approvals?.quorum;
    if (!(Number.isInteger(quorum)) || quorum < 2) {
        errors.push({ code: 'QUORUM_TOO_LOW', msg: 'approvals.quorum must be >= 2', path: 'approvals.quorum' });
    }
    const tl = doc?.approvals?.timelock_hours;
    if (!(Number.isInteger(tl)) || tl < 24) {
        warnings.push({ code: 'TIMELOCK_MISSING_OR_LOW', msg: 'approvals.timelock_hours should be >= 24', path: 'approvals.timelock_hours' });
    }
    const petl = doc?.approvals?.policy_edit_timelock_hours;
    if (petl !== undefined && (!Number.isInteger(petl) || petl < 24)) {
        warnings.push({ code: 'POLICY_EDIT_TIMELOCK_LOW', msg: 'approvals.policy_edit_timelock_hours should be >= 24', path: 'approvals.policy_edit_timelock_hours' });
    }
    // intent filters when swaps present
    const hasSwap = Array.isArray(al) && al.some(([, , s]) => s?.toLowerCase() === '0x04e45aaf');
    if (hasSwap) {
        const sl = doc?.intent_filters?.max_slippage_bps;
        if (!(Number.isInteger(sl)) || sl <= 0 || sl > 1000) {
            warnings.push({ code: 'INTENT_SLIPPAGE_MISSING_OR_LOOSE', msg: 'intent_filters.max_slippage_bps should be 1..1000', path: 'intent_filters.max_slippage_bps' });
        }
    }
    // controls.pause
    if (doc?.controls?.pause?.enabled !== true) {
        warnings.push({ code: 'PAUSE_DISABLED', msg: 'controls.pause.enabled should be true', path: 'controls.pause.enabled' });
    }
    // suggestions
    if (denom !== 'BASE_USDC') {
        suggestions.push({ code: 'SUGGEST_DENOMINATION', msg: 'Use BASE_USDC if operating primarily on Base', path: 'meta.denomination' });
    }
    return { errors, warnings, suggestions };
}
