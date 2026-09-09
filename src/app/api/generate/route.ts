import { NextResponse } from "next/server";
import { generatePRD, type PRDAnswers } from "@/lib/prd-generator";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getDbPackageType } from "@/lib/constants";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { consumeSubscriptionQuota } from "@/lib/subscriptions";

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

    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
    }

    // Generate PRD
    const result = generatePRD(answers as PRDAnswers);
    const dbPackageType = getDbPackageType(packageType);
    // A paid subscription grants immediate access and consumes one quota only
    // when a document is actually generated. First-time subscribers can still
    // preview a draft and activate their plan at checkout.
    const subscription = packageType === "pay_per_use"
      ? null
      : await consumeSubscriptionQuota(user.id);

    // Save to Supabase
    const { data: document, error: dbError } = await supabaseAdmin
      .from("prd_documents")
      .insert({
        user_id: user.id,
        title: result.title,
        package_type: subscription?.packageType || dbPackageType,
        answers: answers,
        markdown_content: result.fullMarkdown,
        status: "active",
        is_paid: Boolean(subscription),
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
