import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_ZENMUX_MODEL,
  ZENMUX_CHAT_URL,
  chatCompletionText,
  requestAiInterpretation,
  resolveAiProvider,
  zenmuxChatBody,
} from "./ai-provider";
import type { SelfReviewContext } from "./prompt/compose";

const positions = [{ id: "past", names: ["过去", "Past"] }];

function readingJson(conclusion = "先做一件小事。"): string {
  return JSON.stringify({
    overview: "第一眼。",
    cards: [{ positionId: "past", body: "过去这一张。" }],
    connection: "连在一起。",
    conclusion,
  });
}

function chat(content: string) {
  return { choices: [{ message: { content } }] };
}

const reviewContext: SelfReviewContext = {
  question: "今晚怎么说？",
  situation: "恋爱中",
  spread: "三牌阵",
  positions: [{ id: "past", name: "过去", asks: "已经发生的事" }],
  cards: [
    {
      positionId: "past",
      card: "圣杯四",
      orientation: "正位",
      keywords: "倦怠",
      meaning: "眼前的杯子已经够了。",
    },
  ],
  crisis: false,
};

describe("ai provider", () => {
  it("prefers ZenMux when its key is set, and honors an explicit override", () => {
    assert.equal(resolveAiProvider({}), null);
    assert.deepEqual(resolveAiProvider({ GEMINI_API_KEY: "gemini-key" }), {
      id: "gemini",
      apiKey: "gemini-key",
      model: "gemini-3.6-flash",
    });
    assert.deepEqual(
      resolveAiProvider({
        ZENMUX_API_KEY: "zenmux-key",
        GOOGLE_GENERATIVE_AI_API_KEY: "gemini-key",
      }),
      { id: "zenmux", apiKey: "zenmux-key", model: DEFAULT_ZENMUX_MODEL },
    );
    assert.equal(DEFAULT_ZENMUX_MODEL, "anthropic/claude-haiku-5.5");
    assert.deepEqual(
      resolveAiProvider({
        AI_PROVIDER: "gemini",
        ZENMUX_API_KEY: "zenmux-key",
        GEMINI_API_KEY: "gemini-key",
        GEMINI_MODEL: "gemini-3.8-flash",
      }),
      { id: "gemini", apiKey: "gemini-key", model: "gemini-3.8-flash" },
    );
    assert.equal(resolveAiProvider({ AI_PROVIDER: "zenmux", GEMINI_API_KEY: "gemini-key" }), null);
    assert.deepEqual(resolveAiProvider({ ZENMUX_API_KEY: " zenmux-key ", ZENMUX_MODEL: "anthropic/claude-sonnet-5.5" }), {
      id: "zenmux",
      apiKey: "zenmux-key",
      model: "anthropic/claude-sonnet-5.5",
    });
  });

  it("maps a reading onto a ZenMux chat completion with json_schema", () => {
    const body = zenmuxChatBody({
      model: DEFAULT_ZENMUX_MODEL,
      system: "你是叨叨。",
      user: { question: "今晚怎么说？", cards: [] },
      format: "json_schema",
    });
    assert.equal(body.model, "anthropic/claude-haiku-5.5");
    assert.equal(body.temperature, 0.7);
    const messages = body.messages as { role: string; content: string }[];
    assert.equal(messages[0]?.role, "system");
    assert.equal(messages[0]?.content, "你是叨叨。");
    assert.match(messages[1]?.content ?? "", /今晚怎么说/);
    const format = body.response_format as {
      type: string;
      json_schema: { name: string; strict: boolean; schema: { required: string[] } };
    };
    assert.equal(format.type, "json_schema");
    assert.equal(format.json_schema.name, "tarot_reading");
    assert.equal(format.json_schema.strict, true);
    assert.deepEqual(format.json_schema.schema.required, ["overview", "cards", "connection", "conclusion"]);
  });

  it("keeps fenced text for the reading parser and joins array content parts", () => {
    const fenced = chatCompletionText({
      choices: [{ message: { content: "```json\n" + readingJson() + "\n```" } }],
    });
    assert.match(fenced, /```json/);
    assert.match(fenced, /"overview"/);
    const parts = chatCompletionText({
      choices: [{ message: { content: [{ type: "text", text: "{\"overview\":" }, { text: "\"第一眼\"}" }] } }],
    });
    assert.equal(parts, "{\"overview\":\"第一眼\"}");
  });

  it("posts the composed prompt to ZenMux and parses a fenced reading", async () => {
    const result = await requestAiInterpretation({
      provider: { id: "zenmux", apiKey: "zenmux-test-key", model: DEFAULT_ZENMUX_MODEL },
      system: "你是叨叨。只返回 JSON。",
      user: { question: "今晚怎么说？", cards: [{ positionId: "past" }] },
      positions,
      fetchImpl: async (url, init) => {
        assert.equal(String(url), ZENMUX_CHAT_URL);
        assert.equal(String(url).includes("zenmux-test-key"), false);
        const headers = new Headers(init?.headers);
        assert.equal(headers.get("Authorization"), "Bearer zenmux-test-key");
        const body = JSON.parse(String(init?.body)) as {
          model: string;
          messages: { role: string; content: string }[];
          response_format: { type: string };
        };
        assert.equal(body.model, DEFAULT_ZENMUX_MODEL);
        assert.equal(body.messages[0]?.content, "你是叨叨。只返回 JSON。");
        assert.match(body.messages[1]?.content ?? "", /今晚怎么说/);
        assert.equal(body.response_format.type, "json_schema");
        return Response.json(chat("```json\n" + readingJson() + "\n```"));
      },
    });
    assert.deepEqual(result, {
      reading: {
        overview: "第一眼。",
        cards: [{ positionId: "past", body: "过去这一张。" }],
        connection: "连在一起。",
        conclusion: "先做一件小事。",
      },
    });
    assert.equal(JSON.stringify(result).includes("zenmux-test-key"), false);
  });

  it("falls back to json_object and puts the schema in the prompt when json_schema is rejected", async () => {
    const formats: string[] = [];
    const result = await requestAiInterpretation({
      provider: { id: "zenmux", apiKey: "zenmux-test-key", model: DEFAULT_ZENMUX_MODEL },
      system: "你是叨叨。",
      user: { question: "今晚怎么说？" },
      positions,
      fetchImpl: async (_url, init) => {
        const body = JSON.parse(String(init?.body)) as {
          messages: { content: string }[];
          response_format: { type: string };
        };
        formats.push(body.response_format.type);
        if (formats.length === 1) return new Response("json_schema is not supported", { status: 400 });
        assert.match(body.messages[0]?.content ?? "", /你是叨叨/);
        assert.match(body.messages[0]?.content ?? "", /只返回符合下面结构的 JSON/);
        assert.match(body.messages[0]?.content ?? "", /"overview"/);
        return Response.json(chat("```\n" + readingJson("改用对象。") + "\n```"));
      },
    });
    assert.deepEqual(formats, ["json_schema", "json_object"]);
    assert.ok("reading" in result);
    if ("reading" in result) assert.equal(result.reading.conclusion, "改用对象。");
  });

  it("stops on a 429 without a second request", async () => {
    let calls = 0;
    const result = await requestAiInterpretation({
      provider: { id: "zenmux", apiKey: "zenmux-test-key", model: DEFAULT_ZENMUX_MODEL },
      system: "你是叨叨。",
      user: {},
      positions,
      fetchImpl: async () => {
        calls += 1;
        return new Response("quota", { status: 429 });
      },
    });
    assert.equal(calls, 1);
    assert.deepEqual(result, { error: "AI_FAILED", reason: "quota" });
  });

  it("revises the draft with the same provider, including after a schema fallback", async () => {
    const formats: string[] = [];
    const result = await requestAiInterpretation({
      provider: { id: "zenmux", apiKey: "zenmux-test-key", model: "anthropic/claude-haiku-5.5" },
      system: "你是叨叨。",
      user: { question: "今晚怎么说？" },
      positions,
      selfReview: true,
      locale: "zh",
      reviewContext,
      fetchImpl: async (_url, init) => {
        const body = JSON.parse(String(init?.body)) as {
          messages: { content: string }[];
          response_format: { type: string };
        };
        formats.push(body.response_format.type);
        if (formats.length === 1) return new Response("no schema", { status: 422 });
        if (formats.length === 2) {
          assert.equal(body.response_format.type, "json_object");
          return Response.json(chat(readingJson("第一稿。")));
        }
        assert.equal(body.response_format.type, "json_object");
        assert.match(body.messages[0]?.content ?? "", /自检/);
        assert.match(body.messages[1]?.content ?? "", /第一稿/);
        assert.match(body.messages[1]?.content ?? "", /今晚怎么说/);
        assert.match(body.messages[1]?.content ?? "", /圣杯四/);
        assert.match(body.messages[1]?.content ?? "", /"crisis":false/);
        return Response.json(chat(readingJson("改过的一步。")));
      },
    });
    assert.deepEqual(formats, ["json_schema", "json_object", "json_object"]);
    assert.ok("reading" in result);
    if ("reading" in result) assert.equal(result.reading.conclusion, "改过的一步。");
  });

  it("sends Gemini readings through the existing generateContent request", async () => {
    const result = await requestAiInterpretation({
      provider: { id: "gemini", apiKey: "gemini-test-key", model: "gemini-3.6-flash" },
      system: "你是叨叨。",
      user: { question: "今晚怎么说？" },
      positions,
      fetchImpl: async (url, init) => {
        assert.match(String(url), /generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-3\.6-flash:generateContent/);
        assert.equal(String(url).includes("gemini-test-key"), false);
        const headers = new Headers(init?.headers);
        assert.equal(headers.get("x-goog-api-key"), "gemini-test-key");
        return Response.json({
          candidates: [{ content: { parts: [{ text: readingJson() }] } }],
        });
      },
    });
    assert.ok("reading" in result);
    if ("reading" in result) assert.equal(result.reading.overview, "第一眼。");
  });
});
