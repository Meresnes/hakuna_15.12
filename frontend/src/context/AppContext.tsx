import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// Types
export interface Vote {
  id: string;
  name: string;
  choice: number;
  created_at: string;
  color?: string;
}

export interface Counts {
  1: number;
  2: number;
  3: number;
  4: number;
}

export interface AppState {
  counts: Counts;
  total: number;
  last50: Vote[];
  brightness: number;
  target: number;
  brightnessRange: {
    min: number;
    max: number;
  };
  code: string;
}

export interface UserData {
  name: string;
  isVerified: boolean;
}

interface AppContextType {
  state: AppState;
  user: UserData;
  setUser: (user: UserData) => void;
  updateState: (newState: Partial<AppState>) => void;
  isLoading: boolean;
  error: string | null;
  fetchState: () => Promise<void>;
}

const defaultState: AppState = {
  counts: { 1: 0, 2: 0, 3: 0, 4: 0 },
  total: 0,
  last50: [],
  brightness: 0.2,
  target: 110,
  brightnessRange: { min: 0.2, max: 1.10 },
  code: '8375',
};

const defaultUser: UserData = {
  name: '',
  isVerified: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [user, setUser] = useState<UserData>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateState = useCallback((newState: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  const fetchState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/state');
      if (!response.ok) {
        throw new Error('Failed to fetch state');
      }
      
      const data = await response.json() as {
        totalCounts: Counts;
        total: number;
        last50: Vote[];
        target: number;
        brightnessRange: { min: number; max: number };
        code?: string;
      };
      
      const brightness = calculateBrightness(
        data.total,
        data.target,
        data.brightnessRange.min,
        data.brightnessRange.max
      );
      
      setState({
        counts: data.totalCounts,
        total: data.total,
        last50: data.last50,
        brightness,
        target: data.target,
        brightnessRange: data.brightnessRange,
        code: data.code ?? '8375',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchState();
  }, [fetchState]);

  return (
    <AppContext.Provider
      value={{
        state,
        user,
        setUser,
        updateState,
        isLoading,
        error,
        fetchState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Helper function to calculate brightness
function calculateBrightness(
  total: number,
  target: number,
  min: number,
  max: number
): number {
  const brightness = min + (total / target) * (max - min);
  return Math.min(Math.max(brightness, min), max);
}

// Color mapping for choices
export const CHOICE_COLORS: Record<number, string> = {
  1: '#ff4136', // red
  2: '#ffdc00', // yellow
  3: '#fffef0', // white
  4: '#ff851b', // orange
};

export const CHOICE_TEXTS: Record<number, string> = {
  1: 'Сегодня я добавил(а) света в мир, исполнив заповеди тфилин, цдаки или молитвы.',
  2: 'Я беру на себя добавить света в мир, регулярно зажигая свечи Шаббата / соблюдая Шаббат как положено.',
  3: 'Я беру на себя добавить света в мир на неделе Хануки и зажигать ханукальные свечи каждый день.',
  4: 'Я беру на себя зажечь свет в душе ещё одного еврея, приведя его в общину или побудив его выполнить ещё одну заповедь.',
};

