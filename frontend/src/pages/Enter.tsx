import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';

function Enter() {
  const navigate = useNavigate();
  const { state, setUser } = useApp();
  
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Convert code array to string
  const codeString = code.join('');

  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(0, 1);
    
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError('');

    // Auto-focus next input if digit entered
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down (Backspace, Arrow keys)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // If current field is empty, focus previous and clear it
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current field
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    
    const newCode: string[] = ['', '', '', ''];
    for (let i = 0; i < pastedData.length && i < 4; i++) {
      const char = pastedData.charAt(i);
      if (char) {
        newCode[i] = char;
      }
    }
    
    setCode(newCode);
    
    // Focus the next empty field or the last field
    const nextIndex = Math.min(pastedData.length, 3);
    setTimeout(() => {
      inputRefs.current[nextIndex]?.focus();
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const codeStr = code.join('');
    if (codeStr.length !== 4 || !/^\d{4}$/.test(codeStr)) {
      setError('Код должен содержать 4 цифры');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeStr }),
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
          <Logo className="mb-6" delay={0.2} />
          <p className="font-script text-2xl md:text-3xl text-black-300 opacity-90">
            Добавь света в мир
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-bg-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-divider"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="space-y-6">
            {/* Code input */}
            <div>
              <label className="block text-sm font-medium text-text-muted mb-4 text-center">
                Введите код (4 цифры)
              </label>
              <div 
                className="flex flex-row justify-center items-center gap-4 sm:gap-2"
                onPaste={handlePaste}
              >
                {code.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    className="w-16 h-16 sm:w-[60px] sm:h-[60px] 
                             bg-bg-800 border-2 border-divider rounded-lg
                             text-gold-300 text-center text-2xl sm:text-xl
                             font-mono font-bold
                             focus:outline-none focus:border-gold-500 
                             transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    maxLength={1}
                    disabled={isSubmitting}
                    aria-label={`Цифра ${index + 1} кода`}
                  />
                ))}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-danger text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isSubmitting || codeString.length !== 4}
              className="btn-primary w-full py-4"
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
      </motion.div>
    </div>
  );
}

export default Enter;

