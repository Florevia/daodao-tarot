import { requireCard, type Card, type Locale, type TopicKey } from "./cards";
import { contextClosing, contextPositionLead, contextTopic, type ReadingContext } from "./reading-context";
import { getSpread, type Spread, type SpreadPosition } from "./spreads";
import type { DrawnCard } from "./shuffle";

export type ReadingLine = {
  position: SpreadPosition;
  card: Card;
  reversed: boolean;
};

export type ReadingBlock = {
  id: string;
  heading: string;
  body: string;
};

export type CardChapter = {
  positionId: string;
  positionName: string;
  cardName: string;
  orientation: string;
  reversed: boolean;
  keywords: string[];
  blocks: ReadingBlock[];
};

export type BuiltReading = {
  synthesis: ReadingBlock[];
  chapters: CardChapter[];
  text: string;
};

export function readingLines(spread: Spread, drawn: DrawnCard[]): ReadingLine[] {
  return spread.positions.map((position) => {
    const item = drawn.find((entry) => entry.positionId === position.id);
    if (!item) {
      throw new Error(`Missing position ${position.id} for ${spread.id}`);
    }
    return {
      position,
      card: requireCard(item.cardId),
      reversed: item.reversed,
    };
  });
}

function meaning(card: Card, reversed: boolean, locale: Locale): string {
  return reversed ? card.reversed[locale] : card.upright[locale];
}

function otherMeaning(card: Card, reversed: boolean, locale: Locale): string {
  return reversed ? card.upright[locale] : card.reversed[locale];
}

export function orientation(reversed: boolean, locale: Locale): string {
  if (locale === "zh") return reversed ? "逆位" : "正位";
  return reversed ? "reversed" : "upright";
}

function firstSentence(text: string, locale: Locale): string {
  const parts = text.split(locale === "zh" ? /[。！？]/ : /[.!?]/);
  const sentence = parts[0]?.trim();
  if (!sentence) return text;
  return locale === "zh" ? `${sentence}。` : `${sentence}.`;
}

export function spreadTopic(spreadId: string): Exclude<TopicKey, "general" | "advice"> {
  if (spreadId === "love") return "love";
  if (spreadId === "career") return "career";
  return "resources";
}

function lensHeading(spreadId: string, locale: Locale, topic: Exclude<TopicKey, "advice">): string {
  if (locale === "zh") {
    if (topic === "love") return spreadId === "love" ? "在这段关系里" : "在感情里";
    if (topic === "career") return spreadId === "career" ? "在事业里" : "在事业学业里";
    if (topic === "general") return "落到这件事上";
    if (spreadId === "single") return "身心与今日的成长";
    return "落到生活里";
  }
  if (topic === "love") return spreadId === "love" ? "In this relationship" : "In love";
  if (topic === "career") return spreadId === "career" ? "In the work" : "In work or study";
  if (topic === "general") return "On this matter";
  if (spreadId === "single") return "Body, money, and today's growth";
  return "In ordinary life";
}

