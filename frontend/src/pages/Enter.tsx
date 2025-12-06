import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

function Enter() {
  const navigate = useNavigate();
  const { state, setUser } = useApp();
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      setError('Код должен содержать 4 цифры');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json() as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        setError(data.error ?? 'Неверный код');
        return;
      }

      setUser({ name: '', isVerified: true });
      navigate('/choose');
    } catch {
      setError('Ошибка соединения. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-radial">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-gradient-flame mb-3">Хакуна 2025
          </h1>
          <p className="font-great-vibes text-2xl text-flame-yellow opacity-90">
            Добавь света в мир
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-night-medium/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-night-light"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="space-y-6">
            {/* Code input */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                Введите код (4 цифры)
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="0000"
                className="w-full px-4 py-3 bg-night-dark border border-night-light rounded-lg 
                         text-white text-center text-2xl tracking-widest placeholder-gray-500 
                         focus:outline-none focus:ring-2 focus:ring-flame-orange 
                         focus:border-transparent transition-all font-mono"
                maxLength={4}
                inputMode="numeric"
                pattern="\d{4}"
                disabled={isSubmitting}
              />
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || code.length !== 4}
              className="w-full py-4 bg-gradient-to-r from-flame-orange to-flame-red 
                       text-white font-semibold rounded-lg shadow-lg
                       hover:shadow-flame-orange/30 hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 transform hover:scale-[1.02]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Проверка...
                </span>
              ) : (
                'Далее'
              )}
            </motion.button>
          </div>
        </motion.form>

         {/*Footer hint*/}
        <p className="text-center text-gray-500 text-sm mt-6">
          Текущий код: <span className="text-gray-400">{state.code}</span>
        </p>
      </motion.div>
    </div>
  );
}

export default Enter;

