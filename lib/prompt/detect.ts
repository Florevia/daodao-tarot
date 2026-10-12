import { getCard } from "../cards/index";
import type { ReadingContext } from "../reading-context";
import type { DrawnCard } from "../shuffle";

export type QuestionKind = "crisis" | "third-party" | "will-they-return" | "timing" | "yes-no" | "vague";

const COURT = new Set(["page", "knight", "queen", "king"]);

/** Pairs named in prompts/skills/techniques/combinations.md. Order does not matter. */
export const notablePairs: ReadonlyArray<readonly [string, string]> = [
  ["major-06", "major-15"],
  ["major-13", "major-16"],
  ["major-18", "major-02"],
  ["major-17", "major-18"],
  ["major-17", "major-16"],
  ["major-00", "major-21"],
  ["major-08", "major-15"],
  ["major-12", "major-13"],
  ["swords-03", "cups-05"],
  ["cups-02", "major-06"],
  ["pentacles-05", "cups-05"],
  ["wands-10", "swords-09"],
  ["swords-07", "major-18"],
  ["cups-08", "major-13"],
  ["pentacles-04", "major-15"],
  ["major-07", "major-04"],
  ["swords-10", "major-20"],
  ["cups-10", "pentacles-10"],
];

export function detectQuestionKind(question: string): QuestionKind | null {
  const text = question.trim();
  if (/自杀|自残|不想活|活不下去|结束生命|割腕|伤害自己|kill myself|suicide|self-harm|hurt myself/i.test(text)) {
    return "crisis";
  }
  if (/第三者|小三|出轨|外面还有|外面有人|另一个人|someone else|third person|affair/i.test(text)) return "third-party";
  if (/复合|还会回来|会回来|还会联系|想回来|回头找|come back|will he return|will they return/i.test(text)) {
    return "will-they-return";
  }
  if (/什么时候|何时|多久|哪一天|哪个月|when will|how long|什么时间/.test(text)) return "timing";
  if (/该不该|要不要|是不是|会不会|能不能|是否|yes or no|should i/i.test(text)) return "yes-no";
  if (isVagueQuestion(text)) return "vague";
  return null;
}

/**
 * Only an empty question or a shrug such as “就那样吧”.
 * A longer question that merely contains “说不清” is a real question.
 */
export function isVagueQuestion(question: string): boolean {
  const bare = question.replace(/[。！？!?…~\s"'“”‘’（）()]/g, "");
  if (!bare) return true;
  return /^(?:就那样吧?|就这样吧?|不知道问什么|不知道问|不知道|说不清|说不清楚|没想好|没有写下具体问题|没写下问题|随便看看|随便|嗯+|啊+|无|没有具体问题|nospecificquestion|notsurewhat(?:toask)?|whatever|idk|idontknow)$/i.test(
    bare,
  );
}

export function topicSkill(spreadId: string, context: ReadingContext): string | null {
  if (spreadId === "love" || context.area === "love" || context.theme === "love") return "skills/topics/love.md";
  if (spreadId === "career" || context.area === "career" || context.theme === "work") return "skills/topics/career.md";
  if (context.area === "money") return "skills/topics/money.md";
  if (context.area === "health" || context.theme === "health") return "skills/topics/health.md";
  if (context.area === "people") return "skills/topics/people.md";
  return null;
}

export function elementsRelevant(cards: DrawnCard[]): boolean {
  if (cards.length < 3) return false;
  const suits = new Map<string, number>();
  const ranks = new Map<string, number>();
  let majors = 0;
  for (const drawn of cards) {
    const card = getCard(drawn.cardId);
    if (!card) continue;
    if (card.arcana === "major") majors += 1;
    if (card.suit) suits.set(card.suit, (suits.get(card.suit) ?? 0) + 1);
    if (card.arcana === "minor" && card.rank) ranks.set(card.rank, (ranks.get(card.rank) ?? 0) + 1);
  }
  const maxSuit = Math.max(0, ...suits.values());
  const repeated = [...ranks.values()].some((count) => count >= 2);
  return maxSuit >= 3 || majors >= Math.ceil(cards.length / 2) || repeated;
}

export function relevantTechniques(cards: DrawnCard[]): string[] {
  const skills: string[] = [];
  const reversed = cards.filter((card) => card.reversed).length;
  if (reversed >= 2) skills.push("skills/techniques/reversals.md");
  const courts = cards.some((drawn) => {
    const card = getCard(drawn.cardId);
    return card?.rank ? COURT.has(card.rank) : false;
  });
  if (courts) skills.push("skills/techniques/court-cards.md");
  const ids = new Set(cards.map((card) => card.cardId));
  const combo = notablePairs.some(([left, right]) => ids.has(left) && ids.has(right));
  if (combo) skills.push("skills/techniques/combinations.md");
  if (elementsRelevant(cards)) skills.push("skills/techniques/elements.md");
  skills.push("skills/techniques/imagery.md");
  return skills;
}

const questionFiles: Record<QuestionKind, string | null> = {
  crisis: null,
  "yes-no": "skills/questions/yes-no.md",
  "will-they-return": "skills/questions/will-they-return.md",
  "third-party": "skills/questions/third-party.md",
  timing: "skills/questions/timing.md",
  vague: "skills/questions/vague.md",
};

export function questionSkill(kind: QuestionKind | null): string | null {
  if (!kind) return null;
  return questionFiles[kind];
}

/** A single-card draw overlaps on that card. Longer draws overlap at two shared cards. */
export function drawsOverlap(referenceIds: readonly string[], drawnIds: readonly string[]): boolean {
  const drawn = new Set(drawnIds);
  const shared = new Set(referenceIds.filter((id) => drawn.has(id)));
  if (drawnIds.length <= 1) return shared.size >= 1;
  return shared.size >= 2;
}
