# NARO localization

19 October 2026

## Existing language inventory

The live dApp's language selector was inspected without changing its selection. It lists nine languages:

| Visible language | Proposed locale identifier | Direction | Prototype status |
| --- | --- | --- | --- |
| English | `en` | LTR | Source copy. |
| 简体中文 | `zh-Hans` | LTR | Draft translated catalog and rendered review. |
| 繁體中文 | `zh-Hant` | LTR | Preserve for integration; no new catalog authored. |
| 한국어 | `ko` | LTR | Preserve for integration; no new catalog authored. |
| 日本語 | `ja` | LTR | Preserve for integration; no new catalog authored. |
| Tiếng Việt | `vi` | LTR | Preserve for integration; no new catalog authored. |
| हिन्दी | `hi` | LTR | Preserve for integration; no new catalog authored. |
| اردو | `ur` | RTL | Preserve for integration; no new catalog authored or RTL runtime implemented. |
| Bahasa Indonesia | `id` | LTR | Preserve for integration; no new catalog authored. |

The identifiers above are proposed mappings, not recovered internal locale keys. Read the existing app catalogs before adopting them. Script labels alone do not establish the regional conventions the client wants.

## Guidance and tools

UI Skills had no dedicated translation skill in the inspected catalog. Balise UX Writing was selected and installed because its references cover localization, interface terminology, text expansion, and accessible copy. Humanize remains the writing discipline for natural phrasing. Neither skill establishes native-language or legal approval.

The catalog also includes a Hardening reference for internationalization resilience. It was inspected; it was not installed as an additional standalone skill.

## Content model

Keep complete labels and sentences in locale catalogs. Do not assemble sentences from translated fragments. Preserve named placeholders and translate the surrounding grammar. Product names and token tickers such as NARO and BNB remain unchanged.

Use `Intl.NumberFormat` for numbers, `Intl.DateTimeFormat` for explicit timezone-aware dates, and `Intl.PluralRules` for counts. The prototype's fallback is English. The parity check requires every authored key in both catalogs, so fallback does not silently conceal missing translations during review.

| Source term | Proposed Simplified Chinese | Notes |
| --- | --- | --- |
| Overview | 概览 | Main destination. |
| Rewards | 奖励 | Main destination. |
| Holdings rewards / legacy Static | 持币奖励 | Preserve the mapping to the existing reward category. |
| Community rewards / legacy Promo | 社区奖励 | Reward category; community management is a separate destination. |
| Rank rewards | 排名奖励 | Do not imply a guaranteed reward from a rank alone. |
| Claimable rewards | 可领取奖励 | Use only when eligibility is established by the actual source. |
| Settled balance | 结算快照余额 | Distinguish from live wallet balance. |
| Inviter | 邀请人 | Keep binding permanence explicit before confirmation. |
| Activation fee | 激活费用 | Separate from network gas. |

## Review requirements

Preserve the meaning of fees, gas, eligibility, settlement, receipt status, and permanent inviter binding. Do not translate pending activity as completed or accrued rewards as received tokens. A qualified reviewer should review financial explanations in the full screen and flow before release.

Test long translations without reducing useful meaning to fit. Use content-sized controls and wrapping text. Check CJK fonts, accents, and text enlargement. Urdu needs an actual `dir="rtl"` implementation, logical layout properties, directional icon review, and bidirectional isolation for addresses and amounts; supporting it in the existing app does not prove support in this prototype.

The prototype includes local original-brand assets, icons, and fonts. A proposed text-subsetting request was rejected by automatic approval review because the URL would carry project copy to an external service. No such request ran. A public font file was downloaded instead, without transmitting the catalog.
