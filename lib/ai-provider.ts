import { parseAiReading } from "./ai-reading";
import type { Locale } from "./cards";
import {
  DEFAULT_GEMINI_MODEL,
  GEMINI_TIMEOUT_MS,
  isGeminiTimeout,
  readingResponseSchema,
  requestGeminiInterpretation,
  type GeminiFailure,
  type GeminiSuccess,
} from "./gemini";
import { repairReading } from "./prompt/checks";
import { selfReviewPrompt, type SelfReviewContext } from "./prompt/compose";

export const ZENMUX_CHAT_URL = "https://zenmux.ai/api/v1/chat/completions";
export const DEFAULT_ZENMUX_MODEL = "anthropic/claude-haiku-5.5";

/** OpenAI JSON Schema for the same reading object Gemini already returns. */
export const readingJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    overview: { type: "string" },
    cards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          positionId: { type: "string" },
          body: { type: "string" },
        },
        required: ["positionId", "body"],
      },
    },
    connection: { type: "string" },
    conclusion: { type: "string" },
  },
  required: ["overview", "cards", "connection", "conclusion"],
} as const;

const SCHEMA_APPENDIX = [
  "Return only one JSON object matching this schema. Do not use markdown fences.",
  "只返回符合下面结构的 JSON，不要 Markdown。positionId 必须原样。overview 可以写整副的第一眼。",
  JSON.stringify(readingJsonSchema),
].join("\n");

export type AiProviderId = "gemini" | "zenmux";

export type AiProviderConfig = {
  id: AiProviderId;
  apiKey: string;
  model: string;
};

export type AiEnv = {
  AI_PROVIDER?: string;
  ZENMUX_API_KEY?: string;
  ZENMUX_MODEL?: string;
  GOOGLE_GENERATIVE_AI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
};

export type AiResult = GeminiSuccess | GeminiFailure;

type ChatFormat = "json_schema" | "json_object";

/**
 * ZenMux when its key is set, otherwise Gemini.
 * `AI_PROVIDER=gemini|zenmux` forces that provider and ignores the other key.
 */
export function resolveAiProvider(env?: AiEnv): AiProviderConfig | null {
  const source = env ?? (process.env as AiEnv);
  const override = source.AI_PROVIDER?.trim().toLowerCase();
  const forced = override === "gemini" || override === "zenmux" ? override : null;
  const zenmuxKey = source.ZENMUX_API_KEY?.trim() ?? "";
  const geminiKey = (source.GOOGLE_GENERATIVE_AI_API_KEY || source.GEMINI_API_KEY || "").trim();
  const id: AiProviderId = forced ?? (zenmuxKey ? "zenmux" : "gemini");
  if (id === "zenmux") {
    if (!zenmuxKey) return null;
    return { id, apiKey: zenmuxKey, model: source.ZENMUX_MODEL?.trim() || DEFAULT_ZENMUX_MODEL };
  }
  if (!geminiKey) return null;
  return { id, apiKey: geminiKey, model: source.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL };
}

export function zenmuxChatBody(input: {
  model: string;
  system: string;
  user: unknown;
  format: ChatFormat;
}): Record<string, unknown> {
  const system = input.format === "json_object" ? `${input.system}\n\n${SCHEMA_APPENDIX}` : input.system;
  return {
    model: input.model,
    temperature: 0.7,
    messages: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(input.user) },
    ],
    response_format:
      input.format === "json_schema"
        ? {
            type: "json_schema",
            json_schema: { name: "tarot_reading", strict: true, schema: readingJsonSchema },
          }
        : { type: "json_object" },
  };
}

type ChatMessage = { content?: unknown };

/** Text from an OpenAI-compatible chat completion, including array content parts. */
export function chatCompletionText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const choices = (payload as { choices?: { message?: ChatMessage }[] }).choices;
  const content = choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part && typeof part.text === "string") return part.text;
      return "";
    })
    .join("")
    .trim();
}

