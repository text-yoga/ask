/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ["'Hanken Grotesk Variable', sans-serif"],
      },
    },
  },
  plugins: [],
};