const positionFrame: Record<string, Record<string, { zh: string; en: string }>> = {
  single: {
    guidance: {
      zh: "今日只看这一张，它概括此刻最想被你看见的事，不必展开整个人生。",
      en: "Today holds only this card. It names what most wants to be seen, without opening an entire life.",
    },
  },
  three: {
    past: {
      zh: "「过去」收的是仍在起作用的旧力，不是一份流水账。先看它如何训练了你现在的反应。",
      en: "The past holds an old force that is still working, not a chronicle. See first how it trained the way you react now.",
    },
    present: {
      zh: "「现在」是你正站着的位置。先承认这个天气，再决定要不要换一种站法。",
      en: "The present is the place where you are standing. Admit this weather before you decide whether to stand differently.",
    },
    future: {
      zh: "「未来」不是判决，而是沿着当前做法正在显影的方向。你转弯，这张画面也会改。",
      en: "The future is not a verdict. It is the direction developing if the current way continues. Turn, and this picture changes.",
    },
  },
  love: {
    you: {
      zh: "这一张讲你带进关系里的心情与需要，不是对方的错。先把自己说清楚。",
      en: "This card is the mood and need you bring, not the other person's fault. Say your side clearly first.",
    },
    them: {
      zh: "这一张是对方此刻可能的情感位置，用来理解，不用来宣判。",
      en: "This card is the emotional place the other person may be in. Use it to understand, not to sentence them.",
    },
    bond: {
      zh: "「连接」看的是你们之间真实存在的那根线，不是你单方面希望它是的样子。",
      en: "The bond is the thread that actually exists between you, not the one you wish were there.",
    },
    tension: {
      zh: "张力是让关系发紧的地方。发紧不一定是结束，它常常是该被命名的那一处。",
      en: "Tension is where the relationship pulls tight. Tightness is not always an ending. It is often the place that needs a name.",
    },
    advice: {
      zh: "建议位不评谁对谁错，它给一个这周用得上的态度或动作。",
      en: "The advice position does not score who is right. It offers an attitude or a move you can use this week.",
    },
    outlook: {
      zh: "走向的前提是：若维持现在的方式。你若采纳建议，这条路可以改写。",
      en: "The outlook assumes the current way continues. If you take the advice, this road can be rewritten.",
    },
  },
  career: {
    now: {
      zh: "这是工作表面的天气。先描述事实，再谈去留。",
      en: "This is the visible weather of the work. Describe the facts before you discuss staying or leaving.",
    },
    hidden: {
      zh: "隐藏因素还没被说清，却已经在影响局面。把它说出来，盲区就会少一块。",
      en: "The hidden factor is unnamed and already shaping things. Say it, and one blind spot shrinks.",
    },
    strength: {
      zh: "这是你已经拥有的资源，不是你还缺的自己。下一步要用它。",
      en: "This is a resource you already have, not a self you still lack. The next step is to use it.",
    },
    block: {
      zh: "障碍是让进展变慢的具体阻力。先处理这一处，比同时改造整份工作更有效。",
      en: "The obstacle is the concrete drag. Handling this one place works better than remaking the whole job at once.",
    },
    counsel: {
      zh: "建议是方向，不是保证。把它收成一个可以放进日历的行动。",
      en: "The counsel is a direction, not a guarantee. Turn it into an action that can go on a calendar.",
    },
  },
  celtic: {
    present: {
      zh: "现状是问题的中心。其他牌都绕着这一张转，先把它看稳。",
      en: "The present is the center of the question. The other cards turn around this one, so see it steadily first.",
    },
    challenge: {
      zh: "交叉牌横在现状上，它既可能是阻力，也可能是推你一下的力。不要把它当成敌人的名字，先看成正在作用的力。",
      en: "The crossing card lies over the present. It may block or it may push. Do not name it as an enemy yet. See it as a force at work.",
    },
    foundation: {
      zh: "根基是事情站立的地面，往往比表面上的理由更老。",
      en: "The foundation is the ground the matter stands on, often older than the reason you tell on the surface.",
    },
    past: {
      zh: "近期过去是刚刚离开、仍牵着你袖子的一段。",
      en: "The recent past has just left and is still holding your sleeve.",
    },
    crown: {
      zh: "可能之位是意识里的目标，或这件事最好的可见样子。它是方向，不是已经到手的结果。",
      en: "The crown is the aim in mind, or the best visible shape of the matter. It is a direction, not a result already in hand.",
    },
    future: {
      zh: "近期未来是若不转向、很快会到来的发展。",
      en: "The near future is what arrives soon if you do not turn.",
    },
    self: {
      zh: "这一张是你自己如何面对这件事，包括你还不想承认的态度。",
      en: "This card is how you yourself are meeting the matter, including the attitude you would rather not admit.",
    },
    environment: {
      zh: "环境是周围的人、场所和气氛。有些压力并不在你一个人身上。",
      en: "The environment is the people, place, and atmosphere. Some of the pressure is not yours alone.",
    },
    hopes: {
      zh: "希望与恐惧常常是同一件事的两面。看你又盼又怕的到底是什么。",
      en: "Hope and fear are often two faces of one thing. See what you both want and dread.",
    },
    outcome: {
      zh: "结果是各张牌的力量继续作用时，事情会落在哪里。它仍会随你的下一步改变。",
      en: "The outcome is where the matter lands if these forces keep working. It still changes with your next step.",
    },
  },
};

