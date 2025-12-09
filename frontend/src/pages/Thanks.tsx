import { motion } from 'framer-motion';
import Logo from '../components/Logo';

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
            <Logo className="mb-8" delay={0.1} />

        </motion.div>

        {/* Thank you message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h1 text-center mb-4 questions-title-glow"
        >
          Спасибо!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-script text-2xl md:text-3xl text-white-300 opacity-90 mb-8"
        >
          Вы добавили света в этот мир
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-text-muted mb-8"
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

