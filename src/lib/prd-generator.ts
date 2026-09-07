export interface PRDAnswers {
  product_name: string;
  description: string;
  target_users: string;
  problem: string;
  features: string;
  platform: string | string[];
  auth: string;
  competitors: string;
  differentiator: string;
  pages: string;
  admin_dashboard: string;
  user_flow: string;
  integrations: string;
  timeline: string;
  budget: string;
  multilingual: string;
  notifications: string[] | string;
  dark_mode: string;
  contact: string;
  notes: string;
}

export interface PRDSection {
  title: string;
  content: string;
}

export interface PRDResult {
  title: string;
  date: string;
  sections: PRDSection[];
  fullMarkdown: string;
}

function formatDate(): string {
  const d = new Date();
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function generatePRD(answers: PRDAnswers): PRDResult {
  const features = answers.features
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  const pages = answers.pages
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const integrations = answers.integrations
    ? answers.integrations.split(",").map((i) => i.trim()).filter(Boolean)
    : [];

  const date = formatDate();
  const title = `PRD: ${answers.product_name}`;

  const sections: PRDSection[] = [
    {
      title: "1. Ringkasan Eksekutif",
      content: `${answers.description}

Produk ini dikembangkan untuk menjawab masalah: ${answers.problem}

Dokumen ini disusun pada ${date} dan berfungsi sebagai panduan utama dalam pengembangan ${answers.product_name}.`,
    },
    {
      title: "2. Target Pengguna",
      content: `Produk ${answers.product_name} ditujukan untuk:
${answers.target_users}

**Platform yang didukung:** ${Array.isArray(answers.platform) ? answers.platform.join(", ") : answers.platform}`,
    },
    {
      title: "3. Masalah & Solusi",
      content: `**Masalah:**
${answers.problem}

**Solusi:**
${answers.description}

Dengan adanya ${answers.product_name}, pengguna dapat mengakses solusi secara mudah dan efisien melalui platform yang telah ditentukan.`,
    },
    {
      title: "4. Fitur Utama",
      content: features.length > 0
        ? `Berikut adalah fitur-fitur utama yang akan dikembangkan dalam ${answers.product_name}:

${features.map((f, i) => `${i + 1}. **${f}**`).join("\n")}

${answers.auth !== "Tidak perlu" ? `\n**Sistem Autentikasi:** ${answers.auth}` : "\n**Sistem Autentikasi:** Tidak diperlukan untuk tahap awal."}`
        : "Fitur utama akan ditentukan lebih lanjut selama proses pengembangan.",
    },
    {
      title: "5. Analisis Kompetitor",
      content: `**Kompetitor:**
${answers.competitors}

**Diferensiasi:**
${answers.differentiator}

Keunggulan kompetitif ini menjadi nilai jual utama ${answers.product_name} di pasar.`,
    },
    {
      title: "6. Struktur Halaman / Navigasi",
      content: pages.length > 0
        ? `${answers.product_name} akan memiliki halaman-halaman berikut:

${pages.map((p, i) => `${i + 1}. **${p}**`).join("\n")}

${answers.admin_dashboard !== "Tidak perlu" ? `\n**Dashboard Admin:** ${answers.admin_dashboard}` : ""}`
        : "Struktur halaman akan ditentukan lebih lanjut.",
    },
    {
      title: "7. Alur Pengguna (User Flow)",
      content: `Berikut adalah alur pengguna utama dalam ${answers.product_name}:

${answers.user_flow}

Alur ini akan menjadi acuan utama dalam perancangan User Experience (UX) aplikasi.`,
    },
    {
      title: "8. Kebutuhan Teknis",
      content: `**Autentikasi:** ${answers.auth}
**Multibahasa:** ${answers.multilingual}
**Mode Gelap:** ${answers.dark_mode}
**Notifikasi:** ${Array.isArray(answers.notifications) ? answers.notifications.join(", ") : answers.notifications}
${integrations.length > 0 ? `\n**Integrasi Pihak Ketiga:**\n${integrations.map((i) => `- ${i}`).join("\n")}` : ""}`,
    },
    {
      title: "9. Timeline & Budget",
      content: `**Timeline Pengembangan:** ${answers.timeline}

**Budget:** ${answers.budget}

Keduanya akan menjadi acuan dalam penentuan prioritas fitur dan tahapan pengembangan.`,
    },
    {
      title: "10. Informasi Tim & Kontak",
      content: answers.contact
        ? `**Tim Pengembang:**\n${answers.contact}`
        : "Informasi tim akan diisi kemudian.",
    },
    {
      title: "11. Catatan Tambahan",
      content: answers.notes || "Tidak ada catatan tambahan.",
    },
  ];

  // Build full markdown
  const fullMarkdown = `# PRD: ${answers.product_name}

**Tanggal:** ${date}
**Status:** Draft

---

${sections.map((s) => `## ${s.title}\n\n${s.content}`).join("\n\n---\n\n")}

---

*Dokumen ini dibuat secara otomatis oleh BuatPakeAI — generator PRD berbasis AI.*
`;

  return {
    title,
    date,
    sections,
    fullMarkdown,
  };
}
