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

const getSocketUrl = (): string => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  return window.location.origin;
};

export function useSocket(options: UseSocketOptions): UseSocketReturn {
  const { role, onNewVote, onUpdateCounts, onSyncState } = options;
  
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [flames, setFlames] = useState<Flame[]>([]);

  // Store callbacks in refs to avoid reconnection on callback change
  const onNewVoteRef = useRef(onNewVote);
  const onUpdateCountsRef = useRef(onUpdateCounts);
  const onSyncStateRef = useRef(onSyncState);
  const roleRef = useRef(role);

  // Update refs when callbacks change (without triggering reconnection)
  useEffect(() => {
    onNewVoteRef.current = onNewVote;
  }, [onNewVote]);

  useEffect(() => {
    onUpdateCountsRef.current = onUpdateCounts;
  }, [onUpdateCounts]);

  useEffect(() => {
    onSyncStateRef.current = onSyncState;
  }, [onSyncState]);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

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

  // Socket connection - only reconnect when role changes
  useEffect(() => {
    const socketUrl = getSocketUrl();
    console.info('Connecting to Socket.IO:', socketUrl + '/live');
    
    const socket = io(socketUrl + '/live', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      path: '/socket.io',
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.info('Socket.IO connected:', socket.id);
      setIsConnected(true);
      
      // Send handshake with role
      socket.emit('handshake', { role: roleRef.current });
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
      onSyncStateRef.current?.(data);
    });

    // Handle new_vote event
    socket.on('new_vote', (vote: Vote) => {
      console.info('Received new_vote:', vote);
      
      // Add flame animation for presenter
      if (roleRef.current === 'presenter') {
        addFlame(vote);
      }
      
      onNewVoteRef.current?.(vote);
    });

    // Handle update_counts event
    socket.on('update_counts', (data: { counts: Counts; total: number; brightness: number }) => {
      console.info('Received update_counts:', data);
      onUpdateCountsRef.current?.(data);
    });

    return () => {
      console.info('Disconnecting Socket.IO');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addFlame]); // Only addFlame is stable (useCallback with empty deps)

  // Emit submit_choice event
  const emitSubmitChoice = useCallback((name: string, choice: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('submit_choice', { name, choice });
    }
  }, []);

  // Emit test vote (admin only)
  const emitTestVote = useCallback((name: string, choice: number) => {
    if (socketRef.current?.connected && roleRef.current === 'admin') {
      socketRef.current.emit('test_vote', { name, choice });
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    flames,
    emitSubmitChoice,
    emitTestVote,
  };
}
