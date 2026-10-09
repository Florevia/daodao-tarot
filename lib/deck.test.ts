import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { cards, getCard } from "./cards/index";
import { buildSummary } from "./summary";
import { createReading, mulberry32, shuffleDeck } from "./shuffle";
import { spreads } from "./spreads";

describe("deck", () => {
  it("contains the full 78-card Rider-Waite deck", () => {
    assert.equal(cards.length, 78);
    assert.equal(new Set(cards.map((card) => card.id)).size, 78);
    assert.equal(cards.filter((card) => card.arcana === "major").length, 22);
    assert.equal(cards.filter((card) => card.arcana === "minor").length, 56);
    for (const suit of ["wands", "cups", "swords", "pentacles"] as const) {
      assert.equal(cards.filter((card) => card.suit === suit).length, 14);
    }
  });

  it("gives every card both languages and an image path", () => {
    for (const card of cards) {
      assert.ok(card.name.zh.length > 0);
      assert.ok(card.name.en.length > 0);
      assert.ok(card.description.zh.length > 0);
      assert.ok(card.description.en.length > 0);
      assert.ok(card.upright.zh.length > 0);
      assert.ok(card.upright.en.length > 0);
      assert.ok(card.reversed.zh.length > 0);
      assert.ok(card.reversed.en.length > 0);
      assert.ok(card.keywords.zh.length >= 3);
      assert.ok(card.keywords.en.length >= 3);
      assert.equal(card.image, `/cards/${card.id}.jpg`);
      assert.ok(existsSync(resolve("public", card.image.slice(1))), card.image);
    }
  });
});

describe("spreads", () => {
  it("ships the five required layouts", () => {
    assert.deepEqual(
      spreads.map((spread) => spread.id),
      ["single", "three", "love", "career", "celtic"],
    );
    assert.equal(spreads.find((spread) => spread.id === "celtic")?.positions.length, 10);
    assert.equal(spreads.find((spread) => spread.id === "love")?.positions.length, 6);
    for (const spread of spreads) {
      const ids = spread.positions.map((position) => position.id);
      assert.equal(new Set(ids).size, ids.length);
      assert.ok(spread.name.zh && spread.name.en);
    }
  });
});

describe("shuffle and summary", () => {
  it("is deterministic for a seed and keeps cards unique", () => {
    const first = createReading(spreads[4]!, mulberry32(42));
    const second = createReading(spreads[4]!, mulberry32(42));
    assert.deepEqual(first, second);
    assert.equal(new Set(first.map((card) => card.cardId)).size, 10);
    assert.equal(shuffleDeck([1, 2, 3, 4], mulberry32(7)).length, 4);
  });

  it("writes a summary that names the question and the cards", () => {
    const drawn = createReading(spreads[1]!, mulberry32(3));
    const summary = buildSummary({
      question: "这段工作还要继续吗",
      spreadId: "three",
      drawn,
      locale: "zh",
    });
    assert.match(summary, /这段工作还要继续吗/);
    assert.match(summary, /过去/);
    assert.match(summary, /现在/);
    assert.match(summary, /未来/);
    const card = getCard(drawn[0]!.cardId);
    assert.ok(card);
    assert.match(summary, new RegExp(card.name.zh));
    const english = buildSummary({
      question: "Should I stay",
      spreadId: "three",
      drawn,
      locale: "en",
    });
    assert.match(english, /Should I stay/);
    assert.match(english, new RegExp(card.name.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});
