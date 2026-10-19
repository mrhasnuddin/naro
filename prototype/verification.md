# Prototype verification

19 October 2026

| Check | Result |
| --- | --- |
| Locale catalogs | English and draft Simplified Chinese have matching keys and interpolation variables. HTML translation keys resolve. |
| JavaScript | `node --check prototype/app.js` passes. |
| Desktop navigation | All five destinations render and update the current navigation item at 1280px, with no horizontal document overflow in the inspected states. |
| Mobile Overview | Visually reviewed at 390px in English and Simplified Chinese. The primary rewards action is visible in the first viewport. |
| Narrow mobile | All five destinations checked at 320px in both locales without horizontal document overflow. Reward history may scroll within its table container. |
| Bottom navigation | All English labels fit their own targets at 320px after sizing columns to content. |
| Public state | Personal reward/holding figures are absent; wallet connection opens the real injected-provider picker. |
| Setup state | Invitation review explains permanent binding, separates fee from gas, and keeps activation disabled because quotes and real account data are unavailable. |
| Invite format | Invalid code sets `aria-invalid`, shows a specific message, and focuses the input. Valid format explicitly does not verify an inviter. |
| Dialog dismissal | Escape closes the activation dialog and restores focus to its trigger. Chinese dialog checked within the 320px viewport. |
| Injected wallet controller | Provider-mock tests cover connect, cancellation, pending request locking, rejection, invalid accounts, network-add fallback, account/network changes, disconnect cleanup, late discovery, and metadata sanitization. Actual wallet authorization remains a manual check in a wallet-enabled browser. |
| Reward history | Three example category records render; the claim action is unavailable and has an associated explanation. |
| Locale switch | Changes document language, navigation, status, page copy, date formatting, and controls. Native-language translation approval remains outstanding. |

This is browser-based review of a local interface prototype, not physical-device, screen-reader, real-wallet, contract, production-localization, or complete accessibility verification. Clipboard copying is implemented with a manual-copy fallback but was not exercised in this review.

## CTA and mobile refinement

Action groups use a shared 12px gap, with 24px between card content and footer actions. Secondary text actions use 14px type and 44px minimum targets. Mobile community footer actions stack into separate 48px rows. Main instructions use 16px body type; smaller text is reserved for labels and metadata. Header wallet and language controls are at least 44px tall. Compact shared buttons adopt the same mobile minimum.

Wallet selection uses the shared `naro-wallet-option` component and existing palette, surface, radius, typography, and spacing tokens. Mobile dialogs become scrollable bottom sheets with a sticky close control, body scroll lock, native modal focus handling, and safe-area padding. No drag gesture is required.

Browser review after this change: 390px English overview and wallet sheet; 320px English and Chinese overview; Escape closes the wallet sheet and returns focus to the header wallet button. Header controls are 44px, community footer actions 48px, with no document overflow in the inspected views. Physical devices, actual extension approvals, screen readers, and WalletConnect QR sessions remain unverified.

Final checks: 10 provider-mock tests pass; 182 keys per locale; 81 generated tokens in sync; 36 token contrast pairs pass. Desktop Overview at 1280px has a 12px CTA gap, no document overflow, and no captured browser console errors. Review images are saved in `review/mobile-overview.png` and `review/mobile-wallet.png`.

## Browser comment fixes: selects and Account card

The account-state and language selects, plus the design-system state selector, now share a native select wrapper with a 16px chevron inset and 40px reserved end padding. Account details use a 144px label column with a 24px gap, aligned value baselines, no doubled top/bottom row padding, and a separated action footer. On mobile the label/value pairs stack with 8px gaps. At 320px the review selector takes a full row to preserve its selected text.
