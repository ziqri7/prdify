import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, markdown_content } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID dokumen wajib diisi" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (typeof title === "string") updateData.title = title;
    if (typeof markdown_content === "string") updateData.markdown_content = markdown_content;
    // updated_at di-handle otomatis oleh trigger di database

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data yang diupdate" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("prd_documents")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json(
        { error: "Gagal memperbarui dokumen" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dokumen berhasil diperbarui",
    });
  } catch (error) {
    console.error("Document update error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui dokumen" },
      { status: 500 }
    );
  }
}
