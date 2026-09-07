"use client";

import { useParams } from "next/navigation";
import { usePRDStore } from "@/store/use-prd-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Save, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditPage() {
  const params = useParams();
  const generatedPRD = usePRDStore((s) => s.generatedPRD);
  const [content, setContent] = useState(generatedPRD || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (generatedPRD) setContent(generatedPRD);
  }, [generatedPRD]);

  const handleSave = () => {
    // In production, save to Supabase
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!generatedPRD) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Tidak Ada PRD</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Buat PRD dulu sebelum mengedit.
          </p>
          <Link href="/questionnaire">
            <Button>Buat PRD</Button>
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
              Edit konten PRD sesuai kebutuhanmu
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/preview/${params.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </Link>
            <Button size="sm" className="gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" />
              {saved ? "Tersimpan!" : "Simpan"}
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
