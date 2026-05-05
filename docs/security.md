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

- Add only after the basic CI pipeline is stable.
- Keep in clearly marked folders.
- Test only against regtest by default.
- Document intent, preconditions, and rollback/recovery notes.

## REST notes

Bitcoin Core REST runs on the same HTTP server/port as RPC and requires `-rest=1`. REST should be implemented as a separate collection. Avoid high parallelism against REST endpoints.

## ZMQ notes

ZMQ is unauthenticated Pub/Sub. It is not an HTTP API and does not belong in Postman collections. It should be documented separately and exposed only to trusted networks.

## Reviewer requirement

Every PR must be reviewed by the Senior Reviewer before merge. Reviewer should explicitly check:

- no real secrets
- safe defaults
- narrow phase scope
- CI coverage appropriate to the phase
- risky RPCs isolated and documented
