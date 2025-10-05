Rules (v0.1 work-in-progress additions highlighted)

Existing (v0)
- Schema (2020-12): required keys, types, enums; meta.denomination present; logging boolean.
- Caps: max_outflow_d1 ≥ max_outflow_h1; call_rate_cap matches N/period (e.g., 60/hour).
- Calls: allowlist is array of [chainId, address, selector]; not empty in strict.
- Approvals: quorum ≥ 2; timelock_hours ≥ 0.
- Controls: pause.enabled boolean true/false.

New warnings (v0.1 WIP)
- ALLOWLIST_EMPTY: allowlist empty or missing (warn; error in --strict).
- GENERIC_EXECUTE_SELECTOR: presence of generic execute/multicall selectors.
- UNBOUNDED_APPROVAL_PATTERN: selectors consistent with unlimited approvals.
- HIGH_CAP_WITH_LOW_GOV: caps above thresholds with quorum <2 or timelock <12h.
- RATE_CAP_SUSPECT: call_rate_cap too high relative to spend caps.
- DENOM_MISMATCH_HINT: denomination vs cap semantics look inconsistent.

Planned (v0.2)
- SARIF_EXPORT: map findings to SARIF static analysis format.
- PER_FUNCTION_RATE_CAPS: validate caps.per_function overrides when present.
- MULTICHAIN_DENOMINATIONS: validate meta.denomination as map {chainId: unit}.
- SUPPRESSIONS: support a suppress array with rule + justification to adjust severity.

Severity levels
- error: blocks merge in strict; fail exit code.
- warning: prompts manual review; does not block unless --strict.
- suggestion: educational hint; never blocks.
