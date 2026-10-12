import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectQuestionKind, isCrisisQuestion } from "./detect";

describe("crisis detection", () => {
  it("catches self-harm phrasing in Chinese and English", () => {
    for (const text of [
      "我想死",
      "最近一直想死",
      "有点轻生的念头",
      "死了算了",
      "活着没意思",
      "我想跳楼",
      "割腕了怎么办",
      "不想醒来",
      "I want to die",
      "I want to end my life",
      "I am ending my life",
      "I might kill myself",
      "this feels like suicide",
    ]) {
      assert.equal(isCrisisQuestion(text), true, text);
      assert.equal(detectQuestionKind(text), "crisis", text);
    }
  });

  it("does not treat missing someone, a sale, or refusing death as a crisis", () => {
    for (const text of [
      "想死你了",
      "这件衣服是跳楼价吗",
      "死神在说什么",
      "I don't want to die",
      "I do not want to die",
      "Will the death card mean an ending?",
    ]) {
      assert.equal(isCrisisQuestion(text), false, text);
    }
  });
});
