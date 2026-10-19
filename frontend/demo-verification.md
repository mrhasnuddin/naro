# Demo verification — 19 October 2026

## Executed

- 19 contract tests passed on local EVMs: fixed supply, activation and inviter rules, immediate claims, exact cooldown boundary, no accrual, recipient isolation, full and partial pool exhaustion, reverted mined-transaction rollback, pagination bounds, no native deposits/admin withdrawal/later minting, user transfer/burn, and a seeded 48-action accounting invariant sequence.
- Both constructors reject a local simulation using chain ID 56. A separate local simulation using chain ID 97 accepts deployment. This is not execution on public BNB testnet.
- 23 frontend/controller tests passed: account/network events, request locks, stale responses, RPC values, exact amounts, locale parity, explicit request chain binding, repriced receipts, cancellation, failure and timeout classification.
- TypeScript and Vite production build passed. 81 shared tokens match generated CSS; 36 token contrast pairs passed. This is not complete WCAG certification.
- Separate read-only agent review covered contract/test gaps, frontend chain context, receipt handling, stale-account reads and deployment checks. Reported chain-binding and replacement-handling defects were fixed with regression tests. This is not a formal audit.
- npm audit reported zero known advisories in each package at implementation time. Solidity uses OpenZeppelin 5.4.0 and solc 0.8.30 with optimizer 200 and EVM paris.

## Actual local browser flow

The production bundle was loaded by `tests/local-demo.html`, which announces a disposable local-only EIP-6963 wallet. The fixture forwards allowed JSON-RPC calls to the real local node; it does not fabricate contract balances or receipts.

Chain: 31337. Demo contract: `0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf`. Token: `0xf7b407BD806B9943C1b2281271B27DC3F3baE694`.

Participant: `0x70997970c51812dc3a010c7d01b50e0d17dc79c8`. Inviter: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`.

| Browser action | Observed result |
| --- | --- |
| Activate with root inviter | Mined block 267, transaction `0xd7719188ddd0f96bb70c42d77f3093216a22304f0da0cdd7cd0994d481fd59d0`. |
| Claim demo reward | Mined block 274, transaction `0x1fb8feded6570a2c08b7bc14140963656ab0090e969c9d9262e801a993d1d80d`. |
| Immediate next claim | Button disabled during 60-second cooldown. |
| Rewards view | Confirmed claim row, block 274, 10 dNARO and matching hash prefix. |
| Root community | One direct member, matching the participant address. |
| Network view | Supply 1,000,000; reward pool 999,990; distributed 10; active participants 2. |
| Account view | Active state, immutable inviter, 10 dNARO balance. |

These addresses and receipts are specific to the running local node and disappear when it is reset.

Mobile navigation and document-width checks passed across all five views at widths 320 and 390, in English and draft Simplified Chinese. Results are saved in `review/demo-mobile-checks.json`; loaded mobile and desktop screenshots are beside that file. These checks cover navigation, wrapping and visible hierarchy, not every device, assistive technology or browser implementation.

## Limits

No public BNB deployment, faucet claim, real extension-wallet signature/submission, explorer source verification, Slither analysis or formal security audit was performed. Replacement and network-race checks are automated boundary tests; an actual wallet speed-up/cancel interaction was not exercised. The frontend deployment path builds and uses the tested creation bytecode, but its public-testnet confirmation path still needs a funded test wallet. Historical wallet-only test results remain in `verification.md` and are not evidence of public onchain writes.

Final rebuilt-client submission also passed with an explicitly bound chain ID: claim transaction `0xe4bcf0f843f5467f50c003cc2ca261b3cd38d8c73026776c0500607962e2d465`, block 907. The UI showed a confirmed receipt, 20 dNARO wallet balance/total claimed and a disabled cooldown button. Final screenshots capture this second claim. The earlier table records the first claim and its corresponding counters. The normal BNB testnet URL was separately checked and correctly showed the undeployed state instead of local deployment data.
