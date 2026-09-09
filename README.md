# BuatPakeAI

BuatPakeAI adalah aplikasi web untuk menyusun *Product Requirements Document* (PRD) dari kuesioner terpandu. Pengguna masuk, memilih paket, menyelesaikan pembayaran, menjawab pertanyaan tentang produknya, lalu memperoleh dokumen PRD yang dapat dipratinjau dan diekspor.

> **Status implementasi:** generator saat ini memakai template deterministik dari jawaban kuesioner. Aplikasi belum memanggil model AI eksternal. Fitur Chat AI dan integrasi Trello, Notion, serta Google Docs masih belum diimplementasikan meskipun beberapa materi harga/UI menyebutkannya.

## Fitur yang tersedia

- Autentikasi Google-only melalui Supabase OAuth dengan alur PKCE.
- Kuesioner produk bertahap (20 pertanyaan) dan generator PRD Markdown berbasis template.
- Penyimpanan PRD di Supabase, dashboard riwayat, pratinjau, serta penyuntingan judul dan isi Markdown.
- Ekspor Markdown di browser, plus ekspor PDF dan DOCX melalui endpoint aplikasi.
- Halaman template PRD kosong untuk diunduh.
- Alur checkout dengan dukungan adapter Midtrans, SumoPod Pay, DOKU, dan iPaymu. Bila tidak ada kredensial gateway, aplikasi memakai invoice mock agar alur pengembangan dapat diuji.

## Paket dan harga pada aplikasi

Harga berikut bersumber dari konfigurasi aplikasi saat ini. Klaim kuota/langganan di bawah adalah penawaran produk; penagihan berulang dan penegakan kuota belum dibangun sebagai mekanisme backend yang lengkap.

| Paket | Harga | Penawaran di UI |
| --- | ---: | --- |
| Pay Per Use | Rp25.000/dokumen | 1 PRD, akses penuh, unduh Markdown |
| Starter | Rp66.000/bulan | 5 PRD/bulan, riwayat PRD |
| Pro | Rp133.000/bulan | PRD tanpa batas, edit, PDF/DOCX, fitur Chat AI yang direncanakan |
| Pro Tahunan | Rp99.000/bulan (Rp1.188.000/tahun) | Penawaran Pro dengan harga tahunan; fitur baru prioritas |

Database saat ini menyimpan dua tingkat akses teknis: `basic` untuk Pay Per Use/Starter dan `pro` untuk Pro/Pro Tahunan.

## Teknologi

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 dan komponen Radix UI
- Supabase Auth + PostgreSQL
- Zustand untuk state antarmuka
- `@react-pdf/renderer` dan `docx` untuk ekspor

## Menjalankan secara lokal

Prasyarat: Node.js versi LTS terkini dan project Supabase.

```bash
cd prdify
npm install
```

Buat file `.env.local` di folder `prdify` dengan nilai berikut:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Jalankan seluruh isi [`supabase-schema.sql`](./supabase-schema.sql) melalui Supabase SQL Editor sebelum menggunakan aplikasi. Setelah itu:

```bash
npm run dev
```

Buka `http://localhost:3000`. Sebelum mengirim perubahan atau deploy, jalankan:

```bash
npm run lint
npm run build
```

## Konfigurasi pembayaran

Aplikasi memilih gateway yang memiliki kredensial, dengan urutan Midtrans → SumoPod → DOKU → iPaymu. Konfigurasikan setidaknya satu gateway berikut untuk checkout non-mock:

```dotenv
# Midtrans
MIDTRANS_SERVER_KEY=

# SumoPod
SUMOPOD_API_KEY=
SUMOPOD_BASE_URL=
SUMOPOD_WEBHOOK_SECRET=

# DOKU
DOKU_CLIENT_ID=
DOKU_SECRET_KEY=
DOKU_IS_PRODUCTION=false

# iPaymu
IPAYMU_API_KEY=
IPAYMU_PRIVATE_KEY=
IPAYMU_VA=
IPAYMU_MODE=sandbox
```

Jangan pernah menyimpan `.env.local`, service-role key, atau credential gateway dalam Git. Detail environment production dan checklist keamanan tersedia di [`../DEPLOYMENT_GUIDE.md`](../DEPLOYMENT_GUIDE.md).

## Rute utama

| Rute | Kegunaan |
| --- | --- |
| `/` | Landing page |
| `/pricing` | Paket dan harga |
| `/payment` | Memilih metode dan membuat checkout |
| `/questionnaire` | Kuesioner pembuatan PRD (perlu login) |
| `/preview/:id` | Pratinjau dan ekspor PRD (perlu login) |
| `/edit/:id` | Mengubah PRD (perlu login) |
| `/dashboard` | Riwayat PRD (perlu login) |
| `/template` | Unduh template PRD |

## Catatan sebelum production

Pembayaran dan akses dokumen adalah area sensitif. Sebelum menerima transaksi nyata, verifikasi bahwa autentikasi dan otorisasi pemilik dokumen berlaku pada semua endpoint, webhook setiap gateway diverifikasi dengan signature resmi, payment dikaitkan dengan PRD yang tepat, dan status berbayar hanya berubah setelah notifikasi gateway yang tervalidasi. Uji alur tersebut di sandbox masing-masing gateway.
