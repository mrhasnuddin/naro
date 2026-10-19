# NARO interface system

Version 1 proposal · 19 October 2026 · Dark theme

This is the proposed token system for the dApp revamp. The root `DESIGN.md` records the measured existing interface; use this directory for the proposed implementation. The token names here are new semantic mappings, not recovered internal names. The application source has not been supplied, so these assets remain framework neutral.

## Direction

NARO participants need to inspect rewards, understand activation, and follow community participation. Keep NARO's mint and green-tinted neutrals, with a clear focal action in each task area. Use the existing Naro mascot for onboarding and empty states when original assets are available; preserve the official logo.

Product vocabulary: holding zones, reward settlement, community branches, referral binding, token supply, and network activity. The proposed signature is a participation summary that tells a wallet what needs attention next. Surface color communicates grouping; avoid decorative glow around financial decisions.

## Source of truth

`tokens.json` contains typed token definitions. `build-tokens.mjs` generates `tokens.css`; change the JSON and regenerate instead of editing both. This is a small project token format using typed values; no formal DTCG interchange conformance is claimed.

```powershell
node design-system/build-tokens.mjs
node design-system/build-tokens.mjs --check
node design-system/check-tokens.mjs
```

Load `tokens.css` before `components.css`. The preview's additional layout rules live in `preview.css`; they do not define the future application shell. The stylesheet does not implement wallet connectivity or contract behavior.

## Color roles

| Role | Token | Value | Origin |
| --- | --- | --- | --- |
| Page canvas | `--naro-color-canvas` | `#080B0A` | Preserved from `--naro-woodsmoke`. |
| Content surface | `--naro-color-surface` | `#0F1513` | Preserved from `--naro-surface`. |
| Raised content | `--naro-color-raised` | `#141C19` | Preserved from declared `--naro-surface-2`; new role assignment. |
| Popover/dialog surface | `--naro-color-overlay` | `#1B2622` | Preserved from declared `--naro-surface-3`; new role assignment. |
| Input surface | `--naro-color-inset` | `#0B100E` | Existing racing-green value, proposed input role. |
| Primary action | `--naro-color-brand` | `#01FEA3` | Preserved from `--naro-spring`. |
| Primary hover/focus | `--naro-color-brand-hover`, `--naro-color-focus` | `#7DFFCB` | Existing aquamarine value, proposed interaction roles. |
| Primary pressed | `--naro-color-brand-pressed` | `#00DC8D` | Proposed. |
| Text on mint | `--naro-color-on-brand` | `#03140D` | Existing primary-action foreground. |
| Primary text | `--naro-color-text` | `#E8F0EC` | Existing body text. |
| Strong text | `--naro-color-strong` | `#EFFFF8` | Existing secondary-page title text. |
| Secondary text | `--naro-color-secondary` | `#A9B7B0` | Existing supporting copy. |
| Muted text | `--naro-color-muted` | `#93A39B` | Existing pewter value, proposed metadata role. |
| Decorative divider | `--naro-color-border-subtle` | `#1F2A26` | Existing border value. Not the sole boundary of an input. |
| Control boundary | `--naro-color-border-control` | `#62796D` | Proposed to separate interactive controls from dark surfaces. |

Mint is the action accent. Amber, blue, and pink-red carry status meaning; they are not alternative decorative accents. Every status has a text label. Use the same color role consistently across pages.

| State | Foreground | Surface | Treatment |
| --- | --- | --- | --- |
| Success | `#01FEA3` | `#0C1C17` | Confirmed state after verification. |
| Warning | `#F5C451` | `#2A2416` | Pending or attention. Colors preserved; role refined. |
| Error | `#FF8191` | `#2D151C` | Proposed readable error text and feedback surface. |
| Information | `#81CAFF` | `#102331` | Proposed context such as testnet status. |

Use disabled tokens without lowering the opacity of the whole control. Disabled content is not the only place to explain why an action is unavailable; place that explanation in readable supporting text.

## Typography

Retain **Noto Sans SC** for interface text and **Chakra Petch** for financial figures. Use a system monospace stack for addresses and transaction identifiers. Avoid decorative letter spacing in balances; use tabular figures and explicit units.

| Role | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| Caption | 12px / 18px | 400–500 | Timestamps and short secondary annotations. |
| Small | 14px / 21px | 400–600 | Labels, buttons, supporting copy. |
| Body | 16px / 24px | 400 | Instructions, inputs, transaction explanations. |
| Section title | 20px / 25px | 600 | Panel headings. |
| Heading | 24px / 30px | 600 | Major sections and smaller page headings. |
| Page title | 32px / 40px | 600 | Desktop page heading; step down to 24px in compact layouts. |
| Metric | 40px / 46px | 600 | Main balance or reward amount. |
| Display | 48px / 55.2px | 600 | Sparse introductory content, not every dashboard heading. |

The local font files are Latin subsets from Google Fonts. Noto's subset is variable; Chakra's supplied numeric face is weight 600. Existing CJK support must be preserved by adding appropriate self-hosted language subsets during integration; current system fallbacks are not a final localization solution. License files are in `assets/`.

