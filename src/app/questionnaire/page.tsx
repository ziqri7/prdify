"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { usePRDStore } from "@/store/use-prd-store";
import { questions } from "@/lib/questions";
import type { PRDAnswers } from "@/lib/prd-generator";
import { QuestionStep } from "@/components/prd/question-step";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function QuestionnairePage() {
  const router = useRouter();
  const {
    currentStep,
    nextStep,
    prevStep,
    answers,
    setAnswer,
    setGeneratedPRD,
    setDocumentId,
    generatedPRD,
    packageType,
    setPackageType,
    resetAnswers,
  } = usePRDStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // The server is the source of truth for a paid subscription or prepaid
  // credit. Browser state only keeps the questionnaire draft convenient.
  useEffect(() => {
    let active = true;
    const loadEntitlement = async () => {
      try {
        const response = await fetch("/api/entitlement");
        const result = await response.json();
        if (!response.ok || !result.data?.planId) {
          router.replace("/pricing");
          return;
        }
        if (active) setPackageType(result.data.planId);
      } catch {
        router.replace("/pricing");
      } finally {
        if (active) setIsCheckingAccess(false);
      }
    };
    void loadEntitlement();
    return () => { active = false; };
  }, [router, setPackageType]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: usePRDStore.getState().answers,
        }),
      });
      const result = await response.json();

      if (result.success && result.data) {
        setGeneratedPRD(result.data.markdown);
        setDocumentId(result.data.id);
        setIsDone(true);
      } else {
        throw new Error(result.error || "Gagal generate PRD");
      }
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat generate PRD"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [setGeneratedPRD, setDocumentId]);

  // If generation is done, show result
  if (isDone && generatedPRD) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-12">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#059669]/10 dark:bg-[#059669]/20 mb-6 animate-scale-in">
            <CheckCircle2 className="h-10 w-10 text-[#059669] dark:text-[#059669]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 animate-fade-in-up">
            PRD Berhasil Dibuat!
          </h1>
          <p className="text-[#6a7180] dark:text-gray-400 mb-8">
            PRD untuk{" "}
            <span className="font-semibold text-[#1c2332] dark:text-gray-200">
              {answers.product_name as string}
            </span>{" "}
            sudah siap. Kamu bisa lihat preview atau langsung download.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/preview/${usePRDStore.getState().documentId}`}>
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <FileText className="h-5 w-5" />
                Lihat Preview
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => resetAnswers()}
              >
                Buat PRD Baru
              </Button>
            </Link>
          </div>

          {/* Quick preview of the PRD */}
          <div className="mt-12 text-left">
            <div className="rounded-2xl border border-[#dcdee1] dark:border-gray-800 bg-white dark:bg-[#2a3040] p-6 sm:p-8 overflow-auto max-h-96">
              <pre className="text-sm text-[#6a7180] dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {generatedPRD}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If generating, show loading
  if (isGenerating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f5f6] dark:bg-[#df5c37]/10 mb-6">
            <Loader2 className="h-8 w-8 text-[#df5c37] animate-spin" />
          </div>
          <h2 className="text-xl font-semibold mb-2">AI sedang menyusun PRD...</h2>
          <p className="text-[#6a7180] dark:text-gray-400">
            AI sedang menganalisis jawabanmu menjadi dokumen PRD profesional
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#df5c37] dark:text-[#df5c37]">
            <Sparkles className="h-4 w-4" />
            <span>Menyusun kebutuhan, prioritas, dan rencana MVP...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isCheckingAccess || !packageType) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#df5c37]" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#fffbeb] dark:border-[#d97706]/30 bg-[#fffbeb] dark:bg-[#d97706]/10 px-4 py-1.5 text-sm font-medium text-[#d97706] dark:text-[#fbbf24] mb-4">
            <FileText className="h-4 w-4" />
            Paket {packageType === "pay_per_use" ? "Pay Per Use" : packageType === "starter" ? "Starter" : packageType === "pro_tahunan" ? "Pro Tahunan" : "Pro"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Jawab Pertanyaan Berikut
          </h1>
          <p className="mt-2 text-[#6a7180] dark:text-gray-400">
            Jawab sebisamu, nanti bisa diedit lagi setelah PRD jadi
          </p>
          {(packageType === "pro" || packageType === "pro_tahunan") && (
            <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-left text-sm text-violet-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" />
                <p>
                  <strong>Benefit paket Pro aktif:</strong> PRD ini akan disusun menggunakan
                  GPT-OSS 120B untuk membantu menghasilkan analisis kebutuhan, prioritas MVP,
                  dan detail yang lebih mendalam.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Question */}
        <QuestionStep
          key={currentStep}
          question={questions[currentStep]}
          value={answers[questions[currentStep].id as keyof PRDAnswers] || ""}
          onAnswer={(value) =>
            setAnswer(questions[currentStep].id as keyof PRDAnswers, value)
          }
          onNext={() => {
            // Save current answer before navigating
            setAnswer(
              questions[currentStep].id as keyof PRDAnswers,
              usePRDStore.getState().answers[questions[currentStep].id as keyof PRDAnswers] || ""
            );
            if (currentStep < questions.length - 1) {
              nextStep();
            } else {
              handleGenerate();
            }
          }}
          onPrev={() => prevStep()}
          isFirst={currentStep === 0}
          isLast={currentStep === questions.length - 1}
          progress={(currentStep + 1) / questions.length}
        />
      </div>
    </div>
  );
}
