# BuatPakeAI

BuatPakeAI adalah aplikasi web untuk menyusun *Product Requirements Document* (PRD) dari kuesioner terpandu. Pengguna masuk, memilih paket, menyelesaikan pembayaran, menjawab pertanyaan tentang produknya, lalu memperoleh dokumen PRD yang dapat dipratinjau dan diekspor.

> **Status implementasi:** generator PRD memakai DeepInfra AI. Pay Per Use menggunakan kredit prabayar; Starter memiliki kuota 5 PRD per periode; Pro/Pro Tahunan tidak memiliki kuota bulanan tetapi dibatasi penggunaan wajar 10 PRD per jam. Chat AI, integrasi Trello, Notion, dan Google Docs belum tersedia.

## Fitur yang tersedia

- Autentikasi Google-only melalui Supabase OAuth dengan alur PKCE.
- Kuesioner produk bertahap (20 pertanyaan) dan generator PRD berbasis DeepInfra AI.
- Penyimpanan PRD di Supabase, dashboard riwayat, pratinjau, serta penyuntingan judul dan isi Markdown.
- Ekspor Markdown di browser, plus ekspor PDF dan DOCX melalui endpoint aplikasi.
- Galeri inspirasi PRD untuk booking, marketplace, edukasi, dan operasional.
- Pay Per Use memakai satu kredit prabayar yang baru dikonsumsi setelah PRD berhasil tersimpan.
- Reservasi mencegah kredit atau kuota dipakai dua kali. Jika DeepInfra atau penyimpanan PRD gagal, reservasi dilepas dan kredit/kuota dikembalikan.
- Checkout production saat ini diprioritaskan untuk SumoPod dengan webhook bertanda tangan. DOKU dan iPaymu belum diaktifkan karena verifikasi webhook signed belum diimplementasikan.

## Paket dan harga pada aplikasi

Harga berikut bersumber dari konfigurasi aplikasi saat ini. Kuota dan entitlement ditegakkan oleh fungsi database setelah notifikasi pembayaran gateway yang tervalidasi.

| Paket | Harga | Penawaran di UI |
| --- | ---: | --- |
| Pay Per Use | Rp25.000/dokumen | 1 kredit prabayar untuk 1 PRD AI; kredit dikonsumsi setelah PRD berhasil dibuat |
| Starter | Rp66.000/periode | Kuota 5 PRD per periode langganan; riwayat PRD |
| Pro | Rp133.000/periode | Tanpa kuota bulanan; penggunaan wajar maksimal 10 PRD per jam; edit, PDF/DOCX |
| Pro Tahunan | Rp99.000/bulan (Rp1.188.000/tahun) | Benefit Pro dengan periode langganan tahunan dan batas penggunaan wajar yang sama |

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
DEEPINFRA_API_KEY=<deepinfra-api-key>
# Optional compatibility/default model for Pay Per Use and Starter.
DEEPINFRA_MODEL=<deepinfra-model>
# Optional timeout in milliseconds; accepted range is 10000–90000.
DEEPINFRA_TIMEOUT_MS=60000
```

Untuk project baru, jalankan seluruh isi [`supabase-schema.sql`](./supabase-schema.sql) melalui Supabase SQL Editor. Untuk project yang sudah berjalan, jalankan migrasi secara urut dari folder [`supabase-migrations`](./supabase-migrations), termasuk `20260911_payment_status_allowlist.sql`. Setelah itu:

```bash
npm run dev
```

Buka `http://localhost:3000`. Sebelum mengirim perubahan atau deploy, jalankan:

```bash
npm run lint
npm run build
```

## Konfigurasi pembayaran

Aplikasi production saat ini memilih SumoPod bila `SUMOPOD_API_KEY` dan `SUMOPOD_WEBHOOK_SECRET` tersedia. Gateway mock hanya tersedia di development. DOKU dan iPaymu tidak boleh diaktifkan untuk transaksi production sampai webhook signed masing-masing selesai diverifikasi dan diimplementasikan.

```dotenv
# SumoPod
SUMOPOD_API_KEY=
SUMOPOD_BASE_URL=
SUMOPOD_WEBHOOK_SECRET=
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

Pembayaran dan akses dokumen adalah area sensitif. Pastikan `SUMOPOD_WEBHOOK_SECRET` tersimpan di environment production, jalankan semua migrasi, dan uji SumoPod sandbox sebelum menerima transaksi nyata. Fungsi billing dan reservasi hanya boleh dijalankan oleh `service_role`. DOKU/iPaymu tetap tidak aman untuk transaksi production selama webhook signed mereka belum diimplementasikan.
