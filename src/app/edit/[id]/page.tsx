"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { Save, Eye, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
// Gunakan API endpoint — tidak langsung akses Supabase dari client

export default function EditPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocument = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/documents/${id}`);
      const result = await res.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Gagal memuat PRD");
      }

      setTitle(result.data.title || "PRD");
      setContent(result.data.markdown_content || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat PRD");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) void Promise.resolve().then(loadDocument);
  }, [id, loadDocument]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title,
          markdown_content: content,
        }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Gagal menyimpan");

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Gagal menyimpan perubahan");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Memuat PRD...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Gagal Memuat PRD</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit PRD</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/preview/${id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </Link>
            <Button
              size="sm"
              className="gap-2"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan..." : saved ? "Tersimpan!" : "Simpan"}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setSaved(false);
              }}
              className="w-full min-h-[60vh] rounded-xl border-0 bg-transparent p-4 text-sm font-mono leading-relaxed text-gray-800 dark:text-gray-200 focus:outline-none resize-y"
              spellCheck={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
