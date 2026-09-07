import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import {
  FileText,
  MousePointerClick,
  Download,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Users,
  GraduationCap,
  Briefcase,
} from "lucide-react";

const features = [
  {
    icon: MousePointerClick,
    title: "Jawab Pertanyaan",
    description:
      "Cukup jawab 20 pertanyaan sederhana tentang produk yang ingin kamu buat.",
  },
  {
    icon: Sparkles,
    title: "Generate Otomatis",
    description:
      "Sistem langsung mengolah jawabanmu menjadi PRD yang rapi dan terstruktur.",
  },
  {
    icon: Download,
    title: "Export & Download",
    description:
      "Download dalam format Markdown, PDF, atau DOCX sesuai kebutuhan.",
  },
];

const targetAudience = [
  {
    icon: Users,
    title: "Newbie / Non-teknis",
    description:
      "Punya ide website tapi bingung mulai dari mana? BuatPakeAI bantu kamu tuangkan ide jadi dokumen PRD.",
  },
  {
    icon: GraduationCap,
    title: "Mahasiswa",
    description:
      "Butuh PRD buat tugas kuliah, proposal, atau skripsi? Cukup isi data, dapatkan PRD siap pakai.",
  },
  {
    icon: Briefcase,
    title: "Freelancer & Agensi",
    description:
      "Kerja sama banyak klien? Buat PRD cepat tanpa rembukan panjang lebar.",
  },
];

const steps = [
  {
    num: "01",
    title: "Pilih Paket",
    desc: "Pilih Basic (Rp 25.000) atau Pro (Rp 50.000)",
  },
  {
    num: "02",
    title: "Bayar",
    desc: "Pembayaran mudah via Midtrans, SumoPod, DOKU, atau Ipaymu",
  },
  {
    num: "03",
    title: "Jawab Pertanyaan",
    desc: "Jawab 20 pertanyaan seputar produkmu",
  },
  {
    num: "04",
    title: "Dapatkan PRD!",
    desc: "PRD profesional siap di-download & diedit",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50 via-white to-white dark:from-violet-950/20 dark:via-gray-950 dark:to-gray-950" />
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/4 rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/20 blur-3xl dark:from-violet-600/10 dark:to-indigo-600/10" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/4 rounded-full bg-gradient-to-tr from-indigo-400/20 to-violet-400/20 blur-3xl dark:from-indigo-600/10 dark:to-violet-600/10" />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/50 px-4 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300">
              <Sparkles className="h-4 w-4" />
              Generator PRD Otomatis #1 di Indonesia
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {APP_TAGLINE}
              </span>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-violet-600 dark:text-violet-400">by BuatPakeAI</span>
              </div>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl">
              {APP_NAME} membantu kamu membuat Product Requirements Document
              (PRD) yang rapi dan profesional — cukup jawab pertanyaan-
              pertanyaan sederhana, dan sistem akan menghasilkan PRD untukmu
              secara instan. Mulai dari{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-200">
                Rp 25.000
              </span>
              !
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/pricing">
                <Button size="lg" className="w-full sm:w-auto text-base gap-2">
                  Buat PRD Sekarang
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/template">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base"
                >
                  Lihat Template
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Cara Kerjanya
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Hanya 4 langkah sederhana, PRD siap dalam hitungan menit
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="relative text-center group">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xl font-bold shadow-lg shadow-violet-200 dark:shadow-violet-900/30 transition-transform group-hover:scale-110">
                  {step.num}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Untuk Siapa {APP_NAME}?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {APP_NAME} dirancang untuk membantu siapa pun yang butuh PRD
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {targetAudience.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 transition-all hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 text-violet-600 dark:text-violet-400 transition-transform group-hover:scale-110">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Kenapa {APP_NAME}?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Proses 3 langkah yang simpel dan efektif
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center group rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 transition-all hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg transition-transform group-hover:scale-110">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 px-8 py-16 text-center text-white sm:px-16">
          <div className="absolute top-0 right-0 -z-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -z-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Siap Bikin PRD-mu Sekarang?
            </h2>
            <p className="mt-4 text-lg text-violet-100 max-w-2xl mx-auto">
              Mulai dari Rp 25.000 aja! Dapatkan PRD profesional yang siap
              kamu pake untuk presentasi, proposal, atau panduan development.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/pricing">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base bg-white text-violet-700 hover:bg-violet-50 shadow-xl gap-2"
                >
                  Mulai Sekarang
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
