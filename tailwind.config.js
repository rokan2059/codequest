/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0505',
        primary: '#7f1d1d',
        secondary: '#064e3b',
      }
    },
  },
  plugins: [],
}
