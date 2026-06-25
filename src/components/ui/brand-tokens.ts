export const BRAND = {
  name: "KAUVEX",
  tagline: "Everything. Everywhere. Delivered.",
  colors: {
    navy: "#0A1628",
    "navy-light": "#0F2040",
    "navy-dark": "#060F1A",
    "navy-tint": "#EEF2F7",
    orange: "#FF6B00",
    "orange-light": "#FF8C3A",
    "orange-dark": "#CC5500",
    "orange-tint": "#FFF4EC",
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    info: "#2563EB",
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
      inverse: "#FFFFFF",
    },
    bg: {
      page: "#F5F7FA",
      card: "#FFFFFF",
    },
    border: "#E2E8F0",
  },
  subBrands: {
    express: {
      name: "KAUVEX EXPRESS",
      tagline: "Fast. Reliable. Tracked.",
      accent: "#FF6B00",
      bgTint: "#FFF4EC",
    },
    logistics: {
      name: "KAUVEX LOGISTICS",
      tagline: "Your delivery. Our network.",
      accent: "#0A1628",
      bgTint: "#EEF2F7",
    },
    fbk: {
      name: "KAUVEX FBK",
      tagline: "We store it. We pack it. We ship it.",
      accent: "#059669",
      bgTint: "#ECFDF5",
    },
    pay: {
      name: "KAUVEX PAY",
      tagline: "Pay smart. Buy now.",
      accent: "#D97706",
      bgTint: "#FFFBEB",
    },
    live: {
      name: "KAUVEX LIVE",
      tagline: "Shop the moment.",
      accent: "#DC2626",
      bgTint: "#FFF1F2",
    },
    partners: {
      name: "KAUVEX PARTNERS",
      tagline: "Earn by sharing what you love.",
      accent: "#7C3AED",
      bgTint: "#F5F3FF",
    },
    originals: {
      name: "KAUVEX ORIGINALS",
      tagline: "Made for Kauvex.",
      accent: "#D97706",
      bgTint: "#FFFBEB",
    },
    forBusiness: {
      name: "KAUVEX FOR BUSINESS",
      tagline: "Scale with confidence.",
      accent: "#0A1628",
      bgTint: "#EEF2F7",
    },
  },
  gradients: {
    navyToDeep: "linear-gradient(135deg, #0A1628 0%, #060F1A 100%)",
    orangeToDeep: "linear-gradient(135deg, #FF6B00 0%, #CC5500 100%)",
    heroGradient: "linear-gradient(135deg, #0A1628 0%, #0F2040 50%, #0A1628 100%)",
  },
  fonts: {
    sans: "Inter, system-ui, sans-serif",
    mono: "JetBrains Mono, monospace",
    display: "Plus Jakarta Sans, Inter, sans-serif",
  },
  shadows: {
    card: "0 1px 3px rgba(0,0,0,0.08)",
    cardHover: "0 4px 12px rgba(0,0,0,0.12)",
    modal: "0 20px 60px rgba(0,0,0,0.15)",
    navbar: "0 1px 3px rgba(0,0,0,0.06)",
  },
} as const;

export type SubBrand = keyof typeof BRAND.subBrands;
export type BrandColor = keyof typeof BRAND.colors;
