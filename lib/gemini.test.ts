import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_GEMINI_MODEL,
  GEMINI_TIMEOUT_MS,
  candidateText,
  geminiReadingBody,
  requestGeminiInterpretation,
  thinkingConfigFor,
} from "./gemini";
import { getSpread } from "./spreads";
import { createReading, mulberry32 } from "./shuffle";
import { positionMeaning } from "./summary";
import { requireCard } from "./cards";

describe("gemini", () => {
  it("defaults to gemini-2.5-flash and waits 90 seconds", () => {
    assert.equal(DEFAULT_GEMINI_MODEL, "gemini-2.5-flash");
    assert.equal(GEMINI_TIMEOUT_MS, 90_000);
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
    for (const card of user.cards) {
      assert.deepEqual(Object.keys(card).sort(), ["card", "keywords", "meaning", "orientation", "place", "position"]);
      assert.ok(card.meaning.length > 12);
    }
    const verbose = drawn
      .map((item) => {
        const card = requireCard(item.cardId);
        const orient = item.reversed ? "reversed" : "upright";
        const line = {
          position: spread.positions.find((position) => position.id === item.positionId)!,
          card,
          reversed: item.reversed,
        };
        return (
          card.topics[orient].general.zh +
          card.topics[orient].love.zh +
          card.topics[orient].advice.zh +
          positionMeaning(line, "zh", "love", { status: "partnered", focus: "direction" })
        );
      })
      .join("");
    assert.ok(JSON.stringify(user).length < verbose.length);

    const started = Date.now();
    const result = await requestGeminiInterpretation({
      apiKey: "test-key-not-real",
      model: DEFAULT_GEMINI_MODEL,
      system,
      user,
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
          generationConfig: { thinkingConfig: { thinkingBudget?: number } };
          contents: { parts: { text: string }[] }[];
        };
        assert.equal(body.generationConfig.thinkingConfig.thinkingBudget, 0);
        const sent = body.contents[0]?.parts[0]?.text ?? "";
        assert.match(sent, /已婚或同居/);
        assert.equal(sent.includes("spreadReading"), false);
        assert.ok(init?.signal);
        return Response.json({
          candidates: [
            {
              content: {
                parts: [
                  { text: "你们已经在一起，要看的是关系怎么过。" },
                  { thoughtSignature: "ignored" },
                ],
              },
            },
          ],
        });
      },
    });
    assert.ok(Date.now() - started < GEMINI_TIMEOUT_MS);
    assert.deepEqual(result, { interpretation: "你们已经在一起，要看的是关系怎么过。" });
  });

  it("reports timeout, upstream, and empty without echoing the key", async () => {
    const timeout = await requestGeminiInterpretation({
      apiKey: "secret-value",
      model: DEFAULT_GEMINI_MODEL,
      system: "sys",
      user: { cards: [] },
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
      fetchImpl: async () => new Response("nope", { status: 400 }),
    });
    assert.deepEqual(upstream, { error: "AI_FAILED", reason: "upstream" });
    assert.equal(JSON.stringify(upstream).includes("secret-value"), false);

    const empty = await requestGeminiInterpretation({
      apiKey: "secret-value",
      model: DEFAULT_GEMINI_MODEL,
      system: "sys",
      user: {},
      fetchImpl: async () => Response.json({ candidates: [{ content: { parts: [{ thoughtSignature: "only" }] } }] }),
    });
    assert.deepEqual(empty, { error: "AI_FAILED", reason: "empty" });
  });
});
