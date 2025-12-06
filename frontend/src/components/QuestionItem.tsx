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
      <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-gold/20 border border-gold/40">
        <span className="font-cinzel text-lg md:text-xl font-bold text-gold">
          {number}
        </span>
      </div>

      {/* Question text */}
      <div className="flex-1 pt-1 md:pt-2">
        <p className="font-inter text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">
          {text}
        </p>
      </div>

      {/* Answer */}
      <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
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
            className="answer-glow w-full h-full flex items-center justify-center rounded-full bg-gold-accent/20 border-2 border-gold-accent"
          >
            <span className="font-cinzel text-2xl md:text-3xl lg:text-4xl font-bold text-gold-accent">
              {answer}
            </span>
          </motion.div>
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-full bg-white/5 border border-white/10">
            <span className="font-cinzel text-2xl md:text-3xl text-white/20">?</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default QuestionItem;



