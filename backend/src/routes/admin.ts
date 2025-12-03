import { Router, type Request, type Response } from 'express';
import { getLastVotes, getAllVotes, deleteAllVotes } from '../db/queries.js';
import adminAuth from '../middleware/adminAuth.js';

const router = Router();

// Apply admin authentication to all routes
router.use(adminAuth);

/**
 * GET /api/admin/last50
 * Get last 50 votes
 */
router.get('/last50', async (_req: Request, res: Response) => {
  try {
    const votes = await getLastVotes(50);

    res.json(
      votes.map(vote => ({
        id: vote.id,
        name: vote.name,
        choice: vote.choice,
        created_at: vote.created_at.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching last50:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

/**
 * GET /api/admin/export
 * Export all votes as CSV
 */
router.get('/export', async (_req: Request, res: Response) => {
  try {
    const votes = await getAllVotes();

    // Generate CSV
    const csvHeader = 'id,name,choice,created_at\n';
    const csvRows = votes
      .map(vote => {
        const name = vote.name.replace(/"/g, '""'); // Escape quotes
        return `"${vote.id}","${name}",${vote.choice},"${vote.created_at.toISOString()}"`;
      })
      .join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="votes-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Error exporting votes:', error);
    res.status(500).json({ error: 'Failed to export votes' });
  }
});

/**
 * POST /api/admin/reset
 * Delete all votes
 */
router.post('/reset', async (_req: Request, res: Response) => {
  try {
    const deletedCount = await deleteAllVotes();

    res.json({
      success: true,
      message: `Удалено ${deletedCount} записей`,
      deletedCount,
    });
  } catch (error) {
    console.error('Error resetting votes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset votes',
    });
  }
});

export default router;

