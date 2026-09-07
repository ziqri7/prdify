"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRICING } from "@/lib/constants";
import { ArrowLeft, ShieldCheck, CreditCard, Banknote, Smartphone } from "lucide-react";
import Link from "next/link";
import { usePRDStore } from "@/store/use-prd-store";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageParam = searchParams.get("package");
  const pkg = packageParam === "pro" ? PRICING.pro : PRICING.basic;
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const setPackageType = usePRDStore((s) => s.setPackageType);
  const setPaymentStatus = usePRDStore((s) => s.setPaymentStatus);
  const setInvoiceUrl = usePRDStore((s) => s.setInvoiceUrl);

  useEffect(() => {
    if (packageParam === "pro" || packageParam === "basic") {
      setPackageType(packageParam);
    } else {
      router.push("/pricing");
    }
  }, [packageParam, setPackageType, router]);

  const paymentMethods = [
    { id: "bca", label: "BCA", icon: Banknote },
    { id: "mandiri", label: "Mandiri", icon: Banknote },
    { id: "bri", label: "BRI", icon: Banknote },
    { id: "bni", label: "BNI", icon: Banknote },
    { id: "gopay", label: "GoPay", icon: Smartphone },
    { id: "ovo", label: "OVO", icon: Smartphone },
    { id: "dana", label: "DANA", icon: Smartphone },
    { id: "qris", label: "QRIS", icon: Smartphone },
  ];

  const handlePay = () => {
    if (!selectedMethod) return;
    setPaymentStatus("pending");
    // In production, call Xendit/Midtrans API here
    // For now, simulate redirect to questionnaire
    router.push("/questionnaire");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-2xl px-4">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke harga
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Pembayaran</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Selesaikan pembayaran untuk mulai membuat PRD
        </p>

        <div className="grid gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Paket {pkg.name}
                </span>
                <span className="font-semibold">{pkg.priceLabel}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 my-2" />
              <div className="flex items-center justify-between py-2">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-violet-600">
                  {pkg.priceLabel}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
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
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
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
            disabled={!selectedMethod}
            onClick={handlePay}
          >
            <ShieldCheck className="h-5 w-5" />
            Bayar {pkg.priceLabel} via{" "}
            {paymentMethods.find((m) => m.id === selectedMethod)?.label ||
              "..."}
          </Button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Pembayaran diproses dengan aman via Xendit. Data kamu aman.
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
          <div className="animate-spin h-8 w-8 border-4 border-violet-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
