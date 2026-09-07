"use client";

import { useParams } from "next/navigation";
import { usePRDStore } from "@/store/use-prd-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  FileText,
  FileDown,
  ExternalLink,
  ArrowLeft,
  Edit3,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PreviewPage() {
  const params = useParams();
  const generatedPRD = usePRDStore((s) => s.generatedPRD);
  const packageType = usePRDStore((s) => s.packageType);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (generatedPRD) {
      navigator.clipboard.writeText(generatedPRD);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const exportAsMarkdown = () => {
    if (!generatedPRD) return;
    const blob = new Blob([generatedPRD], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BuatPakeAI-PRD.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // If no PRD generated yet, show placeholder
  if (!generatedPRD) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Belum Ada PRD
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Kamu belum membuat PRD. Mulai dengan menjawab pertanyaan-pertanyaan
            kami.
          </p>
          <Link href="/questionnaire">
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Buat PRD Sekarang
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Preview PRD
              </h1>
              <Badge variant="success">Selesai</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PRD siap untuk di-download atau diedit
            </p>
          </div>
          <div className="flex items-center gap-2">
            {packageType === "pro" && (
              <Link href={`/edit/${params.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Salin
                </>
              )}
            </Button>
            <Button size="sm" className="gap-2" onClick={exportAsMarkdown}>
              <Download className="h-4 w-4" />
              Download .md
            </Button>
          </div>
        </div>

        {/* Export options for Pro */}
        {packageType === "pro" && (
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Export ke:
                </span>
                <Button variant="secondary" size="sm" className="gap-2">
                  <FileDown className="h-4 w-4" />
                  PDF
                </Button>
                <Button variant="secondary" size="sm" className="gap-2">
                  <FileDown className="h-4 w-4" />
                  DOCX
                </Button>
                <span className="text-xs text-gray-400 mx-2">|</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Integrasi:
                </span>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Trello
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Notion
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Google Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PRD Content */}
        <Card>
          <CardContent className="p-6 sm:p-10">
            <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-violet-600">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {generatedPRD}
              </ReactMarkdown>
            </article>
          </CardContent>
        </Card>

        {/* Bottom actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/questionnaire">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Buat PRD Baru
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {packageType === "pro" && (
              <Link href={`/edit/${params.id}`}>
                <Button variant="outline" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit PRD
                </Button>
              </Link>
            )}
            <Button className="gap-2" onClick={exportAsMarkdown}>
              <Download className="h-4 w-4" />
              Download .md
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
