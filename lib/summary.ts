import { requireCard, type Card, type Locale } from "./cards";
import { getSpread, type Spread, type SpreadPosition } from "./spreads";
import type { DrawnCard } from "./shuffle";

export type ReadingLine = {
  position: SpreadPosition;
  card: Card;
  reversed: boolean;
};

export function readingLines(spread: Spread, drawn: DrawnCard[]): ReadingLine[] {
  return drawn.map((item) => {
    const position = spread.positions.find((entry) => entry.id === item.positionId);
    if (!position) {
      throw new Error(`Unknown position ${item.positionId} for ${spread.id}`);
    }
    return {
      position,
      card: requireCard(item.cardId),
      reversed: item.reversed,
    };
  });
}

function firstSentence(text: string, locale: Locale): string {
  const parts = text.split(locale === "zh" ? /[。！？]/ : /[.!?]/);
  const sentence = parts[0]?.trim();
  if (!sentence) return text;
  return locale === "zh" ? `${sentence}。` : `${sentence}.`;
}

function meaning(card: Card, reversed: boolean, locale: Locale): string {
  return reversed ? card.reversed[locale] : card.upright[locale];
}

function orientation(reversed: boolean, locale: Locale): string {
  if (locale === "zh") return reversed ? "逆位" : "正位";
  return reversed ? "reversed" : "upright";
}

export function positionMeaning(line: ReadingLine, locale: Locale): string {
  const sense = meaning(line.card, line.reversed, locale);
  if (locale === "zh") {
    return `在「${line.position.name.zh}」这个位置，${orientation(line.reversed, locale)}的${line.card.name.zh}说：${sense}`;
  }
  return `In ${line.position.name.en}, ${line.card.name.en} ${orientation(line.reversed, locale)} says: ${sense}`;
}

export function buildSummary(input: {
  question: string;
  spreadId: string;
  drawn: DrawnCard[];
  locale: Locale;
}): string {
  const spread = getSpread(input.spreadId);
  if (!spread) {
    throw new Error(`Unknown spread: ${input.spreadId}`);
  }
  const lines = readingLines(spread, input.drawn);
  const locale = input.locale;
  const question = input.question.trim();
  const majors = lines.filter((line) => line.card.arcana === "major").length;
  const reversals = lines.filter((line) => line.reversed).length;
  const opener = openerLine(question, spread, locale);
  const body = bodyLines(lines, locale);
  const closing = closingLine(majors, reversals, lines.length, lines[lines.length - 1], locale);
  return [opener, ...body, closing].join("\n\n");
}

function openerLine(question: string, spread: Spread, locale: Locale): string {
  if (locale === "zh") {
    if (question) {
      return `你把问题放在牌面上：「${question}」。叨叨用${spread.name.zh}来看。`;
    }
    return `你没有写下具体问题，于是这组${spread.name.zh}更像一面随手举起的镜子。`;
  }
  if (question) {
    return `You set this question on the cloth: "${question}". Daodao reads it with the ${spread.name.en}.`;
  }
  return `You left the question blank, so this ${spread.name.en} is a mirror held up to the day.`;
}

function bodyLines(lines: ReadingLine[], locale: Locale): string[] {
  if (lines.length <= 3) {
    return [lines.map((line) => brief(line, locale)).join(locale === "zh" ? "" : " ")];
  }
  if (lines.length === 10) {
    return [
      lines.slice(0, 2).map((line) => brief(line, locale)).join(locale === "zh" ? "" : " "),
      lines.slice(2, 6).map((line) => brief(line, locale)).join(locale === "zh" ? "" : " "),
      lines.slice(6).map((line) => brief(line, locale)).join(locale === "zh" ? "" : " "),
    ];
  }
  const midpoint = Math.ceil(lines.length / 2);
  return [
    lines.slice(0, midpoint).map((line) => brief(line, locale)).join(locale === "zh" ? "" : " "),
    lines.slice(midpoint).map((line) => brief(line, locale)).join(locale === "zh" ? "" : " "),
  ];
}

function brief(line: ReadingLine, locale: Locale): string {
  const sentence = firstSentence(meaning(line.card, line.reversed, locale), locale);
  if (locale === "zh") {
    return `${line.position.name.zh}落在${orientation(line.reversed, locale)}的${line.card.name.zh}。${sentence}`;
  }
  return `${line.position.name.en} is ${line.card.name.en}, ${orientation(line.reversed, locale)}. ${sentence}`;
}

function closingLine(
  majors: number,
  reversals: number,
  total: number,
  last: ReadingLine | undefined,
  locale: Locale,
): string {
  const majorNote =
    locale === "zh"
      ? majors >= Math.ceil(total / 2)
        ? "大阿卡纳偏多，说明这件事更像一个人生节点，而不只是一周里的琐事。"
        : majors === 0
          ? "牌面多是小阿卡纳，事情主要发生在日常、关系和可动手的层面。"
          : "大牌与小牌混在一起，既有主题，也有可以落地的细节。"
      : majors >= Math.ceil(total / 2)
        ? "Major Arcana are prominent, so this looks more like a life passage than a weekly errand."
        : majors === 0
          ? "The spread stays in the Minor Arcana, so the matter lives in daily life, relationships, and what you can actually do."
          : "Majors and minors share the table: there is a theme, and there are details you can touch.";
  const reversalNote =
    locale === "zh"
      ? reversals === 0
        ? "没有逆位，能量大体是向外流的。"
        : reversals >= Math.ceil(total / 2)
          ? "逆位较多，先处理阻滞、过度或没说出口的部分，再谈推进。"
          : "有几张逆位，提醒你有些地方需要放慢或转个角度。"
      : reversals === 0
        ? "Nothing is reversed, so the energy is mostly moving outward."
        : reversals >= Math.ceil(total / 2)
          ? "Several reversals ask you to tend the block, the excess, or the unspoken part before pushing ahead."
          : "A few reversals ask for a slower step or a change of angle.";
  const lastNote = last
    ? locale === "zh"
      ? `收在${last.card.name.zh}，可以记住这几个词：${last.card.keywords.zh.join("、")}。`
      : `It closes on ${last.card.name.en}. Keep these words nearby: ${last.card.keywords.en.join(", ")}.`
    : "";
  const disclaimer =
    locale === "zh"
      ? "这些话是整理思绪的同伴，不是必须服从的判决。"
      : "Treat this as company for your thinking, not a verdict you must obey.";
  return [majorNote, reversalNote, lastNote, disclaimer].filter(Boolean).join(locale === "zh" ? "" : " ");
}
