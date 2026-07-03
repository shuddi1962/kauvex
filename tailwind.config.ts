import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A1628",
        "navy-light": "#0F2040",
        "navy-dark": "#060F1A",
        "navy-mid": "#162040",
        orange: "#FF6B00",
        "orange-light": "#FF8C3A",
        "orange-dark": "#CC5500",
        success: "#16A34A",
        warning: "#D97706",
        error: "#DC2626",
        info: "#2563EB",
        "text-1": "#1E293B",
        "text-2": "#334155",
        "text-3": "#64748B",
        "text-4": "#94A3B8",
        "border": "#E2E8F0",
        "bg-page": "#F5F7FA",
        "bg-card": "#FFFFFF",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12)",
        modal: "0 20px 60px rgba(0,0,0,0.15)",
        navbar: "0 1px 3px rgba(0,0,0,0.06)",
        glow: "0 0 24px rgba(255,107,0,0.15)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;