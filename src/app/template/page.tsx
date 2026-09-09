"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, Code2, Copy, Download, FileText, Lightbulb } from "lucide-react";
import Link from "next/link";

const useCases = [
  {
    id: "booking",
    label: "Booking",
    title: "Platform Reservasi Lapangan",
    audience: "Pemilik lapangan dan pemain olahraga",
    outcome: "Membantu pemilik lapangan mengelola jadwal dan pemain menemukan slot kosong.",
    markdown: `# PRD: Platform Reservasi Lapangan

## 1. Ringkasan Eksekutif
Platform web untuk melihat jadwal, memilih slot, dan mengajukan reservasi lapangan olahraga.

## 2. Target Pengguna
- Pemain yang ingin mengecek ketersediaan lapangan.
- Pemilik lapangan yang mengelola jadwal dan reservasi.

## 3. Masalah & Solusi
**Masalah:** Jadwal masih ditanyakan manual melalui chat sehingga rawan bentrok.

**Solusi MVP:** Kalender ketersediaan, formulir reservasi, dan status konfirmasi.

## 4. Fitur MVP & Prioritas
- **P0:** Lihat jadwal, pilih slot, ajukan reservasi.
- **P0:** Panel pemilik untuk mengonfirmasi atau menolak reservasi.
- **P1:** Pengingat reservasi.

## 5. Pertanyaan Terbuka
- Apakah pembayaran dilakukan di aplikasi atau langsung ke pemilik?`,
  },
  {
    id: "marketplace",
    label: "Marketplace",
    title: "Marketplace Produk Lokal",
    audience: "Pengrajin lokal dan pembeli produk kurasi",
    outcome: "Memusatkan katalog produk lokal yang dikurasi dan proses pesanan yang mudah dilacak.",
    markdown: `# PRD: Marketplace Produk Lokal

## 1. Ringkasan Eksekutif
Marketplace untuk mempertemukan pengrajin lokal dengan pembeli yang mencari produk kurasi.

## 2. Target Pengguna
- Pengrajin yang membutuhkan kanal penjualan digital.
- Pembeli yang mencari produk lokal dan unik.

## 3. Masalah & Solusi
**Masalah:** Produk pengrajin sulit ditemukan dan katalog tersebar di banyak kanal.

**Solusi MVP:** Katalog terkurasi, detail produk, keranjang, dan pelacakan status pesanan.

## 4. Fitur MVP & Prioritas
- **P0:** Katalog, pencarian, detail produk, dan keranjang.
- **P0:** Alur pesanan dan pembaruan status.
- **P1:** Profil pengrajin dan koleksi pilihan.

## 5. Pertanyaan Terbuka
- Siapa yang mengelola pengiriman dan pembayaran?`,
  },
  {
    id: "edtech",
    label: "Edukasi",
    title: "Platform Kelas Persiapan Ujian",
    audience: "Siswa dan tutor",
    outcome: "Membantu siswa memilih materi belajar dan memantau kemajuan latihan.",
    markdown: `# PRD: Platform Kelas Persiapan Ujian

## 1. Ringkasan Eksekutif
Platform belajar yang menyajikan materi, latihan soal, dan ringkasan progres siswa.

## 2. Target Pengguna
- Siswa yang mempersiapkan ujian.
- Tutor yang mengelola materi dan latihan.

## 3. Masalah & Solusi
**Masalah:** Siswa kesulitan mengatur materi dan mengetahui area yang belum dikuasai.

**Solusi MVP:** Daftar materi, latihan soal, hasil latihan, dan progres sederhana.

## 4. Fitur MVP & Prioritas
- **P0:** Daftar materi dan latihan per topik.
- **P0:** Nilai dan riwayat latihan siswa.
- **P1:** Rekomendasi materi berdasarkan hasil latihan.

## 5. Pertanyaan Terbuka
- Apakah materi dibuat internal atau oleh tutor eksternal?`,
  },
  {
    id: "ops",
    label: "Operasional",
    title: "Dashboard Permintaan Internal",
    audience: "Tim operasional dan pemohon internal",
    outcome: "Merapikan permintaan internal agar status dan penanggung jawab mudah dilacak.",
    markdown: `# PRD: Dashboard Permintaan Internal

## 1. Ringkasan Eksekutif
Dashboard internal untuk membuat, menetapkan, dan melacak permintaan operasional.

## 2. Target Pengguna
- Karyawan yang mengajukan permintaan.
- Tim operasional yang memproses permintaan.

## 3. Masalah & Solusi
**Masalah:** Permintaan tersebar di chat dan sulit diprioritaskan atau dilacak.

**Solusi MVP:** Form permintaan, status, penanggung jawab, dan riwayat aktivitas.

## 4. Fitur MVP & Prioritas
- **P0:** Buat permintaan dan pilih kategori.
- **P0:** Ubah status dan tetapkan penanggung jawab.
- **P1:** Filter, pencarian, dan notifikasi status.

## 5. Pertanyaan Terbuka
- Kategori permintaan apa yang paling sering digunakan?`,
  },
] as const;

