export const APP_NAME = "BuatPakeAI";
export const APP_TAGLINE = "Bikin PRD Profesional, Cuma Jawab Pertanyaan!";
export const APP_DESCRIPTION =
  "BuatPakeAI membantu kamu membuat Product Requirements Document (PRD) yang rapi dan profesional — cukup jawab pertanyaan-pertanyaan sederhana, dan sistem akan menghasilkan PRD untukmu secara instan.";

export const PRICING = {
  basic: {
    name: "Basic",
    price: 25000,
    priceLabel: "Rp 25.000",
    perLabel: "/dokumen",
    features: [
      "Tanya jawab interaktif bikin PRD",
      "Generate PRD otomatis",
      "Export file .md (Markdown)",
      "Download template PRD kosong",
    ],
  },
  pro: {
    name: "Pro",
    price: 50000,
    priceLabel: "Rp 50.000",
    perLabel: "/dokumen",
    features: [
      "Semua fitur Basic",
      "Export PDF & DOCX",
      "Preview langsung di browser",
      "Riwayat PRD yang sudah dibuat",
      "Edit PRD setelah jadi",
      "Integrasi export ke Trello / Notion / Google Docs",
    ],
    popular: true,
  },
} as const;

export type PackageType = "basic" | "pro";
