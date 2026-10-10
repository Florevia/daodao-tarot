import { parseAiReading, type AiReading } from "./ai-reading";
import type { Locale } from "./cards";
import { contextLabel, contextTopic, type ReadingContext } from "./reading-context";
import type { Spread } from "./spreads";
import type { DrawnCard } from "./shuffle";
import { orientation, positionMeaning, readingLines, synthesisSignals } from "./summary";

/** Every reveal calls Gemini, so allow a full evening of readings and retries, then fall back to the library. */
export const INTERPRET_HOURLY_LIMIT = 30;

/** Current flash model that still accepts new keys and handles Chinese. Override with GEMINI_MODEL. */
export const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";

/** Tried, in order, when the chosen model is missing, overloaded, or rate-limited. */
export const GEMINI_FALLBACK_MODELS = ["gemini-3.8-flash", "gemini-flash-latest"] as const;

/**
 * Multi-card readings were exceeding the old 30s abort. 90s stays under
 * Vercel's 300s hobby limit; the route's maxDuration is a bit higher so the
 * platform does not cut the function off first.
 */
export const GEMINI_TIMEOUT_MS = 90_000;

export type GeminiFailReason = "timeout" | "upstream" | "empty";

export type GeminiFailure = { error: "AI_FAILED"; reason: GeminiFailReason };

export type GeminiSuccess = { reading: AiReading };

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

/** Primary first, then the fallbacks, without asking the same model twice. */
export function geminiModelChain(primary: string): string[] {
  const chain: string[] = [];
  for (const model of [primary, ...GEMINI_FALLBACK_MODELS]) {
    const name = model.trim();
    if (name && !chain.includes(name)) chain.push(name);
  }
  return chain;
}

/**
 * Gemini 3 and flash-latest accept thinkingLevel, and "low" is the fastest
 * level they support ("minimal" is rejected). Gemini 2.x only accepts a budget.
 */
export function thinkingConfigFor(model: string): { thinkingBudget: number } | { thinkingLevel: "low" } {
  if (/(?:^|\/)gemini-2(?:[.-]|$)/.test(model) || model.includes("gemini-2.")) return { thinkingBudget: 0 };
  return { thinkingLevel: "low" };
}

function modelUnavailable(status: number, body: string): boolean {
  if (status === 404 || status === 429 || status === 503) return true;
  if (status !== 400) return false;
  return /model|thinking|no longer available|not supported|not found/i.test(body);
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
  positionId: string;
  position: string;
  place: string;
  card: string;
  orientation: string;
  keywords: string;
  topicMeaning: string;
  inPosition: string;
  advice: string;
};

const responseSchema = {
  type: "OBJECT",
  properties: {
    cards: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          positionId: { type: "STRING" },
          body: { type: "STRING" },
        },
        required: ["positionId", "body"],
      },
    },
    connection: { type: "STRING" },
    conclusion: { type: "STRING" },
  },
  required: ["cards", "connection", "conclusion"],
};

export function geminiReadingBody(input: {
  question: string;
  spread: Spread;
  locale: Locale;
  context: ReadingContext;
  cards: DrawnCard[];
}): {
  system: string;
  user: { question: string; spread: string; situation: string; signals: string; cards: CardBrief[] };
} {
  const { question, spread, locale, context, cards } = input;
  const topic = contextTopic(spread.id, context);
  const situation = contextLabel(spread.id, context, locale);
  const lines = readingLines(spread, cards);
  const briefs: CardBrief[] = lines.map((line) => {
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
    };
  });
  const system =
    locale === "zh"
      ? "你是叨叨占卜师。只根据给出的知识库文字来解牌，不要另起一套牌义，不要发明没有的牌。用简体中文。每张牌写两到四句，放在它的位置里，并尊重问卜者确认的处境：已婚或同居不要写成要不要开始约会，求职中不要写成已经坐在那份工作里，学生不要写成公司升职流程。connection 写牌与牌如何呼应，用上给出的牌阵信号。conclusion 回到问题和处境，给出一件具体可做的事。不要断言医疗、法律、财务或绝对的未来。只返回符合结构的 JSON，positionId 必须原样使用。"
      : "You are Daodao. Base the reading only on the supplied knowledge-base texts. Do not invent meanings or cards. Write in English. For each card, two to four sentences in its position, and honor the stated situation: do not tell a married person to start dating, do not treat a job seeker as someone already in the role, and do not give a student a corporate promotion process. connection describes how the cards answer one another, using the synthesis signals. conclusion returns to the question and the situation with one concrete next step. Do not claim medical, legal, financial, or absolute future facts. Return only the JSON object, and copy positionId exactly.";
  return {
    system,
    user: {
      question,
      spread: spread.name[locale],
      situation,
      signals: synthesisSignals(spread.id, cards, locale),
      cards: briefs,
    },
  };
}

export async function requestGeminiInterpretation(input: {
  apiKey: string;
  model: string;
  system: string;
  user: unknown;
  positions: { id: string; names: string[] }[];
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<GeminiSuccess | GeminiFailure> {
  const timeoutMs = input.timeoutMs ?? GEMINI_TIMEOUT_MS;
  const fetchImpl = input.fetchImpl ?? fetch;
  const signal = AbortSignal.timeout(timeoutMs);
  const chain = geminiModelChain(input.model);
  for (const model of chain) {
    if (signal.aborted) return { error: "AI_FAILED", reason: "timeout" };
    try {
      const response = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
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
              temperature: 0.7,
              responseMimeType: "application/json",
              responseSchema,
              thinkingConfig: thinkingConfigFor(model),
            },
          }),
          signal,
        },
      );
      if (!response.ok) {
        const body = response.status === 400 ? await response.text().catch(() => "") : "";
        if (response.status !== 400) await response.body?.cancel().catch(() => undefined);
        if (modelUnavailable(response.status, body)) continue;
        return { error: "AI_FAILED", reason: "upstream" };
      }
      const payload = (await response.json()) as GeminiPayload;
      const text = candidateText(payload.candidates?.[0]?.content?.parts);
      const reading = text ? parseAiReading(text, input.positions) : null;
      if (!reading) return { error: "AI_FAILED", reason: "empty" };
      return { reading };
    } catch (error) {
      return { error: "AI_FAILED", reason: isGeminiTimeout(error) || signal.aborted ? "timeout" : "upstream" };
    }
  }
  return { error: "AI_FAILED", reason: "upstream" };
}
