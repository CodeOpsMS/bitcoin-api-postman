# Phase 6 Advanced Topics Roadmap

Phase 6 is a planning and documentation phase for advanced Bitcoin Core workflows. No item in this roadmap should be implemented as a default executable mainnet workflow. Each future implementation requires its own narrow branch, local validation, CI evidence, and Senior Reviewer approval.

## Guardrails

- Keep defaults on `regtest`.
- Keep RPC, REST, ZMQ, and advanced transaction examples separated.
- Prefer read-only inspection before construction, signing, or submission.
- Do not commit secrets, private keys, wallet dumps, real descriptors with private material, or cookie files.
- Avoid `sendrawtransaction` and wallet send calls unless the workflow is deterministic regtest-only and explicitly reviewed.

## ZMQ documentation track

Initial deliverables in this branch:

- Explain ZMQ as Pub/Sub rather than HTTP API.
- Document topics: `rawtx`, `hashtx`, `rawblock`, `hashblock`, and `sequence`.
- Add security posture for unauthenticated local sockets.
- Provide a non-CI subscriber sketch that logs metadata only.

Future implementation gates:

1. Add a regtest-only ZMQ fixture with local loopback endpoints.
2. Add a subscriber test that proves notification receipt without external networking.
3. Add dropped-message counter checks and reconnect notes.
4. Keep the subscriber outside Postman collections.

## PSBT roadmap

PSBT workflows should progress from inspection to construction only after deterministic test fixtures exist.

Suggested sequence:

1. Read-only/inspection:
   - `decodepsbt`
   - `analyzepsbt`
2. Deterministic construction on regtest:
   - `createpsbt`
   - `walletcreatefundedpsbt` only with a disposable CI wallet.
3. Combination/update/finalization:
   - `combinepsbt`
   - `joinpsbts`
   - `utxoupdatepsbt`
   - `walletprocesspsbt`
   - `finalizepsbt`
4. Broadcast boundary:
   - Use `testmempoolaccept` first.
   - Add `sendrawtransaction` only in a clearly marked regtest-only folder with reviewer approval.

Risks to document before implementation:

- Fee selection mistakes.
- UTXO reuse and privacy leakage.
- Signing with real private keys.
- Accidentally targeting non-regtest networks.

## Descriptor roadmap

Descriptor examples should avoid private-key material by default.

Suggested sequence:

1. Descriptor inspection:
   - `getdescriptorinfo`
   - checksum validation examples.
2. Address derivation from public descriptors:
   - `deriveaddresses` with documented range behavior.
3. Wallet descriptor import planning:
   - `importdescriptors` only for disposable regtest wallets.
   - separate watch-only from signing-capable examples.
4. Descriptor wallet lifecycle:
   - create/load/unload disposable descriptor wallets only after wallet CI infrastructure is stable.

Risks to document before implementation:

- Private descriptors expose spend authority.
- Ranges and timestamps affect rescans.
- Imports can mutate wallet state and trigger expensive rescans.

## Raw transaction roadmap

Raw transaction examples are powerful and should stay behind explicit regtest-only gates.

Suggested sequence:

1. Read-only decoding:
   - `decoderawtransaction`
   - `decodescript`
2. Unsigned transaction construction:
   - `createrawtransaction` from deterministic regtest UTXOs.
3. Funding and signing boundary:
   - Prefer PSBT workflows where possible.
   - If raw signing is needed, use `signrawtransactionwithwallet` only with disposable CI wallets.
   - Avoid `signrawtransactionwithkey` unless keys are generated ephemerally inside the test and never committed.
4. Acceptance and broadcast boundary:
   - `testmempoolaccept` before any broadcast.
   - `sendrawtransaction` only in a quarantined regtest-only workflow.

Risks to document before implementation:

- Irreversible broadcast on public networks.
- Fee, change, and locktime mistakes.
- Private-key exposure through examples or logs.
- Mempool policy changes across Bitcoin Core versions.

## Review checklist for future advanced PRs

- [ ] The PR scope covers one advanced topic only.
- [ ] Defaults are `regtest` and loopback-only where networking is involved.
- [ ] Any wallet or transaction mutation is isolated and documented.
- [ ] No committed secrets or private-key material.
- [ ] CI proves the intended behavior or the PR is explicitly docs-only.
- [ ] Senior Reviewer approves the safety model before merge.
