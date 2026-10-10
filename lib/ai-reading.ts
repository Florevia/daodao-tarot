export type AiCardSection = {
  positionId: string;
  body: string;
};

export type AiReading = {
  cards: AiCardSection[];
  connection: string;
  conclusion: string;
};

export type StoredAnswer =
  | { kind: "structured"; reading: AiReading }
  | { kind: "prose"; text: string }
  | { kind: "none" };

type PositionAlias = { id: string; names: string[] };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

/** Accept the position id or its displayed name, so a slightly loose model reply still lands on the right card. */
export function parseAiReading(raw: string, positions: PositionAlias[]): AiReading | null {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let data: unknown;
  try {
    data = JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return null;
  }
  const record = asRecord(data);
  if (!record) return null;
  const connection = typeof record.connection === "string" ? record.connection.trim() : "";
  const conclusion = typeof record.conclusion === "string" ? record.conclusion.trim() : "";
  if (!connection || !conclusion || !Array.isArray(record.cards)) return null;
  const byKey = new Map<string, string>();
  for (const item of record.cards) {
    const card = asRecord(item);
    if (!card || typeof card.body !== "string" || typeof card.positionId !== "string") continue;
    const body = card.body.trim();
    if (!body) continue;
    const token = card.positionId.trim();
    const position = positions.find((entry) => entry.id === token || entry.names.some((name) => name === token));
    if (!position || byKey.has(position.id)) continue;
    byKey.set(position.id, body);
  }
  if (positions.some((position) => !byKey.has(position.id))) return null;
  return {
    cards: positions.map((position) => ({ positionId: position.id, body: byKey.get(position.id) ?? "" })),
    connection,
    conclusion,
  };
}

export function readStoredAnswer(raw: string | null | undefined, positions: PositionAlias[]): StoredAnswer {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return { kind: "none" };
  const structured = parseAiReading(trimmed, positions);
  if (structured) return { kind: "structured", reading: structured };
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return { kind: "none" };
  return { kind: "prose", text: trimmed };
}
