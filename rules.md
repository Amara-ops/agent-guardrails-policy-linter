Rules (v0.1 additions now supported; warnings-first)

Existing (v0)
- Schema (2020-12): required keys, types, enums; meta.denomination present; logging boolean.
- Caps: max_outflow_d1 ≥ max_outflow_h1; call_rate_cap matches N/period (e.g., 60/hour).
- Calls: allowlist is array of [chainId, address, selector]; not empty in strict.
- Approvals: quorum ≥ 2; timelock_hours ≥ 0.
- Controls: pause.enabled boolean true/false.

New warnings (v0.1)
- ALLOWLIST_EMPTY: allowlist empty or missing (error in any mode; strict remains the same).
- GENERIC_EXECUTE_SELECTOR: presence of generic execute/multicall selectors.
- UNBOUNDED_APPROVAL_PATTERN: selectors consistent with unlimited approvals. (docs only for now)
- HIGH_CAP_WITH_LOW_GOV: caps above thresholds with quorum <2 or timelock <12h. (docs only for now)
- RATE_CAP_SUSPECT: call_rate_cap too high relative to spend caps. (docs only for now)
- DENOM_MISMATCH_HINT: denomination vs cap semantics look inconsistent. (docs only for now)
- PER_FUNCTION_RATE_CAP_INVALID: invalid caps.per_function overrides.
- PER_TARGET_CAP_INVALID: invalid caps.per_target_d1 overrides.
- DENY_TRIPLE_INVALID: invalid calls.denylist triple.
- DENYLIST_CONFLICT: same triple exists in allowlist and denylist.
- POLICY_EDIT_TIMELOCK_LOW: policy edit timelock present but <24h.
- INTENT_SLIPPAGE_MISSING_OR_LOOSE: swaps allowed but slippage limit missing/loose (>1000 bps).

Planned (v0.2)
- SARIF_EXPORT: map findings to SARIF static analysis format.
- MULTICHAIN_DENOMINATIONS: validate meta.denomination as map {chainId: unit}.
- SUPPRESSIONS: support a suppress array with rule + justification to adjust severity.

Severity levels
- error: blocks merge in strict; fail exit code.
- warning: prompts manual review; does not block unless --strict.
- suggestion: educational hint; never blocks.
