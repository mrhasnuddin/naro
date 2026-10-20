# Mobile UI audit — 20 October 2026

The mobile layout is the implementation baseline. Desktop adds width and columns after the phone layout passes review.

## Changes

- Swap uses equal pay/receive panels, aligned label and amount rows, a centered 44px pair switch, four 44px balance shortcuts, and a full-width primary action. The four-row quote is a disclosure instead of an always-expanded block.
- At 390px the token panels are 166px tall. At 320px they are 150px. The main Swap action fits above bottom navigation at the tested 390 × 844 and 320 × 740 sizes, including all nine locales.
- Shared phone spacing uses 16px page gutters, 20px panel padding and a 16px section gap. Dense member/earnings figures stack into label/value rows. Native editable controls and selects use at least 16px text on phones.
- Four campaign illustrations use metallic silver, black glass and mint lighting. Original localized headlines, supporting copy and character captions remain editable HTML. The onboarding panel and original mascot remain available. All five carousel panels retain pause/navigation controls.
- Campaign art never starts invisible. Its small transform-only float respects pause, hover, offscreen visibility and reduced motion. The full carousel also pauses on focus or when the document is hidden.

## Seeded records

Test data is the initial view. A visible data-source selector switches to live records. `?data=test` and `?data=live` make the choice shareable; the preference is stored locally when storage is available.

The fictional profile is always `0x1111…1111`, independent of the wallet connection. Its holdings, invitation code, community, network snapshots and 14 days of reward history are UI fixtures. Latest Static 880.25 + Promo 280.25 + Rank 80 = 1,240.50 NARO pending. Older rewards are fully claimed in the fixture; earned minus claimed reconciles to pending. There are no fabricated transaction hashes or explorer receipts.

Real wallet address/network/native balance and the existing transaction tools keep their own providers/state. Fixture data performs no RPC, wallet approval, signature, token transfer or backend write. Original NARO trading and reward claims remain unavailable until a compatible testnet protocol is connected. The Swap calculator is a reference quote, not an executable router quote.

## Validation

- Manual phone review: Swap, banners, rewards, community, account and wallet picker, followed by desktop composition.
- Layout checks: all nine normal screens at 320, 360, 390, 430, 768, 1024, 1280 and 1440px; no page overflow, offscreen phone controls or broken images in the tested states.
- All nine languages at 320px: equal Swap panel heights, labels fit, main action above navigation and no horizontal overflow. Existing RTL support retained.
- Interaction checks: balance percentages, reversal, slippage, quote details, insufficient balance, wallet-picker opening/closing, source switching, campaign selection and history filters.
- Unit checks cover exact decimal quote/percentage arithmetic, fixture identity, absence of transaction hashes, reward reconciliation, source precedence and localization key parity.
- Independent code review checked fixture isolation, live mode, arithmetic and original route/content preservation.

Browser checks use desktop emulation. Physical iOS/Android wallet-browser verification remains useful for keyboard, safe-area and provider-specific behavior. Generated art totals approximately 250KB in four optimized WebP files. The existing full CJK font and large optional wallet/Three.js chunks are unchanged.
