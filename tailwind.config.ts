import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Royal Burgundy Palette
        brand: {
          50: '#fdf2f4',
          100: '#fbe4e8',
          200: '#f7cdd5',
          300: '#f1a7b6',
          400: '#e7738c',
          500: '#d74567',
          600: '#b82649',
          700: '#9b1b3b',
          800: '#811833',
          900: '#5b0e2d', // Royal Burgundy Primary
          950: '#380419',
        },
        // Champagne Gold Palette
        gold: {
          50: '#fdfbf5',
          100: '#f9f4e6',
          200: '#f2e6c4',
          300: '#e9d399',
          400: '#dfbc6c',
          500: '#d4af37', // Metallic Champagne Gold
          600: '#bfa02c',
          700: '#9f8222',
          800: '#7f661d',
          900: '#64501a',
          950: '#3a2e0a',
        },
        // Royal Navy Palette
        navy: {
          50: '#f0f5fa',
          100: '#e1eaf3',
          200: '#c5d7e7',
          300: '#9abdd6',
          400: '#699ec1',
          500: '#4683ab',
          600: '#34698e',
          700: '#2c5473',
          800: '#1e384d',
          900: '#0f1f2e',
          950: '#0a141f',
        },
        ivory: {
          50: '#ffffff',
          100: '#fdfbf7',
          200: '#faf7f2',
          300: '#f5f0e6',
          400: '#eae0cf',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        border: 'var(--border)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Playfair Display', 'serif'],
      },
      boxShadow: {
        luxury: '0 20px 40px -15px rgba(91, 14, 45, 0.12)',
        'glow-gold': '0 0 25px -5px rgba(212, 175, 55, 0.35)',
        'glow-burgundy': '0 0 25px -5px rgba(91, 14, 45, 0.35)',
        royal: '0 10px 30px -5px rgba(91, 14, 45, 0.08), 0 0 0 1px rgba(212, 175, 55, 0.18)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
