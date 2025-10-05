# Agent Treasury Policy Linter — v0.1 WIP

[![Policy Lint](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml)
[![Composite Action CI](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml)

A TypeScript CLI + GitHub Action that validates agent-treasury policy JSON against a schema and safety rules (caps, selector+chainId allowlists, timelock, quorum, pause, logging). Outputs machine-readable actionable JSON reports with errors/warnings/suggestions to help teams tighten policy before deployment.

## Problem
Teams ship agent treasuries with missing/weak guardrails. Misconfigurations (no selector allowlists, high spend caps, no timelock) increase exploit and runaway-spend risk.

## Solution
OSS linter that enforces a pragmatic baseline. Includes JSON Schema (2020-12), custom rules, samples, Jest tests, and a CI Action. Reduces policy risk for agent projects; aligns with programmable wallet policies. Encourages selector+chainId allowlists and sane caps.

## What’s new (v0.1 WIP)
- Guardrail Cookbook (recipes + snippets): GUARDRAIL_COOKBOOK.md
- Rules roadmap with new warnings: rules.md (v0.1 additions marked)
- New optional fields supported (warnings-first):
  - calls.denylist
  - approvals.policy_edit_timelock_hours
  - intent_filters.{max_slippage_bps,max_price_dev_bps}
  - caps.per_function {selector: "N/hour"}
  - caps.per_target_d1 {address: number}
- Samples: minimal (good/bad/swap/approval/escalation) + full.preview.json (uses optional fields)
- Planned: SARIF export, minimal web UI, multi-chain denominations, anomaly heuristics tune-up

## Scope v0
- Input: policy.json (keys: meta, caps, calls, approvals, controls).
- Checks:
  1) Schema validation (2020-12 JSON Schema in schema.json).
  2) Rules: units consistent with meta.denomination; caps relations; call-rate format; allowlist triples; quorum>=2; timelock>=0; pause/logging enabled.
- Output: exit code (0=pass, 1=fail), report.json detailing findings.

## CLI
- Build: npm run build; then node dist/cli.js policy.json --report report.json
- Dev: node --loader ts-node/esm src/cli.ts policy.json --report report.json
- Flags: --report out.json, --strict (treat warnings as errors), --no-color.

## Usage examples
- node dist/cli.js samples/policy.good.json --report report.good.json
- node dist/cli.js samples/policy.bad.json --strict --report report.bad.json
- node dist/cli.js samples/policy.full.preview.json --report report.full.json

Notes on sample warnings
- Some samples intentionally emit warnings to educate controls:
  - approval.json, escalation.json: ANOMALY_BLOCK_DISABLED
  - swap.json: ANOMALY_BLOCK_DISABLED, TIMELOCK_MISSING_OR_LOW, INTENT_SLIPPAGE_MISSING_OR_LOOSE
- Behavior: OK (non-strict) still passes; --strict will fail on warnings.
- Make them “clean” by setting caps.anomaly_block.enabled=true, approvals.timelock_hours>=24, and intent_filters with reasonable bounds (e.g., max_slippage_bps<=1000, max_price_dev_bps=200).

## GitHub Actions usage

In this repo (composite action):
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

From another repo (reference subdir action):
```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Amara-ops/agent-guardrails-policy-linter/.github/actions/policy-linter@main
        with:
          policy: path/to/policy.json
          report: policy.report.json
          strict: 'true'
```

## Notes
- The composite action builds the CLI first, then runs node dist/cli.js.
- For negative examples (bad policy with --strict), set continue-on-error: true in your workflow step and still upload artifacts.

## Reports (generated)
- report.good.json
- report.bad.json
- report.full.json

## CI example files
- .github/workflows/policy-lint.yml
- .github/workflows/policy-linter-action.yml

## Roadmap
- v0 complete: TS CLI + schema (2020-12 Ajv) + rules + Jest tests + sample reports + CI example + composite Action.
- v0.1 WIP: Cookbook + rule warnings; optional fields (denylist, policy-edit timelock, intent filters, per-function/per-target caps); Standalone GitHub Action repo (root action.yml + badge), planned SARIF + anomaly heuristics tune-up.
- v0.2: Minimal web UI; multi-chain denominations; SARIF export.

License: MIT
