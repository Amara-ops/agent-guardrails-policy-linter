Samples for Policy Linter v0.3.3 (aligned with Policy Runtime v0.3.3)

- policy.good.json — base-units per-denomination map (legacy numeric strings)
- policy.full.preview.json — broader config with per-target caps (base-units)
- policy.human.good.json — human caps using per-denomination maps (e.g., "100" for $100 USDC)
- policy.human.full.json — human caps with per-target caps examples
- policy.approval.json, policy.escalation.json — example variants
- policy.swap.json — includes a swap selector and per-target cap

Notes
- Human caps are allowed only in per-denomination maps; top-level cap strings remain base-units for backward compatibility.
- Ensure meta.denominations provides decimals for every denomination you use in caps.
