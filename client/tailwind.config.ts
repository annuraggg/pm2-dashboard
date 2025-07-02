/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        shake: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-4px)' },
          '40%, 60%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.7s both',
        'shake': 'shake 0.4s',
      },
    },
  },
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust to your source code location
  ],
  plugins: [],
}