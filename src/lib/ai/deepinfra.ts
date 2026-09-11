import "server-only";

import { buildPRDMessages } from "./prd-prompt";
import { parseAIPrdDocument, type AIPrdDocument } from "./prd-schema";
import type { PRDAnswers } from "@/lib/prd-generator";
import type { PackageId } from "@/lib/constants";

const DEEPINFRA_URL = "https://api.deepinfra.com/v1/openai/chat/completions";
const DEFAULT_MODEL = "deepseek-ai/DeepSeek-V4-Flash-0731";
const DEFAULT_PRO_MODEL = "openai/gpt-oss-120b";

export class AIProviderError extends Error {
  constructor(
    public readonly status: number,
    public readonly publicMessage: string
  ) {
    super(publicMessage);
    this.name = "AIProviderError";
  }
}

function getTimeoutMs(): number {
  const configured = Number.parseInt(process.env.DEEPINFRA_TIMEOUT_MS ?? "60000", 10);
  if (!Number.isFinite(configured)) return 60000;
  return Math.min(Math.max(configured, 10000), 90000);
}

/**
 * Model selection belongs exclusively on the server. Pay Per Use follows the
 * Starter tier so a client can never request the higher-cost Pro model.
 */
function getModelForPlan(planId: PackageId): string {
  if (planId === "pro" || planId === "pro_tahunan") {
    return process.env.DEEPINFRA_PRO_MODEL?.trim() || DEFAULT_PRO_MODEL;
  }

  return process.env.DEEPINFRA_STARTER_MODEL?.trim()
    || process.env.DEEPINFRA_MODEL?.trim()
    || DEFAULT_MODEL;
}

function parseJsonCompletion(content: string): unknown | null {
  const candidates = [content.trim()];
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.push(fenced[1].trim());

  // Some compatible OpenAI endpoints prepend a short explanation before the
  // requested JSON. Parse only the outermost object; schema validation below
  // still rejects anything that is not a valid PRD contract.
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start >= 0 && end > start) candidates.push(content.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next safe representation.
    }
  }

  return null;
}

function describePrdShape(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { topLevel: Array.isArray(value) ? "array" : typeof value };
  }

  const candidate = value as { title?: unknown; sections?: unknown };
  return {
    titleType: typeof candidate.title,
    sectionCount: Array.isArray(candidate.sections) ? candidate.sections.length : null,
    sectionIds: Array.isArray(candidate.sections)
      ? candidate.sections.map((section) => (
        section && typeof section === "object" && !Array.isArray(section)
          ? (section as { id?: unknown }).id ?? null
          : null
      ))
      : null,
  };
}

export async function createAIPrd(
  answers: PRDAnswers,
  planId: PackageId
): Promise<AIPrdDocument> {
  const apiKey = process.env.DEEPINFRA_API_KEY?.trim();
  if (!apiKey) {
    throw new AIProviderError(
      503,
      "Generator AI belum dikonfigurasi. Silakan hubungi admin."
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const response = await fetch(DEEPINFRA_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getModelForPlan(planId),
        messages: buildPRDMessages(answers),
        temperature: 0.35,
        // The contract asks for 11 actionable sections (roughly 1,500–1,900
        // Indonesian words). 3,000 tokens can truncate JSON before its final
        // closing brace, which looks like an invalid provider response and
        // needlessly retries a paid generation. Keep enough headroom for the
        // complete structured document; model selection still limits cost by
        // plan on the server.
        max_tokens: 6000,
        // The PRD contract already supplies the required planning structure.
        // Disabling the provider's hidden reasoning trace keeps each paid
        // generation faster and avoids paying for reasoning tokens users never see.
        reasoning_effort: "none",
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new AIProviderError(429, "Generator AI sedang sibuk. Silakan coba lagi sebentar.");
      }
      console.error("DeepInfra request failed", { status: response.status });
      throw new AIProviderError(502, "Generator AI tidak dapat dihubungi. Silakan coba lagi.");
    }

    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      console.error("DeepInfra returned an empty completion");
      throw new AIProviderError(502, "Generator AI mengembalikan respons kosong. Silakan coba lagi.");
    }

    const decoded = parseJsonCompletion(content);
    if (decoded === null) {
      console.error("DeepInfra returned invalid JSON");
      throw new AIProviderError(502, "Generator AI mengembalikan format yang tidak valid. Silakan coba lagi.");
    }

    const prd = parseAIPrdDocument(decoded);
    if (!prd) {
      // Record contract metadata only. Never log model content or user answers.
      console.error("DeepInfra returned a PRD outside the required schema", describePrdShape(decoded));
      throw new AIProviderError(502, "Generator AI mengembalikan format PRD yang tidak lengkap. Silakan coba lagi.");
    }

    return prd;
  } catch (error) {
    if (error instanceof AIProviderError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AIProviderError(504, "Generator AI membutuhkan waktu terlalu lama. Silakan coba lagi.");
    }
    console.error("DeepInfra request error", error instanceof Error ? error.name : "unknown");
    throw new AIProviderError(502, "Generator AI tidak dapat dihubungi. Silakan coba lagi.");
  } finally {
    clearTimeout(timeout);
  }
}
