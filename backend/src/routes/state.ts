import { Router, type Request, type Response } from 'express';
import { getAppState } from '../db/queries.js';

const router = Router();

/**
 * GET /api/state
 * Returns current application state
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { counts, total, last50, settings } = await getAppState();

    const target = parseInt(settings['target_count'] ?? '110', 10);
    const brightnessMin = parseFloat(settings['brightness_min'] ?? '0.1');
    const brightnessMax = parseFloat(settings['brightness_max'] ?? '1.10');
    const code = settings['code'] ?? '8375';

    res.json({
      totalCounts: counts,
      total,
      last50: last50.map(vote => ({
        id: vote.id,
        name: vote.name,
        choice: vote.choice,
        created_at: vote.created_at.toISOString(),
      })),
      target,
      brightnessRange: {
        min: brightnessMin,
        max: brightnessMax,
      },
      code,
    });
  } catch (error) {
    console.error('Error fetching state:', error);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});

export default router;

