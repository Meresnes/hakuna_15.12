/**
 * Socket.IO Event Handlers
 * 
 * Namespace: /live
 * 
 * Events:
 * 
 * CLIENT → SERVER:
 * - handshake: { role: 'presenter' | 'client' | 'admin' }
 *   Identifies the client role. Sent immediately after connection.
 * 
 * - submit_choice: { name: string, choice: number }
 *   Submits a vote choice (alternative to REST API).
 * 
 * - test_vote: { name: string, choice: number }
 *   Admin-only: Creates a test vote for testing animations.
 * 
 * - set_presenter_mode: { mode: string, revealAnswers?: boolean }
 *   Admin-only: Sets presenter display mode and broadcasts to all presenters.
 * 
 * SERVER → CLIENT:
 * - sync_state: { counts, total, last50, brightness }
 *   Sent on connection and reconnection. Contains full current state.
 * 
 * - new_vote: { id, name, choice, color, created_at }
 *   Broadcast when a new vote is submitted.
 * 
 * - update_counts: { counts, total, brightness }
 *   Broadcast after each vote with updated statistics.
 * 
 * - presenter_mode: { mode: string, revealAnswers?: boolean }
 *   Broadcast to presenter clients when admin changes mode.
 * 
 * Reconnection:
 * - On reconnect, server sends sync_state with full current state.
 * - Each vote has a unique UUID to ensure idempotency.
 */

import { type Namespace, type Socket } from 'socket.io';
import {
  getVoteCounts,
  getTotalVotes,
  getLastVotes,
  getSettings,
  insertVote,
  type Vote,
  type VoteCounts,
} from './db/queries.js';

// Choice color mapping
const CHOICE_COLORS: Record<number, string> = {
  1: '#ff4136', // red
  2: '#ffdc00', // yellow
  3: '#fffef0', // white
  4: '#ff851b', // orange
};

// Types for Socket.IO events
interface HandshakeData {
  role: 'presenter' | 'client' | 'admin';
}

interface SubmitChoiceData {
  name: string;
  choice: number;
}

interface TestVoteData {
  name: string;
  choice: number;
}

interface PresenterModeData {
  mode: string;
  revealAnswers?: boolean;
}

interface SyncStatePayload {
  counts: VoteCounts;
  total: number;
  last50: Array<{
    id: string;
    name: string;
    choice: number;
    created_at: string;
    color: string;
  }>;
  brightness: number;
}

interface NewVotePayload {
  id: string;
  name: string;
  choice: number;
  color: string;
  created_at: string;
}

interface UpdateCountsPayload {
  counts: VoteCounts;
  total: number;
  brightness: number;
}

/**
 * Calculate brightness based on total votes and target
 */
function calculateBrightness(total: number, target: number, min: number, max: number): number {
  const brightness = min + (total / target) * (max - min);
  return Math.min(Math.max(brightness, min), max);
}

/**
 * Get current state for sync
 */
async function getCurrentState(): Promise<SyncStatePayload> {
  const [counts, total, last50, settings] = await Promise.all([
    getVoteCounts(),
    getTotalVotes(),
    getLastVotes(50),
    getSettings(),
  ]);

  const target = parseInt(settings['target_count'] ?? '110', 10);
  const brightnessMin = parseFloat(settings['brightness_min'] ?? '0.2');
  const brightnessMax = parseFloat(settings['brightness_max'] ?? '1.10');
  const brightness = calculateBrightness(total, target, brightnessMin, brightnessMax);

  return {
    counts,
    total,
    last50: last50.map(vote => ({
      id: vote.id,
      name: vote.name,
      choice: vote.choice,
      created_at: vote.created_at.toISOString(),
      color: CHOICE_COLORS[vote.choice] ?? '#ff851b',
    })),
    brightness,
  };
}

/**
 * Process a new vote and broadcast to all clients
 */
