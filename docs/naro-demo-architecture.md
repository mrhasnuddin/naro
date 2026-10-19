# NARO learning demo architecture

19 October 2026. User-authorized educational demo for BNB Smart Chain testnet. This does not reproduce NARO's economic rules.

## Rules and boundaries

- Two contracts: `NaroDemo` (participation and reward pool) creates `DemoNaroToken` (OpenZeppelin ERC-20 with user burning).
- Both reject deployment outside chain 97 and local chain 31337. No mainnet deployment path.
- Fixed initial supply: 1,000,000 Demo NARO (`dNARO`), 18 decimals, held in the reward contract. No later minting, upgrade, owner withdrawal, blacklist, or pause authority.
- Deployer starts as an active root participant. Anyone else activates once, optionally naming an already-active inviter. Zero inviter means no inviter. Self-invites and inactive inviters revert. Activation and inviter binding happen atomically and cannot be edited.
- No activation fee, deposit, token approval, or referral payout. Users pay only network gas.
- Active participants may claim 10 dNARO immediately, then once every 60 seconds. Claims do not accumulate during inactivity. A funded pool is required. There is no APR, daily settlement, rank reward, or investment return.
- Direct referrals are enumerable with bounded pagination; balances, claim eligibility and counters are read directly. Claims/activation emit events. UI requests are explicit and show simulation, gas estimate, wallet confirmation and confirmed receipt states.
- The trial is Sybil-permissive: separate addresses can activate. It is not a real economic or anti-abuse system.

## State transitions

| Entry point | Caller and purpose | If never called |
| --- | --- | --- |
| constructor | Deployer creates the fixed demo pool and root participant | System does not exist. |
| activate(inviter) | Participant opts into irreversible participation/inviter record | Address remains inactive. |
| claim() | Active participant requests the currently eligible fixed reward | No automatic payout or accumulated debt. |
| ERC-20 transfer/approve/burn | Token holder exercises normal token controls | Their token balance remains unchanged. The dApp needs no approvals. |

## CROPS review

Chosen default: immutable, permissionless participation and fixed funded rewards, with direct RPC reads. This keeps the demo self-contained and removes administrator maintenance.

- Censorship: frontend hosting, wallet and RPC can still block access. Source, ABI, public getters and permissionless entrypoints support self-hosting, RPC replacement and direct contract calls. No contract admin can blacklist, seize tokens or withdraw the pool.
- Open: Solidity, compiler settings, ABI, deployment scripts, addresses and frontend sources are in this workspace. No private indexer is required. Public BNB deployments must be verified before calling them verified releases.
- Free: newly authored demo contracts/scripts use MIT; third-party assets keep their existing licenses/trademarks. This does not relicense client branding or the rest of the existing project.
- Privacy: wallet addresses, inviter links, claims, token transfers and times become public. Wallet/RPC providers can see requests. No identity data, analytics, custody or seed phrases are needed.
- Security: OpenZeppelin primitives, non-reentrant checks-effects-interactions claims, immutable fixed rules, capped pagination and constructor network guards. An exhausted pool halts payouts; no promise of perpetual reward availability. Users retain their tokens and can transfer them independently of the frontend.

Accepted compromises: centralized local preview/public RPC, a deliberately short educational cooldown, no Sybil protection, and a finite permissionless pool. The demo is not audited for production use. Local deployment is the automated validation path; BNB testnet deployment needs an approving wallet with tBNB. No private key should be pasted into the chat.
