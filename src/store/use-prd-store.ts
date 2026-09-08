"use client";

import { create } from "zustand";
import type { PRDAnswers } from "@/lib/prd-generator";
import type { PackageId } from "@/lib/constants";

interface PRDState {
  // Package selection
  packageType: PackageId | null;
  setPackageType: (pkg: PackageId) => void;

  // Payment
  paymentStatus: "pending" | "paid" | "failed" | null;
  setPaymentStatus: (status: "pending" | "paid" | "failed") => void;
  invoiceUrl: string | null;
  setInvoiceUrl: (url: string) => void;

  // Questionnaire
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  answers: Partial<PRDAnswers>;
  setAnswer: (id: keyof PRDAnswers, value: string | string[]) => void;
  setAnswers: (answers: Partial<PRDAnswers>) => void;
  resetAnswers: () => void;

  // Generated PRD
  generatedPRD: string | null;
  setGeneratedPRD: (prd: string) => void;
  documentId: string | null;
  setDocumentId: (id: string) => void;
}

export const usePRDStore = create<PRDState>((set) => ({
  // Package
  packageType: null,
  setPackageType: (pkg) => set({ packageType: pkg }),

  // Payment
  paymentStatus: null,
  setPaymentStatus: (status) => set({ paymentStatus: status }),
  invoiceUrl: null,
  setInvoiceUrl: (url) => set({ invoiceUrl: url }),

  // Questionnaire
  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  answers: {},
  setAnswer: (id, value) =>
    set((state) => ({
      answers: { ...state.answers, [id]: value },
    })),
  setAnswers: (answers) => set({ answers }),
  resetAnswers: () =>
    set({
      answers: {},
      currentStep: 0,
      generatedPRD: null,
      documentId: null,
    }),

  // Generated PRD
  generatedPRD: null,
  setGeneratedPRD: (prd) => set({ generatedPRD: prd }),
  documentId: null,
  setDocumentId: (id) => set({ documentId: id }),
}));
