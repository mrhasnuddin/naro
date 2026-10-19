# NARO interface prototype

Local review build for the dApp revamp. Open `http://127.0.0.1:4174/prototype/` while the workspace preview server is running.

The Overview uses the approved design-system tokens, with disconnected, incomplete-setup, and active-account states. The review control above the application switches between them. Supporting Rewards, Community, Network, and Account views make the navigation and content relationships reviewable; they remain preliminary.

Dashboard balances, rewards, counts, invitation records, and timestamps are sample data. The wallet picker now connects to injected EVM wallets through EIP-6963 discovery and EIP-1193 requests, with a legacy browser-provider fallback. Approving connection shares a public address. No signature, approval, transaction, private key, or automatic reconnection is requested.

Connected address and network appear in the wallet dialog and a separate Account panel. They never replace or validate sample rewards, activation, or inviter records. Network switching is explicit: BNB Smart Chain testnet, chain 97 (`0x61`), using BNB Chain’s published RPC endpoint. Forget connection clears page state and event listeners; users revoke site permissions in their wallet for full disconnection.

Detected providers appear as connection buttons. MetaMask, Trust Wallet, Rabby, and Coinbase links lead to official wallet download pages; they do not impersonate installed providers. Other EIP-6963 compatible wallets can appear too. WalletConnect QR sessions require a Reown project ID and connector integration; the current picker states that limitation rather than showing a nonfunctional QR code. On phones, use a wallet’s built-in browser for injected connection.

Activation validates invite-code format only; verified contracts, inviter checks, activation fees, and claims still require integration.
## Files

- `index.html`, `styles.css`, `app.js`: application shell, layout, and local interactions.
- `locales/en.js`, `locales/zh-Hans.js`: complete source strings and draft Simplified Chinese translations.
- `wallet.js`, `wallet.test.mjs`: injected wallet controller, discovery, and provider-mock tests.
- `check.mjs`: locale key, interpolation, and HTML translation-key checks.
- `assets/`: official Phosphor icons and a public Noto Sans SC font. Original NARO logo, Latin fonts, and design tokens come from `../design-system/`.

Run checks with `node prototype/check.mjs` `node --test prototype/wallet.test.mjs`, and `node --check prototype/app.js` from the workspace root. A plain static server can serve the workspace; no dependency installation or build step is required.

## Review boundaries

English and Simplified Chinese are available in the prototype. Simplified Chinese is a draft for layout and task review, not a linguistically approved production translation. The existing product's nine-language inventory is in `../docs/naro-localization.md`.

Local amounts use sample JavaScript numbers and `Intl` for display. Contract integration must use actual token decimals and precision-safe raw amounts; the sample formatter is not a transaction arithmetic implementation. Snapshot dates use `Asia/Kuala_Lumpur` explicitly and are labeled as examples.

The full public Chinese font is approximately 17.8 MB and loads for CJK text. This avoids sending project copy to a font-subsetting service. Production font packaging needs review after the complete locale inventory and app stack are available. Font licensing is in `../design-system/assets/NotoSansSC-OFL.txt`; Phosphor licensing is in `assets/Phosphor-LICENSE.txt`.

Next integration inputs: the existing application source, contract ABIs, verified testnet deployments, API definitions, and the client's approved terminology. The observed live site appears to use Vue, so this prototype does not choose or migrate the production framework.

## Wallet implementation references

- EIP-6963: https://eips.ethereum.org/EIPS/eip-6963
- EIP-1193: https://eips.ethereum.org/EIPS/eip-1193
- BNB RPC configuration: https://docs.bnbchain.org/bnb-smart-chain/developers/json_rpc/json-rpc-endpoint/

Provider metadata is untrusted: names are escaped and length-limited; only bounded image data URIs are accepted and rendered through `img`, never injected SVG markup. Provider labels do not establish wallet identity. No wallet details are stored or sent to analytics. Wallet-mediated RPC calls use the selected wallet and its configured network endpoints.

Wallet download rows use unmodified official MetaMask, Trust Wallet, Rabby, and Coinbase Wallet logos stored locally in `assets/wallets/`. Asset URLs, official source pages, and SHA-256 hashes are recorded in `assets/wallets/sources.json`. Logos remain trademarks of their owners. Detected wallets continue to supply their own provider icons.
