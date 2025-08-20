import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Paleta de cores principal do projeto
        'dark-primary': '#222831',
        'dark-secondary': '#393E46', 
        'accent': '#00ADB5',
        'light-primary': '#EEEEEE',
        // Gradientes
        'gradient-start': '#0e3d42',
        'gradient-end': '#459e95',
        // Cores complementares personalizadas
        'custom-gray': {
          'light': '#F5F5F5',
          'medium': '#CCCCCC', 
          'dark': '#666666',
        },
        // Mantém cores padrão do Tailwind
        'gray': {
          '50': '#F9FAFB',
          '100': '#F3F4F6',
          '200': '#E5E7EB',
          '300': '#D1D5DB',
          '400': '#9CA3AF',
          '500': '#6B7280',
          '600': '#4B5563',
          '700': '#374151',
          '800': '#1F2937',
          '900': '#111827',
        }
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        'sans': ['Roboto', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}
export default config
