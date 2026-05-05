# Bitcoin Core API Repository Analysis and Phase Plan

## Scope

This repository will become a curated, tested Postman/API workspace for Bitcoin Core. The project starts with the safest, most deterministic subset and only expands after CI and Senior Reviewer approval.

Primary research source requested by Mani:

- <https://developer.bitcoin.org/reference/rpc/>

Research snapshot collected for planning:

- `137` RPC documentation pages discovered under the developer Bitcoin RPC reference.
- Categories found: Blockchain RPCs, Control RPCs, Generating RPCs, Mining RPCs, Network RPCs, Rawtransactions RPCs, Util RPCs, Wallet RPCs.

Important note: `developer.bitcoin.org` is useful as a broad RPC reference, but some details may lag behind current Bitcoin Core releases. Each implementation phase must therefore also cross-check current Bitcoin Core docs/release-specific help before adding requests.

## Source repository assessment

Template evaluated: <https://github.com/StevenBlack/bitcoin-postman>

Findings:

- Useful as an inspiration for basic Postman JSON-RPC request shape.
- It is marked as work in progress.
- It contains a single collection file and a README.
- It does not provide CI validation, Newman checks, Docker/regtest, structured environments, or a phased safety model.
- Many RPC groups are incomplete or empty.

Conclusion: use the template as inspiration, not as a direct clone. This repository should be built as a tested, maintainable API project.

## RPC surface from developer.bitcoin.org

### Blockchain RPCs

  - `getbestblockhash`
  - `getblock`
  - `getblockchaininfo`
  - `getblockcount`
  - `getblockfilter`
  - `getblockhash`
  - `getblockheader`
  - `getblockstats`
  - `getchaintips`
  - `getchaintxstats`
  - `getdifficulty`
  - `getmempoolancestors`
  - `getmempooldescendants`
  - `getmempoolentry`
  - `getmempoolinfo`
  - `getrawmempool`
  - `gettxout`
  - `gettxoutproof`
  - `gettxoutsetinfo`
  - `preciousblock`
  - `pruneblockchain`
  - `savemempool`
  - `scantxoutset`
  - `verifychain`
  - `verifytxoutproof`

### Control RPCs

  - `getmemoryinfo`
  - `getrpcinfo`
  - `help`
  - `logging`
  - `stop`
  - `uptime`

### Generating RPCs

  - `generateblock`
  - `generatetoaddress`
  - `generatetodescriptor`

### Mining RPCs

  - `getblocktemplate`
  - `getmininginfo`
  - `getnetworkhashps`
  - `prioritisetransaction`
  - `submitblock`
  - `submitheader`

### Network RPCs

  - `addnode`
  - `clearbanned`
  - `disconnectnode`
  - `getaddednodeinfo`
  - `getconnectioncount`
  - `getnettotals`
  - `getnetworkinfo`
  - `getnodeaddresses`
  - `getpeerinfo`
  - `listbanned`
  - `ping`
  - `setban`
  - `setnetworkactive`

### Rawtransactions RPCs

  - `analyzepsbt`
  - `combinepsbt`
  - `combinerawtransaction`
  - `converttopsbt`
  - `createpsbt`
  - `createrawtransaction`
  - `decodepsbt`
  - `decoderawtransaction`
  - `decodescript`
  - `finalizepsbt`
  - `fundrawtransaction`
  - `getrawtransaction`
  - `joinpsbts`
  - `sendrawtransaction`
  - `signrawtransactionwithkey`
  - `testmempoolaccept`
  - `utxoupdatepsbt`

### Util RPCs

  - `createmultisig`
  - `deriveaddresses`
  - `estimatesmartfee`
  - `getdescriptorinfo`
  - `getindexinfo`
  - `signmessagewithprivkey`
  - `validateaddress`
  - `verifymessage`

