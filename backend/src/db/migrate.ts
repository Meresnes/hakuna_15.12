/**
 * Migration runner script
 * Run with: npm run migrate
 */
import { runMigrations } from './init.js';
import pool from './pool.js';

async function main(): Promise<void> {
  try {
    console.info('🚀 Starting migration runner...');
    await runMigrations();
    console.info('✅ Migration runner completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

void main();

