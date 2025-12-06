/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'flash': 'flash 1s infinite',
      },
      keyframes: {
        flash: {
          '0%, 50%': { opacity: '1' },
          '25%, 75%': { opacity: '0.5' },
        }
      }
    },
  },
  plugins: [],
}
