import { motion } from 'framer-motion';

function Thanks() {

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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32">
                <defs>
                    <radialGradient id="iconFlame" cx="35%" cy="70%" r="60%">
                        <stop offset="0%" stop-color="#fffef0"/>
                        <stop offset="40%" stop-color="#ffdc00"/>
                        <stop offset="80%" stop-color="#ff851b"/>
                        <stop offset="100%" stop-color="#ff4136"/>
                    </radialGradient>
                </defs>

                <path d="M 12 28
           C 8 26 6 22 6 18
           C 6 14 8 10 10 6
           C 11 4 12 2 12 2
           C 12 2 13 4 14 6
           C 16 10 18 14 18 18
           C 18 22 16 26 12 28 Z"
                      fill="url(#iconFlame)"/>

                <ellipse cx="12" cy="14" rx="3" ry="8" fill="#fffef0" opacity="0.8"/>
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
          {/*Пусть ваш свет освещает путь другим!*/}
        </motion.p>

        {/* Back button */}
        {/*<motion.button*/}
        {/*  initial={{ opacity: 0, y: 20 }}*/}
        {/*  animate={{ opacity: 1, y: 0 }}*/}
        {/*  transition={{ delay: 0.8 }}*/}
        {/*  onClick={() => navigate('/')}*/}
        {/*  className="px-8 py-3 bg-night-light text-white rounded-lg */}
        {/*           hover:bg-night-medium transition-colors duration-300*/}
        {/*           border border-night-light hover:border-flame-orange/50"*/}
        {/*  whileHover={{ scale: 1.05 }}*/}
        {/*  whileTap={{ scale: 0.95 }}*/}
        {/*>*/}
        {/*  Вернуться на главную*/}
        {/*</motion.button>*/}
      </motion.div>
    </div>
  );
}

export default Thanks;