export function positionMeaning(line: ReadingLine, locale: Locale, spreadId = "", context?: ReadingContext | null): string {
  const orient = orientation(line.reversed, locale);
  const name = line.card.name[locale];
  const sense = meaning(line.card, line.reversed, locale);
  const frame = positionFrame[spreadId]?.[line.position.id];
  const situation = contextPositionLead(spreadId, context, locale);
  if (locale === "zh") {
    const lead = frame?.zh ?? `在「${line.position.name.zh}」这个位置，`;
    return `${situation}${lead}${line.position.description.zh} ${orient}的${name}在这里的读法是：${sense}`;
  }
  const lead = frame?.en ?? `In ${line.position.name.en},`;
  const prefix = situation ? `${situation} ` : "";
  return `${prefix}${lead} ${line.position.description.en} ${name}, ${orient}, reads here as: ${sense}`;
}

function coreBlock(line: ReadingLine, locale: Locale): string {
  const words = line.card.keywords[locale].join(locale === "zh" ? "、" : ", ");
  if (locale === "zh") {
    return `${line.card.description.zh} 这张牌的核心围绕着${words}。`;
  }
  return `${line.card.description.en} Its core turns on ${words}.`;
}

function orientationBlock(line: ReadingLine, locale: Locale): string {
  const main = meaning(line.card, line.reversed, locale);
  const other = firstSentence(otherMeaning(line.card, line.reversed, locale), locale);
  if (locale === "zh") {
    const otherName = line.reversed ? "正位" : "逆位";
    return `${main} 若是另一面，${otherName}会更强调：${other}`;
  }
  const otherName = line.reversed ? "Upright" : "Reversed";
  return `${main} The other face, ${otherName.toLowerCase()}, would emphasize this instead: ${other}`;
}

function adviceBlock(line: ReadingLine, locale: Locale): string {
  const orient = line.reversed ? "reversed" : "upright";
  return line.card.topics[orient].advice[locale];
}

function lensBlock(line: ReadingLine, spreadId: string, locale: Locale, context?: ReadingContext | null): string {
  const orient = line.reversed ? "reversed" : "upright";
  const key = contextTopic(spreadId, context);
  return line.card.topics[orient][key][locale];
}

const elementCopy = {
  fire: {
    zh: "火（权杖）更突出时，事情靠意愿、行动和热度推动。先做一个具体动作，再谈感受是否跟上。",
    en: "When fire (Wands) leads, the matter moves by will, action, and heat. Do one concrete thing before you ask whether the feeling has caught up.",
  },
  water: {
    zh: "水（圣杯）更突出时，感受、关系和直觉比计划更响。先承认情绪，再做决定。",
    en: "When water (Cups) leads, feeling, relationship, and intuition are louder than the plan. Admit the emotion, then decide.",
  },
  air: {
    zh: "风（宝剑）更突出时，思想、谈话和真相在起决定作用。把话讲清楚，也留意语言会不会变成刀。",
    en: "When air (Swords) leads, thought, conversation, and truth decide the matter. Say it clearly, and watch whether language becomes a blade.",
  },
  earth: {
    zh: "土（星币）更突出时，身体、金钱、技能和日常步骤是主场。答案多半在一件可以安排的实事里。",
    en: "When earth (Pentacles) leads, the body, money, skill, and ordinary steps are the field. The answer is usually in one practical thing you can schedule.",
  },
} as const;

