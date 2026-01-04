import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      fontWeight: {
        thin: '100',
        light: '300',
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
        extrabold: 'var(--font-weight-extrabold)',
        black: '900',
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
      },
      colors: {
        background: "var(--background)",
        foreground: {
          DEFAULT: "var(--foreground)",
          secondary: "var(--foreground-secondary)",
          tertiary: "var(--foreground-tertiary)",
        },
        // Cores da marca
        brand: {
          red: "#dc2626",
          yellow: "#facc15",
          purple: "#9333ea",
          green: "#22C55E",
        },
        // Cores semânticas para botões
        primary: {
          DEFAULT: "#22C55E",
          text: "#FFFFFF",
          border: "#22C55E",
          hover: "#16A34A",
        },
        secondary: {
          DEFAULT: "#000000",
          border: "#4B5563",
          text: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#000000",
          border: "#9333ea",
          text: "#FFFFFF",
        },
        // Superfícies (dark theme)
        surface: {
          DEFAULT: "#09090b",
          raised: "#18181b",
          overlay: "#27272a",
          card: "#1F1F23",
        },
        border: {
          DEFAULT: "#3f3f46",
          light: "#4B5563",
        },
      },
      spacing: {
        'card': 'var(--space-md)', // Padding padrão para cards
        'section': 'var(--space-lg)', // Espaçamento entre seções
        'xs': 'var(--space-xs)',
        'sm': 'var(--space-sm)',
        'md': 'var(--space-md)',
        'lg': 'var(--space-lg)',
        'xl': 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
      },
    },
  },
  plugins: [],
};
export default config;
