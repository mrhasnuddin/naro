# Wallet QA fixtures

`wallet-harness.html` loads the actual compiled app from `../dist/`. It injects a clearly named test-only EIP-6963 provider before the app starts. The fixture and its controls are outside the production entry graph and are not bundled into `dist/`.

Build first with `npm run build`, serve the workspace, then open:

`http://127.0.0.1:4174/frontend/tests/wallet-harness.html?scenario=success#account`

| Scenario | Behavior |
| --- | --- |
| `success` | Simulated address A with 1.25 tBNB; account B has 2.5 tBNB. |
| `wrong-network` | Starts on chain 1; an explicit switch changes to chain 97. |
| `add-network` | Switch returns 4902 until the app adds chain 97. |
| `reject` | Connection returns 4001. |
| `pending` | Connection returns -32002. |
| `balance-error` | Balance service fails until Recover balance service is pressed, then Refresh balance can retry. |
| `stale` | Holds address A's balance response; change account to B, then resolve A's old response. B's balance must remain visible. |
| `timeout` | Balance response never resolves; app should show retryable error after 15 seconds. |
| `switch-reject` | Network switching returns 4001. Change to the wrong network using QA controls, then try the app's switch action. |
| `delayed` | Simulated connection waits 2.5 seconds. |
| `live-rpc` | Account selection is simulated; chain and balance reads go to the official BNB testnet RPC. Address A is a public diagnostic address, not a wallet controlled by this test. Its balance is not test funding. |

QA controls can simulate account/network changes, provider disconnect, and old response resolution. Only account access, chain reads, balance reads, and network switch/add methods are accepted. Signature and transaction methods are rejected by the fixture. There is no private key, seed phrase, faucet claim, or ownership proof.

`npm run test:rpc` runs a separate public read-only RPC smoke test and saves `../review/rpc-smoke-results.json`. It reads chain ID, block height, and the zero-address balance without connecting any wallet.

The browser QA results are saved in `../review/wallet-qa-results.json`. All 26 recorded checks passed against the built app. Browser operations were performed through the app's browser automation API; this fixture is not an unattended test runner.

## Local contract demo

`local-demo.html?network=local#overview` loads the current built frontend and connects to the real development EVM at 127.0.0.1:8545. Start the node, deploy with `npm --prefix contracts run deploy:local`, then rebuild the frontend before opening it.

This fixture uses unlocked disposable development accounts, refuses chains other than 31337, limits writes to zero-value transactions to the configured demo contract or its exact creation bytecode, and does not expose private keys. The controls select Participant A, Participant B or the root inviter and can advance the local clock by 61 seconds. It is for a localhost development server only. Do not publish the workspace test directory as the production site; publish `frontend/dist/`.

The older wallet-harness fixtures above simulate wallet behavior and reject writes. The local contract fixture executes actual local writes. See `../demo-verification.md` for the measured distinction.
