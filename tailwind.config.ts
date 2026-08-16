import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Trustworthy, scholarly Christian palette. Semantic tokens are wired
        // to CSS variables in globals.css so light/dark stay consistent.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        parchment: "rgb(var(--color-parchment) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--color-brand) / <alpha-value>)",
          soft: "rgb(var(--color-brand-soft) / <alpha-value>)",
        },
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      maxWidth: {
        reading: "44rem",
      },
    },
  },
  plugins: [],
};

export default config;
