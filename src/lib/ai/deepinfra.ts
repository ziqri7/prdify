import "server-only";

import { buildPRDMessages } from "./prd-prompt";
import { parseAIPrdDocument, type AIPrdDocument } from "./prd-schema";
import type { PRDAnswers } from "@/lib/prd-generator";

const DEEPINFRA_URL = "https://api.deepinfra.com/v1/openai/chat/completions";
const DEFAULT_MODEL = "deepseek-ai/DeepSeek-V4-Flash-0731";

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

export async function createAIPrd(answers: PRDAnswers): Promise<AIPrdDocument> {
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
        model: process.env.DEEPINFRA_MODEL?.trim() || DEFAULT_MODEL,
        messages: buildPRDMessages(answers),
        temperature: 0.35,
        max_tokens: 3000,
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

    let decoded: unknown;
    try {
      decoded = JSON.parse(content);
    } catch {
      console.error("DeepInfra returned invalid JSON");
      throw new AIProviderError(502, "Generator AI mengembalikan format yang tidak valid. Silakan coba lagi.");
    }

    const prd = parseAIPrdDocument(decoded);
    if (!prd) {
      console.error("DeepInfra returned a PRD outside the required schema");
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
