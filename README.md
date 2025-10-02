Policy Linter — v0

[![Policy Lint](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml)
[![Composite Action CI](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml)

Purpose
- Validate agent-treasury policy JSON against schema + safety rules (caps, allowlists, timelocks, quorum, logging).
- Output machine-readable report with errors/warnings/suggestions. OSS, MIT.

Scope v0
- Input: policy.json (keys: meta, caps, calls, approvals, controls).
- Checks:
  1) Schema validation (2020-12 JSON Schema in schema.json).
  2) Rules: units consistent with meta.denomination; caps relations; call-rate format; allowlist triples; quorum>=2; timelock>=0; pause/logging enabled.
- Output: exit code (0=pass, 1=fail), report.json detailing findings.

CLI
- Build: npm run build; then node dist/cli.js policy.json --report report.json
- Dev: node --loader ts-node/esm src/cli.ts policy.json --report report.json
- Flags: --report out.json, --strict (treat warnings as errors), --no-color.

Usage examples
- node dist/cli.js samples/policy.good.json --report report.good.json
- node dist/cli.js samples/policy.bad.json --strict --report report.bad.json

GitHub Actions usage

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

Notes
- The composite action builds the CLI first, then runs node dist/cli.js.
- For negative examples (bad policy with --strict), set continue-on-error: true in your workflow step and still upload artifacts.

Reports (generated)
- report.good.json
- report.bad.json

CI example files
- .github/workflows/policy-lint.yml
- .github/workflows/policy-linter-action.yml

Roadmap
- v0 complete: TS CLI + schema (2020-12 Ajv) + rules + Jest tests + sample reports + CI example + composite Action.
- v0.1: Standalone GitHub Action repo (root action.yml) + badge; per-target rate caps; anomaly heuristics tune-up.
- v0.2: Minimal web UI; multi-chain denominations; SARIF export.

License: MIT
