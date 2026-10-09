import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { cards, getCard } from "./cards/index";
import { validateDrawnCards } from "./reading-record";
import { buildSummary, spreadTopic } from "./summary";
import { createReading, mulberry32, placePickedCards, prepareDeck, shuffleDeck } from "./shuffle";
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
    const short: string[] = [];
    for (const card of cards) {
      assert.ok(card.name.zh.length > 0);
      assert.ok(card.name.en.length > 0);
      assert.ok(card.description.zh.length > 0);
      assert.ok(card.description.en.length > 0);
      assert.ok(card.upright.zh.length > 0);
      assert.ok(card.upright.en.length > 0);
      assert.ok(card.reversed.zh.length > 0);
      assert.ok(card.reversed.en.length > 0);
      for (const orient of ["upright", "reversed"] as const) {
        for (const key of ["general", "love", "career", "resources", "advice"] as const) {
          const zh = card.topics[orient][key].zh;
          const en = card.topics[orient][key].en;
          if (zh.length < 24 || en.length < 40) {
            short.push(`${card.id} ${orient} ${key} zh=${zh.length} en=${en.length} :: ${zh}`);
          }
        }
        assert.notEqual(card.topics.upright.love.zh, card.topics.reversed.love.zh);
        assert.notEqual(card.topics.upright.advice.en, card.topics.reversed.advice.en);
      }
      assert.ok(card.keywords.zh.length >= 3);
      assert.ok(card.keywords.en.length >= 3);
      assert.equal(card.image, `/cards/${card.id}.jpg`);
      assert.ok(existsSync(resolve("public", card.image.slice(1))), card.image);
    }
    assert.deepEqual(short, []);
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
    const deck = prepareDeck(mulberry32(9));
    assert.equal(deck.length, 78);
    assert.equal(new Set(deck.map((card) => card.cardId)).size, 78);
    assert.deepEqual(deck, prepareDeck(mulberry32(9)));
  });

  it("keeps upright or reversed attached to the card the user picks", () => {
    const deck = prepareDeck(mulberry32(11));
    const spread = spreads.find((item) => item.id === "three")!;
    const picks = [deck[40]!.cardId, deck[2]!.cardId, deck[70]!.cardId];
    const placed = placePickedCards(spread, deck, picks);
    assert.deepEqual(
      placed.map((card) => card.reversed),
      picks.map((id) => deck.find((card) => card.cardId === id)!.reversed),
    );
    assert.deepEqual(placed.map((card) => card.positionId), ["past", "present", "future"]);
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
    assert.match(summary, /主题/);
    assert.match(summary, /牌与牌之间/);
    assert.match(summary, /结语/);
    assert.match(summary, /在这个位置/);
    assert.match(summary, /可以怎么做/);
  });

  it("tailors love and career readings and still opens an older saved shape", () => {
    const drawn = [
      { positionId: "you", cardId: "cups-02", reversed: false },
      { positionId: "them", cardId: "major-15", reversed: true },
      { positionId: "bond", cardId: "major-06", reversed: false },
      { positionId: "tension", cardId: "swords-03", reversed: false },
      { positionId: "advice", cardId: "wands-01", reversed: false },
      { positionId: "outlook", cardId: "pentacles-10", reversed: true },
    ];
    assert.equal(validateDrawnCards("love", drawn), true);
    assert.equal(spreadTopic("love"), "love");
    const love = buildSummary({ question: "还要靠近吗", spreadId: "love", drawn, locale: "zh" });
    assert.match(love, /在这段关系里/);
    assert.match(love, /还要靠近吗/);
    assert.match(love, /恋人与恶魔/);
    const careerDrawn = createReading(spreads.find((item) => item.id === "career")!, mulberry32(8));
    const career = buildSummary({ question: "", spreadId: "career", drawn: careerDrawn, locale: "zh" });
    assert.match(career, /在事业里/);
    assert.match(career, /没有写下具体问题/);
    const legacy = [
      { positionId: "past", cardId: "major-00", reversed: false },
      { positionId: "present", cardId: "major-16", reversed: true },
      { positionId: "future", cardId: "major-13", reversed: false },
    ];
    assert.equal(validateDrawnCards("three", legacy), true);
    const reopened = buildSummary({ question: "旧问题", spreadId: "three", drawn: legacy, locale: "zh" });
    assert.match(reopened, /旧问题/);
    assert.match(reopened, /愚者/);
    assert.match(reopened, /高塔/);
  });
});

describe("theme contrast", () => {
  it("keeps the original night cloth and a parchment day cloth at WCAG AA", () => {
    const css = readFileSync(resolve("app/globals.css"), "utf8");
    const blocks = {
      light: css.slice(css.indexOf(":root {"), css.indexOf(".dark {")),
      dark: css.slice(css.indexOf(".dark {"), css.indexOf("@layer base")),
    };
    const ratio = (a: [number, number, number], b: [number, number, number]) => {
      const lum = ([L, C, H]: [number, number, number]) => {
        const hue = (H * Math.PI) / 180;
        const labA = C * Math.cos(hue);
        const labB = C * Math.sin(hue);
        const l = L + 0.3963377774 * labA + 0.2158037573 * labB;
        const m = L - 0.1055613458 * labA - 0.0638541728 * labB;
        const s = L - 0.0894841775 * labA - 1.291485548 * labB;
        const l3 = l ** 3;
        const m3 = m ** 3;
        const s3 = s ** 3;
        const red = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
        const green = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
        const blue = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
        const clip = (channel: number) => Math.min(1, Math.max(0, channel));
        return 0.2126 * clip(red) + 0.7152 * clip(green) + 0.0722 * clip(blue);
      };
      const left = lum(a);
      const right = lum(b);
      const [hi, lo] = left > right ? [left, right] : [right, left];
      return (hi + 0.05) / (lo + 0.05);
    };
    for (const [name, block] of Object.entries(blocks)) {
      const token = (tokenName: string) => {
        const match = block.match(new RegExp(`${tokenName}:\\s*oklch\\(([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)`));
        assert.ok(match, `${name} ${tokenName}`);
        return [Number(match[1]), Number(match[2]), Number(match[3])] as [number, number, number];
      };
      const background = token("--background");
      const card = token("--card");
      const foreground = token("--foreground");
      const muted = token("--muted-foreground");
      const primary = token("--primary");
      const primaryInk = token("--primary-foreground");
      for (const surface of [background, card]) {
        assert.ok(ratio(foreground, surface) >= 4.5, name);
        assert.ok(ratio(muted, surface) >= 4.5, name);
        assert.ok(ratio(primary, surface) >= 4.5, name);
      }
      assert.ok(ratio(primaryInk, primary) >= 4.5, name);
    }
    const night = blocks.dark;
    assert.match(night, /--background:\s*oklch\(0\.17 0\.03 300\)/);
    assert.match(night, /--primary:\s*oklch\(0\.82 0\.09 85\)/);
    assert.match(night, /--foreground:\s*oklch\(0\.95 0\.02 90\)/);
  });
});
