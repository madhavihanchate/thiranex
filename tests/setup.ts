import { beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Set env BEFORE any app module imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3099';
process.env.DATABASE_PATH = './data/test.db';
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret-long-enough-for-jwt-validation-minimum-32-chars';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret-long-enough-for-jwt-validation-minimum-32-chars';
process.env.ACCESS_TOKEN_EXPIRY = '15m';
process.env.REFRESH_TOKEN_EXPIRY = '7d';
process.env.ENABLE_WEBSOCKETS = 'false';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.RATE_LIMIT_AUTH_MAX = '100';
process.env.RATE_LIMIT_AUTH_WINDOW_MS = '60000';

import { initDatabase, closeDb } from '../src/config/database.js';
import { migrate } from '../src/utils/migrate.js';

beforeAll(async () => {
  await initDatabase();
  migrate();
});

afterAll(() => {
  closeDb();
  // Clean up test database
  try { fs.unlinkSync('./data/test.db'); } catch {}
  try { fs.unlinkSync('./data/test.db-wal'); } catch {}
  try { fs.unlinkSync('./data/test.db-shm'); } catch {}
  try { fs.rmdirSync('./data', { recursive: false }); } catch {}
});
