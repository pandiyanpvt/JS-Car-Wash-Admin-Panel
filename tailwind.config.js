/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8ebf0',
          100: '#d1d7e1',
          200: '#a3afc3',
          300: '#7587a5',
          400: '#475f87',
          500: '#2a3d5c',
          600: '#1f2d47',
          700: '#152234',
          800: '#0f1721',
          900: '#0a0f16',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
      },
    },
  },
  plugins: [],
}

