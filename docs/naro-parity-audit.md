# NARO original-to-rebuild audit

20 October 2026. Reference: https://naroradar.com/.

The brief is a UI and information-architecture revamp of NARO, preserving the original product. The preceding dNARO trial had replaced too much of that product with its simplified 10-token/60-second reward model. This pass restores the original interface and content, and moves that trial into Account → Testnet tools.

## Evidence and scope

REA captured the original home, Mining, Community, Data, Me, Earnings, Activation, both additional Mining tabs and closed IEO page. Complete records are retained in `docs/evidence/original-*-rea.json`. This was a public, disconnected inspection: no original wallet was connected, no registration order was created, and no signature, payment or claim was submitted.

The published route bundles and translation literals were inspected without executing the downloaded JavaScript. Raw bundles stay in ignored `.audit/original/`. `scripts/audit-original.py` retrieves referenced public assets; `scripts/extract-original.mjs` parses translation object literals as an AST. It does not evaluate application code. The source bundle hash for the recovered catalogs is `430616e67e57c9784febe613dc858bd1a0446293ff73212affa71837e4ca077b` (`i18n-BKeFymkU.js`).

The mascot is the original white/mint Naro character, including its forehead star, ears, blush, chest wordmark and limbs. Its original SVG geometry was recovered; Vue scope attributes were removed, hidden accessories remain hidden, and the chest logo is embedded for reliable standalone rendering. Partner logos are the original files. Sources and hashes are in `docs/evidence/brand-provenance.json`. Their existing trademark ownership remains unchanged.

## Feature and content mapping

| Original | Rebuild | Result and limits |
| --- | --- | --- |
| Home: five-panel promotional banner | Home highlights | Four original campaigns plus an account-dependent onboarding panel, manual dots, previous/next, pause, offscreen/visibility pause and reduced-motion support. |
| Naro mascot and buddy | Home, community, empty states, tour, poster | Original artwork; greeting, tap reaction, limited dragging, floating motion and reduced-motion behavior. The existing square-O sculpture remains a separate trial visual, not the mascot. |
| Setup: connect → activate → IEO | Home and quick tour | Progress respects verified activation and IEO completion. An unavailable record is not treated as an inactive account. Closed IEO copy does not claim a live sale. |
| About NARO, UXUY, Radar DAO | Home ecosystem section | Original lead, description, partner cards and ecosystem tags. |
| Six principles and six capabilities | Home | Original content retained in a static wrap layout and capability grid. |
| Six FAQs | Home and Help | Holding zones, settlement, finite mining, fees, circuit breaker and permanent inviter binding. |
| Official X, Telegram, YouTube and Docs | Home and Help | All four original URLs, including `naro-26smrol.gamma.site`. |
| Mining claim summary: Static / Promo / Rank | Mining | All categories, pending amount, manual daily settlement and earnings link. Unknown values stay unavailable. Original-protocol claim writes are disabled. |
| Static tab | Mining | Static pool, rank weight, Mass / Best / Anti-monopoly zones and explanation. Published default thresholds are below 1,000 / 1,000–100,000 / above 100,000; zero and unknown remain distinct. |
| Promo tab | Mining | Promo pool, network share, community-power explanation and invitation link. |
| Rank tab | Mining | Dynamic rank weight, daily ranking pool and allocation explanation. |
| Community power, directs and holdings | My Team | Summary, three original power rules, direct-member personal/community holdings and counts, frozen and largest-branch labels, branch/ID fallbacks and refresh. Needs the separate testnet records API. |
| Invite code and link | My Team / Activation | Copy controls require a verified activated account and code. New invite links target this rebuild. All five original query aliases are supported. |
| Invitation poster | My Team | Original character/brand, Wave / Happy / Bounce choices, local QR generation, copy link and screenshot guidance. An unactivated account can preview the design; it does not receive a working invitation QR. |
| Earnings ledger and five filters | Earnings | All / Static / Promo / Rank / Claim, dated record content, owed-versus-wallet distinction and transaction links for verified hashes. The original `top_reward` field is supported. No transactions are fabricated. |
| Register & Activate | Activation | Three steps, 4–16 alphanumeric code, invite-link prefill and unlock, permanent-binding copy, network/status/fee/inviter/transaction fields and quote feedback. No real original-protocol activation payment is enabled. |
| Me | Account | Actual wallet address/network/native balance, settled NARO holdings, activation and inviter fields, Earnings, Activation, Invite Friends and Quick Tour. |
| Data metrics | Data | Supply, 990M mining cap/progress, stage progress, next burn, output, daily pool burn, total burned and holders. Missing data does not render as infinity or personal zero. |
| Output stages | Data | Three original six-month stages and monthly-growth explanation. Unverified rates remain unavailable. |
| Daily reward split | Data | Static / Promo / Rank labels and configured ratios. No unknown ratio is presented as a measured number. |
| Token allocation | Data | Original policy: 1B total; 990M mining / 10M initial; initial 5M IEO / 1M community / 4M LP; deflation target 10M. This is NARO's reference content, not dNARO contract supply. |
| Four stability layers | Data | Trading fees, pool auto-burn, circuit breaker and RBS, with original explanatory copy. These are not implemented by the trial contracts. |
| Swap | Swap | Pair reversal, amount entry, reference estimate, slippage, fee/minimum/route fields and unavailable percentage controls. Preserves original closed state; no live quote, token approval or swap. |
| IEO / Subscribe / IEO Claim | IEO | Original published closed state. Hidden legacy sale/snapshot/transfer code is not promoted into an available product. |
| Nine languages | Language selector | All 746 original keys recovered for each of EN, simplified/traditional Chinese, Korean, Japanese, Vietnamese, Hindi, Urdu and Indonesian. Urdu sets RTL. Newly authored operational/error text has EN and draft simplified-Chinese copy, with English fallback elsewhere; native-language review remains needed. |

