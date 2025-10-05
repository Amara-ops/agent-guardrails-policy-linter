Samples

These are minimal example policies that pair with GUARDRAIL_COOKBOOK.md. Use them to validate the linter and as starting points.

- policy.good.json — Baseline good config
- policy.bad.json — Purposely failing config
- policy.swap.json — Scoped router swap
- policy.approval.json — Tight approvals + caps
- policy.escalation.json — High caps + stronger governance

Notes on sample warnings
- Some samples intentionally emit warnings to educate controls:
  - approval.json, escalation.json: ANOMALY_BLOCK_DISABLED
  - swap.json: ANOMALY_BLOCK_DISABLED, TIMELOCK_MISSING_OR_LOW, INTENT_SLIPPAGE_MISSING_OR_LOOSE
- Behavior: OK (non-strict) still passes; --strict will fail on warnings.
- Make them “clean” by setting caps.anomaly_block.enabled=true, approvals.timelock_hours>=24, and intent_filters with reasonable bounds (e.g., max_slippage_bps<=1000, max_price_dev_bps=200).