async function processVote(
  namespace: Namespace,
  name: string,
  choice: number,
  isTestVote: boolean = false
): Promise<NewVotePayload | null> {
  try {
    // Validate choice
    if (choice < 1 || choice > 4) {
      console.warn(`Invalid choice: ${choice}`);
      return null;
    }

    // Insert vote (even test votes go to DB for consistency)
    const vote = await insertVote(name.trim(), choice);

    // Get updated stats
    const [counts, total, settings] = await Promise.all([
      getVoteCounts(),
      getTotalVotes(),
      getSettings(),
    ]);

    const target = parseInt(settings['target_count'] ?? '110', 10);
    const brightnessMin = parseFloat(settings['brightness_min'] ?? '0.2');
    const brightnessMax = parseFloat(settings['brightness_max'] ?? '1.10');
    const brightness = calculateBrightness(total, target, brightnessMin, brightnessMax);

    const votePayload: NewVotePayload = {
      id: vote.id,
      name: vote.name,
      choice: vote.choice,
      color: CHOICE_COLORS[vote.choice] ?? '#ff851b',
      created_at: vote.created_at.toISOString(),
    };

    const countsPayload: UpdateCountsPayload = {
      counts,
      total,
      brightness,
    };

    // Broadcast to all connected clients
    namespace.emit('new_vote', votePayload);
    namespace.emit('update_counts', countsPayload);

    console.info(
      `${isTestVote ? '[TEST] ' : ''}Vote recorded: ${name} chose ${choice} (total: ${total})`
    );

    return votePayload;
  } catch (error) {
    console.error('Error processing vote:', error);
    return null;
  }
}

/**
 * Setup Socket.IO event handlers for the /live namespace
 */
export function setupSocketHandlers(namespace: Namespace): void {
  namespace.on('connection', (socket: Socket) => {
    console.info(`Client connected to /live: ${socket.id}`);

    // Handle handshake - identify client role
    socket.on('handshake', async (data: HandshakeData) => {
      const { role } = data;
      
      // Store role in socket data
      socket.data.role = role;
      console.info(`Client ${socket.id} identified as: ${role}`);

      // Send current state to newly connected client
      try {
        const state = await getCurrentState();
        socket.emit('sync_state', state);
        console.info(`Sent sync_state to ${socket.id}`);
      } catch (error) {
        console.error(`Error sending sync_state to ${socket.id}:`, error);
      }
    });

    // Handle submit_choice - alternative to REST API
    socket.on('submit_choice', async (data: SubmitChoiceData) => {
      const { name, choice } = data;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        socket.emit('error', { message: 'Name is required' });
        return;
      }

      if (typeof choice !== 'number' || choice < 1 || choice > 4) {
        socket.emit('error', { message: 'Invalid choice' });
        return;
      }

      await processVote(namespace, name, choice, false);
    });

    // Handle test_vote - admin only
    socket.on('test_vote', async (data: TestVoteData) => {
      const { name, choice } = data;

      // Check if client is admin
      if (socket.data.role !== 'admin') {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const testName = name || `Тест-${Date.now()}`;
      const testChoice = choice || Math.floor(Math.random() * 4) + 1;

      await processVote(namespace, testName, testChoice, true);
    });

    // Handle set_presenter_mode - admin only
    socket.on('set_presenter_mode', (data: PresenterModeData) => {
      // Check if client is admin
      if (socket.data.role !== 'admin') {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const { mode, revealAnswers } = data;
      console.info(`Admin ${socket.id} set presenter mode: ${mode}, revealAnswers: ${revealAnswers ?? false}`);

      // Broadcast to all presenter clients
      namespace.sockets.forEach((s) => {
        if (s.data.role === 'presenter') {
          s.emit('presenter_mode', { mode, revealAnswers });
        }
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      console.info(`Client disconnected from /live: ${socket.id} (${reason})`);
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Log namespace-level events
  namespace.on('connect_error', (error: Error) => {
    console.error('Namespace connect error:', error);
  });

  console.info('✅ Socket.IO handlers configured for /live namespace');
}

export default setupSocketHandlers;

