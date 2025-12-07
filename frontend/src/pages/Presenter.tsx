import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp, CHOICE_COLORS } from '../context/AppContext';
import { useSocket } from '../hooks/useSocket';
import PresenterCanvas from '../components/PresenterCanvas';

function Presenter() {
  const { state, updateState } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { flames, isConnected } = useSocket({
    role: 'presenter',
    onNewVote: (vote) => {
      // Update counts when new vote arrives
      updateState({
        counts: {
          ...state.counts,
          [vote.choice]: (state.counts[vote.choice as keyof typeof state.counts] ?? 0) + 1,
        },
        total: state.total + 1,
      });
    },
    onUpdateCounts: (data) => {
      updateState({
        counts: data.counts,
        total: data.total,
        brightness: data.brightness,
      });
    },
  });

  // Calculate brightness based on total votes
  const brightness = Math.min(
    Math.max(
      state.brightnessRange.min +
        (state.total / state.target) * (state.brightnessRange.max - state.brightnessRange.min),
      state.brightnessRange.min
    ),
    state.brightnessRange.max
  );

  // Preload image
  useEffect(() => {
    const img = new Image();
    img.src = '/4k-earth-surreal-look8.jpg';
    img.onload = () => setImageLoaded(true);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-night-dark"
    >
      {/* Planet background image with brightness filter */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.img
          src="/4k-earth-surreal-look8.jpg"
          alt="Earth from space"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            filter: `brightness(${brightness})`,
            transition: 'filter 0.5s ease-out',
            opacity: imageLoaded ? 1 : 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 1 }}
        />
        
        {/* Dark overlay for better readability */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"
          style={{
            opacity: 1 - (brightness - state.brightnessRange.min) / (state.brightnessRange.max - state.brightnessRange.min) * 0.5,
          }}
        />
      </div>

      {/* Canvas for flames */}
      <PresenterCanvas flames={flames} />

      {/* Stats overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
        <div className="max-w-4xl mx-auto">

          {/* Counts */}
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((choice, index) => (
              <motion.div 
                key={choice}
                className="text-center p-4 rounded-xl bg-night-medium/80 backdrop-blur-md border border-white/10 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: 'easeOut'
                }}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: 'rgba(31, 31, 46, 0.95)',
                }}
              >
                <motion.div 
                  className="w-12 h-12 mx-auto mb-3 flex items-center justify-center"
                  style={{ color: CHOICE_COLORS[choice] }}
                  animate={{
                    filter: [
                      `drop-shadow(0 0 8px ${CHOICE_COLORS[choice]}80)`,
                      `drop-shadow(0 0 16px ${CHOICE_COLORS[choice]}100)`,
                      `drop-shadow(0 0 8px ${CHOICE_COLORS[choice]}80)`,
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <svg
                    fill="currentColor"
                    width="40"
                    height="40"
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 611.999 611.999"
                  >
                    <g>
                      <path d="M216.02,611.195c5.978,3.178,12.284-3.704,8.624-9.4c-19.866-30.919-38.678-82.947-8.706-149.952
                          c49.982-111.737,80.396-169.609,80.396-169.609s16.177,67.536,60.029,127.585c42.205,57.793,65.306,130.478,28.064,191.029
                          c-3.495,5.683,2.668,12.388,8.607,9.349c46.1-23.582,97.806-70.885,103.64-165.017c2.151-28.764-1.075-69.034-17.206-119.851
                          c-20.741-64.406-46.239-94.459-60.992-107.365c-4.413-3.861-11.276-0.439-10.914,5.413c4.299,69.494-21.845,87.129-36.726,47.386
                          c-5.943-15.874-9.409-43.33-9.409-76.766c0-55.665-16.15-112.967-51.755-159.531c-9.259-12.109-20.093-23.424-32.523-33.073
                          c-4.5-3.494-11.023,0.018-10.611,5.7c2.734,37.736,0.257,145.885-94.624,275.089c-86.029,119.851-52.693,211.896-40.864,236.826
                          C153.666,566.767,185.212,594.814,216.02,611.195z"/>
                    </g>
                  </svg>
                </motion.div>
                <div className="text-3xl font-bold text-white mb-1">
                  {state.counts[choice as keyof typeof state.counts]}
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  Выбор {choice}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Connection status indicator (top right) */}
      <motion.div 
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div 
          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          style={{
            boxShadow: isConnected 
              ? '0 0 8px rgba(34, 197, 94, 0.6)' 
              : '0 0 8px rgba(239, 68, 68, 0.6)',
          }}
        />
        {/*<span className="text-xs text-gray-300 font-medium">*/}
        {/*  {isConnected ? 'Подключено' : 'Отключено'}*/}
        {/*</span>*/}
      </motion.div>
    </div>
  );
}

export default Presenter;
