import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { CHOICE_COLORS, type Vote, type Counts } from '../context/AppContext';

export interface Flame {
  id: string;
  name: string;
  color: string;
  choice: number;
  x: number;
  startTime: number;
}

interface UseSocketOptions {
  role: 'presenter' | 'client' | 'admin';
  onNewVote?: (vote: Vote) => void;
  onUpdateCounts?: (data: { counts: Counts; total: number; brightness: number }) => void;
  onSyncState?: (data: { counts: Counts; total: number; last50: Vote[]; brightness: number }) => void;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  flames: Flame[];
  emitSubmitChoice: (name: string, choice: number) => void;
  emitTestVote: (name: string, choice: number) => void;
}

const SOCKET_URL = import.meta.env.VITE_WS_URL ?? '';

export function useSocket(options: UseSocketOptions): UseSocketReturn {
  const { role, onNewVote, onUpdateCounts, onSyncState } = options;
  
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [flames, setFlames] = useState<Flame[]>([]);

  // Remove flames after animation (4 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setFlames(prev => prev.filter(flame => now - flame.startTime < 4000));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Add new flame
  const addFlame = useCallback((vote: Vote) => {
    const flame: Flame = {
      id: vote.id,
      name: vote.name,
      color: vote.color ?? CHOICE_COLORS[vote.choice] ?? '#ff851b',
      choice: vote.choice,
      x: Math.random() * 80 + 10, // 10-90% of screen width
      startTime: Date.now(),
    };
    
    setFlames(prev => [...prev, flame]);
  }, []);

  useEffect(() => {
    // Connect to Socket.IO
    const socket = io(SOCKET_URL + '/live', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.info('Socket.IO connected:', socket.id);
      setIsConnected(true);
      
      // Send handshake with role
      socket.emit('handshake', { role });
    });

    socket.on('disconnect', () => {
      console.info('Socket.IO disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
    });

    // Handle sync_state (initial state on connect)
    socket.on('sync_state', (data: { counts: Counts; total: number; last50: Vote[]; brightness: number }) => {
      console.info('Received sync_state:', data);
      onSyncState?.(data);
    });

    // Handle new_vote event
    socket.on('new_vote', (vote: Vote) => {
      console.info('Received new_vote:', vote);
      
      // Add flame animation for presenter
      if (role === 'presenter') {
        addFlame(vote);
      }
      
      onNewVote?.(vote);
    });

    // Handle update_counts event
    socket.on('update_counts', (data: { counts: Counts; total: number; brightness: number }) => {
      console.info('Received update_counts:', data);
      onUpdateCounts?.(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [role, onNewVote, onUpdateCounts, onSyncState, addFlame]);

  // Emit submit_choice event
  const emitSubmitChoice = useCallback((name: string, choice: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('submit_choice', { name, choice });
    }
  }, []);

  // Emit test vote (admin only)
  const emitTestVote = useCallback((name: string, choice: number) => {
    if (socketRef.current?.connected && role === 'admin') {
      socketRef.current.emit('test_vote', { name, choice });
    }
  }, [role]);

  return {
    socket: socketRef.current,
    isConnected,
    flames,
    emitSubmitChoice,
    emitTestVote,
  };
}

