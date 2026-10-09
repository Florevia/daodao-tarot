import {
  geminiApiKey,
  geminiModel,
  geminiReadingBody,
  requestGeminiInterpretation,
} from "@/lib/gemini";
import { sanitizeContext } from "@/lib/reading-context";
import { validateDrawnCards } from "@/lib/reading-record";
import { getSpread } from "@/lib/spreads";
import type { DrawnCard } from "@/lib/shuffle";
import { connection } from "next/server";
import { z } from "zod";

/** Above the 90s Gemini fetch, under the 300s Vercel hobby ceiling. */
export const maxDuration = 120;

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
  const locale = parsed.data.locale;
  const context = sanitizeContext(parsed.data.spreadId, parsed.data.context);
  const question = parsed.data.question?.trim() || (locale === "zh" ? "（没有写下具体问题）" : "(no specific question)");
  const { system, user } = geminiReadingBody({
    question,
    spread,
    locale,
    context,
    cards: parsed.data.cards as DrawnCard[],
  });
  const result = await requestGeminiInterpretation({
    apiKey: key,
    model: geminiModel(),
    system,
    user,
  });
  if ("interpretation" in result) return Response.json(result);
  return Response.json(result, { status: 502 });
}
