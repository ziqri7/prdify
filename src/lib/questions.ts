export interface Question {
  id: string;
  question: string;
  type: "text" | "textarea" | "select" | "multiselect";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export const questions: Question[] = [
  {
    id: "product_name",
    question: "Apa nama produk/website yang ingin kamu buat?",
    type: "text",
    placeholder: "Contoh: TokoOnline.id, Aplikasi BelajarKu",
    required: true,
  },
  {
    id: "description",
    question: "Jelaskan ide produkmu secara singkat (1-2 kalimat)",
    type: "textarea",
    placeholder: "Contoh: Platform e-commerce khusus produk kerajinan tangan lokal yang menghubungkan pengrajin dengan pembeli",
    required: true,
  },
  {
    id: "target_users",
    question: "Siapa target pengguna utama produkmu?",
    type: "textarea",
    placeholder: "Contoh: Remaja usia 18-25 tahun yang suka belanja online, Ibu rumah tangga yang mencari produk unik",
    required: true,
  },
  {
    id: "problem",
    question: "Masalah apa yang ingin kamu selesaikan dengan produk ini?",
    type: "textarea",
    placeholder: "Contoh: Pengrajin lokal kesulitan memasarkan produknya secara online",
    required: true,
  },
  {
    id: "features",
    question: "Apa saja fitur utama yang kamu inginkan? (pisahkan dengan koma)",
    type: "textarea",
    placeholder: "Contoh: Katalog produk, Keranjang belanja, Pembayaran online, Lacak pesanan, Chat dengan penjual",
    required: true,
  },
  {
    id: "platform",
    question: "Platform apa yang akan didukung?",
    type: "multiselect",
    options: ["Website (Responsive)", "Aplikasi Mobile (Android)", "Aplikasi Mobile (iOS)", "Desktop App"],
    required: true,
  },
  {
    id: "auth",
    question: "Apakah produkmu perlu sistem login/registrasi?",
    type: "select",
    options: ["Ya, perlu login/registrasi", "Tidak perlu", "Mungkin nanti"],
    required: true,
  },
  {
    id: "competitors",
    question: "Siapa kompetitor utama produkmu?",
    type: "textarea",
    placeholder: "Contoh: Tokopedia, Shopee, Bukalapak — atau tidak punya kompetitor langsung",
    required: true,
  },
  {
    id: "differentiator",
    question: "Apa yang membedakan produkmu dari kompetitor?",
    type: "textarea",
    placeholder: "Contoh: Fokus pada produk kerajinan tangan, kurasi ketat, komunitas pengrajin",
    required: true,
  },
  {
    id: "pages",
    question: "Halaman apa saja yang diperlukan? (pisahkan dengan koma)",
    type: "textarea",
    placeholder: "Contoh: Beranda, Katalog, Tentang Kami, Kontak, Blog, FAQ",
    required: true,
  },
  {
    id: "admin_dashboard",
    question: "Apakah perlu dashboard admin untuk mengelola konten?",
    type: "select",
    options: ["Ya, perlu dashboard admin", "Tidak perlu", "Mungkin nanti"],
    required: true,
  },
  {
    id: "user_flow",
    question: "Jelaskan alur pengguna utama (dari datang sampai tujuan tercapai)",
    type: "textarea",
    placeholder: "Contoh: Pengguna datang → Lihat katalog → Pilih produk → Checkout → Bayar → Dapat notifikasi",
    required: true,
  },
  {
    id: "integrations",
    question: "Apakah perlu integrasi dengan pihak ketiga? (pisahkan dengan koma)",
    type: "textarea",
    placeholder: "Contoh: Payment Gateway (Midtrans/Xendit), API Ongkir, Google Analytics, Mailchimp",
    required: false,
  },
  {
    id: "timeline",
    question: "Target deadline / timeline pengembangan?",
    type: "text",
    placeholder: "Contoh: 3 bulan, atau 'tidak ada deadline khusus'",
    required: true,
  },
  {
    id: "budget",
    question: "Budget yang tersedia untuk pengembangan?",
    type: "text",
    placeholder: "Contoh: Rp 5-10 juta, atau 'belum ada budget'",
    required: true,
  },
  {
    id: "multilingual",
    question: "Apakah perlu fitur multibahasa?",
    type: "select",
    options: ["Hanya Bahasa Indonesia", "Indonesia + Inggris", "Multibahasa (3+ bahasa)", "Tidak perlu"],
    required: true,
  },
  {
    id: "notifications",
    question: "Apakah perlu fitur notifikasi?",
    type: "multiselect",
    options: ["Email notifikasi", "Push notification", "Notifikasi WhatsApp", "Tidak perlu"],
    required: true,
  },
  {
    id: "dark_mode",
    question: "Apakah perlu mode gelap (dark mode)?",
    type: "select",
    options: ["Ya", "Tidak", "Mungkin nanti"],
    required: true,
  },
  {
    id: "contact",
    question: "Informasi kontak / tim pengembang (jika ada)",
    type: "textarea",
    placeholder: "Contoh: Nama: Andi, Email: andi@email.com, Tim: 2 orang (1 frontend, 1 backend)",
    required: false,
  },
  {
    id: "notes",
    question: "Catatan tambahan (opsional)",
    type: "textarea",
    placeholder: "Ada hal lain yang ingin kamu sampaikan?",
    required: false,
  },
];

export const totalQuestions = questions.length;
