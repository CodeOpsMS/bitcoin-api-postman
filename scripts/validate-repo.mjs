import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'README.md',
  'docs/analysis-and-plan.md',
  'docs/security.md',
  'collections/bitcoin-core-rpc.postman_collection.json',
  'environments/regtest.postman_environment.json'
];
const filesToSecretScan = [
  ...requiredFiles,
  'package.json',
  'scripts/validate-repo.mjs',
  '.github/workflows/validate.yml'
];

const allowedReadOnlyRpcMethods = new Set([
  'getbestblockhash',
  'getblockchaininfo',
  'getblockcount',
  'getconnectioncount',
  'getdifficulty',
  'getmempoolinfo',
  'getnetworkinfo',
  'getpeerinfo',
  'getrawmempool',
  'getrpcinfo',
  'uptime'
]);

const forbiddenSecretPatterns = [
  /rpcpassword\s*=/i,
  /rpcuser\s*=/i,
  /mainnet[-_ ]?password/i,
  /changeme[-_ ]?password/i,
  /walletpassphrase\s*[:=]/i,
  /dumpprivkey\s*[:=]/i,
  /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/
];

const errors = [];

function readText(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    errors.push(`${file}: invalid JSON (${error.message})`);
    return null;
  }
}

function collectRequests(items, trail = []) {
  const requests = [];
  if (!Array.isArray(items)) return requests;

  for (const item of items) {
    const itemTrail = [...trail, item.name ?? '<unnamed>'];
    const itemPath = itemTrail.join(' / ');

    if (item.request && Array.isArray(item.item)) {
      errors.push(`${itemPath}: collection item must not be both a request and a folder`);
      continue;
    }

    if (item.request) {
      requests.push({ item, path: itemPath });
    } else if (Array.isArray(item.item)) {
      requests.push(...collectRequests(item.item, itemTrail));
    } else {
      errors.push(`collection item has neither request nor children: ${itemPath}`);
    }
  }

  return requests;
}

function authValue(request, key) {
  const basic = request.auth?.basic;
  if (!Array.isArray(basic)) return undefined;
  return basic.find((entry) => entry.key === key)?.value;
}

function validateRpcRequest(item, requestPath) {
  const request = item.request;

  if (request.method !== 'POST') {
    errors.push(`${requestPath}: RPC request method must be POST`);
  }

  if (request.auth?.type !== 'basic') {
    errors.push(`${requestPath}: RPC request auth type must be basic`);
  }
  if (authValue(request, 'username') !== '{{rpc_user}}') {
    errors.push(`${requestPath}: RPC request must use {{rpc_user}} basic auth username`);
  }
  if (authValue(request, 'password') !== '{{rpc_password}}') {
    errors.push(`${requestPath}: RPC request must use {{rpc_password}} basic auth password`);
  }

  const rawUrl = request.url?.raw;
  if (rawUrl !== '{{protocol}}://{{host}}:{{rpc_port}}/') {
    errors.push(`${requestPath}: RPC request URL must use protocol/host/rpc_port environment variables`);
  }

  if (request.body?.mode !== 'raw' || typeof request.body.raw !== 'string') {
    errors.push(`${requestPath}: RPC request body must be raw JSON`);
    return;
  }

  let rpcBody;
  try {
    rpcBody = JSON.parse(request.body.raw);
  } catch (error) {
    errors.push(`${requestPath}: RPC request body is not valid JSON (${error.message})`);
    return;
  }

  if (rpcBody.jsonrpc !== '1.0') {
    errors.push(`${requestPath}: RPC body jsonrpc must be "1.0"`);
  }
  if (rpcBody.id !== '{{request_id}}') {
    errors.push(`${requestPath}: RPC body id must use {{request_id}}`);
  }
  if (!allowedReadOnlyRpcMethods.has(rpcBody.method)) {
    errors.push(`${requestPath}: RPC method is not in the Phase 1 read-only allowlist: ${rpcBody.method}`);
  }
  if (!Array.isArray(rpcBody.params)) {
    errors.push(`${requestPath}: RPC params must be an array`);
  }
}

function validateNoObviousSecrets() {
  for (const file of filesToSecretScan) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) continue;
    const text = readText(file);
    for (const pattern of forbiddenSecretPatterns) {
      if (pattern.test(text)) {
        errors.push(`${file}: contains forbidden secret-like pattern ${pattern}`);
      }
    }
  }
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    errors.push(`missing required file: ${file}`);
  }
}

const collection = readJson('collections/bitcoin-core-rpc.postman_collection.json');
if (collection) {
  if (collection.info?.schema !== 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json') {
    errors.push('RPC collection must use Postman Collection schema v2.1.0');
  }
  if (!Array.isArray(collection.item) || collection.item.length === 0) {
    errors.push('RPC collection must contain at least one folder/request');
  }

  const requests = collectRequests(collection.item);
  if (requests.length === 0) {
    errors.push('RPC collection must contain at least one request');
  }
  for (const request of requests) {
    validateRpcRequest(request.item, request.path);
  }
}

const environment = readJson('environments/regtest.postman_environment.json');
if (environment) {
  if (!Array.isArray(environment.values)) {
    errors.push('Regtest environment must contain a values array');
  } else {
    const names = new Map(environment.values.map((value) => [value.key, value]));
    for (const key of ['protocol', 'host', 'rpc_port', 'rpc_user', 'rpc_password']) {
      if (!names.has(key)) errors.push(`Regtest environment missing variable: ${key}`);
    }

    const expectedDefaults = {
      protocol: 'http',
      host: '127.0.0.1',
      rpc_port: '18443'
    };
    for (const [key, value] of Object.entries(expectedDefaults)) {
      if (names.get(key)?.value !== value) {
        errors.push(`Regtest environment ${key} must default to ${value}`);
      }
    }
    if (names.get('rpc_password')?.type !== 'secret') {
      errors.push('Regtest environment rpc_password must be marked as type "secret"');
    }
  }
}

validateNoObviousSecrets();

if (errors.length > 0) {
  console.error('Validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Repository validation passed.');
