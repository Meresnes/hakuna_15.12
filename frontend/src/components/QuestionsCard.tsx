import { motion } from 'framer-motion';
import { QUESTIONS } from '../constants/questions';
import { QuestionItem } from './QuestionItem';

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
      className="w-full max-w-6xl mx-auto"
    >
      {/* Glassmorphism card */}
      <div className="questions-card rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h1 text-center mb-8 md:mb-10 lg:mb-12 questions-title-glow"
        >
          Вопросы
        </motion.h1>

        {/* Questions list */}
        <div className="space-y-8 md:space-y-10 lg:space-y-12">
          {QUESTIONS.map((question, index) => (
            <QuestionItem
              key={question.id}
              number={question.id}
              text={question.text}
              answer={question.answer}
              showAnswer={showAnswers}
              delay={index * staggerDelay}
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
    </motion.div>
  );
}

export default QuestionsCard;



