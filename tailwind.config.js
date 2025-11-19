/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'game': ['"Fredoka One"', 'cursive'],
      },
      colors: {
        danger: '#FF4444',
        neon: {
          magenta: '#FF00FF',
          cyan: '#00FFFF',
          pink: '#FF1493',
        },
        safe: {
          green: '#2ECC71',
          gold: '#F1C40F',
        },
      },
      borderRadius: {
        'chunky': '1.5rem',
      },
    },
  },
  plugins: [],
}
