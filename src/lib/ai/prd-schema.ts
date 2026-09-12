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
  if (!title || !candidate.sections || typeof candidate.sections !== "object") return null;

  // Providers usually preserve the requested order, but ordering is a
  // presentation concern. Accept a complete, unique set and render it in the
  // stable application order below. Missing, duplicated, or unknown section
  // identifiers still make the response invalid.
  const sectionsById = new Map<string, unknown>();
  if (Array.isArray(candidate.sections)) {
    if (candidate.sections.length !== PRD_SECTION_DEFINITIONS.length) return null;

    for (const section of candidate.sections) {
      if (!section || typeof section !== "object" || Array.isArray(section)) return null;
      const item = section as { id?: unknown };
      if (typeof item.id !== "string" || sectionsById.has(item.id)) return null;
      sectionsById.set(item.id, section);
    }
  } else {
    const entries = Object.entries(candidate.sections);
    if (entries.length !== PRD_SECTION_DEFINITIONS.length) return null;

    for (const [id, section] of entries) {
      if (sectionsById.has(id)) return null;
      // A few OpenAI-compatible providers represent the requested collection
      // as { section_id: "content" }. Treat it as the equivalent structured
      // item, while preserving the same exact ID and non-empty-content checks.
      sectionsById.set(id, typeof section === "string" ? { content: section } : section);
    }
  }

  const sections: AISection[] = [];
  for (const definition of PRD_SECTION_DEFINITIONS) {
    const section = sectionsById.get(definition.id);
    if (!section) return null;

    const item = section as { content?: unknown };

    const content = normaliseText(item.content, 9000);
    if (!content) return null;
    sections.push({ id: definition.id, content });
  }

  return { title, sections };
}
