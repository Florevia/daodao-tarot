import type { TokenUsage } from "./gemini";

/** Estimated paid prices in USD per 1M tokens. Free-tier Gemini calls bill 0 and still record would-cost. */
export const MODEL_PRICES: Record<string, { inputPerM: number; outputPerM: number }> = {
  "gemini-3.6-flash": { inputPerM: 0.15, outputPerM: 0.6 },
  "gemini-3.8-flash": { inputPerM: 0.15, outputPerM: 0.6 },
  "gemini-3-flash-preview": { inputPerM: 0.15, outputPerM: 0.6 },
  "gemini-flash-lite-latest": { inputPerM: 0.075, outputPerM: 0.3 },
  "gemini-3.5-flash-lite": { inputPerM: 0.075, outputPerM: 0.3 },
  "anthropic/claude-haiku-5.5": { inputPerM: 1, outputPerM: 5 },
};

const FALLBACK_PRICE = { inputPerM: 0.5, outputPerM: 2 };

export function priceFor(model: string | null | undefined): { inputPerM: number; outputPerM: number } {
  if (!model) return FALLBACK_PRICE;
  return MODEL_PRICES[model] ?? FALLBACK_PRICE;
}

export function quoteUsage(
  provider: string | null,
  model: string | null,
  usage: TokenUsage,
): { costUsd: number; wouldCostUsd: number; freeTier: boolean } {
  const price = priceFor(model);
  const wouldCostUsd = (usage.inputTokens * price.inputPerM + usage.outputTokens * price.outputPerM) / 1_000_000;
  const freeTier = provider === "gemini" && process.env.GEMINI_FREE_TIER !== "0";
  return {
    costUsd: freeTier ? 0 : wouldCostUsd,
    wouldCostUsd,
    freeTier,
  };
}
