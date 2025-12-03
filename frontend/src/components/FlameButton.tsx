import { motion } from 'framer-motion';

interface FlameButtonProps {
  color: string;
  text: string;
  isSelected?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function FlameButton({ color, text, isSelected, onClick, disabled }: FlameButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-6 rounded-2xl border-2 text-left transition-all duration-300
        ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        borderColor: isSelected ? color : 'rgba(255,255,255,0.1)',
        boxShadow: isSelected ? `0 0 30px ${color}40, 0 0 60px ${color}20` : 'none',
      }}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      {/* Flame icon */}
      <div 
        className="w-12 h-12 mb-4 rounded-full flex items-center justify-center transition-all"
        style={{ 
          backgroundColor: `${color}20`,
          boxShadow: isSelected ? `0 0 20px ${color}60` : 'none',
        }}
      >
        <motion.svg
          className="w-6 h-6"
          fill={color}
          viewBox="0 0 24 24"
          animate={isSelected ? {
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          } : undefined}
          transition={{
            duration: 1.5,
            repeat: isSelected ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <path d="M12 23c-3.866 0-7-3.134-7-7 0-3.866 4-8 7-12 3 4 7 8.134 7 12 0 3.866-3.134 7-7 7zm0-3c2.21 0 4-1.79 4-4 0-2.21-2-5-4-8-2 3-4 5.79-4 8 0 2.21 1.79 4 4 4z" />
        </motion.svg>
      </div>

      {/* Text */}
      <p className="text-white text-sm md:text-base leading-relaxed">
        {text}
      </p>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <svg className="w-4 h-4 text-night-dark" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
      )}

      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${color}10 0%, transparent 70%)`,
        }}
      />
    </motion.button>
  );
}

export default FlameButton;

