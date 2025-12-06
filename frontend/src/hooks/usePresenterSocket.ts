import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Presenter mode payload from server
 */
export interface PresenterModePayload {
  mode: string;
  revealAnswers?: boolean;
}

/**
 * Hook options
 */
interface UsePresenterSocketOptions {
  onModeChange?: (payload: PresenterModePayload) => void;
}

/**
 * Hook return type
 */
interface UsePresenterSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  currentMode: string | null;
  revealAnswers: boolean;
  setPresenterMode: (mode: string, revealAnswers?: boolean) => void;
}

/**
 * Get Socket.IO URL from env or window origin
 */
const getSocketUrl = (): string => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL as string;
  }
  return window.location.origin;
};

/**
 * Hook for presenter socket connection and presenter_mode event handling
 * Connects to /live namespace and listens for presenter_mode events
 */
export function usePresenterSocket(
  options: UsePresenterSocketOptions = {}
): UsePresenterSocketReturn {
  const { onModeChange } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentMode, setCurrentMode] = useState<string | null>(null);
  const [revealAnswers, setRevealAnswers] = useState(false);

  // Store callback in ref to avoid reconnection on callback change
  const onModeChangeRef = useRef(onModeChange);

  useEffect(() => {
    onModeChangeRef.current = onModeChange;
  }, [onModeChange]);

  // Socket connection
  useEffect(() => {
    const socketUrl = getSocketUrl();
    console.info('[PresenterSocket] Connecting to:', socketUrl + '/live');

    const socket = io(socketUrl + '/live', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      path: '/socket.io',
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.info('[PresenterSocket] Connected:', socket.id);
      setIsConnected(true);

      // Send handshake with presenter role
      socket.emit('handshake', { role: 'presenter' });
    });

    socket.on('disconnect', () => {
      console.info('[PresenterSocket] Disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[PresenterSocket] Connection error:', error);
      setIsConnected(false);
    });

    // Handle presenter_mode event from admin
    socket.on('presenter_mode', (payload: PresenterModePayload) => {
      console.info('[PresenterSocket] Received presenter_mode:', payload);

      setCurrentMode(payload.mode);
      setRevealAnswers(payload.revealAnswers ?? false);

      // Call external handler if provided
      onModeChangeRef.current?.(payload);
    });

    return () => {
      console.info('[PresenterSocket] Disconnecting');
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Method to set presenter mode (for admin use)
  const setPresenterMode = useCallback(
    (mode: string, reveal?: boolean) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('set_presenter_mode', {
          mode,
          revealAnswers: reveal,
        });
      }
    },
    []
  );

  return {
    socket: socketRef.current,
    isConnected,
    currentMode,
    revealAnswers,
    setPresenterMode,
  };
}



