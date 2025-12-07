import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, CHOICE_COLORS, CHOICE_TEXTS } from '../context/AppContext';

function Choose() {
  const navigate = useNavigate();
  const { user } = useApp();
  
  const [name, setName] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not verified
  // useEffect(() => {
  //   if (!user.isVerified) {
  //     navigate('/');
  //   }
  // }, [user.isVerified, navigate]);

  const handleChoiceClick = (choice: number) => {
    setSelectedChoice(choice);
  };

  const handleSubmit = async () => {
    setError('');

    if (!name.trim()) {
      setError('Пожалуйста, введите ваше имя');
      return;
    }

    if (selectedChoice === null) {
      setError('Пожалуйста, выберите доброе дело');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), choice: selectedChoice }),
      });

      if (response.ok) {
        setShowModal(true);
        setTimeout(() => {
          navigate('/thanks');
        }, 2000);
      } else {
        setError('Ошибка при сохранении. Попробуйте ещё раз.');
      }
    } catch {
      setError('Ошибка соединения. Попробуйте ещё раз.');
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
          <p className="font-script text-4xl text-gold-300 opacity-90">
            Добавь света в мир
          </p>
          <p className="text-text-muted">
            Введите своё имя и выберите доброе дело
          </p>
        </div>

        {/* Name input */}
        <div className="max-w-md mx-auto mb-8">
          <label htmlFor="name" className="block text-sm font-medium text-text-muted mb-2">
            Ваше имя
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Введите имя"
            className="w-full px-4 py-3 bg-bg-800 border border-divider rounded-lg 
                     text-gold-300 placeholder-text-muted focus:outline-none focus:ring-2 
                     focus:ring-focus-ring focus:border-gold-500 transition-all"
            maxLength={50}
            disabled={isSubmitting}
          />
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
              className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-300 bg-bg-800/50
                ${selectedChoice === choice.id
                  ? 'border-current shadow-lg scale-[1.02]'
                  : 'border-divider hover:border-current/50'
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
                      fill="currentColor"
                      width="32" height="32"
                      version="1.1"
                      id="Capa_1"
                      xmlns="http://www.w3.org/2000/svg"
                       viewBox="0 0 611.999 611.999"
                  >
                    <g>
                        <path d="M216.02,611.195c5.978,3.178,12.284-3.704,8.624-9.4c-19.866-30.919-38.678-82.947-8.706-149.952
                            c49.982-111.737,80.396-169.609,80.396-169.609s16.177,67.536,60.029,127.585c42.205,57.793,65.306,130.478,28.064,191.029
                            c-3.495,5.683,2.668,12.388,8.607,9.349c46.1-23.582,97.806-70.885,103.64-165.017c2.151-28.764-1.075-69.034-17.206-119.851
                            c-20.741-64.406-46.239-94.459-60.992-107.365c-4.413-3.861-11.276-0.439-10.914,5.413c4.299,69.494-21.845,87.129-36.726,47.386
                            c-5.943-15.874-9.409-43.33-9.409-76.766c0-55.665-16.15-112.967-51.755-159.531c-9.259-12.109-20.093-23.424-32.523-33.073
                            c-4.5-3.494-11.023,0.018-10.611,5.7c2.734,37.736,0.257,145.885-94.624,275.089c-86.029,119.851-52.693,211.896-40.864,236.826
                            C153.666,566.767,185.212,594.814,216.02,611.195z"/>
                    </g>
                </svg>
              </div>

              {/* Text */}
              <p className="text-text-on-dark text-sm md:text-base leading-relaxed">
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
                  <svg className="w-4 h-4 text-bg-900" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-danger text-sm text-center mb-4"
          >
            {error}
          </motion.p>
        )}

        {/* Submit button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!name.trim() || selectedChoice === null || isSubmitting}
          className="btn-primary w-full max-w-md mx-auto block py-4"
          whileHover={{ scale: name.trim() && selectedChoice ? 1.02 : 1 }}
          whileTap={{ scale: name.trim() && selectedChoice ? 0.98 : 1 }}
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
              className="bg-bg-800 p-8 rounded-2xl text-center max-w-sm mx-4 border border-divider"
            >
              <div 
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: selectedChoice ? `${CHOICE_COLORS[selectedChoice]}30` : undefined,
                  color: selectedChoice ? CHOICE_COLORS[selectedChoice] : undefined,
                }}
              >
                  <svg
                      fill="currentColor"
                      width="32" height="32"
                      version="1.1"
                      id="Capa_1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 611.999 611.999"
                  >
                      <g>
                          <path d="M216.02,611.195c5.978,3.178,12.284-3.704,8.624-9.4c-19.866-30.919-38.678-82.947-8.706-149.952
                            c49.982-111.737,80.396-169.609,80.396-169.609s16.177,67.536,60.029,127.585c42.205,57.793,65.306,130.478,28.064,191.029
                            c-3.495,5.683,2.668,12.388,8.607,9.349c46.1-23.582,97.806-70.885,103.64-165.017c2.151-28.764-1.075-69.034-17.206-119.851
                            c-20.741-64.406-46.239-94.459-60.992-107.365c-4.413-3.861-11.276-0.439-10.914,5.413c4.299,69.494-21.845,87.129-36.726,47.386
                            c-5.943-15.874-9.409-43.33-9.409-76.766c0-55.665-16.15-112.967-51.755-159.531c-9.259-12.109-20.093-23.424-32.523-33.073
                            c-4.5-3.494-11.023,0.018-10.611,5.7c2.734,37.736,0.257,145.885-94.624,275.089c-86.029,119.851-52.693,211.896-40.864,236.826
                            C153.666,566.767,185.212,594.814,216.02,611.195z"/>
                      </g>
                  </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-text-on-dark mb-2">
                Спасибо!
              </h2>
              <p className="text-text-muted">
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

