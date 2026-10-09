import { requireCard, type Locale } from "@/lib/cards";
import { getSpread } from "@/lib/spreads";
import { validateDrawnCards } from "@/lib/reading-record";
import type { DrawnCard } from "@/lib/shuffle";
import { connection } from "next/server";
import { z } from "zod";

const cardSchema = z.object({
  positionId: z.string().min(1).max(40),
  cardId: z.string().min(1).max(40),
  reversed: z.boolean(),
});

const schema = z.object({
  question: z.string().max(500).optional(),
  spreadId: z.string().min(1).max(40),
  locale: z.enum(["zh", "en"]),
  cards: z.array(cardSchema).min(1).max(10),
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

export async function GET() {
  await connection();
  return Response.json({ available: Boolean(process.env.OPENAI_API_KEY) });
}

export async function POST(request: Request) {
  await connection();
  const key = process.env.OPENAI_API_KEY;
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
  const question = parsed.data.question?.trim() || (locale === "zh" ? "（没有写下具体问题）" : "(no specific question)");
  const lines = parsed.data.cards.map((drawn: DrawnCard) => {
    const card = requireCard(drawn.cardId);
    const position = spread.positions.find((item) => item.id === drawn.positionId);
    return {
      position: position?.name[locale] ?? drawn.positionId,
      positionNote: position?.description[locale] ?? "",
      card: card.name[locale],
      orientation: drawn.reversed ? (locale === "zh" ? "逆位" : "reversed") : locale === "zh" ? "正位" : "upright",
      keywords: card.keywords[locale].join(locale === "zh" ? "、" : ", "),
      meaning: drawn.reversed ? card.reversed[locale] : card.upright[locale],
    };
  });

  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const system =
    locale === "zh"
      ? "你是叨叨占卜师，一位温和、具体、不吓唬人的塔罗读者。用简体中文写 3 到 5 段。结合提问与每一张牌的位置，把牌义说成对这个人有用的话。不要断言医疗、法律、财务或绝对的未来。不要发明牌阵里没有的牌。结尾用一句话提醒这只是娱乐与自我反思。"
      : "You are Daodao, a warm and specific tarot reader. Write 3 to 5 paragraphs in English. Weave the question together with each card's position. Do not claim medical, legal, financial, or absolute future facts. Do not invent cards. Close with one sentence that this is entertainment and reflection.";

  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: JSON.stringify({
              question,
              spread: spread.name[locale],
              cards: lines,
            }),
          },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      return Response.json({ error: "AI_FAILED" }, { status: 502 });
    }
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) return Response.json({ error: "AI_FAILED" }, { status: 502 });
    return Response.json({ interpretation: text });
  } catch {
    return Response.json({ error: "AI_FAILED" }, { status: 502 });
  }
}
