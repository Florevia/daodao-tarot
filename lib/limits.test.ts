import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  authWindowKey,
  consumeAiQuota,
  consumeAuthAttempt,
  consumeReadingWrite,
  guestKey,
  memoryCounterStore,
} from "./limits";

describe("rate limits", () => {
  it("stops a person at the daily cap and the site at its own cap", async () => {
    const store = memoryCounterStore();
    const limits = { personal: 2, site: 3 };
    assert.equal(await consumeAiQuota(store, "alice", new Date("2026-10-12T12:00:00Z"), limits), "ok");
    assert.equal(await consumeAiQuota(store, "alice", new Date("2026-10-12T12:00:00Z"), limits), "ok");
    assert.equal(await consumeAiQuota(store, "alice", new Date("2026-10-12T12:00:00Z"), limits), "user");
    assert.equal(await consumeAiQuota(store, "bob", new Date("2026-10-12T12:00:00Z"), limits), "ok");
    assert.equal(await consumeAiQuota(store, "cara", new Date("2026-10-12T12:00:00Z"), limits), "site");
    assert.equal(await consumeAiQuota(store, "alice", new Date("2026-10-13T12:00:00Z"), limits), "ok");
  });

  it("limits login and register to 10 attempts per 15 minutes for the IP and the email", async () => {
    const store = memoryCounterStore();
    const now = Date.parse("2026-10-12T03:00:00Z");
    for (let i = 0; i < 10; i += 1) {
      assert.equal(await consumeAuthAttempt(store, "login", "1.1.1.1", "a@example.com", now, 10), true);
    }
    assert.equal(await consumeAuthAttempt(store, "login", "1.1.1.1", "b@example.com", now, 10), false);
    assert.equal(await consumeAuthAttempt(store, "login", "2.2.2.2", "a@example.com", now, 10), false);
    assert.equal(await consumeAuthAttempt(store, "register", "1.1.1.1", "a@example.com", now, 10), true);
    assert.equal(await consumeAuthAttempt(store, "login", "9.9.9.9", "c@example.com", now + 15 * 60 * 1000, 10), true);
    assert.notEqual(authWindowKey(now), authWindowKey(now + 15 * 60 * 1000));
  });

  it("limits reading writes per hour and hashes the guest key", async () => {
    const store = memoryCounterStore();
    const now = Date.parse("2026-10-12T04:00:00Z");
    for (let i = 0; i < 3; i += 1) assert.equal(await consumeReadingWrite(store, "user-1", now, 3), true);
    assert.equal(await consumeReadingWrite(store, "user-1", now, 3), false);
    assert.equal(await consumeReadingWrite(store, "user-1", now + 60 * 60 * 1000, 3), true);
    const key = guestKey("203.0.113.4", "device-1");
    assert.equal(key.length, 32);
    assert.equal(key.includes("203.0.113.4"), false);
    assert.equal(guestKey("203.0.113.4", "device-1"), key);
    assert.notEqual(guestKey("203.0.113.5", "device-1"), key);
  });
});
