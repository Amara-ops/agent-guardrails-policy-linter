Samples updated for symbol-based denominations (v0.3.5)

- All caps now use token symbols (e.g., USDC) instead of chain-prefixed names (e.g., BASE_USDC).
- meta.denominations is removed; decimals and token validation are read from a token registry JSON.
- Each sample sets meta.tokens_registry_path to config/tokens.json for local development.

Files:
- policy.good.json
- policy.approval.json
- policy.escalation.json
- policy.full.json
- policy.swap.json
