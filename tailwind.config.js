/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17142B',
        paper: '#FBF8F3',
        signal: { DEFAULT: '#5B4BFF', dark: '#4433E0', soft: '#ECEAFF' },
        sun: '#FFB23F',
        coral: { DEFAULT: '#FF6A4D', soft: '#FFE9E3' },
        mint: { DEFAULT: '#12A57C', soft: '#DDF6EE' },
        line: '#E8E2D8',
        mute: '#6E6A80',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
