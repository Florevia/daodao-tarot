import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { cards } from "../cards/index";
import { cardImagery } from "../cards/imagery";
import { DEFAULT_GEMINI_MODEL, geminiReadingBody, selfReviewTemplate } from "../gemini";
import { getSpread } from "../spreads";
import { promptFiles } from "./bundle.generated";
import { composeReadingPrompt, promptChars, selectGoldReadings, selfReviewEnabled } from "./compose";
import { detectQuestionKind } from "./detect";

const partnered = {
  question: "我们住在一起，话却越来越少。这段关系若继续这样，会往哪里走？",
  spreadId: "love" as const,
  context: { status: "partnered", focus: "direction" },
  cards: [
    { positionId: "you", cardId: "major-06", reversed: true },
    { positionId: "them", cardId: "wands-14", reversed: false },
    { positionId: "bond", cardId: "pentacles-05", reversed: false },
    { positionId: "tension", cardId: "major-18", reversed: true },
    { positionId: "advice", cardId: "swords-07", reversed: false },
    { positionId: "outlook", cardId: "wands-03", reversed: true },
  ],
};

describe("prompt composition", () => {
  it("bundles every authored prompt file", () => {
    for (const [path, text] of Object.entries(promptFiles)) {
      assert.equal(readFileSync(`prompts/${path}`, "utf8"), text, path);
      assert.ok(text.length > 40, path);
    }
    assert.ok(promptFiles["persona.md"].includes("叨叨"));
    assert.equal(Object.keys(cardImagery).length, 78);
    for (const card of cards) assert.ok(cardImagery[card.id], card.id);
  });

  it("always includes the core skills and the spread, then only relevant techniques", () => {
    const spread = getSpread("love");
    assert.ok(spread);
    const composed = composeReadingPrompt({ ...partnered, spread, locale: "zh" });
    assert.match(composed.system, /你是叨叨/);
    assert.match(composed.system, /先看整副/);
    assert.match(composed.system, /关键词落在/);
    assert.match(composed.system, /不想活/);
    assert.match(composed.system, /关系牌阵/);
    assert.match(composed.system, /已婚或同居/);
    assert.ok(composed.skills.includes("skills/techniques/reversals.md"));
    assert.ok(composed.skills.includes("skills/techniques/court-cards.md"));
    assert.ok(composed.skills.includes("skills/techniques/combinations.md"));
    assert.match(composed.system, /宝剑七与月亮/);
    assert.match(composed.system, /彩窗/);
    assert.equal(composed.user.crisis, false);
    assert.ok(composed.user.gold.length >= 1 && composed.user.gold.length <= 2);
    assert.ok(composed.user.examples.items.length >= 1 && composed.user.examples.items.length <= 2);
    assert.equal(composed.user.cards[0]?.positionId, "you");
    assert.match(composed.user.cards[3]?.imagery ?? "", /月亮/);
  });

  it("adds combinations, elements, and the question skill when they apply", () => {
    const spread = getSpread("three");
    assert.ok(spread);
    const composed = composeReadingPrompt({
      question: "我该不该现在把这件事说破？",
      spread,
      locale: "zh",
      context: { area: "love", mood: "anxious" },
      cards: [
        { positionId: "past", cardId: "major-06", reversed: false },
        { positionId: "present", cardId: "major-15", reversed: false },
        { positionId: "future", cardId: "swords-01", reversed: true },
      ],
    });
    assert.equal(detectQuestionKind("我该不该现在把这件事说破？"), "yes-no");
    assert.ok(composed.skills.includes("skills/questions/yes-no.md"));
    assert.ok(composed.skills.includes("skills/techniques/combinations.md"));
    assert.match(composed.system, /恋人与恶魔/);
    assert.ok(composed.skills.includes("skills/topics/love.md"));
  });

  it("treats crisis language as support, not a reading topic", () => {
    const spread = getSpread("three");
    assert.ok(spread);
    const composed = composeReadingPrompt({
      question: "我不想活了。牌能不能告诉我还有没有意义？",
      spread,
      locale: "zh",
      context: { area: "health", mood: "lost" },
      cards: [
        { positionId: "past", cardId: "swords-08", reversed: false },
        { positionId: "present", cardId: "major-13", reversed: false },
        { positionId: "future", cardId: "major-17", reversed: false },
      ],
    });
    assert.equal(composed.user.crisis, true);
    assert.equal(composed.user.questionKind, "crisis");
    assert.match(composed.system, /不要解牌/);
    assert.equal(composed.skills.includes("skills/questions/yes-no.md"), false);
    assert.equal(selfReviewEnabled(), false);
  });

  it("keeps a celtic prompt larger than the old one and still bounded", () => {
    const spread = getSpread("celtic");
    assert.ok(spread);
    const cards = [
      { positionId: "present", cardId: "wands-04", reversed: false },
      { positionId: "challenge", cardId: "swords-06", reversed: false },
      { positionId: "foundation", cardId: "major-03", reversed: false },
      { positionId: "past", cardId: "cups-13", reversed: false },
      { positionId: "crown", cardId: "swords-04", reversed: false },
      { positionId: "future", cardId: "major-18", reversed: true },
      { positionId: "self", cardId: "major-20", reversed: false },
      { positionId: "environment", cardId: "wands-06", reversed: false },
      { positionId: "hopes", cardId: "cups-10", reversed: false },
      { positionId: "outcome", cardId: "swords-13", reversed: true },
    ];
    const input = {
      question: "我们最近不吵了，也不热。",
      spread,
      locale: "zh" as const,
      context: { area: "love", mood: "calm" },
      cards,
    };
    const old = geminiReadingBody(input);
    const composed = composeReadingPrompt(input);
    const oldChars = promptChars(old.system, old.user);
    const newChars = promptChars(composed.system, composed.user);
    assert.ok(newChars > oldChars, `${newChars} vs ${oldChars}`);
    assert.ok(newChars < 36000, String(newChars));
    assert.match(composed.system, /凯尔特十字/);
    assert.ok(selectGoldReadings("celtic", { area: "love" })[0]?.spreadId === "celtic");
    const review = selfReviewTemplate(DEFAULT_GEMINI_MODEL);
    assert.equal(review.model, "gemini-3.6-flash");
    assert.match(JSON.stringify(review.request), /自检/);
    assert.equal(JSON.stringify(review).includes("API_KEY"), false);
  });
});
