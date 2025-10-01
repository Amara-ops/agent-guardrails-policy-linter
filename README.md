Policy Linter — v0

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

Reports (generated)
- report.good.json
- report.bad.json

CI example (GitHub Actions)
- .github/workflows/policy-lint.yml runs the linter and uploads reports.

Roadmap
- v0 complete: TS CLI + schema (2020-12 Ajv) + rules + Jest tests + samples + GitHub Action.
- v0.1: GitHub Action wrapper + badge, per-target rate caps, anomaly heuristics, docs polish.
- v0.2: Minimal web UI + paste policy → get report; multi-chain denominations; export SARIF.

License: MIT
