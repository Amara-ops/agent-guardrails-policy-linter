## Agent Treasury Policy Linter — v0.2 (WIP)

[![Policy Lint](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-lint.yml)
[![Composite Action CI](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml/badge.svg)](https://github.com/Amara-ops/agent-guardrails-policy-linter/actions/workflows/policy-linter-action.yml)

A TypeScript CLI + GitHub Action that validates agent-treasury policy JSON against a schema and safety rules (caps, selector+chainId allowlists, timelock, quorum, pause, logging). Outputs machine-readable actionable JSON reports with errors/warnings/suggestions to help teams tighten policy before deployment.

## Runtime enforcement (companion project)
Use the Policy Runtime Engine at execution time to enforce allow/deny decisions and log usage. The linter helps you ship a safe policy; the runtime enforces it during operations.
- Policy Runtime TS: https://github.com/Amara-ops/policy-runtime-ts
- Policy Linter Action (standalone, Marketplace-friendly): https://github.com/Amara-ops/policy-linter-action

## Problem
Teams ship agent treasuries with missing/weak guardrails. Misconfigurations (no selector allowlists, high spend caps, no timelock) increase exploit and runaway-spend risk.

## Solution
OSS linter that enforces a pragmatic baseline. Includes JSON Schema (2020-12), custom rules, samples, Jest tests, and a CI Action. Reduces policy risk for agent projects; aligns with programmable wallet policies. Encourages selector+chainId allowlists and sane caps.

## What’s new (v0.2 WIP)
- Web UI (client-only) for quick checks: paste JSON → report (GitHub Pages). No data leaves your browser.
- SARIF export (v0.1) documented with Code Scanning workflow and --artifact explainer.
- Optional action inputs: sarif and artifact (composite + standalone actions) without breaking defaults.
- Planned (deferred to v0.3): multi-chain denominations/units validation.

## Web UI
- Open docs/index.html on GitHub Pages for this repo. It uses the same schema (schema.json) for structural checks.
- Note: The web UI approximates CLI output; use the CLI/Action in CI for production gating.

## Scope v0
- Input: policy.json (keys: meta, caps, calls, approvals, controls).
- Checks:
  1) Schema validation (2020-12 JSON Schema in schema.json).
  2) Rules: units consistent with meta.denomination; caps relations; call-rate format; allowlist triples; quorum>=2; timelock>=0; pause/logging enabled.
- Output: exit code (0=pass, 1=fail), report.json detailing findings.

## CLI
- Build: npm run build; then node dist/cli.js policy.json --report report.json
- Dev: node --loader ts-node/esm src/cli.ts policy.json --report report.json
- Flags: --report out.json, --sarif out.sarif, --artifact policy.json, --strict, --no-color.

## Usage examples
- node dist/cli.js samples/policy.good.json --report report.good.json
- node dist/cli.js samples/policy.bad.json --strict --report report.bad.json
- node dist/cli.js samples/policy.full.preview.json --report report.full.json --sarif report.full.sarif --artifact samples/policy.full.preview.json

## SARIF export and the --artifact flag (explainer)
- SARIF is the format GitHub Code Scanning uses to show alerts.
- We attach findings to a file path (artifactLocation.uri). By default this is the input policy path you pass to the CLI.
- Use --artifact only when you need to override that path. Examples:
  - You linted a temp copy (/tmp/policy.json) but want alerts to appear on policies/agent/policy.json in the repo:
    node dist/cli.js /tmp/policy.json --sarif policy.sarif --artifact policies/agent/policy.json
  - You want a clean repo-relative path even if your working dir differs:
    node dist/cli.js ./policies/agent/policy.json --sarif policy.sarif --artifact policies/agent/policy.json
- Best practice: use a repo-relative path for --artifact so GitHub anchors alerts to the correct file.

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

GitHub Code Scanning upload example
```yaml
- name: Lint policy and produce SARIF
  run: |
    node dist/cli.js policy.json --report policy.report.json \
      --sarif policy.sarif --artifact policy.json
- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: policy.sarif
```

## Roadmap
- v0 complete: TS CLI + schema (2020-12 Ajv) + rules + Jest tests + sample reports + CI example + composite Action.
- v0.1: Educational warnings; optional fields (denylist, policy-edit timelock, intent filters, per-function/per-target caps); SARIF export + docs.
- v0.2: Minimal web UI (client-only, GH Pages); polish docs; keep backward compatibility.
- v0.3: Multi-chain denominations/units validation; minimal runtime adapters.

License: MIT
