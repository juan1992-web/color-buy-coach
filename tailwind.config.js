/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beauty: {
          pink: '#FF6B9D',
          purple: '#8B5CF6',
          red: '#EF4444',
          blue: '#3B82F6',
          light: '#FFF5F7',
        }
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translate3d(0, 20px, 0)',
          },
          'to': {
            opacity: '1',
            transform: 'translate3d(0, 0, 0)',
          },
        },
      },
    },
  },
  plugins: [],
}