const pairNotes: { ids: [string, string]; zh: string; en: string }[] = [
  {
    ids: ["major-13", "major-16"],
    zh: "死神与高塔同时出现：旧结构正在被拆掉，而且拆得不温柔。先确认你要保住的核心，再允许形式改变。",
    en: "Death and the Tower are both here: an old structure is coming apart, and not gently. Name what you mean to keep, then let the form change.",
  },
  {
    ids: ["major-06", "major-15"],
    zh: "恋人与恶魔一起出现，吸引和束缚靠得很近。问这份靠近是选择，还是舍不得离开的惯性。",
    en: "The Lovers and the Devil arrive together, so attraction and bondage sit close. Ask whether this closeness is a choice or the habit of not leaving.",
  },
  {
    ids: ["major-18", "major-17"],
    zh: "月亮与星星同时在场：雾还在，远处已经有一盏诚实的光。先命名恐惧，再走很小的一步。",
    en: "The Moon and the Star are both present: the fog remains, and an honest light is already far off. Name the fear, then take a very small step.",
  },
  {
    ids: ["major-00", "major-21"],
    zh: "愚者与世界叠在一起，一个周期的开头和结尾同时出现。适合收束旧事，同时允许新的出发。",
    en: "The Fool and the World overlap, a beginning and an ending of a cycle at once. Close the old matter and allow the new departure.",
  },
  {
    ids: ["major-16", "major-19"],
    zh: "高塔与太阳一起出现，震动之后有光。别急着把塔建成原来的样子，先站到更坦白的地方。",
    en: "The Tower and the Sun together mean light after the shake. Do not rebuild the tower as it was. Stand first in a more honest place.",
  },
  {
    ids: ["major-02", "major-18"],
    zh: "女祭司与月亮同时出现，直觉和迷雾叠在一起。把“我感觉到”和“我还不知道”分开写，避免把不安当成神谕。",
    en: "The High Priestess and the Moon together stack intuition on fog. Write “I sense” apart from “I do not know yet,” so unease is not treated as an oracle.",
  },
];

