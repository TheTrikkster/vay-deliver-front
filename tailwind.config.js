/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    fontFamily: {
      sans: ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'ui-serif', 'serif'],
      mono: ['Menlo', 'ui-monospace', 'monospace'],
    },
    extend: {
      gridTemplateColumns: {
        'auto-fill': 'repeat(auto-fill, minmax(300px, 1fr))',
      },
    },
  },
  plugins: [],
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
};
