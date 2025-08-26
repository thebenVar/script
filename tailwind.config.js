/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#dbeefe',
          200: '#bfe0fd',
          300: '#93ccfb',
          400: '#60b1f7',
          500: '#3791f2',
          600: '#1f72e6',
          700: '#195cc3',
          800: '#194d9d',
          900: '#1a417d'
        }
      },
      boxShadow: {
        'soft': '0 2px 4px -1px rgb(0 0 0 / 0.05), 0 4px 6px -1px rgb(0 0 0 / 0.05)',
        'elevated': '0 4px 12px -2px rgba(0,0,0,0.08),0 8px 20px -2px rgba(0,0,0,0.06)'
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}

