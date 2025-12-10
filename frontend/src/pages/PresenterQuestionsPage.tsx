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
    <div className="presenter-questions-page min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Connection status indicator and controls (small, top-right) */}
      <div className="fixed top-5 right-5 flex items-center gap-2.5 text-sm px-2 py-1.5 rounded-lg backdrop-blur-sm bg-black/20 border border-white/5 shadow-lg">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        
        {/* Toggle answers button */}
        <button
          onClick={handleToggleAnswers}
          className="neumorphic-button px-3 py-1.5 text-gold-500 hover:text-gold-300 
                   text-sm rounded-lg"
          // title={showAnswers ? 'Скрыть ответы' : 'Показать ответы'}
        >
          {showAnswers ? '✓' : '?'}
        </button>
        
        {/* Navigate to presenter button */}
        <button
          onClick={handleNavigateToPresenter}
          className="neumorphic-button px-3 py-1.5 text-gold-500 hover:text-gold-300 
                   text-sm rounded-lg"
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



