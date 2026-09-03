/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light & Dark Mode Tokens specified by MediNexa Design System
        mn: {
          bg: 'var(--mn-bg)',
          surface: 'var(--mn-surface)',
          primary: 'var(--mn-primary)',
          'primary-hover': 'var(--mn-primary-hover)',
          secondary: 'var(--mn-secondary)',
          success: 'var(--mn-success)',
          warning: 'var(--mn-warning)',
          danger: 'var(--mn-danger)',
          text: 'var(--mn-text)',
          muted: 'var(--mn-muted)',
          border: 'var(--mn-border)',
        },
        // Direct palette mapping for Tailwind utility classes
        medinexa: {
          lightBg: '#F8FAFC',
          lightSurface: '#FFFFFF',
          lightPrimary: '#2563EB',
          lightSecondary: '#06B6D4',
          lightSuccess: '#10B981',
          lightWarning: '#F59E0B',
          lightDanger: '#EF4444',
          lightText: '#0F172A',
          lightMuted: '#64748B',
          lightBorder: '#E2E8F0',

          darkBg: '#020617',
          darkSurface: '#0F172A',
          darkPrimary: '#3B82F6',
          darkSecondary: '#22D3EE',
          darkSuccess: '#10B981',
          darkText: '#F8FAFC',
          darkMuted: '#94A3B8',
          darkBorder: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
