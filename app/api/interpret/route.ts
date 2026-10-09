import { requireCard, type Locale } from "@/lib/cards";
import { contextLabel, sanitizeContext } from "@/lib/reading-context";
import { getSpread } from "@/lib/spreads";
import { validateDrawnCards } from "@/lib/reading-record";
import type { DrawnCard } from "@/lib/shuffle";
import { positionMeaning, spreadTopic } from "@/lib/summary";
import { connection } from "next/server";
import { z } from "zod";

const cardSchema = z.object({
  positionId: z.string().min(1).max(40),
  cardId: z.string().min(1).max(40),
  reversed: z.boolean(),
});

const contextSchema = z
  .object({
    status: z.string().max(40).optional(),
    focus: z.string().max(40).optional(),
    area: z.string().max(40).optional(),
    mood: z.string().max(40).optional(),
    theme: z.string().max(40).optional(),
  })
  .optional();

const schema = z.object({
  question: z.string().max(500).optional(),
  spreadId: z.string().min(1).max(40),
  locale: z.enum(["zh", "en"]),
  cards: z.array(cardSchema).min(1).max(10),
  context: contextSchema,
});

const hits = new Map<string, { count: number; reset: number }>();

function limited(request: Request): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const current = hits.get(ip);
  if (!current || current.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 20;
}

export function geminiApiKey(): string {
  return (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
}

export async function GET() {
  await connection();
  return Response.json({ available: Boolean(geminiApiKey()) });
}

export async function POST(request: Request) {
  await connection();
  const key = geminiApiKey();
  if (!key) return Response.json({ error: "AI_UNAVAILABLE" }, { status: 503 });
  if (limited(request)) return Response.json({ error: "RATE_LIMIT" }, { status: 429 });
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || !validateDrawnCards(parsed.data.spreadId, parsed.data.cards)) {
    return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const spread = getSpread(parsed.data.spreadId);
  if (!spread) return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
  const locale = parsed.data.locale as Locale;
  const context = sanitizeContext(parsed.data.spreadId, parsed.data.context);
  const question = parsed.data.question?.trim() || (locale === "zh" ? "（没有写下具体问题）" : "(no specific question)");
  const situation = contextLabel(parsed.data.spreadId, context, locale);
  const topic = spreadTopic(parsed.data.spreadId);
  const lines = parsed.data.cards.map((drawn: DrawnCard) => {
    const card = requireCard(drawn.cardId);
    const position = spread.positions.find((item) => item.id === drawn.positionId);
    const orient = drawn.reversed ? "reversed" : "upright";
    const line = position ? { position, card, reversed: drawn.reversed } : null;
    return {
      position: position?.name[locale] ?? drawn.positionId,
      positionNote: position?.description[locale] ?? "",
      card: card.name[locale],
      orientation: drawn.reversed ? (locale === "zh" ? "逆位" : "reversed") : locale === "zh" ? "正位" : "upright",
      keywords: card.keywords[locale].join(locale === "zh" ? "、" : ", "),
      meaning: card.topics[orient].general[locale],
      spreadReading: card.topics[orient][topic][locale],
      advice: card.topics[orient].advice[locale],
      inPosition: line ? positionMeaning(line, locale, spread.id, context) : "",
    };
  });

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
  const system =
    locale === "zh"
      ? "你是叨叨占卜师，一位温和、具体、不吓唬人的塔罗读者。用简体中文写 3 到 5 段。结合提问、问卜者确认的处境，以及每一张牌的名称、正逆位和位置，把牌义说成对这个人有用的话。处境优先于泛泛的牌义：例如已婚或同居就不要写成要不要开始约会，求职中就不要写成已经坐在那份工作里。不要断言医疗、法律、财务或绝对的未来。不要发明牌阵里没有的牌。结尾用一句话提醒这只是娱乐与自我反思。"
      : "You are Daodao, a warm and specific tarot reader. Write 3 to 5 paragraphs in English. Weave the question, the situation the querent confirmed, and each card's name, orientation, and position. Let the stated situation override a generic reading: do not tell a married person to start dating, and do not treat a job seeker as someone already in the role. Do not claim medical, legal, financial, or absolute future facts. Do not invent cards. Close with one sentence that this is entertainment and reflection.";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: JSON.stringify({
                    question,
                    spread: spread.name[locale],
                    situation,
                    context,
                    cards: lines,
                  }),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            thinkingConfig: { thinkingLevel: "low" },
          },
        }),
        signal: AbortSignal.timeout(30000),
      },
    );
    if (!response.ok) {
      return Response.json({ error: "AI_FAILED" }, { status: 502 });
    }
    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();
    if (!text) return Response.json({ error: "AI_FAILED" }, { status: 502 });
    return Response.json({ interpretation: text });
  } catch {
    return Response.json({ error: "AI_FAILED" }, { status: 502 });
  }
}
