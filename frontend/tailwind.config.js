/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        status: {
          applied: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
          interview: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
          offer: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
          rejected: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
          withdrawn: { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' },
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
