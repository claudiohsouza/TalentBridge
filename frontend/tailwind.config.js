/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cursor: {
          bg: '#0f1117',
          'bg-light': '#1a1c25',
          'bg-lighter': '#2a2c35',
          primary: '#5a5cd1',
          'primary-dark': '#4a4cb0',
          'primary-light': '#7a7ce1',
          accent: '#fc7b54',
          'accent-light': '#fd9b7c',
          'text-primary': '#ffffff',
          'text-secondary': '#a0aec0',
          'text-tertiary': '#718096',
          border: '#2d2f39',
          'border-light': '#3d3f49',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'cursor': '0 4px 14px 0 rgba(0, 0, 0, 0.25)',
        'cursor-lg': '0 10px 25px 0 rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
}

