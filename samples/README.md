Samples for Policy Linter v0.3.4 (aligned with Policy Runtime v0.3.4)

- policy.good.json — minimal, human caps with call caps
- policy.full.json — broader config with per-target caps (all human amounts)
- policy.approval.json — moderate caps pattern (human amounts)
- policy.escalation.json — larger caps pattern (human amounts)
- policy.swap.json — includes a swap selector and per-target cap (human amounts)
- policy.bad.json — intentionally invalid values to demonstrate lint finding types

Notes
- Monetary caps use per-denomination human strings (e.g., { "BASE_USDC": "100" }). The runtime converts to base units using decimals.
- Keep addresses/selectors lowercase hex. Use contract|selector keys for function-level per-target caps.
