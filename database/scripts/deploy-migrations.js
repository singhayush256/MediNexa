#!/usr/bin/env node
/**
 * Safe, idempotent database migration deployment script for MediNexa.
 * Wraps `prisma migrate deploy` with clear operational logging and
 * diagnostic reporting without exposing sensitive database credentials.
 */

const { spawnSync } = require('child_process');
const path = require('path');

console.log('[MediNexa DB] Starting migration deployment');

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');

// Resolve local Prisma CLI binary without relying on global npx or network downloads
let prismaBin = null;
try {
  const pkgPath = require.resolve('prisma/package.json');
  const binRel = require(pkgPath).bin?.prisma || 'build/index.js';
  prismaBin = path.resolve(path.dirname(pkgPath), binRel);
} catch {
  prismaBin = null;
}

let result;
if (prismaBin) {
  result = spawnSync(process.execPath, [prismaBin, 'migrate', 'deploy', `--schema=${schemaPath}`], {
    stdio: 'inherit',
    env: process.env,
  });
} else {
  // Fallback to npx if direct resolution was unavailable
  const isWin = process.platform === 'win32';
  const npxCmd = isWin ? 'npx.cmd' : 'npx';
  result = spawnSync(npxCmd, ['prisma', 'migrate', 'deploy', `--schema=${schemaPath}`], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
}

if (result.status === 0) {
  console.log('[MediNexa DB] Migration deployment completed');
  process.exit(0);
} else {
  console.error('[MediNexa DB] Migration deployment FAILED');
  if (result.error) {
    console.error('[MediNexa DB] Execution error:', result.error.message);
  }
  process.exit(result.status || 1);
}
