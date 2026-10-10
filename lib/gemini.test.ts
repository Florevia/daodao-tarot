import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAiReading, readStoredAnswer } from "./ai-reading";
import {
  DEFAULT_GEMINI_MODEL,
  GEMINI_TIMEOUT_MS,
  INTERPRET_HOURLY_LIMIT,
  candidateText,
  geminiModelChain,
  geminiReadingBody,
  requestGeminiInterpretation,
  thinkingConfigFor,
} from "./gemini";
import { getSpread } from "./spreads";
import { createReading, mulberry32 } from "./shuffle";

describe("gemini", () => {
  it("defaults to gemini-3.6-flash and waits 90 seconds", () => {
    assert.equal(DEFAULT_GEMINI_MODEL, "gemini-3.6-flash");
    assert.equal(GEMINI_TIMEOUT_MS, 90_000);
    assert.equal(INTERPRET_HOURLY_LIMIT, 30);
    assert.deepEqual(thinkingConfigFor("gemini-2.5-flash"), { thinkingBudget: 0 });
    assert.deepEqual(thinkingConfigFor("gemini-3.6-flash"), { thinkingLevel: "low" });
    assert.deepEqual(thinkingConfigFor("gemini-3.8-flash"), { thinkingLevel: "low" });
    assert.deepEqual(thinkingConfigFor("gemini-flash-latest"), { thinkingLevel: "low" });
    assert.equal(JSON.stringify(thinkingConfigFor("gemini-3.6-flash")).includes("minimal"), false);
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
    assert.match(system, /不要断言医疗、法律、财务或绝对的未来/);
    assert.match(system, /不要出现「仅供娱乐」/);
    assert.doesNotMatch(system, /以仅供娱乐收尾|close with an entertainment/);
    const english = geminiReadingBody({
      question: "How does this marriage continue?",
      spread,
      locale: "en",
      context: { status: "partnered", focus: "direction" },
      cards: drawn,
    });
    assert.match(english.system, /Do not claim medical, legal, financial, or absolute future facts/);
    assert.match(english.system, /do not close with that kind of line/);
    assert.doesNotMatch(english.system, /close with an entertainment and reflection sentence/);
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
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
        );
        const headers = new Headers(init?.headers);
        assert.equal(headers.get("x-goog-api-key"), "test-key-not-real");
        assert.equal(url.toString().includes("test-key-not-real"), false);
        const body = JSON.parse(String(init?.body)) as {
          generationConfig: { responseMimeType?: string; thinkingConfig: { thinkingLevel?: string; thinkingBudget?: number } };
          contents: { parts: { text: string }[] }[];
        };
        assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, "low");
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

  it("walks the model chain when the primary model is unavailable", async () => {
    assert.deepEqual(geminiModelChain("gemini-3.6-flash"), [
      "gemini-3.6-flash",
      "gemini-3.8-flash",
      "gemini-flash-latest",
    ]);
    assert.deepEqual(geminiModelChain("gemini-3.8-flash"), ["gemini-3.8-flash", "gemini-flash-latest"]);
    const positions = [{ id: "past", names: ["过去"] }];
    const calls: string[] = [];
    const levels: string[] = [];
    const result = await requestGeminiInterpretation({
      apiKey: "secret-value",
      model: "gemini-3.6-flash",
      system: "sys",
      user: { question: "love" },
      positions,
      fetchImpl: async (url, init) => {
        const address = String(url);
        calls.push(address);
        const body = JSON.parse(String(init?.body)) as { generationConfig: { thinkingConfig: { thinkingLevel?: string } } };
        levels.push(body.generationConfig.thinkingConfig.thinkingLevel ?? "");
        if (address.includes("gemini-3.6-flash")) {
          return new Response("This model models/gemini-3.6-flash is no longer available", { status: 404 });
        }
        if (address.includes("gemini-3.8-flash")) {
          return new Response("high demand", { status: 503 });
        }
        return Response.json({
          candidates: [{ content: { parts: [{ text: JSON.stringify({
            cards: [{ positionId: "past", body: "过去这一张。" }],
            connection: "连在一起。",
            conclusion: "先做一件小事。",
          }) }] } }],
        });
      },
    });
    assert.deepEqual(calls.map((url) => url.split("/models/")[1]?.split(":")[0]), [
      "gemini-3.6-flash",
      "gemini-3.8-flash",
      "gemini-flash-latest",
    ]);
    assert.deepEqual(levels, ["low", "low", "low"]);
    assert.equal(JSON.stringify(result).includes("secret-value"), false);
    assert.deepEqual(result, {
      reading: {
        cards: [{ positionId: "past", body: "过去这一张。" }],
        connection: "连在一起。",
        conclusion: "先做一件小事。",
      },
    });

    const stopped: string[] = [];
    const modelError = await requestGeminiInterpretation({
      apiKey: "secret-value",
      model: "gemini-2.5-flash",
      system: "sys",
      user: {},
      positions,
      fetchImpl: async (url, init) => {
        stopped.push(String(url));
        const body = JSON.parse(String(init?.body)) as { generationConfig: { thinkingConfig: { thinkingBudget?: number; thinkingLevel?: string } } };
        if (String(url).includes("gemini-2.5-flash")) {
          assert.equal(body.generationConfig.thinkingConfig.thinkingBudget, 0);
          return new Response('{"error":"thinkingLevel MINIMAL is not supported"}', { status: 400 });
        }
        return new Response("rate limited", { status: 429 });
      },
    });
    assert.deepEqual(stopped.map((url) => url.split("/models/")[1]?.split(":")[0]), [
      "gemini-2.5-flash",
      "gemini-3.8-flash",
      "gemini-flash-latest",
    ]);
    assert.deepEqual(modelError, { error: "AI_FAILED", reason: "upstream" });

    let unrelated = 0;
    const plain = await requestGeminiInterpretation({
      apiKey: "secret-value",
      model: "gemini-3.6-flash",
      system: "sys",
      user: {},
      positions,
      fetchImpl: async () => {
        unrelated += 1;
        return new Response("invalid payload", { status: 400 });
      },
    });
    assert.equal(unrelated, 1);
    assert.deepEqual(plain, { error: "AI_FAILED", reason: "upstream" });
  });

  it("does not start the next model after the shared deadline", async () => {
    let calls = 0;
    const result = await requestGeminiInterpretation({
      apiKey: "secret-value",
      model: "gemini-3.6-flash",
      system: "sys",
      user: {},
      positions: [{ id: "past", names: ["过去"] }],
      timeoutMs: 40,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          calls += 1;
          const keepAlive = setTimeout(() => reject(new Error("abort did not fire")), 1000);
          init?.signal?.addEventListener("abort", () => {
            clearTimeout(keepAlive);
            reject(init.signal?.reason);
          });
        }),
    });
    assert.equal(calls, 1);
    assert.deepEqual(result, { error: "AI_FAILED", reason: "timeout" });
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
