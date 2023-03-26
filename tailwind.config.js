/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [],
  theme: {
    extend: {
      colors: {
        lof: {
          100: "var(--siteBackground)",
          200: "var(--secondaryColor)",
          300: "var(--primaryColor)",
          400: "var(--brightGreen)"
        }
      },
      backgroundImage: ({ theme }) => ({
          greenGradient: `linear-gradient(9deg, ${theme("colors.lof.200")}, ${theme("colors.lof.300")})`
      })
    },
  },
  plugins: [],
}
