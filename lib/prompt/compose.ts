import { cardImagery } from "../cards/imagery";
import { getCard, type Locale } from "../cards/index";
import type { AiReading } from "../ai-reading";
import { exampleLabel, examplesForPrompt, selectExampleCases, type PromptExample, type ReadingCase } from "../cases";
import { contextLabel, contextTopic, type ReadingContext } from "../reading-context";
import type { Spread } from "../spreads";
import type { DrawnCard } from "../shuffle";
import { orientation, readingLines } from "../summary";
import { goldReadings, promptFiles, type BundledGold } from "./bundle.generated";
import { detectQuestionKind, drawsOverlap, questionSkill, relevantTechniques, topicSkill, type QuestionKind } from "./detect";

const ALWAYS = ["persona.md", "method.md", "style-guide.md", "safety.md"] as const;

const spreadFile: Record<string, string> = {
  single: "skills/spreads/single.md",
  three: "skills/spreads/three.md",
  love: "skills/spreads/love.md",
  career: "skills/spreads/career.md",
  celtic: "skills/spreads/celtic.md",
};

export type GoldReading = BundledGold;

export type ComposedPrompt = {
  system: string;
  user: {
    question: string;
    spread: string;
    situation: string;
    signals: {
      cards: number;
      majors: number;
      minors: number;
      reversed: number;
      suits: Record<string, number>;
      repeatedRanks: string[];
    };
    questionKind: QuestionKind | null;
    crisis: boolean;
    cards: {
      positionId: string;
      position: string;
      place: string;
      card: string;
      orientation: string;
      keywords: string;
      topicMeaning: string;
      advice: string;
      imagery: string;
    }[];
    gold: {
      id: string;
      question: string;
      situation: string;
      overview: string;
      cards: { position: string; card: string; orientation: string; reading: string }[];
      connection: string;
      conclusion: string;
    }[];
    examples: { label: string; items: PromptExample[] };
  };
  skills: string[];
};

function file(path: string): string {
  const text = promptFiles[path];
  if (!text) throw new Error(`Missing prompt file: ${path}`);
  return text.trim();
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, "");
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max);
  const end = Math.max(slice.lastIndexOf("。"), slice.lastIndexOf("，"));
  return end >= 24 ? slice.slice(0, end + 1) : slice;
}

export function selectGoldReadings(
  spreadId: string,
  context: ReadingContext,
  limit = 2,
  drawn: DrawnCard[] = [],
): GoldReading[] {
  const drawnIds = drawn.map((card) => card.cardId);
  return [...goldReadings]
    .filter((item) => drawnIds.length === 0 || !drawsOverlap(item.cards.map((card) => card.cardId), drawnIds))
    .sort((a, b) => {
      const score = (item: GoldReading) => {
        const same = item.spreadId === spreadId ? 2 : 0;
        const area = context.area && item.context.area === context.area ? 1 : 0;
        const status = context.status && item.context.status === context.status ? 1 : 0;
        const theme = context.theme && item.context.theme === context.theme ? 1 : 0;
        return same + area + status + theme;
      };
      const delta = score(b) - score(a);
      return delta === 0 ? a.id.localeCompare(b.id) : delta;
    })
    .slice(0, limit);
}

function goldForPrompt(item: GoldReading) {
  return {
    id: item.id,
    question: clip(item.question, 80),
    situation: contextLabel(item.spreadId, item.context, "zh"),
    overview: clip(item.overview, 120),
    cards: item.cards.map((drawn) => {
      const card = getCard(drawn.cardId);
      return {
        position: drawn.positionId,
        card: card?.name.zh ?? drawn.cardId,
        orientation: drawn.reversed ? "逆位" : "正位",
        reading: clip(drawn.body, 110),
      };
    }),
    connection: clip(item.connection, 220),
    conclusion: clip(item.conclusion, 120),
  };
}

