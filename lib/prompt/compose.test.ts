import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { cards, getCard } from "../cards/index";
import { cardImagery } from "../cards/imagery";
import { readingCases } from "../cases";
import { DEFAULT_GEMINI_MODEL, geminiReadingBody, selfReviewTemplate } from "../gemini";
import { getSpread } from "../spreads";
import { promptFiles } from "./bundle.generated";
import { buildCrisisReading } from "./crisis";
import { composeReadingPrompt, promptChars, selectGoldReadings, selfReviewEnabled } from "./compose";
import { detectQuestionKind, drawsOverlap } from "./detect";

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
    assert.equal("inPosition" in composed.user.cards[0], false);
    assert.equal(JSON.stringify(composed.user).includes("在这里的读法是"), false);
    assert.equal(JSON.stringify(composed.user).includes("这件事主要在"), false);
    assert.equal(composed.user.signals.cards, 6);
    assert.equal(composed.user.signals.reversed, 3);
    assert.equal(JSON.stringify(composed.user.signals).includes("过半"), false);
    assert.match(composed.system, /不要写出张数/);
    assert.match(composed.system, /立于不败之地/);
    assert.equal(composed.user.gold.some((item) => item.id === "gold-third"), false);
    for (const item of composed.user.examples.items) {
      const source = readingCases.find((entry) => entry.id === item.id);
      assert.ok(source);
      assert.equal(
        drawsOverlap(
          source.cards.map((card) => card.cardId),
          partnered.cards.map((card) => card.cardId),
        ),
        false,
        item.id,
      );
    }
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
    const reviewText = JSON.stringify(review.request);
    assert.match(reviewText, /自检/);
    assert.match(reviewText, /<<QUESTION>>/);
    assert.match(reviewText, /<<SITUATION>>/);
    assert.match(reviewText, /<<KNOWLEDGE_BASE_MEANING>>/);
    assert.match(reviewText, /12356/);
    assert.match(reviewText, /crisis/);
    assert.match(reviewText, /<<POSITION_ASKS>>/);
    assert.equal(reviewText.includes("API_KEY"), false);
    assert.equal(composed.user.gold.some((item) => item.id === "gold-celtic-quiet"), false);
  });

  it("does not treat a specific question that contains 说不清 as vague", () => {
    assert.equal(detectQuestionKind("说不清是能力、环境还是自己的态度"), null);
    assert.equal(
      detectQuestionKind("事业上我站不稳，说不清是能力、环境还是自己的态度。请从根基看到可能的结果。"),
      null,
    );
    assert.equal(detectQuestionKind("就那样吧。"), "vague");
    assert.equal(detectQuestionKind("说不清"), "vague");
    assert.equal(detectQuestionKind("随便看看"), "vague");
    assert.equal(detectQuestionKind("（没有写下具体问题）"), "vague");
    assert.equal(detectQuestionKind(""), "vague");
  });

  it("drops a reference that repeats the draw, and keeps vague readings on general meanings", () => {
    const spread = getSpread("three");
    assert.ok(spread);
    const copied = composeReadingPrompt({
      question: "我总怕这段感情会突然没了。过去、现在和若我继续追问，分别是什么？",
      spread,
      locale: "zh",
      context: { area: "love", mood: "anxious" },
      cards: [
        { positionId: "past", cardId: "major-16", reversed: false },
        { positionId: "present", cardId: "wands-07", reversed: false },
        { positionId: "future", cardId: "cups-04", reversed: false },
      ],
    });
    assert.equal(copied.user.gold.some((item) => item.id === "gold-three-anxious"), false);
    const daily = getSpread("single");
    assert.ok(daily);
    const sameCard = composeReadingPrompt({
      question: "今天出门前该留意什么？",
      spread: daily,
      locale: "zh",
      context: { theme: "fortune" },
      cards: [{ positionId: "guidance", cardId: "cups-01", reversed: false }],
    });
    assert.equal(sameCard.user.gold.some((item) => item.id === "gold-daily-cup"), false);

    const vague = composeReadingPrompt({
      question: "就那样吧。",
      spread,
      locale: "zh",
      context: { area: "love", mood: "calm" },
      cards: [
        { positionId: "past", cardId: "cups-01", reversed: false },
        { positionId: "present", cardId: "wands-05", reversed: false },
        { positionId: "future", cardId: "pentacles-02", reversed: true },
      ],
    });
    assert.equal(vague.user.questionKind, "vague");
    assert.equal(vague.skills.includes("skills/topics/love.md"), false);
    assert.ok(vague.skills.includes("skills/questions/vague.md"));
    assert.match(vague.system, /冲动消费/);
    const ace = getCard("cups-01");
    assert.ok(ace);
    assert.equal(vague.user.cards[0]?.topicMeaning, ace.topics.upright.general.zh);
    assert.notEqual(vague.user.cards[0]?.topicMeaning, ace.topics.upright.love.zh);
  });

  it("answers a crisis without naming the cards", () => {
    const spread = getSpread("three");
    assert.ok(spread);
    const reading = buildCrisisReading(spread.positions, "zh");
    const text = JSON.stringify(reading);
    assert.match(text, /12356/);
    assert.match(text, /110/);
    assert.match(text, /120/);
    assert.match(text, /信任/);
    assert.doesNotMatch(text, /死神|高塔|恶魔|整理告别|宝剑/);
    assert.equal(reading.cards.map((card) => card.positionId).join(","), "past,present,future");
    const english = buildCrisisReading(spread.positions, "en");
    assert.match(JSON.stringify(english), /12356/);
    assert.doesNotMatch(JSON.stringify(english), /Death|Tower/);
  });
});