function buildImplementationBrief(title: string, markdown: string): string {
  return `Saya ingin membangun produk berdasarkan contoh PRD berikut. Bertindaklah sebagai product engineer senior.

1. Identifikasi bagian yang masih berupa contoh dan tanyakan data yang perlu diganti untuk produk saya.
2. Usulkan rencana MVP bertahap beserta urutan implementasinya.
3. Jangan mengarang detail yang belum diputuskan; tulis sebagai asumsi atau pertanyaan terbuka.

# Contoh PRD: ${title}

${markdown}`;
}

export default function TemplatePage() {
  const [selectedId, setSelectedId] = useState<(typeof useCases)[number]["id"]>("booking");
  const [copied, setCopied] = useState(false);
  const selected = useCases.find((item) => item.id === selectedId) ?? useCases[0];

  const downloadExample = () => {
    const blob = new Blob([selected.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Contoh-PRD-${selected.id}-BuatPakeAI.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyImplementationBrief = () => {
    navigator.clipboard.writeText(buildImplementationBrief(selected.title, selected.markdown));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-6xl px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#6a7180] transition-colors hover:text-[#1c2332] dark:text-gray-400 dark:hover:text-gray-100">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>

        <div className="mt-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#df5c37]/10 px-3 py-1.5 text-sm font-medium text-[#df5c37]">
            <Lightbulb className="h-4 w-4" />
            Galeri inspirasi produk
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Mulai dari contoh yang dekat dengan idemu</h1>
          <p className="mt-3 text-lg leading-relaxed text-[#6a7180] dark:text-gray-400">
            Lihat bagaimana beberapa jenis produk diterjemahkan menjadi ruang lingkup MVP, prioritas fitur, dan pertanyaan terbuka. Semua contoh ini ilustratif.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {useCases.map((item) => (
              <button key={item.id} onClick={() => setSelectedId(item.id)} className={`rounded-xl border p-4 text-left transition-all ${selected.id === item.id ? "border-[#df5c37] bg-[#fffbeb] shadow-sm dark:bg-[#df5c37]/10" : "border-[#dcdee1] bg-white hover:border-[#df5c37]/40 dark:border-gray-700 dark:bg-[#2a3040]"}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#df5c37]">{item.label}</p>
                <p className="mt-1 font-semibold">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#6a7180] dark:text-gray-400">{item.audience}</p>
              </button>
            ))}
          </div>

          <Card className="overflow-hidden border-[#dcdee1] shadow-sm dark:border-gray-700">
            <CardContent className="p-0">
              <div className="border-b border-[#dcdee1] bg-[#f8f9fa] px-6 py-5 dark:border-gray-700 dark:bg-[#1c2332]">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#df5c37]">{selected.label}</p>
                <h2 className="mt-1 text-xl font-bold">{selected.title}</h2>
                <p className="mt-2 text-sm text-[#6a7180] dark:text-gray-400">{selected.outcome}</p>
              </div>
              <div className="p-6">
                <pre className="max-h-[440px] overflow-auto rounded-xl bg-[#f3f5f6] p-5 text-sm leading-relaxed text-[#4b5563] whitespace-pre-wrap dark:bg-[#1c2332] dark:text-gray-300">{selected.markdown}</pre>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" className="gap-2" onClick={downloadExample}><Download className="h-4 w-4" />Download contoh .md</Button>
                  <Button variant="outline" className="gap-2" onClick={copyImplementationBrief}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Brief tersalin" : "Salin brief ke AI coding tool"}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-[#df5c37]/30 bg-gradient-to-br from-[#fffbeb] to-white dark:from-[#df5c37]/10 dark:to-[#1c2332]">
          <CardContent className="flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-[#df5c37]"><Code2 className="h-5 w-5" /><p className="text-sm font-semibold">Gunakan sebagai inspirasi, bukan jawaban akhir</p></div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6a7180] dark:text-gray-400">Saat membuat PRD sendiri, BuatPakeAI akan memakai jawaban dan konteks produkmu—bukan menyalin contoh ini.</p>
            </div>
            <Link href="/pricing"><Button className="shrink-0 gap-2"><FileText className="h-4 w-4" />Buat PRD sesuai idemu</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
