import { requireCard, type Locale } from "./cards";
import { contextLabel, contextTopic, type ReadingContext } from "./reading-context";
import type { Spread } from "./spreads";
import type { DrawnCard } from "./shuffle";
import { orientation } from "./summary";

/** Fast Chinese-capable flash model. Override with GEMINI_MODEL. */
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Multi-card readings were exceeding the old 30s abort. 90s stays under
 * Vercel's 300s hobby limit; the route's maxDuration is a bit higher so the
 * platform does not cut the function off first.
 */
export const GEMINI_TIMEOUT_MS = 90_000;

export type GeminiFailReason = "timeout" | "upstream" | "empty";

export type GeminiFailure = { error: "AI_FAILED"; reason: GeminiFailReason };

export type GeminiSuccess = { interpretation: string };

type GeminiPart = {
  text?: unknown;
  thought?: boolean;
  thoughtSignature?: string;
};

type GeminiPayload = {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
};

export function geminiApiKey(): string {
  return (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
}

export function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

/**
 * generateContent on Gemini 2.5 rejects thinkingLevel. thinkingBudget 0 turns
 * thinking off so a six-card reading does not sit in thought tokens. Gemini 3
 * still uses thinkingLevel; "low" is the fastest level those models accept.
 */
export function thinkingConfigFor(model: string): { thinkingBudget: number } | { thinkingLevel: "low" } {
  if (model.includes("gemini-2.5") || model.includes("gemini-2.0")) return { thinkingBudget: 0 };
  return { thinkingLevel: "low" };
}

/** Keep answer text. Drop thoughtSignature-only parts, which have no `text`. */
export function candidateText(parts: GeminiPart[] | undefined): string {
  if (!parts) return "";
  return parts
    .filter((part) => typeof part.text === "string" && part.text.length > 0 && part.thought !== true)
    .map((part) => part.text as string)
    .join("")
    .trim();
}

export function isGeminiTimeout(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("name" in error)) return false;
  return error.name === "TimeoutError" || error.name === "AbortError";
}

type CardBrief = {
  position: string;
  place: string;
  card: string;
  orientation: string;
  keywords: string;
  meaning: string;
};

export function geminiReadingBody(input: {
  question: string;
  spread: Spread;
  locale: Locale;
  context: ReadingContext;
  cards: DrawnCard[];
}): { system: string; user: { question: string; spread: string; situation: string; cards: CardBrief[] } } {
  const { question, spread, locale, context, cards } = input;
  const topic = contextTopic(spread.id, context);
  const situation = contextLabel(spread.id, context, locale);
  const briefs: CardBrief[] = cards.map((drawn) => {
    const card = requireCard(drawn.cardId);
    const position = spread.positions.find((item) => item.id === drawn.positionId);
    const orient = drawn.reversed ? "reversed" : "upright";
    return {
      position: position?.name[locale] ?? drawn.positionId,
      place: position?.description[locale] ?? "",
      card: card.name[locale],
      orientation: orientation(drawn.reversed, locale),
      keywords: card.keywords[locale].join(locale === "zh" ? "、" : ", "),
      meaning: card.topics[orient][topic][locale],
    };
  });
  const system =
    locale === "zh"
      ? "你是叨叨占卜师，温和、具体、不吓唬人。用简体中文写 3 到 5 段。结合提问、处境，以及每张牌的名称、正逆位和位置，把牌义说成对这个人有用的话。处境优先：已婚或同居不要写成要不要开始约会，求职中不要写成已经坐在那份工作里，学生不要写成公司升职流程。不要断言医疗、法律、财务或绝对的未来，不要发明没有的牌。结尾一句提醒这只是娱乐与自我反思。"
      : "You are Daodao, a warm and specific tarot reader. Write 3 to 5 paragraphs in English from the question, the situation, and each card's name, orientation, and position. Let the situation override a generic reading: do not tell a married person to start dating, do not treat a job seeker as someone already in the role, and do not give a student a corporate promotion process. Do not claim medical, legal, financial, or absolute future facts. Do not invent cards. Close with one sentence that this is entertainment and reflection.";
  return {
    system,
    user: {
      question,
      spread: spread.name[locale],
      situation,
      cards: briefs,
    },
  };
}

export async function requestGeminiInterpretation(input: {
  apiKey: string;
  model: string;
  system: string;
  user: unknown;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<GeminiSuccess | GeminiFailure> {
  const timeoutMs = input.timeoutMs ?? GEMINI_TIMEOUT_MS;
  const fetchImpl = input.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": input.apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: input.system }] },
          contents: [{ role: "user", parts: [{ text: JSON.stringify(input.user) }] }],
          generationConfig: {
            temperature: 0.8,
            thinkingConfig: thinkingConfigFor(input.model),
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      return { error: "AI_FAILED", reason: "upstream" };
    }
    const payload = (await response.json()) as GeminiPayload;
    const text = candidateText(payload.candidates?.[0]?.content?.parts);
    if (!text) return { error: "AI_FAILED", reason: "empty" };
    return { interpretation: text };
  } catch (error) {
    return { error: "AI_FAILED", reason: isGeminiTimeout(error) ? "timeout" : "upstream" };
  }
}
