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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
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
        lime: "hsl(var(--lime))",
        olive: "hsl(var(--olive))",
        sage: "hsl(var(--sage))",
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
          dark: "hsl(72, 6%, 18%)",     /* #2F302B - Dark base */
          light: "hsl(0, 0%, 100%)",    /* #FFFFFF */
          gray: "hsl(72, 6%, 18%)",     /* #2F302B */
          cream: "hsl(63, 45%, 94%)",   /* #F6F7E9 - Off-white */
          text: "hsl(63, 48%, 91%)",    /* #E9EBC6 - Text on dark */
        },
        complexity: {
          high: "hsl(var(--complexity-high))",
          medium: "hsl(var(--complexity-medium))",
          low: "hsl(var(--complexity-low))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;