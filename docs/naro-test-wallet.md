# Test wallet handoff

The requested dedicated wallet is stored under `contracts/.local/`. Its private key is encrypted with Windows DPAPI for the current Windows user. All wallet files are ignored by Git. The creation command is idempotent and prints only the public address.

```powershell
npm --prefix contracts run wallet:create
```

To use it with a browser wallet, run this command yourself in an interactive Windows terminal:

```powershell
npm --prefix contracts run wallet:export
```

Choose a password of at least 12 characters; input is hidden. The command writes a standard encrypted JSON keystore under `contracts/.local/naro-test-wallet.keystore.json`. It never prints the private key or password. Import that JSON through MetaMask Extension's account-import flow using the password you chose. See [MetaMask's official import instructions](https://support.metamask.io/start/use-an-existing-wallet/). Keep this account for testnets only. Creating an account does not provide tBNB.

The DPAPI file depends on this Windows user account and is not a portable backup. The encrypted JSON export can be imported separately. This is a locally generated software wallet, not a hardware wallet or independent security audit.

Once the wallet has tBNB, connect it to NARO. Account → Network setup exposes deployment review while no shared chain-97 deployment exists. Deployment requires your confirmation. After deployment, export its public manifest for the shared frontend configuration. Activation and claim then use actual contract simulation, wallet submissions and mined receipts.

Funding checked on 20 October 2026: the official BNB faucet advertises a mainnet minimum; the Quicknode page advertised a free base drip but showed a low faucet-balance alert; Chainstack required an API key and mainnet history. No faucet request, account signup, external support message, wallet import or public-chain transaction was performed during wallet creation. Public faucet requirements can change.
