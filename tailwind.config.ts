/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          "canna-green": "#00CC00",
          "neon-pink": "#FF66CC",
          "neon-blue": "#66CCFF",
        },
      },
    },
    plugins: [],
  };