import { cardImagery } from "../cards/imagery";
import { getCard, type Locale } from "../cards/index";
import type { AiReading } from "../ai-reading";
import { exampleLabel, examplesForPrompt, selectExampleCases, type PromptExample, type ReadingCase } from "../cases";
import { contextLabel, contextTopic, type ReadingContext } from "../reading-context";
import type { Spread } from "../spreads";
import type { DrawnCard } from "../shuffle";
import { orientation, positionMeaning, readingLines, synthesisSignals } from "../summary";
import { goldReadings, promptFiles, type BundledGold } from "./bundle.generated";
import { detectQuestionKind, questionSkill, relevantTechniques, topicSkill, type QuestionKind } from "./detect";

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
    signals: string;
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
      inPosition: string;
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

export function selectGoldReadings(spreadId: string, context: ReadingContext, limit = 2): GoldReading[] {
  return [...goldReadings]
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
    topicSkill(spread.id, context),
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
  sections.push("examples 与 gold 只是语气和深度的参照，不是这一次的牌。不要照抄其中的牌、处境或句子。知识库文字在 cards 里，牌义以那里为准。");

  const topic = contextTopic(spread.id, context);
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
      inPosition: positionMeaning(line, locale, spread.id, context),
      advice: line.card.topics[orient].advice[locale],
      imagery: cardImagery[line.card.id] ?? line.card.description.zh,
    };
  });

  let gold = selectGoldReadings(spread.id, context, input.goldLimit ?? 2).map(goldForPrompt);
  let examples = examplesForPrompt(
    selectExampleCases(
      { spreadId: spread.id, context, cardIds: cards.map((card) => card.cardId) },
      input.caseLimit ?? 2,
    ),
    2400,
  ).slice(0, input.caseLimit ?? 2);

  const buildUser = () => ({
    question,
    spread: spread.name[locale],
    situation: contextLabel(spread.id, context, locale),
    signals: synthesisSignals(spread.id, cards, locale),
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

export function selfReviewPrompt(draft: AiReading, locale: Locale): { system: string; user: { draft: AiReading; writeIn: string } } {
  return {
    system: `${file("self-review.md")}\n\n只返回修改后的 JSON。positionId 保持不变。`,
    user: {
      draft,
      writeIn: locale === "en" ? "English" : "简体中文",
    },
  };
}

export function selfReviewEnabled(): boolean {
  return process.env.GEMINI_SELF_REVIEW === "1";
}

export function nearestCases(spreadId: string, context: ReadingContext, cards: DrawnCard[], limit = 2): ReadingCase[] {
  return selectExampleCases(
    { spreadId, context, cardIds: cards.map((card) => card.cardId) },
    limit,
  );
}
