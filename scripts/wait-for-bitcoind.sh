#!/usr/bin/env sh
set -eu

RPC_URL="${RPC_URL:-http://127.0.0.1:18443/}"
RPC_USER="${RPC_USER:-bitcoin}"
RPC_PASSWORD="${RPC_PASSWORD:-bitcoin}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-60}"

start_ts=$(date +%s)
while :; do
  if curl --fail --silent --show-error \
    --user "${RPC_USER}:${RPC_PASSWORD}" \
    --header 'content-type: text/plain;' \
    --data-binary '{"jsonrpc":"1.0","id":"wait-for-bitcoind","method":"getblockchaininfo","params":[]}' \
    "${RPC_URL}" >/dev/null 2>&1; then
    echo "bitcoind RPC is ready at ${RPC_URL}"
    exit 0
  fi

  now_ts=$(date +%s)
  if [ $((now_ts - start_ts)) -ge "${TIMEOUT_SECONDS}" ]; then
    echo "Timed out waiting for bitcoind RPC at ${RPC_URL}" >&2
    exit 1
  fi
  sleep 2
done