### Wallet RPCs

  - `abandontransaction`
  - `abortrescan`
  - `addmultisigaddress`
  - `backupwallet`
  - `bumpfee`
  - `createwallet`
  - `dumpprivkey`
  - `dumpwallet`
  - `encryptwallet`
  - `getaddressesbylabel`
  - `getaddressinfo`
  - `getbalance`
  - `getbalances`
  - `getnewaddress`
  - `getrawchangeaddress`
  - `getreceivedbyaddress`
  - `getreceivedbylabel`
  - `gettransaction`
  - `getunconfirmedbalance`
  - `getwalletinfo`
  - `importaddress`
  - `importdescriptors`
  - `importmulti`
  - `importprivkey`
  - `importprunedfunds`
  - `importpubkey`
  - `importwallet`
  - `keypoolrefill`
  - `listaddressgroupings`
  - `listlabels`
  - `listlockunspent`
  - `listreceivedbyaddress`
  - `listreceivedbylabel`
  - `listsinceblock`
  - `listtransactions`
  - `listunspent`
  - `listwalletdir`
  - `listwallets`
  - `loadwallet`
  - `lockunspent`
  - `psbtbumpfee`
  - `removeprunedfunds`
  - `rescanblockchain`
  - `send`
  - `sendmany`
  - `sendtoaddress`
  - `sethdseed`
  - `setlabel`
  - `settxfee`
  - `setwalletflag`
  - `signmessage`
  - `signrawtransactionwithwallet`
  - `unloadwallet`
  - `upgradewallet`
  - `walletcreatefundedpsbt`
  - `walletlock`
  - `walletpassphrase`
  - `walletpassphrasechange`
  - `walletprocesspsbt`

## Safety classification

### Safe/read-only first

Initial pipeline-backed collection should contain only deterministic or low-risk read-only calls:

  - `getrpcinfo`
  - `uptime`
  - `getblockchaininfo`
  - `getblockcount`
  - `getbestblockhash`
  - `getdifficulty`
  - `getmempoolinfo`
  - `getrawmempool`
  - `getnetworkinfo`
  - `getconnectioncount`
  - `getpeerinfo`

### Requires local regtest data

These calls should wait until the CI can create deterministic blocks, wallets, transactions, and UTXOs:

- `getblock`
- `getblockhash`
- `getblockheader`
- `gettxout`
- `getmempoolancestors`
- `getmempooldescendants`
- `getmempoolentry`
- `getrawtransaction`
- wallet balance/history/address calls

### Risky/destructive/admin

These must be isolated, loudly documented, and tested only on regtest unless intentionally enabled by a human:

- Node/admin: `stop`, `logging`, `setnetworkactive`, `setban`, `clearbanned`, `disconnectnode`, `addnode`
- Chain state: `preciousblock`, `pruneblockchain`, `savemempool`, `scantxoutset`
- Wallet/private data: `dumpprivkey`, `dumpwallet`, `importprivkey`, `importwallet`, `encryptwallet`, `walletpassphrase*`
- Money movement: `send`, `sendmany`, `sendtoaddress`, `sendrawtransaction`, `bumpfee`, `psbtbumpfee`

## Phase model

### Phase 1 — Foundation and validation pipeline

Goal: establish repository quality gates before the collection grows.

Deliverables:

- Repository structure.
- Detailed analysis and phase plan.
- Security documentation.
- Minimal read-only RPC collection skeleton.
- Regtest Postman environment template.
- GitHub Actions workflow for structural validation.
- Local `npm run validate` gate.

Checks:

- JSON parse validation for collections/environments.
- Basic Postman Collection v2.1 shape validation.
- Required file validation.
- Simple hardcoded credential guard.

Senior Reviewer gate:

- Confirms scope is conservative.
- Confirms no risky RPCs are treated as basic workflow.
- Confirms CI is present before broader API expansion.

### Phase 2 — Functional read-only RPC pipeline

Goal: make the initial safe RPC calls actually executable in CI.

Deliverables:

- Newman setup.
- Read-only JSON-RPC requests with tests.
- Environment conventions for regtest.
- CI job that can run Newman when a Bitcoin Core endpoint is available.

Preferred initial requests:

  - `getrpcinfo`
  - `uptime`
  - `getblockchaininfo`
  - `getblockcount`
  - `getbestblockhash`
  - `getdifficulty`
  - `getmempoolinfo`
  - `getrawmempool`
  - `getnetworkinfo`
  - `getconnectioncount`
  - `getpeerinfo`

Checks:

- HTTP 200.
- JSON-RPC response shape.
- Expected result type for stable calls.
- No hardcoded credentials.

Senior Reviewer gate:

- Confirms request design, test assertions, naming, and failure behavior.

### Phase 3 — Bitcoin Core regtest integration

Goal: CI starts a real Bitcoin Core node and verifies the read-only collection against it.

Deliverables:

