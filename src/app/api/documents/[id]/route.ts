import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/server-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Autentikasi diperlukan" }, { status: 401 });
    }

    const { data: document, error } = await supabaseAdmin
      .from("prd_documents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !document) {
      return NextResponse.json(
        { error: "PRD tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Document fetch error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil dokumen" },
      { status: 500 }
    );
  }
}
