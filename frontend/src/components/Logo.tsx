import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  delay?: number;
  glowScale?: number;
}

type Sparkle = {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration?: number;
};

const RAY_COUNT = 20;

const SPARKLES: Sparkle[] = [
  { x: 18, y: 30, size: 12, delay: 0.4, duration: 7.2 },
  { x: 72, y: 26, size: 10, delay: 1.1, duration: 8.6 },
  { x: 44, y: 18, size: 9, delay: 2.3, duration: 7.8 },
  { x: 30, y: 66, size: 11, delay: 3.1, duration: 9.2 },
  { x: 64, y: 70, size: 10, delay: 4.5, duration: 8.4 },
  { x: 12, y: 48, size: 8, delay: 5.4, duration: 9.6 },
];

function Logo({ className = '', delay = 0, glowScale = 1 }: LogoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`flex justify-center ${className}`}
      style={{ overflow: 'visible' }}
    >
      <div className="relative inline-flex items-center justify-center overflow-visible">
        <div
          className="logo-glow"
          aria-hidden
          style={{ transform: `scale(${glowScale})` }}
        >
          <motion.div
            className="logo-glow__halo logo-glow__halo--outer"
            animate={{
              opacity: [0.6, 0.82, 0.6],
              scale: [0.98, 1.04, 0.98],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay,
            }}
          />

          <motion.div
            className="logo-glow__halo logo-glow__halo--inner"
            animate={{
              opacity: [0.78, 0.95, 0.78],
              scale: [1, 1.06, 1],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: delay + 0.2,
            }}
          />

          <motion.div
            className="logo-sunburst"
            animate={{
              rotate: [0, -0.8, 0.8, 0],
              scale: [1, 1.02, 1],
              opacity: [0.7, 0.85, 0.7],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: delay + 0.1,
            }}
          >
            {Array.from({ length: RAY_COUNT }).map((_, index) => {
              const angle = (index / RAY_COUNT) * 360;

              return (
                <span
                  key={angle}
                  className="logo-sunburst__ray"
                  style={{
                    transform: `translate(-50%, 0) rotate(${angle}deg)`,
                  }}
                />
              );
            })}
          </motion.div>

          <div className="logo-sparkles">
            {SPARKLES.map((sparkle, index) => (
              <span
                key={`${sparkle.x}-${sparkle.y}-${index}`}
                className="logo-sparkle"
                style={{
                  left: `${sparkle.x}%`,
                  top: `${sparkle.y}%`,
                  width: `${sparkle.size}px`,
                  height: `${sparkle.size}px`,
                  animationDelay: `${sparkle.delay}s`,
                  animationDuration: `${sparkle.duration ?? 7}s`,
                }}
              />
            ))}
          </div>
        </div>
        <img
          src="/Logo.jpg"
          alt="Logo"
          className="h-64 sm:h-36 md:h-80 w-auto rounded-2xl relative z-10 shadow-lg"
          style={{
            filter:
              'drop-shadow(0 0 12px rgba(212, 175, 55, 0.28)) drop-shadow(0 0 24px rgba(212, 175, 55, 0.22))',
          }}
        />
      </div>
    </motion.div>
  );
}

export default Logo;

