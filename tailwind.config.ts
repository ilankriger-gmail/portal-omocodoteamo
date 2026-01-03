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
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Cores da marca
        brand: {
          red: "#dc2626",
          yellow: "#facc15",
          purple: "#9333ea",
        },
        // Cores semânticas para botões
        primary: {
          DEFAULT: "#000000",
          border: "#dc2626",
        },
        secondary: {
          DEFAULT: "#000000",
          border: "#3f3f46",
        },
        accent: {
          DEFAULT: "#000000",
          border: "#9333ea",
        },
        // Superfícies (dark theme)
        surface: {
          DEFAULT: "#09090b",
          raised: "#18181b",
          overlay: "#27272a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
