import { EMPTY_USAGE, type TokenUsage } from "./gemini";
import { quoteUsage } from "./model-prices";
import { prisma } from "./prisma";

export const INTERPRET_OUTCOMES = ["success", "fallback", "quota", "timeout", "error", "crisis", "rate-limited"] as const;

export type InterpretOutcome = (typeof INTERPRET_OUTCOMES)[number];

export type InterpretLogInput = {
  userId?: string | null;
  userEmail?: string | null;
  guestKey?: string | null;
  question: string;
  spreadId: string;
  contextJson: string;
  cardsJson: string;
  readingJson?: string | null;
  provider?: string | null;
  modelUsed?: string | null;
  modelsTried?: string[];
  usage?: TokenUsage;
  latencyMs: number;
  outcome: InterpretOutcome;
  errorReason?: string | null;
};

export async function recordInterpret(entry: InterpretLogInput): Promise<void> {
  const usage = entry.usage ?? EMPTY_USAGE;
  const quote = quoteUsage(entry.provider ?? null, entry.modelUsed ?? null, usage);
  try {
    await prisma.interpretLog.create({
      data: {
        userId: entry.userId || null,
        userEmail: entry.userEmail || null,
        guestKey: entry.guestKey || null,
        question: entry.question,
        spreadId: entry.spreadId,
        contextJson: entry.contextJson,
        cardsJson: entry.cardsJson,
        readingJson: entry.readingJson || null,
        provider: entry.provider || null,
        modelUsed: entry.modelUsed || null,
        modelsTried: JSON.stringify(entry.modelsTried ?? []),
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        latencyMs: entry.latencyMs,
        outcome: entry.outcome,
        errorReason: entry.errorReason || null,
        costUsd: quote.costUsd,
        wouldCostUsd: quote.wouldCostUsd,
        freeTier: quote.freeTier,
      },
    });
  } catch (error) {
    console.error("interpret log failed", error instanceof Error ? error.message : "unknown");
  }
}
