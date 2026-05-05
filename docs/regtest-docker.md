# Regtest Docker integration

Phase 3 adds a disposable Bitcoin Core `regtest` node for local integration and CI smoke checks.
The default flow is intentionally read-only: it waits for node readiness and calls safe RPCs only.
No wallet creation, private-key export, or send-money workflow is part of this phase.

## Start the node

```bash
docker compose up -d bitcoind
./scripts/wait-for-bitcoind.sh
./scripts/bootstrap-regtest-readonly.sh
```

The Postman regtest environment matches the compose defaults:

- URL: `http://127.0.0.1:18443/`
- user: `bitcoin`
- local regtest password: `bitcoin`

These credentials are deterministic and only for the disposable local regtest container.
The committed Bitcoin Core config uses `rpcauth`; it does not contain an `rpcpassword` value.

## Stop and reset

```bash
docker compose down
docker compose down -v  # also removes the disposable regtest chain data
```

## Safe block generation, if a later test needs blocks

Prefer read-only checks for this phase. If a future integration test needs spendable regtest blocks,
create a throwaway address in an isolated regtest-only context and mine to it with
`generatetoaddress`. Keep that workflow separate from the default CI path and document why it is needed.
