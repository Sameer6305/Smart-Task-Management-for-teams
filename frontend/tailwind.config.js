/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ─── Typography ─── */
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },

      /* ─── Custom Indigo Palette (Primary) ─── */
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },

      /* ─── Custom Spacing ─── */
      spacing: {
        '4.5': '1.125rem',   // 18px
        '13':  '3.25rem',    // 52px
        '15':  '3.75rem',    // 60px
        '18':  '4.5rem',     // 72px
        '22':  '5.5rem',     // 88px
        '72':  '18rem',      // 288px
        '84':  '21rem',      // 336px
        '88':  '22rem',      // 352px
        '92':  '23rem',      // 368px
        '100': '25rem',      // 400px
        '120': '30rem',      // 480px
      },

      /* ─── Border Radius ─── */
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      /* ─── Elevated Card Shadows ─── */
      boxShadow: {
        'card':       '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'elevated':   '0 20px 40px -12px rgba(0, 0, 0, 0.12)',
        'glow':       '0 0 20px rgba(99, 102, 241, 0.25)',
        'glow-lg':    '0 0 40px rgba(99, 102, 241, 0.35)',
        'inner-glow': 'inset 0 1px 2px rgba(99, 102, 241, 0.15)',
      },

      /* ─── Keyframes ─── */
      keyframes: {
        slideIn: {
          '0%':   { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',      opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      /* ─── Animations ─── */
      animation: {
        'slide-in':  'slideIn 0.35s ease-out',
        'fade-in':   'fadeIn 0.3s ease-out',
        'scale-in':  'scaleIn 0.25s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'shimmer':   'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
