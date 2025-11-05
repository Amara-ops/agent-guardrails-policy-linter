# Changelog

## v0.3.5 - 2025-11-05
- Denominations: move from chain-prefixed keys (e.g., BASE_USDC) to symbol-only keys (e.g., USDC) in caps.
- Token registry: linter now reads token symbols from a registry JSON. The path can be set via meta.tokens_registry_path or env TOKENS_CONFIG_PATH; default resolves relative to the linter cwd (e.g., config/tokens.json).
- Deprecations: meta.denominations is deprecated; linter warns if present. defaultDenomination checks downgraded to warnings referencing the registry.
- Samples: updated all samples under samples/ to use symbol-based caps and reference config/tokens.json.
- Rules: added validation that per‑denomination keys are symbols present in the registry (warning if unknown); kept existing structural and safety checks.
- Docs: README updated for v0.3.5; clarified registry path resolution and per‑chain scoping handled by the runtime.

## v0.3.4 - 2025-10-24
- Schema: add `max_calls_per_function_h1` (alias for legacy `max_per_function_h1`) and new `max_calls_per_function_d1`; keep legacy key for backward compatibility.
- Validation: improved messages to reference both call-cap keys; stricter checks for `pause` type (boolean), denomination names, and `defaultDenomination` presence.
- Human amounts: validate per‑denomination human cap maps (strings) and decimals precision; clarify that normalization happens in the runtime (the linter validates structure/types).
- Per‑target caps: validate key formats `to` and `to|selector` with selector precedence; better errors for invalid or mixed key forms.
- Guardrails: detect out‑of‑range `slippage_max_bps` and `nonce_max_gap`; improved reporting for `amount` vs `amount_human` mismatches in samples.
- Samples/docs: refreshed `samples/` to use human amounts and current keys; `policy.bad.json` updated to showcase contemporary failures; README clarified.
- Distribution: rebuilt `dist/` outputs; no breaking CLI changes.
