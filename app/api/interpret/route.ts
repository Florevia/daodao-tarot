import { resolveAiProvider, requestAiInterpretation } from "@/lib/ai-provider";
import { readSession } from "@/lib/auth";
import { readingResponseSchema, type GeminiFailReason } from "@/lib/gemini";
import { recordInterpret, type InterpretOutcome } from "@/lib/interpret-log";
import { clientIp, consumeAiQuota, deviceIdFrom, guestKey, prismaCounterStore } from "@/lib/limits";
import { loadExhaustedModels, markModelExhausted } from "@/lib/model-quota";
import { composeReadingPrompt, reviewContextFrom, selfReviewEnabled } from "@/lib/prompt/compose";
import { buildCrisisReading } from "@/lib/prompt/crisis";
import { detectQuestionKind } from "@/lib/prompt/detect";
import { sanitizeContext } from "@/lib/reading-context";
import { validateDrawnCards } from "@/lib/reading-record";
import { getSpread } from "@/lib/spreads";
import type { DrawnCard } from "@/lib/shuffle";
import { connection } from "next/server";
import { z } from "zod";

/** Above the 90s model fetch, under the 300s Vercel hobby ceiling. */
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

function failureOutcome(reason: GeminiFailReason): InterpretOutcome {
  if (reason === "quota") return "quota";
  if (reason === "timeout") return "timeout";
  return "error";
}

export async function GET() {
  await connection();
  const provider = resolveAiProvider();
  return Response.json({ available: Boolean(provider), provider: provider?.id ?? null });
}

export async function POST(request: Request) {
  await connection();
  const started = Date.now();
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
  const who = await readSession().catch(() => null);
  const identity = guestKey(clientIp(request), deviceIdFrom(request));
  const baseLog = {
    userId: who?.id ?? null,
    userEmail: who?.email ?? null,
    guestKey: who ? null : identity,
    question,
    spreadId: spread.id,
    contextJson: JSON.stringify(context),
    cardsJson: JSON.stringify(parsed.data.cards),
  };

  if (detectQuestionKind(question) === "crisis") {
    const reading = buildCrisisReading(spread.positions, locale);
    await recordInterpret({
      ...baseLog,
      readingJson: JSON.stringify(reading),
      latencyMs: Date.now() - started,
      outcome: "crisis",
    });
    return Response.json({ reading });
  }

  const provider = resolveAiProvider();
  if (!provider) {
    await recordInterpret({
      ...baseLog,
      latencyMs: Date.now() - started,
      outcome: "fallback",
      errorReason: "no-provider",
    });
    return Response.json({ error: "AI_UNAVAILABLE" }, { status: 503 });
  }

  let quota: "ok" | "user" | "site" = "user";
  try {
    quota = await consumeAiQuota(prismaCounterStore(), identity);
  } catch (error) {
    await recordInterpret({
      ...baseLog,
      provider: provider.id,
      latencyMs: Date.now() - started,
      outcome: "error",
      errorReason: error instanceof Error ? error.message : "limit-check",
    });
    return Response.json({ error: "RATE_LIMIT", reason: "rate-limited" }, { status: 429 });
  }
  if (quota !== "ok") {
    await recordInterpret({
      ...baseLog,
      provider: provider.id,
      latencyMs: Date.now() - started,
      outcome: "rate-limited",
      errorReason: quota,
    });
    return Response.json({ error: "RATE_LIMIT", reason: "rate-limited" }, { status: 429 });
  }

  const skipModels = await loadExhaustedModels().catch(() => []);
  const composed = composeReadingPrompt({
    question,
    spread,
    locale,
    context,
    cards: parsed.data.cards as DrawnCard[],
  });
  const result = await requestAiInterpretation({
    provider,
    system: composed.system,
    user: composed.user,
    positions: spread.positions.map((position) => ({
      id: position.id,
      names: [position.name.zh, position.name.en],
    })),
    schema: readingResponseSchema,
    selfReview: selfReviewEnabled(),
    locale,
    reviewContext: reviewContextFrom(composed, spread, locale),
    skipModels,
    onQuota: async (model) => {
      await markModelExhausted(model).catch(() => undefined);
    },
  });
  const latencyMs = Date.now() - started;
  if ("reading" in result) {
    await recordInterpret({
      ...baseLog,
      readingJson: JSON.stringify(result.reading),
      provider: provider.id,
      modelUsed: result.model,
      modelsTried: result.modelsTried,
      usage: result.usage,
      latencyMs,
      outcome: "success",
    });
    return Response.json({ reading: result.reading });
  }
  await recordInterpret({
    ...baseLog,
    provider: provider.id,
    latencyMs,
    outcome: failureOutcome(result.reason),
    errorReason: result.reason,
  });
  return Response.json(result, { status: 502 });
}
