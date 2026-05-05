# Phase 5 Wallet and Transaction Regtest Preparation

> **Safety status:** preparation only. This document and the collection skeleton are for deterministic local `regtest` work. They are not instructions for mainnet, signet, testnet, production wallets, or real funds.

## Hard boundaries

Phase 5 work must stay inside these boundaries until Senior Reviewer approval expands them:

- Use `chain=regtest` only.
- Use `127.0.0.1:18443` by default.
- Use disposable CI/local wallets only.
- Never use mainnet RPC credentials, cookie files, or wallet directories.
- Never dump, import, paste, or commit private keys, wallet dumps, descriptors containing private material, seeds, mnemonics, or passphrases.
- Never use production wallet names or paths.
- Do not add executable mainnet send/broadcast workflows.

## Intended workflow shape

The future executable workflow should be deterministic and resettable:

1. Start an isolated Bitcoin Core regtest node.
2. Create or load a disposable wallet with a clearly generated name such as `oc_regtest_phase5`.
3. Generate a receiving address from that wallet.
4. Mine regtest blocks to mature coinbase outputs.
5. Assert wallet balances and list local UTXOs.
6. Build a small transaction to another regtest address.
7. Prefer PSBT construction/analysis/finalization before adding any broadcast request.
8. If a broadcast request is added, keep it in a clearly marked destructive folder and require a regtest guard.
9. Tear down disposable state after CI/local runs.

## Collection skeleton policy

The `Wallet and Transactions - Phase 5 REGTEST ONLY` collection folder is intentionally non-executable right now. It exists to make the next phase boundaries visible without adding wallet mutations yet.

When requests are added later, each request must include:

- A name that indicates whether it is read-only, mutating-regtest, or destructive-regtest.
- A description with preconditions and rollback/reset notes.
- The standard JSON-RPC shape and environment-variable URL.
- Tests that assert the active chain is regtest before risky behavior is exercised.
- No private-key dump/import methods.

## Conservative request staging

Recommended order for future request additions:

### Stage A: read-only wallet/node discovery

- `listwallets`
- `listwalletdir`
- `getwalletinfo` only against a disposable regtest wallet URL

### Stage B: deterministic regtest setup

- `createwallet` for a disposable wallet name only
- `loadwallet` only for the disposable wallet
- `getnewaddress` for regtest mining/receiving addresses
- `generatetoaddress` only after asserting regtest

### Stage C: transaction inspection and PSBT preparation

- `listunspent`
- `walletcreatefundedpsbt`
- `analyzepsbt`
- `walletprocesspsbt`
- `finalizepsbt`
- `testmempoolaccept`

### Stage D: destructive regtest-only broadcast

- `sendrawtransaction` may be added only after explicit Senior Reviewer approval and must live under a folder named `DESTRUCTIVE REGTEST ONLY`.
- Wallet convenience send methods such as `send`, `sendmany`, and `sendtoaddress` remain out of scope until separately approved.

## Explicitly prohibited for this phase

The following remain prohibited in executable collection requests for Phase 5 preparation:

- Private-key dump/import RPCs.
- Wallet dump/import RPCs.
- Wallet passphrase/encryption RPCs.
- Mainnet or production wallet operations.
- Any request that relies on real funds or externally reachable peers.

## Reviewer checklist

- [ ] Defaults are still regtest and localhost.
- [ ] No mainnet credentials or real secrets are present.
- [ ] Collection skeleton has no executable wallet/send request yet, or any added request is allowlisted and regtest guarded.
- [ ] Destructive future folders are clearly marked.
- [ ] No private-key dump/import workflow was added.
- [ ] `npm run validate`, `node --check scripts/validate-repo.mjs`, and `git diff --check` pass.


Additional methods that must remain blocked until an explicit future safety review: `sendall`, `importmulti`, `importdescriptors`, and `submitpackage`.
