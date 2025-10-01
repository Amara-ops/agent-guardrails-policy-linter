GitHub Action: Policy Linter (composite)

Use it in your repo workflows to lint a policy file and produce a JSON report.

Example workflow

name: Policy Lint
on:
  pull_request:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Policy Linter
        uses: yourorg/policy-linter/.github/actions/policy-linter@v0
        with:
          policy: path/to/policy.json
          report: policy.report.json
          strict: 'true'
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: policy-lint-report
          path: policy.report.json

Notes
- This composite action expects the repo to contain the linter source (ts-node dev path). For publishing as a standalone action, we will create a separate repo with a packaged Node action (dist/index.js) and an action.yml at the repo root.
- For now, in-repo usage is supported via uses: ./.github/actions/policy-linter
