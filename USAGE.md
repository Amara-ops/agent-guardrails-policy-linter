Usage examples (v0)

Run linter on sample good policy and write report:

node dist/cli.js samples/policy.good.json --report report.good.json

Run linter on bad policy with strict mode (warnings become errors):

node dist/cli.js samples/policy.bad.json --strict --report report.bad.json

Exit codes:
- 0: pass (no errors; warnings allowed unless --strict)
- 1: fail (errors present or warnings present with --strict)
- 2: CLI usage error
