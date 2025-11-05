## Agent Treasury Policy Linter — v0.3.5

[![Policy Lint](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml)
[![Composite Action CI](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml)

Human-friendly CLI + GitHub Action to validate agent-treasury policy JSON. v0.3.5 switches to symbol-based denominations (USDC), with decimals coming from a token registry JSON.

## What’s new in v0.3.5
- Use token symbols (e.g., USDC) in caps, not chain-prefixed names (e.g., BASE_USDC).
- meta.denominations is deprecated; use a token registry JSON instead.
- Registry path: meta.tokens_registry_path or env TOKENS_CONFIG_PATH; defaults to config/tokens.json relative to linter cwd.

## What it checks (in plain words)
- Structure: allowlist entries have chainId, contract (to), and function selector; addresses/selectors must be lowercase hex.
- Caps:
  - Monetary caps should be written as per-denomination human strings (e.g., { "BASE_USDC": "100" }).
  - Per-target caps allow either contract-only keys or contract|selector keys.
  - Call caps per function selector: max_calls_per_function_h1 and max_calls_per_function_d1 (alias supported: max_per_function_h1 → max_calls_per_function_h1).
- Meta: denominations registry for decimals; defaultDenomination; optional slippage and nonce-gap limits.
- Guidance: warnings suggest clearer/safer patterns.

## Minimal valid policy (symbol-based)
```json
{
  "allowlist": [
    { "chainId": 8453, "to": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", "selector": "0xa9059cbb" }
  ],
  "caps": {
    "max_outflow_h1": { "USDC": "100" },
    "max_outflow_d1": { "USDC": "500" },
    "max_calls_per_function_h1": 60,
    "max_calls_per_function_d1": 600
  },
  "pause": false,
  "meta": {
    "schemaVersion": "v0.3.5",
    "tokens_registry_path": "config/tokens.json",
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
- warnings: non-blocking; clarity/safety suggestions (e.g., unknown symbols not in registry)
- suggestions: optional improvements

## Samples (v0.3.5)
- samples/policy.good.json — human caps with per-target example and call caps
- samples/policy.full.json — broader config including daily call cap
- samples/policy.approval.json — moderate caps
- samples/policy.escalation.json — larger caps
- samples/policy.swap.json — swap + per-target example
- samples/policy.bad.json — intentionally invalid for demonstration

## Tips
- Keep addresses and selectors lowercase.
- Put your token registry at config/tokens.json in this package, or provide a custom path via meta.tokens_registry_path or TOKENS_CONFIG_PATH.
- The runtime will scope counters per chainId internally; you don’t need chain info in cap keys.

## Web UI
- docs/index.html provides quick structural validation. For gating, use the CLI or composite action in CI.

License: MIT
