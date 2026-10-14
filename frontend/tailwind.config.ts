import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          elevated: 'var(--bg-elevated)',
          hover: 'var(--bg-hover)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          warning: 'var(--accent-warning)',
          negative: 'var(--accent-negative)',
          positive: 'var(--accent-positive)',
        },
        border: {
          default: 'var(--border-default)',
          hover: 'var(--border-hover)',
          active: 'var(--border-active)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.3)',
        md: '0 4px 12px rgba(0,0,0,0.25)',
        lg: '0 8px 24px rgba(0,0,0,0.3)',
      },
      transitionDuration: {
        fast: '120ms',
        normal: '200ms',
        slow: '350ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
} satisfies Config
