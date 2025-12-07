import { readdir, readFile, access } from 'fs/promises';
import { constants } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get migrations directory path
 * In Docker/production: /app/db/migrations (or MIGRATIONS_DIR env var)
 * In dev: ../../../db/migrations (relative to backend/src/db)
 */
async function getMigrationsDir(): Promise<string> {
  // Use environment variable if set (highest priority)
  if (process.env.MIGRATIONS_DIR) {
    return process.env.MIGRATIONS_DIR;
  }
  
  // In production (Docker), always use absolute path - no fallback
  if (process.env.NODE_ENV === 'production') {
    const productionPath = '/app/db/migrations';
    // Verify the path exists in production
    try {
      await access(productionPath, constants.F_OK);
      return productionPath;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      throw new Error(
        `Production migrations directory not found: ${productionPath}. ` +
        `Please ensure MIGRATIONS_DIR is set or the directory exists. ` +
        `Error: ${err.message}`
      );
    }
  }
  
  // Development: use relative path
  const relativePath = join(__dirname, '../../../db/migrations');
  return relativePath;
}

interface MigrationRecord {
  name: string;
  applied_at: Date;
}

/**
 * Create migrations tracking table if it doesn't exist
 */
async function createMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
}

/**
 * Get list of already applied migrations
 */
async function getAppliedMigrations(): Promise<string[]> {
  const result = await pool.query<MigrationRecord>(
    'SELECT name FROM _migrations ORDER BY applied_at'
  );
  return result.rows.map(row => row.name);
}

/**
 * Get list of pending migrations
 */
async function getPendingMigrations(): Promise<string[]> {
  const applied = await getAppliedMigrations();
  const migrationsDir = await getMigrationsDir();
  
  console.info(`🔍 Checking migrations directory: ${migrationsDir}`);
  
  // Check if migrations directory exists
  try {
    await access(migrationsDir, constants.F_OK);
    console.info(`✅ Migrations directory exists: ${migrationsDir}`);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      throw new Error(
        `Migrations directory not found: ${migrationsDir}. ` +
        `Please ensure the migrations directory exists and is accessible. ` +
        `NODE_ENV: ${process.env.NODE_ENV || 'not set'}, ` +
        `MIGRATIONS_DIR: ${process.env.MIGRATIONS_DIR || 'not set'}`
      );
    }
    throw new Error(
      `Cannot access migrations directory ${migrationsDir}: ${err.message}`
    );
  }
  
  try {
    const files = await readdir(migrationsDir);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sort alphabetically (001, 002, etc.)
    
    console.info(`📁 Found ${sqlFiles.length} migration file(s) in ${migrationsDir}`);
    
    return sqlFiles.filter(f => !applied.includes(f));
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    throw new Error(
      `Error reading migrations directory ${migrationsDir}: ${err.message}`
    );
  }
}

/**
 * Apply a single migration
 */
async function applyMigration(filename: string): Promise<void> {
  const migrationsDir = await getMigrationsDir();
  const filepath = join(migrationsDir, filename);
  const sql = await readFile(filepath, 'utf-8');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Execute migration SQL
    await client.query(sql);
    
    // Record migration
    await client.query(
      'INSERT INTO _migrations (name) VALUES ($1)',
      [filename]
    );
    
    await client.query('COMMIT');
    console.info(`✅ Applied migration: ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<void> {
  console.info('🔄 Running database migrations...');
  console.info('📋 Environment variables:');
  console.info(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.info(`   MIGRATIONS_DIR: ${process.env.MIGRATIONS_DIR || 'not set'}`);
  console.info(`   __dirname: ${__dirname}`);
  
  // In production, warn if MIGRATIONS_DIR is not set (but we'll use default /app/db/migrations)
  if (process.env.NODE_ENV === 'production' && !process.env.MIGRATIONS_DIR) {
    console.warn('⚠️  MIGRATIONS_DIR not set in production, using default: /app/db/migrations');
  }
  
  await createMigrationsTable();
  
  let pending: string[];
  try {
    pending = await getPendingMigrations();
  } catch (error) {
    const err = error as Error;
    console.error(`❌ Failed to get pending migrations: ${err.message}`);
    throw error;
  }
  
  if (pending.length === 0) {
    console.info('✅ No pending migrations');
    return;
  }
  
  console.info(`📋 Found ${pending.length} pending migration(s)`);
  
  for (const migration of pending) {
    try {
      await applyMigration(migration);
    } catch (error) {
      const err = error as Error;
      console.error(`❌ Failed to apply migration ${migration}: ${err.message}`);
      throw error;
    }
  }
  
  console.info('✅ All migrations applied successfully');
}

/**
 * Initialize database - run migrations and verify connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await runMigrations();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export default initializeDatabase;

