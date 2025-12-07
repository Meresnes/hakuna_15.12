import { Router, type Request, type Response } from 'express';
import { insertVote, getVoteCounts, getTotalVotes, getSettings } from '../db/queries.js';
import type { Server as SocketIOServer, Namespace } from 'socket.io';

const router = Router();

// Choice color mapping
const CHOICE_COLORS: Record<number, string> = {
  1: '#ff4136', // red
  2: '#ffdc00', // yellow
  3: '#fffef0', // white
  4: '#ff851b', // orange
};

// Socket.IO namespace reference (will be set by server.ts)
let liveNamespace: Namespace | null = null;

export function setLiveNamespace(namespace: Namespace): void {
  liveNamespace = namespace;
}

interface ChoiceBody {
  name: string;
  choice: number;
}

/**
 * Calculate brightness based on total votes
 */
function calculateBrightness(total: number, target: number, min: number, max: number): number {
  const brightness = min + (total / target) * (max - min);
  return Math.min(Math.max(brightness, min), max);
}

/**
 * POST /api/choice
 * Submit a vote choice
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, choice } = req.body as ChoiceBody;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Имя обязательно для заполнения',
      });
      return;
    }

    // Validate choice
    if (typeof choice !== 'number' || choice < 1 || choice > 4) {
      res.status(400).json({
        success: false,
        error: 'Выбор должен быть числом от 1 до 4',
      });
      return;
    }

    // Insert vote into database
    const vote = await insertVote(name.trim(), choice);

    // Get updated counts and settings
    const [counts, total, settings] = await Promise.all([
      getVoteCounts(),
      getTotalVotes(),
      getSettings(),
    ]);

    const target = parseInt(settings['target_count'] ?? '110', 10);
    const brightnessMin = parseFloat(settings['brightness_min'] ?? '0.1');
    const brightnessMax = parseFloat(settings['brightness_max'] ?? '1.10');
    const brightness = calculateBrightness(total, target, brightnessMin, brightnessMax);

    // Emit Socket.IO events to all presenter clients
    if (liveNamespace) {
      // Emit new vote event
      liveNamespace.emit('new_vote', {
        id: vote.id,
        name: vote.name,
        choice: vote.choice,
        color: CHOICE_COLORS[vote.choice] ?? '#ff851b',
        created_at: vote.created_at.toISOString(),
      });

      // Emit updated counts
      liveNamespace.emit('update_counts', {
        counts,
        total,
        brightness,
      });
    }

    res.json({
      success: true,
      vote: {
        id: vote.id,
        name: vote.name,
        choice: vote.choice,
        color: CHOICE_COLORS[vote.choice] ?? '#ff851b',
        created_at: vote.created_at.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in choice:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при сохранении выбора',
    });
  }
});

export default router;

