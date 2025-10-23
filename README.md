## Agent Treasury Policy Linter — v0.3.4

[![Policy Lint](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml)
[![Composite Action CI](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml)

Human-friendly CLI + GitHub Action to validate agent-treasury policy JSON. This version matches the Policy Runtime v0.3.4 schema and rule semantics.

## What it checks (in plain words)
- Structure: allowlist entries have chainId, contract (to), and function selector; addresses/selectors must be lowercase hex.
- Caps:
  - Monetary caps should be written as per-denomination human strings (e.g., { "BASE_USDC": "100" }).
  - Per-target caps allow either contract-only keys or contract|selector keys.
  - Call caps per function selector: max_calls_per_function_h1 and max_calls_per_function_d1 (alias supported: max_per_function_h1 → max_calls_per_function_h1).
- Meta: denominations registry for decimals; defaultDenomination; optional slippage and nonce-gap limits.
- Guidance: warnings suggest clearer/safer patterns.

## Minimal valid policy (human caps)
```json
{
  "allowlist": [
    { "chainId": 8453, "to": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", "selector": "0xa9059cbb" }
  ],
  "caps": {
    "max_outflow_h1": { "BASE_USDC": "100" },
    "max_outflow_d1": { "BASE_USDC": "500" },
    "max_calls_per_function_h1": 60,
    "max_calls_per_function_d1": 600,
    "per_target": {
      "h1": {
        "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913|0xa9059cbb": { "BASE_USDC": "50" }
      },
      "d1": {
        "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": { "BASE_USDC": "200" }
      }
    }
  },
  "pause": false,
  "meta": {
    "schemaVersion": "v0.3.4",
    "denominations": {
      "BASE_USDC": { "decimals": 6, "chainId": 8453, "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" }
    },
    "defaultDenomination": "BASE_USDC",
    "nonce_max_gap": 1,
    "slippage_max_bps": 50
  }
}
```

## CLI
- Build: npm run build
- Lint a policy: node dist/cli.js path/to/policy.json --report report.json [--sarif report.sarif] [--artifact repo/relative/policy.json]
- Flags: --report out.json, --sarif out.sarif, --artifact path, --strict, --no-color

## What the findings mean
- errors: blocks merge; schema violations or unsafe values
- warnings: non-blocking; clarity or safety suggestions
- suggestions: optional improvements

## Samples (v0.3.4)
- samples/policy.good.json — human caps with per-target example and call caps
- samples/policy.full.json — broader config including daily call cap
- samples/policy.approval.json — moderate caps
- samples/policy.escalation.json — larger caps
- samples/policy.swap.json — swap + per-target example
- samples/policy.bad.json — intentionally invalid for demonstration

## Tips
- Prefer per-denomination maps when writing monetary caps; the runtime converts human strings to base units using decimals.
- Use contract|selector keys for function-specific per-target caps; contract-only keys aggregate across all functions.
- Keep addresses and selectors lowercase.

## Web UI
- docs/index.html provides quick structural validation. For gating, use the CLI or composite action in CI.

License: MIT
