export function buildSarif(report, artifactUri) {
  const results = [];
  const rulesMap = {};
  const push = (arr, level) => {
    for (const f of arr) {
      if (!rulesMap[f.code]) {
        rulesMap[f.code] = {
          id: f.code,
          shortDescription: { text: f.code },
          defaultConfiguration: { level },
        };
      }
      results.push({
        ruleId: f.code,
        level,
        message: { text: f.msg },
        properties: f.path ? { path: f.path } : undefined,
        locations: artifactUri
          ? [
              {
                physicalLocation: {
                  artifactLocation: { uri: artifactUri },
                },
              },
            ]
          : undefined,
      });
    }
  };
  push(report.errors, 'error');
  push(report.warnings, 'warning');
  push(report.suggestions, 'note');
  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'Agent Treasury Policy Linter',
            informationUri: 'https://github.com/Amara-ops/agent-guardrails-policy-linter',
            rules: Object.values(rulesMap),
          },
        },
        results,
      },
    ],
  };
}
