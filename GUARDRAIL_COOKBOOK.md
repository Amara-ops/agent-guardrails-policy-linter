Guardrail Cookbook (v0.1)

Purpose
Concrete, copy‑pasteable patterns for agent‑treasury policies using the linter. Each recipe shows rationale, a JSON snippet, and what the linter enforces.

Conventions
- denomination: declare units explicitly (e.g., BASE_USDC, ETH). Keep consistent across caps.
- allowlist triple: [chainId, contract, 4‑byte selector]
- severity: error (blocks), warning (review), suggestion (educational)

Recipes

1) Basic spend with transfer allowlist (Base USDC)
Rationale: Transfers only; explicit chain scope; caps conservative.
Snippet:
{
  "meta": { "denomination": "BASE_USDC", "logging": true },
  "caps": { "max_outflow_h1": 50, "max_outflow_d1": 200, "call_rate_cap": "60/hour" },
  "calls": { "allowlist": [ [8453, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "0xa9059cbb"] ] },
  "approvals": { "quorum": 2, "timelock_hours": 12 },
  "controls": { "pause": { "enabled": true } }
}
Linter: checks schema, selector format, d1 ≥ h1, allowlist not empty, quorum ≥ 2, timelock ≥ 0, logging/pause enabled.

2) Swaps with scoped router calls
Rationale: Permit swap on a single router only; forbid arbitrary execute() calls.
Snippet (selectors example: exactInputSingle 0x04e45aaf):
{
  "calls": { "allowlist": [ [8453, "0xE592427A0AEce92De3Edee1F18E0157C05861564", "0x04e45aaf"] ] },
  "caps": { "max_outflow_h1": 100, "max_outflow_d1": 300 }
}
Linter: warns if router allowlist includes generic multicall/execute selectors.

3) Approvals with tight caps and review
Rationale: Unlimited approvals are risky; cap outflows and require quorum for approval changes.
Snippet:
{
  "approvals": { "quorum": 2, "timelock_hours": 24 },
  "caps": { "max_outflow_h1": 25, "max_outflow_d1": 100 }
}
Linter: warns on patterns consistent with unlimited approvals; blocks missing quorum in strict mode.

4) Escalation path for high‑value changes
Rationale: Increase quorum and timelock when caps exceed threshold.
Snippet:
{
  "caps": { "max_outflow_h1": 500, "max_outflow_d1": 2000 },
  "approvals": { "quorum": 3, "timelock_hours": 48 }
}
Linter: emits suggestion if high caps with minimal quorum/timelock; strict can elevate.

5) Per‑function rate caps (planned)
Rationale: Different functions need different rates.
Snippet:
{
  "caps": { "call_rate_cap": "60/hour", "per_function": { "0xa9059cbb": "120/hour" } }
}
Linter: will validate per‑function overrides; fallback to global if not set.

6) Anomaly block (planned)
Rationale: Pause on detected anomalies.
Snippet:
{
  "caps": { "anomaly_block": { "enabled": true } }
}
Linter: ensures feature flag shape is valid; heuristics tuned to avoid over‑triggering.

7) Multi‑chain denomination safety (planned)
Rationale: Prevent unit mistakes across chains/tokens.
Snippet:
{
  "meta": { "denomination": { "8453": "BASE_USDC", "1": "ETH" } }
}
Linter: validate caps vs units; warn on mixed units unless intentional.

8) Suppressions (planned)
Rationale: Allow justified exceptions without disabling the linter.
Snippet:
{
  "suppress": [ { "rule": "ALLOWLIST_EMPTY", "justification": "Dry-run env only" } ]
}
Linter: recognizes suppression entries and lowers severity.

Notes
- Recipes 5–8 are forward‑looking; current CLI will ignore unknown keys unless schema is extended. Use them in docs and proposals; adopt in policy once supported.
