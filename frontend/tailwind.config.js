/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verde: "#4CAF50",
        crema: "#FFF8E7",
      },
    },
  },
  plugins: [],
}

