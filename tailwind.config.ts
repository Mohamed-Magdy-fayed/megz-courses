import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#212529",
        primary: "#1976d2",
        success: "#2e7d32",
        info: "#0288d1",
        warning: "#ed6c02",
        error: "#d32f2f",
        secondary: "#9c27b0",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
} satisfies Config;
