export const PRD_SECTION_DEFINITIONS = [
  { id: "executive_summary", title: "1. Ringkasan Eksekutif" },
  { id: "target_users", title: "2. Target Pengguna" },
  { id: "problem_solution", title: "3. Masalah & Solusi" },
  { id: "mvp_features", title: "4. Fitur Utama" },
  { id: "competitor_analysis", title: "5. Analisis Kompetitor" },
  { id: "information_architecture", title: "6. Struktur Halaman / Navigasi" },
  { id: "user_flow", title: "7. Alur Pengguna (User Flow)" },
  { id: "technical_requirements", title: "8. Kebutuhan Teknis" },
  { id: "delivery_plan", title: "9. Timeline & Budget" },
  { id: "team_contact", title: "10. Informasi Tim & Kontak" },
  { id: "additional_notes", title: "11. Catatan Tambahan" },
] as const;

export type AISectionId = (typeof PRD_SECTION_DEFINITIONS)[number]["id"];

export interface AISection {
  id: AISectionId;
  content: string;
}

export interface AIPrdDocument {
  title: string;
  sections: AISection[];
}

function normaliseText(value: unknown, maximumLength: number): string | null {
  if (typeof value !== "string") return null;

  const text = value
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();

  return text.length > 0 && text.length <= maximumLength ? text : null;
}

/**
 * Treat model output as untrusted input. This lets the renderer retain stable
 * headings and prevents a partial or malformed provider response being saved
 * as a paid PRD.
 */
export function parseAIPrdDocument(value: unknown): AIPrdDocument | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const candidate = value as { title?: unknown; sections?: unknown };
  const title = normaliseText(candidate.title, 180);
  if (!title || !Array.isArray(candidate.sections)) return null;
  if (candidate.sections.length !== PRD_SECTION_DEFINITIONS.length) return null;

  const sections: AISection[] = [];
  for (let index = 0; index < PRD_SECTION_DEFINITIONS.length; index += 1) {
    const definition = PRD_SECTION_DEFINITIONS[index];
    const section = candidate.sections[index];
    if (!section || typeof section !== "object" || Array.isArray(section)) return null;

    const item = section as { id?: unknown; content?: unknown };
    if (item.id !== definition.id) return null;

    const content = normaliseText(item.content, 9000);
    if (!content) return null;
    sections.push({ id: definition.id, content });
  }

  return { title, sections };
}
