export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#FAF8F5',
        surface: '#FFFFFF',
        sunken: '#F2EFE9',
        overlay: '#EFEDE7',
        accent: {
          DEFAULT: '#2D6A4F',
          hover: '#245C43',
          muted: '#D8EDDF',
          text: '#1A4535',
        },
        border: {
          DEFAULT: '#E5E0D8',
          strong: '#C9C2B8',
        },
        ink: {
          DEFAULT: '#1C1917',
          secondary: '#78716C',
          tertiary: '#A8A29E',
        },
      },
      fontFamily: {
        display: ['Lora', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04)',
        elevated: '0 4px 12px rgba(28,25,23,0.08)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '350ms',
      },
    },
  },
  plugins: [],
}
