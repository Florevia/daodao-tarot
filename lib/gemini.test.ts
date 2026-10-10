import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAiReading, readStoredAnswer } from "./ai-reading";
import {
  DEFAULT_GEMINI_MODEL,
  GEMINI_TIMEOUT_MS,
  INTERPRET_HOURLY_LIMIT,
  candidateText,
  geminiReadingBody,
  requestGeminiInterpretation,
  thinkingConfigFor,
} from "./gemini";
import { getSpread } from "./spreads";
import { createReading, mulberry32 } from "./shuffle";

describe("gemini", () => {
  it("defaults to gemini-2.5-flash and waits 90 seconds", () => {
    assert.equal(DEFAULT_GEMINI_MODEL, "gemini-2.5-flash");
    assert.equal(GEMINI_TIMEOUT_MS, 90_000);
    assert.equal(INTERPRET_HOURLY_LIMIT, 30);
    assert.deepEqual(thinkingConfigFor("gemini-2.5-flash"), { thinkingBudget: 0 });
    assert.deepEqual(thinkingConfigFor("gemini-3.8-flash"), { thinkingLevel: "low" });
  });

  it("joins text parts and skips a thoughtSignature-only part", () => {
    const text = candidateText([
      { thought: true, text: "内部推理，不要给问卜者看。" },
      { text: "你们已经在一起。" },
      { thoughtSignature: "sig-without-text" },
      { text: "看的是这段关系怎么过。" },
    ]);
    assert.equal(text, "你们已经在一起。看的是这段关系怎么过。");
  });

  it("completes a love-spread sized request under the timeout", async () => {
    const spread = getSpread("love");
    assert.ok(spread);
    const drawn = createReading(spread, mulberry32(6));
    assert.equal(drawn.length, 6);
    const { system, user } = geminiReadingBody({
      question: "这段婚姻接下来怎么走？",
      spread,
      locale: "zh",
      context: { status: "partnered", focus: "direction" },
      cards: drawn,
    });
    assert.match(system, /简体中文/);
    assert.equal(user.situation, "已婚或同居 · 关系走向");
    assert.equal(user.cards.length, 6);
    assert.match(user.signals, /阿卡纳|逆位/);
    for (const card of user.cards) {
      assert.deepEqual(Object.keys(card).sort(), [
        "advice",
        "card",
        "inPosition",
        "keywords",
        "orientation",
        "place",
        "position",
        "positionId",
        "topicMeaning",
      ]);
      assert.ok(card.topicMeaning.length > 12);
      assert.ok(card.inPosition.length > 12);
      assert.ok(card.advice.length > 8);
    }
    const positions = spread.positions.map((position) => ({ id: position.id, names: [position.name.zh, position.name.en] }));
    const modelJson = JSON.stringify({
      cards: spread.positions.map((position) => ({ positionId: position.name.zh, body: `${position.name.zh}这一张按牌义来读。` })),
      connection: "六张牌把这段婚姻连成一条线。",
      conclusion: "先看关系怎么过，而不是要不要开始约会。",
    });

    const started = Date.now();
    const result = await requestGeminiInterpretation({
      apiKey: "test-key-not-real",
      model: DEFAULT_GEMINI_MODEL,
      system,
      user,
      positions,
      timeoutMs: GEMINI_TIMEOUT_MS,
      fetchImpl: async (url, init) => {
        assert.equal(
          String(url),
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        );
        const headers = new Headers(init?.headers);
        assert.equal(headers.get("x-goog-api-key"), "test-key-not-real");
        assert.equal(url.toString().includes("test-key-not-real"), false);
        const body = JSON.parse(String(init?.body)) as {
          generationConfig: { responseMimeType?: string; thinkingConfig: { thinkingBudget?: number } };
          contents: { parts: { text: string }[] }[];
        };
        assert.equal(body.generationConfig.thinkingConfig.thinkingBudget, 0);
        assert.equal(body.generationConfig.responseMimeType, "application/json");
        const sent = body.contents[0]?.parts[0]?.text ?? "";
        assert.match(sent, /已婚或同居/);
        assert.match(sent, /topicMeaning/);
        assert.match(sent, /inPosition/);
        assert.ok(init?.signal);
        return Response.json({
          candidates: [
            {
              content: {
                parts: [{ text: modelJson }, { thoughtSignature: "ignored" }],
              },
            },
          ],
        });
      },
    });
    assert.ok(Date.now() - started < GEMINI_TIMEOUT_MS);
    assert.ok("reading" in result);
    if ("reading" in result) {
      assert.equal(result.reading.cards.length, 6);
      assert.equal(result.reading.cards[0]?.positionId, "you");
      assert.match(result.reading.conclusion, /开始约会/);
    }
  });

  it("reports timeout, upstream, and empty without echoing the key", async () => {
    const timeout = await requestGeminiInterpretation({
      apiKey: "secret-value",
      model: DEFAULT_GEMINI_MODEL,
      system: "sys",
      user: { cards: [] },
      positions: [{ id: "past", names: ["过去"] }],
      timeoutMs: 40,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          const keepAlive = setTimeout(() => reject(new Error("abort did not fire")), 1000);
          init?.signal?.addEventListener("abort", () => {
            clearTimeout(keepAlive);
            reject(init.signal?.reason);
          });
        }),
    });
    assert.deepEqual(timeout, { error: "AI_FAILED", reason: "timeout" });

    const upstream = await requestGeminiInterpretation({
      apiKey: "secret-value",
      model: DEFAULT_GEMINI_MODEL,
      system: "sys",
      user: {},
      positions: [{ id: "past", names: ["过去"] }],
      fetchImpl: async () => new Response("nope", { status: 400 }),
    });
    assert.deepEqual(upstream, { error: "AI_FAILED", reason: "upstream" });
    assert.equal(JSON.stringify(upstream).includes("secret-value"), false);

    const empty = await requestGeminiInterpretation({
      apiKey: "secret-value",
      model: DEFAULT_GEMINI_MODEL,
      system: "sys",
      user: {},
      positions: [{ id: "past", names: ["过去"] }],
      fetchImpl: async () => Response.json({ candidates: [{ content: { parts: [{ thoughtSignature: "only" }] } }] }),
    });
    assert.deepEqual(empty, { error: "AI_FAILED", reason: "empty" });
  });

  it("keeps a structured answer and still opens an older plain-text reading", () => {
    const positions = [{ id: "past", names: ["过去", "Past"] }];
    const structured = parseAiReading(
      JSON.stringify({ cards: [{ positionId: "过去", body: "过去这一张。" }], connection: "连在一起。", conclusion: "先做一件小事。" }),
      positions,
    );
    assert.equal(structured?.cards[0]?.positionId, "past");
    assert.equal(readStoredAnswer(null, positions).kind, "none");
    assert.equal(readStoredAnswer("以前的一段白话解读。", positions).kind, "prose");
    assert.equal(readStoredAnswer("{not json", positions).kind, "none");
  });
});
