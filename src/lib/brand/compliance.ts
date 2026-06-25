import { BRAND } from "@/components/ui/brand-tokens";

export interface BrandComplianceCheck {
  page: string;
  checks: {
    name: string;
    passed: boolean;
    details?: string;
  }[];
}

const requiredColors = [
  { name: "Navy", hex: "#0A1628" },
  { name: "Orange", hex: "#FF6B00" },
  { name: "Success Green", hex: "#16A34A" },
  { name: "Warning Amber", hex: "#D97706" },
  { name: "Error Red", hex: "#DC2626" },
  { name: "Info Blue", hex: "#2563EB" },
];

const voiceRules = {
  avoid: [
    "ALL CAPS in body text",
    "Technical jargon to customers",
    "Excessive apology",
    "Vague error messages",
    "Passive voice",
  ],
  require: [
    "Direct, warm tone",
    "Active voice",
    "Short sentences (under 20 words)",
    "₦ for Nigerian Naira",
    "Sentence case in body text",
  ],
};

export const brandCompliance = {
  colors: requiredColors,
  voiceRules,
  typography: {
    primary: "Inter",
    mono: "JetBrains Mono",
    weights: ["400", "500", "600", "700", "800", "900"],
    forbidden: ["100", "200", "300"],
  },
  buttons: {
    primary: "Orange background, white text, 8px radius",
    secondary: "Navy background, white text, 8px radius",
    outline: "Border matching text, transparent background",
    sentence_case: true,
  },
  cards: {
    radius: "12px",
    border: "1px solid #E2E8F0",
    shadow: "shadow-sm (default), shadow-md (hover)",
  },
  subBrands: Object.entries(BRAND.subBrands).map(([key, value]) => ({
    key,
    name: value.name,
    accent: value.accent,
    bgTint: value.bgTint,
  })),
};
