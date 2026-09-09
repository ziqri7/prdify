import { APP_NAME } from "@/lib/constants";
import { FileText } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#dcdee1] dark:border-[#3a4155] bg-[#f3f5f6] dark:bg-[#1c2332]/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#df5c37] text-white">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-[#df5c37]">
                {APP_NAME}
              </span>
            </div>
            <p className="text-sm text-[#6a7180] dark:text-gray-400">
              Bikin PRD profesional dengan cepat dan mudah. Cukup jawab
              pertanyaan, dapatkan dokumen PRD siap pakai.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Produk
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/pricing", label: "Harga", badge: "Promo" },
                { href: "/template", label: "Inspirasi PRD" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-sm text-[#6a7180] dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                    {link.badge && (
                      <span className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Bantuan
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/pricing#faq", label: "FAQ Paket & Harga" },
                { href: "/template", label: "Panduan lewat contoh PRD" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6a7180] dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-10 border-t border-[#dcdee1] dark:border-[#3a4155] pt-6 text-center">
          <p className="text-sm text-[#9ca3af] dark:text-gray-500">
            &copy; {new Date().getFullYear()} {APP_NAME}. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
