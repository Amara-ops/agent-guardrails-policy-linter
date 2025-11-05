Guardrail Cookbook (v0.3.5)

Purpose
Concrete, copy‑pasteable patterns for agent‑treasury policies. Each recipe shows rationale, a JSON snippet, and what the linter enforces.

Conventions
- Denominations: use token symbols (e.g., USDC). Decimals come from a token registry JSON loaded by the runtime; the linter validates symbols against that registry.
- Allowlist triple: [chainId, contract (to), 4‑byte selector]. Use lowercase hex for addresses and selectors.
- Severity: error (blocks), warning (review), suggestion (educational).

Recipes

1) Basic spend with transfer allowlist (Base USDC)
Rationale: Transfers only; explicit chain scope; caps conservative.
Snippet:
{
  "allowlist": [ { "chainId": 8453, "to": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", "selector": "0xa9059cbb" } ],
  "caps": { "max_outflow_h1": { "USDC": "50" }, "max_outflow_d1": { "USDC": "200" } },
  "pause": false,
  "meta": { "tokens_registry_path": "config/tokens.json" }
}
Linter: checks schema, selector format, d1 ≥ h1, symbol keys exist in registry.

2) Swaps with scoped router calls
Rationale: Permit swap on a single router only; forbid arbitrary execute() calls.
Snippet (exactInputSingle 0x04e45aaf):
{
  "allowlist": [ { "chainId": 8453, "to": "0xe592427a0aece92de3edee1f18e0157c05861564", "selector": "0x04e45aaf" } ],
  "caps": { "max_outflow_h1": { "USDC": "100" }, "max_outflow_d1": { "USDC": "300" } }
}
Linter: warns if router allowlist includes generic multicall/execute selectors (future rule).

3) Approvals with tight caps and review
Rationale: Unlimited approvals are risky; cap outflows and review changes.
Snippet:
{
  "caps": { "max_outflow_h1": { "USDC": "25" }, "max_outflow_d1": { "USDC": "100" } },
  "meta": { "nonce_max_gap": 1 }
}
Linter: warns on missing outflow caps; validates nonce_max_gap.

4) Escalation path for high‑value changes
Rationale: Increase governance burden for high caps.
Snippet:
{
  "caps": { "max_outflow_h1": { "USDC": "500" }, "max_outflow_d1": { "USDC": "2000" } }
}
Linter: suggestion if high caps without additional process controls (future enhancement).

5) Per‑target function caps
Rationale: Tighten specific transfer paths.
Snippet:
{
  "caps": {
    "per_target": {
      "h1": { "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913|0xa9059cbb": { "USDC": "200" } },
      "d1": { "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": { "USDC": "1000" } }
    }
  }
}
Linter: validates target key formats and per‑denomination numeric strings.

Migration notes
- Replace BASE_USDC with USDC in caps.
- Remove meta.denominations; use config/tokens.json (or set meta.tokens_registry_path).
- The runtime will scope counters per chainId internally.
