"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CallbackClientPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Memproses login...");

  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes("access_token=")) {
      // Implicit grant flow — biarkan Supabase client-side handle
      // Redirect ke dashboard, Supabase session otomatis tersimpan dari hash
      setStatus("Login berhasil! Mengalihkan...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
      return;
    }

    // Tidak ada token — redirect ke login
    router.push("/auth/login?error=auth_callback_failed");
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-violet-600" />
        <p className="text-gray-600 dark:text-gray-400">{status}</p>
      </div>
    </div>
  );
}
