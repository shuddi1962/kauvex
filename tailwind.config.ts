import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0A1628",
        orange: {
          DEFAULT: "#FF6B00",
          50: "#FFF3EB",
          100: "#FFE0CC",
          200: "#FFC299",
          300: "#FFA366",
          400: "#FF8533",
          500: "#FF6B00",
          600: "#CC5500",
          700: "#994000",
          800: "#662B00",
          900: "#331500",
        },
        blue: {
          DEFAULT: "#1641C4",
          50: "#EEF2FF",
          100: "#D9E2FF",
          200: "#B3C5FF",
          300: "#8DA8FF",
          400: "#4D73E8",
          500: "#1641C4",
          600: "#1236A8",
          700: "#0E2B8C",
          800: "#0A2070",
          900: "#061554",
        },
        red: {
          DEFAULT: "#DC2626",
          50: "#FEF2F2",
          100: "#FDE8E8",
          200: "#FBD0D0",
          300: "#F8A8A9",
          400: "#E84849",
          500: "#DC2626",
          600: "#B91C1C",
          700: "#991B1B",
          800: "#7F1D1D",
          900: "#54080A",
        },
        "off-white": "#FFFFFF",
        border: "#E5E7EB",
        "text-1": "#0A1628",
        "text-2": "#1F2937",
        "text-3": "#4B5563",
        "text-4": "#6B7280",
        success: "#16A34A",
        warning: "#D97706",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        syne: ["Syne", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        shimmer: "shimmer 2s infinite linear",
        marquee: "marquee 30s linear infinite",
        "marquee-fast": "marquee 15s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      boxShadow: {
        "soft": "0 2px 15px rgba(0,0,0,0.04)",
        "medium": "0 4px 25px rgba(0,0,0,0.07)",
        "strong": "0 8px 40px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
