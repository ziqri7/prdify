"use client";

import { useParams } from "next/navigation";
import { usePRDStore } from "@/store/use-prd-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  FileText,
  FileDown,
  ArrowLeft,
  Edit3,
  Copy,
  Check,
  Lock,
  Eye,
  Loader2,
  Rocket,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PRDDocumentData {
  id: string;
  title: string;
  markdown_content: string;
  package_type: "basic" | "pro";
  is_paid: boolean;
  created_at: string;
}

export default function PreviewPage() {
  const params = useParams();
  const packageType = usePRDStore((s) => s.packageType);
  const [copied, setCopied] = useState(false);
  const [buildBriefCopied, setBuildBriefCopied] = useState(false);
  const [docData, setDocData] = useState<PRDDocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocument() {
      try {
        const response = await fetch(`/api/documents/${params.id}`);
        const result = await response.json();

        if (result.success && result.data) {
          setDocData(result.data);
        } else {
          setError(result.error || "PRD tidak ditemukan");
        }
      } catch {
        setError("Gagal mengambil dokumen");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchDocument();
    }
  }, [params.id]);

  const copyToClipboard = () => {
    if (docData?.markdown_content) {
      navigator.clipboard.writeText(docData.markdown_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyBuildBrief = () => {
    if (!docData?.markdown_content) return;
    navigator.clipboard.writeText(buildImplementationBrief(docData.title, docData.markdown_content));
    setBuildBriefCopied(true);
    setTimeout(() => setBuildBriefCopied(false), 2000);
  };

  const exportAsMarkdown = () => {
    if (!docData?.markdown_content) return;
    const blob = new Blob([docData.markdown_content], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BuatPakeAI-PRD.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAs = async (format: "pdf" | "docx") => {
    if (!docData?.markdown_content) return;
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          content: docData.markdown_content,
          title: docData.title || "BuatPakeAI-PRD",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || `Gagal export ${format.toUpperCase()}`);
        return;
      }
      // Download the blob
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "pdf" ? "pdf" : "docx";
      a.download = `${docData.title || "BuatPakeAI-PRD"}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Gagal mengekspor ${format.toUpperCase()}`);
      console.error(err);
    }
  };

  // Always use persisted server data for feature access. Browser state may be
  // stale, especially after a user returns to a Pro Tahunan document later.
  const isProDocument = docData?.package_type === "pro";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Memuat dokumen...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !docData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">PRD Tidak Ditemukan</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error || "Dokumen yang kamu cari tidak tersedia."}
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
              {!docData.is_paid && (
                <Badge
                  variant="outline"
                  className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400"
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Terkunci
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PRD siap untuk di-download atau diedit
            </p>
          </div>
          <div className="flex items-center gap-2">
            {docData.is_paid && isProDocument && (
              <Link href={`/edit/${params.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
            {docData.is_paid && (
              <>
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
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={exportAsMarkdown}
                >
                  <Download className="h-4 w-4" />
                  Download .md
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Export options for Pro — only if paid */}
        {docData.is_paid && isProDocument && (
          <Card className="mb-8 border-violet-200 bg-violet-50/50 dark:border-violet-500/30 dark:bg-violet-500/5">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Export ke:
                </span>
                <Button variant="secondary" size="sm" className="gap-2" onClick={() => exportAs("pdf")}>
                  <FileDown className="h-4 w-4" />
                  PDF
                </Button>
                <Button variant="secondary" size="sm" className="gap-2" onClick={() => exportAs("docx")}>
                  <FileDown className="h-4 w-4" />
                  DOCX
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PRD Content */}

        {/* If not paid: show first section clearly, then blur the rest + overlay paywall */}
        {!docData.is_paid ? (
          <div className="relative">
            {/* First ~30% of content shown clearly */}
            <Card className="mb-4">
              <CardContent className="p-6 sm:p-10">
                <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-violet-600">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {getFirstSection(docData.markdown_content)}
                  </ReactMarkdown>
                </article>
              </CardContent>
            </Card>

            {/* Remaining content blurred */}
            <div className="relative">
              <div
                className="select-none"
                style={{ filter: "blur(8px)", pointerEvents: "none" }}
              >
                <Card>
                  <CardContent className="p-6 sm:p-10">
                    <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-violet-600">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {getRestContent(docData.markdown_content)}
                      </ReactMarkdown>
                    </article>
                  </CardContent>
                </Card>
              </div>

              {/* Paywall overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/40 dark:bg-gray-950/40 rounded-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 max-w-sm text-center mx-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                    <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Akses Penuh Terkunci
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    Bayar untuk mengakses seluruh konten PRD, download .md,
                    dan fitur eksklusif lainnya.
                  </p>
                  <Link href={`/payment?package=${packageType || docData.package_type}&prd_id=${params.id}`}>
                    <Button size="lg" className="w-full gap-2">
                      <Eye className="h-5 w-5" />
                      Bayar untuk Akses Penuh
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Paid: full content */
          <Card className="border-[#dcdee1] shadow-sm dark:border-gray-800">
            <CardContent className="p-6 sm:p-10">
              <div className="mb-8 flex flex-col gap-3 border-b border-[#dcdee1] pb-6 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#df5c37]">
                    Dokumen lengkap
                  </p>
                  <p className="mt-1 text-sm text-[#6a7180] dark:text-gray-400">
                    Siap ditinjau bersama tim atau dibawa ke proses development.
                  </p>
                </div>
                {isProDocument && (
                  <Badge className="w-fit border-0 bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Dokumen Pro
                  </Badge>
                )}
              </div>
              <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-violet-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {docData.markdown_content}
                </ReactMarkdown>
              </article>
            </CardContent>
          </Card>
        )}

        {docData.is_paid && (
          <Card className="mt-6 overflow-hidden border-[#df5c37]/30 bg-gradient-to-br from-[#fffbeb] to-white dark:from-[#df5c37]/10 dark:to-[#1c2332]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-[#df5c37]">
                    <Rocket className="h-5 w-5" />
                    <p className="text-sm font-semibold">Langkah selanjutnya</p>
                  </div>
                  <h2 className="mt-2 text-xl font-bold">Ubah PRD ini menjadi produk</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#6a7180] dark:text-gray-400">
                    Salin brief implementasi yang sudah menyertakan PRD ini, lalu tempel ke
                    Cursor, Claude Code, Lovable, atau kirimkan ke developer. AI coding tool
                    akan mendapat konteks produk sebelum mulai membuat kode.
                  </p>
                </div>
                <Button className="shrink-0 gap-2" onClick={copyBuildBrief}>
                  {buildBriefCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {buildBriefCopied ? "Brief tersalin" : "Salin brief implementasi"}
                </Button>
              </div>
              <ol className="mt-6 grid gap-3 text-sm text-[#6a7180] dark:text-gray-400 sm:grid-cols-3">
                <li className="rounded-lg border border-[#dcdee1] bg-white/70 p-3 dark:border-gray-700 dark:bg-[#1c2332]/60"><strong className="text-[#1c2332] dark:text-white">1. Salin brief</strong><br />Gunakan tombol di atas.</li>
                <li className="rounded-lg border border-[#dcdee1] bg-white/70 p-3 dark:border-gray-700 dark:bg-[#1c2332]/60"><strong className="text-[#1c2332] dark:text-white">2. Tempel ke tool</strong><br />Pilih AI coding tool atau kirim ke developer.</li>
                <li className="rounded-lg border border-[#dcdee1] bg-white/70 p-3 dark:border-gray-700 dark:bg-[#1c2332]/60"><strong className="text-[#1c2332] dark:text-white">3. Tinjau rencana</strong><br />Minta klarifikasi sebelum proses build dimulai.</li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Bottom actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/questionnaire">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Buat PRD Baru
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {docData.is_paid && isProDocument && (
              <Link href={`/edit/${params.id}`}>
                <Button variant="outline" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit PRD
                </Button>
              </Link>
            )}
            {docData.is_paid && (
              <Button className="gap-2" onClick={exportAsMarkdown}>
                <Download className="h-4 w-4" />
                Download .md
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildImplementationBrief(title: string, markdown: string): string {
  return `Saya ingin membangun produk berdasarkan PRD berikut. Bertindaklah sebagai product engineer senior.

1. Ringkas kebutuhan inti dan daftar pertanyaan yang benar-benar perlu dijawab sebelum mulai.
2. Usulkan rencana MVP bertahap, termasuk urutan implementasi dan risiko teknis.
3. Jangan mengarang detail yang tidak tertulis dalam PRD; tandai sebagai asumsi atau pertanyaan terbuka.
4. Setelah saya menyetujui rencana, bantu implementasikan satu tahap demi satu tahap.

# PRD: ${title}

${markdown}`;
}

/**
 * Extract the first section (everything before the first `---` separator
 * or before `## 2.`), which represents roughly the first 30% of the PRD.
 */
function getFirstSection(markdown: string): string {
  // Find the first major section break
  const lines = markdown.split("\n");
  let sectionEnd = 0;
  let headingCount = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      headingCount++;
      if (headingCount >= 2) {
        sectionEnd = i;
        break;
      }
    }
  }

  // If we found a section boundary, return content up to it
  if (sectionEnd > 0) {
    return lines.slice(0, sectionEnd).join("\n");
  }

  // Fallback: return ~30% of content
  const charLimit = Math.floor(markdown.length * 0.3);
  return markdown.slice(0, charLimit);
}

/**
 * Get the rest of the content after the first section.
 */
function getRestContent(markdown: string): string {
  const lines = markdown.split("\n");
  let sectionEnd = 0;
  let headingCount = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      headingCount++;
      if (headingCount >= 2) {
        sectionEnd = i;
        break;
      }
    }
  }

  if (sectionEnd > 0) {
    return lines.slice(sectionEnd).join("\n");
  }

  const charLimit = Math.floor(markdown.length * 0.3);
  return markdown.slice(charLimit);
}
