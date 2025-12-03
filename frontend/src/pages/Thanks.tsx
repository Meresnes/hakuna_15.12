import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Thanks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-radial">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Animated flame */}
        <motion.div
          className="w-32 h-32 mx-auto mb-8"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id="flameGradient" cx="50%" cy="70%" r="50%">
                <stop offset="0%" stopColor="#fffef0" />
                <stop offset="30%" stopColor="#ffdc00" />
                <stop offset="60%" stopColor="#ff851b" />
                <stop offset="100%" stopColor="#ff4136" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <ellipse
              cx="50"
              cy="60"
              rx="25"
              ry="35"
              fill="url(#flameGradient)"
              filter="url(#glow)"
            />
            <ellipse cx="50" cy="50" rx="15" ry="25" fill="#fffef0" opacity="0.7" />
          </svg>
        </motion.div>

        {/* Thank you message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-cinzel text-4xl md:text-5xl font-bold text-gradient-flame mb-4"
        >
          Спасибо!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-great-vibes text-2xl text-flame-yellow mb-8"
        >
          Вы добавили света в этот мир
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 mb-8"
        >
          Ваш выбор записан и уже отображается на экране события.
          <br />
          Пусть ваш свет освещает путь другим!
        </motion.p>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-night-light text-white rounded-lg 
                   hover:bg-night-medium transition-colors duration-300
                   border border-night-light hover:border-flame-orange/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Вернуться на главную
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Thanks;

