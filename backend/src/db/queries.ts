import pool from './pool.js';

// Types
export interface Vote {
  id: string;
  name: string;
  choice: number;
  created_at: Date;
}

export interface VoteCounts {
  1: number;
  2: number;
  3: number;
  4: number;
}

export interface Setting {
  key: string;
  value: string;
}

/**
 * Get all settings from database
 */
export async function getSettings(): Promise<Record<string, string>> {
  const result = await pool.query<Setting>('SELECT key, value FROM settings');
  const settings: Record<string, string> = {};
  
  for (const row of result.rows) {
    settings[row.key] = row.value;
  }
  
  return settings;
}

/**
 * Get a single setting by key
 */
export async function getSetting(key: string): Promise<string | null> {
  const result = await pool.query<Setting>(
    'SELECT value FROM settings WHERE key = $1',
    [key]
  );
  
  return result.rows[0]?.value ?? null;
}

/**
 * Update a setting value
 */
export async function updateSetting(key: string, value: string): Promise<void> {
  await pool.query(
    'INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
    [key, value]
  );
}

/**
 * Get vote counts grouped by choice
 */
export async function getVoteCounts(): Promise<VoteCounts> {
  const result = await pool.query<{ choice: number; count: string }>(
    'SELECT choice, COUNT(*) as count FROM votes GROUP BY choice'
  );
  
  const counts: VoteCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  
  for (const row of result.rows) {
    const choice = row.choice as keyof VoteCounts;
    counts[choice] = parseInt(row.count, 10);
  }
  
  return counts;
}

/**
 * Get total vote count
 */
export async function getTotalVotes(): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT COUNT(*) as count FROM votes'
  );
  
  return parseInt(result.rows[0]?.count ?? '0', 10);
}

/**
 * Get last N votes
 */
export async function getLastVotes(limit: number = 50): Promise<Vote[]> {
  const result = await pool.query<Vote>(
    'SELECT id, name, choice, created_at FROM votes ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  
  return result.rows;
}

/**
 * Insert a new vote
 */
export async function insertVote(name: string, choice: number): Promise<Vote> {
  const result = await pool.query<Vote>(
    'INSERT INTO votes (name, choice) VALUES ($1, $2) RETURNING id, name, choice, created_at',
    [name, choice]
  );
  
  const vote = result.rows[0];
  if (!vote) {
    throw new Error('Failed to insert vote');
  }
  
  return vote;
}

/**
 * Get all votes (for export)
 */
export async function getAllVotes(): Promise<Vote[]> {
  const result = await pool.query<Vote>(
    'SELECT id, name, choice, created_at FROM votes ORDER BY created_at DESC'
  );
  
  return result.rows;
}

/**
 * Delete all votes (reset)
 */
export async function deleteAllVotes(): Promise<number> {
  const result = await pool.query('DELETE FROM votes');
  return result.rowCount ?? 0;
}

/**
 * Get application state (combined query for efficiency)
 */
export async function getAppState(): Promise<{
  counts: VoteCounts;
  total: number;
  last50: Vote[];
  settings: Record<string, string>;
}> {
  const [counts, total, last50, settings] = await Promise.all([
    getVoteCounts(),
    getTotalVotes(),
    getLastVotes(50),
    getSettings(),
  ]);
  
  return { counts, total, last50, settings };
}

