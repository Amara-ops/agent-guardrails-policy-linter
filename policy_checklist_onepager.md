# Agent-run Treasury Safety Checklist (Minimal Controls)

Purpose
- Ship fast without dumb losses. Policy-before-execution. Clear, testable rules that constrain blast radius.

Core controls (enable all by default)
1) Spend cap (with explicit units)
- Define denomination and units up front.
  - Option A: denomination = "asset" (caps are in native units per asset/class, e.g., 0.10 ETH, 250 USDC)
  - Option B: denomination = "usd" (caps are USD-equivalent; requires price oracle checks)
- Example (asset-denominated): 1h caps → volatile: 0.10 ETH, stable: 250 USDC; 24h caps → volatile: 0.40 ETH, stable: 1000 USDC
- Separate caps by asset class (stable, volatile, LP), and by destination type if needed.

2) Recipient/protocol allowlist
- Explicit list of:
  - Contracts (by chainId+address) and methods (function selectors)
  - EOAs/treasuries (with per-address caps)
- Denylist takes precedence; default-deny unknowns.

3) Risk quorum
- For high-risk ops (bridges, LP adds, leverage, policy edits):
  - Human reviewer + oracle checks (e.g., price feed validity, chain status)
  - Quorum != 1. Define fallback/timeout behavior (reject by default).

4) Timelock on policy changes
- Example: 12–24h delay with public diff before activation.
- Emergency path requires broader quorum and is rate-limited.

5) Semantic diff on policy edits
- Compare before/after policy; block activation if critical keys changed without matching review notes.
- Critical keys: caps, allowlists, timelock, quorum thresholds, chainId, token lists.

6) Intent filters
- Validate transaction intent:
  - chainId matches
  - token(s) in approved list
  - function selector matches allowlist
  - amount within cap and reasonable price bounds

7) Rate limits
- Per-target (address/contract) and per-category (DEX, bridge, NFT) call limits per window.

8) Anomaly guard
- Block if spend today > rolling 7d avg × K (e.g., ×2), or if price feeds disagree > X%.

9) Audit log
- Append-only log with timestamp, tx hash, normalized intent, diff hash; periodic hash-chain anchor onchain/IPFS.

10) Break-glass
- Manual pause for categories; explicit conditions to unpause; keep-alive heartbeat.

Quick-start runbook
- Pick denomination (asset or usd) and declare units.
- Define caps (1h/24h) per class with units (e.g., ETH, USDC).
- Build allowlist (contracts + selectors) for 3 core flows you already use.
- Set high-risk quorum and timelock (e.g., 2-of-3 human/oracle mix; 24h).
- Turn on semantic diff on policy edits.
- Ship with logging ON and emergency pause wired.

Minimal policy skeleton (JSON)
```JSON
{
  "meta": { "version": 1, "chainId": 8453, "owner": "0x...", "denomination": "asset", "cap_units": { "stable": "USDC", "volatile": "ETH" } },
  "windows": { "h1": 3600, "d1": 86400 },
  "caps": {
    "h1": { "stable": "250", "volatile": "0.10" },
    "d1": { "stable": "1000", "volatile": "0.40" }
  },
  "assets": { "stable": ["USDC"], "volatile": ["ETH"] },
  "allow": [
    { "type": "contract", "chainId": 8453, "address": "0xDEX...", "func": ["swapExactTokensForTokens(uint256,uint256,address[],address,uint256)"] },
    { "type": "eoa", "address": "0xTREASURY...", "cap_d1": "0.10" }
  ],
  "deny": [ { "address": "0xSCAM..." } ],
  "risk": {
    "high": ["bridge", "leverage", "policy_edit"],
    "quorum": { "approvers": ["human:alice", "oracle:price", "human:bob"], "min": 2 }
  },
  "timelock_policy_edit_s": 86400,
  "intent_filters": { "max_slippage_bps": 100, "max_price_dev_bps": 200 },
  "rate_limits": { "per_target_d1": 5, "per_category_d1": { "dex": 20, "bridge": 4 } },
  "anomaly": { "spend_multiplier": 2.0, "oracle_disagreement_bps": 100 },
  "logging": { "enabled": true, "anchor": "hashchain" },
  "break_glass": { "pause": ["bridge", "dex"], "heartbeat_s": 600 }
}
```

Failure modes this mitigates
- Instant policy rug → timelock + quorum + diff
- Drifted intent drains → allowlist + caps + selectors + slippage bounds
- Oracle poison → quorum + disagreement guard
- Silent edits → semantic diff + public delay
- Runaway loops → rate limits + anomaly guard

How to use
- Copy the skeleton and adapt caps/allowlists.
- Share policy diffs in PRs; require approvals that match the defined quorum.
- Log every tx + review event; anchor hash daily.

Ethics & disclosures
- This checklist is guidance, not guarantees. You are responsible for your keys, funds, and compliance.
- License: CC0. Reuse freely.

Tips welcome (Base)
- 0xCce2B65F1Da4585953548e9B072BEb6aa5bFd6e2
