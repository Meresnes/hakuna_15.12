import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  // Handle presenter mode changes from admin
  const handleModeChange = useCallback((payload: PresenterModePayload) => {
    if (payload.mode === 'questions') {
      setShowAnswers(payload.revealAnswers ?? false);
    }
  }, []);

  const { isConnected } = usePresenterSocket({
    onModeChange: handleModeChange,
  });

  // Toggle answers visibility
  const handleToggleAnswers = () => {
    setShowAnswers((prev) => !prev);
  };

  // Navigate to presenter page
  const handleNavigateToPresenter = () => {
    navigate('/presenter');
  };

  return (
    <div className="presenter-questions-page min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      {/* Connection status indicator and controls (small, top-right) */}
      <div className="fixed top-4 right-4 flex items-center gap-2 text-sm text-white/50">
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        
        {/* Toggle answers button */}
        <button
          onClick={handleToggleAnswers}
          className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 
                   text-xs rounded border border-white/10 transition-all duration-200"
          // title={showAnswers ? 'Скрыть ответы' : 'Показать ответы'}
        >
          {showAnswers ? '✓' : '?'}
        </button>
        
        {/* Navigate to presenter button */}
        <button
          onClick={handleNavigateToPresenter}
          className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 
                   text-xs rounded border border-white/10 transition-all duration-200"
          // title="Перейти на страницу Presenter"
        >
          →
        </button>
      </div>

      {/* Questions card */}
      <QuestionsCard showAnswers={showAnswers} />
    </div>
  );
}

export default PresenterQuestionsPage;



