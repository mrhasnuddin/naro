# NARO design evidence

Measured on 19 October 2026 with the rendered public dApp. URL mode; no application source repository is available. Values in this file describe the existing site, not proposed design changes.

## Sampling

Pages: Home `/`, Mining `/mining`, Activate `/activate`. Viewports: desktop 1280 × 720 and mobile 390 × 844. Measurements used DOM computed styles and loaded same-origin CSS declarations. The mobile override was reset after sampling.

Shared stylesheet: `https://naroradar.com/assets/index-mpFnieAi.css`. Fonts were also declared by the page's Google Fonts stylesheet. Same-origin CSS included the named `--naro-*` custom properties below.

| Candidate role | Measured value | Basis | Scope / confidence |
| --- | --- | --- | --- |
| Canvas | `--naro-woodsmoke: #080b0a` | Root declaration and computed root background. | Shared root, observed. Body also layers gradients. |
| Body text | `--naro-gin: #e8f0ec` | Root declaration and computed body color. | All six page/viewport samples, observed. |
| Primary action | `--naro-spring: #01fea3` | Root declaration, `.na-btn.is-primary`, and computed primary/header buttons. | All sampled templates, observed. |
| On-primary text | `--naro-bottle-green: #03140d` | Root declaration and computed primary/header button text. | All sampled templates, observed. |
| Card surface | `--naro-surface: #0f1513` | Root declaration and computed activation `.info-card` background. | Activation, both widths; local treatment with declared shared token. |
| Border | `--naro-outer-space-2: #1f2a26` | Root declaration and computed activation card and desktop shell border. | Shared/activation, observed. |
| Supporting text | `--naro-edward: #a9b7b0` | Root declaration and computed `.about__p` color. | Home supporting copy, observed. |
| Title text | `--naro-clear-day: #effff8` | Root declaration and computed Activate/Mining h1. | Two templates at both widths, observed. |
| Sans family | Noto Sans SC with system fallbacks | Named root declaration and computed body/buttons. | All six samples, observed. |
| Numeric family | Chakra Petch with Noto Sans SC fallback | Named root declaration and computed activation input. | Activation input at both widths; broader numeric role declared by `--naro-font-num`. |
| Body scale | 14px, 21px line, weight 400 | Computed body and global CSS declaration. | All six samples, observed. |
| Card radius | `--naro-radius-card: 16px` | Root declaration and computed activation card. | Activation at both widths, observed. |
| Page-action radius | `--naro-radius-btn: 12px` | Root declaration, shared button CSS, and Home primary-action computed value. | Shared component, observed. |
| Header-control radius | `--naro-radius-pill: 19px` | Root declaration and computed connection/language controls. | All sampled templates, observed. |

## Declared values reused in the proposal

The shared root also declares surface-2 `#141c19`, surface-3 `#1b2622`, racing-green `#0b100e`, aquamarine `#7dffcb`, pewter `#93a39b`, deep `#16302a`, warn `#f5c451`, warn-bg `#2a2416`, and aztec `#0c1c17`. Their assignment to the revamp's raised, overlay, inset, hover/focus, metadata, selected, warning, and success roles is proposed. Those new role names are not claimed as recovered internal token names.

The existing torch-red is `#ef2b4a`; the revamp proposes a lighter error foreground and a dark error surface. The stronger control boundary, pressed mint, information colors, body-size increase, consistent scale, desktop layout widths, and motion durations are proposed as well.

## Layout evidence and omissions

Existing shared declarations include design width 390px, content width 358px, shell max 440px, and a 72px tab bar. Desktop CSS at 921px introduces a 28px shell radius and 80px header height but keeps mobile-style bottom navigation. Home title size changes from 22px mobile to 28px desktop. Activate and Mining h1 values differ from the Home hierarchy.

These observations explain the need for a consistent revamp scale; they do not establish a complete intended layout system. The baseline `DESIGN.md` omits a reconstructed spacing scale and an invented `primary` token alias. A validator convention warning about a missing `primary` key does not justify changing observed token names. No light theme, full language-font inventory, icon family, or original logo/mascot usage manual has been verified.

## Local assets

The logo is the original `https://naroradar.com/naro-assets/logo.png`, copied for the client redesign preview. Font subsets came from the official Google Fonts CSS response; SIL Open Font License texts came from `google/fonts` for the corresponding families. The logo remains a project asset; font licenses do not grant rights to the logo.
