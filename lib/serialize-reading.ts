import type { Reading } from "@prisma/client";
import type { ReadingContext } from "./reading-context";
import { asLocale, type ReadingRecord } from "./reading-record";
import type { DrawnCard } from "./shuffle";

function readContext(raw: string | null | undefined): ReadingContext {
  try {
    const value = JSON.parse(raw || "{}") as ReadingContext;
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

export function serializeReading(reading: Reading): ReadingRecord {
  const cards = JSON.parse(reading.cardsJson) as DrawnCard[];
  return {
    id: reading.id,
    question: reading.question,
    spreadId: reading.spreadId,
    locale: asLocale(reading.locale),
    cards,
    summary: reading.summary,
    context: readContext(reading.contextJson),
    aiInterpretation: reading.aiInterpretation,
    createdAt: reading.createdAt.toISOString(),
  };
}