function themeBlock(lines: ReadingLine[], locale: Locale): string {
  const total = lines.length;
  const majors = lines.filter((line) => line.card.arcana === "major").length;
  const minors = total - majors;
  const reversals = lines.filter((line) => line.reversed).length;
  const suitCount = new Map<string, number>();
  for (const line of lines) {
    if (!line.card.suit) continue;
    suitCount.set(line.card.suit, (suitCount.get(line.card.suit) ?? 0) + 1);
  }
  const ranked = [...suitCount.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked.filter((entry) => entry[1] === ranked[0]?.[1]);
  const elementOf = { wands: "fire", cups: "water", swords: "air", pentacles: "earth" } as const;
  const suitName = {
    zh: { wands: "权杖", cups: "圣杯", swords: "宝剑", pentacles: "星币" },
    en: { wands: "Wands", cups: "Cups", swords: "Swords", pentacles: "Pentacles" },
  };

  const majorNote =
    locale === "zh"
      ? majors === 0
        ? `这一组 ${total} 张都是小阿卡纳。事情主要发生在日常、关系和你可以动手的层面。`
        : minors === 0
          ? `这一组 ${total} 张都是大阿卡纳。它更像一个人生节点，而不只是一周里的琐事。`
          : majors >= Math.ceil(total / 2)
            ? `${total} 张里有 ${majors} 张大阿卡纳、${minors} 张小阿卡纳。大牌偏多，主题大于琐事，但仍有可以落地的细节。`
            : `${total} 张里有 ${majors} 张大阿卡纳、${minors} 张小阿卡纳。大牌点出主题，小牌负责告诉你手能做什么。`
      : majors === 0
        ? `All ${total} cards are Minor Arcana. The matter lives in daily life, relationships, and what you can actually do.`
        : minors === 0
          ? `All ${total} cards are Major Arcana. This looks like a life passage, not an errand for the week.`
          : majors >= Math.ceil(total / 2)
            ? `${majors} of ${total} are Major Arcana and ${minors} are minor. The majors are prominent, so the theme is larger than a chore, and the minors still offer a detail you can touch.`
            : `${majors} of ${total} are Major Arcana and ${minors} are minor. The majors name the theme. The minors say what your hands can do.`;

  let suitNote = "";
  if (ranked.length === 0) {
    suitNote =
      locale === "zh"
        ? "没有小阿卡纳，元素的日常天气让位给大牌的主题。"
        : "With no Minor Arcana, the everyday weather of the elements gives way to the major theme.";
  } else if (top.length > 1) {
    const names = top.map((entry) => suitName[locale][entry[0] as keyof typeof suitName.zh]).join(locale === "zh" ? "与" : " and ");
    suitNote =
      locale === "zh"
        ? `小牌里 ${names} 一样多，没有单一元素压过别人。事情同时要两种语言。`
        : `${names} tie among the minor cards, so no single element rules. The matter needs both languages.`;
  } else if (top[0]) {
    const suit = top[0][0] as keyof typeof elementOf;
    const element = elementOf[suit];
    suitNote =
      locale === "zh"
        ? `小牌里${suitName.zh[suit]}最多（${top[0][1]} 张）。${elementCopy[element].zh}`
        : `${suitName.en[suit]} leads the minor cards (${top[0][1]}). ${elementCopy[element].en}`;
  }

  const reversalNote =
    locale === "zh"
      ? reversals === 0
        ? "没有逆位，能量大体向外、向前。"
        : `有 ${reversals} 张逆位。${reversals >= Math.ceil(total / 2) ? "逆位过半，先处理阻滞、过度或没说出口的部分，再谈推进。" : "逆位不多，提醒你有些地方要放慢或转个角度。"}`
      : reversals === 0
        ? "Nothing is reversed, so the energy mostly moves outward and forward."
        : `${reversals} card${reversals === 1 ? " is" : "s are"} reversed. ${reversals >= Math.ceil(total / 2) ? "Reversals are the majority: tend the block, the excess, or the unspoken part before you push." : "The reversals are few. They ask for a slower step or a change of angle."}`;

  const ids = new Set(lines.map((line) => line.card.id));
  const pairs = pairNotes.filter((pair) => pair.ids.every((id) => ids.has(id))).map((pair) => pair[locale]);
  const aces = lines.filter((line) => line.card.rank === "ace").length;
  const courts = lines.filter((line) => line.card.rank === "page" || line.card.rank === "knight" || line.card.rank === "queen" || line.card.rank === "king").length;
  const extras: string[] = [...pairs];
  if (aces >= 2) {
    extras.push(
      locale === "zh"
        ? `有 ${aces} 张王牌，多个开端同时亮着。选一个种子先种，其余的先别浇。`
        : `${aces} Aces are lit at once. Plant one seed first and do not water the others yet.`,
    );
  }
  if (courts >= 3 || (total <= 3 && courts >= 2)) {
    extras.push(
      locale === "zh"
        ? "人物牌偏多，事情更多发生在态度、消息和人与人之间，而不只是抽象的运势。"
        : "Court cards are prominent, so the matter lives in attitudes, messages, and people more than in an abstract fortune.",
    );
  }

  return [majorNote, suitNote, reversalNote, ...extras].filter(Boolean).join(locale === "zh" ? "" : " ");
}

function storyBlock(spread: Spread, lines: ReadingLine[], locale: Locale): string {
  const byId = new Map(lines.map((line) => [line.position.id, line]));
  const label = (id: string) => {
    const line = byId.get(id);
    if (!line) return "";
    const orient = orientation(line.reversed, locale);
    return locale === "zh"
      ? `${line.position.name.zh}是${orient}的${line.card.name.zh}`
      : `${line.position.name.en} is ${line.card.name.en}, ${orient}`;
  };
  const sense = (id: string) => {
    const line = byId.get(id);
    if (!line) return "";
    return firstSentence(meaning(line.card, line.reversed, locale), locale);
  };

  if (spread.id === "single") {
    const line = lines[0];
    if (!line) return "";
    return locale === "zh"
      ? `今天的故事只有一句：${label("guidance")}。${sense("guidance")} 把它当成这一天的天气，而不是一整年的判决。`
      : `Today's story is one sentence: ${label("guidance")}. ${sense("guidance")} Treat it as the weather of the day, not a verdict on the year.`;
  }
  if (spread.id === "three") {
    return locale === "zh"
      ? `从过去走到未来：${label("past")}，把线索交到${label("present").replace("现在是", "现在的")}，再伸向${label("future").replace("未来是", "未来的")}。过去说：${sense("past")} 现在说：${sense("present")} 若沿着这条线，未来说：${sense("future")} 读的时候先看过去如何解释你现在的反应，再问未来是在邀请你继续，还是在提醒你转弯。`
      : `From past to future: ${label("past")}, which hands the thread to the present (${label("present")}), and then toward the future (${label("future")}). The past says: ${sense("past")} The present says: ${sense("present")} If the line continues, the future says: ${sense("future")} Read how the past explains your present reaction, then ask whether the future invites you onward or asks you to turn.`;
  }
  if (spread.id === "love") {
    return locale === "zh"
      ? `关系可以这样读：${label("you")}；${label("them")}。连接落在${label("bond").replace("彼此的连接是", "")}，发紧的地方是${label("tension").replace("张力与挑战是", "")}。牌给的做法是${label("advice").replace("牌的建议是", "")}，若照现在的方式走，走向是${label("outlook").replace("关系走向是", "")}。先分清哪些是你的需要，哪些是对方的位置，再决定要不要用建议位改写走向。`
      : `Read the bond this way: ${label("you")}; ${label("them")}. The thread is ${label("bond")}, and the tight place is ${label("tension")}. The suggested move is ${label("advice")}. If the current way continues, the outlook is ${label("outlook")}. Separate your need from their position before you decide whether the advice should rewrite the outlook.`;
  }
  if (spread.id === "career") {
    return locale === "zh"
      ? `事业的一条线是：表面是${label("now").replace("当前处境是", "")}，底下是${label("hidden").replace("隐藏因素是", "")}。你拿得出来的是${label("strength").replace("可用的力量是", "")}，拖住你的是${label("block").replace("障碍是", "")}。因此下一步更接近${label("counsel").replace("建议与走向是", "")}。先用力量对付障碍，而不是先否定整个处境。`
      : `The work runs like this: the surface is ${label("now")}, and underneath is ${label("hidden")}. What you can use is ${label("strength")}. What drags is ${label("block")}. The next step is closer to ${label("counsel")}. Use the strength on the obstacle before you reject the whole situation.`;
  }
  return locale === "zh"
    ? `凯尔特十字的中心是${label("present")}，横过来的力量是${label("challenge")}，脚下的根基是${label("foundation")}。近期过去（${label("past")}）还牵着袖子，意识里的可能是${label("crown")}，若不转向，近期会走向${label("future")}。你自己的态度是${label("self")}，周围是${label("environment")}，又盼又怕的是${label("hopes")}，力量继续作用时的落点是${label("outcome")}。先读中心与交叉，再看结果是不是只是你希望或恐惧的放大。`
    : `The center of the Celtic Cross is ${label("present")}, crossed by ${label("challenge")}, standing on ${label("foundation")}. The recent past (${label("past")}) still holds the sleeve. The aim in mind is ${label("crown")}, and if you do not turn, the near future moves toward ${label("future")}. Your stance is ${label("self")}, the room around you is ${label("environment")}, what you hope and fear is ${label("hopes")}, and the landing if these forces continue is ${label("outcome")}. Read the center and the cross first, then ask whether the outcome is only your hope or fear made larger.`;
}

function closingBlock(question: string, spread: Spread, lines: ReadingLine[], locale: Locale, context?: ReadingContext | null): string {
  const trimmed = question.trim();
  const advicePosition = lines.find((line) => line.position.id === "advice" || line.position.id === "counsel" || line.position.id === "guidance");
  const last = lines[lines.length - 1];
  const focus = advicePosition ?? last;
  const step = focus ? firstSentence(adviceBlock(focus, locale), locale) : "";
  const disclaimer =
    locale === "zh"
      ? "这些话是整理思绪的同伴，不是必须服从的判决，也不能代替医疗、法律、财务或心理方面的专业意见。"
      : "Treat this as company for your thinking, not a verdict you must obey, and not a substitute for medical, legal, financial, or psychological advice.";
  if (locale === "zh") {
    const ask = trimmed
      ? `回到你放下的问题：「${trimmed}」。牌没有替你签字，它们把注意力收在「${spread.name.zh}」这条路上。`
      : `你没有写下具体问题，所以这组${spread.name.zh}更像一面举起的镜子，照的是此刻最响的主题。`;
    const next = step ? `你可以先做的一件事是：${step}` : "";
    const situation = contextClosing(spread.id, context, locale);
    return [ask, situation, next, disclaimer].filter(Boolean).join("");
  }
  const ask = trimmed
    ? `Return to the question you set down: "${trimmed}". The cards do not sign it for you. They gather attention along the ${spread.name.en}.`
    : `You left the question blank, so this ${spread.name.en} is a mirror held up to whatever is loudest right now.`;
  const next = step ? `One thing you can do first: ${step}` : "";
  const situation = contextClosing(spread.id, context, locale);
  return [ask, situation, next, disclaimer].filter(Boolean).join(" ");
}

function headings(locale: Locale) {
  if (locale === "zh") {
    return {
      themes: "主题",
      story: "牌与牌之间",
      closing: "结语",
      core: "核心",
      inPosition: "在这个位置",
      advice: "可以怎么做",
    };
  }
  return {
    themes: "Themes",
    story: "How the cards speak to each other",
    closing: "Closing",
    core: "Core",
    inPosition: "In this position",
    advice: "What to do",
  };
}

export function buildReading(input: {
  question: string;
  spreadId: string;
  drawn: DrawnCard[];
  locale: Locale;
  context?: ReadingContext | null;
}): BuiltReading {
  const spread = getSpread(input.spreadId);
  if (!spread) {
    throw new Error(`Unknown spread: ${input.spreadId}`);
  }
  const lines = readingLines(spread, input.drawn);
  const locale = input.locale;
  const title = headings(locale);
  const synthesis: ReadingBlock[] = [
    { id: "themes", heading: title.themes, body: themeBlock(lines, locale) },
    { id: "story", heading: title.story, body: storyBlock(spread, lines, locale) },
    { id: "closing", heading: title.closing, body: closingBlock(input.question, spread, lines, locale, input.context) },
  ];
  const topic = contextTopic(spread.id, input.context);
  const chapters: CardChapter[] = lines.map((line) => {
    const orientLabel = orientation(line.reversed, locale);
    return {
      positionId: line.position.id,
      positionName: line.position.name[locale],
      cardName: line.card.name[locale],
      orientation: orientLabel,
      reversed: line.reversed,
      keywords: line.card.keywords[locale],
      blocks: [
        { id: "core", heading: title.core, body: coreBlock(line, locale) },
        {
          id: "orientation",
          heading: locale === "zh" ? `${orientLabel}含义` : `${orientLabel[0]?.toUpperCase()}${orientLabel.slice(1)} meaning`,
          body: orientationBlock(line, locale),
        },
        { id: "position", heading: title.inPosition, body: positionMeaning(line, locale, spread.id, input.context) },
        { id: "lens", heading: lensHeading(spread.id, locale, topic), body: lensBlock(line, spread.id, locale, input.context) },
        { id: "advice", heading: title.advice, body: adviceBlock(line, locale) },
      ],
    };
  });
  const text = renderText(synthesis, chapters, locale);
  return { synthesis, chapters, text };
}

function renderText(synthesis: ReadingBlock[], chapters: CardChapter[], locale: Locale): string {
  const blocks = [
    ...synthesis.map((block) => `${block.heading}\n${block.body}`),
    ...chapters.flatMap((chapter) => [
      `${chapter.positionName} · ${chapter.cardName}（${chapter.orientation}）`,
      ...chapter.blocks.map((block) => `${block.heading}\n${block.body}`),
    ]),
  ];
  return blocks.join(locale === "zh" ? "\n\n" : "\n\n");
}

export function buildSummary(input: {
  question: string;
  spreadId: string;
  drawn: DrawnCard[];
  locale: Locale;
  context?: ReadingContext | null;
}): string {
  return buildReading(input).text;
}
