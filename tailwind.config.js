import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: '#1f1f1f',
      },
      boxShadow: {
        premium: '0 18px 40px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        premiumlight: {
          primary: '#1d1d1f',
          secondary: '#f5f5f7',
          accent: '#ed6a5a',
          neutral: '#2d2d2d',
          'base-100': '#ffffff',
          'base-200': '#f8f8f8',
          'base-300': '#efefef',
          info: '#4f46e5',
          success: '#16a34a',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
  },
}

