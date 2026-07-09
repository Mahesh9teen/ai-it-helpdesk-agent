/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Hope UI palette
        hope: {
          primary: '#3a57e8',
          'primary-dark': '#2c46cc',
          secondary: '#8a92a6',
          success: '#1aa053',
          danger: '#c03221',
          warning: '#ffb02b',
          info: '#079aa2',
          canvas: '#f5f6fa',
          card: '#ffffff',
          ink: '#232d42',
          muted: '#8a92a6',
          border: '#e9ecef',
        },
      },
      boxShadow: {
        soft: '0 12px 35px -16px rgba(15, 23, 42, 0.35)',
        hope: '0px 2px 20px -6px rgba(35, 45, 66, 0.12)',
        'hope-lg': '0px 10px 30px -12px rgba(35, 45, 66, 0.18)',
      },
      borderRadius: {
        hope: '1rem',
      },
    },
  },
  plugins: [
    function({ addUtilities, theme }) {
      addUtilities({
        '.border-hope-border': { 'border-color': theme('colors.hope.border') },
        '.border-hope-ink': { 'border-color': theme('colors.hope.ink') },
        '.bg-hope-canvas': { 'background-color': theme('colors.hope.canvas') },
        '.bg-hope-primary': { 'background-color': theme('colors.hope.primary') },
        '.bg-hope-card': { 'background-color': theme('colors.hope.card') },
        '.text-hope-ink': { 'color': theme('colors.hope.ink') },
        '.text-hope-secondary': { 'color': theme('colors.hope.secondary') },
        '.text-hope-primary': { 'color': theme('colors.hope.primary') },
        '.shadow-hope': { 'box-shadow': theme('boxShadow.hope') },
      })
    }
  ],
}
