/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        canvas: '#F1F4F8',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        border: '#E2E8F0',
        navy: {
          DEFAULT: '#17243A',
          900: '#17243A',
          800: '#1E2F4D',
          700: '#2A3F66',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          900: '#17243A',
        },
      },
      spacing: {
        '4.5': '1.125rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
        '18': '4.5rem',
        '68': '17rem',
        '72': '18rem',
        '84': '21rem',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(15, 23, 42, 0.03)',
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'panel': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        'flyout': '0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
