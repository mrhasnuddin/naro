# NARO learning dApp

React, TypeScript and Vite frontend with educational Solidity contracts for BNB Smart Chain testnet (97) and an isolated local demo chain (31337). The approved NARO design system, prototype and shared assets are included.

## Deploy the website on Vercel

1. Import this repository into Vercel.
2. Keep **Root Directory** at the repository root, not `frontend`.
3. The committed `vercel.json` sets the install command, build command and output directory. Choose **Other** if asked for a framework preset. Node.js is pinned to 24.x in the root package manifest.
4. Deploy. Open the resulting HTTPS production URL inside a compatible wallet's dApp browser, or in a desktop browser with an EVM wallet extension.

Only `frontend/dist/` is published. The repository root is required at build time because the frontend imports shared assets from `prototype/` and `design-system/`. The current app uses hash routes, so no SPA path rewrite is required. Its default network is BNB testnet. Do not append `?network=local` on the hosted site: localhost RPC addresses refer to each visitor's device.

Hosting the frontend does not deploy smart contracts. No public BNB deployment is configured yet. A visitor will see a deployment prompt until a shared chain-97 manifest is committed.

## Create the shared BNB testnet demo

1. Open the hosted website, connect a test wallet and switch to BNB testnet.
2. Obtain tBNB through the [official BNB faucet instructions](https://docs.bnbchain.org/bnb-smart-chain/developers/faucet/).
3. Choose **Review demo deployment**, review the network/gas, then confirm with your wallet. Never enter a private key in the website or Vercel settings.
4. Once confirmed, open Account and choose **Export deployment**. This contains public addresses, hashes and deployment metadata, not secrets.
5. Review the deployed contracts and verify source on the testnet explorer. Add the exported record under key `"97"` in `frontend/src/demo/deployments.json`, then commit and redeploy so visitors share that deployment.

Before step 5, deployment configuration is saved only in the browser that deployed it; another browser will not automatically use those contracts. WalletConnect QR and ordinary mobile-browser app switching are not implemented. Use the wallet's built-in browser for the current mobile flow.

## Local development

```powershell
npm --prefix frontend ci
npm run build
npm test
npm run check:design
```

See [frontend setup](frontend/README.md) for the local EVM, disposable-wallet demonstration and complete restart instructions. See [demo architecture](docs/naro-demo-architecture.md) for contract rules and [verification results](frontend/demo-verification.md) for tested coverage and limits.

The learning token is dNARO and has no monetary value. Trial rules do not reproduce NARO's real economics. Local addresses in the repository are public development metadata, not public-testnet deployments. No production deployment or formal security audit is claimed. Existing wallet trademarks and asset licenses remain with their owners; new contract source carries its own SPDX license.
