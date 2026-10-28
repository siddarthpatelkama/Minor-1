/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        veltech: {
          maroon: '#800000',
          darkMaroon: '#5b0000',
          blue: '#1b365d',
          gold: '#d97706',
          surface: '#0f172a',
          surfaceLight: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
