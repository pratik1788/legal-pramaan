import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          500: "#1d6fe0",
          600: "#155fc4",
          700: "#104d9f",
          900: "#0b2f5e",
        },
        saffron: "#f59e0b",
      },
      // Phase 2 (Gujarati): re-add a `guj` font family here backed by the
      // bundled Noto Sans Gujarati in public/fonts.
    },
  },
  plugins: [],
};

export default config;
