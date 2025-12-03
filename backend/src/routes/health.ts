import { Router, type Request, type Response } from 'express';
import pool from '../db/pool.js';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

export default router;

