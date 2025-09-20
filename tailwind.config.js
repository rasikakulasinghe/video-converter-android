/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2f6690",
        secondary: "#3a7ca5",
        neutral: "#d9dcd6",
      },
    },
  },
  plugins: [],
};