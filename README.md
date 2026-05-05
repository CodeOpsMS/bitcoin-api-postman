# Bitcoin Core API Postman

A curated Postman workspace for exploring and testing Bitcoin Core's JSON-RPC interface, built with a `regtest`-first workflow and CI validation.

> Status: Phase 3 regtest integration. The repository contains a safe read-only JSON-RPC collection, Newman wiring, and a disposable Dockerized Bitcoin Core regtest node for read-only RPC readiness checks. Wallet and send-money workflows stay out of the default path.

## Goals

- Provide maintainable Postman collections for Bitcoin Core JSON-RPC. REST is intentionally out of scope until a later phase.
- Keep the default workflow safe by using `regtest` first.
- Validate collections and environments in CI before adding risky or advanced requests.
- Document ZMQ separately because it is a Pub/Sub notification interface, not an HTTP API.
- Require Senior Reviewer approval for every phase before merging.

## Repository layout

```text
collections/      Postman collections
  bitcoin-core-rpc.postman_collection.json
environments/    Postman environment templates
  regtest.postman_environment.json
docs/            Analysis, security notes, phase plan, API notes
scripts/         Local validation and regtest readiness helpers
docker/          Bitcoin Core regtest configuration
.github/         GitHub Actions workflows
```

## Current validation

Install dependencies first:

```bash
npm install
```

Run static repository validation:

```bash
npm run validate
```

## Local regtest node

```bash
docker compose up -d bitcoind
./scripts/wait-for-bitcoind.sh
./scripts/bootstrap-regtest-readonly.sh
```

See [docs/regtest-docker.md](docs/regtest-docker.md) for reset instructions and the safety boundaries for any future block generation.

The current pipeline validates:

- JSON syntax for collections and environments
- Postman Collection v2.1 schema marker and request presence
- Phase 1 read-only RPC method allowlist
- raw JSON-RPC request bodies
- POST-only RPC requests
- basic auth variables via `{{rpc_user}}` / `{{rpc_password}}`
- regtest-first environment defaults
- required repository files
- no obvious hardcoded RPC credentials
- Newman dependency and `test:newman` script wiring
- per-request Newman tests for HTTP 200, matching JSON-RPC id, and `error: null`
- Docker regtest integration files and read-only helper scripts
- Docker Compose config and read-only regtest smoke checks in CI

## Newman read-only RPC run

`test:newman` runs the collection against the configured environment. It does not provision Docker/regtest by itself; use the local regtest node commands above when you want a disposable Bitcoin Core RPC endpoint.

Default target: `http://127.0.0.1:18443/` with the placeholder `bitcoin` / `bitcoin` RPC credentials from `environments/regtest.postman_environment.json`. Override values at runtime for an already-running `bitcoind`:

```bash
npm run test:newman -- \
  --env-var protocol=http \
  --env-var host=127.0.0.1 \
  --env-var rpc_port=18443 \
  --env-var rpc_user=<your-rpc-user> \
  --env-var rpc_password=<your-rpc-password>
```

Keep credentials local. Do not commit real RPC users, passwords, cookie files, wallet names, or mainnet endpoints.

## Development rules

1. Work happens on branches, never directly on `main`.
2. Each phase gets its own small PR.
3. CI must be green before expanding scope.
4. A Senior Reviewer must review every PR.
5. Mainnet credentials and private keys must never be committed.

## Sources

Primary planning source:

- Bitcoin developer RPC reference: <https://developer.bitcoin.org/reference/rpc/>

Additional implementation references will be used phase-by-phase, especially current Bitcoin Core documentation for REST, ZMQ, and version-specific RPC changes.

## Known Phase 2 dev dependency audit note

Phase 2 uses Newman as a development-only Postman runner. `npm audit` currently reports vulnerabilities in Newman transitive development dependencies. This is accepted temporarily for Phase 2 because `npm audit --omit=dev` is clean, Newman is not a production runtime dependency, and CI verifies the production audit separately. The full dev audit should be revisited when choosing a long-term collection runner.
