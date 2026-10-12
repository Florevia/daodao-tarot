import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AiReading } from "../ai-reading";
import { conclusionHasManyActions, readingViolations, repairReading, violationNote } from "./checks";

function reading(partial: Partial<AiReading> = {}): AiReading {
  return {
    overview: "家里是稳的，船却在离开。",
    cards: [{ positionId: "present", body: "权杖四把桌子摆在门口。" }],
    connection: "交叉的那张把门口挡住了。",
    conclusion: "今晚把想问的那一句写下来。",
    ...partial,
  };
}

describe("reading checks", () => {
  it("accepts a single-action reading without census language", () => {
    assert.deepEqual(readingViolations(reading()), []);
    assert.equal(conclusionHasManyActions("先做一件小事。"), false);
    assert.equal(conclusionHasManyActions("先看关系怎么过，而不是要不要开始约会。"), false);
  });

  it("flags count words, banned openers, and promise phrases", () => {
    const found = readingViolations(
      reading({
        overview: "这副牌里大阿尔卡纳占了一半，逆位居多，土元素很重。",
        cards: [{ positionId: "them", body: "他出轨已有铁证，没有证据，真相会显露，确实指向隐瞒。" }],
        connection: "大牌云集，几张星币缺席，水在流失，托出了日常。",
        conclusion: "钱会到位，他终究会回来，成功是可见的，他不会就这样抛弃你。",
      }),
    );
    const phrases = found.map((item) => `${item.kind}:${item.phrase}`);
    for (const phrase of [
      "count:大牌",
      "count:几张",
      "count:居多",
      "count:缺席",
      "count:云集",
      "count:元素很重",
      "count:在流失",
      "count:占了",
      "count:大阿尔卡纳",
      "banned:这副牌",
      "banned:托出了日常",
      "banned:出轨",
      "banned:铁证",
      "banned:证据",
      "banned:确实指向",
      "banned:真相会显露",
      "promise:不会…抛弃",
      "promise:终究会",
      "promise:成功是可见的",
      "promise:钱会到位",
    ]) {
      assert.ok(phrases.includes(phrase), phrase);
    }
    assert.match(violationNote(found), /overview 含有「这副牌」/);
    assert.match(violationNote(found), /cards\.them 含有「出轨」/);
  });

  it("flags a conclusion with a second action", () => {
    assert.equal(conclusionHasManyActions("先写信。再打电话。"), true);
    assert.equal(conclusionHasManyActions("先把数字写下来，然后约一次十五分钟。"), true);
    assert.equal(conclusionHasManyActions("Write it down. Then send it."), true);
    const found = readingViolations(reading({ conclusion: "今晚问一句，同时把行李收好。" }));
    assert.deepEqual(
      found.filter((item) => item.kind === "actions"),
      [{ kind: "actions", field: "conclusion", phrase: "多个动作" }],
    );
  });

  it("regenerates once with the violations, and keeps the draft if that call fails", async () => {
    const signal = AbortSignal.timeout(1000);
    const notes: string[] = [];
    const fixed = await repairReading(reading({ overview: "这一组牌逆位居多。" }), signal, async (note) => {
      notes.push(note);
      return reading({ overview: "船还在港口。" });
    });
    assert.equal(notes.length, 1);
    assert.match(notes[0] ?? "", /这一组牌/);
    assert.match(notes[0] ?? "", /居多/);
    assert.equal(fixed.overview, "船还在港口。");

    const kept = await repairReading(reading({ connection: "大牌把这件事托出日常。" }), signal, async () => null);
    assert.match(kept.connection, /托出日常/);

    let calls = 0;
    const clean = await repairReading(reading(), signal, async () => {
      calls += 1;
      return null;
    });
    assert.equal(calls, 0);
    assert.equal(clean.conclusion, "今晚把想问的那一句写下来。");
  });
});
