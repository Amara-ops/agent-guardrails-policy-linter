import fs from 'node:fs';

export type TokenEntry = {
  symbol: string;
  chain_id: number;
  chain_name?: string;
  address?: string | null;
  decimals: number;
  native?: boolean;
};

export function loadRegistrySymbols(registryPath?: string): Set<string> {
  const path = registryPath || process.env.TOKENS_CONFIG_PATH || 'config/tokens.json';
  try {
    const raw = fs.readFileSync(path, 'utf-8');
    const arr = JSON.parse(raw) as TokenEntry[];
    const syms = new Set<string>();
    for (const t of arr) {
      if (t && typeof t.symbol === 'string' && t.symbol.trim().length > 0) {
        syms.add(t.symbol.trim().toUpperCase());
      }
    }
    return syms;
  } catch {
    return new Set<string>();
  }
}
