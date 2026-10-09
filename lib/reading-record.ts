import { getCard, type Locale } from "./cards";
import { getSpread } from "./spreads";
import type { DrawnCard } from "./shuffle";

export type ReadingRecord = {
  id: string;
  question: string;
  spreadId: string;
  locale: Locale;
  cards: DrawnCard[];
  summary: string;
  aiInterpretation: string | null;
  createdAt: string;
};

export function validateDrawnCards(spreadId: string, drawn: DrawnCard[]): boolean {
  const spread = getSpread(spreadId);
  if (!spread || drawn.length !== spread.positions.length) return false;
  const seen = new Set<string>();
  for (const position of spread.positions) {
    const match = drawn.find((card) => card.positionId === position.id);
    if (!match || seen.has(match.positionId) || !getCard(match.cardId)) return false;
    seen.add(match.positionId);
  }
  return seen.size === spread.positions.length;
}

export function asLocale(value: string): Locale {
  return value === "en" ? "en" : "zh";
}
