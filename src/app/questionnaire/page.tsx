"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { usePRDStore } from "@/store/use-prd-store";
import { questions } from "@/lib/questions";
import { generatePRD, type PRDAnswers } from "@/lib/prd-generator";
import { QuestionStep } from "@/components/prd/question-step";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function QuestionnairePage() {
  const router = useRouter();
  const {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    answers,
    setAnswer,
    setGeneratedPRD,
    setDocumentId,
    generatedPRD,
    packageType,
    resetAnswers,
  } = usePRDStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Redirect if no package selected
  useEffect(() => {
    if (!packageType) {
      router.push("/pricing");
    }
  }, [packageType, router]);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    // Simulate processing time
    setTimeout(() => {
      const fullAnswers = answers as PRDAnswers;
      const result = generatePRD(fullAnswers);
      setGeneratedPRD(result.fullMarkdown);
      setDocumentId(crypto.randomUUID());
      setIsGenerating(false);
      setIsDone(true);
    }, 1500);
  }, [answers, setGeneratedPRD, setDocumentId]);

  // If generation is done, show result
  if (isDone && generatedPRD) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-12">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            PRD Berhasil Dibuat!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            PRD untuk{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-200">
              {answers.product_name as string}
            </span>{" "}
            sudah siap. Kamu bisa lihat preview atau langsung download.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/preview/demo`}>
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
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 overflow-auto max-h-96">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 mb-6">
            <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Menghasilkan PRD...</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Sistem sedang mengolah jawabanmu menjadi dokumen PRD profesional
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-violet-600 dark:text-violet-400">
            <Sparkles className="h-4 w-4" />
            <span>Menganalisis jawaban...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!packageType) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 mb-4">
            <FileText className="h-4 w-4" />
            Paket {packageType === "pro" ? "Pro" : "Basic"}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Jawab Pertanyaan Berikut
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Jawab sebisamu, nanti bisa diedit lagi setelah PRD jadi
          </p>
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
