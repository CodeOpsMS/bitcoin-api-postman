#!/usr/bin/env sh
set -eu

RPC_URL="${RPC_URL:-http://127.0.0.1:18443/}"
RPC_USER="${RPC_USER:-bitcoin}"
RPC_PASSWORD="${RPC_PASSWORD:-bitcoin}"

rpc_call() {
  method="$1"
  curl --fail --silent --show-error \
    --user "${RPC_USER}:${RPC_PASSWORD}" \
    --header 'content-type: text/plain;' \
    --data-binary "{\"jsonrpc\":\"1.0\",\"id\":\"bootstrap-regtest\",\"method\":\"${method}\",\"params\":[]}" \
    "${RPC_URL}"
  printf '\n'
}

./scripts/wait-for-bitcoind.sh

# Phase 3 intentionally performs only read-only RPC calls. It proves that the
# node is reachable and ready without creating wallets or sending funds.
rpc_call getblockchaininfo
rpc_call getnetworkinfo
rpc_call getmempoolinfo
