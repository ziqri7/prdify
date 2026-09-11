export const APP_NAME = "BuatPakeAI";
export const APP_TAGLINE = "Dari Ide ke PRD Siap Dibangun dengan AI";
export const APP_DESCRIPTION =
  "BuatPakeAI membantu kamu mengubah ide produk menjadi Product Requirements Document (PRD) yang rapi, terstruktur, dan siap ditinjau sebelum dibangun.";

// Pricing model: kombinasi pay-per-use + subscription
// Pay-per-use: Rp 25rb untuk 1 kredit PRD AI
// Starter: Rp 66k/bln — 5 PRD/bln, akses penuh
// Pro: Rp 133k/bln — no monthly PRD quota, subject to fair use.
// Pro Tahunan: Rp 99k/bln (Rp 1.1jt/thn) — Pro benefits at an annual price.

export const PRICING = {
  pay_per_use: {
    id: 'pay_per_use',
    name: "Pay Per Use",
    price: 25000,
    priceLabel: "Rp 25.000",
    perLabel: "/dokumen",
    description: "1 kredit PRD AI, cocok untuk yang jarang bikin",
    features: [
      "1 kredit untuk membuat PRD AI",
      "PRD dibuat dengan DeepSeek Flash",
      "Kredit dipakai setelah PRD berhasil dibuat",
      "Akses penuh & download .md",
      "Semua template & format",
    ],
    cta: "Buat PRD & Bayar",
  },
  starter: {
    id: 'starter',
    name: "Starter",
    price: 66000,
    originalPrice: 75000,
    priceLabel: "Rp 66.000",
    perLabel: "/bulan",
    description: "5 PRD per bulan, paling ekonomis",
    discountLabel: "12% OFF",
    features: [
      "5 PRD per bulan",
      "PRD dibuat dengan DeepSeek Flash",
      "Akses penuh & download .md",
      "Panduan brief produk langkah demi langkah",
      "Semua template & format",
      "Riwayat PRD tersimpan",
    ],
    cta: "Langganan Starter",
  },
  pro: {
    id: 'pro',
    name: "Pro",
    price: 133000,
    originalPrice: 200000,
    priceLabel: "Rp 133.000",
    perLabel: "/bulan",
    description: "PRD tanpa batas kuota bulanan, untuk kebutuhan serius",
    discountLabel: "34% OFF",
    features: [
      "PRD tanpa batas kuota bulanan",
      "PRD premium dengan GPT-OSS 120B",
      "Penggunaan wajar: maksimal 10 PRD per jam",
      "Akses penuh & download .md, PDF, DOCX",
      "Edit PRD setelah jadi",
      "Riwayat PRD tersimpan",
      "Prioritas support",
    ],
    popular: true,
    cta: "Langganan Pro",
  },
  pro_tahunan: {
    id: 'pro_tahunan',
    name: "Pro Tahunan",
    price: 99000,
    originalPrice: 200000,
    priceLabel: "Rp 99.000",
    perLabel: "/bulan",
    annualTotal: "Rp 1.188.000/thn",
    description: "Semua fitur Pro, hemat 51%",
    discountLabel: "HEMAT 51%",
    discountBadge: "Paling Worth",
    features: [
      "Semua fitur Pro",
      "PRD premium dengan GPT-OSS 120B",
      "Penggunaan wajar: maksimal 10 PRD per jam",
      "Hanya Rp 99rb/bln (Rp 1.188.000/thn)",
      "Hemat 51% dibanding bulanan",
      "Akses prioritas fitur baru",
    ],
    cta: "Langganan Pro Tahunan",
  },
} as const;

export type PackageId = "pay_per_use" | "starter" | "pro" | "pro_tahunan";

// Map subscription packages to their database package_type
// pay_per_use & starter → 'basic' di database
// pro & pro_tahunan → 'pro' di database (untuk entitlement dan model AI Pro)
export function getDbPackageType(packageId: PackageId): "basic" | "pro" {
  if (packageId === "pro" || packageId === "pro_tahunan") return "pro";
  return "basic";
}

// Hitung harga per PRD untuk starter
export function getStarterPricePerPrd(): number {
  return Math.round(PRICING.starter.price / 5); // Rp 13.200/PRD
}