## Geometry and layout

Use the 4px spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Group label/input/help at 8px; related fields at 16–24px; major page groups at 32–48px. Panel padding is 24px on desktop and 20px in the specimen's mobile layout.

| Shape | Radius | Scope |
| --- | --- | --- |
| Small | 8px | Small inset elements and skeletons. |
| Control | 12px | Buttons and inputs; preserves the existing button radius. |
| Card | 16px | Bounded task panels; preserves the existing card radius. |
| Dialog | 24px | Larger overlays. |
| Pill | 999px | Compact status labels and eligible filter chips. |

Default controls have a minimum height of 48px; large controls use 56px. A 40px compact control is available for fine pointers, with at least a 44px target on coarse pointers. Labels may wrap when necessary; financial values must not become clipped or ambiguous.

Proposed application layout tokens: content max 1280px, reading width 680px, desktop rail 240px, header 72px, bottom navigation 72px plus device safe area. Mobile uses 16px page gutters, tablet 24px, desktop 32px. Use a rail at 1024px and above; use bottom navigation below it. Tablet begins at 768px. Breakpoint tokens are shared build values: ordinary CSS custom properties cannot be used directly in media query conditions, so the specimen uses the corresponding literal breakpoints.

Depth uses tonal surfaces and subtle grouping borders. Interactive controls receive the stronger control border. Focus uses a 2px aquamarine ring with 4px offset, rather than a shadow glow. Z-index levels reserve 0 for content, 10 for navigation, 20 for popovers, 30 for dialogs, and 40 for toasts.

## Component contracts

| Component | Required behavior |
| --- | --- |
| Primary button | Mint with dark text; hover, pressed, visible focus, disabled, and busy states. One main action per task group. |
| Secondary button | Raised surface, readable text, and control boundary; no competing mint fill. |
| Input | Persistent label, 16px text, supporting hint, visible focus; invalid state includes `aria-invalid` and a text explanation. |
| Status | Text + foreground/surface pairing. Color alone never establishes a transaction result. |
| Metric | Explicit unit, tabular digits, source/freshness when needed. Unknown, loading, and verified zero remain distinct. |
| Transaction action | Separate ready, wallet confirmation, submitted/pending, confirmed, and failed states. Give each action its own pending state. |
| Tabs | Native/accessible primitive with selected state, keyboard behavior, and linked content panel. Implement when the app framework is known. |
| Dialog | Accessible primitive with focus containment/return, title, and clear dismissal behavior. Implement when the app framework is known. |
| Navigation | Same five IA destinations across device sizes; current destination has a text/semantic selected state. |

The preview demonstrates buttons, input feedback, status labels, and transaction-state presentation only. A click never connects a wallet or sends a transaction. It checks invite-code format but cannot verify an inviter.

## Motion

Use 120ms for press feedback, 180ms for routine transitions, and 240ms for entering an occasional surface, with `cubic-bezier(0.23, 1, 0.32, 1)`. Movement uses transform/opacity. Do not animate balances, reorder controls during a wallet action, or introduce automatic promotional motion into transaction review.

Reduced-motion mode removes transitions and spinner rotation while retaining text status. Preview status announcements use a polite live region; the error field receives focus when invalid.

## Evidence and checks

See `source-audit.md` for the observed public CSS values and viewport samples. The baseline `DESIGN.md` uses only reconstructable values; proposed geometry and semantic colors live here.

`check-tokens.mjs` checks normal-text pairs at 4.5:1 and active control boundaries/focus at 3:1. It excludes disabled controls and decorative separators. These token checks do not establish complete accessibility; keyboard, screen-reader, responsive, localization, and actual application behavior still need validation during integration.

Preview: serve the workspace over localhost and open `/design-system/preview.html`. All preview assets are local. No credentials, wallet provider, RPC endpoint, API key, or external runtime dependency is required.

### Action rows and wallet selection

Use `naro-actions` for related CTAs: 12px between actions, with 24px separation from card content. Mobile primary actions span the card; secondary footer actions stack into distinct 48px rows. Compact controls have a 44px minimum below the mobile breakpoint as well as on coarse pointers. Main mobile instructions use the 16px body token; action labels use 14px.

`naro-wallet-option` provides a shared full-width selection row with a 40px provider image, 16px name, 14px supporting status, 12px internal gap, control radius, and semantic surface and border colors. Provider detection and request behavior belong to the application. Never label an unavailable wallet as connected or installed. Mobile dialogs use the 24px dialog radius at the upper corners, scrollable content, a persistent 44px close control, and safe-area padding.

### Select controls

Wrap native selects in `naro-select-wrap` and apply `naro-select`. The decorative chevron is inset 16px; reserve 40px of end padding and 16px of start padding. Selection, keyboard interaction, and accessible labels remain native. Forced-colors mode restores the native arrow. Do not compress the select until selected text clips; move it to its own row on narrow layouts.
