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
        sans: ['Sora', 'system-ui', 'sans-serif'],
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
        /* IAplicada Brand Colors - Full palette */
        aplicada: {
          green: {
            900: "hsl(73, 64%, 32%)",  /* #738925 - Darkest */
            800: "hsl(73, 54%, 39%)",  /* #889C2D - Dark */
            700: "hsl(73, 55%, 47%)",  /* #9EB038 - Primary */
            600: "hsl(73, 37%, 58%)",  /* #BCC95D - Subtitle */
            500: "hsl(73, 35%, 65%)",  /* #C8D27B - Secondary */
            400: "hsl(73, 40%, 75%)",  /* Light accent */
            300: "hsl(73, 45%, 85%)",  /* Lighter */
            200: "hsl(73, 50%, 92%)",  /* Very light */
            100: "hsl(63, 45%, 94%)",  /* #F6F7E9 - Off-white */
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