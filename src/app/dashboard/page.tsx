"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  PlusCircle,
  Clock,
  ExternalLink,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PRDDocument } from "@/lib/supabase-types";

export default function DashboardPage() {
  const [documents, setDocuments] = useState<PRDDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Silakan login untuk melihat dashboard.");
        return;
      }

      const { data, error: dbError } = await supabase
        .from("prd_documents")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;
      setDocuments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data PRD");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadDocuments);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus PRD ini? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      const { error } = await supabase
        .from("prd_documents")
        .update({ status: "deleted" })
        .eq("id", id);
      if (error) throw error;
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Gagal menghapus PRD");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getPackageLabel = (pkg: string | null) => {
    if (!pkg) return "-";
    const map: Record<string, string> = {
      basic: "Basic",
      pro: "Pro",
    };
    return map[pkg] || pkg;
  };

  const stats = [
    {
      label: "Total PRD",
      value: documents.length.toString(),
      icon: FileText,
    },
    {
      label: "Aktif (Basic)",
      value: documents.filter((d) => d.package_type === "basic").length.toString(),
      icon: FileText,
    },
    {
      label: "Aktif (Pro)",
      value: documents.filter((d) => d.package_type === "pro").length.toString(),
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-[#6a7180] dark:text-gray-400 mt-1">
              Kelola riwayat PRD yang sudah kamu buat
            </p>
          </div>
          <Link href="/questionnaire">
            <Button className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Buat PRD Baru
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {stats.map((stat, i) => (
            <Card key={stat.label} className="hover:shadow-md hover:border-[#df5c37]/30 dark:hover:border-[#df5c37]/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f5f6] dark:bg-[#df5c37]/10 text-[#df5c37] dark:text-[#df5c37]">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-[#6a7180] dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* PRD List */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Riwayat PRD
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Memuat data...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            ) : documents.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e7eaec] dark:bg-gray-800 shrink-0">
                        <FileText className="h-5 w-5 text-[#6a7180] dark:text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {doc.title || "PRD tanpa judul"}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-[#6a7180]">
                            {formatDate(doc.created_at)}
                          </span>
                          <Badge
                            variant={
                              doc.package_type === "pro" ? "default" : "secondary"
                            }
                            className="text-[10px] px-1.5 py-0"
                          >
                            {getPackageLabel(doc.package_type)}
                          </Badge>
                          {doc.is_paid ? (
                            <Badge
                              variant="discount"
                              className="text-[10px] px-1.5 py-0"
                            >
                              Lunas
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700"
                            >
                              Belum Bayar
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Link href={`/preview/${doc.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/preview/${doc.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Belum ada PRD yang dibuat
                </p>
                <Link href="/questionnaire">
                  <Button className="mt-4 gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Buat PRD Pertama
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
