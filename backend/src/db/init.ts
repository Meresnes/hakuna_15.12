import { readdir, readFile, access } from 'fs/promises';
import { constants } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get migrations directory path
 * In Docker/production: /app/db/migrations
 * In dev: ../../../db/migrations (relative to backend/src/db)
 */
function getMigrationsDir(): string {
  // Use environment variable if set
  if (process.env.MIGRATIONS_DIR) {
    return process.env.MIGRATIONS_DIR;
  }
  
  // In production (Docker), always use absolute path
  if (process.env.NODE_ENV === 'production') {
    return '/app/db/migrations';
  }
  
  // In dev, use relative path
  return join(__dirname, '../../../db/migrations');
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
  const migrationsDir = getMigrationsDir();
  
  // Check if migrations directory exists
  try {
    await access(migrationsDir, constants.F_OK);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      throw new Error(
        `Migrations directory not found: ${migrationsDir}. ` +
        `Please ensure the migrations directory exists and is accessible.`
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
  const migrationsDir = getMigrationsDir();
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
  const migrationsDir = getMigrationsDir();
  console.info('🔄 Running database migrations...');
  console.info(`📁 Migrations directory: ${migrationsDir}`);
  console.info(`📁 __dirname: ${__dirname}`);
  console.info(`📁 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  
  await createMigrationsTable();
  
  const pending = await getPendingMigrations();
  
  if (pending.length === 0) {
    console.info('✅ No pending migrations');
    return;
  }
  
  console.info(`📋 Found ${pending.length} pending migration(s)`);
  
  for (const migration of pending) {
    await applyMigration(migration);
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

