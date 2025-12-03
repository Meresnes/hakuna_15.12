import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, CHOICE_COLORS, CHOICE_TEXTS } from '../context/AppContext';

function Choose() {
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Redirect if not verified
  // if (!user.isVerified) {
  //   navigate('/');
  //   return null;
  // }

  const handleChoiceClick = (choice: number) => {
    setSelectedChoice(choice);
  };

  const handleSubmit = async () => {
    if (selectedChoice === null) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, choice: selectedChoice }),
      });

      if (response.ok) {
        setShowModal(true);
        setTimeout(() => {
          navigate('/thanks');
        }, 2000);
      }
    } catch {
      console.error('Failed to submit choice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const choices = [
    { id: 1, color: CHOICE_COLORS[1], text: CHOICE_TEXTS[1], label: 'Красный' },
    { id: 2, color: CHOICE_COLORS[2], text: CHOICE_TEXTS[2], label: 'Жёлтый' },
    { id: 3, color: CHOICE_COLORS[3], text: CHOICE_TEXTS[3], label: 'Белый' },
    { id: 4, color: CHOICE_COLORS[4], text: CHOICE_TEXTS[4], label: 'Оранжевый' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-radial">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-2">
            Выберите своё доброе дело
          </h1>
          <p className="text-gray-400">
            Привет, <span className="text-flame-yellow">{user.name}</span>!
          </p>
        </div>

        {/* Choice buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {choices.map((choice, index) => (
            <motion.button
              key={choice.id}
              onClick={() => handleChoiceClick(choice.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300
                ${selectedChoice === choice.id
                  ? 'border-current shadow-lg scale-[1.02]'
                  : 'border-night-light hover:border-current/50'
                }
              `}
              style={{
                color: choice.color,
                boxShadow: selectedChoice === choice.id 
                  ? `0 0 30px ${choice.color}40` 
                  : 'none',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Flame icon */}
              <div 
                className="w-12 h-12 mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${choice.color}20` }}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 23c-3.866 0-7-3.134-7-7 0-3.866 4-8 7-12 3 4 7 8.134 7 12 0 3.866-3.134 7-7 7zm0-3c2.21 0 4-1.79 4-4 0-2.21-2-5-4-8-2 3-4 5.79-4 8 0 2.21 1.79 4 4 4z" />
                </svg>
              </div>

              {/* Text */}
              <p className="text-white text-sm md:text-base leading-relaxed">
                {choice.text}
              </p>

              {/* Selection indicator */}
              {selectedChoice === choice.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: choice.color }}
                >
                  <svg className="w-4 h-4 text-night-dark" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Submit button */}
        <motion.button
          onClick={handleSubmit}
          disabled={selectedChoice === null || isSubmitting}
          className="w-full max-w-md mx-auto block py-4 bg-gradient-to-r from-flame-orange to-flame-red 
                   text-white font-semibold rounded-lg shadow-lg
                   hover:shadow-flame-orange/30 hover:shadow-xl
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-300"
          whileHover={{ scale: selectedChoice ? 1.02 : 1 }}
          whileTap={{ scale: selectedChoice ? 0.98 : 1 }}
        >
          {isSubmitting ? 'Отправка...' : 'Подтвердить выбор'}
        </motion.button>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-night-medium p-8 rounded-2xl text-center max-w-sm mx-4"
            >
              <div 
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: selectedChoice ? `${CHOICE_COLORS[selectedChoice]}30` : undefined,
                  color: selectedChoice ? CHOICE_COLORS[selectedChoice] : undefined,
                }}
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 23c-3.866 0-7-3.134-7-7 0-3.866 4-8 7-12 3 4 7 8.134 7 12 0 3.866-3.134 7-7 7z" />
                </svg>
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-white mb-2">
                Спасибо!
              </h2>
              <p className="text-gray-400">
                Ваш свет добавлен в мир
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Choose;

