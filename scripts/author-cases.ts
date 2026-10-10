/**
 * Validates data/cases.json. The prose is authored in that file.
 * This script does not generate readings.
 * Run with: npx tsx scripts/author-cases.ts
 */
import assert from "node:assert/strict";
import { readingCases } from "../lib/cases";
import { getCard } from "../lib/cards/index";
import { sanitizeContext } from "../lib/reading-context";
import { getSpread } from "../lib/spreads";

const banned = ["关键词落在", "三角关系", "列出真实的资源", "你可以先做的一件事"];

function sentences(text: string): string[] {
  return text
    .split(/(?<=[。！？])/)
    .map((part) => part.trim())
    .filter(Boolean);
}

assert.equal(readingCases.length, 100);
const ids = new Set<string>();
for (const item of readingCases) {
  assert.equal(ids.has(item.id), false, item.id);
  ids.add(item.id);
  const spread = getSpread(item.spreadId);
  assert.ok(spread, item.spreadId);
  assert.equal(item.cards.length, spread.positions.length, item.id);
  assert.deepEqual(sanitizeContext(item.spreadId, item.context), item.context);
  const seen = new Set<string>();
  for (const drawn of item.cards) {
    assert.equal(seen.has(drawn.cardId), false, `${item.id} ${drawn.cardId}`);
    seen.add(drawn.cardId);
    const card = getCard(drawn.cardId);
    assert.ok(card, drawn.cardId);
    const count = sentences(drawn.body).length;
    assert.ok(count >= 2 && count <= 4, `${item.id} ${drawn.positionId}`);
    assert.ok(drawn.body.includes(card.name.zh), `${item.id} ${card.name.zh}`);
    assert.ok(card.keywords.zh.some((word) => drawn.body.includes(word)), `${item.id} ${drawn.cardId}`);
    assert.equal(banned.some((phrase) => drawn.body.includes(phrase)), false, item.id);
  }
  assert.ok(sentences(item.connection).length >= 2, item.id);
  assert.equal(banned.some((phrase) => `${item.connection}${item.conclusion}`.includes(phrase)), false, item.id);
}

console.log(`Validated ${readingCases.length} authored cases in data/cases.json.`);