export function composeReadingPrompt(input: {
  question: string;
  spread: Spread;
  locale: Locale;
  context: ReadingContext;
  cards: DrawnCard[];
  goldLimit?: number;
  caseLimit?: number;
}): ComposedPrompt {
  const { question, spread, locale, context, cards } = input;
  const kind = detectQuestionKind(question);
  const skills = [
    spreadFile[spread.id],
    kind === "vague" ? null : topicSkill(spread.id, context),
    ...relevantTechniques(cards),
    questionSkill(kind),
  ].filter((item): item is string => Boolean(item));

  const sections = [...ALWAYS.map((path) => file(path)), ...skills.map((path) => file(path))];
  if (locale === "en") {
    sections.push(
      "问卜者使用英文界面。overview、每张牌的 body、connection、conclusion 都用英文写。上面的技能是中文，按其中的方法写，不要翻译腔，不要中英夹杂。",
    );
  }
  if (kind === "crisis") {
    sections.push("本次问题含有危机语言。不要解牌。按安全文档把 JSON 填成支持，不要分析牌面。");
  }
  sections.push(
    "examples 与 gold 只是语气和深度的参照，不是这一次的牌。不要照抄其中的牌、处境或句子。问题和处境没有提到的主题，不要从参照里借过来。知识库文字在 cards 里，牌义以那里为准。signals 是计数，不要写进正文。",
  );

  const topic = kind === "vague" ? "general" : contextTopic(spread.id, context);
  const lines = readingLines(spread, cards);
  const briefs = lines.map((line) => {
    const orient = line.reversed ? "reversed" : "upright";
    return {
      positionId: line.position.id,
      position: line.position.name[locale],
      place: line.position.description[locale],
      card: line.card.name[locale],
      orientation: orientation(line.reversed, locale),
      keywords: line.card.keywords[locale].join(locale === "zh" ? "、" : ", "),
      topicMeaning: line.card.topics[orient][topic][locale],
      advice: line.card.topics[orient].advice[locale],
      imagery: cardImagery[line.card.id] ?? line.card.description.zh,
    };
  });

  const drawnIds = cards.map((card) => card.cardId);
  const caseLimit = input.caseLimit ?? 2;
  let gold = selectGoldReadings(spread.id, context, input.goldLimit ?? 2, cards).map(goldForPrompt);
  let examples = examplesForPrompt(
    selectExampleCases({ spreadId: spread.id, context, cardIds: drawnIds }, 24).filter(
      (item) => !drawsOverlap(item.cards.map((card) => card.cardId), drawnIds),
    ),
    2400,
  ).slice(0, caseLimit);

  const buildUser = () => ({
    question,
    spread: spread.name[locale],
    situation: contextLabel(spread.id, context, locale),
    signals: signalCounts(cards),
    questionKind: kind,
    crisis: kind === "crisis",
    cards: briefs,
    gold,
    examples: { label: exampleLabel(locale), items: examples },
  });

  let user = buildUser();
  const system = sections.join("\n\n");
  if (system.length + JSON.stringify(user).length > 28000) {
    gold = gold.slice(0, 1);
    examples = examples.slice(0, 1);
    user = buildUser();
  }

  return { system, user, skills };
}

export function promptChars(system: string, user: unknown): number {
  return system.length + JSON.stringify(user).length;
}

export type SelfReviewContext = {
  question: string;
  situation: string;
  spread: string;
  positions: { id: string; name: string; asks: string }[];
  cards: {
    positionId: string;
    card: string;
    orientation: string;
    keywords: string;
    meaning: string;
  }[];
  crisis: boolean;
};

export function reviewContextFrom(composed: ComposedPrompt, spread: Spread, locale: Locale): SelfReviewContext {
  return {
    question: composed.user.question,
    situation: composed.user.situation,
    spread: composed.user.spread,
    crisis: composed.user.crisis,
    positions: spread.positions.map((position) => ({
      id: position.id,
      name: position.name[locale],
      asks: position.description[locale],
    })),
    cards: composed.user.cards.map((card) => ({
      positionId: card.positionId,
      card: card.card,
      orientation: card.orientation,
      keywords: card.keywords,
      meaning: card.topicMeaning,
    })),
  };
}

export function selfReviewPrompt(
  draft: AiReading,
  locale: Locale,
  context: SelfReviewContext,
): { system: string; user: SelfReviewContext & { draft: AiReading; writeIn: string } } {
  return {
    system: `${file("self-review.md")}\n\n只返回修改后的 JSON。positionId 保持不变。用下面给出的问题、处境、牌位、牌与知识库牌义对照草稿。crisis 为 true 时，草稿里任何牌义都要删掉，改成带 12356 和 110 或 120 的支持。`,
    user: {
      draft,
      writeIn: locale === "en" ? "English" : "简体中文",
      ...context,
    },
  };
}

function signalCounts(cards: DrawnCard[]): ComposedPrompt["user"]["signals"] {
  const suits: Record<string, number> = {};
  const ranks = new Map<string, number>();
  let majors = 0;
  let reversed = 0;
  for (const drawn of cards) {
    if (drawn.reversed) reversed += 1;
    const card = getCard(drawn.cardId);
    if (!card) continue;
    if (card.arcana === "major") majors += 1;
    else if (card.suit) suits[card.suit] = (suits[card.suit] ?? 0) + 1;
    if (card.arcana === "minor" && card.rank) ranks.set(card.rank, (ranks.get(card.rank) ?? 0) + 1);
  }
  return {
    cards: cards.length,
    majors,
    minors: cards.length - majors,
    reversed,
    suits,
    repeatedRanks: [...ranks.entries()].filter(([, count]) => count >= 2).map(([rank]) => rank),
  };
}

export function selfReviewEnabled(): boolean {
  return process.env.GEMINI_SELF_REVIEW === "1";
}

export function nearestCases(spreadId: string, context: ReadingContext, cards: DrawnCard[], limit = 2): ReadingCase[] {
  const drawnIds = cards.map((card) => card.cardId);
  return selectExampleCases({ spreadId, context, cardIds: drawnIds }, 24)
    .filter((item) => !drawsOverlap(item.cards.map((card) => card.cardId), drawnIds))
    .slice(0, limit);
}
