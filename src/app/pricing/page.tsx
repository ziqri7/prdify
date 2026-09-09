"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING } from "@/lib/constants";
import { CheckCircle2, ArrowRight, Sparkles, Tag } from "lucide-react";

interface PlanDetail {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  perLabel: string;
  description: string;
  features: readonly string[];
  popular?: boolean;
  cta?: string;
  discountLabel?: string;
  discountBadge?: string;
  originalPrice?: number;
  annualTotal?: string;
}

const plans: PlanDetail[] = [
  {
    id: "pay_per_use",
    name: PRICING.pay_per_use.name,
    price: PRICING.pay_per_use.price,
    priceLabel: PRICING.pay_per_use.priceLabel,
    perLabel: PRICING.pay_per_use.perLabel,
    description: PRICING.pay_per_use.description,
    features: PRICING.pay_per_use.features,
    cta: PRICING.pay_per_use.cta,
  },
  {
    id: "starter",
    name: PRICING.starter.name,
    price: PRICING.starter.price,
    priceLabel: PRICING.starter.priceLabel,
    perLabel: PRICING.starter.perLabel,
    description: PRICING.starter.description,
    features: PRICING.starter.features,
    cta: PRICING.starter.cta,
    discountLabel: PRICING.starter.discountLabel,
    originalPrice: PRICING.starter.originalPrice,
  },
  {
    id: "pro",
    name: PRICING.pro.name,
    price: PRICING.pro.price,
    priceLabel: PRICING.pro.priceLabel,
    perLabel: PRICING.pro.perLabel,
    description: PRICING.pro.description,
    features: PRICING.pro.features,
    popular: true,
    cta: PRICING.pro.cta,
    discountLabel: PRICING.pro.discountLabel,
    originalPrice: PRICING.pro.originalPrice,
  },
  {
    id: "pro_tahunan",
    name: PRICING.pro_tahunan.name,
    price: PRICING.pro_tahunan.price,
    priceLabel: PRICING.pro_tahunan.priceLabel,
    perLabel: PRICING.pro_tahunan.perLabel,
    description: PRICING.pro_tahunan.description,
    features: PRICING.pro_tahunan.features,
    cta: PRICING.pro_tahunan.cta,
    discountLabel: PRICING.pro_tahunan.discountLabel,
    discountBadge: PRICING.pro_tahunan.discountBadge,
    originalPrice: PRICING.pro_tahunan.originalPrice,
    annualTotal: PRICING.pro_tahunan.annualTotal,
  },
];