- Docker Compose service for `bitcoind`.
- Deterministic `bitcoin.conf` for regtest.
- Healthcheck script.
- Regtest bootstrap script.
- Newman against the running node.

Checks:

- RPC readiness.
- Chain height after block generation.
- Collection succeeds against real `bitcoind`.
- Logs/artifacts available on failure.

Senior Reviewer gate:

- Confirms Docker and CI stability.
- Confirms test data is deterministic and isolated.

### Phase 4 — REST API collection

Goal: add Bitcoin Core REST only after RPC/regtest foundation is stable.

Implementation source:

- Current Bitcoin Core REST interface documentation: <https://github.com/bitcoin/bitcoin/blob/master/doc/REST-interface.md>

Planned endpoints for this phase:

- `/rest/chaininfo.json`
- `/rest/deploymentinfo.json`
- `/rest/mempool/info.json`
- `/rest/blockhashbyheight/<height>.json`
- `/rest/block/notxdetails/<hash>.json`
- `/rest/headers/<hash>.json?count=<count>`

Excluded from Phase 4:

- Wallet workflows.
- Transaction-specific REST endpoint `/rest/tx/<txid>.*`.
- UTXO/undo transaction-output endpoints `/rest/getutxos/...` and `/rest/spenttxouts/<blockhash>.*`.
- Transaction-heavy full block endpoint `/rest/block/<blockhash>.*`; use `/rest/block/notxdetails/<blockhash>.json` instead.
- Mempool transaction-entry listing `/rest/mempool/contents.json`.
- Binary and hex response variants.

Checks:

- REST enabled with `-rest=1`.
- REST uses the same local regtest HTTP listener as RPC (`127.0.0.1:18443`).
- JSON endpoints validated structurally by the repository validator and later by Newman when the integration node is available.
- REST risks documented, including file-descriptor exhaustion from high connection counts and browser/XSS privacy leakage.

Senior Reviewer gate:

- Confirms REST is separated from JSON-RPC and does not weaken security posture.

### Phase 5 — Wallet and transaction workflows

Goal: add money-moving workflows only in deterministic regtest.

Deliverables:

- Wallet creation/loading workflow.
- Address generation.
- Mining to wallet address.
- Balance checks.
- Basic transaction lifecycle.
- Basic PSBT workflow.

Checks:

- All wallet/send operations run only against regtest CI data.
- Destructive or sensitive requests are in clearly marked folders.
- No mainnet defaults.

Senior Reviewer gate:

- Confirms private-key and send workflows are guarded and documented.

### Phase 6 — Advanced/special topics

Only after Phases 1-5 are stable:

- Deep PSBT workflows.
- Descriptor wallet workflows.
- Raw transaction construction/signing/broadcast.
- Mempool edge cases.
- Signet/Testnet4 examples.
- ZMQ documentation and example subscriber.
- Optional OpenAPI/Bruno/Insomnia exports.

Senior Reviewer gate:

- Confirms each advanced topic has a narrow PR, CI coverage, and explicit safety notes.

## Review workflow

Every phase follows this sequence:

1. Create feature branch.
2. Implement the narrow phase scope.
3. Run local validation.
4. Ask Senior Reviewer for review.
5. Address findings.
6. Push branch.
7. Open PR with reviewer requested.
8. Merge only after green CI and Senior Reviewer approval.

## Current Phase 1 acceptance criteria

- [ ] `npm run validate` passes locally.
- [ ] GitHub Actions validation workflow exists.
- [ ] Analysis and security docs exist.
- [ ] Initial collection contains only read-only RPCs.
- [ ] Senior Reviewer has reviewed the diff.
- [ ] PR is created against `main`.

## Phase 2 implementation note

Phase 2 keeps PR scope intentionally small: read-only JSON-RPC only, no wallet, send, admin, REST, ZMQ, or Docker/regtest orchestration. Newman is installed as a dev dependency and wired through `npm run test:newman` so contributors can run the collection against an already-running Bitcoin Core RPC endpoint.

The current collection covers low-risk read-only control, blockchain, and network calls. Each request includes Newman tests for HTTP success and successful JSON-RPC shape (`id`, `result`, and `error: null`).


## Phase 2 dependency gate

Phase 2 CI must install dependencies with `npm ci --ignore-scripts`, verify Newman CLI wiring, and run `npm audit --omit=dev`. Full `npm audit` findings from Newman transitive dev dependencies are tracked as a known development-only risk, not a production dependency risk.
