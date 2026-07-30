/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cat: {
          yellow: '#FFCD00',
          dark: '#121212',
          card: '#1C1C1E',
          border: '#2C2C2E',
          hover: '#2C2C2E',
          text: '#F2F2F7',
          gray: '#8E8E93',
          orange: '#FF9500',
        }
      }
    },
  },
  plugins: [],
}
