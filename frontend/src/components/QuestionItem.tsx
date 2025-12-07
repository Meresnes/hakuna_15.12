import { motion } from 'framer-motion';

interface QuestionItemProps {
  /** Question number (1-4) */
  number: number;
  /** Question text */
  text: string;
  /** Answer value */
  answer: number;
  /** Whether to show the answer */
  showAnswer: boolean;
  /** Stagger delay in milliseconds */
  delay: number;
}

/**
 * Individual question item with reveal animation
 */
export function QuestionItem({
  number,
  text,
  answer,
  showAnswer,
  delay,
}: QuestionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: delay / 1000,
        ease: 'easeOut',
      }}
      className="flex items-start gap-4 md:gap-6"
    >
      {/* Question number */}
      <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full neumorphic-number">
        <span className="font-display text-xl md:text-2xl lg:text-3xl font-bold text-white-500">
          {number}
        </span>
      </div>

      {/* Question text */}
      <div className="flex-1 pt-1 md:pt-2">
        <p className="font-sans text-2xl md:text-3xl lg:text-4xl text-text-on-dark leading-relaxed">
          {text}
        </p>
      </div>

      {/* Answer */}
      <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center">
        {showAnswer ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.5,
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="answer-glow neumorphic-answer w-full h-full flex items-center justify-center rounded-full"
          >
            <span className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gold-300">
              {answer}
            </span>
          </motion.div>
        ) : (
          <div className="neumorphic-answer-hidden w-full h-full flex items-center justify-center rounded-full">
            <span className="font-display text-3xl md:text-4xl lg:text-5xl text-gold-500/40">?</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default QuestionItem;



