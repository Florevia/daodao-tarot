/**
 * Writes the Gemini generateContent bodies for the fixed eval set.
 * No API key and no request URL are included.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_GEMINI_MODEL,
  generateContentRequest,
  geminiReadingBody,
  legacyResponseSchema,
  selfReviewTemplate,
} from "../lib/gemini";
import { composeReadingPrompt, promptChars } from "../lib/prompt/compose";
import { buildCrisisReading } from "../lib/prompt/crisis";
import { detectQuestionKind } from "../lib/prompt/detect";
import type { ReadingContext } from "../lib/reading-context";
import { getSpread } from "../lib/spreads";
import type { DrawnCard } from "../lib/shuffle";

type EvalCase = {
  id: string;
  question: string;
  spreadId: string;
  locale: "zh" | "en";
  context: ReadingContext;
  cards: DrawnCard[];
};

const cases = JSON.parse(readFileSync(join(process.cwd(), "evals/cases.json"), "utf8")) as EvalCase[];
const dir = join(process.cwd(), "evals/requests");
mkdirSync(dir, { recursive: true });

const sizes: {
  model: string;
  cases: { id: string; oldChars: number; newChars: number; skills: string[] }[];
} = { model: DEFAULT_GEMINI_MODEL, cases: [] };

for (const item of cases) {
  const spread = getSpread(item.spreadId);
  if (!spread) throw new Error(`Unknown spread ${item.spreadId}`);
  const old = geminiReadingBody({
    question: item.question,
    spread,
    locale: item.locale,
    context: item.context,
    cards: item.cards,
  });
  const oldRequest = generateContentRequest({
    model: DEFAULT_GEMINI_MODEL,
    system: old.system,
    user: old.user,
    schema: legacyResponseSchema,
  });
  const composed = composeReadingPrompt({
    question: item.question,
    spread,
    locale: item.locale,
    context: item.context,
    cards: item.cards,
  });
  writeFileSync(join(dir, `${item.id}.old.json`), `${JSON.stringify(oldRequest, null, 2)}\n`);
  if (detectQuestionKind(item.question) === "crisis") {
    const skipped = {
      model: DEFAULT_GEMINI_MODEL,
      skipped: "server-crisis-response",
      reason: "The route returns this reading and does not call Gemini.",
      response: { reading: buildCrisisReading(spread.positions, item.locale) },
    };
    writeFileSync(join(dir, `${item.id}.new.json`), `${JSON.stringify(skipped, null, 2)}\n`);
    sizes.cases.push({
      id: item.id,
      oldChars: promptChars(old.system, old.user),
      newChars: 0,
      skills: ["server-crisis-response"],
    });
    continue;
  }
  const newRequest = generateContentRequest({
    model: DEFAULT_GEMINI_MODEL,
    system: composed.system,
    user: composed.user,
  });
  writeFileSync(join(dir, `${item.id}.new.json`), `${JSON.stringify(newRequest, null, 2)}\n`);
  sizes.cases.push({
    id: item.id,
    oldChars: promptChars(old.system, old.user),
    newChars: promptChars(composed.system, composed.user),
    skills: composed.skills,
  });
}

writeFileSync(join(dir, "self-review-template.json"), `${JSON.stringify(selfReviewTemplate(DEFAULT_GEMINI_MODEL), null, 2)}\n`);
writeFileSync(join(process.cwd(), "evals/sizes.json"), `${JSON.stringify(sizes, null, 2)}\n`);

const called = sizes.cases.filter((item) => item.newChars > 0);
const oldAvg = Math.round(sizes.cases.reduce((sum, item) => sum + item.oldChars, 0) / sizes.cases.length);
const newAvg = Math.round(called.reduce((sum, item) => sum + item.newChars, 0) / called.length);
console.log(
  `Exported ${sizes.cases.length} eval requests. model=${DEFAULT_GEMINI_MODEL} oldAvg=${oldAvg} newAvg=${newAvg} (crisis cases are not sent)`,
);
