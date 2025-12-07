/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Cinzel', 'Playfair Display', 'PT Serif', 'serif'],
        'script': ['Great Vibes', 'Dancing Script', 'cursive'],
        'sans': ['Inter', 'Roboto', 'PT Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        /* Legacy support */
        'cinzel': ['Cinzel', 'serif'],
        'great-vibes': ['Great Vibes', 'cursive'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        bg: {
          900: '#0A0A0A',
          800: '#121212',
        },
        gold: {
          100: '#FFF4D9',
          300: '#FFD86A',
          500: '#D4AF37',
          700: '#9A7427',
          DEFAULT: '#D4AF37',
        },
        sparkle: '#EEDFA4',
        text: {
          'on-dark': '#FFF8EA',
          'muted': '#BFAF8A',
        },
        divider: 'rgba(255,255,255,0.06)',
        danger: '#E05A3A',
        'focus-ring': '#FFD78A',
        /* Legacy support */
        flame: {
          red: '#ff4136',
          yellow: '#ffdc00',
          white: '#fffef0',
          orange: '#ff851b',
        },
        night: {
          dark: '#0A0A0A',
          medium: '#121212',
          light: '#1f1f2e',
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

