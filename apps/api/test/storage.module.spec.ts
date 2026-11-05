import { describe, it, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageModule } from '../dist/storage/storage.module.js';
import { STORAGE_PROVIDER_TOKEN } from '../dist/storage/storage-provider.interface.js';
import { DisabledStorageProvider } from '../dist/storage/providers/disabled-storage.provider.js';
import { CloudflareR2Provider } from '../dist/storage/providers/r2-storage.provider.js';
import { LocalStorageProvider } from '../dist/storage/providers/local-storage.provider.js';
import { HttpStatus } from '@nestjs/common';

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  // Deep clone a fresh copy before each test to eliminate cross-test leaks
  originalEnv = { ...process.env };
});

afterEach(() => {
  // Restore environment variables exactly as they were prior to the test
  process.env = { ...originalEnv };
});

describe('Phase 2 — NestJS StorageModule Factory & Provider Verification', () => {
  // Test 1: Production with missing R2 credentials -> DisabledStorageProvider (HTTP 503)
  it('1. Production with missing R2 credentials selects DisabledStorageProvider and rejects upload with 503', async () => {
    process.env.NODE_ENV = 'production';
    process.env.STORAGE_PROVIDER = 'r2';
    delete process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    delete process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    delete process.env.CLOUDFLARE_R2_BUCKET;

    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
    }).compile();

    const storage = module.get(STORAGE_PROVIDER_TOKEN);
    assert.ok(storage instanceof DisabledStorageProvider, 'Must be instance of DisabledStorageProvider');

    let threw503 = false;
    try {
      await storage.uploadFile(Buffer.from('clinical test data'), 'report.pdf', 'application/pdf');
    } catch (err: any) {
      if (err.getStatus?.() === HttpStatus.SERVICE_UNAVAILABLE) {
        threw503 = true;
      }
    }
    assert.strictEqual(threw503, true, 'uploadFile must throw HTTP 503 Service Unavailable');
  });

  // Test 2: Production with valid R2 configuration -> CloudflareR2Provider (Configuration verified, not claiming bucket connectivity)
  it('2. Production with valid R2 configuration selects CloudflareR2Provider', async () => {
    process.env.NODE_ENV = 'production';
    process.env.STORAGE_PROVIDER = 'r2';
    process.env.CLOUDFLARE_R2_ACCOUNT_ID = 'test-cf-account-id';
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = 'test-cf-access-key';
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY = 'test-cf-secret-key-12345';
    process.env.CLOUDFLARE_R2_BUCKET = 'medinexa-test-vault';

    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
    }).compile();

    const storage = module.get(STORAGE_PROVIDER_TOKEN);
    assert.ok(storage instanceof CloudflareR2Provider, 'Must be instance of CloudflareR2Provider');
  });

  // Test 3: Production with S3 selected -> DisabledStorageProvider (HTTP 503)
  it('3. Production with S3 selected selects DisabledStorageProvider and rejects upload with 503', async () => {
    process.env.NODE_ENV = 'production';
    process.env.STORAGE_PROVIDER = 's3';

    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
    }).compile();

    const storage = module.get(STORAGE_PROVIDER_TOKEN);
    assert.ok(storage instanceof DisabledStorageProvider, 'Must be instance of DisabledStorageProvider');

    let threw503 = false;
    try {
      await storage.uploadFile(Buffer.from('clinical test data'), 'report.pdf', 'application/pdf');
    } catch (err: any) {
      if (err.getStatus?.() === HttpStatus.SERVICE_UNAVAILABLE) {
        threw503 = true;
      }
    }
    assert.strictEqual(threw503, true, 'uploadFile must throw HTTP 503 Service Unavailable');
  });

  // Test 4: Production with provider unset -> DisabledStorageProvider (HTTP 503)
  it('4. Production with provider unset selects DisabledStorageProvider and rejects upload with 503', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.STORAGE_PROVIDER;

    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
    }).compile();

    const storage = module.get(STORAGE_PROVIDER_TOKEN);
    assert.ok(storage instanceof DisabledStorageProvider, 'Must be instance of DisabledStorageProvider');

    let threw503 = false;
    try {
      await storage.uploadFile(Buffer.from('clinical test data'), 'report.pdf', 'application/pdf');
    } catch (err: any) {
      if (err.getStatus?.() === HttpStatus.SERVICE_UNAVAILABLE) {
        threw503 = true;
      }
    }
    assert.strictEqual(threw503, true, 'uploadFile must throw HTTP 503 Service Unavailable');
  });

  // Test 5: Production must never select local storage
  it('5. Production must never select LocalStorageProvider even if STORAGE_PROVIDER=local or invalid', async () => {
    process.env.NODE_ENV = 'production';
    process.env.STORAGE_PROVIDER = 'local';

    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
    }).compile();

    const storage = module.get(STORAGE_PROVIDER_TOKEN);
    assert.strictEqual(storage instanceof LocalStorageProvider, false, 'Production must NEVER select LocalStorageProvider');
    assert.ok(storage instanceof DisabledStorageProvider, 'Must fall back safely to DisabledStorageProvider');
  });

  // Test 6: Development with provider unset selects local storage
  it('6. Development with provider unset selects LocalStorageProvider', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.STORAGE_PROVIDER;

    const module: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
    }).compile();

    const storage = module.get(STORAGE_PROVIDER_TOKEN);
    assert.ok(storage instanceof LocalStorageProvider, 'Development mode must select LocalStorageProvider');
  });
});