// Format original price for display
function formatOriginalPrice(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PricingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <section className="relative overflow-hidden bg-[#f3f5f6] dark:bg-[#1c2332] py-16 sm:py-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-gradient-to-br from-[#df5c37]/10 to-[#d97706]/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 text-center relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#fde68a] dark:border-[#d97706]/40 bg-[#fffbeb] dark:bg-[#d97706]/15 px-4 py-1.5 text-sm font-medium text-[#d97706] dark:text-[#fbbf24]">
            <Sparkles className="h-4 w-4" />
            PROMO hingga 51%
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Pilih Paket{" "}
            <span className="text-[#df5c37]">
              Kamu
            </span>
          </h1>
          <p className="mt-4 text-lg text-[#6a7180] dark:text-gray-400 max-w-2xl mx-auto">
            Pilih paket sesuai intensitas kerja dan kedalaman PRD yang kamu butuhkan.
          </p>
          <div className="mt-6 mx-auto max-w-2xl rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-left text-sm text-violet-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" />
              <p>
                <strong>Keunggulan Pro:</strong> setiap PRD pada paket Pro dan Pro Tahunan
                dibuat dengan GPT-OSS 120B, model AI yang lebih kuat untuk membantu
                menyusun kebutuhan, prioritas MVP, dan detail implementasi secara lebih mendalam.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-7xl px-4 -mt-8 pb-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const isPopular = plan.popular === true;
            return (
              <div
                key={plan.id}
                style={{ animationDelay: `${index * 0.1}s` }}
                className={`relative rounded-2xl border bg-white dark:bg-[#2a3040] p-6 transition-all hover:shadow-xl flex flex-col animate-fade-in-up ${
                  isPopular
                    ? "border-[#df5c37] shadow-lg shadow-[#df5c37]/10 dark:shadow-[#df5c37]/20 scale-105 lg:scale-110"
                    : "border-[#dcdee1] dark:border-[#3a4155] hover:border-[#df5c37]/30 dark:hover:border-[#df5c37]/50"
                }`}
              >
                {/* Discount / Popular Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {plan.discountBadge && (
                    <Badge className="text-xs px-4 py-1 bg-[#df5c37] text-white border-0">
                      {plan.discountBadge}
                    </Badge>
                  )}
                  {plan.discountLabel && !plan.discountBadge && !isPopular && (
                    <span className="discount-badge">
                      <Tag className="h-3 w-3" />
                      {plan.discountLabel}
                    </span>
                  )}
                </div>

                {/* Header */}
                <div className="text-center mb-4 pt-1">
                  <h3 className="text-lg font-bold">{plan.name}</h3>

                  {/* Price */}
                  <div className="mt-3">
                    <span className="text-3xl font-bold">
                      {plan.priceLabel}
                    </span>
                    <span className="text-[#6a7180] dark:text-gray-400 ml-1 text-sm">
                      {plan.perLabel}
                    </span>
                    {plan.annualTotal && (
                      <p className="text-xs text-[#6a7180] dark:text-gray-400 mt-0.5">
                        {plan.annualTotal}
                      </p>
                    )}
                  </div>

                  {/* Original price strikethrough */}
                  {plan.originalPrice && (
                    <p className="mt-1 text-xs text-[#6a7180] dark:text-gray-400 line-through">
                      {formatOriginalPrice(plan.originalPrice)}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-[#6a7180] dark:text-gray-400 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={`/payment?package=${plan.id}`}>
                  <Button
                    variant={isPopular ? "default" : "outline"}
                    size="sm"
                    className="w-full gap-2"
                  >
                    {plan.cta || `Pilih ${plan.name}`}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-[#6a7180] dark:text-gray-400">
          Semua harga dalam Rupiah. Akses paket aktif setelah pembayaran terverifikasi.
        </p>
      </section>

      {/* FAQ Mini */}
      <section id="faq" className="border-t border-[#dcdee1] dark:border-[#3a4155] bg-[#f3f5f6] dark:bg-[#1c2332]/50 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            Pertanyaan Seputar Harga
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-1">
                Bagaimana cara mencoba BuatPakeAI?
              </h3>
              <p className="text-sm text-[#6a7180] dark:text-gray-400">
                Pilih Pay Per Use untuk membeli satu kredit pembuatan PRD AI.
                Kredit dipakai hanya setelah PRD berhasil dibuat.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Bedanya Pay Per Use sama langganan?
              </h3>
              <p className="text-sm text-[#6a7180] dark:text-gray-400">
                Pay Per Use memberi satu kredit prabayar — cocok untuk yang jarang
                membuat PRD. Starter/Pro memberi kuota langganan untuk penggunaan rutin.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Apa keunggulan AI di paket Pro?
              </h3>
              <p className="text-sm text-[#6a7180] dark:text-gray-400">
                Pro dan Pro Tahunan menggunakan GPT-OSS 120B untuk pembuatan PRD,
                sehingga cocok bila kamu membutuhkan analisis kebutuhan dan rincian MVP
                yang lebih mendalam. Starter memakai DeepSeek Flash agar tetap hemat.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Chat AI itu apa?
              </h3>
              <p className="text-sm text-[#6a7180] dark:text-gray-400">
                Chat AI membantu brainstorming ide produk melalui tanya jawab
                interaktif dengan AI, sebelum PRD digenerate. Fitur ini hanya
                tersedia di paket Pro dan Pro Tahunan.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Metode pembayaran apa saja?
              </h3>
              <p className="text-sm text-[#6a7180] dark:text-gray-400">
                Kami mendukung berbagai metode pembayaran: Transfer Bank (BCA,
                Mandiri, BRI, BNI), E-Wallet (GoPay, OVO, Dana, LinkAja), dan
                QRIS.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
