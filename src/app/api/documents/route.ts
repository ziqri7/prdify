import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/server-auth";

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, markdown_content } = body;

    if (typeof id !== "string" || !id) {
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

    // Always scope the read to the authenticated owner. The admin client
    // bypasses RLS, therefore ownership must be enforced explicitly here.
    const { data: document, error: lookupError } = await supabaseAdmin
      .from("prd_documents")
      .select("id, package_type, is_paid")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (lookupError) {
      console.error("Document lookup error:", lookupError);
      return NextResponse.json({ error: "Gagal memperbarui dokumen" }, { status: 500 });
    }

    // The edit page is a paid Pro feature. Do not rely on its client-side
    // visibility check, since this API can also be called directly.
    if (!document) {
      return NextResponse.json({ error: "PRD tidak ditemukan" }, { status: 404 });
    }

    if (!document.is_paid || document.package_type !== "pro") {
      return NextResponse.json(
        { error: "Edit PRD hanya tersedia untuk paket Pro yang sudah dibayar" },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from("prd_documents")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id);

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
