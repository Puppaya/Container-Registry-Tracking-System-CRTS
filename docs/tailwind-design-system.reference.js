/**
 * Modern Enterprise Professional — Tailwind Config Reference
 *
 * CRTS uses Nuxt 4 + Tailwind CSS v4. Tokens are defined in:
 *   app/assets/css/design-tokens.css  (@theme block)
 *
 * If your project uses tailwind.config.js (Tailwind v3), use this equivalent:
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: '#faf8ff',
        'surface-container-low': '#f3f3fd',
        'on-surface': '#1a1c24',
        'on-surface-variant': '#434654',
        primary: {
          DEFAULT: '#003d9b',
          container: '#0052cc',
          50: '#e8f0fa',
          100: '#d1e1f5',
          200: '#a3c3eb',
          300: '#6a9fd9',
          400: '#3378c4',
          500: '#003d9b',
          600: '#0052cc',
          700: '#002f75',
          800: '#002050',
          900: '#00102a',
        },
        success: {
          DEFAULT: '#36B37E',
          500: '#36B37E',
          600: '#2d9668',
        },
        warning: {
          DEFAULT: '#FFAB00',
          500: '#FFAB00',
          600: '#d99100',
        },
        danger: {
          DEFAULT: '#DE350B',
          500: '#DE350B',
          600: '#c42e0a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Lao', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['IBM Plex Sans', 'Noto Sans Lao', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'headline-xl': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'headline-lg': ['2rem', { lineHeight: '1.25', fontWeight: '600' }],
        'headline-md': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.5' }],
        'body-md': ['1rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
      },
      spacing: {
        unit: '4px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '40px',
      },
      borderRadius: {
        md: '0.375rem',
      },
    },
  },
  plugins: [],
}
