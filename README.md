## Agent Treasury Policy Linter — v0.3.x (aligned with Policy Runtime v0.3.1)

[![Policy Lint](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml)
[![Composite Action CI](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml)

TypeScript CLI + GitHub Action to validate agent-treasury policy JSON. This version matches the Policy Runtime v0.3.x schema and rule semantics.

Highlights
- Aligns with runtime v0.3.x: denominations, per-denomination caps, per-target caps, nonce gap, slippage bps, pause boolean.
- Lowercase 0x addresses/selectors enforced.
- Machine-readable JSON and SARIF outputs for CI/Code Scanning.

What changed (breaking from pre-v0.2)
- Schema keys are now:
  - allowlist: [{ chainId, to, selector }] (objects, not triples)
  - caps: { max_outflow_h1, max_outflow_d1, max_per_function_h1?, per_target? }
    - CapAmount values are strings of integer units or per-denom maps { DENOM: "amount" }
    - per_target.{h1|d1} keys: "0x40" or "0x40|0x8" (address or address|selector)
  - pause: boolean
  - meta: { schemaVersion?, denominations?, defaultDenomination?, nonce_max_gap?, slippage_max_bps? }
- Removed legacy: meta.logging, meta.denomination, calls.*, approvals.*, controls.*

Minimal valid policy (example)
{
  "allowlist": [
    { "chainId": 8453, "to": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", "selector": "0xa9059cbb" }
  ],
  "caps": {
    "max_outflow_h1": { "BASE_USDC": "5000000" },
    "max_outflow_d1": { "BASE_USDC": "20000000" },
    "max_per_function_h1": 10
  },
  "pause": false,
  "meta": {
    "schemaVersion": "v0.3",
    "denominations": {
      "BASE_USDC": { "decimals": 6, "chainId": 8453, "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" }
    },
    "defaultDenomination": "BASE_USDC",
    "nonce_max_gap": 1,
    "slippage_max_bps": 50
  }
}

CLI
- Build: npm run build
- Usage: node dist/cli.js path/to/policy.json --report report.json [--sarif report.sarif] [--artifact repo/relative/policy.json]
- Flags: --report out.json, --sarif out.sarif, --artifact path, --strict, --no-color

Samples (v0.3.x)
- samples/policy.good.json — passes schema+rules
- samples/policy.bad.json — fails schema
- samples/policy.full.preview.json — broader config with per-target caps
- samples/policy.swap.json — includes a swap selector and per-target cap
- samples/policy.approval.json, policy.escalation.json — different cap levels (no legacy approvals)

Web UI
- docs/index.html uses schema.json for structural checks; paste JSON → see findings (client-only). For gating, use CLI/Action in CI.

GitHub Actions
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
          policy: samples/policy.good.json
          report: report.good.json
          strict: 'false'
```

Migration tips
- Convert allowlist triples → object entries with lowercase hex.
- Drop legacy keys (calls/approvals/controls/meta.logging/meta.denomination).
- Add meta.denominations and defaultDenomination; define BASE_USDC with decimals=6 and chainId=8453 if on Base.
- Use per-denomination string amounts for caps (e.g., { "BASE_USDC": "5000000" }).

License: MIT
