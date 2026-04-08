import { TemplateConfig } from "../types";

export const defaultTemplateConfig: TemplateConfig = {
  colors: {
    primary: "#0f172a",
    accent: "#0891b2",
    text: "#111827",
    background: "#ffffff",
  },
  fontFamily: "'Manrope', sans-serif",
  logoPosition: "left",
  sectionOrder: [
    "header",
    "details",
    "items",
    "tax",
    "total",
    "suggestions",
    "footer",
  ],
  showProductImages: true,
  showQrCode: true,
  showSuggestions: true,
};
