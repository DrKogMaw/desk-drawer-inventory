/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36a9f7',
          500: '#0c8de9',
          600: '#026fc7',
          700: '#0358a1',
          800: '#074b83',
          900: '#0c3f6e',
          950: '#082849',
        },
        drawer: {
          woodLight: '#d97706',
          woodDark: '#78350f',
          handle: '#e2e8f0',
          handleDark: '#334155',
        }
      },
      boxShadow: {
        'drawer': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'drawer-active': '0 10px 15px -3px rgba(12, 141, 233, 0.3), 0 4px 6px -2px rgba(12, 141, 233, 0.15)',
        'glow': '0 0 20px rgba(12, 141, 233, 0.35)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
