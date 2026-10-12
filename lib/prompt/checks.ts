import type { AiReading } from "../ai-reading";

export type ViolationKind = "count" | "banned" | "promise" | "actions";

export type ReadingViolation = {
  kind: ViolationKind;
  field: string;
  phrase: string;
};

const COUNT_PATTERNS: { phrase: string; pattern: RegExp }[] = [
  { phrase: "大牌", pattern: /大牌/ },
  { phrase: "几张", pattern: /几张/ },
  { phrase: "居多", pattern: /居多/ },
  { phrase: "缺席", pattern: /缺席/ },
  { phrase: "云集", pattern: /云集/ },
  { phrase: "元素很重", pattern: /(?:火|水|风|土|权杖|圣杯|宝剑|星币|元素)很重/ },
  { phrase: "在流失", pattern: /在流失/ },
  { phrase: "占了", pattern: /占了/ },
  { phrase: "过半", pattern: /过半/ },
  { phrase: "大阿尔卡纳", pattern: /大阿尔卡纳/ },
];

const BANNED_PHRASES = [
  "托出了日常",
  "托出日常",
  "这副牌",
  "这一组牌",
  "关键词落在",
  "立于不败之地",
  "证实了",
  "仅供娱乐",
  "出轨",
  "铁证",
  "证据",
  "确实指向",
  "真相会显露",
  "列出真实的资源",
];

const PROMISE_PATTERNS: { phrase: string; pattern: RegExp }[] = [
  { phrase: "不会…抛弃", pattern: /不会[^。]{0,12}抛弃/ },
  { phrase: "终究会", pattern: /终究会/ },
  { phrase: "成功是可见的", pattern: /成功是可见的/ },
  { phrase: "钱会到位", pattern: /钱会到位/ },
  { phrase: "一定会", pattern: /一定会/ },
  { phrase: "绝对会", pattern: /绝对会/ },
  { phrase: "注定", pattern: /注定/ },
];

function fieldsOf(reading: AiReading): { field: string; text: string }[] {
  return [
    { field: "overview", text: reading.overview ?? "" },
    ...reading.cards.map((card) => ({ field: `cards.${card.positionId}`, text: card.body })),
    { field: "connection", text: reading.connection },
    { field: "conclusion", text: reading.conclusion },
  ];
}

/** More than one sentence, or a connector that stacks a second action. */
export function conclusionHasManyActions(conclusion: string): boolean {
  const text = conclusion.trim();
  if (!text) return false;
  if (/然后|同时|另外/.test(text)) return true;
  const sentences = text
    .split(/[。！？.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return sentences.length > 1;
}

export function readingViolations(reading: AiReading): ReadingViolation[] {
  const violations: ReadingViolation[] = [];
  for (const { field, text } of fieldsOf(reading)) {
    if (!text) continue;
    for (const item of COUNT_PATTERNS) {
      if (item.pattern.test(text)) violations.push({ kind: "count", field, phrase: item.phrase });
    }
    for (const phrase of BANNED_PHRASES) {
      if (text.includes(phrase)) violations.push({ kind: "banned", field, phrase });
    }
    for (const item of PROMISE_PATTERNS) {
      if (item.pattern.test(text)) violations.push({ kind: "promise", field, phrase: item.phrase });
    }
  }
  if (conclusionHasManyActions(reading.conclusion)) {
    violations.push({ kind: "actions", field: "conclusion", phrase: "多个动作" });
  }
  return violations;
}

export function violationNote(violations: ReadingViolation[]): string {
  const lines = violations.map((item) => `- ${item.field} 含有「${item.phrase}」`);
  return [
    "上一稿没有通过检查。请重写整份 JSON，删掉下面每一处，不要换成近义词。",
    "不要写张数、占比、大牌、几张、居多、缺席、云集、元素很重或在流失。",
    "不要用“这副牌”或“这一组牌”开头，不要写托出了日常。",
    "不要承诺结果，不要写不会抛弃、终究会、成功是可见的、钱会到位。",
    "conclusion 只留一个动作、一句，不要用然后、同时、另外再接第二件。",
    ...lines,
  ].join("\n");
}

/**
 * One repair call when the draft fails a check. A failed or empty regen keeps the draft.
 * Does not walk a model chain and does not start a new timeout.
 */
export async function repairReading(
  reading: AiReading,
  signal: AbortSignal,
  regenerate: (note: string) => Promise<AiReading | null>,
): Promise<AiReading> {
  const violations = readingViolations(reading);
  if (violations.length === 0 || signal.aborted) return reading;
  const revised = await regenerate(violationNote(violations));
  return revised ?? reading;
}
