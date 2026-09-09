import { NextResponse } from "next/server";
import { generateAIEnhancedPRD, type PRDAnswers } from "@/lib/prd-generator";
import { AIProviderError } from "@/lib/ai/deepinfra";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/server-auth";
import {
  releaseGenerationReservation,
  reserveGenerationAccess,
} from "@/lib/subscriptions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers) {
      return NextResponse.json(
        { error: "Jawaban kuesioner wajib diisi" },
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

    // The database, not a client-controlled package value, decides whether
    // this user has an active subscription or one prepaid credit to spend.
    // The reservation is released in the catch block unless document insert
    // atomically finalizes it through the database trigger.
    const entitlement = await reserveGenerationAccess(user.id);
    if (!entitlement) {
      return NextResponse.json(
        { error: "Kamu memerlukan paket aktif atau 1 kredit Pay Per Use untuk membuat PRD dengan AI" },
        { status: 402 }
      );
    }

    try {
      const result = await generateAIEnhancedPRD(
        answers as PRDAnswers,
        entitlement.planId
      );

      // The database trigger finalizes the reservation only if this insert
      // succeeds, so a failed insert cannot consume a credit or quota.
      const { data: document, error: dbError } = await supabaseAdmin
        .from("prd_documents")
        .insert({
          user_id: user.id,
          title: result.title,
          package_type: entitlement.packageType,
          answers: answers,
          markdown_content: result.fullMarkdown,
          status: "active",
          is_paid: true,
          generation_reservation_id: entitlement.reservationId,
        })
        .select("id")
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Gagal menyimpan PRD ke database");
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
      try {
        await releaseGenerationReservation(entitlement.reservationId, user.id);
      } catch (releaseError) {
        console.error("Reservation release error:", releaseError);
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof AIProviderError) {
      return NextResponse.json({ error: error.publicMessage }, { status: error.status });
    }
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Gagal menghasilkan PRD" },
      { status: 500 }
    );
  }
}
