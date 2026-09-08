import { NextResponse } from "next/server";
import { generatePRD, type PRDAnswers } from "@/lib/prd-generator";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getDbPackageType } from "@/lib/constants";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers, packageType } = body;

    if (!answers || !packageType) {
      return NextResponse.json(
        { error: "Answers dan packageType wajib diisi" },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields: (keyof PRDAnswers)[] = [
      "product_name",
      "description",
      "target_users",
      "problem",
      "features",
      "platform",
      "auth",
      "competitors",
      "differentiator",
      "pages",
      "admin_dashboard",
      "user_flow",
      "timeline",
      "budget",
      "multilingual",
      "notifications",
      "dark_mode",
    ];

    for (const field of requiredFields) {
      if (
        !answers[field] ||
        (typeof answers[field] === "string" && !answers[field].trim())
      ) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Get user if logged in
    let userId: string | null = null;
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {},
          },
        }
      );
      const { data: userData } = await supabase.auth.getUser();
      userId = userData?.user?.id || null;
    } catch {
      // User not logged in — that's OK
    }

    // Generate PRD
    const result = generatePRD(answers as PRDAnswers);
    const dbPackageType = getDbPackageType(packageType);

    // Save to Supabase
    const { data: document, error: dbError } = await supabaseAdmin
      .from("prd_documents")
      .insert({
        user_id: userId,
        title: result.title,
        package_type: dbPackageType,
        answers: answers,
        markdown_content: result.fullMarkdown,
        status: "active",
        is_paid: false,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Gagal menyimpan PRD ke database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: document.id,
        title: result.title,
        date: result.date,
        markdown: result.fullMarkdown,
        sections: result.sections,
      },
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Gagal menghasilkan PRD" },
      { status: 500 }
    );
  }
}
