import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE, PRICING, getStarterPricePerPrd } from "@/lib/constants";
import {
  FileText,
  Sparkles,
  ArrowRight,
  Users,
  GraduationCap,
  Briefcase,
  Eye,
  CheckCircle2,
  CircleHelp,
  Send,
} from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "Kebutuhan lebih terstruktur",
    description:
      "Masalah, pengguna, ruang lingkup MVP, fitur prioritas, dan alur penggunaan disusun dalam satu dokumen.",
  },
  {
    icon: CircleHelp,
    title: "Asumsi tidak tersembunyi",
    description:
      "Asumsi dan pertanyaan terbuka dibuat terlihat, supaya tidak langsung dianggap sebagai fakta saat mulai membangun.",
  },
  {
    icon: Send,
    title: "Brief untuk langkah berikutnya",
    description:
      "Tinjau dan gunakan hasilnya sebagai bahan diskusi dengan developer atau AI coding tool sebelum proses build.",
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
      <section className="relative isolate overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f3f5f6] via-white to-white dark:from-[#2a3040]/20 dark:via-[#1c2332] dark:to-[#1c2332]" />
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/4 rounded-full bg-gradient-to-br from-[#df5c37]/20 to-[#d97706]/20 blur-3xl dark:from-[#df5c37]/10 dark:to-[#d97706]/10" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/4 rounded-full bg-gradient-to-tr from-[#d97706]/20 to-[#df5c37]/20 blur-3xl dark:from-[#d97706]/10 dark:to-[#df5c37]/10" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pt-32">
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

          <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-2xl border border-[#dcdee1] bg-white/95 text-left shadow-2xl shadow-[#df5c37]/10 backdrop-blur dark:border-gray-700 dark:bg-[#2a3040]/95">
            <div className="flex items-center justify-between border-b border-[#dcdee1] bg-[#f8f9fa] px-5 py-3 dark:border-gray-700 dark:bg-[#1c2332]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1c2332] dark:text-white">
                <FileText className="h-4 w-4 text-[#df5c37]" />
                Preview hasil PRD
              </div>
              <span className="rounded-full bg-[#df5c37]/10 px-2.5 py-1 text-xs font-semibold text-[#df5c37]">Contoh ilustratif</span>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
              {[
                ["Masalah", "Jadwal lapangan masih ditanyakan satu per satu lewat chat admin."],
                ["MVP prioritas", "Cari jadwal, pilih slot, reservasi, dan konfirmasi booking."],
                ["Pertanyaan terbuka", "Apakah pembayaran dilakukan di aplikasi atau di lokasi?"],
              ].map(([title, content]) => (
                <div key={title} className="rounded-xl border border-[#dcdee1] bg-[#f8f9fa] p-4 dark:border-gray-700 dark:bg-[#1c2332]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#df5c37]">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#6a7180] dark:text-gray-300">{content}</p>
                </div>
              ))}
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
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">Inspirasi PRD</h3>
              <p className="mt-1 text-xs leading-relaxed text-[#6a7180] dark:text-gray-400">Lihat contoh untuk booking, marketplace, edukasi, dan operasional</p>
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

      {/* Explain the product before asking a visitor to decide on a package. */}
      <section className="border-y border-[#dcdee1] bg-[#f8f9fa] dark:border-gray-800 dark:bg-[#1c2332]/80">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#df5c37]/10 px-3 py-1.5 text-sm font-medium text-[#df5c37]">
            <FileText className="h-4 w-4" />
            Kenali hasil yang akan kamu dapatkan
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Apa itu PRD?
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-[#6a7180] dark:text-gray-400">
            PRD (<span className="font-medium text-[#1c2332] dark:text-gray-200">Product Requirements Document</span>) adalah dokumen yang mengubah ide produk menjadi rencana yang jelas: siapa penggunanya, masalah yang diselesaikan, fitur yang dibangun lebih dulu, alur penggunaan, dan ukuran keberhasilannya.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[#6a7180] dark:text-gray-400">
            Dengan PRD, kamu tidak perlu menjelaskan ide dari nol berulang kali saat berdiskusi dengan developer atau menggunakan AI coding tool.
          </p>
        </div>
      </section>

      {/* Make the value exchange concrete instead of only describing it. */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#df5c37]/10 px-3 py-1.5 text-sm font-medium text-[#df5c37]">
            <Sparkles className="h-4 w-4" />
            Dari jawabanmu, bukan template kosong
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Dari ide mentah ke PRD siap dibangun
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#6a7180] dark:text-gray-400">
            Lihat bagaimana satu ide singkat dapat diterjemahkan menjadi titik awal yang lebih jelas untuk proses build.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_auto_1.25fr] lg:items-stretch">
          <article className="rounded-2xl border border-[#dcdee1] bg-[#f8f9fa] p-6 dark:border-gray-700 dark:bg-[#1c2332] sm:p-8">
            <span className="inline-flex rounded-full bg-[#6a7180]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#6a7180] dark:text-gray-300">Sebelum</span>
            <h3 className="mt-5 text-xl font-bold text-[#1c2332] dark:text-white">Ide yang masih mentah</h3>
            <blockquote className="mt-5 border-l-4 border-[#d97706] pl-4 text-lg leading-relaxed text-[#4b5563] dark:text-gray-300">
              “Saya ingin aplikasi booking lapangan supaya orang tidak perlu chat admin terus.”
            </blockquote>
            <p className="mt-6 text-sm leading-relaxed text-[#6a7180] dark:text-gray-400">
              Ini sudah sebuah awal yang baik, tetapi belum menjawab ruang lingkup, prioritas, atau hal yang harus dipastikan sebelum dibangun.
            </p>
          </article>

          <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
            <ArrowRight className="h-8 w-8 text-[#df5c37]" />
          </div>

          <article className="overflow-hidden rounded-2xl border border-[#df5c37]/30 bg-white shadow-xl shadow-[#df5c37]/10 dark:border-[#df5c37]/40 dark:bg-[#2a3040]">
            <div className="flex items-center justify-between border-b border-[#dcdee1] bg-[#fffbeb] px-5 py-3 dark:border-gray-700 dark:bg-[#d97706]/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1c2332] dark:text-white">
                <FileText className="h-4 w-4 text-[#df5c37]" />
                Sesudah: potongan PRD
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Siap ditinjau</span>
            </div>
            <div className="grid gap-3 p-5 text-sm sm:grid-cols-2 sm:p-6">
              {[
                ["Target pengguna", "Pemain dan admin lapangan yang membutuhkan jadwal terkini."],
                ["Masalah utama", "Ketersediaan lapangan belum terlihat tanpa menghubungi admin."],
                ["MVP prioritas", "Pencarian jadwal, pemilihan slot, reservasi, dan konfirmasi."],
                ["Asumsi terbuka", "Metode pembayaran dan aturan pembatalan perlu diputuskan."],
                ["Metrik awal", "Jumlah reservasi selesai dan waktu respons konfirmasi."],
              ].map(([title, content], index) => (
                <div key={title} className={index === 4 ? "rounded-xl border border-[#dcdee1] bg-[#f8f9fa] p-4 dark:border-gray-700 dark:bg-[#1c2332] sm:col-span-2" : "rounded-xl border border-[#dcdee1] bg-[#f8f9fa] p-4 dark:border-gray-700 dark:bg-[#1c2332]"}>
                  <p className="font-semibold text-[#df5c37]">{title}</p>
                  <p className="mt-1.5 leading-relaxed text-[#6a7180] dark:text-gray-400">{content}</p>
                </div>
              ))}
            </div>
            <p className="mx-5 mb-5 border-l-2 border-[#d97706] pl-3 text-xs italic leading-relaxed text-[#6a7180] dark:text-gray-400 sm:mx-6 sm:mb-6">Contoh ilustratif; isi PRD dibuat dari jawaban yang kamu berikan dan tetap perlu ditinjau sebelum digunakan untuk membangun.</p>
          </article>
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

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
            <div className="mx-auto mt-9 grid max-w-4xl gap-3 text-left sm:grid-cols-3">
              {[
                ["Sekali Pakai", "Coba satu ide dengan komitmen ringan."],
                ["Starter", "Untuk kebutuhan PRD rutin dalam satu bulan."],
                ["Pro", "Kualitas AI lebih kuat untuk pekerjaan produk yang lebih serius."],
              ].map(([plan, description]) => (
                <div key={plan} className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="font-bold text-white">{plan}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#fffbeb]/85">{description}</p>
                </div>
              ))}
            </div>
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
