# NARO product polish — 20 October 2026

Intent: a participant opens NARO in an EVM wallet browser to connect, activate, claim, inspect their community and confirm transactions. The interface should feel like a compact onchain workspace.

Domain: wallet identity, claim windows, inviter links, receipts, block confirmations, funded reward pool.
Color world: charcoal canvas, mint phosphor, dark green glass, silver metal edges, warm gas/network status.
Signature: a beveled extruded version of NARO's square O, suspended above orbital rails. It is decorative, never a metric or a substitute for chain state.
Avoided defaults: unrelated coin models, purple particle fields, and oversized disclaimer/deployment cards on every route.

Hierarchy: a single full-width claim/connect hero leads Overview; three compact metrics follow. Connected views show actual contract state; disconnected values stay unavailable. Deployment tools live under Account, not in the primary participant flow.
Palette/depth: preserve shared mint/dark tokens; surface shifts and subtle edges. Metallic depth is concentrated in the branded 3D object.
Typography: existing Noto Sans and Chakra numeric faces; 4px spacing base, 24–32px desktop padding, 20px mobile padding.
Motion: 200–280ms entries, 120ms press feedback, slow decorative motion capped at 30fps. Pause control, reduced-motion still frame, offscreen/hidden-tab suspension, resource cleanup and an SVG fallback are required.
Copy: remove review/sample controls and repeated learning-demo banners from the product. Keep BNB Testnet in network chrome and dNARO as the token's actual symbol. Keep irreversible inviter binding and gas estimates in transaction review, where they affect the decision.

Architecture remains the same two immutable contracts; no Solidity or economics changes. No fabricated public deployment or wallet balance. Vercel and public RPC remain the main access compromises; source, ABIs and direct contract calls remain available for self-hosting.

## Product experience update — 20 October 2026

The public app now uses the live-wallet flow only. Sample fixtures and the original static prototype remain in source for reference, but the app no longer exposes data-view controls, repeated demo banners or local-network links. BNB Testnet remains visible in network chrome; the actual token symbol remains dNARO.

A procedural Three.js version of the square O adds beveled mint surfaces and orbital motion. UI controls have press feedback and entrance transitions. A pause control, reduced-motion still frame, hidden/offscreen suspension, SVG fallback and context-loss restoration are included. Three.js is lazy loaded as a separate approximately 141 KB gzip chunk; the pre-existing CJK font remains the larger production asset.

The participant actions retain contract simulation, explicit request chain binding, gas review, wallet confirmation, transaction locks and mined receipt handling. Network setup is under Account. The shared BNB testnet contracts are still not deployed; public balances remain unavailable rather than fabricated.

Current checks: 23 automated frontend/controller tests, production build, 81 shared token matches and 36 token contrast checks passed. Browser checks cover all five routes at actual viewport widths 320, 390 and 1280 in English and Chinese (30 checks); no document overflow or legacy demo instructions were found. WebGL context loss switched to the SVG fallback, restoration recovered the canvas, simulated no-WebGL mode retained the connect flow, and reduced-motion canvas screenshots remained identical. The reduced-motion harness overrides the JavaScript media query; its CSS rule was inspected separately, not emulated by an OS preference change.

The polished interface also submitted a real local claim: `0xf029740d7d4305f94def13abc90b27fba3cfcabb0ff3c79ae129dd50e9f51456`, block 5654, chain 31337. It updated Participant A from 20 to 30 dNARO, reduced the pool to 999,970 and disabled the next claim during cooldown. This is not a public BNB receipt.

A separate reviewer found and helped resolve funding-link placement, context-restoration and hidden-password escape-sequence handling issues. The wallet key remains encrypted with Windows DPAPI in ignored local storage. Creation was verified to reuse the existing wallet; the export script passed syntax review and its keypress-filter check. An encrypted JSON export was not generated because its password must be chosen by the user. See `naro-test-wallet.md` for import and funding steps.
