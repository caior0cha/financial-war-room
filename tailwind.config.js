/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      colors: {
        surface: {
          50:  '#FCFCFD',
          100: '#F7F8FA',
          800: '#F2F4F7',
          850: '#EBEEF3',
          900: '#E3E8EF',
          950: '#D8DEE8',
        }
      },
    },
  },
  plugins: [],
}
