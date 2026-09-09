import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE, PRICING, getStarterPricePerPrd } from "@/lib/constants";
import {
  FileText,
  MousePointerClick,
  Download,
  Sparkles,
  ArrowRight,
  Users,
  GraduationCap,
  Briefcase,
  Eye,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Masuk dengan Google",
    description:
      "Buat akun atau masuk dengan Google agar PRD dan riwayatmu tersimpan aman.",
  },
  {
    icon: Sparkles,
    title: "Pilih Paket yang Sesuai",
    description:
      "Mulai dari satu kredit untuk satu ide, atau berlangganan untuk kebutuhan rutin.",
  },
  {
    icon: MousePointerClick,
    title: "Jawab Pertanyaan Produk",
    description:
      "Ceritakan masalah, pengguna, fitur, dan tujuan produkmu dalam panduan singkat.",
  },
  {
    icon: Download,
    title: "Tinjau & Download",
    description:
      "Tinjau hasilnya, lalu download sesuai fitur paket yang kamu pilih.",
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
    title: "Masuk dengan Google",
    desc: "Buat akun agar PRD dan paketmu tersimpan di satu tempat",
  },
  {
    num: "02",
    title: "Pilih Paket",
    desc: `Mulai ${PRICING.pay_per_use.priceLabel} untuk satu PRD atau berlangganan sesuai kebutuhan`,
  },
  {
    num: "03",
    title: "Isi Brief Produk",
    desc: "Jawab pertanyaan tentang ide, pengguna, masalah, fitur, dan tujuan produkmu",
  },
  {
    num: "04",
    title: "Gunakan PRD-mu",
    desc: "Tinjau, edit, lalu download PRD untuk dibawa ke developer atau AI coding tool",
  },
];

