/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d8eeff',
          500: '#1496ff',
          600: '#0a7bde',
          700: '#075dae',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};


