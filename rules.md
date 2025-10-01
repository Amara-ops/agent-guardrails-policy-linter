Policy Linter — Rules (v0)

Hard errors
- DENOMINATION_MISSING/INVALID: meta.denomination not in {BASE_USDC, ETH}.
- LOGGING_DISABLED: meta.logging != true.
- CAPS_ZERO_OR_NEG: caps.max_outflow_h1/d1 <= 0.
- CAPS_H1_GT_D1: caps.max_outflow_h1 > caps.max_outflow_d1.
- RATE_CAP_FORMAT: caps.call_rate_cap not N/hour.
- ALLOWLIST_EMPTY/BAD_TRIPLE: calls.allowlist missing or not [chainId,int],[addr,0x40],[selector,0x8].
- QUORUM_TOO_LOW: approvals.quorum < 2.

Warnings
- TIMELOCK_MISSING_OR_LOW: approvals.timelock_hours < 24.
- ANOMALY_BLOCK_DISABLED: caps.anomaly_block.enabled != true.
- PAUSE_DISABLED: controls.pause.enabled != true.
- RATE_CAP_HIGH: parsed N > 1000.

Suggestions
- SUGGEST_DENOMINATION: Explicitly set meta.denomination to BASE_USDC if using Base.
- SUGGEST_SELECTOR_REQUIREMENT: Require selector+chainId for high-risk targets first.
- SUGGEST_DIFF: Produce a minimal diff proposal when tightening caps.
