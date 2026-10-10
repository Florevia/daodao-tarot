import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCard } from "./cards/index";
import { examplesForPrompt, readingCases, selectExampleCases } from "./cases";
import { geminiReadingBody } from "./gemini";
import { contextTopic, sanitizeContext } from "./reading-context";
import { getSpread } from "./spreads";
import { createReading, mulberry32 } from "./shuffle";

function sentences(text: string): string[] {
  return text
    .split(/(?<=[。！？])/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function grounded(body: string, cardId: string, reversed: boolean, topic: "general" | "love" | "career" | "resources"): boolean {
  const card = getCard(cardId);
  assert.ok(card);
  const text = card.topics[reversed ? "reversed" : "upright"][topic].zh;
  const parts = sentences(text).filter((part) => part.length >= 12);
  const pool = card.arcana === "minor" && parts.length >= 3 ? parts.slice(1) : parts;
  return pool.some((part) => body.includes(part.slice(0, 12)));
}

describe("reading cases", () => {
  it("validates every case against the deck, spreads, and context", () => {
    assert.equal(readingCases.length, 100);
    const questions = new Set<string>();
    const ids = new Set<string>();
    const majors = new Set<string>();
    const minors = new Set<string>();
    let reversed = 0;
    let total = 0;
    const counts: Record<string, number> = {};
    for (const item of readingCases) {
      assert.equal(ids.has(item.id), false, item.id);
      ids.add(item.id);
      assert.equal(questions.has(item.question), false, item.question);
      questions.add(item.question);
      assert.ok(item.title.length >= 4);
      assert.ok(item.titleEn.length >= 4);
      assert.equal(item.question.includes("仅供娱乐"), false);
      assert.equal(/entertainment/i.test(item.question), false);
      const spread = getSpread(item.spreadId);
      assert.ok(spread, item.spreadId);
      counts[item.spreadId] = (counts[item.spreadId] ?? 0) + 1;
      assert.equal(item.cards.length, spread.positions.length, item.id);
      assert.deepEqual(
        item.cards.map((card) => card.positionId),
        spread.positions.map((position) => position.id),
      );
      assert.deepEqual(sanitizeContext(item.spreadId, item.context), item.context);
      const seen = new Set<string>();
      const topic = contextTopic(item.spreadId, item.context);
      for (const drawn of item.cards) {
        assert.equal(seen.has(drawn.cardId), false, `${item.id} repeats ${drawn.cardId}`);
        seen.add(drawn.cardId);
        const card = getCard(drawn.cardId);
        assert.ok(card, drawn.cardId);
        if (card.arcana === "major") majors.add(card.id);
        else minors.add(card.id);
        total += 1;
        if (drawn.reversed) reversed += 1;
        const count = sentences(drawn.body).length;
        assert.ok(count >= 2 && count <= 4, `${item.id} ${drawn.positionId} has ${count} sentences`);
        assert.ok(drawn.body.includes(card.name.zh), `${item.id} ${drawn.positionId}`);
        assert.equal(grounded(drawn.body, drawn.cardId, drawn.reversed, topic), true, `${item.id} ${drawn.cardId}`);
        assert.equal(drawn.body.includes("仅供娱乐"), false);
        assert.equal(/entertainment/i.test(drawn.body), false);
      }
      assert.ok(sentences(item.connection).length >= 2, item.id);
      assert.ok(item.conclusion.includes("你可以先做的一件事"), item.id);
      assert.equal(item.connection.includes("仅供娱乐") || item.conclusion.includes("仅供娱乐"), false);
      assert.equal(/entertainment/i.test(`${item.connection} ${item.conclusion}`), false);
    }
    assert.deepEqual(counts, { love: 25, career: 25, three: 20, celtic: 15, single: 15 });
    assert.equal(majors.size, 22);
    assert.equal(minors.size, 56);
    const ratio = reversed / total;
    assert.ok(ratio >= 0.3 && ratio <= 0.4, String(ratio));
    const multi = readingCases.filter((item) => item.spreadId === "love" || item.spreadId === "career");
    assert.ok(multi.some((item) => item.cards.filter((card) => card.reversed).length / item.cards.length <= 0.25));
    assert.ok(multi.some((item) => item.cards.filter((card) => card.reversed).length / item.cards.length >= 0.5));
  });

  it("covers every love and career situation, and the three-card and daily lenses", () => {
    const love = readingCases.filter((item) => item.spreadId === "love");
    assert.deepEqual(
      [...new Set(love.map((item) => item.context.status))].sort(),
      ["dating", "partnered", "private", "single", "split", "talking"],
    );
    assert.deepEqual(
      [...new Set(love.map((item) => item.context.focus))].sort(),
      ["continue", "direction", "feelings", "other", "reunion"],
    );
    const career = readingCases.filter((item) => item.spreadId === "career");
    assert.deepEqual(
      [...new Set(career.map((item) => item.context.status))].sort(),
      ["freelance", "other", "seeking", "steady", "student", "switching"],
    );
    assert.deepEqual(
      [...new Set(career.map((item) => item.context.focus))].sort(),
      ["direction", "other", "people", "promotion", "timing"],
    );
    const three = readingCases.filter((item) => item.spreadId === "three");
    assert.deepEqual(
      [...new Set(three.map((item) => item.context.area))].sort(),
      ["career", "general", "health", "love", "money", "people"],
    );
    assert.deepEqual(
      [...new Set(three.map((item) => item.context.mood))].sort(),
      ["anxious", "calm", "hopeful", "lost", "other"],
    );
    const daily = readingCases.filter((item) => item.spreadId === "single");
    assert.deepEqual(
      [...new Set(daily.map((item) => item.context.theme))].sort(),
      ["fortune", "health", "inspiration", "love", "work"],
    );
    const celtic = readingCases.filter((item) => item.spreadId === "celtic");
    assert.ok(new Set(celtic.map((item) => item.context.area)).size >= 5);
  });

  it("prefers the same spread, then the context, then overlapping cards", () => {
    const direction = readingCases.find(
      (item) => item.spreadId === "love" && item.context.status === "single" && item.context.focus === "direction",
    );
    const feelings = readingCases.find(
      (item) => item.spreadId === "love" && item.context.status === "single" && item.context.focus === "feelings",
    );
    assert.ok(direction && feelings);
    const byCards = selectExampleCases(
      {
        spreadId: "love",
        context: { status: "single" },
        cardIds: direction.cards.map((card) => card.cardId),
      },
      3,
    );
    assert.equal(byCards[0]?.id, direction.id);
    assert.ok(byCards.every((item) => item.spreadId === "love"));

    const partnered = selectExampleCases(
      {
        spreadId: "love",
        context: { status: "partnered", focus: "direction" },
        cardIds: feelings.cards.map((card) => card.cardId),
      },
      3,
    );
    assert.equal(partnered[0]?.context.status, "partnered");
    assert.equal(partnered[0]?.context.focus, "direction");
    assert.ok(partnered.every((item) => item.spreadId === "love"));

    const career = selectExampleCases(
      {
        spreadId: "career",
        context: { status: "seeking", focus: "timing" },
        cardIds: feelings.cards.map((card) => card.cardId),
      },
      3,
    );
    assert.ok(career.every((item) => item.spreadId === "career"));
    assert.equal(career[0]?.context.status, "seeking");
    assert.equal(career[0]?.context.focus, "timing");
  });

  it("keeps the few-shot block small even for a ten-card spread", () => {
    const spread = getSpread("celtic");
    assert.ok(spread);
    const { user } = geminiReadingBody({
      question: "好几件事叠在一起。",
      spread,
      locale: "zh",
      context: { area: "general", mood: "anxious" },
      cards: createReading(spread, mulberry32(3)),
    });
    assert.ok(user.examples.items.length >= 2 && user.examples.items.length <= 3);
    assert.ok(user.examples.items.every((item) => item.id.startsWith("celtic-")));
    assert.match(user.examples.label, /不要照抄/);
    const size = JSON.stringify(user.examples).length;
    assert.ok(size < 3800, String(size));
    const trimmed = examplesForPrompt(
      selectExampleCases({ spreadId: "celtic", context: { area: "general", mood: "anxious" }, cardIds: [] }),
    );
    assert.ok(JSON.stringify(trimmed).length < 3800);
  });
});
