import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Migrations directory path
const MIGRATIONS_DIR = join(__dirname, '../../../db/migrations');

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
  
  try {
    const files = await readdir(MIGRATIONS_DIR);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sort alphabetically (001, 002, etc.)
    
    return sqlFiles.filter(f => !applied.includes(f));
  } catch (error) {
    console.error('Error reading migrations directory:', error);
    return [];
  }
}

/**
 * Apply a single migration
 */
async function applyMigration(filename: string): Promise<void> {
  const filepath = join(MIGRATIONS_DIR, filename);
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

