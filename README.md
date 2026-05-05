# Bitcoin Core API Postman

A curated Postman workspace for exploring and testing Bitcoin Core's JSON-RPC and REST interfaces, built with a `regtest`-first workflow and CI validation.

> Status: Phase 1 foundation. The repository structure, source analysis, safety model, and validation pipeline are being established before advanced Bitcoin workflows are added.

## Goals

- Provide maintainable Postman collections for Bitcoin Core JSON-RPC and REST.
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
scripts/         Local validation and future test helpers
.github/         GitHub Actions workflows
```

## Current validation

```bash
npm run validate
```

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
