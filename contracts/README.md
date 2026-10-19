# NARO demo contracts

Educational immutable demo on local chain 31337 or BNB testnet chain 97. See `../docs/naro-demo-architecture.md` for rules and trust assumptions, and `../frontend/README.md` for complete setup and demo instructions.

```powershell
npm ci
npm run compile
npm run node
```

In another terminal, from this directory:

```powershell
npm run deploy:local
npm test
```

The node is bound to 127.0.0.1 and uses public disposable development accounts. Never fund them on any public network. The local deploy script refuses every chain except 31337. Tests use that running node plus temporary local chain simulations on ports 8546/8547. Running tests advances local time; it does not reset the already deployed demo.

Compilation writes ABI, creation/runtime bytecode, storage layout and standard JSON input to `artifacts/`, and generates the frontend ABI/creation bytecode. `deploy:local` writes a public deployment manifest and enables one-second local block mining. Rebuild the frontend after either output changes. A node restart discards all state.

Public BNB deployment is an explicit injected-wallet action in the frontend. No private keys are read by these scripts or placed in the frontend. The contracts have no mainnet deployment path. Contract source and newly authored demo scripts are MIT licensed; NARO branding and existing third-party assets retain their licenses.
