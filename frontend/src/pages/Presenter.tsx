import { useRef } from 'react';
import { useApp, CHOICE_COLORS } from '../context/AppContext';
import { useSocket } from '../hooks/useSocket';
import PresenterCanvas from '../components/PresenterCanvas';

function Presenter() {
  const { state, updateState } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { flames, isConnected } = useSocket({
    role: 'presenter',
    onNewVote: (vote) => {
      // Update counts when new vote arrives
      updateState({
        counts: {
          ...state.counts,
          [vote.choice]: (state.counts[vote.choice as keyof typeof state.counts] ?? 0) + 1,
        },
        total: state.total + 1,
      });
    },
    onUpdateCounts: (data) => {
      updateState({
        counts: data.counts,
        total: data.total,
        brightness: data.brightness,
      });
    },
  });

  // Calculate brightness
  const brightness = Math.min(
    Math.max(
      state.brightnessRange.min + 
        (state.total / state.target) * (state.brightnessRange.max - state.brightnessRange.min),
      state.brightnessRange.min
    ),
    state.brightnessRange.max
  );

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-night-dark"
      style={{
        filter: `brightness(${brightness})`,
        transition: 'filter 0.5s ease-out',
      }}
    >
      {/* Planet background placeholder */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="w-[60vmin] h-[60vmin] rounded-full opacity-30"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, 
                rgba(100, 150, 255, 0.3) 0%, 
                rgba(50, 100, 200, 0.2) 30%,
                rgba(20, 50, 100, 0.1) 60%,
                transparent 70%
              )
            `,
            boxShadow: `
              inset -20px -20px 60px rgba(0, 0, 0, 0.5),
              0 0 100px rgba(100, 150, 255, 0.2)
            `,
          }}
        />
      </div>

      {/* Canvas for flames */}
      <PresenterCanvas flames={flames} />

      {/* Stats overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-4xl mx-auto">
          {/* Connection status */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-xs text-gray-400">
              {isConnected ? 'Подключено' : 'Отключено'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Прогресс</span>
              <span>{state.total} / {state.target}</span>
            </div>
            <div className="h-2 bg-night-light rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-flame-red via-flame-orange to-flame-yellow transition-all duration-500"
                style={{ width: `${Math.min((state.total / state.target) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(choice => (
              <div 
                key={choice}
                className="text-center p-3 rounded-lg bg-night-medium/50"
              >
                <div 
                  className="w-8 h-8 mx-auto mb-2 rounded-full"
                  style={{ backgroundColor: CHOICE_COLORS[choice] }}
                />
                <div className="text-2xl font-bold text-white">
                  {state.counts[choice as keyof typeof state.counts]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Presenter;

