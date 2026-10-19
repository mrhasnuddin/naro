# Frontend verification

19 October 2026. Local React frontend created from the approved NARO prototype.

| Check | Result |
| --- | --- |
| TypeScript and production bundle | `npm run build` passes with strict checking, including test sources. Vite emits a standalone static `dist/`. |
| Unit tests | 18 pass: ten provider-controller/discovery cases, seven precision/balance/invitation cases, one full frontend locale-parity case. |
| Design source | 81 token values match generated CSS; 36 specified contrast pairs pass. This is not a complete accessibility certification. |
| Desktop routing | All five destinations render at 1280px without document overflow. |
| Narrow layouts | All five destinations render at 320px in English and draft Chinese without document overflow. The reward table can scroll inside its own container. |
| Visual parity | Desktop and 390px mobile production build retain the approved NARO hierarchy, card styles, select insets, and bottom navigation. |
| Separate wallet view | Switching to My wallet removes sample amounts and addresses; disconnected state gives a real connection action. NARO data remains explicitly unavailable. |
| Official logos | All four locally bundled wallet logos render in the production picker. |
| Modal behavior | Wallet picker opens as a native modal. Escape closes it and returns focus to the wallet trigger. Mobile Chinese picker reviewed at 320px. |
| Invite validation | Empty input is marked invalid, shows the correction, and receives focus. No inviter binding or activation is sent. |
| Production artifacts | Served successfully below `/frontend/dist/` on the existing local server, including CSS, fonts, NARO logo and wallet logos. |
| Final production errors | No captured errors attributed to the built app after final reload, locale switch, and modal dismissal. |

## Verification limits

No real wallet approval, testnet balance response, transaction, contract call, indexer, or external API integration was exercised. Injected-provider behavior is covered by mock tests; real-wallet acceptance needs the user's wallet-enabled browser. Balance fetching, retry, timeout, and stale-response cleanup are implemented; the hook has not been verified against an installed wallet in this environment.

No physical-device, screen-reader, full accessibility, native-language approval, remaining-language, production-hosting, or QR-session testing is claimed. Clipboard access has a manual fallback but was not exercised here.

Review images: `review/desktop-overview.png`, `review/mobile-overview.png`, `review/mobile-wallet.png`.

## Wallet QA follow-up

19 October 2026: 26 browser assertions passed using `tests/wallet-harness.html` against the compiled production app, plus 19 automated unit checks. Covered connection/discovery, positive balance rendering, account changes, wrong-chain suppression, explicit switching, unknown-chain add fallback, rejected/pending requests, disconnect/forget cleanup, balance failure/retry/timeout, stale response protection, and connected mobile/Chinese views.

A live-RPC scenario used the official BNB testnet endpoint for chain ID and native balance reads inside the browser. Account selection was still simulated: the public diagnostic address does not establish control of a wallet, and its returned balance is not faucet funding. Separate read-only RPC diagnostics confirmed chain `0x61`, block-height response, and a valid balance response. Endpoint latencies in the saved smoke test were 651 to 738 ms; these are measurements from this run, not an availability guarantee.

One defect was found and fixed: declining an Account-page network switch previously had no visible feedback outside the wallet modal. Account now displays the error beside its actions, and a subsequent manual network change clears it. A regression test was added and the production build passed.

Real wallet extension authorization, faucet funding, transaction signing/broadcast, and NARO contract interactions remain untested. No wallet key or seed phrase was created or accessed. Reproducible fixture steps and evidence are in `tests/README.md`, `review/wallet-qa-results.json`, `review/rpc-smoke-results.json`, and the `review/wallet-qa-*.png` images.

Final continuation: delayed approval displays waiting feedback and disables duplicate requests, then completes successfully. The normal production app was reopened without the fixture; no QA wallet remains, and Escape returns focus to the wallet button. Final total: 26 browser assertions passed.
