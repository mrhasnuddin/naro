# NARO learning demo

React + TypeScript frontend built from the approved NARO prototype, now connected to two educational Solidity contracts. Local demo transactions work end to end. No public BNB testnet deployment has been made.

## Try it now

Open http://127.0.0.1:4174/frontend/tests/local-demo.html?network=local#overview.

Choose Connect wallet, then NARO Local Test Wallet, then close the connection dialog. Participant A already has a confirmed activation and 30 dNARO from the demonstration. Review demo claim submits another eligible claim. The bottom-right Local test wallet controls let you switch between two disposable participants and the root inviter, or advance the local cooldown. Participant B can activate with Participant A as inviter. These are real transactions on the isolated local EVM, chain 31337; the tokens and local gas have no monetary value.

The normal app is http://127.0.0.1:4174/frontend/dist/#overview. It targets BNB testnet, chain 97. Without a deployment it offers a wallet-confirmed demo deployment. A funded test wallet is required. No private key is entered in this app.

## Restart from source

Use Node.js 24.12 or newer. From the workspace root:

```powershell
npm --prefix contracts ci
npm --prefix frontend ci
npm --prefix contracts run compile
npm --prefix contracts run node
```

Leave the local node running. In a second terminal:

```powershell
npm --prefix contracts run deploy:local
npm --prefix frontend run build
python -m http.server 4174 --bind 127.0.0.1
```

A restarted node has fresh disposable state. Run deploy:local and rebuild again; its manifest must match the new chain. The bundled local manifest is only valid while that particular node is running. A code mismatch appears as an error instead of invented balances. Remove an old `naro:demo:31337` browser storage entry if a previous browser deployment overrides the new local manifest.

For frontend development, `npm --prefix frontend run dev` serves Vite on port 5173. Use `?network=local` with an installed wallet configured for the local node, or use the workspace test fixture above for disposable accounts. The disposable wallet is never bundled in the production app.

## Demo rules

- Fixed supply of 1,000,000 dNARO, 18 decimals, initially in the reward pool.
- Deployer starts active. Other wallets activate once with an optional active inviter; the inviter becomes permanent.
- No activation fee, deposits, approvals, or referral payouts. Only network gas.
- Claim 10 dNARO immediately after activation and again every 60 seconds while the pool has enough tokens. Missed periods do not accrue.
- No admin, upgrade, later minting, or pool withdrawal. Users can transfer or burn their own tokens through the standard ERC-20 interface.

These are trial rules, not NARO's actual token economics. Account and inviter records are public. Multiple wallets can participate; there is no Sybil resistance.

## Frontend behavior

Five views share the approved dark/mint tokens, responsive navigation, typography, spacing and official wallet logos. The app reads verified deployment data. Sample fixtures remain in the original prototype and source, but the public app no longer exposes sample-mode controls. Disconnected users are prompted to connect before seeing personal metrics. Network statistics are public.

Transactions are simulated and estimated before a review dialog, require an explicit wallet submission, and finish with a mined receipt. Requests bind the intended chain ID, reject changed wallet contexts, handle cancelled/repriced transactions, and retain unknown confirmation status for retry. The local and BNB testnet modes are labeled separately.

English and draft Simplified Chinese have matching translation keys and interpolation tokens. Chinese still needs native-language review. The existing 17.8 MB Chinese font asset loads only for its CJK Unicode range; font subsetting remains a production optimization.

`src/demo/` holds contract reads, transaction handling, deployment manifests and demo views. `../contracts/` holds Solidity, compilation, local deployment and contract tests. Shared fonts, tokens, layouts and wallet logos remain under `../design-system/` and `../prototype/`; Vite packages them into a self-contained `dist/`.

## Verify

With the local node running:

```powershell
npm --prefix contracts test
npm --prefix frontend test
npm --prefix frontend run check:design
npm --prefix frontend run build
```

See `demo-verification.md` for current coverage and limits, and `../docs/naro-demo-architecture.md` for contract decisions. `verification.md` and the older wallet harness document the preceding wallet-only phase.

## BNB testnet handoff

Open the normal app, connect an EVM test wallet, switch to BNB testnet, obtain tBNB from the official faucet, and open Account → Network setup to choose Set up network. Review the network and gas estimate, then confirm in your wallet. The app checks the mined deployment and saves its public manifest in this browser. Export deployment creates a JSON record for review. To share a deployment across browsers, review and add its chain-97 record to `src/demo/deployments.json`, then rebuild. Importing arbitrary manifests through the UI is not implemented.

Compiler settings and standard JSON input are in `contracts/artifacts/`. Verify both contracts on the testnet explorer after deployment; this has not been performed. WalletConnect QR still requires a project ID and connector implementation. No production deployment or security audit is claimed.

Browser storage persists language and public deployment configuration, including the deployment wallet address and transaction hash. It does not store wallet secrets. Wallet logos and fonts retain their existing licenses and trademark ownership.

See `../docs/naro-product-polish.md` for the 20 October product UI, Three.js asset, motion checks and current funding limits.
