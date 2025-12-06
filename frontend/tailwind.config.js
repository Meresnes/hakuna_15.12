/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'great-vibes': ['Great Vibes', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        flame: {
          red: '#ff4136',
          yellow: '#ffdc00',
          white: '#fffef0',
          orange: '#ff851b',
        },
        night: {
          dark: '#0a0a0f',
          medium: '#151520',
          light: '#1f1f2e',
        },
        gold: {
          DEFAULT: '#C4B68A',
          accent: '#FFD86A',
        },
      },
      animation: {
        'flame-rise': 'flameRise 4s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        flameRise: {
          '0%': { 
            transform: 'translateY(0) scale(1)',
            opacity: '1',
          },
          '100%': { 
            transform: 'translateY(-100vh) scale(0.5)',
            opacity: '0',
          },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px currentColor',
          },
          '50%': { 
            boxShadow: '0 0 40px currentColor',
          },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

