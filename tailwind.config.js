/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  content: [],
  theme: {
    extend: {
      colors: {
        lof: {
          100: "#08110b",
          200: "#142019",
          300: "#045124",
          400: "#71d471"
        }
      },
      backgroundImage: ({ theme }) => ({
          greenGradient: `linear-gradient(9deg, ${theme("colors.lof.200")}, ${theme("colors.lof.300")})`
      })
    },
  },
  plugins: [],
}
