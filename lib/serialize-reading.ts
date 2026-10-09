import type { Reading } from "@prisma/client";
import { asLocale, type ReadingRecord } from "./reading-record";
import type { DrawnCard } from "./shuffle";

export function serializeReading(reading: Reading): ReadingRecord {
  const cards = JSON.parse(reading.cardsJson) as DrawnCard[];
  return {
    id: reading.id,
    question: reading.question,
    spreadId: reading.spreadId,
    locale: asLocale(reading.locale),
    cards,
    summary: reading.summary,
    aiInterpretation: reading.aiInterpretation,
    createdAt: reading.createdAt.toISOString(),
  };
}
