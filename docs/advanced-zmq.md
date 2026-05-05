# Phase 6 Advanced Topic: Bitcoin Core ZMQ

## Purpose and scope

Bitcoin Core ZMQ is a notification interface for node events. It is **not** JSON-RPC, not REST, and not suitable for Postman collections. Phase 6 should treat ZMQ as documentation, local examples, and future test planning only until a reviewer approves a narrow implementation PR.

This document intentionally avoids executable mainnet workflows, private-key handling, transaction broadcast automation, and production deployment instructions. All examples assume local `regtest` experimentation.

## How ZMQ fits beside RPC and REST

- JSON-RPC is request/response over Bitcoin Core's HTTP server.
- REST is HTTP resource access, also served by Bitcoin Core when enabled.
- ZMQ is Pub/Sub. Subscribers receive messages when the node publishes them; they do not authenticate or call methods.

A typical local lab setup enables one or more notification endpoints on loopback only, for example conceptually:

```text
# regtest-only illustration; keep endpoints bound to localhost
zmqpubrawtx=tcp://127.0.0.1:28332
zmqpubhashtx=tcp://127.0.0.1:28332
zmqpubrawblock=tcp://127.0.0.1:28333
zmqpubhashblock=tcp://127.0.0.1:28333
zmqpubsequence=tcp://127.0.0.1:28334
```

Use the current Bitcoin Core `doc/zmq.md` and release-specific help as the implementation source of truth before turning this plan into runnable CI.

## Notification topics

Bitcoin Core publishes multipart ZMQ messages. Subscribers should expect:

1. topic name
2. topic payload
3. per-topic notification counter, encoded as a 32-bit little-endian integer

The counter is useful for detecting dropped messages after reconnects or subscriber backpressure.

### `rawtx`

- Payload: full serialized transaction bytes.
- Use case: local transaction indexing, mempool observers, decode-after-receive tooling.
- Safety note: raw transaction data may reveal wallet activity or local test flow details. Do not expose outside trusted hosts.

### `hashtx`

- Payload: transaction hash bytes.
- Use case: lightweight transaction notification where the subscriber can fetch details separately through safe RPC calls.
- Safety note: still leaks transaction timing and identifiers.

### `rawblock`

- Payload: full serialized block bytes.
- Use case: block parsers, indexers, deterministic regtest block fixture generation.
- Safety note: full blocks can be large; subscribers need backpressure and reconnect handling.

### `hashblock`

- Payload: block hash bytes.
- Use case: lightweight block notification and follow-up read-only RPC/REST retrieval.
- Safety note: safer than `rawblock` for simple observers, but still exposes local node timing.

### `sequence`

- Payload: sequence event data for mempool and chain changes.
- Common labels:
  - `A`: transaction added to mempool.
  - `R`: transaction removed from mempool.
  - `C`: block connected.
  - `D`: block disconnected.
- Use case: tracking mempool ordering and chain connect/disconnect events without polling.
- Safety note: this is advanced operational telemetry. Treat it as trusted-local infrastructure, not as public API output.

## Security model

ZMQ has no Bitcoin Core RPC-style username/password authentication. Anyone who can connect to a published socket can receive its messages.

Required posture for this repository:

- Bind ZMQ endpoints to `127.0.0.1` or another explicitly trusted private interface only.
- Never publish ZMQ sockets directly to the internet.
- Prefer local development and CI on `regtest`.
- Keep ZMQ examples separate from Postman collections.
- Do not include wallet seeds, private keys, passphrases, cookie files, or real node credentials in examples.
- Treat transaction and block notifications as potentially privacy-sensitive metadata.
- Add reconnect, dropped-message detection, resource limits, and logging guidance before any CI subscriber is introduced.

## Local subscriber sketch

The following is a sketch, not a committed runtime dependency or CI workflow. It demonstrates the shape of a safe local subscriber that only logs metadata.

```js
// regtest-only sketch. Requires a local ZMQ client package if copied into a sandbox.
// Do not connect to public or mainnet infrastructure from repository examples.

import zmq from 'zeromq';

const endpoint = process.env.BITCOIN_ZMQ_ENDPOINT ?? 'tcp://127.0.0.1:28332';
const topics = ['hashblock', 'hashtx'];

const sock = new zmq.Subscriber();
for (const topic of topics) sock.subscribe(topic);

await sock.connect(endpoint);
console.log(`listening on ${endpoint} for ${topics.join(', ')}`);

for await (const [topicFrame, payload, counterFrame] of sock) {
  const topic = topicFrame.toString('utf8');
  const counter = counterFrame?.length >= 4 ? counterFrame.readUInt32LE(0) : undefined;
  console.log({
    topic,
    bytes: payload.length,
    hashHex: topic.startsWith('hash') ? Buffer.from(payload).reverse().toString('hex') : undefined,
    counter
  });
}
```

Future examples may add decode helpers for `rawtx` and `rawblock`, but only on deterministic regtest fixtures and only after the reviewer approves the scope.

## Phase 6 acceptance criteria for a future ZMQ PR

- ZMQ docs stay separate from RPC/REST collections.
- Examples default to loopback `regtest` endpoints.
- CI, if added, starts a local regtest node and tears it down cleanly.
- Subscriber tests detect at least one block or transaction notification without broadcasting on mainnet-like networks.
- Documentation explains dropped-message counters, reconnect behavior, and privacy limits.
- Senior Reviewer confirms the PR does not introduce risky executable workflows.
