import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextPacificMidnight, pacificDayKey } from "./pacific";
import { exhaustedModels } from "./model-quota";

describe("Pacific quota reset", () => {
  it("rolls the day at Pacific midnight in winter and summer", () => {
    const winter = new Date("2026-01-15T07:59:00Z");
    assert.equal(pacificDayKey(winter), "2026-01-14");
    assert.equal(nextPacificMidnight(winter).toISOString(), "2026-01-15T08:00:00.000Z");
    const summer = new Date("2026-07-15T06:59:00Z");
    assert.equal(pacificDayKey(summer), "2026-07-14");
    assert.equal(nextPacificMidnight(summer).toISOString(), "2026-07-15T07:00:00.000Z");
  });

  it("skips only models whose exhaustion has not expired", () => {
    const now = new Date("2026-10-12T18:00:00Z");
    const skipped = exhaustedModels(
      [
        { model: "gemini-3.6-flash", exhaustedUntil: new Date("2026-10-13T07:00:00Z") },
        { model: "gemini-3.8-flash", exhaustedUntil: new Date("2026-10-12T17:00:00Z") },
      ],
      now,
    );
    assert.deepEqual(skipped, ["gemini-3.6-flash"]);
  });
});
