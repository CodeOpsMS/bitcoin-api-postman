# Security Model

Bitcoin Core JSON-RPC can control node behavior, wallet state, private keys, and funds. This repository therefore uses a conservative, regtest-first model.

## Defaults

- Default environment: `regtest`.
- Default host: `127.0.0.1`.
- Default RPC port: `18443`.
- Mainnet credentials must never be committed.
- Private keys, wallet dumps, seed material, and real cookie files must never be committed.

## Credential handling

Postman environments may contain local placeholder credentials for regtest only. Real credentials belong in local Postman secrets or another local secret manager, never in Git.

## Phase 5 wallet/transaction preparation gate

Phase 5 preparation is limited to documentation, validation gates, and a non-executable collection skeleton for deterministic `regtest` workflows.

Hard rules for this phase:

- No mainnet, signet, testnet, or production wallet operations.
- No executable private-key dump/import, wallet dump/import, wallet passphrase, or wallet encryption requests.
- No executable send/broadcast request until a later Senior Reviewer-approved change.
- Any future broadcast workflow must be regtest-only, disposable, and isolated in a folder named `DESTRUCTIVE REGTEST ONLY`.
- Future wallet names, addresses, transaction IDs, and UTXOs must be generated from local CI/regtest state, never copied from real wallets.

Additional methods that must remain blocked until an explicit future safety review: `sendall`, `importmulti`, `importdescriptors`, and `submitpackage`.

See `docs/phase-5-wallet-transactions-regtest.md` for the detailed staging checklist.

## Risk classes

### Low risk / read-only

Examples:

- `getblockchaininfo`
- `getblockcount`
- `getbestblockhash`
- `getnetworkinfo`
- `getmempoolinfo`
- `getrpcinfo`
- `uptime`

These are allowed in the first functional collection and CI pipeline.

### Requires deterministic regtest data

Examples:

- `getblock`
- `getblockhash`
- `gettxout`
- `getrawtransaction`
- wallet balance/history calls

These should only be added when CI creates the required chain/wallet/transaction state.

### High risk / destructive / sensitive

Examples:

- `send`, `sendmany`, `sendtoaddress`, `sendrawtransaction`
- `dumpprivkey`, `dumpwallet`, `importprivkey`, `importwallet`
- `stop`, `setban`, `disconnectnode`, `pruneblockchain`
- wallet encryption/passphrase calls

Rules:

- Add only after the basic CI pipeline is stable and Senior Reviewer approves the narrow scope.
- Keep in clearly marked folders.
- Test only against disposable regtest data by default.
- Document intent, preconditions, rollback/recovery notes, and teardown/reset steps.

## REST notes

Bitcoin Core REST runs on the same HTTP server/port as RPC and requires `-rest=1`. REST is implemented as a separate collection and must keep local/regtest defaults.

Phase 4 REST rules:

- Use JSON endpoints only.
- Use `GET` only.
- Keep REST URLs under `/rest/` on `127.0.0.1:18443` by default.
- Do not add wallet workflows, transaction-specific REST endpoints, full block transaction details, or mempool transaction-entry listings in Phase 4.
- Avoid high parallelism against REST endpoints.

Known REST-specific risks from Bitcoin Core documentation:

- Too many simultaneous REST connections can exhaust file descriptors and may crash the node.
- A browser running on the same host as a REST-enabled node can leak node tx/block data through prepared local REST URL requests.
- Full block REST responses can be large and contain embedded transaction data; they are excluded from Phase 4 in favor of `notxdetails`.

## ZMQ notes

ZMQ is unauthenticated Pub/Sub. It is not an HTTP API and does not belong in Postman collections. It should be documented separately and exposed only to trusted networks.

Phase 6 documentation covers `rawtx`, `hashtx`, `rawblock`, `hashblock`, and `sequence` notifications. Safe defaults for future examples are local `regtest` and loopback endpoints only. ZMQ can leak transaction timing, transaction identifiers, block timing, and local node activity, so it must not be exposed as a public service.

See `docs/advanced-zmq.md` for the topic overview, subscriber sketch, and future implementation checklist.

## Reviewer requirement

Every PR must be reviewed by the Senior Reviewer before merge. Reviewer should explicitly check:

- no real secrets
- safe defaults
- narrow phase scope
- CI coverage appropriate to the phase
- risky RPCs isolated and documented

## Phase 2 Newman usage

Newman runs must target a local or otherwise controlled Bitcoin Core RPC endpoint. The repository only contains placeholder regtest credentials; pass real credentials at runtime with environment overrides or a local untracked Postman environment. Do not commit RPC cookies, real credentials, wallet identifiers, mainnet endpoints, or private keys.

Phase 2 deliberately excludes wallet, send, admin, REST, ZMQ, and Docker/regtest automation to keep the review surface small and read-only.

## Newman dev dependency audit posture

Newman is used only as a development/test runner. Known audit findings in its transitive development dependency tree do not affect production dependencies (`npm audit --omit=dev` must stay clean), but they should be visible in PR notes and revisited before any always-on service or production runtime adopts Newman.
