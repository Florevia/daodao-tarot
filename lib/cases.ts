import rawCases from "../data/cases.json";
import { getCard } from "./cards/index";
import { contextLabel, type ReadingContext } from "./reading-context";
import { getSpread } from "./spreads";
import type { Locale } from "./cards/types";

export type CaseCard = {
  positionId: string;
  cardId: string;
  reversed: boolean;
  body: string;
};

export type ReadingCase = {
  id: string;
  title: string;
  titleEn: string;
  question: string;
  spreadId: string;
  context: ReadingContext;
  cards: CaseCard[];
  connection: string;
  conclusion: string;
};

export const readingCases = rawCases as ReadingCase[];

const byId = new Map(readingCases.map((item) => [item.id, item]));

export function getCase(id: string): ReadingCase | undefined {
  return byId.get(id);
}

const PRIMARY_KEYS = ["status", "area", "focus"] as const;
const EXTRA_KEYS = ["mood", "theme"] as const;

export type ExampleQuery = {
  spreadId: string;
  context: ReadingContext;
  cardIds: readonly string[];
};

/** Same spread, then matching status/area/focus, then shared cards, then mood/theme. */
export function exampleRank(item: ReadingCase, query: ExampleQuery): [number, number, number, number] {
  const sameSpread = item.spreadId === query.spreadId ? 1 : 0;
  let contextHits = 0;
  for (const key of PRIMARY_KEYS) {
    const wanted = query.context[key];
    if (wanted && item.context[key] === wanted) contextHits += 1;
  }
  const have = new Set(item.cards.map((card) => card.cardId));
  let overlap = 0;
  for (const id of new Set(query.cardIds)) {
    if (have.has(id)) overlap += 1;
  }
  let extraHits = 0;
  for (const key of EXTRA_KEYS) {
    const wanted = query.context[key];
    if (wanted && item.context[key] === wanted) extraHits += 1;
  }
  return [sameSpread, contextHits, overlap, extraHits];
}

export function selectExampleCases(query: ExampleQuery, limit = 3): ReadingCase[] {
  return [...readingCases]
    .sort((a, b) => {
      const left = exampleRank(a, query);
      const right = exampleRank(b, query);
      for (let index = 0; index < left.length; index += 1) {
        if (left[index] !== right[index]) return right[index] - left[index];
      }
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    })
    .slice(0, limit);
}

export type PromptExample = {
  id: string;
  question: string;
  situation: string;
  cards: { position: string; card: string; orientation: string; reading: string }[];
  connection: string;
  conclusion: string;
};

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, "");
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const end = Math.max(slice.lastIndexOf("。"), slice.lastIndexOf("，"));
  return end >= 16 ? slice.slice(0, end + 1) : slice;
}

export function compactExample(item: ReadingCase): PromptExample {
  const spread = getSpread(item.spreadId);
  return {
    id: item.id,
    question: clip(item.question, 80),
    situation: contextLabel(item.spreadId, item.context, "zh"),
    cards: item.cards.map((drawn) => {
      const card = getCard(drawn.cardId);
      const position = spread?.positions.find((entry) => entry.id === drawn.positionId);
      return {
        position: position?.name.zh ?? drawn.positionId,
        card: card?.name.zh ?? drawn.cardId,
        orientation: drawn.reversed ? "逆位" : "正位",
        reading: clip(drawn.body, 80),
      };
    }),
    connection: clip(item.connection, 140),
    conclusion: clip(item.conclusion, 90),
  };
}

/** Keep two or three examples, dropping the third if the block would get large. */
export function examplesForPrompt(cases: ReadingCase[], maxChars = 3800): PromptExample[] {
  const three = cases.slice(0, 3).map(compactExample);
  if (three.length <= 2 || JSON.stringify(three).length <= maxChars) return three;
  return three.slice(0, 2);
}

export function exampleLabel(locale: Locale): string {
  return locale === "zh"
    ? "风格与深度参照。这些是别的问卜，不是这一次的牌。可以写得一样具体，但不要照抄例子里的牌、处境或句子。"
    : "Style and depth references in Chinese. They are other readings, not this one. Match their specificity, and do not copy their cards, situation, or sentences. Write your answer in English.";
}
