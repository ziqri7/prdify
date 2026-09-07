"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING } from "@/lib/constants";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export default function PricingPage() {
  const plans = [PRICING.basic, PRICING.pro];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/20 dark:to-gray-950 py-16 sm:py-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/20 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 text-center relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300">
            <Sparkles className="h-4 w-4" />
            Pilih Paket Sesuai Kebutuhanmu
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Harga Sederhana,{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Manfaat Maksimal
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhanmu. Bayar per dokumen, tanpa
            langganan bulanan!
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-7xl px-4 -mt-8 pb-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {plans.map((plan) => {
            const isPopular = "popular" in plan && plan.popular;
            return (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 bg-white dark:bg-gray-900 p-8 transition-all hover:shadow-xl ${
                isPopular
                  ? "border-violet-500 shadow-lg shadow-violet-200 dark:shadow-violet-900/30 scale-105 md:scale-110"
                  : "border-gray-200 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="text-xs px-4 py-1">
                    PALING POPULER
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.priceLabel}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    {plan.perLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Bayar sekali, PRD siap pakai
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={`/payment?package=${plan.name.toLowerCase()}`}>
                <Button
                  variant={isPopular ? "default" : "outline"}
                  size="lg"
                  className="w-full gap-2"
                >
                  Pilih {plan.name}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Mini */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            Pertanyaan Seputar Harga
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-1">
                Apakah ada langganan bulanan?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tidak! Kamu bayar per dokumen. Buat satu PRD, bayar sekali.
                Cocok untuk yang butuh PRD sesekali.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Bisa upgrade dari Basic ke Pro?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Untuk saat ini, kamu pilih paket di awal. Tapi kamu bisa buat
                PRD baru dengan paket berbeda kapan saja.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">
                Metode pembayaran apa saja?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
