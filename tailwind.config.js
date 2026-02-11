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
            primary: '#ffffff',
            secondary: '#8b98a5',
            muted: '#6b7b8c',
          },
        },
      },
    },
  },
  plugins: [],
};
