"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRICING } from "@/lib/constants";
import type { PackageId } from "@/lib/constants";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Loader2,
  AlertCircle,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { usePRDStore } from "@/store/use-prd-store";

const VALID_PACKAGES: PackageId[] = [
  "pay_per_use",
  "starter",
  "pro",
  "pro_tahunan",
];

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageParam = searchParams.get("package");
  const prdId = searchParams.get("prd_id");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPackageType = usePRDStore((s) => s.setPackageType);
  const setPaymentStatus = usePRDStore((s) => s.setPaymentStatus);
  const setInvoiceUrl = usePRDStore((s) => s.setInvoiceUrl);

  // Validate package param
  // Documents created before plan metadata existed only carry basic/pro.
  // Treat these as the corresponding one-off/current Pro plans, rather than
  // accepting arbitrary package values from the URL.
  const normalizedPackage: PackageId | null =
    packageParam === "basic"
      ? "pay_per_use"
      : packageParam === "pro"
        ? "pro"
        : packageParam && VALID_PACKAGES.includes(packageParam as PackageId)
          ? packageParam as PackageId
          : null;
  const pkg = normalizedPackage ? PRICING[normalizedPackage] : null;

  useEffect(() => {
    if (normalizedPackage) {
      setPackageType(normalizedPackage);
    } else {
      router.push("/pricing");
    }
  }, [normalizedPackage, setPackageType, router]);

  // SumoPod merchant account currently exposes QRIS as its supported method.
  const paymentMethods = [{ id: "qris", label: "QRIS", icon: Smartphone }];

  const handlePay = async () => {
    if (!selectedMethod || !normalizedPackage || !prdId) return;
    setPaymentStatus("pending");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: normalizedPackage,
          paymentMethod: selectedMethod,
          prdId,
        }),
      });
      const result = await res.json();

      if (result.success && result.data) {
        setInvoiceUrl(result.data.invoice_url);
        if (
          result.data.invoice_url &&
          result.data.invoice_url !== "#"
        ) {
          window.location.href = result.data.invoice_url;
        } else {
          router.push(`/preview/${prdId}`);
        }
      } else {
        throw new Error(result.error || "Gagal memproses pembayaran");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!pkg) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#df5c37] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!prdId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Buat PRD terlebih dahulu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[#6a7180] dark:text-gray-400">
              Pembayaran harus ditautkan ke PRD yang akan dibuka akses penuhnya.
            </p>
            <Button onClick={() => router.push("/questionnaire")}>Mulai membuat PRD</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-2xl px-4">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm text-[#6a7180] dark:text-gray-400 hover:text-[#1c2332] dark:hover:text-gray-100 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke harga
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Pembayaran
        </h1>
        <p className="text-[#6a7180] dark:text-gray-400 mb-8">
          Selesaikan pembayaran untuk mulai membuat PRD
        </p>

        <div className="grid gap-6">
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Summary */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#6a7180] dark:text-gray-400">
                  Paket {pkg.name}
                </span>
                <span className="font-semibold">{pkg.priceLabel}</span>
              </div>
              <div className="border-t border-[#dcdee1] dark:border-gray-800 my-2" />
              <div className="flex items-center justify-between py-2">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-[#df5c37]">
                  {pkg.priceLabel}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pilih Metode Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                        selectedMethod === method.id
                          ? "border-[#df5c37] bg-[#fffbeb] dark:bg-[#df5c37]/10 shadow-sm"
                          : "border-[#dcdee1] dark:border-gray-700 hover:border-[#df5c37]/40 dark:hover:border-[#df5c37]/40"
                      }`}
                    >
                      <Icon className="h-6 w-6 text-[#6a7180] dark:text-gray-300" />
                      <span className="text-xs font-medium">
                        {method.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pay Button */}
          <Button
            size="lg"
            className="w-full text-base gap-2"
            disabled={!selectedMethod || loading}
            onClick={handlePay}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                Bayar {pkg.priceLabel} via{" "}
                {paymentMethods.find((m) => m.id === selectedMethod)?.label ||
                  "..."}
              </>
            )}
          </Button>

          <p className="text-center text-xs text-[#6a7180] dark:text-gray-500">
              Pembayaran diproses aman melalui QRIS SumoPod.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#df5c37] border-t-transparent rounded-full" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
