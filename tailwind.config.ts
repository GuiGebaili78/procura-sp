import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      // === SISTEMA DE CORES PROCURA SP ===
      colors: {
        // Cores base
        border: "hsl(var(--border))",
        "border-input": "hsl(var(--border-input))",
        ring: "hsl(var(--border-focus))",
        
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Cores de interface
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        
        // Cores primárias da marca
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary-light))",
          accent: "hsl(var(--primary-accent))",
          hover: "hsl(var(--primary-hover))",
        },
        
        // Cores secundárias
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "hsl(var(--secondary-hover))",
          light: "hsl(var(--secondary-light))",
        },
        
        // Cores de status
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          light: "hsl(var(--success-light))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          light: "hsl(var(--warning-light))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
          light: "hsl(var(--error-light))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          light: "hsl(var(--info-light))",
        },
        
        // Aliases para compatibilidade
        accent: "hsl(var(--secondary))",
        "gradient-start": "hsl(var(--gradient-start))",
        "gradient-mid": "hsl(var(--gradient-mid))",
        "gradient-end": "hsl(var(--gradient-end))",
        "gradient-accent": "hsl(var(--gradient-accent))",
        
        // Texto semântico
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-muted": "hsl(var(--text-muted))",
      },
      
      // === CUSTOMIZAÇÕES ===
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
        sans: ["Roboto", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-in-up": "fadeInUp 0.4s ease-out",
      },
      
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
    },
  },
  
  plugins: [],
};

export default config;