# NARO current-state evidence

Reviewed: 19 October 2026. Scope: public pages and disconnected application states. No wallet connection, signature, binding, activation, claim, or financial transaction was performed.

## Sources

| Source | Observed content | Evidence boundary |
| --- | --- | --- |
| [NARO introduction](https://naro-jh2z240.gamma.site/) | Dark/mint branding, wordmark, issuance/community/trading/liquidity/AI narrative, UXUY and Radar DAO descriptions, document and community links. | Earlier rendered browser inspection in this chat. Statements on the page remain project claims; no independent partnership or economic verification. |
| [Home](https://naroradar.com/) | Promotional carousel, connection/setup prompt, About, capabilities, FAQ, official links, five bottom destinations. | Rendered public interface. |
| [Mining](https://naroradar.com/mining) | One claim summary, Static/Promo/Rank tabs, daily snapshot explanation, holdings-zone description, community-share link, weighted rank explanation. | Rendered disconnected state. Zero/dash values do not establish an actual wallet position. |
| [Community](https://naroradar.com/mining/community) | My Team, community power, direct referrals, community holdings, invitation eligibility prompt, power explanation, direct members. | Rendered disconnected state. Member rows and connected invite behavior were not inspected. |
| [Earnings](https://naroradar.com/mine/earnings) | Total rewards, claimed, to claim; All/Static/Promo/Rank/Claim filters; ledger disclaimer. | Rendered disconnected state. Actual records and claim accounting were not verified. |
| [Activation](https://naroradar.com/activate) | Connect wallet / Bind invite / Activate steps; invite input; BSC label; pending status; fee quote; activation transaction placeholder. | REA controlled browser capture. No form submission or wallet connection. |
| [Data](https://naroradar.com/data) | Supply, output, burn, holder and allocation sections; several infinity displays in the inspected session; mechanism descriptions. | Earlier rendered browser inspection in this chat. No conclusion about why metrics failed to resolve. |
| [Account](https://naroradar.com/mine) | Connection status, settled holdings, earnings, activation, tour, invitation links. | Earlier rendered browser inspection in this chat. |
| Swap entry | Mobile navigation click returned Not open yet. | Earlier UI observation. Desktop/integration availability may differ and requires source review. |

## Semantics supported by visible text

1. Home FAQ says rewards use daily snapshots, are not automatically credited, and must be claimed on the Mining page.
2. Home FAQ says an inviter relationship cannot be changed after binding and asks users to double-check the code and inviter.
3. Activation shows an invite code length of 4–16 letters or digits and a displayed activation fee of 0.00002 BNB. That is a live UI quote, not a contract-verified rule or testnet requirement.
4. Earnings states that ledger entries represent owed rewards rather than tokens already in the wallet.
5. Account distinguishes a settled snapshot balance from live wallet balance.
6. The Community page displays power rules concerning the largest community, communities over 10,000, and communities under 10,000. These expressions need implementation/model verification before rewriting them into numeric examples.

## REA capture

Evidence ID: `ev_cfcef494f7c226acb3b497f80baa94cf546c602ce84846a98f787dff67b2f94a`.

Operation: controlled browser scenario at `https://naroradar.com/activate`; selected page DOM and accessibility capture after `#app` became visible. Browser: Chromium, desktop viewport 1440 × 1000. The owned browser process reported cleanup as terminated.

The captured DOM also exposed Vue-specific attributes and loaded modules including vue-i18n. This supports a Vue implementation inference, but does not establish the source framework version, dependency inventory, backend architecture, or contract interface.

The REA capture establishes rendered activation content only. Browser host platform/architecture and target artifact identity were unavailable. Network bodies were not requested. It does not establish transaction execution, contract behavior, or backend correctness.

Additional deeper-page observations used the in-app browser after a REA multi-step capture did not return within the review window. Treat the deeper-page observations as browser evidence, not as completed REA captures.

## Unverified

Wallet-connected views, testnet deployments, source repository, contract addresses and ABIs, exact claim method, receipt handling, fee quoting, activation transaction count, snapshot timezone, data sources, backend validation, referral rules, language coverage, audit status, and any production security properties.

## Proposed changes versus observations

The proposed five-destination navigation, renamed labels, promoted Community destination, combined reward/history organization, activation review, and content priorities are design recommendations. They are not descriptions of the deployed application and do not authorize economic-rule changes.