export async function requestAiInterpretation(input: {
  provider: AiProviderConfig;
  system: string;
  user: unknown;
  positions: { id: string; names: string[] }[];
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  schema?: typeof readingResponseSchema;
  selfReview?: boolean;
  locale?: Locale;
  reviewContext?: SelfReviewContext;
}): Promise<AiResult> {
  if (input.provider.id === "gemini") {
    return requestGeminiInterpretation({
      apiKey: input.provider.apiKey,
      model: input.provider.model,
      system: input.system,
      user: input.user,
      positions: input.positions,
      timeoutMs: input.timeoutMs,
      fetchImpl: input.fetchImpl,
      schema: input.schema ?? readingResponseSchema,
      selfReview: input.selfReview,
      locale: input.locale,
      reviewContext: input.reviewContext,
    });
  }
  return requestZenmuxInterpretation(input);
}

export async function requestZenmuxInterpretation(input: {
  provider: AiProviderConfig;
  system: string;
  user: unknown;
  positions: { id: string; names: string[] }[];
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  selfReview?: boolean;
  locale?: Locale;
  reviewContext?: SelfReviewContext;
}): Promise<AiResult> {
  const timeoutMs = input.timeoutMs ?? GEMINI_TIMEOUT_MS;
  const fetchImpl = input.fetchImpl ?? fetch;
  const signal = AbortSignal.timeout(timeoutMs);
  let format: ChatFormat = "json_schema";

  const complete = async (
    system: string,
    user: unknown,
    nextFormat: ChatFormat,
  ): Promise<AiResult | "schema-rejected"> => {
    try {
      const response = await fetchImpl(ZENMUX_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.provider.apiKey}`,
        },
        body: JSON.stringify(zenmuxChatBody({ model: input.provider.model, system, user, format: nextFormat })),
        signal,
      });
      if (response.status === 429) {
        await response.body?.cancel().catch(() => undefined);
        return { error: "AI_FAILED", reason: "quota" };
      }
      if (response.status === 400 || response.status === 422) {
        await response.body?.cancel().catch(() => undefined);
        if (nextFormat === "json_schema") return "schema-rejected";
        return { error: "AI_FAILED", reason: "upstream" };
      }
      if (!response.ok) {
        await response.body?.cancel().catch(() => undefined);
        return { error: "AI_FAILED", reason: "upstream" };
      }
      const payload = (await response.json()) as unknown;
      const text = chatCompletionText(payload);
      const reading = text ? parseAiReading(text, input.positions) : null;
      if (!reading) return { error: "AI_FAILED", reason: "empty" };
      return { reading };
    } catch (error) {
      return { error: "AI_FAILED", reason: isGeminiTimeout(error) || signal.aborted ? "timeout" : "upstream" };
    }
  };

  const once = async (system: string, user: unknown): Promise<AiResult> => {
    const first = await complete(system, user, format);
    if (first !== "schema-rejected") return first;
    if (signal.aborted) return { error: "AI_FAILED", reason: "timeout" };
    const second = await complete(system, user, "json_object");
    if (second === "schema-rejected") return { error: "AI_FAILED", reason: "upstream" };
    if ("reading" in second) format = "json_object";
    return second;
  };

  const drafted = await once(input.system, input.user);
  if (!("reading" in drafted)) return drafted;
  const repaired = await repairReading(drafted.reading, signal, async (note) => {
    if (signal.aborted) return null;
    const revised = await once(`${input.system}\n\n${note}`, input.user);
    if (!("reading" in revised)) return null;
    return revised.reading;
  });
  const first = { reading: repaired };
  if (!input.selfReview || signal.aborted || !input.reviewContext) return first;
  const review = selfReviewPrompt(first.reading, input.locale ?? "zh", input.reviewContext);
  const revised = await once(review.system, review.user);
  if ("reading" in revised) return revised;
  return first;
}