export default function HomePage() {
  const starterPerPrd = getStarterPricePerPrd();

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f3f5f6] via-white to-white dark:from-[#2a3040]/20 dark:via-[#1c2332] dark:to-[#1c2332]" />
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/4 rounded-full bg-gradient-to-br from-[#df5c37]/20 to-[#d97706]/20 blur-3xl dark:from-[#df5c37]/10 dark:to-[#d97706]/10" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/4 rounded-full bg-gradient-to-tr from-[#d97706]/20 to-[#df5c37]/20 blur-3xl dark:from-[#d97706]/10 dark:to-[#df5c37]/10" />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#fffbeb] dark:border-[#d97706]/30 bg-[#fffbeb] dark:bg-[#d97706]/10 px-4 py-1.5 text-sm font-medium text-[#d97706] dark:text-[#fbbf24]">
              <Sparkles className="h-4 w-4" />
              AI untuk merapikan ide produkmu
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-[#df5c37] via-[#d97706] to-[#df5c37] bg-clip-text text-transparent">
                {APP_TAGLINE}
              </span>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-sm font-medium text-[#df5c37] dark:text-[#df5c37]">by BuatPakeAI</span>
              </div>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-[#6a7180] dark:text-gray-400 sm:text-xl">
              Ubah ide mentah menjadi Product Requirements Document (PRD) yang
              rapi, terstruktur, dan siap dibangun. Masuk dengan Google, pilih
              paket, lalu jawab pertanyaan produkmu. Mulai dari{" "}
              <span className="font-semibold text-[#1c2332] dark:text-gray-200">
                {PRICING.pay_per_use.priceLabel}
              </span>{" "}
              per PRD atau{" "}
              <span className="font-semibold text-[#1c2332] dark:text-gray-200">
                Rp {starterPerPrd.toLocaleString("id-ID")}/PRD
              </span>{" "}
              dengan paket Starter!
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/pricing">
                <Button size="lg" className="w-full sm:w-auto text-base gap-2">
                  Pilih Paket & Mulai
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base"
                >
                  Lihat Paket & Harga
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/pricing" className="group relative flex flex-col justify-start rounded-xl border-2 border-[#dcdee1] dark:border-gray-700 bg-white dark:bg-[#2a3040] p-5 text-left transition-all duration-150 hover:border-[#df5c37]/40 hover:shadow-lg hover:dark:border-[#df5c37]/40">
              <div className="inline-flex self-start rounded-lg bg-[#df5c37]/10 p-2.5 text-[#df5c37]">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">Mulai Buat PRD</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#6a7180] dark:text-gray-400">Pilih paket sebelum mengisi brief produk</p>
            </Link>
            <Link href="/template" className="group relative flex flex-col justify-start rounded-xl border-2 border-[#dcdee1] dark:border-gray-700 bg-white dark:bg-[#2a3040] p-5 text-left transition-all duration-150 hover:border-[#df5c37]/40 hover:shadow-lg hover:dark:border-[#df5c37]/40">
              <div className="inline-flex self-start rounded-lg bg-[#d97706]/10 p-2.5 text-[#d97706]">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">Template PRD</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#6a7180] dark:text-gray-400">Lihat contoh PRD jadi sebelum mulai</p>
            </Link>
            <Link href="/pricing" className="group relative flex flex-col justify-start rounded-xl border-2 border-[#dcdee1] dark:border-gray-700 bg-white dark:bg-[#2a3040] p-5 text-left transition-all duration-150 hover:border-[#df5c37]/40 hover:shadow-lg hover:dark:border-[#df5c37]/40">
              <div className="inline-flex self-start rounded-lg bg-[#df5c37]/10 p-2.5 text-[#df5c37]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">Lihat Harga</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#6a7180] dark:text-gray-400">Cek paket dan pilih sesuai kebutuhan</p>
            </Link>
            <Link href="/dashboard" className="group relative flex flex-col justify-start rounded-xl border-2 border-[#dcdee1] dark:border-gray-700 bg-white dark:bg-[#2a3040] p-5 text-left transition-all duration-150 hover:border-[#df5c37]/40 hover:shadow-lg hover:dark:border-[#df5c37]/40">
              <div className="inline-flex self-start rounded-lg bg-[#6a7180]/15 p-2.5 text-[#6a7180] dark:text-gray-300">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">Dashboard</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#6a7180] dark:text-gray-400">Kelola PRD yang sudah kamu buat</p>
            </Link>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-[#dcdee1] dark:border-gray-800 bg-[#f3f5f6] dark:bg-[#1c2332]/80">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
              Cara Kerjanya
            </h2>
            <p className="mt-4 text-lg text-[#6a7180] dark:text-gray-400">
              Empat langkah sederhana dari ide sampai PRD siap digunakan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="relative text-center group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#df5c37] text-white text-xl font-bold shadow-lg shadow-[#df5c37]/20 dark:shadow-[#df5c37]/20 transition-transform group-hover:scale-110">
                  {step.num}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-[#6a7180] dark:text-gray-400">
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
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
            Untuk Siapa {APP_NAME}?
          </h2>
          <p className="mt-4 text-lg text-[#6a7180] dark:text-gray-400">
            {APP_NAME} dirancang untuk membantu siapa pun yang butuh PRD
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {targetAudience.map((item, i) => (
            <div
              key={item.title}
              style={{ animationDelay: `${i * 0.1}s` }}
              className="group rounded-2xl border border-[#dcdee1] dark:border-gray-800 bg-white dark:bg-[#2a3040] p-8 transition-all hover:shadow-lg hover:border-[#df5c37]/30 dark:hover:border-[#df5c37]/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f5f6] dark:bg-[#df5c37]/10 text-[#df5c37] dark:text-[#df5c37] transition-transform group-hover:scale-110">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-[#6a7180] dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[#dcdee1] dark:border-gray-800 bg-[#f3f5f6] dark:bg-[#1c2332]/80">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
              Kenapa {APP_NAME}?
            </h2>
            <p className="mt-4 text-lg text-[#6a7180] dark:text-gray-400">
              Struktur yang jelas agar ide produkmu siap dibangun
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                style={{ animationDelay: `${i * 0.1}s` }}
                className="text-center group rounded-2xl bg-white dark:bg-[#2a3040] border border-[#dcdee1] dark:border-gray-800 p-8 transition-all hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#df5c37] text-white shadow-lg shadow-[#df5c37]/20 transition-transform group-hover:scale-110">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[#6a7180] dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#df5c37] px-8 py-16 text-center text-white sm:px-16">
          <div className="absolute top-0 right-0 -z-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -z-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Siap Bikin PRD-mu Sekarang?
            </h2>
            <p className="mt-4 text-lg text-[#fffbeb]/90 max-w-2xl mx-auto">
              Mulai dari <strong>{PRICING.pay_per_use.priceLabel}</strong> per dokumen atau
              pilih paket Starter seharga{" "}
              <strong>{PRICING.starter.priceLabel}</strong>/bulan.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/pricing">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base bg-white text-[#df5c37] hover:bg-[#f3f5f6] shadow-xl gap-2"
                >
                  Pilih Paket & Mulai
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
