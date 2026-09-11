import { NextResponse } from "next/server";
import { generateDocx } from "@/lib/export-utils";
import { getAuthenticatedUser } from "@/lib/server-auth";

const MAX_EXPORT_CONTENT_LENGTH = 100_000;
const MAX_EXPORT_TITLE_LENGTH = 120;

function toSafeDownloadName(value: string): string {
  const sanitized = value
    .replace(/[\r\n]/g, " ")
    .replace(/[\\/:*?\"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_EXPORT_TITLE_LENGTH);

  return sanitized || "BuatPakeAI-PRD";
}

async function generatePdfBuffer(
  docTitle: string,
  content: string
): Promise<Uint8Array | null> {
  try {
    const ReactPDF = await import("@react-pdf/renderer");
    const React = await import("react");

    const { Document, Page, View, Text, Font } = ReactPDF;

    Font.register({
      family: "Helvetica",
      fonts: [
        { src: "Helvetica", fontWeight: 400 },
        { src: "Helvetica-Bold", fontWeight: 700 },
      ],
    });

    const lines = content.split("\n");
    const pdfContent: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith("# ")) {
        pdfContent.push(
          React.createElement(Text, {
            key: `h1-${i}`,
            style: {
              fontSize: 22,
              fontWeight: 700,
              color: "#1E40AF",
              marginTop: 20,
              marginBottom: 10,
              paddingBottom: 5,
              borderBottom: "2 solid #1E40AF",
            },
          }, line.replace(/^# /, ""))
        );
      } else if (line.startsWith("## ")) {
        pdfContent.push(
          React.createElement(Text, {
            key: `h2-${i}`,
            style: {
              fontSize: 16,
              fontWeight: 700,
              color: "#1E40AF",
              marginTop: 15,
              marginBottom: 8,
            },
          }, line.replace(/^## /, ""))
        );
      } else if (line.startsWith("### ")) {
        pdfContent.push(
          React.createElement(Text, {
            key: `h3-${i}`,
            style: {
              fontSize: 13,
              fontWeight: 700,
              color: "#2563EB",
              marginTop: 10,
              marginBottom: 5,
            },
          }, line.replace(/^### /, ""))
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        pdfContent.push(
          React.createElement(View, {
            key: `li-${i}`,
            style: { flexDirection: "row", marginLeft: 15, marginBottom: 3 },
          }, [
              React.createElement(Text, {
                key: `dot-${i}`,
                style: { fontSize: 11, marginRight: 6 },
              }, "•"),
              React.createElement(Text, {
                key: `text-${i}`,
                style: { fontSize: 11, flex: 1, color: "#374151" },
              }, line.replace(/^[-*] /, "")),
            ])
        );
      } else if (/^\d+\.\s/.test(line)) {
        pdfContent.push(
          React.createElement(View, {
            key: `nl-${i}`,
            style: { flexDirection: "row", marginLeft: 15, marginBottom: 3 },
          }, [
              React.createElement(Text, {
                key: `num-${i}`,
                style: { fontSize: 11, marginRight: 6 },
              }, `${line.match(/^\d+/)?.[0]}.`),
              React.createElement(Text, {
                key: `text-${i}`,
                style: { fontSize: 11, flex: 1, color: "#374151" },
              }, line.replace(/^\d+\.\s/, "")),
            ])
        );
      } else if (line.startsWith("**") && line.endsWith("**")) {
        pdfContent.push(
          React.createElement(Text, {
            key: `bold-${i}`,
            style: {
              fontSize: 11,
              fontWeight: 700,
              color: "#1E40AF",
              marginTop: 10,
              marginBottom: 5,
            },
          }, line.replace(/\*\*/g, ""))
        );
      } else if (line.startsWith("|") && !line.includes("---")) {
        const cells: string[] = line
          .split("|")
          .filter((c: string) => c.trim() !== "")
          .map((c: string) => c.trim());
        if (cells.length > 0) {
          const isHeaderRow = !content.split("\n").find((l: string) => l.trim().startsWith("|---"));
          pdfContent.push(
            React.createElement(View, {
              key: `table-${i}`,
              style: {
                flexDirection: "row",
                marginLeft: 10,
                marginBottom: 4,
                backgroundColor: isHeaderRow ? "#1E40AF" : undefined,
                padding: isHeaderRow ? 4 : 2,
                borderRadius: 2,
              },
            }, cells.map((cell: string, ci: number) =>
                React.createElement(Text, {
                  key: `cell-${i}-${ci}`,
                  style: {
                    fontSize: 9,
                    fontWeight: isHeaderRow ? 700 : 400,
                    color: isHeaderRow ? "#FFFFFF" : "#374151",
                    flex: 1,
                    paddingHorizontal: 4,
                  },
                }, cell)
              ))
          );
        }
      } else {
        pdfContent.push(
          React.createElement(Text, {
            key: `p-${i}`,
            style: { fontSize: 11, marginBottom: 5, color: "#374151" },
          }, line)
        );
      }
    }

    const PdfDocument = React.createElement(
      Document,
      {
        title: docTitle,
        author: "BuatPakeAI",
        subject: "Product Requirements Document",
        creator: "BuatPakeAI",
        producer: "BuatPakeAI",
      },
      React.createElement(
        Page,
        { size: "A4", style: { padding: 40, fontFamily: "Helvetica" } },
        React.createElement(
          View,
          {
            style: {
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
              borderBottom: "1 solid #E5E7EB",
              paddingBottom: 10,
            },
          },
          React.createElement(
            Text,
            { style: { fontSize: 9, color: "#9CA3AF" } },
            "BuatPakeAI — PRD Generator"
          ),
          React.createElement(
            Text,
            { style: { fontSize: 9, color: "#9CA3AF" } },
            new Date().toLocaleDateString("id-ID")
          )
        ),
        React.createElement(
          Text,
          {
            style: {
            fontSize: 24,
            fontWeight: 700,
            color: "#1E40AF",
            textAlign: "center",
            marginTop: 40,
            marginBottom: 10,
            },
          },
          docTitle
        ),
        React.createElement(
          Text,
          {
            style: {
            fontSize: 14,
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 8,
            fontStyle: "italic",
            },
          },
          "Product Requirements Document"
        ),
        React.createElement(
          Text,
          {
            style: {
            fontSize: 10,
            color: "#9CA3AF",
            textAlign: "center",
            marginBottom: 40,
            },
          },
          `Dibuat dengan BuatPakeAI — ${new Date().toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`
        ),
        React.createElement(View, {
          style: { borderBottom: "1 solid #D1D5DB", marginBottom: 20 },
        }),
        ...pdfContent,
        React.createElement(
          View,
          {
            style: {
            borderTop: "1 solid #E5E7EB",
            marginTop: 30,
            paddingTop: 10,
            },
          },
          React.createElement(
            Text,
            {
              style: {
                fontSize: 8,
                color: "#9CA3AF",
                textAlign: "center",
              },
            },
            "Dokumen ini dibuat secara otomatis oleh BuatPakeAI (buatpakeai.vercel.app)"
          )
        )
      )
    );

    return await ReactPDF.renderToBuffer(PdfDocument);
  } catch (pdfError) {
    console.error("PDF generation error:", pdfError);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const body = await request.json();
    const { format, content, title } = body;

    if (typeof content !== "string" || !content.trim() || typeof format !== "string") {
      return NextResponse.json(
        { error: "Format and content are required" },
        { status: 400 }
      );
    }

    if (content.length > MAX_EXPORT_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: "Isi dokumen terlalu besar untuk diekspor" },
        { status: 413 }
      );
    }

    const docTitle = toSafeDownloadName(typeof title === "string" ? title : "");

    switch (format) {
      case "markdown": {
        return new NextResponse(content, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": `attachment; filename="${docTitle}.md"`,
          },
        });
      }

      case "pdf": {
        const pdfBuffer = await generatePdfBuffer(docTitle, content);

        if (!pdfBuffer) {
          return NextResponse.json(
            {
              error: "Gagal menghasilkan PDF. Library mungkin tidak kompatibel di lingkungan ini.",
            },
            { status: 500 }
          );
        }

        // Konversi ke array biasa untuk kompatibilitas BodyInit
        const pdfArray = Array.from(pdfBuffer);

        return new NextResponse(new Blob([new Uint8Array(pdfArray)], { type: "application/pdf" }), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${docTitle}.pdf"`,
          },
        });
      }

      case "docx": {
        try {
          const buf = await generateDocx(docTitle, content);
          const rawBytes = Array.from(buf);

          return new NextResponse(new Blob([new Uint8Array(rawBytes)], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          }), {
            headers: {
              "Content-Type":
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "Content-Disposition": `attachment; filename="${docTitle}.docx"`,
            },
          });
        } catch (docxError) {
          console.error("DOCX generation error:", docxError);
          return NextResponse.json(
            {
              error: "Gagal menghasilkan DOCX.",
            },
            { status: 500 }
          );
        }
      }

      default:
        return NextResponse.json(
          { error: "Format tidak didukung" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Gagal mengekspor dokumen" },
      { status: 500 }
    );
  }
}
