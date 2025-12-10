import { motion } from 'framer-motion';
import { QUESTIONS } from '../constants/questions';
import { QuestionItem } from './QuestionItem';
import Logo from "@/components/Logo.tsx";

interface QuestionsCardProps {
  /** Whether to show answers */
  showAnswers: boolean;
}

/**
 * Card container for all questions with staggered animation
 */
export function QuestionsCard({ showAnswers }: QuestionsCardProps) {
  const staggerDelay = 120; // ms between each question

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-6xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[88rem] mx-auto px-2 sm:px-0"
    >

        <Logo className="mb-14 md:mb-18 lg:mb-14" delay={0.1} glowScale={0.62} />
      {/* Glassmorphism card */}
      <div className="questions-card rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-7">
        <div className="questions-card__scroll space-y-6 md:space-y-7 lg:space-y-8">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h1 text-center mb-7 md:mb-8 lg:mb-9 questions-title-glow"
        >
          Вопросы
        </motion.h1>

        {/* Questions list */}
        <div className="space-y-6 md:space-y-8 lg:space-y-9">
          {QUESTIONS.map((question, index) => (
            <QuestionItem
              key={question.id}
              number={question.id}
              text={question.text}
              answer={question.answer}
              showAnswer={showAnswers}
              delay={index * staggerDelay}
              className="text-base md:text-[1.05rem] leading-[1.45]"
            />
          ))}
        </div>

        {/* Accessibility: announce when answers are revealed */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {showAnswers ? 'Ответы показаны' : ''}
        </div>
        </div>
      </div>
    </motion.div>
  );
}

export default QuestionsCard;



