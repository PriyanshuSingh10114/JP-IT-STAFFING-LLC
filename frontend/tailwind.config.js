// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0A66C2',
        secondary: '#0B63BB',
        dark: '#0A192F',
        light: '#F3F2EF',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
