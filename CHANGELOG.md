# Changelog

## v0.3.4 - 2025-10-24
- Schema: add `max_calls_per_function_h1` (alias for legacy `max_per_function_h1`) and new `max_calls_per_function_d1`; keep legacy key for backward compatibility.
- Validation: improved messages to reference both call-cap keys; stricter checks for `pause` type (boolean), denomination names, and `defaultDenomination` presence.
- Human amounts: validate per‑denomination human cap maps (strings) and decimals precision; clarify that normalization happens in the runtime (the linter validates structure/types).
- Per‑target caps: validate key formats `to` and `to|selector` with selector precedence; better errors for invalid or mixed key forms.
- Guardrails: detect out‑of‑range `slippage_max_bps` and `nonce_max_gap`; improved reporting for `amount` vs `amount_human` mismatches in samples.
- Samples/docs: refreshed `samples/` to use human amounts and current keys; `policy.bad.json` updated to showcase contemporary failures; README clarified.
- Distribution: rebuilt `dist/` outputs; no breaking CLI changes.
