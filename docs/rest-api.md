# Bitcoin Core REST API Notes

Phase 4 adds a separate Postman collection for Bitcoin Core REST endpoints:

- `collections/bitcoin-core-rest.postman_collection.json`
- shared local/regtest environment: `environments/regtest.postman_environment.json`

The REST collection is intentionally separate from JSON-RPC. It is JSON-only, read-only, and uses local `regtest` defaults.

## Source

Current implementation source checked for this phase:

- Bitcoin Core `doc/REST-interface.md` on the `master` branch: <https://github.com/bitcoin/bitcoin/blob/master/doc/REST-interface.md>

Important details from the current REST documentation:

- REST is disabled unless Bitcoin Core is started with `-rest=1`.
- REST runs on the same HTTP server and port as JSON-RPC.
- Default ports are `8332` mainnet, `18332` testnet, `48332` testnet4, `38332` signet, and `18443` regtest.
- The same consistency guarantees as the RPC interface apply.

## Local regtest setup

Start a local regtest node with REST enabled. Example flags:

```bash
bitcoind -regtest -server=1 -rest=1 -rpcbind=127.0.0.1 -rpcallowip=127.0.0.1
```

The shared Postman environment defaults to:

- `protocol=http`
- `host=127.0.0.1`
- `rpc_port=18443`

REST deliberately reuses `rpc_port` because Bitcoin Core serves REST and JSON-RPC from the same HTTP listener.

## Included endpoints

The Phase 4 REST collection includes:

- `GET /rest/chaininfo.json`
- `GET /rest/deploymentinfo.json`
- `GET /rest/blockhashbyheight/{{rest_block_height}}.json`
- `GET /rest/headers/{{rest_block_hash}}.json?count={{rest_headers_count}}`
- `GET /rest/block/notxdetails/{{rest_block_hash}}.json`
- `GET /rest/mempool/info.json`

The default `rest_block_height=0` and `rest_block_hash=0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206` target the regtest genesis block.

## Deliberately excluded from Phase 4

Wallet and transaction-specific REST workflows are out of scope for this phase. The collection therefore does not include:

- `GET /rest/tx/<txid>.*`
- `GET /rest/getutxos/...`
- `GET /rest/spenttxouts/<blockhash>.*`
- `GET /rest/block/<blockhash>.*` full block details
- `GET /rest/mempool/contents.json` transaction-entry listing

Binary and hex variants are also excluded for now; this phase uses only `.json` endpoints.

## Known REST risks

- REST must stay local/regtest-first. Do not expose a REST-enabled node to untrusted networks.
- Bitcoin Core documents a known issue where opening too many simultaneous REST connections can exhaust file descriptors and crash the node. Avoid high parallelism and connection floods.
- Running a web browser on the same host as a REST-enabled node can be a privacy risk. Prepared pages may try to read local REST URLs, exposing node tx/block data.
- Full block responses can be large and include embedded transaction data. They are intentionally excluded from Phase 4; use `block/notxdetails` instead.
