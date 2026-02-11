/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#15202b',
          panel: '#1e2732',
          border: '#38444d',
          hover: '#253341',
          text: {
            primary: '#e5e7eb',
            secondary: '#8b98a5',
            muted: '#6b7b8c',
          },
        },
      },
      boxShadow: {
        'dark-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.26)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.26)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.24)',
        'dark-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'dark-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.26)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(56, 68, 77, 0.5)',
        'card-hover': '0 8px 16px rgba(0, 0, 0, 0.15)',
        'card-hover-dark': '0 8px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 68, 77, 0.6)',
      },
    },
  },
  plugins: [],
};
