import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        /* Quatro papéis fixos: serif no display, tight no título de bloco,
           Inter no corpo, mono no rótulo e no dado. */
        sans: ['Inter', 'system-ui', 'sans-serif'],
        tight: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        chrome: {
          DEFAULT: "hsl(var(--chrome))",
          foreground: "hsl(var(--chrome-foreground))",
          border: "hsl(var(--chrome-border))",
          accent: "hsl(var(--chrome-accent))",
        },
        /* Paleta iaplicada.com */
        lime: {
          DEFAULT: "hsl(var(--lime))",
          glow: "hsl(var(--lime-glow))",
        },
        olive: {
          DEFAULT: "hsl(var(--olive))",
          deep: "hsl(var(--olive-deep))",
        },
        sage: {
          DEFAULT: "hsl(var(--sage))",
          dim: "hsl(var(--sage-dim))",
        },
        amber: "hsl(var(--amber))",
        charcoal: "hsl(var(--charcoal))",
        status: {
          success: "hsl(var(--status-success))",
          warning: "hsl(var(--status-warning))",
          info: "hsl(var(--status-info))",
          danger: "hsl(var(--status-danger))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
          active: "hsl(var(--sidebar-active))",
        },
        /* LP Academy tokens */
        brand: {
          cream: "hsl(var(--brand-cream))",
          "cream-soft": "hsl(var(--brand-cream-soft))",
          strong: "hsl(var(--brand-strong))",
          "strong-foreground": "hsl(var(--brand-strong-foreground))",
          ink: "hsl(var(--brand-ink))",
          hairline: "hsl(var(--brand-hairline))",
        },
        /* IAplicada Brand Colors - Full palette */
        aplicada: {
          // Paleta legada "aplicada-green" mapeada para os tokens da marca:
          // assim as telas antigas seguem o design system (e o escopo escuro
          // dos cards, onde primary vira lima) sem reescrever cada classe.
          green: {
            900: "hsl(var(--brand-strong) / <alpha-value>)",
            800: "hsl(var(--brand-strong) / <alpha-value>)",
            700: "hsl(var(--primary) / <alpha-value>)",
            600: "hsl(var(--lime) / <alpha-value>)",
            500: "hsl(var(--lime) / <alpha-value>)",
            400: "hsl(var(--secondary) / <alpha-value>)",
            300: "hsl(var(--secondary) / <alpha-value>)",
            200: "hsl(var(--secondary) / <alpha-value>)",
            100: "hsl(var(--muted) / <alpha-value>)",
          },
          dark: "hsl(var(--surface))",
          light: "hsl(var(--card))",
          gray: "hsl(var(--surface))",
          cream: "hsl(var(--brand-cream))",
          text: "hsl(var(--foreground))",
        },
        complexity: {
          high: "hsl(var(--complexity-high))",
          medium: "hsl(var(--complexity-medium))",
          low: "hsl(var(--complexity-low))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        card: "20px",
      },
      boxShadow: {
        /* Duas sombras nomeadas, vindas do site, mais o brilho do foco. */
        card: "0 1px 2px 0 rgb(0 0 0 / 0.4), 0 1px 0 0 hsl(var(--border) / 0.6)",
        elevated: "0 30px 60px -20px rgb(0 0 0 / 0.6), 0 8px 20px -8px rgb(0 0 0 / 0.4)",
        glow: "0 0 0 1px hsl(var(--primary) / 0.35), 0 10px 30px -12px hsl(var(--primary) / 0.45)",
      },
      backgroundImage: {
        "gradient-hero": "radial-gradient(ellipse 80% 55% at 50% 0%, hsl(77 32% 8%) 0%, hsl(var(--background)) 65%)",
        "gradient-lime": "linear-gradient(180deg, hsl(var(--lime-glow)) 0%, hsl(var(--lime)) 100%)",
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        shimmer: 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;