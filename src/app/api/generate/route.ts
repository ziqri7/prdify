import { NextResponse } from "next/server";
import { generatePRD, type PRDAnswers } from "@/lib/prd-generator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const answers = body as PRDAnswers;

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
      if (!answers[field] || (typeof answers[field] === "string" && !answers[field].trim())) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    const result = generatePRD(answers);

    return NextResponse.json({
      success: true,
      data: {
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
