/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Orange
          600: '#ea580c', // Orange-600
          650: '#d97706',
          700: '#c2410c', // Orange-700
          750: '#b45309',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        teal: {
          50: '#fdf8f6',
          100: '#fcf2ed',
          200: '#f7dfd3',
          300: '#f0c2aa',
          400: '#e39c76',
          500: '#b45309', // Brown
          600: '#92400e',
          700: '#78350f', // Dark Brown
          800: '#451a03',
          900: '#331302',
          950: '#250e01',
        },
        rust: {
          50: '#fdf4f1',
          100: '#fae8e3',
          200: '#f5d1c7',
          300: '#d97706',
          400: '#c2410c',
          500: '#b7410e',
          600: '#9a350a',
          700: '#7d2a08',
          800: '#601f05',
          900: '#431503',
        },
      },
      backgroundColor: {
        primary: '#FFFFFF',
        secondary: '#F8F8F8',
      },
      textColor: {
        primary: '#1F2937',
        secondary: '#6B7280',
      },
      borderColor: {
        light: '#E5E7EB',
      },
    },
  },
  plugins: [],
};
