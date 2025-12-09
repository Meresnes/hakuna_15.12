import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  delay?: number;
}

function Logo({ className = '', delay = 0 }: LogoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`flex justify-center ${className}`}
      style={{ overflow: 'visible' }}
    >
      <div
          // className="light-burst-effect"
      >
        <img
          src="/Logo.jpg"
          alt="Logo"
          className="h-64 sm:h-36 md:h-80 w-auto rounded-2xl relative z-10"
          style={{
            // filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.1)) drop-shadow(0 0 16px rgba(212, 175, 55, 0.2))',
          }}
        />
      </div>
    </motion.div>
  );
}

export default Logo;

