import { useState, useCallback } from 'react';
import { usePresenterSocket, type PresenterModePayload } from '../hooks/usePresenterSocket';
import { QuestionsCard } from '../components/QuestionsCard';

/**
 * Fullscreen presenter page for displaying questions on projector
 * Route: /presenter/questions
 * 
 * Listens to presenter_mode socket events from admin panel.
 * Shows answers when revealAnswers: true is received.
 */
function PresenterQuestionsPage() {
  const [showAnswers, setShowAnswers] = useState(false);

  // Handle presenter mode changes from admin
  const handleModeChange = useCallback((payload: PresenterModePayload) => {
    if (payload.mode === 'questions') {
      setShowAnswers(payload.revealAnswers ?? false);
    }
  }, []);

  const { isConnected } = usePresenterSocket({
    onModeChange: handleModeChange,
  });

  // Dev-only: local toggle for testing
  const handleDevToggle = () => {
    setShowAnswers((prev) => !prev);
  };

  return (
    <div className="presenter-questions-page min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      {/* Connection status indicator (small, top-right) */}
      <div className="fixed top-4 right-4 flex items-center gap-2 text-sm text-white/50">
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="hidden md:inline">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Questions card */}
      <QuestionsCard showAnswers={showAnswers} />

      {/* Dev-only toggle button */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
          <button
            onClick={handleDevToggle}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white 
                     text-sm rounded-lg border border-white/20 transition-all duration-200"
          >
            [DEV] Toggle Answers ({showAnswers ? 'ON' : 'OFF'})
          </button>
        </div>
      )}
    </div>
  );
}

export default PresenterQuestionsPage;