Original path URLs have rebuild destinations: `/`, `/swap`, `/mining`, `/mining/community`, `/data`, `/mine`, `/mine/earnings`, `/activate`, `/mine/activate`, `/mine/invite`, `/ieo`, `/ieo/claim`, `/subscribe`. Hash navigation remains the normal rebuilt-app navigation. Vercel serves the SPA on these legacy paths.

## Functional boundaries

The original client reads a separate `back.naroradar.net/api` ledger. A frontend rebuild does not reproduce that service or establish the original contracts, deployment, settlement policy or permission to use its production records. The rebuilt app does not send its test-wallet addresses to that original ledger.

The inspected published MiningView claim handler waits for loading and plays a reward animation; it does not submit an onchain claim in that code path. This is a finding about the inspected client, not an audit of the protocol or backend. The rebuild does not turn that animation into a false transaction confirmation.

The original Activation view's disconnected `0.00002 BNB` is a fallback display, not a verified testnet quote. Its real registration order flow uses backend-quoted fees and a treasury. The rebuild therefore displays an unavailable quote rather than charging that copied fallback or reusing a mainnet treasury.

Original NARO activation, settlement/claims, burns and trading require a matching testnet backend and verified contracts before those writes can be enabled. The existing dNARO trial still performs actual isolated-local-chain activation and claims, with mined-receipt confirmation, under Testnet tools. Its contract rules are separate. No public BNB testnet contract deployment or original-NARO transaction was made by this pass.

## Optional testnet records adapter

`frontend/src/parity/records.ts` is a read-only integration boundary. It is off by default. Enable only with an owned testnet service:

```text
VITE_NARO_TESTNET_API_URL=https://your-testnet-service.example/api
VITE_NARO_API_CHAIN_ID=97
```

Every response must declare numeric `chainId: 97`; account responses must also match `walletAddress`. HTTPS is required outside localhost. Credentials, query secrets, mainnet configuration and the original production ledger host are rejected. Requests time out and abort on account/view changes; render-time identity guards hide previous-account data immediately. The provider returns unavailable values when no service is configured. This adapter does not enable any original-protocol write.

Endpoints mirror the observed read structure: network overview, wallet dashboard, mining statistics by settlement date, invitation by user ID and 30-day reward history. See the TypeScript response models before connecting a service. Public address paths are visible to the chosen service operator. The adapter still needs integration testing with that actual service.

## Validation

- TypeScript and production build pass.
- 28 automated checks pass: existing wallet/transaction handling plus original route aliases, invitation validation, testnet API isolation, exact decimal sums/holding-zone boundaries and all nine original catalog key sets.
- Shared-token generation and 36 defined contrast pairs pass. This is not a complete accessibility certification.
- An independent ETHSkills pre-ship review identified unknown/inactive account conflation, stale-record rendering, an onboarding stage skip and reused translation keys. These were corrected before delivery.
- Browser checks and selected desktop/mobile screenshots are retained under `frontend/review/`. See `parity-responsive-checks.json` for measured widths and route coverage.
- 243 browser layout combinations passed: nine screens × nine locales × 320/390/1280-pixel viewports. Original banner campaigns, Mining tabs and keyboard switching, reference Swap estimates, locked/invalid invitation inputs, poster gating/poses/focus return, tour steps and official wallet logos were also checked.
- The relocated test tools completed another isolated-local-chain claim: transaction `0xb9502bb400e3393f156de813c82fcf5e66ba70f3336adcc7c9ccb96f9b07fe02`, chain 31337. Participant A's dNARO balance/claimed amount changed from 30 to 40 and the pool from 999,970 to 999,960. This does not verify NARO settlement or a public-testnet deployment.

Physical mobile-wallet testing, public testnet settlement/activation, complete translation review and a contract audit are not claimed.
