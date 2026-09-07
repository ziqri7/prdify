import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { format, content, title } = body;

    if (!format || !content) {
      return NextResponse.json(
        { error: "Format and content are required" },
        { status: 400 }
      );
    }

    switch (format) {
      case "markdown": {
        return new NextResponse(content, {
          headers: {
            "Content-Type": "text/markdown",
            "Content-Disposition": `attachment; filename="${title || "PRDify-PRD"}.md"`,
          },
        });
      }

      case "pdf": {
        // In production, generate PDF using @react-pdf/renderer or Puppeteer
        // For now, return markdown as placeholder
        return new NextResponse(content, {
          headers: {
            "Content-Type": "text/markdown",
            "Content-Disposition": `attachment; filename="${title || "PRDify-PRD"}.md"`,
          },
        });
      }

      case "docx": {
        // In production, generate DOCX using docx.js or html-to-docx
        // For now, return markdown as placeholder
        return new NextResponse(content, {
          headers: {
            "Content-Type": "text/markdown",
            "Content-Disposition": `attachment; filename="${title || "PRDify-PRD"}.md"`,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: "Unsupported format" },
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
