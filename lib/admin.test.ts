import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAdminEmail } from "./admin";
import { quoteUsage } from "./model-prices";

describe("admin access", () => {
  it("allows only emails listed in ADMIN_EMAILS", () => {
    const list = " Owner@Example.com , second@example.com ";
    assert.equal(isAdminEmail("owner@example.com", list), true);
    assert.equal(isAdminEmail("SECOND@example.com", list), true);
    assert.equal(isAdminEmail("guest@example.com", list), false);
    assert.equal(isAdminEmail(null, list), false);
    assert.equal(isAdminEmail("owner@example.com", ""), false);
  });

  it("bills free-tier Gemini at zero and still records the paid price", () => {
    const previous = process.env.GEMINI_FREE_TIER;
    delete process.env.GEMINI_FREE_TIER;
    const quote = quoteUsage("gemini", "gemini-3.6-flash", { inputTokens: 1_000_000, outputTokens: 1_000_000, totalTokens: 2_000_000 });
    assert.equal(quote.freeTier, true);
    assert.equal(quote.costUsd, 0);
    assert.equal(quote.wouldCostUsd, 0.75);
    process.env.GEMINI_FREE_TIER = "0";
    const paid = quoteUsage("gemini", "gemini-3.6-flash", { inputTokens: 1_000_000, outputTokens: 0, totalTokens: 1_000_000 });
    assert.equal(paid.freeTier, false);
    assert.equal(paid.costUsd, 0.15);
    if (previous === undefined) delete process.env.GEMINI_FREE_TIER;
    else process.env.GEMINI_FREE_TIER = previous;
  });
});
