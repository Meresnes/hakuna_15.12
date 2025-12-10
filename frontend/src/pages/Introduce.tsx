import { motion } from 'framer-motion';
import {useNavigate} from "react-router-dom";
import Logo from "@/components/Logo.tsx";

function Introduce() {
    const navigate = useNavigate();

    const handleNavigateToPresenterQuestions = () => {
        navigate('/presenter/questions');
    };

  return (
      <div className="presenter-questions-page min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
          {/* Connection status indicator and controls (small, top-right) */}
          <div className="fixed top-5 right-5 flex items-center gap-2.5 text-sm px-2 py-1.5 rounded-lg ">
              {/* Navigate to presenter button */}
              <button
                  onClick={handleNavigateToPresenterQuestions}
                  className="neumorphic-button px-3 py-1.5 text-gold-500 hover:text-gold-300
                   text-sm rounded-lg"
              >
                  →
              </button>
          </div>

          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full max-w-6xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[88rem] mx-auto px-2 sm:px-0"
          >

              <Logo className="mb-14 md:mb-18 lg:mb-14" delay={0.1} glowScale={0.62} />
              <div className="rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-7 flex justify-center">
                  <img
                      src="/Qr.svg"
                      alt="qr"
                      className="h-64 sm:h-36 md:h-80 w-auto rounded-2xl relative z-10 shadow-lg"
                      style={{
                          filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.28)) drop-shadow(0 0 24px rgba(212, 175, 55, 0.22))'
                      }}
                  />
              </div>
          </motion.div>

      </div>
  );
}

export default Introduce;
