# Design-system verification

19 October 2026 · Version 1 proposal

| Check | Result | Scope |
| --- | --- | --- |
| JSON → CSS consistency | Pass, 81 custom properties | `node design-system/build-tokens.mjs --check`. |
| Contrast | Pass, 36 foreground/background pairs | Text/actions/status at 4.5:1; active boundaries/focus at 3:1. Disabled controls and decorative dividers excluded. |
| Preview JavaScript syntax | Pass | `node --check design-system/preview.js`. |
| Desktop specimen | Visually inspected at 1280px | No horizontal overflow in the inspected state. |
| Mobile specimen | Full-page visual review at 390px | Components stack, status labels remain readable, and fields/actions fit. |
| Narrow mobile | Inspected at 320px | No document overflow or main-content elements extending past the viewport. |
| Keyboard focus | Pass in sampled input → button path | Solid aquamarine outline observed on Check field. |
| Invalid invite format | Pass | Error text, `aria-invalid=true`, input receives focus. |
| Valid invite format | Pass | Format-only success and explicit no-verification/no-binding explanation. |
| Pending transaction specimen | Pass | Action disabled and `aria-busy=true`; pending text announced. |
| Retry specimen | Pass | Retry action enabled and `aria-busy=false`. |
| Baseline DESIGN.md lint | No errors; one convention warning | Existing source has no token literally named `primary`. Observed names retained. No reconstructed spacing scale was invented. |
| Baseline compatibility export | Pass, populated categories emitted | `css-tailwind` export emitted color, font, text-size, and radius categories. Export output was inspected, not retained. |

This review covers the local specimen and its design tokens. It does not establish complete WCAG conformance, connected-wallet behavior, correctness of reward calculations, screen-reader behavior across platforms, or production-ready localization.

The preview uses original NARO logo artwork and locally hosted Latin font subsets. CJK font subsets remain an integration task when language requirements are confirmed.
