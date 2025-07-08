/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#174B8A',
        secondary: '#4FC3F7',
        light: '#F5F7FA',
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Poppins', 'Montserrat', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
