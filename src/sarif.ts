export type Finding = { code: string; msg: string; path?: string };

export type LintReport = {
  ok: boolean;
  errors: Finding[];
  warnings: Finding[];
  suggestions: Finding[];
};

function mapLevel(codeGroup: 'error' | 'warning' | 'note') {
  return codeGroup;
}

export function buildSarif(report: LintReport, artifactUri: string) {
  const results: any[] = [];
  const rulesMap: Record<string, any> = {};

  const push = (arr: Finding[], level: 'error' | 'warning' | 'note') => {
    for (const f of arr) {
      if (!rulesMap[f.code]) {
        rulesMap[f.code] = {
          id: f.code,
          shortDescription: { text: f.code },
          defaultConfiguration: { level: mapLevel(level) },
        };
      }
      results.push({
        ruleId: f.code,
        level: mapLevel(level),
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
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'Agent Treasury Policy Linter',
            informationUri:
              'https://github.com/Amara-ops/agent-guardrails-policy-linter',
            rules: Object.values(rulesMap),
          },
        },
        results,
      },
    ],
  };
}
