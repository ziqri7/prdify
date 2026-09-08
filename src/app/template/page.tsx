"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

const templateContent = `# PRD: [Nama Produk]

**Tanggal:** [Tanggal]
**Status:** Draft

---

## 1. Ringkasan Eksekutif

[Jelaskan produk secara singkat]

## 2. Target Pengguna

[Siapa target pengguna produk ini?]

## 3. Masalah & Solusi

**Masalah:**
[Apa masalah yang ingin diselesaikan?]

**Solusi:**
[Bagaimana produk menyelesaikan masalah?]

## 4. Fitur Utama

- Fitur 1
- Fitur 2
- Fitur 3

## 5. Analisis Kompetitor

**Kompetitor:**
- Kompetitor 1
- Kompetitor 2

**Diferensiasi:**
[Apa yang membedakan produkmu?]

## 6. Struktur Halaman / Navigasi

- Beranda
- Tentang Kami
- Fitur
- Kontak

## 7. Alur Pengguna (User Flow)

[Deskripsi alur pengguna]

## 8. Kebutuhan Teknis

**Platform:** Web / Mobile / Desktop
**Autentikasi:** Ya / Tidak

## 9. Timeline & Budget

**Timeline:** [Estimasi waktu]
**Budget:** [Estimasi biaya]

---

*Template PRD ini disediakan oleh BuatPakeAI*
`;

export default function TemplatePage() {
  const downloadTemplate = () => {
    const blob = new Blob([templateContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Template-PRD-BuatPakeAI.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-3xl px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#6a7180] dark:text-gray-400 hover:text-[#1c2332] dark:hover:text-gray-100 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Template PRD
            </h1>
            <p className="text-[#6a7180] dark:text-gray-400 mt-1">
              Template PRD kosong yang bisa kamu download dan isi manual
            </p>
          </div>
          <Button onClick={downloadTemplate} className="gap-2 shrink-0">
            <Download className="h-5 w-5" />
            Download Template
          </Button>
        </div>

        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl bg-[#f3f5f6] dark:bg-[#2a3040] p-6 overflow-auto max-h-[60vh]">
              <pre className="text-sm text-[#6a7180] dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {templateContent}
              </pre>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-[#6a7180] dark:text-gray-400 mb-4">
            Mau bikin PRD lebih cepat? Cukup jawab pertanyaan, PRD langsung
            jadi!
          </p>
          <Link href="/pricing">
            <Button size="lg" className="gap-2">
              <FileText className="h-5 w-5" />
              Buat PRD Otomatis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
