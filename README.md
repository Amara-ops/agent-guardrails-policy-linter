## Agent Treasury Policy Linter — v0.3.3 (aligned with Policy Runtime v0.3.3)

[![Policy Lint](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml)
[![Composite Action CI](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml)

TypeScript CLI + GitHub Action to validate agent-treasury policy JSON. This version matches the Policy Runtime v0.3.3 schema and rule semantics.

## Highlights
- Aligns with runtime v0.3.x: denominations, per-denomination caps, per-target caps, nonce gap, slippage bps, pause boolean.
- Lowercase 0x addresses/selectors enforced.
- Human caps: per-denomination maps may use human-readable numeric strings (e.g., "100" for $100 USDC). Top-level cap strings remain base-units for backward compatibility.
- Machine-readable JSON and SARIF outputs for CI/Code Scanning.

## Minimal valid policy (example, human caps)
```json
{
  "allowlist": [
    { "chainId": 8453, "to": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", "selector": "0xa9059cbb" }
  ],
  "caps": {
    "max_outflow_h1": { "BASE_USDC": "100" },
    "max_outflow_d1": { "BASE_USDC": "500" },
    "max_per_function_h1": 60
  },
  "pause": false,
  "meta": {
    "schemaVersion": "v0.3.3",
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
- Usage: node dist/cli.js path/to/policy.json --report report.json [--sarif report.sarif] [--artifact repo/relative/policy.json]
- Flags: --report out.json, --sarif out.sarif, --artifact path, --strict, --no-color

## Samples (v0.3.3)
- samples/policy.good.json — base-units per-denomination map (legacy numeric strings)
- samples/policy.full.preview.json — broader config with per-target caps (base-units)
- samples/policy.human.good.json — human caps using per-denomination maps (e.g., "100" for $100 USDC)
- samples/policy.human.full.json — human caps with per-target cap examples
- samples/policy.swap.json — includes a swap selector and per-target cap
- samples/policy.approval.json, policy.escalation.json — example variants

## Web UI
- docs/index.html uses schema.json for structural checks; paste JSON → see findings (client-only). For gating, use CLI/Action in CI.

## GitHub Actions
- Composite action: .github/actions/policy-linter (see workflows examples in README below)
- Example:
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/policy-linter
        with:
          policy: samples/policy.human.good.json
          report: report.json
          strict: 'false'
```

## Migration tips
- Convert allowlist triples → object entries with lowercase hex.
- Drop legacy keys (calls/approvals/controls/meta.logging/meta.denomination).
- Add meta.denominations and defaultDenomination; define BASE_USDC with decimals=6 and chainId=8453 if on Base.
- Prefer human caps in per-denomination maps for readability; the runtime will normalize them to base units on load.

License: MIT
