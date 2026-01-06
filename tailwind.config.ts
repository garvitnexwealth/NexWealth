import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060a",
          900: "#0b0f16",
          850: "#111723",
          800: "#1a2233",
          700: "#263248",
        },
        teal: {
          200: "#9ff2e8",
          300: "#66e7d8",
          400: "#2dd4bf",
          500: "#12b8a6",
          600: "#0d9488",
        },
      },
      boxShadow: {
        card: "0 20px 40px rgba(6, 12, 24, 0.5)",
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
