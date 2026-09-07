"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Question } from "@/lib/questions";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

interface QuestionStepProps {
  question: Question;
  value: string | string[];
  onAnswer: (value: string | string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  progress: number;
}

export function QuestionStep({
  question,
  value,
  onAnswer,
  onNext,
  onPrev,
  isFirst,
  isLast,
  progress,
}: QuestionStepProps) {
  const [localValue, setLocalValue] = useState<string | string[]>(value || "");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (question.required) {
      if (
        !localValue ||
        (typeof localValue === "string" && !localValue.trim()) ||
        (Array.isArray(localValue) && localValue.length === 0)
      ) {
        setError("Pertanyaan ini wajib diisi");
        return;
      }
    }
    setError("");
    onAnswer(localValue);
    onNext();
  };

  const toggleMultiselect = (option: string) => {
    const current = Array.isArray(localValue) ? localValue : [];
    const updated = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    setLocalValue(updated);
    onAnswer(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Pertanyaan {Math.min(Math.round(progress * 20) + 1, 20)} dari 20
          </span>
          <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8">
        <Label className="text-lg sm:text-xl font-semibold leading-relaxed block mb-2">
          {question.question}
        </Label>
        {question.required && (
          <span className="text-xs text-red-500 font-medium">*Wajib diisi</span>
        )}

        <div className="mt-6">
          {/* Text input */}
          {(question.type === "text" || question.type === "textarea") && (
            <div>
              {question.type === "text" ? (
                <Input
                  placeholder={question.placeholder}
                  value={localValue as string}
                  onChange={(e) => {
                    setLocalValue(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNext();
                  }}
                />
              ) : (
                <textarea
                  placeholder={question.placeholder}
                  value={localValue as string}
                  onChange={(e) => {
                    setLocalValue(e.target.value);
                    setError("");
                  }}
                  rows={4}
                  className="flex w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                />
              )}
            </div>
          )}

          {/* Select dropdown */}
          {question.type === "select" && (
            <Select
              value={localValue as string}
              onValueChange={(v) => {
                setLocalValue(v);
                setError("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih salah satu..." />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Multiselect */}
          {question.type === "multiselect" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options?.map((opt) => {
                const selected = Array.isArray(localValue) && localValue.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleMultiselect(opt)}
                    className={`rounded-xl border-2 p-4 text-sm font-medium transition-all ${
                      selected
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={isFirst}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Sebelumnya
          </Button>

          <Button onClick={handleNext} className="gap-2">
            {isLast ? (
              <>
                Generate PRD
                <Send className="h-4 w-4" />
              </>
            ) : (
              <>
                Selanjutnya
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
